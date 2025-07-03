variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region to deploy resources"
  type        = string
  default     = "us-central1"
}

variable "domain_name" {
  description = "The domain name for the application"
  type        = string
}

variable "alert_email" {
  description = "Email address for monitoring alerts"
  type        = string
}

variable "environment" {
  description = "Environment name (production, staging, development)"
  type        = string
  default     = "production"
}

variable "enable_apis" {
  description = "Whether to enable GCP APIs"
  type        = bool
  default     = true
}

variable "ssl_policy_min_tls_version" {
  description = "Minimum TLS version for SSL policy"
  type        = string
  default     = "TLS_1_2"
}

variable "cors_allowed_origins" {
  description = "List of allowed origins for CORS"
  type        = list(string)
  default     = ["*"]
}

variable "max_instances" {
  description = "Maximum number of Cloud Run instances"
  type        = number
  default     = 100
}

variable "min_instances" {
  description = "Minimum number of Cloud Run instances"
  type        = number
  default     = 2
}

variable "cpu_limit" {
  description = "CPU limit for Cloud Run containers"
  type        = string
  default     = "2000m"
}

variable "memory_limit" {
  description = "Memory limit for Cloud Run containers"
  type        = string
  default     = "2048Mi"
}