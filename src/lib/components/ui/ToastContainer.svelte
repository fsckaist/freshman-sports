<script lang="ts">
    import { toast } from '$lib/toast.svelte';
    import { fade, fly } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import { i18n } from '$lib/i18n.svelte';
</script>

<div class="toast-container">
    {#each toast.toasts as t (t.id)}
        <div
            class="toast {t.type}"
            in:fly={{ y: 20, duration: 300, opacity: 0 }}
            out:fade={{ duration: 200 }}
            animate:flip={{ duration: 300 }}
        >
            <div class="icon">
                {#if t.type === 'success'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {/if}
            </div>
            <span class="message">{i18n.decode(t.message)}</span>
            <button class="close" onclick={() => toast.remove(t.id)} aria-label={i18n.t({ ko: '닫기', en: 'Close' })}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
    {/each}
</div>

<style>
    .toast-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
    }

    .toast {
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        min-width: 280px;
        max-width: 400px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        color: #1f2937;
        font-size: 0.95rem;
        font-weight: 500;
        transition: all 0.2s;
    }

    :global(.dark) .toast {
        background: rgba(24, 24, 27, 0.8);
        border: 1px solid rgba(63, 63, 70, 0.5);
        color: #f4f4f5;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .toast.success {
        border-left: 4px solid #10b981;
    }

    .toast.error {
        border-left: 4px solid #ef4444;
    }

    .toast.success .icon {
        color: #10b981;
    }

    .toast.error .icon {
        color: #ef4444;
    }

    .message {
        flex: 1;
    }

    .close {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: all 0.2s;
    }

    .close:hover {
        background: rgba(0, 0, 0, 0.05);
        color: #4b5563;
    }

    :global(.dark) .close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #d1d5db;
    }
</style>
