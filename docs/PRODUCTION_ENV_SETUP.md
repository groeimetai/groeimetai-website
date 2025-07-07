# Production Environment Setup

## Required Environment Variables for Email

Add these environment variables to your production deployment (Railway, Vercel, etc.):

### SMTP Configuration (REQUIRED)
```bash
SMTP_HOST=mail.privateemail.com
SMTP_PORT=587
SMTP_USER=niels@groeimetai.io
SMTP_PASS=1214Pees1214!
```

### Application URL (REQUIRED)
```bash
NEXT_PUBLIC_APP_URL=https://groeimetai.io
```

## Where to Add These

### Railway
1. Go to your Railway dashboard
2. Select your project
3. Go to Variables tab
4. Add each variable:
   - `SMTP_HOST` = `mail.privateemail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `niels@groeimetai.io`
   - `SMTP_PASS` = `1214Pees1214!`
   - `NEXT_PUBLIC_APP_URL` = `https://groeimetai.io`

### Vercel
1. Go to Project Settings → Environment Variables
2. Add each variable for Production environment

### Docker
Add to your docker-compose.yml or deployment config:
```yaml
environment:
  - SMTP_HOST=mail.privateemail.com
  - SMTP_PORT=587
  - SMTP_USER=niels@groeimetai.io
  - SMTP_PASS=1214Pees1214!
  - NEXT_PUBLIC_APP_URL=https://groeimetai.io
```

## GitHub Actions (if using)

Add these to your repository secrets:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `NEXT_PUBLIC_APP_URL`

## Testing After Deployment

1. Deploy with the new environment variables
2. Create a test account on production
3. Check that:
   - Email is sent successfully
   - Links point to groeimetai.io
   - Logo displays correctly

## Security Note

⚠️ **IMPORTANT**: Never commit these values to git. Always use environment variables or secrets management.

## Troubleshooting

If emails still don't work after adding variables:
1. Check Railway/Vercel logs for the exact error
2. Verify the SMTP credentials are correct
3. Make sure to redeploy after adding variables
4. Some hosts require a rebuild after env changes