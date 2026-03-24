import { browser } from '$app/environment';
import { getContext, setContext } from 'svelte';

export type Locale = 'ko' | 'en';

const I18N_CONTEXT_KEY = Symbol('i18n');

export class I18nManager {
    #locale = $state<Locale>('ko');

    constructor(initialLocale: Locale = 'ko') {
        this.#locale = initialLocale;

        if (browser) {
            // Listen for changes from other tabs to sync
            window.addEventListener('storage', (event) => {
                if (event.key === 'locale' && event.newValue) {
                    const newLocale = event.newValue as Locale;
                    if (newLocale === 'ko' || newLocale === 'en') {
                        if (newLocale !== this.#locale) {
                            this.#locale = newLocale;
                        }
                    }
                }
            });

            // Persistence effect
            $effect.root(() => {
                $effect(() => {
                    const currentLocale = this.#locale;
                    // Sync LocalStorage
                    if (localStorage.getItem('locale') !== currentLocale) {
                        localStorage.setItem('locale', currentLocale);
                    }
                    // Sync Cookie (Max-Age: 1 year)
                    document.cookie = `locale=${currentLocale}; path=/; max-age=31536000; SameSite=Lax`;
                    
                    // Keep html lang attribute in sync for accessibility
                    document.documentElement.lang = currentLocale;
                });
            });
        }
    }

    get locale() {
        return this.#locale;
    }

    set locale(value: Locale) {
        this.#locale = value;
    }

    toggle() {
        this.#locale = this.#locale === 'ko' ? 'en' : 'ko';
    }

    // Inline translation helper
    t(dict: { ko: string; en: string }) {
        return dict[this.#locale];
    }

    // Decoder for server-side messages
    decode(msg: string | null | undefined): string {
        if (!msg) return '';
        try {
            const parsed = JSON.parse(msg);
            if (parsed && typeof parsed === 'object' && ('ko' in parsed || 'en' in parsed)) {
                return parsed[this.#locale] || parsed['ko'] || parsed['en'] || '';
            }
        } catch {
            // Not a JSON string, return as is
        }
        return msg;
    }
}


// Fallback singleton for non-component contexts (e.g. server-side utilities if any)
const defaultI18n = new I18nManager('ko');

// On the client, we can keep a global reference to the initialized manager
// to support callbacks (like event handlers) that lose Svelte's context.
let clientManager: I18nManager | undefined;

/**
 * Initializes the i18n manager in the root layout.
 */
export function initI18n(initialLocale: Locale) {
    const manager = new I18nManager(initialLocale);
    if (browser) clientManager = manager;
    return setContext(I18N_CONTEXT_KEY, manager);
}

/**
 * Retrieves the i18n manager from the component context.
 */
export function getI18n(): I18nManager {
    try {
        const fromContext = getContext(I18N_CONTEXT_KEY) as I18nManager;
        if (fromContext) return fromContext;
    } catch {
        // Fall through to fallback
    }
    
    if (browser && clientManager) return clientManager;
    return defaultI18n;
}

// Smart proxy that attempts to use context if available, fallback to global
export const i18n = {
    get locale() {
        return getI18n().locale;
    },
    set locale(v: Locale) {
        getI18n().locale = v;
    },
    t: (dict: { ko: string; en: string }) => {
        return getI18n().t(dict);
    },
    decode: (msg: string | null | undefined) => {
        return getI18n().decode(msg);
    },
    toggle: () => {
        getI18n().toggle();
    }
};
