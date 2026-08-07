# Test all external URLs from deployed HTML
$urls = Get-Content "C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\greenstreet_frontend\extracted-urls.txt"
$results = @()
foreach ($u in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $u -Method Head -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        $results += [PSCustomObject]@{
            Url = $u
            Status = $r.StatusCode
            Type = $r.Headers."Content-Type"
            Size = $r.Headers."Content-Length"
        }
    } catch {
        $code = "ERR"
        if ($_.Exception.Response) {
            $code = [int]$_.Exception.Response.StatusCode
        }
        $results += [PSCustomObject]@{
            Url = $u
            Status = $code
            Type = ""
            Size = ""
        }
    }
}
$results | Export-Csv -Path "C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\greenstreet_frontend\external-results.csv" -NoTypeInformation -Encoding UTF8
$results | Format-Table -AutoSize -Wrap | Out-String -Width 200
