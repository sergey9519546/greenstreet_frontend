Write-Output '=== ROOT FILES ==='
Get-ChildItem 'C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\greenstreet_frontend' -File | Where-Object { $_.Name -match '\.html$' } | Select-Object Name, Length | Format-Table -AutoSize
Write-Output '=== DIST FILES ==='
Get-ChildItem 'C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\greenstreet_frontend\dist' -File | Select-Object Name, Length | Format-Table -AutoSize
Write-Output '=== CHECK MARKETING-PAGE.HTML GREENBOARD URLs ==='
$mp = 'C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\greenstreet_frontend\marketing-page.html'
$content = [System.IO.File]::ReadAllText($mp)
Write-Output ('File size: ' + (Get-Item $mp).Length + ' bytes')
Write-Output ('greenboard URLs: ' + ([regex]::Matches($content, 'cdn\.jsdelivr\.net/gh/SamCharpentier/greenboard').Count))
Write-Output ('greenstreet CDN URLs (broken): ' + ([regex]::Matches($content, 'cdn\.jsdelivr\.net/gh/SamCharpentier/greenstreet').Count))
Write-Output ('/security.html links: ' + ([regex]::Matches($content, 'href="/security\.html"').Count))
Write-Output ('trust.greenstreet.com links: ' + ([regex]::Matches($content, 'trust\.greenstreet\.com').Count))
Write-Output ('placeholder imgs: ' + ([regex]::Matches($content, 'placeholder\.60f9b1840c').Count))
Write-Output ('hero.mp4 refs: ' + ([regex]::Matches($content, '/hero\.mp4').Count))
