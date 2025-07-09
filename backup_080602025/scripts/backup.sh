#!/bin/bash

# GroeimetAI Backup Script
# This script performs automated backups of critical data

set -euo pipefail

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-groeimetai}"
BACKUP_BUCKET="${BACKUP_BUCKET:-gs://groeimetai-backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PREFIX="backup_${TIMESTAMP}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        error "gcloud CLI is not installed"
        exit 1
    fi
    
    # Check if authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
        error "Not authenticated with gcloud"
        exit 1
    fi
    
    # Check if gsutil is available
    if ! command -v gsutil &> /dev/null; then
        error "gsutil is not installed"
        exit 1
    fi
    
    log "Prerequisites check passed"
}

# Backup Firestore
backup_firestore() {
    log "Starting Firestore backup..."
    
    # Create Firestore export
    gcloud firestore export \
        --project="${PROJECT_ID}" \
        "${BACKUP_BUCKET}/firestore/${BACKUP_PREFIX}" \
        --async
    
    if [ $? -eq 0 ]; then
        log "Firestore backup initiated successfully"
    else
        error "Firestore backup failed"
        return 1
    fi
}

# Backup Cloud Storage
backup_storage() {
    log "Starting Cloud Storage backup..."
    
    # List of buckets to backup
    BUCKETS=(
        "groeimetai-app-assets"
        "groeimetai-user-uploads"
        "groeimetai-logs"
    )
    
    for bucket in "${BUCKETS[@]}"; do
        log "Backing up bucket: ${bucket}"
        
        gsutil -m rsync -r -d \
            "gs://${bucket}" \
            "${BACKUP_BUCKET}/storage/${BACKUP_PREFIX}/${bucket}"
        
        if [ $? -eq 0 ]; then
            log "Bucket ${bucket} backed up successfully"
        else
            warning "Failed to backup bucket ${bucket}"
        fi
    done
}

# Backup Secrets
backup_secrets() {
    log "Starting Secrets backup..."
    
    # Create temporary directory
    TEMP_DIR=$(mktemp -d)
    trap "rm -rf ${TEMP_DIR}" EXIT
    
    # List all secrets
    SECRETS=$(gcloud secrets list --project="${PROJECT_ID}" --format="value(name)")
    
    # Export each secret
    while IFS= read -r secret; do
        if [ -n "${secret}" ]; then
            log "Backing up secret: ${secret}"
            
            # Get latest version
            gcloud secrets versions access latest \
                --secret="${secret}" \
                --project="${PROJECT_ID}" \
                > "${TEMP_DIR}/${secret}.txt"
            
            # Encrypt with Cloud KMS
            gcloud kms encrypt \
                --key="backup-key" \
                --keyring="groeimetai-keyring" \
                --location="global" \
                --plaintext-file="${TEMP_DIR}/${secret}.txt" \
                --ciphertext-file="${TEMP_DIR}/${secret}.enc"
        fi
    done <<< "${SECRETS}"
    
    # Upload encrypted secrets
    gsutil -m cp "${TEMP_DIR}/*.enc" "${BACKUP_BUCKET}/secrets/${BACKUP_PREFIX}/"
    
    log "Secrets backup completed"
}

# Backup configuration files
backup_configs() {
    log "Starting configuration backup..."
    
    # Create temporary directory
    TEMP_DIR=$(mktemp -d)
    trap "rm -rf ${TEMP_DIR}" EXIT
    
    # List of configuration files to backup
    CONFIG_FILES=(
        "terraform/*.tf"
        "terraform/*.tfvars"
        ".github/workflows/*.yml"
        "*.config.js"
        "*.config.ts"
        "Dockerfile"
        "docker-compose.yml"
        "package.json"
        "package-lock.json"
    )
    
    # Create archive
    tar -czf "${TEMP_DIR}/configs_${BACKUP_PREFIX}.tar.gz" ${CONFIG_FILES[@]} 2>/dev/null || true
    
    # Upload to backup bucket
    gsutil cp "${TEMP_DIR}/configs_${BACKUP_PREFIX}.tar.gz" \
        "${BACKUP_BUCKET}/configs/"
    
    log "Configuration backup completed"
}

# Create backup metadata
create_metadata() {
    log "Creating backup metadata..."
    
    cat > "/tmp/backup_metadata_${BACKUP_PREFIX}.json" <<EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "backup_id": "${BACKUP_PREFIX}",
    "project_id": "${PROJECT_ID}",
    "components": {
        "firestore": true,
        "storage": true,
        "secrets": true,
        "configs": true
    },
    "retention_days": ${RETENTION_DAYS},
    "expire_date": "$(date -u -d "+${RETENTION_DAYS} days" +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
    
    # Upload metadata
    gsutil cp "/tmp/backup_metadata_${BACKUP_PREFIX}.json" \
        "${BACKUP_BUCKET}/metadata/"
    
    rm -f "/tmp/backup_metadata_${BACKUP_PREFIX}.json"
    
    log "Metadata created"
}

# Clean old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    # Delete backups older than retention period
    gsutil -m rm -r "${BACKUP_BUCKET}/**/backup_*" \
        -I < <(gsutil ls -r "${BACKUP_BUCKET}/**/backup_*" | \
        while read -r file; do
            # Extract timestamp from filename
            timestamp=$(echo "$file" | grep -oP 'backup_\K\d{8}_\d{6}')
            if [ -n "$timestamp" ]; then
                file_date=$(date -d "${timestamp:0:8} ${timestamp:9:2}:${timestamp:11:2}:${timestamp:13:2}" +%s)
                current_date=$(date +%s)
                age_days=$(( (current_date - file_date) / 86400 ))
                
                if [ $age_days -gt $RETENTION_DAYS ]; then
                    echo "$file"
                fi
            fi
        done)
    
    log "Cleanup completed"
}

# Send notification
send_notification() {
    local status=$1
    local message=$2
    
    # Send to monitoring webhook
    if [ -n "${MONITORING_WEBHOOK_URL:-}" ]; then
        curl -X POST "${MONITORING_WEBHOOK_URL}" \
            -H "Content-Type: application/json" \
            -d "{
                \"backup_id\": \"${BACKUP_PREFIX}\",
                \"status\": \"${status}\",
                \"message\": \"${message}\",
                \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
            }" || true
    fi
    
    # Log to Cloud Logging
    gcloud logging write backup-logs \
        "{\"backup_id\": \"${BACKUP_PREFIX}\", \"status\": \"${status}\", \"message\": \"${message}\"}" \
        --severity="${status}" || true
}

# Main backup function
main() {
    log "Starting GroeimetAI backup process..."
    
    # Check prerequisites
    check_prerequisites
    
    # Track errors
    ERRORS=0
    
    # Run backups
    backup_firestore || ((ERRORS++))
    backup_storage || ((ERRORS++))
    backup_secrets || ((ERRORS++))
    backup_configs || ((ERRORS++))
    
    # Create metadata
    create_metadata
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Send notification
    if [ $ERRORS -eq 0 ]; then
        log "Backup completed successfully"
        send_notification "INFO" "Backup ${BACKUP_PREFIX} completed successfully"
    else
        error "Backup completed with ${ERRORS} errors"
        send_notification "ERROR" "Backup ${BACKUP_PREFIX} completed with ${ERRORS} errors"
        exit 1
    fi
}

# Run main function
main "$@"