const fs = require('fs');
const path = require('path');

function walkDir(dir, rootDir) {
    const results = [];
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
        } else if (/\.(jpg|jpeg|png|webp|avif)$/i.test(file)) {
            const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
            const baseName = path.parse(file).name;

            // Extract price from square brackets using regex: [xxx]
            const priceMatch = baseName.match(/\[(.*?)\]/);
            const price = priceMatch ? priceMatch[1] : "Price on Inquiry";

            // Clean name by removing the [price] part
            const cleanName = baseName.replace(/\[.*?\]/, '').trim();

            results.push({
                name: cleanName,
                isDir: false,
                path: 'images/' + relPath,
                price: price
            });
        }
    });
    return results;
}

const root = path.join(process.cwd(), 'images');
const structure = walkDir(root, root);

const manifest = {
    categories: []
};

structure.forEach(cat => {
    if (cat.isDir) {
        const category = {
            name: cat.name,
            subcategories: []
        };

        const hasSubDirs = cat.children.some(child => child.isDir);

        if (hasSubDirs) {
            cat.children.forEach(sub => {
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
            // Flatten if no subdirs
            category.subcategories.push({
                name: "General",
                products: cat.children.filter(c => !c.isDir).map(c => ({
                    name: c.name,
                    image: c.path,
                    price: c.price
                }))
            });
        }
        manifest.categories.push(category);
    }
});

fs.writeFileSync('products.json', JSON.stringify(manifest, null, 4));
console.log('Manifest generated successfully!');
