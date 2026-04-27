<script lang="ts">
    import { page } from "$app/stores";
    import { i18n } from "$lib/i18n.svelte";
    export let activeMatchId: string | null = null;

    interface Player {
        name: string | null;
    }

    interface Attendance {
        teamA: Player[];
        plannedTeamA: Player[];
        teamB: Player[];
        plannedTeamB: Player[];
    }

    interface Match {
        id: string;
        status: string | null;
        name: string | null;
        location: string | null;
        matchNotes: string | null;
        sportName: string;
        startTime: Date;
        classA: number | null;
        classB: number | null;
        classAId: string | null;
        classBId: string | null;
        refereeName: string | null;
        refereePhone: string | null;
        managerName: string | null;
        attendance?: Attendance;
    }

    export let matches: Match[] = [];

    import rawClockIcon from "@gravity-ui/icons/svgs/clock.svg?raw";
    import rawMapPinIcon from "@gravity-ui/icons/svgs/map-pin.svg?raw";

    const resizeSvgTo12 = (svg: string) =>
        svg.replace(
            'width="16" height="16"',
            'width="12" height="12" viewBox="0 0 16 16" class="text-current"',
        );

    const DateIcon = resizeSvgTo12(rawClockIcon);
    const LocationIcon = resizeSvgTo12(rawMapPinIcon);

    function formatDate(date: Date) {
        const d = new Date(date);
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        return i18n.t({
            ko: `${mm}월 ${dd}일 ${hh}시 ${min}분`,
            en: `${mm}/${dd} ${hh}:${min}`,
        });
    }

    function formatFigmaDate(date: Date) {
        const d = new Date(date);
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        return i18n.t({
            ko: `${mm}월 ${dd}일 ${hh}시 ${min}분`,
            en: `${mm}/${dd} ${hh}:${min}`,
        });
    }

    function getCardStyles(status: string | null, isSelected: boolean) {
        if (isSelected) {
            return "bg-zinc-100 dark:bg-zinc-800 border border-amber-500 border-solid";
        }
        if (status === "ONGOING") {
            return "bg-white dark:bg-zinc-900 border border-red-500 border-solid shadow-[0_0_10px_rgba(239,68,68,0.2)]";
        }
        return "bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800";
    }

    function getBadgeStyles(status: string | null) {
        switch (status) {
            case "ONGOING":
                return "bg-red-500 text-red-100";
            case "SCHEDULED":
                return "bg-amber-500 text-amber-50";
            case "FINISHED":
                return "bg-zinc-400 text-zinc-100";
            default:
                return "bg-zinc-400 text-zinc-100";
        }
    }

    function getBadgeText(status: string | null) {
        switch (status) {
            case "ONGOING":
                return i18n.t({ ko: "진행", en: "Ongoing" });
            case "SCHEDULED":
                return i18n.t({ ko: "예정", en: "Scheduled" });
            case "FINISHED":
                return i18n.t({ ko: "종료", en: "Ended" });
            default:
                return status || i18n.t({ ko: "미정", en: "TBD" });
        }
    }
</script>

<div class="flex flex-col gap-[0.625rem] w-full items-start">
    {#each matches as match}
        {@const isSelected = activeMatchId === match.id}
        {@const cardStyle = getCardStyles(match.status, isSelected)}
        {@const isCompleted = match.status === "FINISHED"}

        <a
            href="?matchId={match.id}"
            class={`content-stretch flex flex-col gap-[0.625rem] items-start justify-center overflow-clip p-[1.25rem] relative rounded-[1.25rem] w-full transition-all duration-200 ${cardStyle} ${isCompleted && !isSelected ? "opacity-60 hover:opacity-100" : ""}`}
        >
            <!-- Header -->
            <div
                class="content-stretch flex items-start justify-between relative shrink-0 w-full"
            >
                <!-- Title & Date -->
                <div
                    class="content-stretch flex flex-col gap-[0.625rem] items-start relative shrink-0"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-zinc-800 dark:text-zinc-100 text-[1.0rem] whitespace-nowrap"
                    >
                        {i18n.decode(match.sportName)}
                        {#if match.name}
                            <span class="text-zinc-500 dark:text-zinc-400 ml-2">
                                {i18n.decode(match.name)}
                            </span>
                        {/if}
                    </p>
                    <div
                        class="content-stretch flex gap-[0.3125rem] items-center justify-center relative shrink-0"
                    >
                        <div
                            class="shrink-0 size-[0.75rem] relative text-zinc-800 dark:text-zinc-300 flex items-center justify-center"
                        >
                            {@html DateIcon}
                        </div>
                        <p
                            class="font-['Pretendard_Variable'] font-normal leading-[normal] relative shrink-0 text-zinc-800 dark:text-zinc-300 text-[0.875rem] whitespace-nowrap"
                        >
                            {formatFigmaDate(match.startTime)}
                        </p>
                    </div>
                </div>

                <!-- State & Manager -->
                <div
                    class="content-stretch flex flex-col items-end justify-between relative self-stretch shrink-0"
                >
                    <div
                        class={`content-stretch flex flex-col items-center justify-center px-[0.5rem] py-[0.1875rem] relative rounded-[0.3125rem] shrink-0 ${getBadgeStyles(match.status)}`}
                    >
                        <p
                            class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-[0.875rem] whitespace-nowrap"
                        >
                            {getBadgeText(match.status)}
                        </p>
                    </div>
                    <p
                        class="font-['Pretendard_Variable'] font-normal leading-[normal] relative shrink-0 text-zinc-800 dark:text-zinc-400 text-[0.875rem] whitespace-nowrap"
                    >
                        {i18n.t({
                            ko: "담당자 : ",
                            en: "Manager: ",
                        })}{match.managerName ||
                            i18n.t({ ko: "미정", en: "TBD" })}
                    </p>
                </div>
            </div>

            <!-- Divider Line -->
            <div
                class="h-px w-full bg-zinc-200 dark:bg-zinc-800 shrink-0"
            ></div>

            <!-- Content -->
            <div
                class={`content-stretch flex flex-col gap-[0.625rem] items-start relative shrink-0 w-full`}
            >
                <div
                    class="content-stretch flex items-start justify-between relative shrink-0 w-full"
                >
                    <div
                        class="content-stretch flex gap-[0.3125rem] items-center justify-center relative shrink-0"
                    >
                        <p
                            class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-zinc-500 dark:text-zinc-400 text-[0.875rem] whitespace-nowrap"
                        >
                            {match.classA
                                ? `${i18n.t({ ko: "", en: "Class " })}${match.classA}${i18n.t({ ko: "반", en: "" })}`
                                : i18n.t({ ko: "미정", en: "TBD" })}
                        </p>
                        <div
                            class="bg-zinc-400 content-stretch flex flex-col items-center justify-center px-[0.1875rem] py-px relative rounded-[0.1875rem] shrink-0"
                        >
                            <p
                                class="font-['Pretendard_Variable'] font-bold leading-[normal] relative shrink-0 text-zinc-100 text-[0.5rem] whitespace-nowrap"
                            >
                                VS
                            </p>
                        </div>
                        <p
                            class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-zinc-500 dark:text-zinc-400 text-[0.875rem] whitespace-nowrap"
                        >
                            {match.classB
                                ? `${i18n.t({ ko: "", en: "Class " })}${match.classB}${i18n.t({ ko: "반", en: "" })}`
                                : i18n.t({ ko: "미정", en: "TBD" })}
                        </p>
                    </div>
                    <div
                        class="content-stretch flex gap-[0.1875rem] items-center justify-center relative shrink-0"
                    >
                        <div
                            class="shrink-0 size-[0.75rem] relative text-zinc-500 flex items-center justify-center"
                        >
                            {@html LocationIcon}
                        </div>
                        <p
                            class="font-['Pretendard_Variable'] font-normal leading-[normal] relative shrink-0 text-zinc-500 dark:text-zinc-400 text-[0.75rem] whitespace-nowrap"
                        >
                            {i18n.decode(match.location) ||
                                i18n.t({ ko: "미정", en: "TBD" })}
                        </p>
                    </div>
                </div>

                <div
                    class="content-stretch flex flex-col font-['Pretendard_Variable'] font-normal gap-[0.3125rem] items-start leading-[normal] relative shrink-0 text-zinc-500 dark:text-zinc-400 text-[0.625rem]"
                >
                    <p
                        class="relative shrink-0 whitespace-nowrap truncate w-full max-w-[30rem]"
                    >
                        {match.classA
                            ? `${i18n.t({ ko: "", en: "Class " })}${match.classA}${i18n.t({ ko: "반", en: "" })}`
                            : i18n.t({ ko: "미정", en: "TBD" })}
                        {i18n.t({
                            ko: "선수 (예정)",
                            en: "Players (Expected)",
                        })}
                        : {match.attendance?.plannedTeamA
                            ?.map((t) => t.name)
                            .concat(
                                match.attendance?.teamA?.map((t) => t.name) ||
                                    [],
                            )
                            .join(", ") || i18n.t({ ko: "미정", en: "TBD" })}
                    </p>
                    <p
                        class="relative shrink-0 whitespace-nowrap truncate w-full max-w-[30rem]"
                    >
                        {match.classB
                            ? `${i18n.t({ ko: "", en: "Class " })}${match.classB}${i18n.t({ ko: "반", en: "" })}`
                            : i18n.t({ ko: "미정", en: "TBD" })}
                        {i18n.t({
                            ko: "선수 (예정)",
                            en: "Players (Expected)",
                        })}
                        : {match.attendance?.plannedTeamB
                            ?.map((t) => t.name)
                            .concat(
                                match.attendance?.teamB?.map((t) => t.name) ||
                                    [],
                            )
                            .join(", ") || i18n.t({ ko: "미정", en: "TBD" })}
                    </p>
                </div>

                <div
                    class="content-stretch flex flex-col items-start relative shrink-0"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-normal leading-[normal] relative shrink-0 text-zinc-500 text-[0.625rem] whitespace-nowrap"
                    >
                        {i18n.t({
                            ko: "심판 : ",
                            en: "Referee: ",
                        })}{match.refereeName ||
                            i18n.t({
                                ko: "미정",
                                en: "TBD",
                            })}{#if match.refereeName && match.refereePhone}
                            &nbsp;({match.refereePhone})
                        {/if}
                    </p>
                </div>
            </div>
        </a>
    {/each}

    {#if matches.length === 0}
        <div
            class="text-center p-8 w-full rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 border-dashed text-zinc-500 dark:text-zinc-400 text-sm"
        >
            {i18n.t({
                ko: "등록된 경기가 없습니다.",
                en: "No matches registered.",
            })}
        </div>
    {/if}
</div>
