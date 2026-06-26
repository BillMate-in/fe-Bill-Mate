document.addEventListener('mousemove', (e) => {
    const card = document.querySelector('.group.shadow-\\[0px_4px_32px_rgba\\(0\\,0\\,0\\,0\\.06\\)\\]');
    if (card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
    }
});