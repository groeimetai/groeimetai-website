# Monitoring and Alerting Configuration

# Create notification channels
resource "google_monitoring_notification_channel" "email_ops" {
  display_name = "Operations Team Email"
  type         = "email"
  
  labels = {
    email_address = var.ops_email
  }
}

resource "google_monitoring_notification_channel" "slack" {
  display_name = "Slack Alerts"
  type         = "slack"
  
  labels = {
    channel_name = "#alerts"
    url          = var.slack_webhook_url
  }
  
  sensitive_labels {
    auth_token = var.slack_auth_token
  }
}

resource "google_monitoring_notification_channel" "pagerduty" {
  display_name = "PagerDuty"
  type         = "pagerduty"
  
  labels = {
    service_key = var.pagerduty_service_key
  }
}

# Custom metrics for business KPIs
resource "google_logging_metric" "user_registrations" {
  name   = "user_registrations"
  filter = "resource.type=\"cloud_run_revision\" AND jsonPayload.event=\"user_registered\""
  
  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"
    
    labels {
      key         = "user_type"
      value_type  = "STRING"
      description = "Type of user (free, premium, enterprise)"
    }
  }
  
  label_extractors = {
    "user_type" = "EXTRACT(jsonPayload.user_type)"
  }
}

resource "google_logging_metric" "api_errors" {
  name   = "api_errors"
  filter = "resource.type=\"cloud_run_revision\" AND severity>=ERROR"
  
  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"
    
    labels {
      key         = "error_type"
      value_type  = "STRING"
      description = "Type of error"
    }
    
    labels {
      key         = "endpoint"
      value_type  = "STRING"
      description = "API endpoint"
    }
  }
  
  label_extractors = {
    "error_type" = "EXTRACT(jsonPayload.error_type)"
    "endpoint"   = "EXTRACT(httpRequest.requestUrl)"
  }
}

# SLO Configuration
resource "google_monitoring_slo" "api_availability" {
  service      = google_monitoring_service.groeimetai_api.service_id
  display_name = "API Availability SLO"
  
  goal                = 0.999 # 99.9% availability
  rolling_period_days = 30
  
  request_based_sli {
    good_total_ratio {
      good_service_filter = join(" AND ", [
        "metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\"",
        "resource.type=\"uptime_url\""
      ])
      
      total_service_filter = "metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\""
    }
  }
}

resource "google_monitoring_slo" "api_latency" {
  service      = google_monitoring_service.groeimetai_api.service_id
  display_name = "API Latency SLO"
  
  goal                = 0.95 # 95% of requests under threshold
  rolling_period_days = 30
  
  request_based_sli {
    distribution_cut {
      distribution_filter = join(" AND ", [
        "metric.type=\"run.googleapis.com/request_latencies\"",
        "resource.type=\"cloud_run_revision\""
      ])
      
      range {
        max = 2000 # 2 seconds
      }
    }
  }
}

# Monitoring Service
resource "google_monitoring_service" "groeimetai_api" {
  service_id   = "groeimetai-api"
  display_name = "GroeimetAI API Service"
  
  basic_service {
    service_type = "CLOUD_RUN"
    service_labels = {
      service_name = google_cloud_run_service.app_production.name
      location     = google_cloud_run_service.app_production.location
    }
  }
}

# Alert Policies
resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "High API Error Rate"
  combiner     = "OR"
  enabled      = true
  
  conditions {
    display_name = "Error rate exceeds 5%"
    
    condition_threshold {
      filter          = "metric.type=\"run.googleapis.com/request_count\" AND resource.type=\"cloud_run_revision\" AND metric.label.response_code_class!=\"2xx\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.05
      
      aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_RATE"
        cross_series_reducer = "REDUCE_MEAN"
        group_by_fields      = ["resource.label.service_name"]
      }
      
      trigger {
        count = 1
      }
    }
  }
  
  notification_channels = [
    google_monitoring_notification_channel.email_ops.id,
    google_monitoring_notification_channel.slack.id,
  ]
  
  alert_strategy {
    auto_close = "1800s"
    
    notification_rate_limit {
      period = "3600s"
    }
  }
  
  documentation {
    content = "The API error rate has exceeded 5%. Check the logs for error details and investigate the root cause."
    mime_type = "text/markdown"
  }
}

resource "google_monitoring_alert_policy" "database_connection_failure" {
  display_name = "Database Connection Failure"
  combiner     = "OR"
  enabled      = true
  
  conditions {
    display_name = "Firestore connection errors"
    
    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND jsonPayload.error_type=\"DATABASE_CONNECTION_ERROR\""
      duration        = "60s"
      comparison      = "COMPARISON_GT"
      threshold_value = 10
      
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_COUNT"
      }
    }
  }
  
  notification_channels = [
    google_monitoring_notification_channel.email_ops.id,
    google_monitoring_notification_channel.pagerduty.id,
  ]
  
  severity = "CRITICAL"
}

resource "google_monitoring_alert_policy" "high_memory_usage" {
  display_name = "High Memory Usage"
  combiner     = "OR"
  enabled      = true
  
  conditions {
    display_name = "Memory usage exceeds 80%"
    
    condition_threshold {
      filter          = "metric.type=\"run.googleapis.com/container/memory/utilizations\" AND resource.type=\"cloud_run_revision\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.8
      
      aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_MEAN"
        cross_series_reducer = "REDUCE_MEAN"
        group_by_fields      = ["resource.label.service_name"]
      }
    }
  }
  
  notification_channels = [
    google_monitoring_notification_channel.email_ops.id,
  ]
}

resource "google_monitoring_alert_policy" "ssl_certificate_expiry" {
  display_name = "SSL Certificate Expiry Warning"
  combiner     = "OR"
  enabled      = true
  
  conditions {
    display_name = "Certificate expires in 30 days"
    
    condition_threshold {
      filter          = "metric.type=\"certificatemanager.googleapis.com/certificate/days_until_expiry\" AND resource.type=\"certificatemanager.googleapis.com/Certificate\""
      duration        = "0s"
      comparison      = "COMPARISON_LT"
      threshold_value = 30
      
      aggregations {
        alignment_period   = "3600s"
        per_series_aligner = "ALIGN_MIN"
      }
    }
  }
  
  notification_channels = [
    google_monitoring_notification_channel.email_ops.id,
  ]
  
  documentation {
    content = "SSL certificate will expire soon. Renew the certificate to avoid service disruption."
  }
}

resource "google_monitoring_alert_policy" "budget_alert" {
  display_name = "Budget Threshold Alert"
  combiner     = "OR"
  enabled      = true
  
  conditions {
    display_name = "Monthly spend exceeds 80% of budget"
    
    condition_threshold {
      filter          = "metric.type=\"billing.googleapis.com/billing/cost\" AND resource.type=\"global\""
      duration        = "0s"
      comparison      = "COMPARISON_GT"
      threshold_value = var.monthly_budget * 0.8
      
      aggregations {
        alignment_period   = "86400s" # 1 day
        per_series_aligner = "ALIGN_SUM"
      }
    }
  }
  
  notification_channels = [
    google_monitoring_notification_channel.email_ops.id,
  ]
  
  severity = "WARNING"
}

# Custom Dashboard
resource "google_monitoring_dashboard" "main" {
  dashboard_json = jsonencode({
    displayName = "GroeimetAI Main Dashboard"
    mosaicLayout = {
      columns = 12
      tiles = [
        {
          width  = 6
          height = 4
          widget = {
            title = "Request Rate"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "metric.type=\"run.googleapis.com/request_count\" resource.type=\"cloud_run_revision\""
                    aggregation = {
                      alignmentPeriod    = "60s"
                      perSeriesAligner   = "ALIGN_RATE"
                      crossSeriesReducer = "REDUCE_SUM"
                      groupByFields      = ["resource.label.service_name"]
                    }
                  }
                }
                plotType = "LINE"
              }]
            }
          }
        },
        {
          xPos   = 6
          width  = 6
          height = 4
          widget = {
            title = "Error Rate"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "metric.type=\"run.googleapis.com/request_count\" resource.type=\"cloud_run_revision\" metric.label.response_code_class!=\"2xx\""
                    aggregation = {
                      alignmentPeriod    = "60s"
                      perSeriesAligner   = "ALIGN_RATE"
                      crossSeriesReducer = "REDUCE_SUM"
                    }
                  }
                }
                plotType = "LINE"
                targetAxis = "Y1"
              }]
            }
          }
        },
        {
          yPos   = 4
          width  = 12
          height = 4
          widget = {
            title = "Latency Percentiles"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "metric.type=\"run.googleapis.com/request_latencies\" resource.type=\"cloud_run_revision\""
                    aggregation = {
                      alignmentPeriod    = "60s"
                      perSeriesAligner   = "ALIGN_DELTA"
                      crossSeriesReducer = "REDUCE_PERCENTILE_50"
                    }
                  }
                }
                plotType = "LINE"
                targetAxis = "Y1"
              },
              {
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "metric.type=\"run.googleapis.com/request_latencies\" resource.type=\"cloud_run_revision\""
                    aggregation = {
                      alignmentPeriod    = "60s"
                      perSeriesAligner   = "ALIGN_DELTA"
                      crossSeriesReducer = "REDUCE_PERCENTILE_95"
                    }
                  }
                }
                plotType = "LINE"
                targetAxis = "Y1"
              },
              {
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "metric.type=\"run.googleapis.com/request_latencies\" resource.type=\"cloud_run_revision\""
                    aggregation = {
                      alignmentPeriod    = "60s"
                      perSeriesAligner   = "ALIGN_DELTA"
                      crossSeriesReducer = "REDUCE_PERCENTILE_99"
                    }
                  }
                }
                plotType = "LINE"
                targetAxis = "Y1"
              }]
            }
          }
        },
        {
          yPos   = 8
          width  = 6
          height = 4
          widget = {
            title = "Active Users"
            scorecard = {
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "metric.type=\"custom.googleapis.com/active_users\" resource.type=\"global\""
                  aggregation = {
                    alignmentPeriod    = "300s"
                    perSeriesAligner   = "ALIGN_MAX"
                    crossSeriesReducer = "REDUCE_SUM"
                  }
                }
              }
              sparkChartView = {
                sparkChartType = "SPARK_LINE"
              }
            }
          }
        },
        {
          xPos   = 6
          yPos   = 8
          width  = 6
          height = 4
          widget = {
            title = "Daily Cost"
            scorecard = {
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "metric.type=\"billing.googleapis.com/billing/cost\" resource.type=\"global\""
                  aggregation = {
                    alignmentPeriod    = "86400s"
                    perSeriesAligner   = "ALIGN_SUM"
                    crossSeriesReducer = "REDUCE_SUM"
                  }
                }
              }
              sparkChartView = {
                sparkChartType = "SPARK_BAR"
              }
            }
          }
        }
      ]
    }
  })
}

# Log-based alerts
resource "google_logging_alert_policy" "security_breach_attempt" {
  display_name = "Security Breach Attempt"
  combiner     = "OR"
  
  conditions {
    display_name = "Multiple failed login attempts"
    
    condition {
      filter = "resource.type=\"cloud_run_revision\" AND jsonPayload.event=\"login_failed\" AND jsonPayload.ip=~\".+\""
      
      aggregations {
        alignment_period     = "300s"
        per_series_aligner   = "ALIGN_COUNT"
        cross_series_reducer = "REDUCE_COUNT"
        group_by_fields      = ["jsonPayload.ip"]
      }
      
      comparison      = "COMPARISON_GT"
      threshold_value = 10
      duration        = "0s"
    }
  }
  
  notification_channels = [
    google_monitoring_notification_channel.email_ops.id,
    google_monitoring_notification_channel.pagerduty.id,
  ]
  
  alert_strategy {
    notification_rate_limit {
      period = "300s"
    }
  }
}

# Synthetic monitoring
resource "google_monitoring_synthetic_monitor" "api_health" {
  display_name = "API Health Check"
  
  synthetic_target {
    uri = "${google_cloud_run_service.app_production.status[0].url}/api/health"
  }
  
  http_check {
    path         = "/api/health"
    use_ssl      = true
    validate_ssl = true
    
    accepted_response_status_codes {
      status_value = 200
    }
  }
  
  checker_type = "STATIC_IP_CHECKERS"
  
  frequency = "60s"
  timeout   = "10s"
  
  selected_regions = ["USA", "EUROPE", "ASIA_PACIFIC"]
}