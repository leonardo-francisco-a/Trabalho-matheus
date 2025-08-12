Write-Host "🍽️ Setup Sistema de Cardápio" -ForegroundColor Cyan

# Verificar Docker
try {
    docker --version | Out-Null
    Write-Host "✅ Docker OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não encontrado!" -ForegroundColor Red
    Write-Host "Instale: https://docker.com" -ForegroundColor Yellow
    exit 1
}

# Verificar arquivo .env
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "📝 Arquivo .env criado" -ForegroundColor Yellow
}

Write-Host "🏗️ Building containers..." -ForegroundColor Blue
docker-compose build

Write-Host "🚀 Iniciando ambiente..." -ForegroundColor Blue
docker-compose up -d

Write-Host "⏳ Aguardando serviços..." -ForegroundColor Yellow
Start-Sleep 20

Write-Host "🎉 Ambiente pronto!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Acessar aplicação:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   Backend:  http://localhost:3001"
Write-Host "   Banco:    http://localhost:8080"
Write-Host ""
Write-Host "🛑 Para parar: docker-compose down" -ForegroundColor Yellow
