<script lang="ts">
    import { i18n } from "$lib/i18n.svelte";
    import RulesContent from "$lib/components/rules/RulesContent.svelte";
</script>

<div
    class="content-stretch flex flex-[1_0_0] flex-col gap-[1.5625rem] h-full items-start min-h-px min-w-px relative"
>
    <div class="content-stretch flex items-start relative shrink-0 w-full">
        <div
            class="content-stretch flex flex-col gap-[0.625rem] items-start justify-center leading-tight relative shrink-0"
        >
            <h1
                class="font-pretendard font-bold relative shrink-0 text-zinc-800 dark:text-zinc-100 text-[2rem] m-0"
            >
                {i18n.t({ ko: "규정 읽기", en: "Rules" })}
            </h1>
            <div
                class="font-pretendard font-normal relative shrink-0 text-zinc-600 dark:text-zinc-400 text-[0.875rem] whitespace-nowrap"
            >
                <p class="m-0">
                    {i18n.t({ ko: '공정한 경기 운영을 위해 아래 규정을 반드시 확인해주세요.', en: 'Please check the rules below for fair play.' })}
                </p>
                <p class="m-0">
                    {i18n.t({ ko: '규정 미숙지 시 실격 등 불이익을 받을 수 있으니 각별히 유의해 주세요.', en: 'Failure to comply with rules may result in disqualification.' })}
                </p>
            </div>
        </div>
    </div>

    <div
        class="bg-white dark:bg-zinc-900 content-stretch flex flex-[1_0_0] flex-col items-center min-h-px min-w-px overflow-hidden relative rounded-[1.25rem] shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] dark:shadow-none w-full"
    >
        <div
            class="flex-[1_0_0] min-h-px min-w-px overflow-hidden relative w-full p-[3rem]"
        >
            <div
                class="flex-[1_0_0] min-h-px min-w-px overflow-hidden overflow-y-auto relative w-full h-full"
            >
                <div
                    class="flex flex-col gap-[0.625rem] items-start leading-[normal] text-zinc-800 dark:text-zinc-100 w-full"
                >
                    <h2
                        class="font-pretendard font-bold relative shrink-0 text-[1.6rem] m-0 mb-[0.625rem]"
                    >
                        {i18n.t({ ko: '2026 새내기 체육 대회 운영 규정', en: '2026 Freshman Sports Rules' })}
                    </h2>

                    <div
                        class="flex-[1_0_0] font-pretendard font-normal min-h-px min-w-px relative text-[1rem] w-full"
                    >
                        <RulesContent />
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
