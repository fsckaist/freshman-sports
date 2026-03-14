<script lang="ts">
    import Sidebar from "$lib/components/layout/Sidebar.svelte";
    import ToastContainer from "$lib/components/ui/ToastContainer.svelte";
    import { browser } from "$app/environment";
    let { children } = $props();
</script>

{#if browser}
    <ToastContainer />
{/if}

<div
    class="flex h-screen w-full overflow-hidden bg-white dark:bg-zinc-900"
    data-name="Dashboard"
>
    <!-- Sidebar Area (White Background extends to the left edge) -->
    <div
        class="flex justify-end h-full w-[max(12.5rem,calc((100vw-90rem)/2+12.5rem))]"
    >
        <Sidebar />
    </div>

    <!-- Main Content Area (Gray Background) -->
    <div class="relative flex-1 h-full bg-zinc-100 dark:bg-zinc-950">
        <!-- Glowing background watermark from the Figma extraction -->
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
            class="relative z-10 mx-auto flex h-full flex-col gap-[0.625rem] py-[3.125rem] px-[1.875rem]"
        >
            {@render children()}
        </main>
    </div>
</div>
