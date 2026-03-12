<script lang="ts">
    import { page } from "$app/stores";

    export let matches: any[] = [];
    export let activeMatchId: string | null = null;

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
        return new Intl.DateTimeFormat("ko-KR", {
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        })
            .format(new Date(date))
            .replace("일 ", "일 ")
            .replace("에 ", " "); // e.g., 3월 9일 18:00
        // Wait, standard format might be MM월 DD일 HH시 MM분
    }

    function formatFigmaDate(date: Date) {
        const d = new Date(date);
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        return `${mm}월 ${dd}일 ${hh}시 ${min}분`;
    }

    function getCardStyles(status: string, isSelected: boolean) {
        if (isSelected) {
            return "bg-zinc-100 border border-amber-500 border-solid";
        }
        if (status === "ONGOING") {
            return "bg-white border border-red-500 border-solid";
        }
        return "bg-white border border-transparent";
    }

    function getBadgeStyles(status: string) {
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

    function getBadgeText(status: string) {
        switch (status) {
            case "ONGOING":
                return "진행";
            case "SCHEDULED":
                return "예정";
            case "FINISHED":
                return "종료";
            default:
                return status;
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
                        class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-zinc-800 text-[1.5rem] whitespace-nowrap"
                    >
                        {match.sportName}{match.name &&
                        match.name.includes("조")
                            ? ` ${match.name.split(" ")[0]}조`
                            : ""}
                        {#if match.name && !match.name.includes("조")}
                            <span class="text-lg text-zinc-500 ml-2"
                                >{match.name}</span
                            >
                        {/if}
                    </p>
                    <div
                        class="content-stretch flex gap-[0.3125rem] items-center justify-center relative shrink-0"
                    >
                        <div
                            class="shrink-0 size-[0.75rem] relative text-zinc-800 flex items-center justify-center"
                        >
                            {@html DateIcon}
                        </div>
                        <p
                            class="font-['Pretendard_Variable'] font-normal leading-[normal] relative shrink-0 text-zinc-800 text-[0.875rem] whitespace-nowrap"
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
                        class="font-['Pretendard_Variable'] font-normal leading-[normal] relative shrink-0 text-zinc-800 text-[0.875rem] whitespace-nowrap"
                    >
                        담당자 : 홍길동
                    </p>
                </div>
            </div>

            <!-- Divider Line -->
            <div class="h-px w-full bg-zinc-200 shrink-0"></div>

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
                            class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-zinc-500 text-[0.875rem] whitespace-nowrap"
                        >
                            {match.classA ? `${match.classA}반` : "미정"}
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
                            class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-zinc-500 text-[0.875rem] whitespace-nowrap"
                        >
                            {match.classB ? `${match.classB}반` : "미정"}
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
                            class="font-['Pretendard_Variable'] font-normal leading-[normal] relative shrink-0 text-zinc-500 text-[0.75rem] whitespace-nowrap"
                        >
                            {match.location || "북측 풋살장 A (임시)"}
                        </p>
                    </div>
                </div>

                <div
                    class="content-stretch flex flex-col font-['Pretendard_Variable'] font-normal gap-[0.3125rem] items-start leading-[normal] relative shrink-0 text-zinc-500 text-[0.625rem]"
                >
                    <p
                        class="relative shrink-0 whitespace-nowrap truncate w-full max-w-[30rem]"
                    >
                        {match.classA ? `${match.classA}반` : "미정"} 선수 (예정)
                        : {match.attendance?.teamA
                            ?.map((t: any) => t.name)
                            .join(", ") || "미정"}
                    </p>
                    <p
                        class="relative shrink-0 whitespace-nowrap truncate w-full max-w-[30rem]"
                    >
                        {match.classB ? `${match.classB}반` : "미정"} 선수 (예정)
                        : {match.attendance?.teamB
                            ?.map((t: any) => t.name)
                            .join(", ") || "미정"}
                    </p>
                </div>

                <div
                    class="content-stretch flex flex-col items-start relative shrink-0"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-normal leading-[normal] relative shrink-0 text-zinc-500 text-[0.625rem] whitespace-nowrap"
                    >
                        심판 : {match.refereeName || "미정"}
                    </p>
                </div>
            </div>
        </a>
    {/each}

    {#if matches.length === 0}
        <div
            class="text-center p-8 w-full rounded-lg bg-white border border-zinc-200 border-dashed text-zinc-500 text-sm"
        >
            등록된 경기가 없습니다.
        </div>
    {/if}
</div>
