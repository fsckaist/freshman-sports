<script lang="ts">
    import TeamNode from "./TeamNode.svelte";
    import MatchConnector from "./MatchConnector.svelte";
    import { i18n } from "$lib/i18n.svelte";

    // Reusable Component Architecture:
    // This bracket dynamically fetches and renders matches based on `activeTab`
    export let activeTab: string = "futsal";
    export let bracketDataBySport: Record<string, Round[]> = {};

    // --- Types ---
    type TeamNodeData = {
        className: string;
        state: "win" | "lose" | "default";
        notAvailable?: boolean;
        ourTeam?: boolean;
    };

    type Match = {
        team1: TeamNodeData;
        team2: TeamNodeData;
    };

    type Round = {
        title: string;
        matches: Match[];
    };

    // --- State Variables ---
    let bracketData: Round[] = [];

    // --- Data Fetching Logic ---
    // Reactive statement to trigger an update whenever `activeTab` changes
    $: bracketData = bracketDataBySport[activeTab] || [];

    // Helper mapped arrays for MatchConnector offsets per round index to replicate the design
    const connectorOffsets = [
        undefined, // Round 1 (index 0) => MatchConnector uses default 1.125rem
        "2.9375rem", // Round 2
        "6.3125rem", // Round 3
        "13rem", // Semifinals
        "26.4375rem", // Finals
    ];

    function getConnectorOffset(roundIndex: number): string | undefined {
        return connectorOffsets[roundIndex];
    }
</script>

<div class="flex flex-col w-full h-full">
    <!-- Event Tabs (Tab UI rendering inside the dynamic Bracket component) -->
    <div
        class="border-zinc-300 dark:border-zinc-800 border-b border-solid flex items-stretch overflow-clip sticky top-0 w-full bg-zinc-100 dark:bg-zinc-950 z-10 m-0 p-0"
    >
        {#each [
            { id: "futsal", label: i18n.t({ ko: "풋살", en: "Futsal" }) },
            { id: "basketball", label: i18n.t({ ko: "농구", en: "Basketball" }) },
            {
                id: "badminton-m",
                label: i18n.t({ ko: "남자 배드민턴", en: "Men's Badminton" }),
            },
            {
                id: "badminton-w",
                label: i18n.t({ ko: "여자 배드민턴", en: "Women's Badminton" }),
            },
        ] as tab, index}
            <button
                on:click={() => (activeTab = tab.id)}
                class="flex flex-[1_0_0] flex-col min-h-[3.125rem] items-center justify-center px-4 py-[0.5rem] relative outline-none cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors m-0
                {activeTab === tab.id
                    ? 'bg-white dark:bg-zinc-900 border-none'
                    : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 ' +
                      (index > 0 ? 'border-l ' : '') +
                      'border-solid border-t-0 border-b-0 border-r-0'}"
            >
                <p
                    class="font-pretendard font-semibold leading-tight relative shrink-0 text-[1rem] m-0 break-keep whitespace-normal text-center {activeTab ===
                    tab.id
                        ? 'text-zinc-800 dark:text-zinc-100'
                        : 'text-zinc-600 dark:text-zinc-400'}"
                >
                    {tab.label}
                </p>
            </button>
        {/each}
    </div>

    <!-- Scrollable Bracket Grid Engine -->
    <div
        class="flex flex-col items-start overflow-auto px-[1.875rem] relative w-full flex-1 touch-pan-x touch-pan-y mt-[1.25rem]"
    >
        {#if !bracketData || bracketData.length === 0}
            <div
                class="w-full h-full flex flex-col items-center justify-center p-[5rem]"
            >
                <p class="text-zinc-500 dark:text-zinc-400 font-pretendard">
                    {i18n.t({ ko: '선택된 종목의 대진표 데이터가 없어요.', en: 'No bracket data for the selected sport.' })}
                </p>
            </div>
        {:else}
            <!-- Data Mapping Logic for Rounds and TeamNodes -->
            <div
                class="flex relative shrink-0 items-stretch h-fit w-full min-w-[70.625rem] pointer-events-auto"
            >
                {#each bracketData as round, roundIndex}
                    <!-- Determine if this is the final 'Winner' column which only displays 1 team -->
                    {@const isWinnerColumn =
                        roundIndex === bracketData.length - 1}

                    <div
                        class="flex flex-[1_0_0] flex-col gap-[1.25rem] p-[0.625rem] relative min-h-px min-w-px {isWinnerColumn ||
                        roundIndex === 4
                            ? 'justify-center'
                            : roundIndex === 0
                              ? 'h-fit self-start items-start'
                              : 'h-full'}"
                    >
                        {#if isWinnerColumn}
                            <div
                                class="flex flex-[1_0_0] flex-col gap-[0.625rem] w-full relative shrink-0 justify-center"
                            >
                                {#each round.matches as match, matchIndex}
                                    {@const medal =
                                        matchIndex === 0
                                            ? "gold"
                                            : matchIndex === 1
                                              ? "silver"
                                              : matchIndex === 2
                                                ? "bronze"
                                                : undefined}
                                    <div
                                        class="flex flex-col w-full justify-center"
                                    >
                                        <TeamNode {...match.team1} {medal} />
                                    </div>
                                {/each}
                            </div>
                        {:else if roundIndex === 4}
                            <div
                                class="flex flex-[1_0_0] flex-col gap-[0.625rem] w-full relative shrink-0 justify-center"
                            >
                                <div
                                    class="flex flex-[1_0_0] flex-col w-full justify-center gap-[0.625rem]"
                                >
                                    <div
                                        class="flex flex-col w-full justify-center"
                                    ></div>
                                    <div
                                        class="flex flex-col w-full justify-center"
                                    >
                                        <TeamNode
                                            {...round.matches[0].team1}
                                            state="win"
                                        />
                                    </div>
                                    <div
                                        class="flex flex-col w-full justify-center"
                                    >
                                        <TeamNode
                                            {...round.matches[1].team1}
                                            state="lose"
                                        />
                                    </div>
                                    <div
                                        class="flex flex-col w-full justify-center"
                                    ></div>
                                </div>

                                <div
                                    class="flex flex-[1_0_0] flex-col w-full justify-center gap-[0.625rem]"
                                >
                                    <div
                                        class="flex flex-col w-full justify-center"
                                    ></div>
                                    <div
                                        class="flex flex-col w-full justify-center"
                                    >
                                        <TeamNode
                                            {...round.matches[0].team2}
                                            state="win"
                                        />
                                    </div>
                                    <div
                                        class="flex flex-col w-full justify-center"
                                    >
                                        <TeamNode
                                            {...round.matches[1].team2}
                                            state="lose"
                                        />
                                    </div>
                                </div>
                                <MatchConnector
                                    nodeOffset={getConnectorOffset(roundIndex)}
                                />
                            </div>
                        {:else}
                            {#each round.matches as match}
                                <div
                                    class="flex flex-[1_0_0] flex-col gap-[0.625rem] w-full relative shrink-0"
                                >
                                    <div
                                        class="flex flex-[1_0_0] flex-col w-full justify-center"
                                    >
                                        <TeamNode {...match.team1} />
                                    </div>
                                    <div
                                        class="flex flex-[1_0_0] flex-col w-full justify-center"
                                    >
                                        <TeamNode {...match.team2} />
                                    </div>
                                    <MatchConnector
                                        nodeOffset={getConnectorOffset(
                                            roundIndex,
                                        )}
                                    />
                                </div>
                            {/each}
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>
