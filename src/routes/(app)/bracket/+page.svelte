<script lang="ts">
    import BracketGrid from "$lib/components/bracket/BracketGrid.svelte";
    import { i18n } from "$lib/i18n.svelte";
    export let data;
</script>

<div
    class="flex-1 flex flex-col gap-6 md:gap-[1.5625rem] h-full items-start min-h-px min-w-px relative w-full"
>
    <!-- Header -->
    <div class="flex items-start relative shrink-0 w-full">
        <div
            class="flex flex-col gap-[0.625rem] items-start justify-center leading-tight relative shrink-0"
        >
            <h1
                class="font-pretendard font-bold relative shrink-0 text-zinc-800 dark:text-zinc-100 text-[1.75rem] md:text-[2rem] m-0"
            >
                {i18n.t({ ko: '대진표 보기', en: 'Brackets' })}
            </h1>
            <div
                class="font-pretendard font-normal relative shrink-0 text-zinc-600 dark:text-zinc-400 text-sm md:text-[0.875rem] m-0 leading-tight"
            >
                <p class="m-0">
                    {i18n.t({ ko: '아래 화면에서 새내기 체육대회 대진표를 확인하세요.', en: 'Check the Freshman Sports brackets below.' })}
                </p>
                <p class="m-0">
                    {i18n.t({ ko: '여러분들의 반은 사람 아이콘이 함께 표시되어 쉽게 구분할 수 있어요.', en: 'Your class is marked with a person icon for easy identification.' })}
                </p>
            </div>
        </div>
    </div>

    <!-- Main Card Body -->
    <div
        class="bg-white dark:bg-zinc-900 content-stretch flex flex-[1_0_0] flex-col gap-[1.25rem] items-center min-h-0 min-w-px overflow-clip pb-[1.25rem] relative rounded-[1.25rem] shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] dark:shadow-none w-full max-w-full"
    >
        <!-- Scrollable Bracket Container -->
        <div
            class="content-stretch flex flex-col items-start min-h-0 min-w-px overflow-auto relative w-full flex-1 touch-pan-x touch-pan-y"
        >
            <BracketGrid bracketDataBySport={data.bracketDataBySport} />
        </div>
    </div>
</div>
