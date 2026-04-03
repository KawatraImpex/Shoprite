param($port = 8081)
$hostName = "localhost"
$url = "http://$($hostName):$($port)/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
$listener.Start()
Write-Host "Listening on $url"
try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/") { $localPath = "/index.html" }
        $filePath = Join-Path (Get-Location) $localPath.TrimStart('/')
        
        if (Test-Path -LiteralPath $filePath -PathType Leaf) {
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mimeType = switch ($extension) {
                ".html" { "text/html" }
                ".css"  { "text/css" }
                ".js"   { "application/javascript" }
                ".json" { "application/json" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".webp" { "image/webp" }
                ".avif" { "image/avif" }
                default { "application/octet-stream" }
            }
            $response.Headers.Add("Content-Type", $mimeType)
            $buffer = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            $response.StatusCode = 404
            $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 - Not Found")
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
