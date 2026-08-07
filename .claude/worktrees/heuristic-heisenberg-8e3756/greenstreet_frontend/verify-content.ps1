$rootIndex = 'C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\greenstreet_frontend\index.html'
$distIndex = 'C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\greenstreet_frontend\dist\index.html'

Write-Output '=== ROOT index.html stats ==='
$rc = [System.IO.File]::ReadAllText($rootIndex)
Write-Output ('Size: ' + (Get-Item $rootIndex).Length)
Write-Output ('greenboard URLs: ' + ([regex]::Matches($rc, 'cdn\.jsdelivr\.net/gh/SamCharpentier/greenboard').Count))
Write-Output ('greenstreet CDN URLs (broken): ' + ([regex]::Matches($rc, 'cdn\.jsdelivr\.net/gh/SamCharpentier/greenstreet').Count))
Write-Output ('/security.html links: ' + ([regex]::Matches($rc, 'href="/security\.html"').Count))
Write-Output ('trust.greenstreet.com links: ' + ([regex]::Matches($rc, 'trust\.greenstreet\.com').Count))
Write-Output ('placeholder imgs: ' + ([regex]::Matches($rc, 'placeholder\.60f9b1840c').Count))
Write-Output ('hero.mp4 refs: ' + ([regex]::Matches($rc, '/hero\.mp4').Count))
Write-Output ('First script src tag: ' + ([regex]::Match($rc, '<script[^>]*src=[^>]*>') | Select-Object -First 1).Value)
Write-Output ('Has #root div: ' + $rc.Contains('<div id="root">'))
Write-Output ('Has dangerouslySetInnerHTML: ' + $rc.Contains('dangerouslySetInnerHTML'))
Write-Output ('Has cdn.jsdelivr react/vite chunks: ' + $rc.Contains('assets/index-'))

Write-Output ''
Write-Output '=== DIST index.html stats ==='
$dc = [System.IO.File]::ReadAllText($distIndex)
Write-Output ('Size: ' + (Get-Item $distIndex).Length)
Write-Output ('greenboard URLs: ' + ([regex]::Matches($dc, 'cdn\.jsdelivr\.net/gh/SamCharpentier/greenboard').Count))
Write-Output ('greenstreet CDN URLs (broken): ' + ([regex]::Matches($dc, 'cdn\.jsdelivr\.net/gh/SamCharpentier/greenstreet').Count))
Write-Output ('/security.html links: ' + ([regex]::Matches($dc, 'href="/security\.html"').Count))
Write-Output ('trust.greenstreet.com links: ' + ([regex]::Matches($dc, 'trust\.greenstreet\.com').Count))
Write-Output ('placeholder imgs: ' + ([regex]::Matches($dc, 'placeholder\.60f9b1840c').Count))
Write-Output ('hero.mp4 refs: ' + ([regex]::Matches($dc, '/hero\.mp4').Count))
Write-Output ('First script src tag: ' + ([regex]::Match($dc, '<script[^>]*src=[^>]*>') | Select-Object -First 1).Value)
Write-Output ('Has #root div: ' + $dc.Contains('<div id="root">'))
Write-Output ('Has dangerouslySetInnerHTML: ' + $dc.Contains('dangerouslySetInnerHTML'))
Write-Output ('Has cdn.jsdelivr react/vite chunks: ' + $dc.Contains('assets/index-'))

Write-Output ''
Write-Output '=== Files identical? ==='
$rootHash = (Get-FileHash $rootIndex -Algorithm SHA256).Hash
$distHash = (Get-FileHash $distIndex -Algorithm SHA256).Hash
Write-Output ('Root hash: ' + $rootHash)
Write-Output ('Dist hash: ' + $distHash)
Write-Output ('Identical: ' + ($rootHash -eq $distHash))
