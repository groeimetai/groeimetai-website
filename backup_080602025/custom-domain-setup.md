# Custom Domain Setup for Cloud Run

## Prerequisites

- Domain registered (e.g., groeimetai.io)
- Access to DNS settings
- Cloud Run service deployed

## Step 1: Reserve a Static IP Address

```bash
# Reserve an IP address
gcloud compute addresses create groeimetai-ip \
  --global \
  --ip-version IPV4

# Get the IP address
gcloud compute addresses describe groeimetai-ip \
  --global \
  --format="get(address)"
```

## Step 2: Create a Load Balancer

### 2.1 Create a NEG (Network Endpoint Group)

```bash
gcloud compute network-endpoint-groups create groeimetai-neg \
  --region=europe-west1 \
  --network-endpoint-type=serverless \
  --cloud-run-service=groeimetai-app
```

### 2.2 Create a Backend Service

```bash
gcloud compute backend-services create groeimetai-backend \
  --global \
  --load-balancing-scheme=EXTERNAL \
  --protocol=HTTP2

# Add the NEG to backend service
gcloud compute backend-services add-backend groeimetai-backend \
  --global \
  --network-endpoint-group=groeimetai-neg \
  --network-endpoint-group-region=europe-west1
```

### 2.3 Create URL Map

```bash
gcloud compute url-maps create groeimetai-lb \
  --default-service=groeimetai-backend
```

### 2.4 Create SSL Certificate

```bash
# Managed certificate (recommended)
gcloud compute ssl-certificates create groeimetai-cert \
  --domains=groeimetai.io,www.groeimetai.io \
  --global

# Or upload your own certificate
gcloud compute ssl-certificates create groeimetai-cert \
  --certificate=path/to/cert.pem \
  --private-key=path/to/key.pem \
  --global
```

### 2.5 Create HTTPS Proxy

```bash
gcloud compute target-https-proxies create groeimetai-https-proxy \
  --ssl-certificates=groeimetai-cert \
  --url-map=groeimetai-lb \
  --global
```

### 2.6 Create Forwarding Rule

```bash
gcloud compute forwarding-rules create groeimetai-https-rule \
  --address=groeimetai-ip \
  --target-https-proxy=groeimetai-https-proxy \
  --ports=443 \
  --global
```

### 2.7 HTTP to HTTPS Redirect

```bash
# Create HTTP proxy
gcloud compute target-http-proxies create groeimetai-http-proxy \
  --url-map=groeimetai-lb \
  --global

# Create HTTP forwarding rule
gcloud compute forwarding-rules create groeimetai-http-rule \
  --address=groeimetai-ip \
  --target-http-proxy=groeimetai-http-proxy \
  --ports=80 \
  --global
```

## Step 3: Configure DNS

Add these records to your DNS provider:

### A Records

```
Type: A
Name: @
Value: [YOUR_STATIC_IP]
TTL: 300

Type: A
Name: www
Value: [YOUR_STATIC_IP]
TTL: 300
```

### Alternative: Using Cloud DNS

```bash
# Create DNS zone
gcloud dns managed-zones create groeimetai-zone \
  --dns-name=groeimetai.io. \
  --description="GroeimetAI DNS zone"

# Add A records
gcloud dns record-sets create groeimetai.io. \
  --zone=groeimetai-zone \
  --type=A \
  --ttl=300 \
  --rrdatas=[YOUR_STATIC_IP]

gcloud dns record-sets create www.groeimetai.io. \
  --zone=groeimetai-zone \
  --type=A \
  --ttl=300 \
  --rrdatas=[YOUR_STATIC_IP]
```

## Step 4: Update Application

### 4.1 Update Environment Variables

```bash
gcloud run services update groeimetai-app \
  --set-env-vars NEXT_PUBLIC_APP_URL=https://groeimetai.io \
  --region europe-west1
```

### 4.2 Update next.config.js

```javascript
module.exports = {
  // ... other config
  images: {
    domains: ['groeimetai.io', 'www.groeimetai.io'],
  },
};
```

## Step 5: Verify Setup

### Check SSL Certificate Status

```bash
gcloud compute ssl-certificates describe groeimetai-cert --global
```

### Test Domain

```bash
# Test HTTPS
curl -I https://groeimetai.io

# Test redirect
curl -I http://groeimetai.io
```

## Step 6: Configure Firewall Rules

```bash
# Allow HTTPS traffic
gcloud compute firewall-rules create allow-https \
  --allow tcp:443 \
  --source-ranges 0.0.0.0/0

# Allow HTTP traffic (for redirect)
gcloud compute firewall-rules create allow-http \
  --allow tcp:80 \
  --source-ranges 0.0.0.0/0
```

## Troubleshooting

### SSL Certificate Not Provisioning

- Check domain ownership
- Ensure DNS records are correct
- Wait up to 24 hours for provisioning

### Domain Not Accessible

```bash
# Check DNS propagation
nslookup groeimetai.io

# Check certificate status
gcloud compute ssl-certificates list --global
```

### 502 Bad Gateway

- Check Cloud Run service is running
- Verify backend service configuration
- Check logs: `gcloud logging read`

## Monitoring

### Set Up Uptime Checks

```bash
gcloud monitoring uptime-checks create groeimetai-uptime \
  --display-name="GroeimetAI Uptime Check" \
  --host=groeimetai.io \
  --path=/ \
  --port=443 \
  --use-ssl
```

### View Load Balancer Metrics

1. Go to Cloud Console > Network Services > Load Balancing
2. Click on your load balancer
3. View metrics and logs

## Cost Optimization

### Estimated Monthly Costs

- Static IP: ~$7/month
- Load Balancer: ~$18/month + data processing
- SSL Certificate (managed): Free
- Total: ~$25/month + traffic costs

### Cost Saving Tips

1. Use Cloud CDN for static assets
2. Enable compression
3. Set appropriate cache headers
4. Consider using Cloudflare in front

## Alternative: Simple Domain Mapping

For simpler setup without Load Balancer:

```bash
# Map custom domain directly to Cloud Run
gcloud run domain-mappings create \
  --service=groeimetai-app \
  --domain=groeimetai.io \
  --region=europe-west1
```

Note: This method:

- ✅ Simpler setup
- ✅ Lower cost
- ❌ No static IP
- ❌ Limited control over SSL
- ❌ No advanced features (CDN, WAF, etc.)
