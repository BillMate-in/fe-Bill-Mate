document.addEventListener('DOMContentLoaded', () => {
    const btnCreateRoom = document.getElementById('btnCreateRoom');
    const hostNameInput = document.getElementById('hostName');
    const restaurantNameInput = document.getElementById('restaurantName');
    const bankAccountInput = document.getElementById('bankName');
    const rekeningInput = document.getElementById('rekening');

    if (!btnCreateRoom) return;

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
    [hostNameInput, restaurantNameInput, bankAccountInput, rekeningInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => clearInputError(input));
            input.addEventListener('focus', () => clearInputError(input));
        }
    });

    btnCreateRoom.addEventListener('click', async (event) => {
        
        event.preventDefault();

        btnCreateRoom.classList.add('scale-95');
        setTimeout(() => {
            btnCreateRoom.classList.remove('scale-95');
        }, 150);

        const hostName = hostNameInput ? hostNameInput.value.trim() : '';
        const restaurantName = restaurantNameInput ? restaurantNameInput.value.trim() : '';
        const bankName = bankAccountInput ? bankAccountInput.value.trim() : '';
        const rekening = rekeningInput ? rekeningInput.value.trim() : '';

        // Validasi per field dengan visual feedback
        if (!hostName) {
            showInputError(hostNameInput);
            await CustomAlert.warning(
                'Mohon isi nama Host (pembuat room) terlebih dahulu!',
                'Nama Host Kosong'
            );
            hostNameInput.focus();
            return; 
        }

        if (!restaurantName) {
            showInputError(restaurantNameInput);
            await CustomAlert.warning(
                'Mohon isi nama Restoran atau Rumah Makan terlebih dahulu!',
                'Nama Restoran Kosong'
            );
            restaurantNameInput.focus();
            return; 
        }

        if (!bankName) {
            showInputError(bankAccountInput);
            await CustomAlert.warning(
                'Mohon isi nama Bank atau E-Wallet terlebih dahulu!',
                'Bank/E-Wallet Kosong'
            );
            bankAccountInput.focus();
            return; 
        }

        if (!rekening) {
            showInputError(rekeningInput);
            await CustomAlert.warning(
                'Mohon isi nomor Rekening atau nomor E-Wallet terlebih dahulu!',
                'Nomor Rekening Kosong'
            );
            rekeningInput.focus();
            return; 
        }

        
        sessionStorage.setItem('hostName', hostName);
        sessionStorage.setItem('restaurantName', restaurantName);
        sessionStorage.setItem('bankName', bankName);
        sessionStorage.setItem('rekening', rekening);
        
        Toast.success('Room berhasil dibuat! Mengalihkan ke dashboard...');
        
        setTimeout(() => {
            window.location.href = 'room.html';
        }, 1000);
    });
});
