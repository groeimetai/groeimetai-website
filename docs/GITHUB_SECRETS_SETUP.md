# GitHub Secrets Setup for Production

## Required GitHub Secrets

You need to add these secrets to your GitHub repository for the deployment to work correctly:

### How to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret below:

### Email Configuration Secrets

```
NEXT_PUBLIC_APP_URL = https://groeimetai.io
SMTP_HOST = mail.privateemail.com
SMTP_PORT = 587
SMTP_USER = niels@groeimetai.io
SMTP_PASS = 1214Pees1214!
```

### API Keys (if not already added)

```
GEMINI_API_KEY = your-gemini-api-key
PINECONE_API_KEY = your-pinecone-api-key  
OPENAI_API_KEY = your-openai-api-key
```

## What These Fix

### Email Service
- `SMTP_*` secrets: Enable email sending in production
- `NEXT_PUBLIC_APP_URL`: Ensure email links point to groeimetai.io

### AI Features
- `GEMINI_API_KEY`: Powers the AI chatbot
- `PINECONE_API_KEY`: Vector database for search
- `OPENAI_API_KEY`: Embeddings and AI features

## After Adding Secrets

1. **Commit and push** your changes (we just updated the GitHub Actions workflow)
2. **GitHub Actions will automatically deploy** when you push to main
3. **Check the deployment logs** in the Actions tab
4. **Test email functionality** on the live site

## Verification

After deployment, test:
1. ✅ Create new account → should send verification email
2. ✅ Email links should point to groeimetai.io  
3. ✅ Logo should display in emails
4. ✅ No "Email service unavailable" errors

## Troubleshooting

If deployment fails:
1. Check the GitHub Actions logs
2. Verify all secrets are added correctly
3. Make sure secret names match exactly (case-sensitive)
4. Redeploy by pushing a small change or manually trigger workflow

## Security Note

⚠️ **Never commit these values to your code**. Always use GitHub Secrets for sensitive information like passwords and API keys.