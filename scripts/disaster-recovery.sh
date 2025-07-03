#!/bin/bash

# GroeimetAI Disaster Recovery Script
# This script performs disaster recovery from backups

set -euo pipefail

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-groeimetai}"
BACKUP_BUCKET="${BACKUP_BUCKET:-gs://groeimetai-backups}"
RECOVERY_MODE="${1:-latest}" # latest, specific, or point-in-time
BACKUP_ID="${2:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

# Show usage
usage() {
    cat << EOF
Usage: $0 [mode] [backup_id]

Modes:
  latest     - Restore from the latest backup (default)
  specific   - Restore from a specific backup ID
  list       - List available backups
  verify     - Verify backup integrity
  dry-run    - Perform a dry run without actual restoration

Examples:
  $0 latest
  $0 specific backup_20240101_120000
  $0 list
  $0 verify backup_20240101_120000

EOF
    exit 1
}

# List available backups
list_backups() {
    log "Listing available backups..."
    
    # Get metadata files
    gsutil ls "${BACKUP_BUCKET}/metadata/backup_metadata_*.json" | while read -r metadata_file; do
        # Extract backup info
        backup_id=$(basename "$metadata_file" | sed 's/backup_metadata_//;s/.json//')
        
        # Download and parse metadata
        metadata=$(gsutil cat "$metadata_file" 2>/dev/null || echo "{}")
        timestamp=$(echo "$metadata" | jq -r '.timestamp // "unknown"')
        
        echo "  - Backup ID: ${backup_id}"
        echo "    Timestamp: ${timestamp}"
        echo ""
    done
}

# Verify backup integrity
verify_backup() {
    local backup_id=$1
    log "Verifying backup: ${backup_id}"
    
    # Check metadata exists
    if ! gsutil stat "${BACKUP_BUCKET}/metadata/backup_metadata_${backup_id}.json" &> /dev/null; then
        error "Backup metadata not found for ${backup_id}"
        return 1
    fi
    
    # Download metadata
    metadata=$(gsutil cat "${BACKUP_BUCKET}/metadata/backup_metadata_${backup_id}.json")
    
    # Verify components
    info "Checking backup components..."
    
    # Check Firestore backup
    if [ "$(echo "$metadata" | jq -r '.components.firestore')" = "true" ]; then
        if gsutil ls "${BACKUP_BUCKET}/firestore/${backup_id}/" &> /dev/null; then
            log "✓ Firestore backup found"
        else
            error "✗ Firestore backup missing"
            return 1
        fi
    fi
    
    # Check Storage backup
    if [ "$(echo "$metadata" | jq -r '.components.storage')" = "true" ]; then
        if gsutil ls "${BACKUP_BUCKET}/storage/${backup_id}/" &> /dev/null; then
            log "✓ Storage backup found"
        else
            error "✗ Storage backup missing"
            return 1
        fi
    fi
    
    # Check Secrets backup
    if [ "$(echo "$metadata" | jq -r '.components.secrets')" = "true" ]; then
        if gsutil ls "${BACKUP_BUCKET}/secrets/${backup_id}/" &> /dev/null; then
            log "✓ Secrets backup found"
        else
            error "✗ Secrets backup missing"
            return 1
        fi
    fi
    
    # Check Configs backup
    if [ "$(echo "$metadata" | jq -r '.components.configs')" = "true" ]; then
        if gsutil ls "${BACKUP_BUCKET}/configs/configs_${backup_id}.tar.gz" &> /dev/null; then
            log "✓ Configs backup found"
        else
            error "✗ Configs backup missing"
            return 1
        fi
    fi
    
    log "Backup verification completed successfully"
    return 0
}

# Get latest backup ID
get_latest_backup() {
    local latest_backup=$(gsutil ls "${BACKUP_BUCKET}/metadata/backup_metadata_*.json" | \
        sort -r | head -n1 | basename | sed 's/backup_metadata_//;s/.json//')
    
    if [ -z "$latest_backup" ]; then
        error "No backups found"
        exit 1
    fi
    
    echo "$latest_backup"
}

# Restore Firestore
restore_firestore() {
    local backup_id=$1
    log "Restoring Firestore from backup ${backup_id}..."
    
    # Import Firestore data
    gcloud firestore import \
        --project="${PROJECT_ID}" \
        "${BACKUP_BUCKET}/firestore/${backup_id}" \
        --async
    
    if [ $? -eq 0 ]; then
        log "Firestore restore initiated successfully"
        
        # Wait for operation to complete
        info "Waiting for Firestore import to complete..."
        
        # Monitor operation
        while true; do
            # Check operation status
            if gcloud firestore operations list --project="${PROJECT_ID}" | grep -q "DONE"; then
                break
            fi
            sleep 10
        done
        
        log "Firestore restore completed"
    else
        error "Firestore restore failed"
        return 1
    fi
}

# Restore Cloud Storage
restore_storage() {
    local backup_id=$1
    log "Restoring Cloud Storage from backup ${backup_id}..."
    
    # List backed up buckets
    gsutil ls "${BACKUP_BUCKET}/storage/${backup_id}/" | while read -r bucket_backup; do
        # Extract bucket name
        bucket_name=$(basename "$bucket_backup")
        
        log "Restoring bucket: ${bucket_name}"
        
        # Sync data back
        gsutil -m rsync -r -d \
            "${bucket_backup}" \
            "gs://${bucket_name}/"
        
        if [ $? -eq 0 ]; then
            log "Bucket ${bucket_name} restored successfully"
        else
            warning "Failed to restore bucket ${bucket_name}"
        fi
    done
}

# Restore Secrets
restore_secrets() {
    local backup_id=$1
    log "Restoring Secrets from backup ${backup_id}..."
    
    # Create temporary directory
    TEMP_DIR=$(mktemp -d)
    trap "rm -rf ${TEMP_DIR}" EXIT
    
    # Download encrypted secrets
    gsutil -m cp "${BACKUP_BUCKET}/secrets/${backup_id}/*.enc" "${TEMP_DIR}/"
    
    # Process each secret
    for encrypted_file in "${TEMP_DIR}"/*.enc; do
        if [ -f "$encrypted_file" ]; then
            # Extract secret name
            secret_name=$(basename "$encrypted_file" .enc)
            
            log "Restoring secret: ${secret_name}"
            
            # Decrypt
            gcloud kms decrypt \
                --key="backup-key" \
                --keyring="groeimetai-keyring" \
                --location="global" \
                --ciphertext-file="$encrypted_file" \
                --plaintext-file="${TEMP_DIR}/${secret_name}.txt"
            
            # Create or update secret
            if gcloud secrets describe "${secret_name}" --project="${PROJECT_ID}" &> /dev/null; then
                # Add new version
                gcloud secrets versions add "${secret_name}" \
                    --project="${PROJECT_ID}" \
                    --data-file="${TEMP_DIR}/${secret_name}.txt"
            else
                # Create new secret
                gcloud secrets create "${secret_name}" \
                    --project="${PROJECT_ID}" \
                    --data-file="${TEMP_DIR}/${secret_name}.txt"
            fi
        fi
    done
    
    log "Secrets restore completed"
}

# Restore configuration files
restore_configs() {
    local backup_id=$1
    log "Restoring configuration files from backup ${backup_id}..."
    
    # Create recovery directory
    RECOVERY_DIR="./recovery_${backup_id}"
    mkdir -p "$RECOVERY_DIR"
    
    # Download and extract configs
    gsutil cp "${BACKUP_BUCKET}/configs/configs_${backup_id}.tar.gz" "${RECOVERY_DIR}/"
    
    cd "$RECOVERY_DIR"
    tar -xzf "configs_${backup_id}.tar.gz"
    rm "configs_${backup_id}.tar.gz"
    cd -
    
    log "Configuration files restored to: ${RECOVERY_DIR}"
    info "Please review and manually apply configuration changes as needed"
}

# Perform health checks after recovery
post_recovery_health_check() {
    log "Performing post-recovery health checks..."
    
    # Check Firestore connectivity
    info "Checking Firestore..."
    if gcloud firestore databases list --project="${PROJECT_ID}" &> /dev/null; then
        log "✓ Firestore is accessible"
    else
        error "✗ Firestore is not accessible"
    fi
    
    # Check Cloud Run services
    info "Checking Cloud Run services..."
    services=$(gcloud run services list --project="${PROJECT_ID}" --format="value(name)")
    while IFS= read -r service; do
        if [ -n "$service" ]; then
            url=$(gcloud run services describe "$service" --project="${PROJECT_ID}" --region="us-central1" --format="value(status.url)")
            if curl -s -o /dev/null -w "%{http_code}" "$url/api/health" | grep -q "200"; then
                log "✓ Service ${service} is healthy"
            else
                warning "✗ Service ${service} health check failed"
            fi
        fi
    done <<< "$services"
    
    log "Health checks completed"
}

# Main recovery function
perform_recovery() {
    local backup_id=$1
    local dry_run=${2:-false}
    
    log "Starting disaster recovery process..."
    info "Backup ID: ${backup_id}"
    
    # Verify backup first
    if ! verify_backup "$backup_id"; then
        error "Backup verification failed. Aborting recovery."
        exit 1
    fi
    
    if [ "$dry_run" = "true" ]; then
        info "DRY RUN MODE - No actual changes will be made"
    fi
    
    # Confirm recovery
    if [ "$dry_run" != "true" ]; then
        warning "This will restore data from backup ${backup_id}"
        warning "Current data may be overwritten!"
        read -p "Are you sure you want to continue? (yes/no): " confirm
        
        if [ "$confirm" != "yes" ]; then
            log "Recovery cancelled"
            exit 0
        fi
    fi
    
    # Track errors
    ERRORS=0
    
    # Perform recovery
    if [ "$dry_run" != "true" ]; then
        restore_firestore "$backup_id" || ((ERRORS++))
        restore_storage "$backup_id" || ((ERRORS++))
        restore_secrets "$backup_id" || ((ERRORS++))
        restore_configs "$backup_id" || ((ERRORS++))
        
        # Health checks
        post_recovery_health_check
    else
        info "Would restore Firestore from ${BACKUP_BUCKET}/firestore/${backup_id}"
        info "Would restore Storage buckets from ${BACKUP_BUCKET}/storage/${backup_id}"
        info "Would restore Secrets from ${BACKUP_BUCKET}/secrets/${backup_id}"
        info "Would restore Configs from ${BACKUP_BUCKET}/configs/configs_${backup_id}.tar.gz"
    fi
    
    # Summary
    if [ $ERRORS -eq 0 ]; then
        log "Recovery completed successfully"
    else
        error "Recovery completed with ${ERRORS} errors"
        exit 1
    fi
}

# Main
case "$RECOVERY_MODE" in
    "latest")
        BACKUP_ID=$(get_latest_backup)
        perform_recovery "$BACKUP_ID"
        ;;
    "specific")
        if [ -z "$BACKUP_ID" ]; then
            error "Backup ID required for specific mode"
            usage
        fi
        perform_recovery "$BACKUP_ID"
        ;;
    "list")
        list_backups
        ;;
    "verify")
        if [ -z "$BACKUP_ID" ]; then
            error "Backup ID required for verify mode"
            usage
        fi
        verify_backup "$BACKUP_ID"
        ;;
    "dry-run")
        BACKUP_ID=${BACKUP_ID:-$(get_latest_backup)}
        perform_recovery "$BACKUP_ID" true
        ;;
    *)
        usage
        ;;
esac