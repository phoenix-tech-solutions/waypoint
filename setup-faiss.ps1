# Script to approve and build faiss-node
Write-Host "Approving faiss-node build scripts..." -ForegroundColor Yellow
Write-Host "When prompted, press SPACE to select faiss-node, then press ENTER" -ForegroundColor Yellow
pnpm approve-builds

Write-Host "`nRebuilding faiss-node..." -ForegroundColor Yellow
pnpm rebuild faiss-node

Write-Host "`nDone! You can now run 'pnpm server'" -ForegroundColor Green

