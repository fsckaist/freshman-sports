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
    class="flex items-center shrink-0 w-full overflow-hidden rounded-[1.25rem] bg-white shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] border border-zinc-200"
>
    {#each tabs as tab, i}
        <button
            type="button"
            onclick={() => (activeTab = tab.id)}
            class={cx([
                "flex flex-[1_0_0] items-center justify-center h-[3.125rem] cursor-pointer outline-none transition-colors duration-200",
                activeTab === tab.id
                    ? "bg-white text-zinc-800 zinc-800 border-amber-500"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 zinc-800 border-transparent border-t-0 border-l-0",
                i !== tabs.length - 1 ? "border-r border-zinc-200" : "",
            ])}
        >
            <p
                class="font-pretendard font-semibold text-[1rem] m-0 transition-colors duration-200"
            >
                {tab.label}
            </p>
        </button>
    {/each}
</div>
