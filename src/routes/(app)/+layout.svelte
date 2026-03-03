<script lang="ts">
    import Sidebar from "$lib/components/layout/Sidebar.svelte";
    let { children } = $props();
</script>

<div
    class="flex h-screen w-full overflow-hidden bg-white"
    data-name="Dashboard"
>
    <!-- Sidebar Area (White Background extends to the left edge) -->
    <div
        class="flex justify-end h-full w-[max(12.5rem,calc((100vw-90rem)/2+12.5rem))]"
    >
        <Sidebar />
    </div>

    <!-- Main Content Area (Gray Background) -->
    <div class="relative flex-1 h-full bg-zinc-100">
        <!-- Glowing background watermark from the Figma extraction -->
        <div
            class="absolute -translate-y-[7.65625rem] blur-[0.625rem] opacity-20 right-[-12.8125rem] size-[65.3125rem] top-1/2 pointer-events-none select-none mix-blend-multiply z-0"
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
