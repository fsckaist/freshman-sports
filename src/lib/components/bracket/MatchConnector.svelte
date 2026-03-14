<script lang="ts">
    export let nodeOffset: string = "1.125rem"; // Distance from top edge of pair wrapper to center of top node
</script>

<div
    class="absolute right-[-1.25rem] w-[1.25rem] z-0 pointer-events-none"
    style="top: {nodeOffset}; bottom: {nodeOffset};"
>
    <!-- SVG precisely matches the center of the nodes and draws a matching cubic bezier bracket -->
    <svg
        class="w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 20 100"
        overflow="visible"
    >
        <path
            d="M 0 0 C 10 0 10 50 20 50"
            class="stroke-zinc-400 dark:stroke-zinc-600"
            stroke-width="2"
            fill="none"
            vector-effect="non-scaling-stroke"
        />
        <path
            d="M 0 100 C 10 100 10 50 20 50"
            class="stroke-zinc-400 dark:stroke-zinc-600"
            stroke-width="2"
            fill="none"
            vector-effect="non-scaling-stroke"
        />
    </svg>
</div>
