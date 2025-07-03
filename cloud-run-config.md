# Cloud Run Configuration Guide

## Current Configuration (from GitHub Actions)
- **Region**: europe-west1
- **Min Instances**: 1 (prevents cold starts)
- **Max Instances**: 10
- **Memory**: 1Gi
- **CPU**: 1
- **Timeout**: 300 seconds
- **Port**: 8080

## Optimize for Production

### 1. Adjust Auto-scaling
```bash
# For production with expected traffic
gcloud run services update groeimetai-app \
  --min-instances 2 \
  --max-instances 50 \
  --region europe-west1

# For development/staging (save costs)
gcloud run services update groeimetai-app \
  --min-instances 0 \
  --max-instances 10 \
  --region europe-west1
```

### 2. Configure Concurrency
```bash
# Set max concurrent requests per instance
gcloud run services update groeimetai-app \
  --concurrency 80 \
  --region europe-west1
```

### 3. Set CPU Allocation
```bash
# Always allocate CPU (for background tasks)
gcloud run services update groeimetai-app \
  --cpu-throttling \
  --region europe-west1
```

### 4. Configure Environment Variables
```bash
# Add or update environment variables
gcloud run services update groeimetai-app \
  --set-env-vars KEY1=value1,KEY2=value2 \
  --region europe-west1
```

## Performance Optimization

### 1. Enable HTTP/2
Already enabled by default in Cloud Run

### 2. Configure CDN
```bash
# Enable Cloud CDN for static assets
gcloud compute backend-services update groeimetai-app-backend \
  --enable-cdn \
  --cache-mode=CACHE_ALL_STATIC
```

### 3. Set Response Headers
Add to your Next.js config:
```javascript
// next.config.js
module.exports = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
}
```

## Monitoring & Alerts

### 1. View Metrics
```bash
# View service metrics
gcloud run services describe groeimetai-app \
  --region europe-west1 \
  --format="get(status.traffic)"
```

### 2. Set Up Alerts
```bash
# Create alert policy for high latency
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Latency Alert" \
  --condition-display-name="Request latency > 1s" \
  --condition-threshold-value=1000 \
  --condition-threshold-duration=60s
```

### 3. View Logs
```bash
# Stream logs
gcloud run services logs read groeimetai-app \
  --region europe-west1 \
  --limit=50 \
  --format="table(timestamp,severity,textPayload)"
```

## Cost Optimization

### 1. Review Current Costs
```bash
# Get cost estimate
gcloud run services describe groeimetai-app \
  --region europe-west1 \
  --format="table(spec.template.spec.containers[0].resources)"
```

### 2. Optimize Resources
- Start with smaller resources
- Monitor actual usage
- Scale up based on metrics

### 3. Use Cloud Scheduler for Warm-up
```bash
# Create scheduled job to prevent cold starts
gcloud scheduler jobs create http warm-up-job \
  --location=europe-west1 \
  --schedule="*/5 * * * *" \
  --uri="https://groeimetai-app-[PROJECT_ID].europe-west1.run.app/api/health" \
  --http-method=GET
```

## Security Hardening

### 1. Enable Binary Authorization
```bash
gcloud run services update groeimetai-app \
  --binary-authorization=default \
  --region europe-west1
```

### 2. Configure Service Account
```bash
# Create dedicated service account
gcloud iam service-accounts create groeimetai-app-sa \
  --display-name="GroeimetAI App Service Account"

# Grant minimal permissions
gcloud run services update groeimetai-app \
  --service-account=groeimetai-app-sa@[PROJECT_ID].iam.gserviceaccount.com \
  --region europe-west1
```

### 3. Enable VPC Connector (Optional)
```bash
# For private resources access
gcloud run services update groeimetai-app \
  --vpc-connector=projects/[PROJECT_ID]/locations/europe-west1/connectors/[CONNECTOR_NAME] \
  --region europe-west1
```

## Traffic Management

### 1. Gradual Rollouts
```bash
# Deploy new version with 10% traffic
gcloud run deploy groeimetai-app \
  --image IMAGE_URL \
  --traffic latest=10 \
  --region europe-west1
```

### 2. Rollback
```bash
# Rollback to previous version
gcloud run services update-traffic groeimetai-app \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region europe-west1
```

## Custom Domain Setup
See `custom-domain-setup.md` for detailed instructions.

## Useful Commands

### Check Service Status
```bash
gcloud run services describe groeimetai-app --region europe-west1
```

### List All Revisions
```bash
gcloud run revisions list --service=groeimetai-app --region europe-west1
```

### Update Service
```bash
gcloud run services update groeimetai-app --region europe-west1 [OPTIONS]
```

### Delete Old Revisions
```bash
gcloud run revisions delete [REVISION_NAME] --region europe-west1
```