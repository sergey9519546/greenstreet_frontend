$rootIndex = 'C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\greenstreet_frontend\index.html'
$distIndex = 'C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\greenstreet_frontend\dist\index.html'

$rc = [System.IO.File]::ReadAllText($rootIndex)
$dc = [System.IO.File]::ReadAllText($distIndex)

Write-Output '=== Differences ==='
$diff = Compare-Object ($rc -split "`n") ($dc -split "`n")
$diff | Select-Object -First 10 | ForEach-Object { Write-Output $_.ToString() }

Write-Output ''
Write-Output '=== Checking dist for React bundle refs ==='
$dc | Select-String -Pattern 'assets/index-[A-Za-z0-9_-]+\.js' | Select-Object -First 3 | ForEach-Object { Write-Output $_.Line }

Write-Output ''
Write-Output '=== Checking root for React bundle refs ==='
$rc | Select-String -Pattern 'assets/index-[A-Za-z0-9_-]+\.js' | Select-Object -First 3 | ForEach-Object { Write-Output $_.Line }
