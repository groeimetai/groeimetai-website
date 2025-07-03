#!/bin/bash

# Google Cloud Project Setup Script for GroeimetAI
# This script helps set up your Google Cloud project for deployment

set -e

echo "🚀 GroeimetAI - Google Cloud Setup Script"
echo "========================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Variables
read -p "Enter your Google Cloud Project ID: " PROJECT_ID
read -p "Enter your preferred region (default: europe-west1): " REGION
REGION=${REGION:-europe-west1}
SERVICE_NAME="groeimetai-app"
ARTIFACT_REPO="groeimetai-app"

echo ""
echo "📋 Configuration:"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Service Name: $SERVICE_NAME"
echo ""

# Set the project
echo "1. Setting project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "2. Enabling required APIs..."
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com \
    secretmanager.googleapis.com \
    cloudresourcemanager.googleapis.com

# Create Artifact Registry repository
echo "3. Creating Artifact Registry repository..."
gcloud artifacts repositories create $ARTIFACT_REPO \
    --repository-format=docker \
    --location=$REGION \
    --description="Docker repository for GroeimetAI" || echo "Repository might already exist"

# Create a service account for GitHub Actions
echo "4. Creating service account for GitHub Actions..."
SERVICE_ACCOUNT_NAME="github-actions"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --display-name="GitHub Actions Service Account" || echo "Service account might already exist"

# Grant necessary permissions
echo "5. Granting permissions to service account..."
ROLES=(
    "roles/run.admin"
    "roles/storage.admin"
    "roles/artifactregistry.writer"
    "roles/iam.serviceAccountUser"
)

for ROLE in "${ROLES[@]}"; do
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
        --role="$ROLE"
done

# Create and download service account key
echo "6. Creating service account key..."
KEY_FILE="gcp-sa-key.json"
gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SERVICE_ACCOUNT_EMAIL

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Add the following secrets to your GitHub repository:"
echo "   (Settings > Secrets and variables > Actions)"
echo ""
echo "   GCP_PROJECT_ID=$PROJECT_ID"
echo "   GCP_SA_KEY=$(cat $KEY_FILE)"
echo ""
echo "2. Add your Firebase and other environment variables as GitHub secrets:"
echo "   - NEXT_PUBLIC_FIREBASE_API_KEY"
echo "   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
echo "   - NEXT_PUBLIC_FIREBASE_PROJECT_ID"
echo "   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
echo "   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
echo "   - NEXT_PUBLIC_FIREBASE_APP_ID"
echo "   - FIREBASE_PROJECT_ID"
echo "   - FIREBASE_CLIENT_EMAIL"
echo "   - FIREBASE_PRIVATE_KEY"
echo "   - FIREBASE_DATABASE_URL"
echo "   - FIREBASE_STORAGE_BUCKET"
echo ""
echo "3. Push your code to the main branch to trigger deployment"
echo ""
echo "4. Your app will be deployed to:"
echo "   https://${SERVICE_NAME}-${PROJECT_ID}.${REGION}.run.app"
echo ""
echo "⚠️  IMPORTANT: Keep the $KEY_FILE file secure and do not commit it to git!"
echo "   Add it to your .gitignore file"