

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

    // Event listener untuk edit member button - DIHAPUS KARENA TIDAK DIPERLUKAN

    // =============================================
    // MODAL TAMBAH ANGGOTA
    // =============================================
    const addMemberModal   = document.getElementById('addMemberModal');
    const newMemberInput   = document.getElementById('newMemberInput');
    const memberErrorMsg   = document.getElementById('memberErrorMsg');
    const confirmAddMember = document.getElementById('confirmAddMember');
    const cancelAddMember  = document.getElementById('cancelAddMember');
    const modalBackdrop    = document.getElementById('modalBackdrop');

    function openAddMemberModal() {
        if (!addMemberModal) return;
        newMemberInput.value = '';
        memberErrorMsg.classList.add('hidden');
        memberErrorMsg.textContent = '';
        addMemberModal.classList.remove('hidden');
        // Re-trigger animasi setiap kali modal dibuka
        const card = addMemberModal.querySelector('div[style]');
        if (card) {
            card.style.animation = 'none';
            card.offsetHeight; // reflow
            card.style.animation = '';
        }
        setTimeout(() => newMemberInput.focus(), 50);
    }

    function closeAddMemberModal() {
        if (!addMemberModal) return;
        addMemberModal.classList.add('hidden');
    }

    function confirmAddMemberAction() {
        const trimmedName = newMemberInput.value.trim();

        if (!trimmedName) {
            memberErrorMsg.textContent = 'Nama anggota tidak boleh kosong!';
            memberErrorMsg.classList.remove('hidden');
            newMemberInput.focus();
            return;
        }

        // Validasi duplikasi
        const existingMembers = Array.from(userInputSelect.options).map(opt => opt.value.toLowerCase());
        if (existingMembers.includes(trimmedName.toLowerCase())) {
            memberErrorMsg.textContent = 'Nama anggota tersebut sudah ada di dalam room!';
            memberErrorMsg.classList.remove('hidden');
            newMemberInput.focus();
            return;
        }

        const option = new Option(trimmedName, trimmedName);
        userInputSelect.add(option);
        userInputSelect.value = trimmedName;

        closeAddMemberModal();
        Toast.success('Anggota baru berhasil ditambahkan!');
    }

    if (btnJoinFake) {
        btnJoinFake.addEventListener('click', (e) => {
            e.preventDefault();
            openAddMemberModal();
        });
    }

    if (confirmAddMember) {
        confirmAddMember.addEventListener('click', confirmAddMemberAction);
    }

    if (cancelAddMember) {
        cancelAddMember.addEventListener('click', closeAddMemberModal);
    }

    // Tutup modal saat klik backdrop
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeAddMemberModal);
    }

    // Konfirmasi dengan tombol Enter
    if (newMemberInput) {
        newMemberInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                confirmAddMemberAction();
            }
            // Tutup dengan Escape
            if (e.key === 'Escape') closeAddMemberModal();
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
        
        // Helper function to show error state
        function showInputError(input) {
            input.classList.add('input-error', 'shake-animation');
            setTimeout(() => {
                input.classList.remove('shake-animation');
            }, 500);
        }

        // Helper function to clear error state
        function clearInputError(input) {
            input.classList.remove('input-error');
        }

        // Clear error on input
        [foodInput, priceInput, qtyInput].forEach(input => {
            input.addEventListener('input', () => clearInputError(input));
            input.addEventListener('focus', () => clearInputError(input));
        });
        
        if (userInputSelect) {
            userInputSelect.addEventListener('change', () => clearInputError(userInputSelect));
            userInputSelect.addEventListener('focus', () => clearInputError(userInputSelect));
        }
        
        btnAddItem.addEventListener('click', async (e) => {
            e.preventDefault();

            const foodName = foodInput.value.trim();
            const foodPrice = parseFloat(priceInput.value) || 0;
            const foodQty = parseInt(qtyInput.value) || 1;
            const foodUser = userInputSelect.value;

           
            if (!foodName) {
                showInputError(foodInput);
                await CustomAlert.warning('Mohon isi nama makanan atau minuman!', 'Data Tidak Lengkap');
                foodInput.focus();
                return;
            }
            if (foodPrice <= 0) {
                showInputError(priceInput);
                await CustomAlert.warning('Harga satuan harus berupa angka lebih besar dari Rp 0!', 'Harga Tidak Valid');
                priceInput.focus();
                return;
            }
            if (foodQty <= 0) {
                showInputError(qtyInput);
                await CustomAlert.warning('Kuantitas (Qty) minimal harus bernilai 1!', 'Qty Tidak Valid');
                qtyInput.focus();
                return;
            }
            if (!foodUser) {
                showInputError(userInputSelect);
                await CustomAlert.warning('Mohon pilih nama anggota pemesan terlebih dahulu!', 'Pilih Anggota');
                userInputSelect.focus();
                return;
            }

            const newItemCard = createItemCardElement(foodName, foodPrice, foodQty, foodUser);
            
            itemList.appendChild(newItemCard);

            foodInput.value = '';
            priceInput.value = '';
            qtyInput.value = '1';

            Toast.success('Pesanan berhasil ditambahkan!');
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
            await CustomAlert.error('Gagal mengunci room. Minimal harus ada 1 anggota di dalam room!', 'Tidak Ada Anggota');
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
            await CustomAlert.error('Gagal mengunci room. Harap masukkan minimal 1 menu pesanan!', 'Tidak Ada Pesanan');
            return;
        }

        const confirmed = await CustomAlert.confirm(
            'Setelah dikunci, room tidak bisa diedit lagi. Apakah Anda yakin ingin melanjutkan?',
            'Konfirmasi Kunci Room'
        );
        
        if (!confirmed) return;

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
                
                Toast.success('Room berhasil dikunci! Mengalihkan ke nota...');
                
                setTimeout(() => {
                    // KEAMANAN RULE 2: Gunakan .replace() untuk mencegah pengguna menekan tombol "Back" di browser
                    window.location.replace('nota.html');
                }, 1500);
            } else {
                await CustomAlert.error('Gagal menghitung: Format respons server tidak valid.', 'Error Server');
                resetLockButton(lockRoomBtn);
            }
        } catch (error) {
            console.error('API Error:', error);
            await CustomAlert.error('Gagal terhubung ke server Laravel: ' + error.message, 'Error Koneksi');
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

let _editTargetCard = null;

function openEditItemModal(card) {
    const modal = document.getElementById('editItemModal');
    if (!modal) return;
    _editTargetCard = card;

    document.getElementById('editFoodName').value  = card.getAttribute('data-name')  || '';
    document.getElementById('editFoodPrice').value = card.getAttribute('data-price') || '';
    document.getElementById('editFoodQty').value   = card.getAttribute('data-qty')   || '1';

    const errMsg = document.getElementById('editErrorMsg');
    errMsg.classList.add('hidden');
    errMsg.textContent = '';

    modal.classList.remove('hidden');

    const cardEl = modal.querySelector('div[style]');
    if (cardEl) {
        cardEl.style.animation = 'none';
        cardEl.offsetHeight;
        cardEl.style.animation = '';
    }
    setTimeout(() => document.getElementById('editFoodName').focus(), 50);
}

function closeEditItemModal() {
    const modal = document.getElementById('editItemModal');
    if (modal) modal.classList.add('hidden');
    _editTargetCard = null;
}

function confirmEditItemAction() {
    if (!_editTargetCard) return;

    const nameVal  = document.getElementById('editFoodName').value.trim();
    const priceVal = parseFloat(document.getElementById('editFoodPrice').value) || 0;
    const qtyVal   = parseInt(document.getElementById('editFoodQty').value) || 0;
    const errMsg   = document.getElementById('editErrorMsg');

    if (!nameVal) {
        errMsg.textContent = 'Nama makanan/minuman tidak boleh kosong!';
        errMsg.classList.remove('hidden');
        document.getElementById('editFoodName').focus();
        return;
    }
    if (priceVal <= 0) {
        errMsg.textContent = 'Harga satuan harus lebih besar dari Rp 0!';
        errMsg.classList.remove('hidden');
        document.getElementById('editFoodPrice').focus();
        return;
    }
    if (qtyVal <= 0) {
        errMsg.textContent = 'Jumlah pesanan minimal bernilai 1!';
        errMsg.classList.remove('hidden');
        document.getElementById('editFoodQty').focus();
        return;
    }

    const currentUser = _editTargetCard.getAttribute('data-user');

    _editTargetCard.setAttribute('data-name',  nameVal);
    _editTargetCard.setAttribute('data-price', priceVal);
    _editTargetCard.setAttribute('data-qty',   qtyVal);

    _editTargetCard.querySelector('.item-name-text').textContent    = nameVal;
    _editTargetCard.querySelector('.item-details-text').textContent = `${currentUser} • Rp ${priceVal.toLocaleString('id-ID')}`;
    _editTargetCard.querySelector('.item-qty-text').textContent     = `x${qtyVal}`;

    if (typeof window.recalculateLocalTotals === 'function') {
        window.recalculateLocalTotals();
    }

    closeEditItemModal();
    Toast.success('Pesanan berhasil diubah!');
}

(function initEditModal() {
    const confirmBtn = document.getElementById('confirmEditItem');
    const cancelBtn  = document.getElementById('cancelEditItem');
    const backdrop   = document.getElementById('editModalBackdrop');

    if (confirmBtn) confirmBtn.addEventListener('click', confirmEditItemAction);
    if (cancelBtn)  cancelBtn.addEventListener('click', closeEditItemModal);
    if (backdrop)   backdrop.addEventListener('click', closeEditItemModal);

    ['editFoodName','editFoodPrice','editFoodQty'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter')  { e.preventDefault(); confirmEditItemAction(); }
            if (e.key === 'Escape') closeEditItemModal();
        });
    });
})();

function createItemCardElement(foodName, foodPrice, foodQty, foodUser) {
    const itemCard = document.createElement('div');

    itemCard.className = "item-card flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface-container-low p-md rounded-2xl shadow-sm border border-surface-variant/30 gap-sm w-full";

    itemCard.setAttribute('data-name',  foodName);
    itemCard.setAttribute('data-price', foodPrice);
    itemCard.setAttribute('data-qty',   foodQty);
    itemCard.setAttribute('data-user',  foodUser);

    itemCard.innerHTML = `
        <div class="flex items-center gap-sm">
            <span class="material-symbols-outlined text-primary-container bg-primary-fixed/20 p-sm rounded-xl">restaurant</span>
            <div>
                <h4 class="font-bold text-on-surface text-sm item-name-text">${foodName}</h4>
                <p class="text-xs text-secondary font-medium item-details-text">${foodUser} • Rp ${parseFloat(foodPrice).toLocaleString('id-ID')}</p>
            </div>
        </div>
        <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-md pr-xs sm:pr-sm border-t sm:border-t-0 pt-xs sm:pt-0 border-surface-variant/20">
            <span class="font-extrabold text-primary-container bg-primary-fixed/30 px-md py-sm rounded-xl text-xs item-qty-text">x${foodQty}</span>
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
    deleteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const currentName = itemCard.getAttribute('data-name');

        const confirmed = await CustomAlert.confirm(
            `Apakah Anda yakin ingin menghapus pesanan "${currentName}"?`,
            'Konfirmasi Hapus'
        );

        if (confirmed) {
            itemCard.remove();
            Toast.success('Pesanan berhasil dihapus!');
            if (typeof window.recalculateLocalTotals === 'function') {
                window.recalculateLocalTotals();
            }
        }
    });

    const editBtn = itemCard.querySelector('.btn-edit');
    editBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openEditItemModal(itemCard);
    });

    return itemCard;
}
