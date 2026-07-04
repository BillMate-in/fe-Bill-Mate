

document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.flex.gap-sm button');

    filterButtons.forEach(button => {
        // SAFEGUARD: Mencegah tombol fungsional utama agar tidak ikut terpengaruh oleh logika visual filter pill
        if (
            button.id === 'btnAddItem' || 
            button.id === 'btnJoinFake' || 
            button.id === 'lockRoomBtn'
        ) {
            return; 
        }

        button.addEventListener('click', () => {
            filterButtons.forEach(btn => {
                if (btn.id === 'btnAddItem' || btn.id === 'btnJoinFake' || btn.id === 'lockRoomBtn') return;
                btn.classList.remove('active-pill');
                btn.classList.add(
                    'bg-surface-container-lowest',
                    'border',
                    'border-surface-variant',
                    'text-secondary'
                );
            });

            button.classList.add('active-pill');
            button.classList.remove(
                'bg-surface-container-lowest',
                'border',
                'border-surface-variant',
                'text-secondary'
            );
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    
    const lockRoomBtn = document.getElementById('lockRoomBtn');
    const btnJoinFake = document.getElementById('btnJoinFake');
    const userInputSelect = document.getElementById('userInput');
    const btnAddItem = document.getElementById('btnAddItem');
    const foodInput = document.getElementById('foodInput');
    const priceInput = document.getElementById('priceInput');
    const qtyInput = document.getElementById('qtyInput');
    const itemList = document.getElementById('itemList');

    if (!lockRoomBtn) return;

    // Set nama restoran di judul utama room dari sessionStorage
    const roomTitle = document.getElementById('roomTitle');
    if (roomTitle) {
        const savedResto = sessionStorage.getItem('restaurantName') || 'restaurant(?)';
        roomTitle.textContent = `Room - ${savedResto}`;
    }

    // Default Host otomatis masuk ke dropdown saat halaman dimuat pertama kali
    if (userInputSelect && userInputSelect.options.length === 0) {
        const hostName = sessionStorage.getItem('hostName') || 'Host';
        const defaultOption = new Option(hostName, hostName);
        userInputSelect.add(defaultOption);
    }

    if (btnJoinFake && userInputSelect) {
        btnJoinFake.addEventListener('click', (e) => {
            e.preventDefault(); // Mencegah reload halaman

            const newMemberName = prompt('Masukkan nama anggota baru:');
            if (!newMemberName || newMemberName.trim() === '') return;
            const trimmedName = newMemberName.trim();

            // Validasi duplikasi: Mencegah nama yang sama dimasukkan dua kali
            const existingMembers = Array.from(userInputSelect.options).map(opt => opt.value.toLowerCase());
            if (existingMembers.includes(trimmedName.toLowerCase())) {
                alert('Nama anggota tersebut sudah ada di dalam room!');
                return;
            }

            const option = new Option(trimmedName, trimmedName);
            userInputSelect.add(option);
            userInputSelect.value = trimmedName; 
        });
    }

    function recalculateLocalTotals() {
        let totalBaseCost = 0;

        const itemCards = document.querySelectorAll('#itemList > .item-card');
        itemCards.forEach(card => {
            const price = parseFloat(card.getAttribute('data-price') || 0);
            const qty = parseInt(card.getAttribute('data-qty') || 1);
            totalBaseCost += (price * qty);
        });

        const taxPercent = parseFloat(document.getElementById('taxInput').value) || 0;
        const discount = parseFloat(document.getElementById('discountInput').value) || 0;
        const extraFees = parseFloat(document.getElementById('extraFee').value) || 0;

        const taxAmount = totalBaseCost * (taxPercent / 100);
        const grandTotal = totalBaseCost + taxAmount - discount + extraFees;

        document.getElementById('subtotal').textContent = `Rp ${totalBaseCost.toLocaleString('id-ID')}`;
        document.getElementById('tax').textContent = `Rp ${taxAmount.toLocaleString('id-ID')}`;
        document.getElementById('fees').textContent = `Rp ${extraFees.toLocaleString('id-ID')}`;
        document.getElementById('grandTotal').textContent = `Rp ${Math.max(0, grandTotal).toLocaleString('id-ID')}`;

window.recalculateLocalTotals = recalculateLocalTotals;
    }

    ['taxInput', 'discountInput', 'extraFee'].forEach(id => {
        const inputElement = document.getElementById(id);
        if (inputElement) {
            inputElement.addEventListener('input', recalculateLocalTotals);
        }
    });

  
    if (btnAddItem && foodInput && priceInput && qtyInput && itemList) {
        btnAddItem.addEventListener('click', (e) => {
            e.preventDefault();

            const foodName = foodInput.value.trim();
            const foodPrice = parseFloat(priceInput.value) || 0;
            const foodQty = parseInt(qtyInput.value) || 1;
            const foodUser = userInputSelect.value;

           
            if (!foodName) {
                alert('Mohon isi nama makanan atau minuman!');
                return;
            }
            if (foodPrice <= 0) {
                alert('Harga satuan harus berupa angka lebih besar dari Rp 0!');
                return;
            }
            if (foodQty <= 0) {
                alert('Kuantitas (Qty) minimal harus bernilai 1!');
                return;
            }
            if (!foodUser) {
                alert('Mohon pilih nama anggota pemesan terlebih dahulu!');
                return;
            }

            const newItemCard = createItemCardElement(foodName, foodPrice, foodQty, foodUser);
            
            itemList.appendChild(newItemCard);

            foodInput.value = '';
            priceInput.value = '';
            qtyInput.value = '1';

            recalculateLocalTotals();

        });
    }

    // ==========================================
    // 6. EVENT LISTENER: KIRIM DATA KE BACKEND LARAVEL (API SERVICE VERSION)
    // ==========================================
    lockRoomBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const restaurantName = sessionStorage.getItem('restaurantName') || 'Restoran Tanpa Nama';
        const hostName = sessionStorage.getItem('hostName') || 'Host';
        const tableNumber = sessionStorage.getItem('tableNumber') || 'Meja Umum';

        const members = Array.from(userInputSelect.options).map(option => option.value);

        if (members.length === 0) {
            alert('Gagal mengunci room. Minimal harus ada 1 anggota di dalam room!');
            return;
        }

        const items = [];
        const itemCards = document.querySelectorAll('#itemList > .item-card');

        itemCards.forEach(card => {
            const name = card.dataset.name || '';
            const price = parseFloat(card.dataset.price || 0);
            const qty = parseInt(card.dataset.qty || 1);
            const user = card.dataset.user || '';

            if (name) {
                items.push({ name, price, qty, user });
            }
        });

        if (items.length === 0) {
            alert('Gagal mengunci room. Harap masukkan minimal 1 menu pesanan!');
            return;
        }

        const taxPercent = parseFloat(document.getElementById('taxInput').value) || 0;
        const discount = parseFloat(document.getElementById('discountInput').value) || 0;
        const extraFees = parseFloat(document.getElementById('extraFee').value) || 0;

        const payload = {
            restaurantName: restaurantName,
            tableNumber: tableNumber,
            hostName: hostName,
            bankName: sessionStorage.getItem('bankName') || '',
            rekening: sessionStorage.getItem('rekening') || '',
            members: members,
            items: items,
            additionalCosts: {
                taxPercent: taxPercent,
                discount: discount,
                extraFees: extraFees
            }
            
        };

        // Mengubah status visual tombol menjadi mode loading
        lockRoomBtn.disabled = true;
        lockRoomBtn.innerHTML = `
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Memproses Perhitungan...</span>
        `;

        try {
            // ==========================================
            // IMPLEMENTASI BARU: Memanggil API Client Abstraksi
            // ==========================================
            // Kita tidak lagi memanggil fetch mentah di sini, melainkan menyerahkannya ke kelas servis global.
            const result = await window.billMateAPI.calculateSplitBill(payload);

            if (result && result.success) {
                // Simpan hasil perhitungan final ke localStorage untuk dicetak di nota.html
                localStorage.setItem('calculatedBill', JSON.stringify(result.data));
                
                // Perbarui database riwayat lokal browser (billHistory)
                const existingHistory = JSON.parse(localStorage.getItem('billHistory') || '[]');
                const billWithTimestamp = { 
                    ...result.data, 
                    timestamp: Math.floor(Date.now() / 1000) 
                };
                
                existingHistory.push(billWithTimestamp);
                localStorage.setItem('billHistory', JSON.stringify(existingHistory));
                
                // KEAMANAN RULE 1: Hapus total session storage agar room aktif tidak bisa dimasuki kembali
                sessionStorage.clear();
                
                // KEAMANAN RULE 2: Gunakan .replace() untuk mencegah pengguna menekan tombol "Back" di browser
                window.location.replace('nota.html');
            } else {
                alert('Gagal menghitung: Format respons server tidak valid.');
                resetLockButton(lockRoomBtn);
            }
        } catch (error) {
            console.error('API Error:', error);
            // Menangkap pesan error dari validasi Laravel (HTTP 422) atau kegagalan jaringan secara terpadu
            alert('Gagal terhubung ke server Laravel: ' + error.message);
            resetLockButton(lockRoomBtn);
        }
    });
});

function resetLockButton(button) {
    button.disabled = false;
    button.innerHTML = `
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">lock</span>
        <span>Selesai & Kunci Room</span>
    `;
}

function createItemCardElement(foodName, foodPrice, foodQty, foodUser) {
    const itemCard = document.createElement('div');
    

    itemCard.className = "item-card flex justify-between items-center bg-surface-container-low p-sm rounded-2xl shadow-sm border border-surface-variant/30";

    itemCard.setAttribute('data-name', foodName);
    itemCard.setAttribute('data-price', foodPrice);
    itemCard.setAttribute('data-qty', foodQty);
    itemCard.setAttribute('data-user', foodUser);
    
    itemCard.innerHTML = `
        <div class="flex items-center gap-sm">
            <span class="material-symbols-outlined text-primary-container bg-primary-fixed/20 p-sm rounded-xl">restaurant</span>
            <div>
                <!-- Menggunakan penanda class khusus agar teks mudah dimanipulasi saat proses EDIT -->
                <h4 class="font-bold text-on-surface text-sm item-name-text">${foodName}</h4>
                <p class="text-xs text-secondary font-medium item-details-text">${foodUser} • Rp ${parseFloat(foodPrice).toLocaleString('id-ID')}</p>
            </div>
        </div>
        <div class="flex items-center gap-md pr-sm">
            <span class="font-extrabold text-primary-container bg-primary-fixed/30 px-md py-sm rounded-xl text-xs item-qty-text">x${foodQty}</span>
            
            <!-- Tombol Aksi Kontrol (Edit & Delete) -->
            <div class="flex items-center gap-xs">
                <button class="btn-edit text-secondary hover:text-primary-container p-xs transition-colors" title="Edit Pesanan">
                    <span class="material-symbols-outlined text-base">edit</span>
                </button>
                <button class="btn-delete text-error hover:text-red-700 p-xs transition-colors" title="Hapus Pesanan">
                    <span class="material-symbols-outlined text-base">delete</span>
                </button>
            </div>
        </div>
    `;

    const deleteBtn = itemCard.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentName = itemCard.getAttribute('data-name');
        
        if (confirm(`Apakah Anda yakin ingin menghapus pesanan "${currentName}"?`)) {
            
            itemCard.remove();

            if (typeof window.recalculateLocalTotals === 'function') {
                window.recalculateLocalTotals();
            }
        }
    });

    const editBtn = itemCard.querySelector('.btn-edit');
    editBtn.addEventListener('click', (e) => {
        e.preventDefault();

        
        const currentName = itemCard.getAttribute('data-name');
        const currentPrice = itemCard.getAttribute('data-price');
        const currentQty = itemCard.getAttribute('data-qty');
        const currentUser = itemCard.getAttribute('data-user');

        const newName = prompt('Ubah nama makanan/minuman:', currentName);
        if (newName === null) return; 
        if (newName.trim() === '') {
            alert('Nama makanan/minuman tidak boleh kosong!');
            return;
        }

        const newPriceRaw = prompt('Ubah harga satuan (Rp):', currentPrice);
        if (newPriceRaw === null) return;
        const newPrice = parseFloat(newPriceRaw) || 0;
        if (newPrice <= 0) {
            alert('Harga satuan harus berupa angka lebih besar dari Rp 0!');
            return;
        }

        const newQtyRaw = prompt('Ubah jumlah pesanan (Qty):', currentQty);
        if (newQtyRaw === null) return;
        const newQty = parseInt(newQtyRaw) || 1;
        if (newQty <= 0) {
            alert('Jumlah pesanan minimal bernilai 1!');
            return;
        }

        itemCard.setAttribute('data-name', newName.trim());
        itemCard.setAttribute('data-price', newPrice);
        itemCard.setAttribute('data-qty', newQty);

        itemCard.querySelector('.item-name-text').textContent = newName.trim();
        itemCard.querySelector('.item-details-text').textContent = `${currentUser} • Rp ${newPrice.toLocaleString('id-ID')}`;
        itemCard.querySelector('.item-qty-text').textContent = `x${newQty}`;

        if (typeof window.recalculateLocalTotals === 'function') {
            window.recalculateLocalTotals();
        }
    });

    return itemCard;
}