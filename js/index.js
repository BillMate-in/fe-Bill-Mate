document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.hover\\:-translate-y-1');

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('scale-[1.02]');
        });

        card.addEventListener('mouseleave', () => {
            card.classList.remove('scale-[1.02]');
        });
    });
});