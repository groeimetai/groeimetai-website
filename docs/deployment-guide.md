# GroeimetAI - Google Cloud Run Deployment Guide

Deze handleiding beschrijft hoe je GroeimetAI deployed naar Google Cloud Run via GitHub Actions.

## 📋 Vereisten

1. **Google Cloud Account** met billing enabled
2. **GitHub repository** voor je code
3. **Firebase project** geconfigureerd
4. **gcloud CLI** geïnstalleerd lokaal

## 🚀 Stap-voor-stap Deployment

### 1. Google Cloud Project Setup

```bash
# Run het setup script
./scripts/setup-gcp.sh
```

Dit script zal:
- Je Google Cloud project configureren
- Benodigde APIs enablen
- Artifact Registry aanmaken
- Service account voor GitHub Actions aanmaken
- Service account key genereren

### 2. GitHub Secrets Configureren

Ga naar je GitHub repository → Settings → Secrets and variables → Actions

Voeg de volgende secrets toe:

#### Google Cloud Secrets
- `GCP_PROJECT_ID`: Je Google Cloud project ID
- `GCP_SA_KEY`: De inhoud van het `gcp-sa-key.json` bestand (hele JSON)

#### Firebase Public Keys (voor frontend)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

#### Firebase Admin Keys (voor backend)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (let op: quotes behouden!)
- `FIREBASE_DATABASE_URL`
- `FIREBASE_STORAGE_BUCKET`

#### Optionele Secrets
- `NEXT_PUBLIC_GEMINI_API_KEY`
- `SENTRY_DSN`
- `NEXT_PUBLIC_API_BASE_URL`

### 3. Environment Variables

Maak een `.env.local` bestand voor lokale development:

```bash
cp .env.example .env.local
# Vul de waardes in .env.local
```

### 4. Firebase Security Rules

Deploy je Firebase security rules:

```bash
firebase deploy --only firestore:rules,storage:rules
```

### 5. Test de Build Lokaal

```bash
# Build de Docker image
docker build -t groeimetai-app .

# Test lokaal
docker run -p 8080:8080 groeimetai-app
```

### 6. Deploy naar Cloud Run

Push je code naar de `main` branch:

```bash
git add .
git commit -m "Deploy to Cloud Run"
git push origin main
```

GitHub Actions zal automatisch:
1. Docker image builden
2. Image pushen naar Artifact Registry
3. Deployen naar Cloud Run

### 7. Custom Domain (Optioneel)

1. Ga naar Cloud Run console
2. Selecteer je service
3. Klik op "Manage Custom Domains"
4. Voeg je domein toe (bijv. groeimetai.io)
5. Update DNS records volgens instructies

## 🔧 Configuratie Aanpassen

### Cloud Run Service Settings

In `.github/workflows/deploy-cloud-run.yml`:

```yaml
--min-instances 1      # Minimum aantal instances (0 voor scale-to-zero)
--max-instances 10     # Maximum aantal instances
--memory 1Gi          # Memory per instance
--cpu 1               # CPU cores per instance
--timeout 300         # Request timeout in seconden
```

### Regio Veranderen

Update de `REGION` variabele in:
- `.github/workflows/deploy-cloud-run.yml`
- `scripts/setup-gcp.sh`

Beschikbare regio's voor Europa:
- `europe-west1` (België)
- `europe-west4` (Nederland)
- `europe-north1` (Finland)

## 🐛 Troubleshooting

### Build Failures

1. Check GitHub Actions logs
2. Zorg dat alle environment variables zijn ingesteld
3. Controleer of de Docker build lokaal werkt

### Permission Errors

```bash
# Grant extra permissions indien nodig
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.developer"
```

### Memory/CPU Issues

Als je app crasht, verhoog resources:

```bash
gcloud run services update groeimetai-app \
  --memory 2Gi \
  --cpu 2 \
  --region europe-west1
```

## 📊 Monitoring

### Cloud Run Metrics
- Ga naar Cloud Run console
- Bekijk Metrics tab voor:
  - Request count
  - Latency
  - CPU/Memory usage
  - Error rate

### Logs Bekijken

```bash
# Stream logs
gcloud run services logs read groeimetai-app \
  --region europe-west1 \
  --tail 50 \
  --follow
```

### Alerts Instellen

1. Ga naar Cloud Monitoring
2. Create Alert Policy
3. Stel alerts in voor:
   - High error rate (> 1%)
   - High latency (> 1s)
   - High memory usage (> 80%)

## 🔐 Security Best Practices

1. **Secrets Management**
   - Gebruik Google Secret Manager voor gevoelige data
   - Roteer service account keys regelmatig

2. **Network Security**
   - Enable Cloud Armor voor DDoS protection
   - Gebruik Cloud CDN voor static assets

3. **Access Control**
   - Beperk service account permissions
   - Enable audit logging

## 💰 Kosten Optimalisatie

1. **Scale to Zero**
   - Set `--min-instances 0` voor development
   - Gebruik `--min-instances 1` alleen voor productie

2. **Resource Optimization**
   - Start met kleine resources (512MB RAM, 1 CPU)
   - Schaal op basis van metrics

3. **Caching**
   - Enable Cloud CDN
   - Gebruik browser caching headers

## 📝 Checklist voor Productie

- [ ] Alle environment variables geconfigureerd
- [ ] Firebase security rules gedeployed
- [ ] Custom domain geconfigureerd
- [ ] SSL certificaat actief
- [ ] Monitoring en alerts ingesteld
- [ ] Backup strategie geïmplementeerd
- [ ] Error tracking (Sentry) geconfigureerd
- [ ] Performance testing uitgevoerd
- [ ] Security audit uitgevoerd
- [ ] GDPR compliance gecheckt

## 🆘 Support

Voor vragen of problemen:
1. Check de [Cloud Run documentation](https://cloud.google.com/run/docs)
2. Bekijk GitHub Actions logs
3. Contact: support@groeimetai.io