class CustomAlert {
    static show(options = {}) {
        const {
            title = 'Pemberitahuan',
            message = '',
            type = 'info', // info, success, error, warning
            showCancel = false,
            confirmText = 'OK',
            cancelText = 'Batal',
            onConfirm = null,
            onCancel = null
        } = options;

        return new Promise((resolve) => {
            // Remove existing alerts
            document.querySelectorAll('.custom-alert-overlay').forEach(el => el.remove());

            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'custom-alert-overlay';

            // Icon mapping
            const iconMap = {
                info: 'info',
                success: 'check_circle',
                error: 'error',
                warning: 'warning'
            };

            overlay.innerHTML = `
                <div class="custom-alert-container">
                    <div class="custom-alert-header">
                        <div class="custom-alert-icon ${type}">
                            <span class="material-symbols-outlined text-white text-3xl" style="font-variation-settings: 'FILL' 1;">
                                ${iconMap[type]}
                            </span>
                        </div>
                        <h3 class="custom-alert-title">${title}</h3>
                        <p class="custom-alert-message">${message}</p>
                    </div>
                    <div class="custom-alert-actions">
                        ${showCancel ? `<button class="custom-alert-btn secondary" data-action="cancel">${cancelText}</button>` : ''}
                        <button class="custom-alert-btn primary" data-action="confirm">${confirmText}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Handle button clicks
            overlay.addEventListener('click', (e) => {
                if (e.target.classList.contains('custom-alert-overlay')) {
                    return; // Don't close on overlay click
                }

                const action = e.target.getAttribute('data-action');
                if (action === 'confirm') {
                    if (onConfirm) onConfirm();
                    resolve(true);
                    this.hide(overlay);
                } else if (action === 'cancel') {
                    if (onCancel) onCancel();
                    resolve(false);
                    this.hide(overlay);
                }
            });

            // Handle ESC key
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    if (showCancel) {
                        if (onCancel) onCancel();
                        resolve(false);
                    } else {
                        if (onConfirm) onConfirm();
                        resolve(true);
                    }
                    this.hide(overlay);
                    document.removeEventListener('keydown', handleEsc);
                }
            };
            document.addEventListener('keydown', handleEsc);
        });
    }

    static hide(overlay) {
        overlay.classList.add('hiding');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 250);
    }

    static confirm(message, title = 'Konfirmasi') {
        return this.show({
            title,
            message,
            type: 'warning',
            showCancel: true,
            confirmText: 'Ya',
            cancelText: 'Tidak'
        });
    }

    static success(message, title = 'Berhasil') {
        return this.show({
            title,
            message,
            type: 'success'
        });
    }

    static error(message, title = 'Error') {
        return this.show({
            title,
            message,
            type: 'error'
        });
    }

    static info(message, title = 'Informasi') {
        return this.show({
            title,
            message,
            type: 'info'
        });
    }
}

class Toast {
    static container = null;

    static init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    static show(message, type = 'info', duration = 4000) {
        this.init();

        const iconMap = {
            info: 'info',
            success: 'check_circle',
            error: 'error',
            warning: 'warning'
        };

        const titleMap = {
            info: 'Info',
            success: 'Berhasil',
            error: 'Error',
            warning: 'Peringatan'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        toast.innerHTML = `
            <div class="toast-icon">
                <span class="material-symbols-outlined text-white text-sm" style="font-variation-settings: 'FILL' 1;">
                    ${iconMap[type]}
                </span>
            </div>
            <div class="toast-content">
                <div class="toast-title">${titleMap[type]}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <span class="material-symbols-outlined text-sm">close</span>
            </button>
        `;

        this.container.appendChild(toast);

        // Handle close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.hide(toast);
        });

        // Auto hide
        if (duration > 0) {
            setTimeout(() => {
                this.hide(toast);
            }, duration);
        }

        return toast;
    }

    static hide(toast) {
        toast.classList.add('hiding');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    static success(message, duration) {
        return this.show(message, 'success', duration);
    }

    static error(message, duration) {
        return this.show(message, 'error', duration);
    }

    static warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    static info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Override default alert and confirm
window.customAlert = CustomAlert.info.bind(CustomAlert);
window.customConfirm = CustomAlert.confirm.bind(CustomAlert);
window.toast = Toast;