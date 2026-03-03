<script lang="ts">
    import SportApplyCard from "$lib/components/apply/SportApplyCard.svelte";
    import type { PageData } from "./$types";

    let { data } = $props<{ data: PageData }>();
</script>

<div
    class="flex flex-col gap-[1.5625rem] h-full items-start min-h-px min-w-px w-full relative"
>
    <!-- Header -->
    <div
        class="flex items-start justify-between leading-[normal] relative shrink-0 w-full"
    >
        <div
            class="flex flex-col gap-[0.625rem] items-start justify-center relative shrink-0"
        >
            <h1
                class="font-pretendard font-bold relative shrink-0 text-zinc-800 text-[2rem] m-0 leading-tight"
            >
                선수 지원하기
            </h1>
            <div
                class="font-pretendard font-normal relative shrink-0 text-zinc-600 text-[0.875rem] whitespace-nowrap m-0 leading-tight"
            >
                <p class="m-0">
                    새내기 체육 대회는 총 4가지의 종목으로 구성 돼요. 자신이
                    참가하고 싶은 종목을 선택해주세요.
                </p>
                <p class="m-0">
                    각 종목은 인원수 제한이 있으며, 먼저 새터반 내에서 합의를
                    하신 후 신청하는걸 권장해요.
                </p>
            </div>
        </div>
        <div
            class="flex flex-col font-pretendard font-normal gap-[0.1875rem] items-end relative shrink-0 text-zinc-600 text-[0.875rem]"
        >
            <p class="relative shrink-0 m-0">
                종목 지원은 {data.deadlineDate}까지 할 수 있어요.
            </p>
            <p class="relative shrink-0 m-0">
                마감까지 {data.daysRemaining}일 남았어요.
            </p>
        </div>
    </div>

    <!-- Apply Cards Container -->
    <div
        class="flex flex-[1_0_0] gap-[1.25rem] items-start min-h-px min-w-px relative w-full h-full pb-[0.625rem]"
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
            />
        {/each}
    </div>
</div>
