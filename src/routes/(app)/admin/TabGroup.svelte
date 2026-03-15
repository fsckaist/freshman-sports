<script lang="ts">
    let {
        tabs = [],
        activeTab = $bindable(""),
    }: {
        tabs: { id: string; label: string }[];
        activeTab: string;
    } = $props();

    function cx(classes: (string | boolean | undefined | null)[]) {
        return classes.filter(Boolean).join(" ");
    }
</script>

<div
    class="flex items-stretch shrink-0 w-full overflow-hidden rounded-[1.25rem] bg-white dark:bg-zinc-900 shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] dark:shadow-none border border-zinc-200 dark:border-zinc-800"
>
    {#each tabs as tab, i}
        <button
            type="button"
            onclick={() => (activeTab = tab.id)}
            class={cx([
                "flex flex-[1_0_0] items-center justify-center min-h-[3.125rem] p-2 cursor-pointer outline-none transition-colors duration-200",
                activeTab === tab.id
                    ? "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border-amber-500"
                    : "bg-zinc-100 dark:bg-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-transparent border-t-0 border-l-0",
                i !== tabs.length - 1 ? "border-r border-zinc-200 dark:border-zinc-800" : "",
            ])}
        >
            <p
                class="font-pretendard font-semibold text-[1rem] m-0 transition-colors duration-200 break-keep whitespace-normal text-center"
            >
                {tab.label}
            </p>
        </button>
    {/each}
</div>
