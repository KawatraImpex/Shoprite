const fs = require('fs');
const path = require('path');

function walkDir(dir, rootDir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            results.push({
                name: file,
                isDir: true,
                children: walkDir(filePath, rootDir)
            });
        } else if (/\.(jpg|jpeg|png|webp|avif|mp4|webm)$/i.test(file)) {
            const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
            const baseName = path.parse(file).name;

            // Extract price from square brackets using regex: [xxx]
            const priceMatch = baseName.match(/\[(.*?)\]/);
            const price = priceMatch ? priceMatch[1] : "Price on Inquiry";

            // Clean name by removing the [price] part
            const cleanName = baseName.replace(/\[.*?\]/, '').replace(/\[link--.*?\]/, '').trim();

            results.push({
                name: cleanName,
                isDir: false,
                path: 'images/' + relPath,
                price: price,
                originalName: baseName
            });
        }
    });
    return results;
}

const root = path.join(process.cwd(), 'images');
const manifest = {
    categories: [],
    gallery: []
};

// Handle Gallery separately
const galleryPath = path.join(root, 'Gallery');
if (fs.existsSync(galleryPath)) {
    const galleryFiles = fs.readdirSync(galleryPath);
    galleryFiles.forEach(file => {
        if (/\.(jpg|jpeg|png|webp|avif|mp4|webm)$/i.test(file)) {
            const baseName = path.parse(file).name;
            const linkMatch = baseName.match(/\[link--(.*?)--(.*?)\]/);
            let link = "";
            if (linkMatch) {
                link = `https://www.instagram.com/${linkMatch[1]}/${linkMatch[2]}/`;
            }
            manifest.gallery.push({
                image: 'images/Gallery/' + file,
                link: link
            });
        }
    });
}

// Handle Categories
const list = fs.readdirSync(root);
list.forEach(catName => {
    const catPath = path.join(root, catName);
    const stat = fs.statSync(catPath);
    if (!stat.isDirectory() || catName === 'Gallery' || catName === 'Home Page Products') return;

    const category = {
        name: catName,
        subcategories: []
    };

    const children = walkDir(catPath, root);
    const hasSubDirs = children.some(child => child.isDir);

    if (hasSubDirs) {
        children.forEach(sub => {
            if (sub.isDir) {
                category.subcategories.push({
                    name: sub.name,
                    products: sub.children.filter(c => !c.isDir).map(c => ({
                        name: c.name,
                        image: c.path,
                        price: c.price
                    }))
                });
            }
        });
    } else {
        category.subcategories.push({
            name: "General",
            products: children.filter(c => !c.isDir).map(c => ({
                name: c.name,
                image: c.path,
                price: c.price
            }))
        });
    }
    manifest.categories.push(category);
});

fs.writeFileSync('products.json', JSON.stringify(manifest, null, 4));
console.log('Manifest generated successfully with Gallery support!');
