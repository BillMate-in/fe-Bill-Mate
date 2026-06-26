document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.rounded-2xl').forEach(card => {
        card.addEventListener('mousedown', () => {
            card.classList.add('scale-95', 'duration-150');
        });
        card.addEventListener('mouseup', () => {
            card.classList.remove('scale-95');
        });
        card.addEventListener('mouseleave', () => {
            card.classList.remove('scale-95');
        });
    });

    const filterButtons = document.querySelectorAll('.flex.gap-sm button');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => {
                b.classList.remove('active-pill');
                b.classList.add('bg-surface-container-lowest', 'border', 'border-surface-variant');
            });
            btn.classList.add('active-pill');
            btn.classList.remove('bg-surface-container-lowest', 'border', 'border-surface-variant');
        });
    });
});