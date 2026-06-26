document.querySelectorAll('button.copy-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const originalIcon = this.textContent;
    this.textContent = 'check';
    this.classList.add('text-green-600');
    setTimeout(() => {
      this.textContent = originalIcon;
      this.classList.remove('text-green-600');
    }, 1500);
  });
});