<script lang="ts">
    import { i18n } from "$lib/i18n.svelte";
    const { activeMatch } = $props();

    import rawTrophyIcon from "@gravity-ui/icons/svgs/cup.svg?raw";
    import rawClockIcon from "@gravity-ui/icons/svgs/clock.svg?raw";
    import rawTrendingUpIcon from "@gravity-ui/icons/svgs/chart-line.svg?raw";

    const resizeSvgTo16 = (svg: string) =>
        svg.replace(
            'width="16" height="16"',
            'width="16" height="16" viewBox="0 0 16 16" class="text-current"',
        );

    const TrophyIcon = resizeSvgTo16(rawTrophyIcon);
    const ClockIcon = resizeSvgTo16(rawClockIcon);
    const TrendingUpIcon = resizeSvgTo16(rawTrendingUpIcon);

    // Group logs by time or type if needed, but for now just show them
    const logs = $derived(
        [...(activeMatch?.MatchLog || [])].sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        ),
    );

    function formatTime(date: string) {
        const d = new Date(date);
        return d.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    }

    function getLogIcon(type: string) {
        switch (type) {
            case "SCORE":
                return TrophyIcon;
            case "TIME":
                return ClockIcon;
            default:
                return TrendingUpIcon;
        }
    }

    function getLogColor(type: string, teamId: string | null) {
        if (type === "SCORE") {
            return teamId === activeMatch.classAId
                ? "text-rose-500 fill-rose-500"
                : "text-blue-500 fill-blue-500";
        }
        return "text-zinc-400 fill-zinc-400";
    }

    function getTeamName(teamId: string | null) {
        if (teamId === activeMatch.classAId)
            return `${activeMatch.classA}${i18n.t({ ko: "반", en: "" })}`;
        if (teamId === activeMatch.classBId)
            return `${activeMatch.classB}${i18n.t({ ko: "반", en: "" })}`;
        return i18n.t({ ko: "공통", en: "Common" });
    }
</script>

<div class="flex flex-col gap-6 w-full max-w-2xl">
    <!-- Score Board -->
    <div
        class="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-zinc-100 dark:border-zinc-800"
    >
        <div class="flex items-center justify-between gap-4">
            <!-- Team A -->
            <div class="flex-1 flex flex-col items-center gap-3">
                <div
                    class="size-16 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500 font-bold text-2xl border border-rose-100 dark:border-rose-900/30"
                >
                    {activeMatch.classA}
                </div>
                <span
                    class="font-bold text-zinc-700 dark:text-zinc-200 text-lg"
                >
                    {activeMatch.classA}{i18n.t({ ko: "반", en: "" })}
                </span>
            </div>

            <!-- Score -->
            <div class="flex flex-col items-center gap-1">
                <div
                    class="flex items-center gap-4 text-5xl font-black text-zinc-800 dark:text-zinc-100 tabular-nums italic"
                >
                    <span>{activeMatch.scoreA}</span>
                    <span class="text-zinc-200 dark:text-zinc-700 not-italic"
                        >:</span
                    >
                    <span>{activeMatch.scoreB}</span>
                </div>
                {#if activeMatch.status === "ONGOING"}
                    <span
                        class="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse"
                    >
                        LIVE
                    </span>
                {:else if activeMatch.status === "FINISHED"}
                    <span
                        class="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-bold rounded-full"
                    >
                        {i18n.t({ ko: "종료됨", en: "FINISHED" })}
                    </span>
                {/if}
            </div>

            <!-- Team B -->
            <div class="flex-1 flex flex-col items-center gap-3">
                <div
                    class="size-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 font-bold text-2xl border border-blue-100 dark:border-blue-900/30"
                >
                    {activeMatch.classB}
                </div>
                <span
                    class="font-bold text-zinc-700 dark:text-zinc-200 text-lg"
                >
                    {activeMatch.classB}{i18n.t({ ko: "반", en: "" })}
                </span>
            </div>
        </div>
    </div>

    <!-- Match Info -->
    <div class="grid grid-cols-2 gap-4">
        <div
            class="bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 flex flex-col gap-1"
        >
            <span class="text-xs text-zinc-400 font-medium uppercase tracking-wider"
                >{i18n.t({ ko: "장소", en: "LOCATION" })}</span
            >
            <span class="font-bold text-zinc-700 dark:text-zinc-200"
                >{i18n.decode(activeMatch.location)}</span
            >
        </div>
        <div
            class="bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 flex flex-col gap-1"
        >
            <span class="text-xs text-zinc-400 font-medium uppercase tracking-wider"
                >{i18n.t({ ko: "심판", en: "REFEREE" })}</span
            >
            <span class="font-bold text-zinc-700 dark:text-zinc-200"
                >{activeMatch.refereeName ||
                    i18n.t({ ko: "미정", en: "TBD" })}</span
            >
        </div>
    </div>

    <!-- Timeline -->
    <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
            <h3 class="font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <span class="size-2 rounded-full bg-amber-500"></span>
                {i18n.t({ ko: "경기 기록", en: "Match Records" })}
            </h3>
            <span class="text-xs text-zinc-400"
                >{logs.length} {i18n.t({ ko: "개의 기록", en: "records" })}</span
            >
        </div>

        <div class="flex flex-col gap-3">
            {#each logs as log}
                <div
                    class="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 flex items-center gap-4 group hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                    <div
                        class="size-10 rounded-xl flex items-center justify-center shrink-0 {getLogColor(
                            log.type,
                            log.teamId,
                        )} bg-zinc-50 dark:bg-zinc-800"
                    >
                        {@html getLogIcon(log.type)}
                    </div>

                    <div class="flex-1 flex flex-col gap-0.5">
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-zinc-700 dark:text-zinc-200"
                                >{i18n.decode(log.message)}</span
                            >
                            {#if log.teamId}
                                <span
                                    class="px-1.5 py-0.5 rounded text-[10px] font-black uppercase {log.teamId ===
                                    activeMatch.classAId
                                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'
                                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}"
                                >
                                    {getTeamName(log.teamId)}
                                </span>
                            {/if}
                        </div>
                        <span class="text-xs text-zinc-400"
                            >{formatTime(log.createdAt)}</span
                        >
                    </div>

                    <div
                        class="text-right flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <span class="text-[10px] text-zinc-300 font-mono"
                            >#{log.id.slice(-4).toUpperCase()}</span
                        >
                    </div>
                </div>
            {:else}
                <div
                    class="py-12 flex flex-col items-center justify-center gap-3 bg-zinc-50/30 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800"
                >
                    <div class="text-zinc-300 dark:text-zinc-700">
                        {@html TrendingUpIcon.replace('width="16" height="16"', 'width="32" height="32"')}
                    </div>
                    <p class="text-sm text-zinc-400 font-medium">
                        {i18n.t({ ko: "아직 기록된 내용이 없습니다.", en: "No records yet." })}
                    </p>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    /* Optional: Custom scrollbar for timeline if it gets too long */
    :global(.timeline-container::-webkit-scrollbar) {
        width: 4px;
    }
    :global(.timeline-container::-webkit-scrollbar-track) {
        background: transparent;
    }
    :global(.timeline-container::-webkit-scrollbar-thumb) {
        background: #e4e4e7;
        border-radius: 10px;
    }
    :global(.dark .timeline-container::-webkit-scrollbar-thumb) {
        background: #27272a;
    }
</style>
