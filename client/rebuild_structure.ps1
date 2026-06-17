Remove-Item -Recurse -Force src/features/ledger -ErrorAction Ignore
Remove-Item -Recurse -Force src/features/dashboard -ErrorAction Ignore
Remove-Item -Recurse -Force src/app/wallet -ErrorAction Ignore
Remove-Item -Recurse -Force src/app/dashboard -ErrorAction Ignore

$dirs = @(
    'src/core/api',
    'src/core/interceptors',
    'src/shared/ui',
    'src/shared/hooks',
    'src/shared/layouts',
    'src/providers',
    'src/types',
    'src/constants',
    'src/utils',
    'src/styles',
    'src/features/auth',
    'src/features/roadmap',
    'src/features/community',
    'src/features/creator',
    'src/features/profile',
    'src/features/collections',
    'src/features/achievements',
    'src/features/leaderboard',
    'src/features/notifications',
    'src/features/settings',
    'src/features/admin'
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}
Write-Host "Directory structure rebuilt!"
