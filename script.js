document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración y Estado (FIREBASE)
    let siteSettings = { 
        heroTitle: 'Elegancia para Cada Momento', 
        whatsapp: '3464590442', 
        heroDesc: 'Moda exclusiva para toda la familia.',
        alias: '',
        cbu: '',
        mpToken: ''
    };

    let shopProducts = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || []; // El carrito sigue siendo local al usuario
    let currentGender = 'all', currentSub = 'all', searchQuery = '';
    let currentPage = 1, itemsPerPage = 12;
    let selectedSize = null, currentProductId = null;

    const shopGrid = document.getElementById('shop-grid');
    const galleryModal = document.getElementById('gallery-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    const modalQtyVal = document.getElementById('modal-qty-val');
    const cartCount = document.querySelector('.cart-count');

    // --- 2. RENDERIZADO DE TIENDA ---
    const renderProducts = () => {
        if (!shopGrid) return;
        let filtered = shopProducts;
        if (currentGender !== 'all') filtered = filtered.filter(p => p.gender === currentGender);
        if (currentSub !== 'all') filtered = filtered.filter(p => p.subcategory === currentSub);
        if (searchQuery.trim() !== '') filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
        const visible = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
        
        const pagContainer = document.getElementById('pagination-container');
        if (pagContainer) {
            pagContainer.style.display = filtered.length > itemsPerPage ? 'flex' : 'none';
            document.getElementById('page-info').textContent = `Página ${currentPage} de ${totalPages}`;
        }

        shopGrid.innerHTML = visible.map(p => `
            <article class="product-card" data-id="${p.id}">
                <div class="product-img-wrapper">
                    <img src="${p.images && p.images[0] ? p.images[0] : ''}" alt="${p.name}" class="product-img">
                    <button class="view-details-btn"><i class="ph ph-eye"></i> Ver Detalles</button>
                </div>
                <div class="product-info">
                    <span class="category">${p.gender} | ${p.subcategory}</span>
                    <h3>${p.name}</h3>
                    <span class="price">$${(p.price || 0).toLocaleString('es-AR')}</span>
                </div>
            </article>
        `).join('');

        document.querySelectorAll('.product-card').forEach(card => {
            const openFn = () => openGallery(parseInt(card.dataset.id));
            const img = card.querySelector('.product-img');
            const btn = card.querySelector('.view-details-btn');
            if (img) img.onclick = openFn;
            if (btn) btn.onclick = openFn;
        });
    };

    // --- 3. MODAL DE DETALLES ---
    const closeGalleryBtn = document.querySelector('.close-modal');
    if (closeGalleryBtn) closeGalleryBtn.onclick = () => galleryModal.classList.remove('show');
    
    // Cerrar modal al hacer click afuera
    window.onclick = (e) => { if (e.target === galleryModal) galleryModal.classList.remove('show'); };

    window.openGallery = (id) => {
        const p = shopProducts.find(x => x.id === id);
        if (!p) return;
        currentProductId = id; selectedSize = null;
        if (modalQtyVal) modalQtyVal.textContent = "1";
        document.getElementById('modal-product-name').textContent = p.name;
        document.getElementById('modal-product-price').textContent = `$${(p.price || 0).toLocaleString('es-AR')}`;
        
        const main = document.getElementById('modal-img');
        if (main) main.src = p.images[0];
        const thumbs = document.getElementById('modal-thumbnails');
        if (thumbs) thumbs.innerHTML = p.images.map((src, i) => `<img src="${src}" class="${i===0?'active':''}" onclick="window.changeImg(${i})">`).join('');
        
        window.changeImg = (i) => { if(main) main.src = p.images[i]; document.querySelectorAll('.modal-thumbnails img').forEach((t, idx) => t.classList.toggle('active', idx === i)); };
        
        const sCont = document.getElementById('modal-sizes');
        if (sCont && p.sizes && p.sizes.length > 0) {
            sCont.innerHTML = p.sizes.map(s => {
                const stock = p.stockMap ? (p.stockMap[s] || 0) : 0;
                const disabled = stock <= 0 ? 'disabled' : '';
                return `<div class="chip ${selectedSize===s?'active':''} ${disabled}" onclick="${stock > 0 ? `window.selectSize('${s}')` : ''}">${s}</div>`;
            }).join('');
        } else if (sCont) {
            sCont.innerHTML = '<span style="opacity:0.5">Talle Único</span>';
        }

        updateStockDisplay();
        galleryModal.classList.add('show');
    };

    const updateStockDisplay = () => {
        const p = shopProducts.find(x => x.id === currentProductId);
        const display = document.getElementById('modal-stock-display');
        const addBtn = document.getElementById('modal-add-to-cart');
        if (!p || !display) return;

        let available = 0;
        if (p.sizes && p.sizes.length > 0) {
            if (selectedSize) {
                available = p.stockMap ? (p.stockMap[selectedSize] || 0) : 0;
                display.textContent = `${available} unidades disponibles de talle ${selectedSize}`;
            } else {
                available = Object.values(p.stockMap || {}).reduce((a, b) => a + b, 0);
                display.textContent = 'Por favor selecciona un talle';
            }
        } else {
            available = p.stock || 0;
            display.textContent = `${available} unidades disponibles`;
        }

        if (addBtn) addBtn.disabled = available <= 0;
        if (available <= 0) display.textContent = "¡Agotado!";
        
        // Ajustar cantidad si excede el stock
        let currentQty = parseInt(modalQtyVal.textContent);
        if (currentQty > available && available > 0) modalQtyVal.textContent = available;
        else if (available <= 0) modalQtyVal.textContent = 0;
        else if (currentQty <= 0 && available > 0) modalQtyVal.textContent = 1;
    };

    window.selectSize = (s) => { 
        selectedSize = (selectedSize === s ? null : s); 
        document.getElementById('modal-sizes').querySelectorAll('.chip').forEach(c => {
            c.classList.toggle('active', c.innerText === selectedSize);
        });
        updateStockDisplay();
    };

    // --- 4. CARRITO ---
    const updateCartUI = () => {
        const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
        if (cartCount) cartCount.textContent = totalQty;
        localStorage.setItem('cart', JSON.stringify(cart));
        
        const cont = document.querySelector('.cart-items');
        const empty = document.querySelector('.empty-cart');
        if (!cont) return;

        if (cart.length === 0) {
            if(empty) empty.style.display = 'block';
            cont.innerHTML = '';
            const tPrice = document.getElementById('total-price');
            if (tPrice) tPrice.textContent = '$0';
        } else {
            if(empty) empty.style.display = 'none';
            cont.innerHTML = cart.map((item, i) => `
                <div class="cart-item">
                    <img src="${item.image}">
                    <div style="flex:1"><h4>${item.name}</h4><small>Talle: ${item.size}</small><p>$${item.price.toLocaleString()} x ${item.quantity}</p></div>
                    <button onclick="window.removeItem(${i})" style="background:none;border:none;color:red;cursor:pointer"><i class="ph ph-trash"></i></button>
                </div>
            `).join('');
            const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
            const tPrice = document.getElementById('total-price');
            if (tPrice) tPrice.textContent = `$${total.toLocaleString()}`;
        }
    };

    window.removeItem = (i) => { cart.splice(i, 1); updateCartUI(); };

    const addBtn = document.getElementById('modal-add-to-cart');
    if (addBtn) {
        addBtn.onclick = () => {
            const p = shopProducts.find(x => x.id === currentProductId);
            if (p.sizes && p.sizes.length > 0 && !selectedSize) return alert('Por favor seleccioná un talle');
            
            const qtyToAdd = parseInt(modalQtyVal.textContent);
            if (qtyToAdd <= 0) return alert('La cantidad debe ser al menos 1');

            // Verificar stock disponible considerando lo que ya hay en el carrito
            const cartItem = cart.find(i => i.id === p.id && i.size === (selectedSize || 'Único'));
            const currentInCart = cartItem ? cartItem.quantity : 0;
            
            let available = p.sizes && p.sizes.length > 0 ? (p.stockMap[selectedSize] || 0) : (p.stock || 0);
            
            if (currentInCart + qtyToAdd > available) {
                return alert(`No hay suficiente stock. Ya tienes ${currentInCart} en el carrito y el máximo disponible es ${available}.`);
            }

            if (cartItem) {
                cartItem.quantity += qtyToAdd;
            } else {
                cart.push({ id: p.id, name: p.name, price: p.price, image: p.images[0], size: selectedSize || 'Único', quantity: qtyToAdd });
            }

            updateCartUI(); galleryModal.classList.remove('show');
            const toast = document.getElementById('toast');
            if (toast) { toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); }
        };
    }

    // --- 5. CHECKOUT Y PAGOS (CORREGIDO) ---
    const openCheckout = () => {
        if (cart.length === 0) return alert('Tu carrito está vacío');
        document.getElementById('cart-drawer').classList.remove('open');
        document.getElementById('cart-overlay').classList.remove('show');
        
        const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
        document.getElementById('check-subtotal').textContent = `$${total.toLocaleString()}`;
        document.getElementById('check-total').textContent = `$${total.toLocaleString()}`;
        
        document.getElementById('checkout-items').innerHTML = cart.map(i => `
            <div style="display:flex; justify-content:space-between; margin-bottom:0.8rem; font-size:0.85rem; border-bottom: 1px solid #eee; padding-bottom: 0.4rem;">
                <span>${i.name} (${i.size}) x${i.quantity}</span>
                <span style="font-weight:600">$${(i.price * i.quantity).toLocaleString()}</span>
            </div>
        `).join('');
        
        checkoutModal.classList.add('show');
    };

    const confirmBtn = document.getElementById('confirm-order');
    if (confirmBtn) confirmBtn.onclick = openCheckout;

    const closeCheckout = document.getElementById('close-checkout');
    if (closeCheckout) closeCheckout.onclick = () => checkoutModal.classList.remove('show');

    const payBtn = document.getElementById('pay-button');
    if (payBtn) {
        payBtn.onclick = async () => {
            const name = document.getElementById('cust-name').value;
            const phone = document.getElementById('cust-phone').value;
            const address = document.getElementById('cust-address').value;
            const city = document.getElementById('cust-city').value;
            
            const paymentInput = document.querySelector('input[name="payment"]:checked');
            const payment = paymentInput ? paymentInput.value : 'transferencia';

            if (!name || !phone || !address || !city) return alert('Por favor, completá todos tus datos de envío.');

            // --- DEDUCIR STOCK EN FIREBASE ---
            const batch = db.batch();
            cart.forEach(item => {
                const pRef = db.collection('products').doc(String(item.id));
                const p = shopProducts.find(x => x.id === item.id);
                if (p) {
                    if (p.sizes && p.sizes.length > 0) {
                        const newStockMap = { ...p.stockMap };
                        if (newStockMap[item.size]) newStockMap[item.size] -= item.quantity;
                        batch.update(pRef, { stockMap: newStockMap });
                    } else {
                        batch.update(pRef, { stock: firebase.firestore.FieldValue.increment(-item.quantity) });
                    }
                }
            });
            await batch.commit();
            // ----------------------------------

            const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
            
            if (payment === 'mercadopago') {
                alert('⏳ Redirigiendo a Mercado Pago Seguro...');
                cart = []; updateCartUI(); // Vaciar carrito
                window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=SIMULADO_EM_${Date.now()}`;
            } else {
                let msg = `🛍️ *NUEVO PEDIDO (TRANSFERENCIA)*\n` +
                          `--------------------------\n` +
                          `👤 *Cliente:* ${name}\n` +
                          `📍 *Envío:* ${address}, ${city}\n` +
                          `📱 *Tel:* ${phone}\n\n` +
                          `📦 *Detalle:* \n` + cart.map(i => `- ${i.name} (${i.size}) x${i.quantity}`).join('\n') +
                          `\n\n💰 *TOTAL: $${total.toLocaleString()}*\n\n` +
                          `🏦 *Datos para pagar:* \n` +
                          `*Alias:* ${siteSettings.alias || 'No configurado'}\n` +
                          `*CBU:* ${siteSettings.cbu || 'No configurado'}\n` +
                          `--------------------------\n` +
                          `Por favor, enviame una captura del comprobante por aquí.`;
                
                window.open(`https://wa.me/${siteSettings.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
                cart = []; updateCartUI(); // Vaciar carrito
                checkoutModal.classList.remove('show');
            }
        };
    }

    // 6. Otros Eventos
    const qMinus = document.getElementById('modal-qty-minus');
    const qPlus = document.getElementById('modal-qty-plus');
    if (qMinus) qMinus.onclick = () => { 
        let v = parseInt(modalQtyVal.textContent); 
        if(v > 1) {
            modalQtyVal.textContent = v - 1;
            updateStockDisplay();
        }
    };
    if (qPlus) qPlus.onclick = () => { 
        let v = parseInt(modalQtyVal.textContent); 
        const p = shopProducts.find(x => x.id === currentProductId);
        let available = 0;
        if (p.sizes && p.sizes.length > 0) {
            available = selectedSize ? (p.stockMap[selectedSize] || 0) : 0;
        } else {
            available = p.stock || 0;
        }
        if (v < available) {
            modalQtyVal.textContent = v + 1;
            updateStockDisplay();
        }
    };

    document.querySelectorAll('.gender-btn').forEach(b => b.onclick = () => { 
        document.querySelector('.gender-btn.active').classList.remove('active'); 
        b.classList.add('active'); 
        currentGender = b.dataset.gender; 
        currentPage = 1; 
        renderProducts(); 
    });

    document.querySelectorAll('.sub-filter-btn').forEach(b => b.onclick = () => { 
        document.querySelector('.sub-filter-btn.active').classList.remove('active'); 
        b.classList.add('active'); 
        currentSub = b.dataset.sub; 
        currentPage = 1; 
        renderProducts(); 
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.oninput = (e) => {
            searchQuery = e.target.value;
            currentPage = 1;
            renderProducts();
        };
    }

    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    if (prevBtn) prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderProducts(); } };
    if (nextBtn) nextBtn.onclick = () => { 
        let filtered = shopProducts;
        if (currentGender !== 'all') filtered = filtered.filter(p => p.gender === currentGender);
        if (currentSub !== 'all') filtered = filtered.filter(p => p.subcategory === currentSub);
        if (searchQuery.trim() !== '') filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
        if (currentPage < totalPages) { currentPage++; renderProducts(); } 
    };

    const cartOpener = document.querySelector('.cart-btn');
    if (cartOpener) cartOpener.onclick = () => { document.getElementById('cart-drawer').classList.add('open'); document.getElementById('cart-overlay').classList.add('show'); };
    const cartCloser = document.getElementById('close-cart');
    if (cartCloser) cartCloser.onclick = () => { document.getElementById('cart-drawer').classList.remove('open'); document.getElementById('cart-overlay').classList.remove('show'); };
    
    // --- 7. CARGA INICIAL DESDE FIREBASE ---
    const loadFromFirebase = () => {
        // Cargar Ajustes
        db.collection('settings').doc('main').onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                Object.assign(siteSettings, data);
                // Actualizar UI si es necesario (Hero, etc.)
                if (document.querySelector('.hero h1')) document.querySelector('.hero h1').innerHTML = siteSettings.heroTitle.replace('\n', '<br>');
                if (document.querySelector('.hero p')) document.querySelector('.hero p').textContent = siteSettings.heroDesc;
            }
        });

        // Cargar Productos (Real-time)
        db.collection('products').onSnapshot((snapshot) => {
            shopProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderProducts();
        });
    };

    loadFromFirebase(); updateCartUI();
});
