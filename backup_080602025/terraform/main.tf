terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
  
  backend "gcs" {
    bucket = "groeimetai-terraform-state"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "cloudrun.googleapis.com",
    "cloudbuild.googleapis.com",
    "containerregistry.googleapis.com",
    "cloudkms.googleapis.com",
    "secretmanager.googleapis.com",
    "firebase.googleapis.com",
    "firestore.googleapis.com",
    "firebasestorage.googleapis.com",
    "identitytoolkit.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
    "cloudtrace.googleapis.com",
    "clouderrorreporting.googleapis.com",
    "cloudprofiler.googleapis.com",
    "compute.googleapis.com",
    "dns.googleapis.com",
    "certificatemanager.googleapis.com",
    "networkservices.googleapis.com",
    "aiplatform.googleapis.com",
    "generativelanguage.googleapis.com"
  ])
  
  service = each.key
  disable_on_destroy = false
}

# Cloud Storage bucket for build artifacts
resource "google_storage_bucket" "build_artifacts" {
  name          = "${var.project_id}-build-artifacts"
  location      = var.region
  force_destroy = false
  
  uniform_bucket_level_access = true
  
  versioning {
    enabled = true
  }
  
  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }
}

# Cloud Storage bucket for application assets
resource "google_storage_bucket" "app_assets" {
  name          = "${var.project_id}-app-assets"
  location      = var.region
  force_destroy = false
  
  uniform_bucket_level_access = true
  
  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
  
  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
}

# Service Account for Cloud Run
resource "google_service_account" "cloud_run_sa" {
  account_id   = "cloud-run-sa"
  display_name = "Cloud Run Service Account"
  description  = "Service account for Cloud Run applications"
}

# IAM roles for Cloud Run service account
resource "google_project_iam_member" "cloud_run_roles" {
  for_each = toset([
    "roles/firestore.user",
    "roles/firebase.sdkAdminServiceAgent",
    "roles/storage.objectViewer",
    "roles/secretmanager.secretAccessor",
    "roles/cloudtrace.agent",
    "roles/monitoring.metricWriter",
    "roles/logging.logWriter",
    "roles/cloudsql.client",
    "roles/aiplatform.user"
  ])
  
  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Secret Manager secrets
resource "google_secret_manager_secret" "app_secrets" {
  for_each = {
    firebase_api_key              = "Firebase API Key"
    firebase_auth_domain          = "Firebase Auth Domain"
    firebase_project_id           = "Firebase Project ID"
    firebase_storage_bucket       = "Firebase Storage Bucket"
    firebase_messaging_sender_id  = "Firebase Messaging Sender ID"
    firebase_app_id              = "Firebase App ID"
    firebase_measurement_id       = "Firebase Measurement ID"
    gemini_api_key               = "Gemini API Key"
    jwt_secret                   = "JWT Secret"
    oauth_google_client_id       = "OAuth Google Client ID"
    oauth_google_client_secret   = "OAuth Google Client Secret"
    oauth_linkedin_client_id     = "OAuth LinkedIn Client ID"
    oauth_linkedin_client_secret = "OAuth LinkedIn Client Secret"
  }
  
  secret_id = each.key
  
  replication {
    automatic = true
  }
}

# Cloud Run service (Production)
resource "google_cloud_run_service" "app_production" {
  name     = "groeimetai-app"
  location = var.region
  
  template {
    spec {
      service_account_name = google_service_account.cloud_run_sa.email
      
      containers {
        image = "gcr.io/${var.project_id}/groeimetai-app:latest"
        
        ports {
          container_port = 8080
        }
        
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        
        dynamic "env" {
          for_each = google_secret_manager_secret.app_secrets
          content {
            name = "SECRET_${upper(env.key)}"
            value_from {
              secret_key_ref {
                name = env.value.secret_id
                key  = "latest"
              }
            }
          }
        }
        
        resources {
          limits = {
            cpu    = "2000m"
            memory = "2048Mi"
          }
          requests = {
            cpu    = "1000m"
            memory = "1024Mi"
          }
        }
        
        startup_probe {
          http_get {
            path = "/api/health"
            port = 8080
          }
          initial_delay_seconds = 0
          timeout_seconds       = 3
          period_seconds        = 3
          failure_threshold     = 30
        }
        
        liveness_probe {
          http_get {
            path = "/api/health"
            port = 8080
          }
          initial_delay_seconds = 30
          timeout_seconds       = 5
          period_seconds        = 10
          failure_threshold     = 3
        }
      }
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale"     = "2"
        "autoscaling.knative.dev/maxScale"     = "100"
        "run.googleapis.com/startup-cpu-boost" = "true"
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  autogenerate_revision_name = true
}

# Cloud Run service (Staging)
resource "google_cloud_run_service" "app_staging" {
  name     = "groeimetai-app-staging"
  location = var.region
  
  template {
    spec {
      service_account_name = google_service_account.cloud_run_sa.email
      
      containers {
        image = "gcr.io/${var.project_id}/groeimetai-app:latest"
        
        ports {
          container_port = 8080
        }
        
        env {
          name  = "NODE_ENV"
          value = "staging"
        }
        
        dynamic "env" {
          for_each = google_secret_manager_secret.app_secrets
          content {
            name = "SECRET_${upper(env.key)}"
            value_from {
              secret_key_ref {
                name = env.value.secret_id
                key  = "latest"
              }
            }
          }
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "1024Mi"
          }
        }
      }
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "1"
        "autoscaling.knative.dev/maxScale" = "10"
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  autogenerate_revision_name = true
}

# IAM policy to allow public access
resource "google_cloud_run_service_iam_member" "public_access_production" {
  location = google_cloud_run_service.app_production.location
  project  = google_cloud_run_service.app_production.project
  service  = google_cloud_run_service.app_production.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "public_access_staging" {
  location = google_cloud_run_service.app_staging.location
  project  = google_cloud_run_service.app_staging.project
  service  = google_cloud_run_service.app_staging.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Cloud Armor security policy
resource "google_compute_security_policy" "policy" {
  name = "groeimetai-security-policy"
  
  rule {
    action   = "allow"
    priority = "1000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Allow all traffic by default"
  }
  
  rule {
    action   = "deny(403)"
    priority = "900"
    match {
      expr {
        expression = "origin.region_code == 'CN' || origin.region_code == 'RU' || origin.region_code == 'KP'"
      }
    }
    description = "Block traffic from specific countries"
  }
  
  rule {
    action   = "rate_based_ban"
    priority = "800"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    rate_limit_options {
      conform_action = "allow"
      exceed_action = "deny(429)"
      enforce_on_key = "IP"
      
      rate_limit_threshold {
        count        = 100
        interval_sec = 60
      }
      
      ban_duration_sec = 600
    }
    description = "Rate limiting rule"
  }
  
  adaptive_protection_config {
    layer_7_ddos_defense_config {
      enable = true
    }
  }
}

# Load Balancer with Cloud Armor
resource "google_compute_backend_service" "app_backend" {
  name                  = "groeimetai-backend"
  protocol              = "HTTP"
  port_name             = "http"
  timeout_sec           = 30
  enable_cdn            = true
  security_policy       = google_compute_security_policy.policy.id
  
  backend {
    group = google_compute_region_network_endpoint_group.cloud_run_neg.id
  }
  
  health_checks = [google_compute_health_check.app_health.id]
  
  cdn_policy {
    cache_key_policy {
      include_host         = true
      include_protocol     = true
      include_query_string = false
    }
    cache_mode = "CACHE_ALL_STATIC"
    default_ttl = 3600
    max_ttl     = 86400
  }
}

# Network Endpoint Group for Cloud Run
resource "google_compute_region_network_endpoint_group" "cloud_run_neg" {
  name                  = "groeimetai-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region
  
  cloud_run {
    service = google_cloud_run_service.app_production.name
  }
}

# Health check
resource "google_compute_health_check" "app_health" {
  name               = "groeimetai-health-check"
  check_interval_sec = 10
  timeout_sec        = 5
  
  http_health_check {
    port         = 80
    request_path = "/api/health"
  }
}

# SSL Certificate
resource "google_compute_managed_ssl_certificate" "app_cert" {
  name = "groeimetai-ssl-cert"
  
  managed {
    domains = [var.domain_name, "www.${var.domain_name}"]
  }
}

# URL Map
resource "google_compute_url_map" "app_url_map" {
  name            = "groeimetai-url-map"
  default_service = google_compute_backend_service.app_backend.id
  
  host_rule {
    hosts        = [var.domain_name, "www.${var.domain_name}"]
    path_matcher = "allpaths"
  }
  
  path_matcher {
    name            = "allpaths"
    default_service = google_compute_backend_service.app_backend.id
  }
}

# HTTPS Proxy
resource "google_compute_target_https_proxy" "app_https_proxy" {
  name             = "groeimetai-https-proxy"
  url_map          = google_compute_url_map.app_url_map.id
  ssl_certificates = [google_compute_managed_ssl_certificate.app_cert.id]
}

# Global Forwarding Rule
resource "google_compute_global_forwarding_rule" "app_forwarding_rule" {
  name       = "groeimetai-forwarding-rule"
  target     = google_compute_target_https_proxy.app_https_proxy.id
  port_range = "443"
  ip_address = google_compute_global_address.app_ip.address
}

# Static IP
resource "google_compute_global_address" "app_ip" {
  name = "groeimetai-ip"
}

# HTTP to HTTPS redirect
resource "google_compute_url_map" "http_redirect" {
  name = "groeimetai-http-redirect"
  
  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

resource "google_compute_target_http_proxy" "http_redirect" {
  name    = "groeimetai-http-redirect"
  url_map = google_compute_url_map.http_redirect.id
}

resource "google_compute_global_forwarding_rule" "http_redirect" {
  name       = "groeimetai-http-redirect"
  target     = google_compute_target_http_proxy.http_redirect.id
  port_range = "80"
  ip_address = google_compute_global_address.app_ip.address
}

# Cloud DNS
resource "google_dns_managed_zone" "app_zone" {
  name     = "groeimetai-zone"
  dns_name = "${var.domain_name}."
  
  dnssec_config {
    state = "on"
  }
}

resource "google_dns_record_set" "app_a_record" {
  name         = google_dns_managed_zone.app_zone.dns_name
  type         = "A"
  ttl          = 300
  managed_zone = google_dns_managed_zone.app_zone.name
  rrdatas      = [google_compute_global_address.app_ip.address]
}

resource "google_dns_record_set" "app_www_record" {
  name         = "www.${google_dns_managed_zone.app_zone.dns_name}"
  type         = "CNAME"
  ttl          = 300
  managed_zone = google_dns_managed_zone.app_zone.name
  rrdatas      = [google_dns_managed_zone.app_zone.dns_name]
}

# Monitoring Dashboard
resource "google_monitoring_dashboard" "app_dashboard" {
  dashboard_json = jsonencode({
    displayName = "GroeimetAI Application Dashboard"
    gridLayout = {
      widgets = [
        {
          title = "Cloud Run Request Count"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "metric.type=\"run.googleapis.com/request_count\" resource.type=\"cloud_run_revision\""
                }
              }
            }]
          }
        },
        {
          title = "Cloud Run Request Latencies"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "metric.type=\"run.googleapis.com/request_latencies\" resource.type=\"cloud_run_revision\""
                }
              }
            }]
          }
        },
        {
          title = "Error Rate"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "metric.type=\"logging.googleapis.com/user/error_count\" resource.type=\"cloud_run_revision\""
                }
              }
            }]
          }
        }
      ]
    }
  })
}

# Alerting Policies
resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "High Error Rate Alert"
  combiner     = "OR"
  
  conditions {
    display_name = "Error rate exceeds 5%"
    
    condition_threshold {
      filter          = "metric.type=\"run.googleapis.com/request_count\" AND resource.type=\"cloud_run_revision\" AND metric.label.response_code_class=\"5xx\""
      duration        = "60s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.05
      
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }
  
  notification_channels = [google_monitoring_notification_channel.email.id]
  
  alert_strategy {
    auto_close = "86400s"
  }
}

resource "google_monitoring_alert_policy" "high_latency" {
  display_name = "High Latency Alert"
  combiner     = "OR"
  
  conditions {
    display_name = "Request latency exceeds 2 seconds"
    
    condition_threshold {
      filter          = "metric.type=\"run.googleapis.com/request_latencies\" AND resource.type=\"cloud_run_revision\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 2000
      
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_PERCENTILE_95"
      }
    }
  }
  
  notification_channels = [google_monitoring_notification_channel.email.id]
}

# Notification Channel
resource "google_monitoring_notification_channel" "email" {
  display_name = "Email Notification"
  type         = "email"
  
  labels = {
    email_address = var.alert_email
  }
}

# Uptime Check
resource "google_monitoring_uptime_check_config" "app_uptime" {
  display_name = "GroeimetAI App Uptime Check"
  timeout      = "10s"
  period       = "60s"
  
  http_check {
    path         = "/api/health"
    port         = "443"
    use_ssl      = true
    validate_ssl = true
  }
  
  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = var.domain_name
    }
  }
  
  selected_regions = ["USA", "EUROPE", "ASIA_PACIFIC"]
}

# Backup Configuration
resource "google_firestore_backup_schedule" "daily_backup" {
  project  = var.project_id
  database = "(default)"
  
  retention = "604800s" # 7 days
  
  daily_recurrence {}
}

# Outputs
output "production_url" {
  value = google_cloud_run_service.app_production.status[0].url
}

output "staging_url" {
  value = google_cloud_run_service.app_staging.status[0].url
}

output "load_balancer_ip" {
  value = google_compute_global_address.app_ip.address
}