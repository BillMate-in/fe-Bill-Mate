document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.flex.gap-sm button');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => {
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
    
    const filterButtons = document.querySelectorAll('.flex.gap-sm button');

    filterButtons.forEach(button => {
        if (button.id === 'deleteAllBtn') return; // Lewati tombol hapus masal

        button.addEventListener('click', () => {
            filterButtons.forEach(btn => {
                if (btn.id === 'deleteAllBtn') return;
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

    
    let historyData = [];
    const historyListContainer = document.getElementById('historyList');
    const searchInput = document.querySelector('input[placeholder="Cari room..."]');
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    
    // Elemen pemicu filter waktu
    const allBtn = document.getElementById('allBtn');
    const weekBtn = document.getElementById('weekBtn');
    const monthBtn = document.getElementById('monthBtn');

    if (!historyListContainer) return;


    function loadHistoryFromStorage() {
        const rawHistory = localStorage.getItem('billHistory');
        historyData = rawHistory ? JSON.parse(rawHistory) : [];
        
        // Pengurutan Riwayat Berdasarkan Waktu (Timestamp):
        // Jika timestamp kosong, kita buat fallback cerdas menggunakan waktu saat ini (Date.now() / 1000)
        historyData.sort((a, b) => {
            const timeA = a.timestamp || Math.floor(Date.now() / 1000);
            const timeB = b.timestamp || Math.floor(Date.now() / 1000);
            return timeB - timeA;
        });
    }

   
    function renderHistoryList(dataToRender = null) {
        const data = dataToRender || historyData;
        historyListContainer.innerHTML = '';

        // Tampilkan feedback visual jika data kosong
        if (data.length === 0) {
            historyListContainer.innerHTML = `
                <div class="text-center py-12 bg-surface-container-lowest rounded-2xl border border-surface-variant/30 w-full">
                    <span class="material-symbols-outlined text-secondary/40 text-5xl">folder_open</span>
                    <p class="text-secondary mt-2 text-sm font-medium">Belum ada catatan riwayat makan-makan.</p>
                </div>
            `;
            return;
        }

        // Loop dan rakit visualisasi kartu riwayat berdasarkan skema Rich JSON kalkulasi
        data.forEach(bill => {
            const card = document.createElement('div');
            card.className = "flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface-container-lowest p-md rounded-2xl border border-surface-variant/40 shadow-sm gap-md w-full";
            
            // EKSTRAKSI PROPERTI DARI RICH JSON SCHEMA:
            // - Nama Restoran  dari root objek
            const restaurantName = bill.restaurantName || 'Restoran Tanpa Nama';

            // - ID Transaksi  dari root objek
            const transactionId = bill.transactionId || '#BM-2026-0000';
            const date = bill.date || 'Unknown Date';
            
            
            const membersCount = bill.membersBreakdown ? bill.membersBreakdown.length : 0;
            
            
            const grandTotal = bill.summary ? bill.summary.grandTotal : 0;

            card.innerHTML = `
                <div class="flex items-center gap-sm">
                    <span class="material-symbols-outlined text-primary-container bg-primary-fixed/20 p-sm rounded-xl">restaurant</span>
                    <div>
                        <h3 class="font-bold text-on-surface text-base">${restaurantName}</h3>
                        <div class="flex items-center gap-xs text-xs text-secondary mt-1">
                            <span class="font-semibold">${transactionId}</span>
                            <span>•</span>
                            <span>${date}</span>
                            <span>•</span>
                            <span>${membersCount} Anggota</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-md border-t sm:border-t-0 pt-xs sm:pt-0 border-surface-variant/20">
                    <span class="font-extrabold text-primary-container text-lg">Rp ${grandTotal.toLocaleString('id-ID')}</span>
                    <button class="btn-detail flex items-center gap-xs px-md py-sm bg-primary-container hover:bg-orange-400 text-white font-semibold text-xs rounded-xl shadow-sm transition-transform active:scale-95">
                        <span class="material-symbols-outlined text-sm">visibility</span>
                        <span>Lihat Detail</span>
                    </button>
                </div>
            `;

      
            const detailBtn = card.querySelector('.btn-detail');
            detailBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
               
                localStorage.setItem('calculatedBill', JSON.stringify(bill));
              
                window.location.href = 'nota.html';
            });

            historyListContainer.appendChild(card);
        });


        const pageInfo = document.getElementById('pageInfo');
        if (pageInfo) {
            pageInfo.textContent = `Riwayat: ${data.length} Transaksi`;
        }
    }


    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            // Melakukan pencarian dari struktur objek Rich JSON
            const filtered = historyData.filter(bill => {
                const restaurant = (bill.restaurantName || '').toLowerCase();
                const txId = (bill.transactionId || '').toLowerCase();
                return restaurant.includes(query) || txId.includes(query);
            });
            
            renderHistoryList(filtered);
        });
    }


    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', (e) => {
            e.preventDefault();

            if (historyData.length === 0) {
                alert('Riwayat transaksi Anda memang sudah kosong.');
                return;
            }

            if (confirm('Apakah Anda yakin ingin menghapus seluruh daftar riwayat makan-makan? Tindakan ini bersifat permanen.')) {
                localStorage.removeItem('billHistory');
                historyData = [];
                renderHistoryList();
            }
        });
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (allBtn) {
        allBtn.addEventListener('click', () => renderHistoryList());
    }

    if (weekBtn) {
        weekBtn.addEventListener('click', () => {
            const sevenDaysAgo = nowInSeconds - (7 * 24 * 60 * 60);
            const filtered = historyData.filter(bill => {
                const billTime = bill.timestamp || nowInSeconds;
                return billTime >= sevenDaysAgo;
            });
            renderHistoryList(filtered);
        });
    }

    if (monthBtn) {
        monthBtn.addEventListener('click', () => {
            const thirtyDaysAgo = nowInSeconds - (30 * 24 * 60 * 60);
            const filtered = historyData.filter(bill => {
                const billTime = bill.timestamp || nowInSeconds;
                return billTime >= thirtyDaysAgo;
            });
            renderHistoryList(filtered);
        });
    }

    loadHistoryFromStorage();
    renderHistoryList();
});