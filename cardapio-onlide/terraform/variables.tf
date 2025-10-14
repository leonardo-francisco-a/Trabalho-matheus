# Variáveis do Terraform

variable "project_id" {
  description = "ID do projeto no Google Cloud"
  type        = string
}

variable "region" {
  description = "Região do Google Cloud"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Ambiente (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "app_name" {
  description = "Nome da aplicação"
  type        = string
  default     = "cardapio"
}

# Database
variable "database_name" {
  description = "Nome do banco de dados"
  type        = string
  default     = "cardapio_db"
}

variable "database_user" {
  description = "Usuário do banco de dados"
  type        = string
  default     = "cardapio_user"
}

variable "database_password" {
  description = "Senha do banco de dados"
  type        = string
  sensitive   = true
}

# JWT
variable "jwt_secret" {
  description = "Secret para JWT"
  type        = string
  sensitive   = true
}

# Docker Images
variable "backend_image" {
  description = "Imagem Docker do backend"
  type        = string
  default     = "gcr.io/PROJECT_ID/cardapio-backend:latest"
}

variable "frontend_image" {
  description = "Imagem Docker do frontend"
  type        = string
  default     = "gcr.io/PROJECT_ID/cardapio-frontend:latest"
}