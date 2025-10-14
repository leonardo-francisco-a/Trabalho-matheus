# Configuração do Terraform e Provider GCP
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Habilitar APIs necessárias
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",           # Cloud Run
    "sqladmin.googleapis.com",      # Cloud SQL
    "secretmanager.googleapis.com", # Secret Manager
    "artifactregistry.googleapis.com", # Container Registry
  ])
  
  service            = each.key
  disable_on_destroy = false
}

# Secret Manager - JWT Secret
resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret"
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "jwt_secret_version" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = var.jwt_secret
}

# Cloud SQL - MySQL Database
resource "google_sql_database_instance" "mysql" {
  name             = "${var.app_name}-db-${var.environment}"
  database_version = "MYSQL_8_0"
  region           = var.region
  
  settings {
    tier = "db-f1-micro" # Instância pequena para começar
    
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0" # Em produção, restringir IPs
      }
    }
    
    backup_configuration {
      enabled            = true
      start_time        = "03:00"
      binary_log_enabled = true
    }
  }
  
  deletion_protection = false # Para facilitar testes
  
  depends_on = [google_project_service.apis]
}

# Database
resource "google_sql_database" "database" {
  name     = var.database_name
  instance = google_sql_database_instance.mysql.name
}

# Database User
resource "google_sql_user" "user" {
  name     = var.database_user
  instance = google_sql_database_instance.mysql.name
  password = var.database_password
}

# Cloud Run - Backend
resource "google_cloud_run_service" "backend" {
  name     = "${var.app_name}-backend-${var.environment}"
  location = var.region
  
  template {
    spec {
      containers {
        image = var.backend_image
        
        ports {
          container_port = 3001
        }
        
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        
        env {
          name  = "PORT"
          value = "3001"
        }
        
        env {
          name  = "DB_HOST"
          value = google_sql_database_instance.mysql.public_ip_address
        }
        
        env {
          name  = "DB_USER"
          value = var.database_user
        }
        
        env {
          name  = "DB_PASSWORD"
          value = var.database_password
        }
        
        env {
          name  = "DB_NAME"
          value = var.database_name
        }
        
        env {
          name = "JWT_SECRET"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.jwt_secret.secret_id
              key  = "latest"
            }
          }
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
      }
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "10"
        "autoscaling.knative.dev/minScale" = "0"
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [
    google_project_service.apis,
    google_sql_database_instance.mysql
  ]
}

# Cloud Run - Frontend
resource "google_cloud_run_service" "frontend" {
  name     = "${var.app_name}-frontend-${var.environment}"
  location = var.region
  
  template {
    spec {
      containers {
        image = var.frontend_image
        
        ports {
          container_port = 80
        }
        
        env {
          name  = "VITE_API_URL"
          value = google_cloud_run_service.backend.status[0].url
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "256Mi"
          }
        }
      }
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "10"
        "autoscaling.knative.dev/minScale" = "0"
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [
    google_project_service.apis,
    google_cloud_run_service.backend
  ]
}

# Permitir acesso público ao Backend
resource "google_cloud_run_service_iam_member" "backend_public" {
  service  = google_cloud_run_service.backend.name
  location = google_cloud_run_service.backend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Permitir acesso público ao Frontend
resource "google_cloud_run_service_iam_member" "frontend_public" {
  service  = google_cloud_run_service.frontend.name
  location = google_cloud_run_service.frontend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}