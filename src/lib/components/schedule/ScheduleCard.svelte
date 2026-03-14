<script lang="ts">
    let {
        title = "풋살 A조",
        time = "MM월 DD일 HH시 MM분",
        status = "진행", // 진행 (Ongoing), 예정 (Scheduled), 승리 (Win), 패배 (Loss)
        teamA = "1반",
        teamB = "99반",
        location = "북측 풋살장 A",
        players = "홍길동, 김철수, 김민수, 박지훈, 최현우",
    } = $props();

    // Mapping Status Tokens
    const statusConfig = {
        진행: {
            borderClass: "border border-rose-500",
            badgeBgClass: "bg-rose-500",
            badgeTextClass: "text-rose-100",
            opacityClass: "opacity-100",
        },
        예정: {
            borderClass: "border border-zinc-100 dark:border-zinc-800",
            badgeBgClass: "bg-amber-400",
            badgeTextClass: "text-amber-50",
            opacityClass: "opacity-100",
        },
        종료: {
            borderClass: "border border-zinc-100 dark:border-zinc-800",
            badgeBgClass: "bg-zinc-400",
            badgeTextClass: "text-zinc-100 dark:text-zinc-300",
            opacityClass: "opacity-30",
        },
    };

    const currentConfig = $derived(
        statusConfig[status as keyof typeof statusConfig] ||
            statusConfig["예정"],
    );

    import rawClockIcon from "@gravity-ui/icons/svgs/clock.svg?raw";
    import rawMapPinIcon from "@gravity-ui/icons/svgs/map-pin.svg?raw";

    const resizeSvgTo12 = (svg: string) =>
        svg.replace(
            'width="16" height="16"',
            'width="12" height="12" viewBox="0 0 16 16" class="text-current"',
        );

    const DateIcon = resizeSvgTo12(rawClockIcon);
    const LocationIcon = resizeSvgTo12(rawMapPinIcon);
</script>

<div
    class="bg-white dark:bg-zinc-900 border-solid flex flex-col gap-[0.625rem] items-start justify-center overflow-clip p-[1.25rem] rounded-[1.25rem] shrink-0 w-full relative {currentConfig.borderClass}"
>
    <!-- Header -->
    <div
        class="flex items-start justify-between shrink-0 w-full relative {currentConfig.opacityClass}"
    >
        <div class="flex flex-col gap-[0.5rem] items-start shrink-0 relative">
            <h3
                class="font-pretendard font-semibold leading-tight shrink-0 text-zinc-800 dark:text-zinc-100 text-[1.5rem] m-0"
            >
                {title}
            </h3>
            <div
                class="flex gap-[0.3125rem] items-center justify-center shrink-0"
            >
                <div
                    class="shrink-0 size-[0.75rem] relative text-zinc-800 dark:text-zinc-300 flex items-center justify-center"
                >
                    {@html DateIcon}
                </div>
                <p
                    class="font-pretendard font-normal leading-tight shrink-0 text-zinc-800 dark:text-zinc-300 text-[0.875rem] m-0"
                >
                    {time}
                </p>
            </div>
        </div>

        <!-- Status Badge -->
        <div
            class="flex flex-col items-center justify-center px-[0.5rem] py-[0.1875rem] rounded-[0.3125rem] shrink-0 mt-[0.25rem] {currentConfig.badgeBgClass}"
        >
            <p
                class="font-pretendard font-semibold leading-tight shrink-0 text-[0.875rem] m-0 {currentConfig.badgeTextClass}"
            >
                {status}
            </p>
        </div>
    </div>

    <div
        class="w-full h-[1px] shrink-0 relative bg-zinc-200 dark:bg-zinc-800 rounded-full my-[1px]"
    ></div>

    <!-- Content Area -->
    <div
        class="flex flex-col gap-[0.625rem] items-start shrink-0 w-full relative {currentConfig.opacityClass}"
    >
        <div class="flex items-start justify-between shrink-0 w-full relative">
            <!-- VS Score -->
            <div
                class="flex gap-[0.3125rem] items-center justify-center shrink-0 relative"
            >
                <p
                    class="font-pretendard font-semibold leading-tight shrink-0 text-zinc-600 dark:text-zinc-300 text-[0.875rem] m-0"
                >
                    {teamA}
                </p>
                <div
                    class="bg-zinc-400 dark:bg-zinc-600 flex flex-col items-center justify-center px-[0.1875rem] py-px rounded-[0.1875rem] shrink-0 relative"
                >
                    <span
                        class="font-pretendard font-bold leading-tight shrink-0 text-zinc-100 text-[0.5rem] tracking-widest pt-[1px]"
                    >
                        VS
                    </span>
                </div>
                <p
                    class="font-pretendard font-semibold leading-tight shrink-0 text-zinc-600 dark:text-zinc-300 text-[0.875rem] m-0"
                >
                    {teamB}
                </p>
            </div>

            <!-- Location -->
            <div
                class="flex gap-[0.1875rem] items-center justify-center shrink-0 relative"
            >
                <div
                    class="shrink-0 size-[0.75rem] relative text-zinc-600 dark:text-zinc-400 flex items-center justify-center"
                >
                    {@html LocationIcon}
                </div>
                <p
                    class="font-pretendard font-normal leading-tight shrink-0 text-zinc-600 dark:text-zinc-400 text-[0.75rem] m-0 pt-[1px]"
                >
                    {location}
                </p>
            </div>
        </div>

        <!-- Players -->
        <p
            class="font-pretendard font-normal leading-tight shrink-0 text-zinc-600 dark:text-zinc-500 text-[0.625rem] m-0 pt-[2px]"
        >
            선수 : {players}
        </p>
    </div>
</div>
