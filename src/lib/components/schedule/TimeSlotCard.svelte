<script lang="ts">
    import personSvg from "@gravity-ui/icons/svgs/person.svg?raw";
    import skullSvg from "@gravity-ui/icons/svgs/skull.svg?raw";
    import checkSvg from "@gravity-ui/icons/svgs/check.svg?raw";

    let {
        isAvailable = true,
        isVoted = false,
        ourCount = 0,
        ourMax = 5,
        oppCount = 0,
        oppMax = 5,
        participantNames = [],
    } = $props<{
        isAvailable?: boolean;
        isVoted?: boolean;
        ourCount?: number;
        ourMax?: number;
        oppCount?: number;
        oppMax?: number;
        participantNames?: string[];
    }>();

    // Scale down SVGs slightly for compactness
    const resizeSvg = (svg: string) =>
        svg
            .replace(/width="16"/g, 'width="14"')
            .replace(/height="16"/g, 'height="14"');

    // Derived states mapping to the old UI logic
    let isEmpty = $derived(!isAvailable);
    let isOurTeamAvailable = $derived(ourCount >= ourMax);
    let isOppTeamAvailable = $derived(oppCount >= oppMax);
    let isMatchAvailable = $derived(isOurTeamAvailable && isOppTeamAvailable);
    let isParticipating = $derived(isVoted);

    // Text for tooltip or name list
    let namesTooltip = $derived(
        participantNames.length > 0
            ? participantNames.join(", ")
            : "참여자 없음",
    );
</script>

<button
    type="submit"
    title={namesTooltip}
    class="flex flex-col relative shrink-0 h-[5rem] aspect-square rounded-[1.5625rem] border border-solid overflow-hidden select-none outline-none p-0 transition-opacity duration-200"
    class:border-zinc-300={isEmpty}
    class:border-amber-500={!isEmpty}
    class:cursor-pointer={!isEmpty}
    class:hover:opacity-60={!isEmpty}
    class:active:opacity-30={!isEmpty}
    disabled={isEmpty}
>
    {#if !isEmpty}
        <!-- VS Badge Area -->
        <div
            class="flex items-center justify-center w-full py-[0.25rem] shrink-0 border-b"
            class:border-zinc-300={!isMatchAvailable}
            class:border-amber-500={isMatchAvailable}
            class:bg-zinc-100={!isMatchAvailable}
            class:bg-amber-400={isMatchAvailable}
        >
            <div
                class="flex items-center justify-center px-[0.3125rem] py-px rounded-[0.3125rem]"
                class:bg-zinc-300={!isMatchAvailable}
                class:bg-amber-300={isMatchAvailable}
            >
                <p
                    class="font-pretendard font-extrabold text-[0.75rem] text-white m-0 leading-[0.75rem] tracking-wide"
                >
                    VS
                </p>
            </div>
        </div>

        <!-- Metrics Area -->
        <div class="flex flex-[1_0_0] w-full min-h-0 bg-white">
            <!-- Our Data -->
            <div
                class="flex flex-[1_0_0] flex-col items-center justify-center gap-px h-full relative border-r border-solid border-zinc-300"
            >
                <div
                    class="flex items-center justify-center leading-none w-[0.75rem] h-[0.75rem]"
                    class:text-emerald-500={isOurTeamAvailable}
                    class:text-zinc-400={!isOurTeamAvailable}
                >
                    {@html isOurTeamAvailable
                        ? resizeSvg(checkSvg)
                        : resizeSvg(personSvg)}
                </div>
                <div
                    class="flex items-center font-pretendard leading-none gap-px font-semibold text-[1rem]"
                >
                    <span
                        class={isOurTeamAvailable
                            ? "text-emerald-600"
                            : "text-zinc-800"}>{ourCount}</span
                    >
                    <span class="text-zinc-400">/{ourMax}</span>
                </div>
            </div>

            <!-- Opponent Data -->
            <div
                class="flex flex-[1_0_0] flex-col items-center justify-center gap-px h-full relative"
            >
                <div
                    class="flex items-center justify-center leading-none w-[0.75rem] h-[0.75rem]"
                    class:text-emerald-500={isOppTeamAvailable}
                    class:text-zinc-400={!isOppTeamAvailable}
                >
                    {@html isOppTeamAvailable
                        ? resizeSvg(checkSvg)
                        : resizeSvg(skullSvg)}
                </div>
                <div
                    class="flex items-center font-pretendard leading-none gap-px font-semibold text-[1rem]"
                >
                    <span
                        class={isOppTeamAvailable
                            ? "text-emerald-600"
                            : "text-zinc-800"}>{oppCount}</span
                    >
                    <span class="text-zinc-400">/{oppMax}</span>
                </div>
            </div>
        </div>

        <!-- Action / Status Background Footer -->
        <div
            class="flex items-center justify-center w-full py-[0.25rem] shrink-0 border-t border-solid transition-colors duration-200"
            class:bg-amber-100={isParticipating}
            class:bg-zinc-100={!isParticipating}
            class:border-amber-500={isParticipating}
            class:border-zinc-300={!isParticipating}
        >
            <p
                class="font-pretendard text-[0.75rem] font-semibold leading-normal m-0 leading-tight flex items-center justify-center gap-1"
                class:text-amber-500={isParticipating}
                class:text-zinc-400={!isParticipating}
            >
                {isParticipating ? "참여" : "미참여"}
            </p>
        </div>
    {/if}
</button>
