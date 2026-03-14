import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

// Functional state management for Svelte 5
function createThemeManager() {
    let theme = $state<Theme>('light');

    if (browser) {
        // Initial sync
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) {
            theme = savedTheme;
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            theme = prefersDark ? 'dark' : 'light';
        }

        // Persistent effect to keep DOM and localStorage in sync
        $effect.root(() => {
            $effect(() => {
                const currentTheme = theme;
                // Only set if changed to avoid unnecessary storage events (though storage event only fires for other windows)
                if (localStorage.getItem('theme') !== currentTheme) {
                    localStorage.setItem('theme', currentTheme);
                }
                
                if (currentTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                
                console.log('[ThemeManager] Applied theme:', currentTheme);
            });
        });

        // Listen for changes from other tabs
        window.addEventListener('storage', (event) => {
            if (event.key === 'theme' && event.newValue) {
                const newTheme = event.newValue as Theme;
                if (newTheme !== theme) {
                    console.log('[ThemeManager] Syncing from storage event:', newTheme);
                    theme = newTheme;
                }
            }
        });
    }

    return {
        get theme() {
            return theme;
        },
        set theme(value: Theme) {
            theme = value;
        },
        toggle() {
            console.log('[ThemeManager] Toggling from:', theme);
            theme = theme === 'light' ? 'dark' : 'light';
            console.log('[ThemeManager] New theme:', theme);
        }
    };
}

export const themeManager = createThemeManager();
