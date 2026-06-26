document.querySelectorAll('button').forEach(button => {
    button.addEventListener('mousedown', function (e) {
        const x = e.clientX - e.target.offsetLeft;
        const y = e.clientY - e.target.offsetTop;
        const ripples = document.createElement('span');
        ripples.style.left = x + 'px';
        ripples.style.top = y + 'px';
        ripples.style.position = 'absolute'; 
        this.appendChild(ripples);
        setTimeout(() => { ripples.remove() }, 1000);
    });
});