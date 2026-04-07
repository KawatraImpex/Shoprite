$root = "images"
$manifest = @{
    categories = @()
    gallery    = @()
}

$categories = Get-ChildItem -Path $root -Directory
foreach ($catDir in $categories) {
    if ($catDir.Name -eq "Home Page Products") { continue }
    
    # Handle Gallery separately
    if ($catDir.Name -eq "Gallery") {
        $files = Get-ChildItem -Path $catDir.FullName -File -Filter *.* | Where-Object { $_.Extension -match "jpg|jpeg|png|webp|avif|mp4|webm" }
        foreach ($file in $files) {
            $baseName = $file.BaseName
            # Parse link if present: [link--type--id]
            $linkMatch = [regex]::Match($baseName, '\[link--(.*?)--(.*?)\]')
            $link = if ($linkMatch.Success) { "https://www.instagram.com/$($linkMatch.Groups[1].Value)/$($linkMatch.Groups[2].Value)/" } else { "" }
            
            $manifest.gallery += @{
                image = "images/Gallery/$($file.Name)"
                link  = $link
            }
        }
        continue
    }
    
    $category = @{
        name          = $catDir.Name
        subcategories = @()
    }
    
    $subDirs = Get-ChildItem -Path $catDir.FullName -Directory
    if ($subDirs.Count -gt 0) {
        foreach ($subDir in $subDirs) {
            $products = @()
            $files = Get-ChildItem -Path $subDir.FullName -File -Filter *.* | Where-Object { $_.Extension -match "jpg|jpeg|png|webp|avif" }
            foreach ($file in $files) {
                $baseName = $file.BaseName
                $priceMatch = [regex]::Match($baseName, '\[(.*?)\]')
                $price = if ($priceMatch.Success) { $priceMatch.Groups[1].Value } else { "Price on Inquiry" }
                $cleanName = $baseName -replace '\[.*?\]', ''
                $cleanName = $cleanName.Trim()
                
                $products += @{
                    name  = $cleanName
                    image = "images/$($catDir.Name)/$($subDir.Name)/$($file.Name)"
                    price = $price
                }
            }
            $category.subcategories += @{
                name     = $subDir.Name
                products = $products
            }
        }
    }
    else {
        $products = @()
        $files = Get-ChildItem -Path $catDir.FullName -File -Filter *.* | Where-Object { $_.Extension -match "jpg|jpeg|png|webp|avif" }
        foreach ($file in $files) {
            $baseName = $file.BaseName
            $priceMatch = [regex]::Match($baseName, '\[(.*?)\]')
            $price = if ($priceMatch.Success) { $priceMatch.Groups[1].Value } else { "Price on Inquiry" }
            $cleanName = $baseName -replace '\[.*?\]', ''
            $cleanName = $cleanName.Trim()
            
            $products += @{
                name  = $cleanName
                image = "images/$($catDir.Name)/$($file.Name)"
                price = $price
            }
        }
        $category.subcategories += @{
            name     = "General"
            products = $products
        }
    }
    $manifest.categories += $category
}

$manifest | ConvertTo-Json -Depth 10 | Out-File -FilePath "products.json" -Encoding utf8
Write-Host "Manifest generated successfully with Gallery images!"
