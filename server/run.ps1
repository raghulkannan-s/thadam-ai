# Load .env file and run the Spring Boot app locally
# Usage: .\run.ps1

$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*([^#].+?)\s*=\s*(.+)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value)
        }
    }
    Write-Host "Loaded .env file" -ForegroundColor Green
} else {
    Write-Warning ".env file not found. Copy .env.example to .env and configure."
}

Write-Host "Starting Thadam AI Server..." -ForegroundColor Cyan
& "$PSScriptRoot\mvnw" spring-boot:run
