<script lang="ts">
    import { isMenuOpen } from "$lib/stores/nav";
    import barsIcon from "@gravity-ui/icons/svgs/bars.svg?raw";
    import { i18n } from "$lib/i18n.svelte";

    const logoUrl = "/logo.png";
</script>

<header
    class="flex md:hidden items-center gap-1 px-3 h-14 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-40 w-full"
>
    <button
        onclick={() => isMenuOpen.set(true)}
        class="flex items-center justify-center size-10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        aria-label="Open menu"
    >
        <div class="size-6 flex items-center justify-center">
            {@html barsIcon}
        </div>
    </button>

    <div class="flex items-center gap-2">
        <h1
            class="font-pretendard font-bold text-neutral-800 dark:text-zinc-100 text-lg leading-tight"
        >
            {i18n.t({ ko: "새내기 체육 대회", en: "Freshman Sports" })}
        </h1>
    </div>
</header>
