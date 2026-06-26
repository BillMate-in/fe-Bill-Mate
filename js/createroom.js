document.addEventListener('DOMContentLoaded', () => {
    const inputFields = document.querySelectorAll('input');
    inputFields.forEach(input => {
        input.addEventListener('focus', () => {
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const btnCreateRoom = document.getElementById('btnCreateRoom');

    if (btnCreateRoom) {
        btnCreateRoom.addEventListener('click', () => {
            window.location.href = 'room.html'; 
        });
    }
});