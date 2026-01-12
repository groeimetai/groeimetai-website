#!/bin/bash
#
# Cleanup script for Google Cloud Artifact Registry
# Removes old Docker images to save storage costs
#
# Usage: ./scripts/cleanup-artifact-registry.sh [--dry-run]
#

set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-groeimetai}"
REGION="europe-west1"
REPOSITORY="groeimetai-app"
IMAGE_NAME="groeimetai-app"
KEEP_LATEST=5  # Number of recent images to keep

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for dry-run flag
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}🔍 DRY RUN MODE - No images will be deleted${NC}"
    echo ""
fi

echo "================================================"
echo "🧹 Artifact Registry Cleanup Script"
echo "================================================"
echo ""
echo "Project:    $PROJECT_ID"
echo "Region:     $REGION"
echo "Repository: $REPOSITORY"
echo "Image:      $IMAGE_NAME"
echo "Keep latest: $KEEP_LATEST images"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed${NC}"
    exit 1
fi

# Check authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with gcloud. Run: gcloud auth login${NC}"
    exit 1
fi

# Set project
gcloud config set project $PROJECT_ID 2>/dev/null

# Get current storage usage
echo "📊 Current storage usage:"
gcloud artifacts docker images list \
    ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME} \
    --format="table(package,version,createTime)" \
    --sort-by=~createTime \
    2>/dev/null || echo "Could not list images"
echo ""

# Get all image digests sorted by creation time (oldest first)
echo "🔍 Finding images to delete..."
ALL_IMAGES=$(gcloud artifacts docker images list \
    ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME} \
    --include-tags \
    --format="value(version)" \
    --sort-by=createTime \
    2>/dev/null)

if [[ -z "$ALL_IMAGES" ]]; then
    echo -e "${GREEN}✅ No images found in repository${NC}"
    exit 0
fi

# Count total images
TOTAL_COUNT=$(echo "$ALL_IMAGES" | wc -l | tr -d ' ')
echo "📦 Total images found: $TOTAL_COUNT"

# Calculate how many to delete
DELETE_COUNT=$((TOTAL_COUNT - KEEP_LATEST))

if [[ $DELETE_COUNT -le 0 ]]; then
    echo -e "${GREEN}✅ Only $TOTAL_COUNT images exist, keeping all (threshold: $KEEP_LATEST)${NC}"
    exit 0
fi

echo "🗑️  Images to delete: $DELETE_COUNT (keeping latest $KEEP_LATEST)"
echo ""

# Get images to delete (all except the latest N)
IMAGES_TO_DELETE=$(echo "$ALL_IMAGES" | head -n $DELETE_COUNT)

# Delete old images
DELETED=0
FAILED=0

for VERSION in $IMAGES_TO_DELETE; do
    IMAGE_PATH="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}@${VERSION}"

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}[DRY RUN] Would delete: $VERSION${NC}"
        ((DELETED++))
    else
        echo -n "Deleting: $VERSION ... "
        if gcloud artifacts docker images delete "$IMAGE_PATH" --quiet --delete-tags 2>/dev/null; then
            echo -e "${GREEN}✅${NC}"
            ((DELETED++))
        else
            echo -e "${RED}❌${NC}"
            ((FAILED++))
        fi
    fi
done

echo ""
echo "================================================"
echo "📊 Cleanup Summary"
echo "================================================"
if [[ "$DRY_RUN" == true ]]; then
    echo -e "${YELLOW}Would have deleted: $DELETED images${NC}"
else
    echo -e "${GREEN}Deleted: $DELETED images${NC}"
    if [[ $FAILED -gt 0 ]]; then
        echo -e "${RED}Failed: $FAILED images${NC}"
    fi
fi
echo "Kept: $KEEP_LATEST most recent images"
echo ""

# Show remaining images
if [[ "$DRY_RUN" == false ]]; then
    echo "📦 Remaining images:"
    gcloud artifacts docker images list \
        ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME} \
        --format="table(package,version,createTime)" \
        --sort-by=~createTime \
        2>/dev/null || echo "Could not list images"
fi

echo ""
echo -e "${GREEN}✅ Cleanup complete!${NC}"
