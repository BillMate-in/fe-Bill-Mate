document.addEventListener('DOMContentLoaded', () => {
    const btnCreateRoom = document.getElementById('btnCreateRoom');
    const hostNameInput = document.getElementById('hostName');
    const restaurantNameInput = document.getElementById('restaurantName');
    const bankAccountInput = document.getElementById('bankName');
    const rekeningInput = document.getElementById('rekening');

    if (!btnCreateRoom) return;

    btnCreateRoom.addEventListener('click', (event) => {
        
        event.preventDefault();

       
        btnCreateRoom.classList.add('scale-95');
        setTimeout(() => {
            btnCreateRoom.classList.remove('scale-95');
        }, 150);


        const hostName = hostNameInput ? hostNameInput.value.trim() : '';
        const restaurantName = restaurantNameInput ? restaurantNameInput.value.trim() : '';
        const bankName = bankAccountInput ? bankAccountInput.value.trim() : '';
        const rekening = rekeningInput ? rekeningInput.value.trim() : '';

      
        if (!hostName || !restaurantName || !bankName || !rekening) {
            alert('Gagal membuat ruangan. Mohon isi Nama Host, Nama Restoran, dan No. Rekening / No. E-Wallet terlebih dahulu!');
            return; 
        }

        
        sessionStorage.setItem('hostName', hostName);
        sessionStorage.setItem('restaurantName', restaurantName);
        sessionStorage.setItem('bankName', bankName);
        sessionStorage.setItem('rekening', rekening)
        
        window.location.href = 'room.html';
    });
});
