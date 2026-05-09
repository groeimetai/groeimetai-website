"""
Stripe MCP server.

Read-only tools voor het inspecteren van Stripe data (products, subscriptions,
charges, customers). Credentials worden intern geladen uit .env;
de LLM ziet ze nooit. Geen write-tools — refunds, cancellations en updates
moeten expliciet via de meta-agent /add-command worden toegevoegd.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any
from urllib.parse import urlencode

import urllib.error
import urllib.request

from mcp.server.fastmcp import FastMCP


# ----------------------------------------------------------------------------
# Paths and env loading
# ----------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = ROOT / ".env"

STRIPE_API_BASE = "https://api.stripe.com/v1"


def _load_env() -> dict[str, str]:
    """Lees .env in een dict zonder os.environ te vervuilen."""
    if not ENV_PATH.exists():
        return {}
    result: dict[str, str] = {}
    for line in ENV_PATH.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        result[key.strip()] = value.strip().strip('"').strip("'")
    return result


# ----------------------------------------------------------------------------
# HTTP helper
# ----------------------------------------------------------------------------

def _stripe_get(path: str, params: dict[str, Any] | None = None) -> tuple[int, Any]:
    """GET naar Stripe API. Returned (status, parsed body).

    Raised RuntimeError bij HTTP errors met de body als context, zonder de
    API key te lekken.
    """
    env = _load_env()
    api_key = env.get("STRIPE_SECRET_KEY")
    if not api_key:
        raise RuntimeError("STRIPE_SECRET_KEY ontbreekt in .env")

    url = f"{STRIPE_API_BASE}{path}"
    if params:
        # Filter None values
        clean_params = {k: v for k, v in params.items() if v is not None}
        if clean_params:
            url = f"{url}?{urlencode(clean_params)}"

    req = urllib.request.Request(
        url,
        method="GET",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Stripe-Version": "2024-06-20",
        },
    )

    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read()
            try:
                parsed = json.loads(raw.decode("utf-8")) if raw else None
            except json.JSONDecodeError:
                parsed = raw.decode("utf-8", errors="replace")
            return resp.status, parsed
    except urllib.error.HTTPError as e:
        body_text = e.read().decode("utf-8", errors="replace")
        # Strip any Authorization header echo from error responses
        raise RuntimeError(f"Stripe API HTTP {e.code}: {body_text[:500]}") from None
    except urllib.error.URLError as e:
        raise RuntimeError(f"Stripe API connection error: {e.reason}") from None


def _format_response(data: Any) -> str:
    """Pretty-print Stripe response voor de LLM. Trim grote payloads."""
    text = json.dumps(data, indent=2, ensure_ascii=False)
    if len(text) > 8000:
        return text[:8000] + "\n\n... (response truncated, gebruik kleinere limit)"
    return text


# ----------------------------------------------------------------------------
# MCP server
# ----------------------------------------------------------------------------

mcp_server = FastMCP(
    "stripe",
    instructions=(
        "Read-only Stripe inspectie. Tools voor products, subscriptions, "
        "charges en customers. Geen write-acties (refunds, cancels, updates) — "
        "die moeten via een nieuwe tool worden toegevoegd."
    ),
)


@mcp_server.tool()
def list_products(limit: int = 10, active_only: bool = True) -> str:
    """Lijst Stripe producten op.

    Args:
        limit: Aantal producten om op te halen (1-100, default 10).
        active_only: Alleen actieve producten (default True).
    """
    try:
        params: dict[str, Any] = {"limit": min(max(limit, 1), 100)}
        if active_only:
            params["active"] = "true"
        _, body = _stripe_get("/products", params)
        return _format_response(body)
    except RuntimeError as e:
        return f"Error: {e}"


@mcp_server.tool()
def list_subscriptions(
    limit: int = 10,
    status: str = "active",
    customer_id: str | None = None,
) -> str:
    """Lijst Stripe subscriptions op.

    Args:
        limit: Aantal subscriptions om op te halen (1-100, default 10).
        status: Filter op status (active, trialing, past_due, canceled, all). Default 'active'.
        customer_id: Optioneel filter op een specifieke customer.
    """
    try:
        params: dict[str, Any] = {
            "limit": min(max(limit, 1), 100),
            "status": status,
        }
        if customer_id:
            params["customer"] = customer_id
        _, body = _stripe_get("/subscriptions", params)
        return _format_response(body)
    except RuntimeError as e:
        return f"Error: {e}"


@mcp_server.tool()
def list_recent_charges(limit: int = 10, customer_id: str | None = None) -> str:
    """Lijst de meest recente Stripe charges op.

    Args:
        limit: Aantal charges om op te halen (1-100, default 10).
        customer_id: Optioneel filter op een specifieke customer.
    """
    try:
        params: dict[str, Any] = {"limit": min(max(limit, 1), 100)}
        if customer_id:
            params["customer"] = customer_id
        _, body = _stripe_get("/charges", params)
        return _format_response(body)
    except RuntimeError as e:
        return f"Error: {e}"


@mcp_server.tool()
def get_customer(customer_id: str) -> str:
    """Haal details op van een specifieke Stripe customer.

    Args:
        customer_id: Stripe customer ID (begint met 'cus_').
    """
    if not customer_id or not customer_id.startswith("cus_"):
        return "Error: customer_id moet beginnen met 'cus_'"
    try:
        _, body = _stripe_get(f"/customers/{customer_id}")
        return _format_response(body)
    except RuntimeError as e:
        return f"Error: {e}"


# ----------------------------------------------------------------------------
# Entrypoint
# ----------------------------------------------------------------------------

if __name__ == "__main__":
    mcp_server.run()
