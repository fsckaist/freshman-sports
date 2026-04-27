<script lang="ts">
    import { i18n } from "$lib/i18n.svelte";

    let {
        title = i18n.t({ ko: "데모 경기", en: "Demo Match" }),
        time = i18n.t({ ko: "월 일 시 분", en: "MM/DD HH:MM" }),
        status = "진행", // 진행 (Ongoing), 예정 (Scheduled), 승리 (Win), 패배 (Loss)
        teamA = i18n.t({ ko: "A반", en: "Class A" }),
        teamB = i18n.t({ ko: "B반", en: "Class B" }),
        location = i18n.t({ ko: "미정", en: "TBD" }),
        players = i18n.t({
            ko: "선수단 전체",
            en: "All Players",
        }),
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
                class="font-pretendard font-semibold leading-tight shrink-0 text-zinc-800 dark:text-zinc-100 text-[1.25rem] m-0"
            >
                {i18n.decode(title)}
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
                {status === "진행"
                    ? i18n.t({ ko: "진행", en: "Ongoing" })
                    : status === "예정"
                      ? i18n.t({ ko: "예정", en: "Scheduled" })
                      : status === "종료"
                        ? i18n.t({ ko: "종료", en: "Ended" })
                        : status}
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
                    {i18n.decode(teamA)}
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
                    {i18n.decode(teamB)}
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
                    {i18n.decode(location)}
                </p>
            </div>
        </div>

        <!-- Players -->
        <p
            class="font-pretendard font-normal leading-tight shrink-0 text-zinc-600 dark:text-zinc-500 text-[0.625rem] m-0 pt-[2px]"
        >
            {i18n.t({ ko: "선수 : ", en: "Players: " })}{players}
        </p>
    </div>
</div>
