# Test all internal links on the deployed site
$base = "https://9bzdarz53bfr.space.minimax.io"
$links = Get-Content "C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\greenstreet_frontend\internal-links.txt"
$results = @()
foreach ($l in $links) {
    $u = $base + $l
    try {
        $r = Invoke-WebRequest -Uri $u -Method Head -UseBasicParsing -TimeoutSec 20 -ErrorAction Stop
        $results += [PSCustomObject]@{
            Path = $l
            Status = $r.StatusCode
            Type = $r.Headers."Content-Type"
        }
    } catch {
        $code = "ERR"
        if ($_.Exception.Response) {
            $code = [int]$_.Exception.Response.StatusCode
        }
        $results += [PSCustomObject]@{
            Path = $l
            Status = $code
            Type = ""
        }
    }
}
$results | Format-Table -AutoSize -Wrap | Out-String -Width 200
