<script lang="ts">
    import Sidebar from "$lib/components/layout/Sidebar.svelte";
    import MobileHeader from "$lib/components/layout/MobileHeader.svelte";
    import ToastContainer from "$lib/components/ui/ToastContainer.svelte";
    import { browser } from "$app/environment";
    import { isMenuOpen } from "$lib/stores/nav";
    import { fade, fly } from "svelte/transition";
    import { page } from "$app/stores";
    
    let { children } = $props();

    // Close menu when route changes
    $effect(() => {
        if ($page.url.pathname) {
            isMenuOpen.set(false);
        }
    });
</script>

{#if browser}
    <ToastContainer />
{/if}

<div
    class="flex h-screen w-full overflow-hidden bg-white dark:bg-zinc-900"
    data-name="Dashboard"
>
    <!-- Mobile Drawer Overlay -->
    {#if $isMenuOpen}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
            class="fixed inset-0 bg-black/50 z-50 md:hidden"
            transition:fade={{ duration: 200 }}
            onclick={() => isMenuOpen.set(false)}
        ></div>
        <div 
            class="fixed inset-y-0 left-0 w-full max-w-[18rem] z-50 md:hidden bg-white dark:bg-zinc-900 shadow-2xl"
            transition:fly={{ x: -300, duration: 300 }}
        >
            <Sidebar />
        </div>
    {/if}

    <!-- Sidebar Area (Desktop) -->
    <div
        class="hidden md:flex justify-end h-full w-[max(12.5rem,calc((100vw-90rem)/2+12.5rem))]"
    >
        <Sidebar />
    </div>

    <!-- Main Content Area -->
    <div class="relative flex-1 h-full bg-zinc-100 dark:bg-zinc-950 flex flex-col overflow-hidden">
        <MobileHeader />
        
        <div class="relative flex-1 h-full overflow-hidden">
            <!-- Glowing background watermark -->
            <div
                class="absolute -translate-y-[7.65625rem] blur-[0.625rem] opacity-20 dark:opacity-10 right-[-12.8125rem] size-[65.3125rem] top-1/2 pointer-events-none select-none mix-blend-multiply dark:mix-blend-screen z-0"
            >
                <img
                    src="/logo.png"
                    alt="watermark logo"
                    class="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                />
            </div>

            <main
                class="relative z-10 mx-auto flex h-full flex-col gap-[0.625rem] py-8 md:py-[3.125rem] px-4 md:px-[1.875rem] overflow-auto"
            >
                {@render children()}
            </main>
        </div>
    </div>
</div>
