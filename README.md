# ShopRite - African Boutique Website

ShopRite is a modern, static e-commerce website designed for listing local products, specializing in **African Food Items**, **Accessories**, **Clothing**, and **Beauty Products**.

## 🚀 Features
- **Dynamic Product Rendering**: Automatically generates product listings from your image folders.
- **Selective Pricing**: Extracts prices directly from filenames for Food Items (e.g., `Yam Flour [500].jpg` shows **₹500**).
- **Responsive Navigation**: Categorized dropdowns and a smooth, modern UI.
- **Direct Ordering**: "Order on WhatsApp" button for every product.
- **Fast Search**: Instant search functionality across all categories.

## 🛠️ Maintenance & Pricing
To add new products or update prices:
1.  Add/Rename images in the `images/` folder.
2.  For Food Items, put the price in square brackets at the end: `Item Name [Price].jpg`.
3.  Run the manifest generator:
    ```powershell
    powershell -ExecutionPolicy Bypass -File ./generate_manifest.ps1
    ```

## 💻 Local Development
To preview the site locally, run the provided server:
1.  Run `./serve.ps1` in PowerShell.
2.  Open [http://localhost:8081/](http://localhost:8081/).

---
&copy; 2026 ShopRite. All rights reserved.
