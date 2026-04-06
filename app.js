document.addEventListener('DOMContentLoaded', () => {
    const navList = document.getElementById('nav-list');
    const productGrid = document.getElementById('product-grid');
    const productsSection = document.getElementById('products-section');
    const contactSection = document.getElementById('contact-us');
    const heroSection = document.getElementById('hero');
    const pagination = document.getElementById('pagination');
    const currentViewTitle = document.getElementById('current-view-title');
    const breadcrumb = document.getElementById('breadcrumb');
    const footerCategories = document.getElementById('footer-categories');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const contactTrigger = document.getElementById('contact-trigger');
    const homeLink = document.getElementById('home-link');

    let allProducts = [];
    let filteredProducts = [];
    let currentPage = 1;
    const itemsPerPage = 16;
    let categories = [];

    // Fetch correctly categorized manifest
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            categories = data.categories;
            // Flatten all products for search functionality
            allProducts = [];
            categories.forEach(cat => {
                cat.subcategories.forEach(sub => {
                    sub.products.forEach(p => {
                        allProducts.push({
                            Path: p.image,
                            BaseName: p.name,
                            price: p.price
                        });
                    });
                });
            });
            renderNav();
            showHomePage();
        })
        .catch(err => {
            console.error('Error loading products:', err);
            productGrid.innerHTML = '<p class="error">Failed to load products. Please try again later.</p>';
        });

    // initializeCategories no longer needed as products.json is pre-categorized

    function renderNav() {
        navList.innerHTML = '';
        footerCategories.innerHTML = '';

        // 1. Always add Home Icon as first item
        const homeLi = document.createElement('li');
        const homeA = document.createElement('a');
        homeA.href = '#';
        // Elegant inline SVG for Home to guarantee visibility
        homeA.innerHTML = '<svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>';
        homeA.title = "Home";
        homeA.addEventListener('click', (e) => {
            e.preventDefault();
            showHomePage();
        });
        homeLi.appendChild(homeA);
        navList.appendChild(homeLi);

        // 2. Clear Nav and Footer to rebuild with specific structure
        navList.innerHTML = '';
        navList.appendChild(homeLi);
        footerCategories.innerHTML = '';

        const navStructure = [
            { 
                name: "Beauty and Personal care", 
                folders: ["Beauty and personal Care"],
                subs: ["Hair Care", "Body Care", "Makeup"] 
            },
            { 
                name: "Accessories", 
                folders: ["Accessories"],
                subs: [] 
            },
            { 
                name: "Clothes", 
                folders: ["Clothes"],
                subs: ["African Wax print", "Dashiki Unisex Shirt"] 
            },
            { 
                name: "Food and Drinks", 
                folders: ["Food Products and Drinks"],
                subs: ["African Food Items", "Beverages", "Drinks", "Snacks", "Spices"] 
            }
        ];

        navStructure.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = item.name;
            
            // Map the display name to the actual filesystem folder if necessary
            const folderName = item.folders[0];
            
            a.addEventListener('click', (e) => {
                e.preventDefault();
                showCategory(folderName);
            });
            li.appendChild(a);

            if (item.subs.length > 0) {
                const dropdown = document.createElement('div');
                dropdown.className = 'nav-dropdown';
                
                item.subs.forEach(subName => {
                    const subA = document.createElement('a');
                    subA.href = '#';
                    subA.textContent = subName;
                    subA.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Internal mapping: "Hair Care" -> "Hare Care" if the folder is named "Hare Care"
                        const actualSubName = subName === "Hair Care" ? "Hare Care" : subName;
                        showSubcategory(folderName, actualSubName);
                    });
                    dropdown.appendChild(subA);
                });
                li.appendChild(dropdown);
            }

            navList.appendChild(li);
            
            // Add to footer too
            const footerLi = document.createElement('li');
            const footerA = document.createElement('a');
            footerA.href = '#';
            footerA.textContent = item.name;
            footerA.addEventListener('click', (e) => {
                e.preventDefault();
                showCategory(folderName);
            });
            footerLi.appendChild(footerA);
            footerCategories.appendChild(footerLi);
        });

        function addToFooter(cat) {
            const footerLi = document.createElement('li');
            const footerA = document.createElement('a');
            footerA.href = '#';
            footerA.textContent = cat.name;
            footerA.addEventListener('click', (e) => {
                e.preventDefault();
                showCategory(cat.name);
            });
            footerLi.appendChild(footerA);
            footerCategories.appendChild(footerLi);
        }
    }

    function showContact() {
        currentPage = 1;
        productsSection.style.display = 'none';
        heroSection.style.display = 'none';
        contactSection.style.display = 'block';
        updateBreadcrumb(["Home", "Contact Us"]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showHomePage() {
        currentPage = 1;
        productsSection.style.display = 'block';
        heroSection.style.display = 'flex';
        contactSection.style.display = 'none';
        const homeCat = categories.find(c => c.name === "Home Page Products");
        if (homeCat) {
            filteredProducts = homeCat.subcategories.flatMap(s => s.products);
            currentViewTitle.textContent = "Featured Products";
            updateBreadcrumb(["Home"]);
        } else {
            filteredProducts = allProducts.slice(0, 32); 
            currentViewTitle.textContent = "All Products";
            updateBreadcrumb(["Home"]);
        }
        renderProducts();
    }

    function showCategory(catName) {
        currentPage = 1;
        productsSection.style.display = 'block';
        heroSection.style.display = 'none';
        contactSection.style.display = 'none';
        const cat = categories.find(c => c.name === catName);
        if (cat) {
            filteredProducts = cat.subcategories.flatMap(s => s.products);
            currentViewTitle.textContent = catName;
            updateBreadcrumb(["Home", catName]);
            
            if (filteredProducts.length === 0) {
                productGrid.innerHTML = '<div class="empty-state">Products adding soon...</div>';
                pagination.innerHTML = '';
                return;
            }
        }
        renderProducts();
    }

    function showSubcategory(catName, subName) {
        currentPage = 1;
        productsSection.style.display = 'block';
        heroSection.style.display = 'none';
        contactSection.style.display = 'none';
        
        const cat = categories.find(c => c.name === catName);
        const sub = cat ? cat.subcategories.find(s => s.name === subName) : null;
        
        const displaySubName = subName === "Hare Care" ? "Hair Care" : subName;
        currentViewTitle.textContent = displaySubName;
        updateBreadcrumb(["Home", catName, displaySubName]);

        if (sub && sub.products.length > 0) {
            filteredProducts = sub.products;
            renderProducts();
        } else {
            filteredProducts = [];
            productGrid.innerHTML = '<div class="empty-state">Products adding soon...</div>';
            pagination.innerHTML = '';
        }
    }

    function updateBreadcrumb(parts) {
        breadcrumb.innerHTML = '';
        parts.forEach((part, index) => {
            const span = document.createElement('span');
            span.textContent = part;
            if (index === 0) {
                span.addEventListener('click', showHomePage);
            } else if (index === 1) {
                span.addEventListener('click', () => showCategory(parts[1]));
            }
            breadcrumb.appendChild(span);
            if (index < parts.length - 1) {
                breadcrumb.appendChild(document.createTextNode(' > '));
            }
        });
    }

    function renderProducts() {
        productGrid.innerHTML = '';
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = filteredProducts.slice(start, end);

        if (pageItems.length === 0) {
            productGrid.innerHTML = '<div class="empty-state">No products found.</div>';
            return;
        }

        pageItems.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // Safe property access for both old and new manifest formats
            const imageSrc = product.image || product.Path || "";
            const originalName = product.name || product.BaseName || "Unnamed Product";
            const currentPath = product.Path || product.image || "";

            const img = document.createElement('img');
            img.className = 'product-image';
            // Robustly encode the image path to handle spaces, brackets and special characters
            const encodedPath = imageSrc.split('/').map(segment => encodeURIComponent(segment)).join('/');
            img.src = encodedPath;
            img.alt = originalName;
            img.loading = 'lazy';
            
            const title = document.createElement('div');
            title.className = 'product-title';
            
            // Extract price from filename if present, otherwise use manifest price
            let displayPrice = product.price || "Price on Inquiry";
            let displayName = originalName;

            const priceMatch = originalName.match(/\[(.*?)\]/);
            if (priceMatch) {
                const priceVal = priceMatch[1];
                displayPrice = /^\d+$/.test(priceVal) ? `₹${priceVal}` : priceVal;
                displayName = originalName.replace(/\[.*?\]/, '').trim();
            }
            
            title.textContent = displayName;
            
            const priceDiv = document.createElement('div');
            priceDiv.className = 'product-price';
            priceDiv.textContent = displayPrice;
            
            const waBtn = document.createElement('a');
            waBtn.className = 'whatsapp-btn';
            const message = encodeURIComponent(`wanted to order this product: ${displayName} (Price: ${displayPrice})`);
            waBtn.href = `https://wa.me/918700304308?text=${message}`;
            waBtn.target = '_blank';
            waBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Order on WhatsApp';
            
            card.appendChild(img);
            card.appendChild(title);
            card.appendChild(priceDiv);
            card.appendChild(waBtn);
            
            productGrid.appendChild(card);
        });

        renderPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function renderPagination() {
        pagination.innerHTML = '';
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        
        if (totalPages <= 1) return;

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            if (i === currentPage) btn.className = 'active';
            btn.addEventListener('click', () => {
                currentPage = i;
                renderProducts();
            });
            pagination.appendChild(btn);
        }
    }

    // Search functionality
    function handleSearch() {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) return;
        
        productsSection.style.display = 'block';
        heroSection.style.display = 'none';
        contactSection.style.display = 'none';
        currentPage = 1;
        filteredProducts = allProducts.filter(p => 
            p.BaseName.toLowerCase().includes(query) || 
            p.Path.toLowerCase().includes(query)
        );
        currentViewTitle.textContent = `Search results for "${query}"`;
        updateBreadcrumb(["Home", "Search"]);
        renderProducts();
    }

    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    contactTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        showContact();
    });

    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        showHomePage();
    });
});
