# Google Cloud Monitoring & Logging Setup

## 1. Enable Required APIs

```bash
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable cloudtrace.googleapis.com
gcloud services enable clouddebugger.googleapis.com
```

## 2. Cloud Run Metrics

### Default Metrics Available

- Request count
- Request latency
- Container CPU utilization
- Container memory utilization
- Container startup latency
- Container instance count

### View in Console

1. Go to Cloud Console > Cloud Run
2. Click on your service
3. Click "Metrics" tab

### View via CLI

```bash
# Get basic metrics
gcloud run services describe groeimetai-app \
  --region=europe-west1 \
  --format="table(
    status.url,
    status.traffic[].percent,
    spec.template.spec.containers[].resources
  )"
```

## 3. Set Up Logging

### Application Logging

```javascript
// utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({
      severity: 'INFO',
      message,
      ...data,
      timestamp: new Date().toISOString()
    }));
  },
  error: (message: string, error?: any) => {
    console.error(JSON.stringify({
      severity: 'ERROR',
      message,
      error: error?.message || error,
      stack: error?.stack,
      timestamp: new Date().toISOString()
    }));
  },
  warn: (message: string, data?: any) => {
    console.warn(JSON.stringify({
      severity: 'WARNING',
      message,
      ...data,
      timestamp: new Date().toISOString()
    }));
  }
};
```

### View Logs

```bash
# Stream logs
gcloud run services logs read groeimetai-app \
  --region=europe-west1 \
  --limit=50 \
  --format="table(timestamp,severity,textPayload)"

# Filter by severity
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" \
  --limit=10 \
  --format=json

# Export logs
gcloud logging read "resource.type=cloud_run_revision" \
  --project=[PROJECT_ID] \
  --format=json > logs.json
```

## 4. Create Dashboards

### Custom Dashboard

```bash
# Create dashboard via API
cat > dashboard.json << EOF
{
  "displayName": "GroeimetAI Dashboard",
  "mosaicLayout": {
    "columns": 12,
    "tiles": [
      {
        "width": 6,
        "height": 4,
        "widget": {
          "title": "Request Rate",
          "xyChart": {
            "dataSets": [{
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\\"run.googleapis.com/request_count\\" resource.type=\\"cloud_run_revision\\""
                }
              }
            }]
          }
        }
      },
      {
        "xPos": 6,
        "width": 6,
        "height": 4,
        "widget": {
          "title": "Response Latency",
          "xyChart": {
            "dataSets": [{
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\\"run.googleapis.com/request_latencies\\" resource.type=\\"cloud_run_revision\\""
                }
              }
            }]
          }
        }
      }
    ]
  }
}
EOF

gcloud monitoring dashboards create --config-from-file=dashboard.json
```

## 5. Set Up Alerts

### Response Time Alert

```bash
gcloud alpha monitoring policies create \
  --display-name="High Response Time" \
  --condition-display-name="95th percentile latency > 1s" \
  --condition-threshold-value=1000 \
  --condition-threshold-duration=300s \
  --condition-threshold-filter='metric.type="run.googleapis.com/request_latencies" AND resource.type="cloud_run_revision"' \
  --notification-channels=[CHANNEL_ID]
```

### Error Rate Alert

```bash
gcloud alpha monitoring policies create \
  --display-name="High Error Rate" \
  --condition-display-name="5xx errors > 1%" \
  --condition-threshold-value=0.01 \
  --condition-threshold-duration=300s \
  --condition-threshold-filter='metric.type="run.googleapis.com/request_count" AND metric.label.response_code_class="5xx"' \
  --notification-channels=[CHANNEL_ID]
```

### Create Notification Channel

```bash
# Email notification
gcloud alpha monitoring channels create \
  --display-name="GroeimetAI Alerts Email" \
  --type=email \
  --channel-labels=email_address=alerts@groeimetai.io
```

## 6. Application Performance Monitoring

### Add Google Cloud Trace

```bash
npm install @google-cloud/trace-agent
```

```javascript
// app.js or server entry point
if (process.env.NODE_ENV === 'production') {
  require('@google-cloud/trace-agent').start();
}
```

### Add Custom Traces

```javascript
import { Tracer } from '@google-cloud/trace-agent';

const tracer = Tracer.get();

export async function tracedFunction() {
  const span = tracer.createChildSpan({ name: 'custom-operation' });

  try {
    // Your code here
    const result = await someOperation();
    span.endSpan();
    return result;
  } catch (error) {
    span.addLabel('error', true);
    span.endSpan();
    throw error;
  }
}
```

## 7. Uptime Monitoring

### Create Uptime Check

```bash
gcloud monitoring uptime-checks create \
  --display-name="GroeimetAI Homepage" \
  --resource-type="URL" \
  --monitored-resource-labels="host=groeimetai-app-[PROJECT_ID].europe-west1.run.app,path=/" \
  --check-interval=5m \
  --timeout=10s \
  --regions=EUROPE,USA
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check critical dependencies
    const checks = {
      database: await checkDatabase(),
      storage: await checkStorage(),
      auth: await checkAuth(),
    };

    const healthy = Object.values(checks).every((check) => check);

    return Response.json(
      {
        status: healthy ? 'healthy' : 'unhealthy',
        checks,
        timestamp: new Date().toISOString(),
      },
      {
        status: healthy ? 200 : 503,
      }
    );
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        error: error.message,
      },
      { status: 503 }
    );
  }
}
```

## 8. Cost Monitoring

### Set Budget Alert

```bash
gcloud billing budgets create \
  --billing-account=[BILLING_ACCOUNT_ID] \
  --display-name="GroeimetAI Monthly Budget" \
  --budget-amount=500 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

### View Costs

```bash
# Get current month costs
gcloud billing accounts describe [BILLING_ACCOUNT_ID]
```

## 9. Log Analysis

### Create Log Sink for Analysis

```bash
# Export to BigQuery
gcloud logging sinks create groeimetai-logs \
  bigquery.googleapis.com/projects/[PROJECT_ID]/datasets/groeimetai_logs \
  --log-filter='resource.type="cloud_run_revision"'
```

### Common Queries

```sql
-- Top errors in BigQuery
SELECT
  timestamp,
  jsonPayload.message,
  jsonPayload.error,
  COUNT(*) as error_count
FROM `project.dataset.cloud_run_logs`
WHERE severity = 'ERROR'
  AND timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
GROUP BY timestamp, jsonPayload.message, jsonPayload.error
ORDER BY error_count DESC
LIMIT 100;
```

## 10. Integration with External Tools

### Sentry Integration

Already configured in the application via `sentry.client.config.tsx`

### Datadog Integration (Optional)

```bash
# Install Datadog agent
npm install --save dd-trace
```

```javascript
// server.js
if (process.env.DD_AGENT_HOST) {
  require('dd-trace').init({
    analytics: true,
    env: process.env.NODE_ENV,
    service: 'groeimetai-app',
  });
}
```

## Quick Commands Reference

```bash
# View recent errors
gcloud logging read "severity>=ERROR" --limit=10 --format=json

# Monitor real-time
gcloud run services logs tail groeimetai-app --region=europe-west1

# Get service metrics
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/request_count"'

# List all alerts
gcloud alpha monitoring policies list

# Test alert
gcloud alpha monitoring policies test [POLICY_ID]
```

## Best Practices

1. **Structured Logging**: Always use JSON format
2. **Correlation IDs**: Add request IDs for tracing
3. **Sensitive Data**: Never log passwords, tokens, or PII
4. **Performance**: Use sampling for high-volume traces
5. **Retention**: Set appropriate log retention policies
6. **Access Control**: Limit who can view logs
7. **Regular Reviews**: Weekly review of errors and alerts
