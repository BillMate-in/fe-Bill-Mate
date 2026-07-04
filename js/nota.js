document.addEventListener('DOMContentLoaded', () => {

  const copyButton = document.querySelector('.copy-btn');

  if (!copyButton) return;

  copyButton.addEventListener('click', () => {

    const icon = copyButton.querySelector('.material-symbols-outlined');

    if (!icon) return;

    icon.textContent = 'check';

    setTimeout(() => {
      icon.textContent = 'content_copy';
    }, 1500);
  });

});



document.addEventListener('DOMContentLoaded', () => {

  const rawBillData = localStorage.getItem('calculatedBill');

  if (!rawBillData) {
    alert('Riwayat transaksi tidak ditemukan. Silakan buat rincian baru terlebih dahulu!');
    window.location.href = 'index.html';
    return;
  }


  const calculatedBill = JSON.parse(rawBillData);

 
  const txIdElement = document.querySelector('.tracking-wider').nextElementSibling;
  if (txIdElement) {
    txIdElement.textContent = calculatedBill.transactionId || '#BM-2026-0000';
  }

  
  document.getElementById('transactionDate').textContent = calculatedBill.date || date('M d, Y');

 
  const summary = calculatedBill.summary;
  document.getElementById('subtotalBill').textContent = `Rp ${summary.totalBaseCost.toLocaleString('id-ID')}`;
  document.getElementById('taxBill').textContent = `Rp ${summary.totalTax.toLocaleString('id-ID')}`;
  document.getElementById('discountBill').textContent = `- Rp ${summary.totalDiscount.toLocaleString('id-ID')}`;
  document.getElementById('feesBill').textContent = `Rp ${summary.totalExtraFees.toLocaleString('id-ID')}`;
  document.getElementById('totalBill').textContent = `Rp ${summary.grandTotal.toLocaleString('id-ID')}`;


  const transfer = calculatedBill.transferInfo;
  if (transfer && transfer.paymentOptions && transfer.paymentOptions.length > 0) {
    
    const primaryOption = transfer.paymentOptions[0];
    document.getElementById('hostTransfer').textContent = `Transfer ke Host (${transfer.hostName})`;
    document.getElementById('rekeningText').textContent = `${primaryOption.provider} - ${primaryOption.accountNumber}`;
  }


  const receiptItemsContainer = document.getElementById('receiptItems');
  if (!receiptItemsContainer) return;


  receiptItemsContainer.innerHTML = '';

  calculatedBill.membersBreakdown.forEach(member => {
    // elemen penampung utama kartu anggota
    const memberCard = document.createElement('div');
    memberCard.className = 'pb-md border-b border-surface-variant/30 last:border-0 last:pb-0 space-y-sm';

    const memberHeader = `
      <div class="flex justify-between items-center">
        <span class="font-bold text-base text-on-surface">${member.memberName}</span>
        <span class="font-extrabold text-base text-primary-container">Rp ${member.grandTotal.toLocaleString('id-ID')}</span>
      </div>
    `;

    let orderedItemsHtml = '';
    member.orderedItems.forEach(item => {
      orderedItemsHtml += `
        <div class="flex justify-between text-xs text-secondary pl-sm border-l border-primary-container/40">
          <span>${item.name} <strong class="text-on-surface">x${item.qty}</strong></span>
          <span>Rp ${(item.price * item.qty).toLocaleString('id-ID')}</span>
        </div>
      `;
    }); 
    
    let adjustmentsHtml = '';
    if (member.taxShare > 0) {
      adjustmentsHtml += `
        <div class="flex justify-between text-[11px] text-secondary/80 italic pl-sm border-l border-orange-300">
          <span>Porsi Pajak (${calculatedBill.summary.totalTax > 0 ? 'proporsional' : '0%'})</span>
          <span>Rp ${member.taxShare.toLocaleString('id-ID')}</span>
        </div>
      `;
    }
    if (member.discountShare > 0) {
      adjustmentsHtml += `
        <div class="flex justify-between text-[11px] text-red-500/90 italic pl-sm border-l border-red-300">
          <span>Porsi Diskon Toko (proporsional)</span>
          <span>- Rp ${member.discountShare.toLocaleString('id-ID')}</span>
        </div>
      `;
    }
    if (member.extraFeeShare > 0) {
      adjustmentsHtml += `
        <div class="flex justify-between text-[11px] text-secondary/80 italic pl-sm border-l border-amber-300">
          <span>Patungan Biaya Tambahan (flat)</span>
          <span>Rp ${member.extraFeeShare.toLocaleString('id-ID')}</span>
        </div>
      `;
    }

    // Satukan seluruh komponen visual dan injeksikan ke dalam penampung
    memberCard.innerHTML = `
      ${memberHeader}
      <div class="space-y-1.5 mt-xs pl-xs">
        ${orderedItemsHtml}
        ${adjustmentsHtml}
      </div>
    `;

    receiptItemsContainer.appendChild(memberCard);
  });

  // Menggunakan fallback selector yang cerdas untuk mengantisipasi jika class '.copy-btn' belum tertanam di HTML
  const copyButton = document.querySelector('.copy-btn') || document.querySelector('#rekeningText').nextElementSibling;
  const rekeningText = document.getElementById('rekeningText');

  if (copyButton && rekeningText) {
    copyButton.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const rawText = rekeningText.textContent.trim();
      
      // Trik Regex/Split: Ekstrak hanya nomor rekeningnya saja (misal "BCA - 1234567" menjadi "1234567")
      const accountNumber = rawText.includes(' - ') ? rawText.split(' - ')[1].trim() : rawText;

      try {
        // Menyalin nomor rekening yang bersih ke sistem clipboard OS pengguna secara asinkron
        await navigator.clipboard.writeText(accountNumber);
        
        // Mengubah ikon visual menjadi centang sementara sebagai tanda sukses menyalin
        const icon = copyButton.querySelector('.material-symbols-outlined');
        if (icon) {
          icon.textContent = 'check';
          setTimeout(() => {
            icon.textContent = 'content_copy';
          }, 1500);
        }
      } catch (err) {
        console.error('Browser gagal menyalin teks otomatis:', err);
        alert('Gagal menyalin otomatis. Silakan blok teks rekening lalu salin manual.');
      }
    });
  }

  const whatsappBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Bagikan ke WhatsApp'));

  if (whatsappBtn && calculatedBill) {
    whatsappBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const restaurantName = sessionStorage.getItem('restaurant') || 'restaurant(?)';
      const summary = calculatedBill.summary;
      const transfer = calculatedBill.transferInfo;
      const primaryOption = transfer?.paymentOptions?.[0];

      //Pesan Otomatis untuk WA
      let textMessage = `*🧾 NOTA DIGITAL SPLIT-BILL - ${calculatedBill.restaurantName.toUpperCase()}*\n`;
      textMessage += `ID Transaksi: _${calculatedBill.transactionId}_\sn`;
      textMessage += `Tanggal: _${calculatedBill.date}_\n`;
      textMessage += `===================================\n\n`;

      // Loop detail tagihan per anggota kelompok
      calculatedBill.membersBreakdown.forEach(member => {
        textMessage += `👤 *${member.memberName}* : *Rp ${member.grandTotal.toLocaleString('id-ID')}*\n`;
        // Detail item apa saja yang dipesan anggota tersebut
        member.orderedItems.forEach(item => {
          textMessage += `  - ${item.name} (x${item.qty})\n`;
        });
        textMessage += `\n`;
      });

      textMessage += `===================================\n`;
      textMessage += `💰 *Total Tagihan:* *Rp ${summary.grandTotal.toLocaleString('id-ID')}*\n\n`;

      // Sertakan tujuan rekening transfer host di bagian bawah pesan
      if (transfer && primaryOption) {
        textMessage += `💳 *Tujuan Transfer ke Host (${transfer.hostName}):*\n`;
        textMessage += `👉 *${primaryOption.provider}:* \`${primaryOption.accountNumber}\`\n`;
      }

      textMessage += `\n_Dihitung adil, transparan, dan otomatis menggunakan BillMate._`;

      // Melakukan encode URL-safe string menggunakan encodeURIComponent agar karakter spasi dan simbol dapat dikirim dengan selamat
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMessage)}`;
      
      // Buka API WhatsApp pada tab peramban baru
      window.open(waUrl, '_blank');
    });
  }


  // Menyeleksi tombol riwayat berdasarkan pencarian teks tombol
  const historyBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Lihat Riwayat Room'));

  if (historyBtn) {
    historyBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Navigasi instan ke halaman riwayat lokal
      window.location.href = 'history.html';
    });
  }
  });