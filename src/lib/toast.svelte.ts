import { browser } from '$app/environment';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error';
    duration?: number;
}

class ToastManager {
    toasts = $state<Toast[]>([]);

    private add(message: string, type: 'success' | 'error', duration = 3000) {
        if (!browser) return;
        const id = Math.random().toString(36).substring(2, 9);
        const toast: Toast = { id, message, type, duration };
        
        this.toasts = [...this.toasts, toast];

        if (duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }
    }

    success(message: string, duration?: number) {
        this.add(message, 'success', duration);
    }

    error(message: string, duration?: number) {
        this.add(message, 'error', duration);
    }

    remove(id: string) {
        this.toasts = this.toasts.filter((t) => t.id !== id);
    }
}

export const toast = new ToastManager();
