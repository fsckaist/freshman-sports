<script lang="ts">
    import SportApplyCard from "$lib/components/apply/SportApplyCard.svelte";
    import type { PageData } from "./$types";
    import { i18n } from "$lib/i18n.svelte";

    let { data } = $props<{ data: PageData }>();
</script>

<div
    class="flex flex-col gap-6 md:gap-[1.5625rem] h-full lg:items-start min-h-px min-w-px w-full relative"
>
    <!-- Header -->
    <div
        class="flex flex-col md:flex-row items-start justify-between gap-4 leading-[normal] relative shrink-0 w-full"
    >
        <div
            class="flex flex-col gap-[0.625rem] items-start justify-center relative min-w-0 flex-1"
        >
            <h1
                class="font-pretendard font-bold relative text-zinc-800 dark:text-zinc-100 text-[1.75rem] md:text-[2rem] m-0 leading-tight"
            >
                {i18n.t({ ko: "선수 지원하기", en: "Apply for Sports" })}
            </h1>
            <div
                class="font-pretendard font-normal relative w-full text-zinc-600 dark:text-zinc-400 text-sm md:text-[0.875rem] m-0 leading-tight break-keep"
            >
                <p class="m-0">
                    {i18n.t({
                        ko: "새내기 체육 대회는 총 4가지의 종목으로 구성 돼요. 자신이 참가하고 싶은 종목을 선택해주세요.",
                        en: "Freshman Sports consists of 4 main sports. Please select the sports you want to participate in.",
                    })}
                </p>
                <p class="m-0">
                    {i18n.t({
                        ko: "각 종목은 인원수 제한이 있으며, 먼저 새터반 내에서 합의를 하신 후 신청하는걸 권장해요.",
                        en: "Each sport has a player limit, so we recommend discussing with your class before applying.",
                    })}
                </p>
            </div>
        </div>
        <div
            class="flex flex-col font-pretendard font-normal gap-[0.1875rem] items-start md:items-end relative shrink-0 text-zinc-600 dark:text-zinc-400 text-sm md:text-[0.875rem]"
        >
            <p class="relative shrink-0 m-0">
                {i18n.t({
                    ko: "종목 지원은 ",
                    en: "Application deadline is ",
                })}{i18n.decode(data.deadlineDate)}{i18n.t({
                    ko: "까지 할 수 있어요.",
                    en: ".",
                })}
            </p>
            <p class="relative shrink-0 m-0">
                {i18n.t({ ko: "마감까지 ", en: "" })}{i18n.decode(
                    data.timeRemaining,
                )}
                {i18n.t({ ko: "남았어요.", en: "left until deadline." })}
            </p>
        </div>
    </div>

    <!-- Apply Cards Container -->
    <div
        class="flex flex-col lg:flex-[1_0_0] gap-5 lg:items-start lg:min-h-px lg:min-w-px lg:relative w-full lg:h-full lg:pb-[0.625rem] lg:flex-row"
    >
        {#each data.sports as sport}
            <SportApplyCard
                id={sport.id}
                title={sport.title}
                currentSpots={sport.currentSpots}
                maxSpots={sport.maxSpots}
                descriptionLines={sport.descriptionLines}
                rosters={sport.rosters}
                buttonState={sport.buttonState}
                alertMessage={sport.alertMessage}
                requiredGender={sport.requiredGender}
            />
        {/each}
    </div>
</div>
