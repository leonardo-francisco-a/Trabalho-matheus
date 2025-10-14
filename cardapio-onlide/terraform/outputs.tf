# Outputs - URLs e informações importantes

output "frontend_url" {
  description = "URL do frontend"
  value       = google_cloud_run_service.frontend.status[0].url
}

output "backend_url" {
  description = "URL do backend"
  value       = google_cloud_run_service.backend.status[0].url
}

output "database_ip" {
  description = "IP público do banco de dados"
  value       = google_sql_database_instance.mysql.public_ip_address
  sensitive   = true
}

output "database_connection_name" {
  description = "Nome de conexão do Cloud SQL"
  value       = google_sql_database_instance.mysql.connection_name
}

output "project_id" {
  description = "ID do projeto GCP"
  value       = var.project_id
}

output "region" {
  description = "Região da infraestrutura"
  value       = var.region
}