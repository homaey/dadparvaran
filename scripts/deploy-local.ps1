<#
.SYNOPSIS
  Safe deploy for dadparvaran: build locally, ship the prebuilt .next to the server.

.DESCRIPTION
  The production server (Iran, 1.9 GB RAM) cannot safely run `next build` — the
  type-check step exhausts memory and locks the whole box (this took the site
  down once). It also can't reach fonts.googleapis.com. So we NEVER build on the
  server: we build here, ship the output, and just restart pm2 there.

  Connection details are NOT stored in the repo. Pass them as parameters or set
  the env vars DP_SSH_KEY / DP_HOST / DP_USER. See docs/SERVER.private.md.

.EXAMPLE
  $env:DP_SSH_KEY="C:\path\to\key.pem"; $env:DP_HOST="1.2.3.4"; $env:DP_USER="ubuntu"
  ./scripts/deploy-local.ps1
#>
param(
  [string]$KeyPath    = $env:DP_SSH_KEY,
  [string]$RemoteHost = $env:DP_HOST,
  [string]$User       = $env:DP_USER,
  [string]$RemotePath = "/var/www/dadparvaran",
  [string]$PmName     = "legal-website",
  [int]   $Port       = 3001,
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

function Fail($msg) { Write-Host "DEPLOY FAILED: $msg" -ForegroundColor Red; exit 1 }

if (-not $KeyPath)    { Fail "SSH key not set. Pass -KeyPath or set `$env:DP_SSH_KEY." }
if (-not $RemoteHost) { Fail "Host not set. Pass -RemoteHost or set `$env:DP_HOST." }
if (-not $User)       { Fail "User not set. Pass -User or set `$env:DP_USER." }
if (-not (Test-Path $KeyPath)) { Fail "SSH key not found at $KeyPath" }

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

# 1) Build locally (plenty of RAM here, and fonts are self-hosted so no network).
if (-not $SkipBuild) {
  Write-Host "[1/5] building locally..." -ForegroundColor Cyan
  npm run build
  if ($LASTEXITCODE -ne 0) { Fail "local build failed" }
} else {
  Write-Host "[1/5] skipping build (-SkipBuild)" -ForegroundColor Yellow
}

if (-not (Test-Path ".next/BUILD_ID")) { Fail ".next/BUILD_ID missing after build" }

# 2) Pack the build output (exclude the huge, unneeded build cache).
#    next.config.mjs is shipped too: it holds security headers, CSP and runtime
#    flags (e.g. poweredByHeader) that `next start` reads at boot — the server
#    copy would otherwise drift from the repo.
Write-Host "[2/5] packing .next + public/fonts + next.config.mjs..." -ForegroundColor Cyan
if (Test-Path "deploy.tgz") { Remove-Item "deploy.tgz" -Force }
tar --exclude=".next/cache" -czf deploy.tgz .next public/fonts next.config.mjs
if ($LASTEXITCODE -ne 0 -or -not (Test-Path "deploy.tgz")) { Fail "tar failed" }

# 3) Upload.
Write-Host "[3/5] uploading..." -ForegroundColor Cyan
scp -i $KeyPath -o ConnectTimeout=20 deploy.tgz "${User}@${RemoteHost}:${RemotePath}/deploy.tgz"
if ($LASTEXITCODE -ne 0) { Fail "scp failed" }

# 4) Extract to a temp dir, verify, then atomically swap. Never delete the live
#    .next until the new one is confirmed valid.
Write-Host "[4/5] extracting + swapping on server..." -ForegroundColor Cyan
$remote = @"
set -e
cd $RemotePath
rm -rf .deploy_tmp
mkdir -p .deploy_tmp
tar xzf deploy.tgz -C .deploy_tmp
test -f .deploy_tmp/.next/BUILD_ID || { echo 'NEW BUILD INVALID (no BUILD_ID)'; exit 1; }
rm -rf .next.bak
[ -d .next ] && mv .next .next.bak || true
mv .deploy_tmp/.next .next
mkdir -p public/fonts
cp -f .deploy_tmp/public/fonts/* public/fonts/ 2>/dev/null || true
cp -f .deploy_tmp/next.config.mjs next.config.mjs 2>/dev/null || true
rm -rf .deploy_tmp deploy.tgz
echo "NEW BUILD_ID=`$(cat .next/BUILD_ID)"
"@
ssh -i $KeyPath -o ConnectTimeout=20 "${User}@${RemoteHost}" $remote
if ($LASTEXITCODE -ne 0) { Fail "remote extract/swap failed (live .next left untouched or restore .next.bak)" }

# 5) Restart pm2 + health check. Roll back to .next.bak if health check fails.
Write-Host "[5/5] restarting + health check..." -ForegroundColor Cyan
$restart = @"
set -e
cd $RemotePath
pm2 restart $PmName --update-env
sleep 7
code=`$(curl -s -o /dev/null -w '%{http_code}' http://localhost:$Port/fa || echo 000)
echo "HEALTH=`$code"
if [ "`$code" != "200" ]; then
  echo 'HEALTH CHECK FAILED - rolling back to .next.bak'
  if [ -d .next.bak ]; then rm -rf .next && mv .next.bak .next && pm2 restart $PmName --update-env; fi
  exit 1
fi
pm2 save
"@
ssh -i $KeyPath -o ConnectTimeout=20 "${User}@${RemoteHost}" $restart
if ($LASTEXITCODE -ne 0) { Fail "health check failed (rolled back to previous build)" }

if (Test-Path "deploy.tgz") { Remove-Item "deploy.tgz" -Force }
Write-Host "DEPLOY OK - https://www.dadparvaran.com/fa is serving the new build." -ForegroundColor Green
