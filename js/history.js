document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.flex.gap-sm button');
    
    let historyData = [];
    let filteredData = [];
    let currentPage = 1;
    const itemsPerPage = 6;
    
    const historyListContainer = document.getElementById('historyList');
    const searchInput = document.querySelector('input[placeholder="Cari room..."]');
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    
    const allBtn = document.getElementById('allBtn');
    const weekBtn = document.getElementById('weekBtn');
    const monthBtn = document.getElementById('monthBtn');

    if (!historyListContainer) return;

    filterButtons.forEach(button => {
        if (button.id === 'deleteAllBtn') return;

        button.addEventListener('click', () => {
            filterButtons.forEach(btn => {
                if (btn.id === 'deleteAllBtn') return;
                btn.classList.remove('active-pill');
                btn.classList.add('bg-surface-container-lowest', 'border', 'border-surface-variant', 'text-secondary');
            });

            button.classList.add('active-pill');
            button.classList.remove('bg-surface-container-lowest', 'border', 'border-surface-variant', 'text-secondary');
            
            applyFilter(button.id);
        });
    });

    function loadHistoryFromStorage() {
        const rawHistory = localStorage.getItem('billHistory');
        historyData = rawHistory ? JSON.parse(rawHistory) : [];
        
        historyData.sort((a, b) => {
            const timeA = a.timestamp || Math.floor(Date.now() / 1000);
            const timeB = b.timestamp || Math.floor(Date.now() / 1000);
            return timeB - timeA;
        });
        
        filteredData = [...historyData];
        currentPage = 1;
        renderHistoryList();
        updatePagination();
    }

    function applyFilter(filterType) {
        const now = Math.floor(Date.now() / 1000);
        
        switch(filterType) {
            case 'weekBtn':
                const weekAgo = now - (7 * 24 * 60 * 60);
                filteredData = historyData.filter(item => (item.timestamp || now) >= weekAgo);
                break;
            case 'monthBtn':
                const monthAgo = now - (30 * 24 * 60 * 60);
                filteredData = historyData.filter(item => (item.timestamp || now) >= monthAgo);
                break;
            default:
                filteredData = [...historyData];
        }
        
        const searchTerm = searchInput?.value.trim().toLowerCase();
        if (searchTerm) {
            filteredData = filteredData.filter(item => {
                const restaurantName = (item.restaurantName || '').toLowerCase();
                const hostName = (item.hostName || '').toLowerCase();
                const txId = (item.transactionId || '').toLowerCase();
                return restaurantName.includes(searchTerm) || hostName.includes(searchTerm) || txId.includes(searchTerm);
            });
        }
        
        currentPage = 1;
        renderHistoryList();
        updatePagination();
    }

    function renderHistoryList() {
        historyListContainer.innerHTML = '';

        if (filteredData.length === 0) {
            historyListContainer.innerHTML = `
                <div class="text-center py-12 bg-surface-container-lowest rounded-2xl border border-surface-variant/30 w-full">
                    <span class="material-symbols-outlined text-secondary/40 text-5xl">folder_open</span>
                    <p class="text-secondary mt-2 text-sm font-medium">Belum ada catatan riwayat yang cocok.</p>
                </div>
            `;
            return;
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        paginatedData.forEach((historyItem, localIndex) => {
            const card = createHistoryCard(historyItem, localIndex);
            historyListContainer.appendChild(card);
        });
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        
        if (pageInfo) {
            pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages || 1}`;
        }
        
        if (prevPageBtn) {
            prevPageBtn.disabled = currentPage <= 1;
            prevPageBtn.classList.toggle('opacity-50', currentPage <= 1);
            prevPageBtn.classList.toggle('cursor-not-allowed', currentPage <= 1);
        }
        
        if (nextPageBtn) {
            nextPageBtn.disabled = currentPage >= totalPages;
            nextPageBtn.classList.toggle('opacity-50', currentPage >= totalPages);
            nextPageBtn.classList.toggle('cursor-not-allowed', currentPage >= totalPages);
        }
    }

    function createHistoryCard(bill, localIndex) {
        const card = document.createElement('div');
        card.className = "flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface-container-lowest p-md rounded-2xl border border-surface-variant/40 shadow-sm gap-md w-full hover:shadow-md transition-shadow";
        
        const restaurantName = bill.restaurantName || 'Restoran Tanpa Nama';
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
                        <span class="material-symbols-outlined text-xs">tag</span>
                        <span>${transactionId}</span>
                        <span>•</span>
                        <span class="material-symbols-outlined text-xs">event</span>
                        <span>${date}</span>
                        <span>•</span>
                        <span class="material-symbols-outlined text-xs">group</span>
                        <span>${membersCount} orang</span>
                    </div>
                </div>
            </div>
            <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-md">
                <div class="text-right">
                    <div class="font-extrabold text-primary-container text-lg">Rp ${grandTotal.toLocaleString('id-ID')}</div>
                    <div class="text-xs text-secondary">Total Pembayaran</div>
                </div>
                <div class="flex items-center gap-xs">
                    <button class="view-detail-btn text-primary-container hover:text-primary p-xs transition-colors rounded-lg hover:bg-primary-fixed/20" 
                            title="Lihat Detail">
                        <span class="material-symbols-outlined text-base">visibility</span>
                    </button>
                    <button class="delete-history-btn text-error hover:text-red-700 p-xs transition-colors rounded-lg hover:bg-red-50" 
                            title="Hapus Riwayat">
                        <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                </div>
            </div>
        `;

        const viewBtn = card.querySelector('.view-detail-btn');
        const deleteBtn = card.querySelector('.delete-history-btn');

        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                viewHistoryDetail(bill);
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                const confirmed = await CustomAlert.confirm(
                    `Apakah Anda yakin ingin menghapus riwayat "${restaurantName}"?`,
                    'Konfirmasi Hapus'
                );
                
                if (confirmed) {
                    deleteHistoryItem(localIndex);
                }
            });
        }

        return card;
    }

    function viewHistoryDetail(bill) {
        localStorage.setItem('calculatedBill', JSON.stringify(bill));
        window.open('nota.html', '_blank');
    }

    function deleteHistoryItem(localIndex) {
        const pageStartIndex = (currentPage - 1) * itemsPerPage;
        const itemToDelete = filteredData[pageStartIndex + localIndex];
        
        const actualIndex = historyData.findIndex(item => 
            item.transactionId === itemToDelete.transactionId && 
            item.timestamp === itemToDelete.timestamp
        );
        
        if (actualIndex !== -1) {
            historyData.splice(actualIndex, 1);
            localStorage.setItem('billHistory', JSON.stringify(historyData));
            
            const activeFilter = document.querySelector('.active-pill')?.id || 'allBtn';
            applyFilter(activeFilter);
            
            Toast.success('Riwayat berhasil dihapus!');
        }
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderHistoryList();
                updatePagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredData.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderHistoryList();
                updatePagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const activeFilter = document.querySelector('.active-pill')?.id || 'allBtn';
                applyFilter(activeFilter);
            }, 300);
        });
    }

    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', async () => {
            if (historyData.length === 0) {
                await CustomAlert.info('Tidak ada riwayat untuk dihapus.', 'Informasi');
                return;
            }

            const confirmed = await CustomAlert.confirm(
                `Apakah Anda yakin ingin menghapus semua ${historyData.length} riwayat? Tindakan ini tidak dapat dibatalkan!`,
                'Hapus Semua Riwayat'
            );

            if (confirmed) {
                historyData = [];
                filteredData = [];
                localStorage.removeItem('billHistory');
                currentPage = 1;
                renderHistoryList();
                updatePagination();
                Toast.success('Semua riwayat berhasil dihapus!');
            }
        });
    }

    loadHistoryFromStorage();
});