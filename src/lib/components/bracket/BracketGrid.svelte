<script lang="ts">
    import TeamNode from "./TeamNode.svelte";
    import MatchConnector from "./MatchConnector.svelte";

    // Reusable Component Architecture:
    // This bracket dynamically fetches and renders matches based on `activeTab`
    export let activeTab: string = "futsal";

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
    let isLoading: boolean = false;

    // --- Data Fetching Logic ---
    // Reactive statement to trigger an update whenever `activeTab` changes
    $: fetchBracketData(activeTab);

    async function fetchBracketData(tab: string) {
        isLoading = true;

        try {
            // [API INTEGRATION BOILERPLATE]
            // Replace this simulated delay with your actual fetch call:
            // const response = await fetch(`/api/brackets/${tab}`);
            // bracketData = await response.json();

            // Simulating an API endpoint delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Generate mock payload indicating dynamic behavior based on tab
            bracketData = generateMockData(tab);
        } catch (error) {
            console.error("Failed to fetch bracket data:", error);
            bracketData = [];
        } finally {
            isLoading = false;
        }
    }

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

    // Temporary mock data generator for demonstration
    function generateMockData(tab: string): Round[] {
        if (tab === "futsal") {
            return [
                {
                    title: "Round of 32",
                    matches: [
                        {
                            team1: {
                                className: "1",
                                state: "win",
                                ourTeam: true,
                            },
                            team2: { className: "2", state: "lose" },
                        },
                        {
                            team1: { className: "3", state: "lose" },
                            team2: { className: "4", state: "win" },
                        },
                        {
                            team1: { className: "5", state: "win" },
                            team2: { className: "6", state: "lose" },
                        },
                        {
                            team1: { className: "7", state: "win" },
                            team2: { className: "8", state: "lose" },
                        },
                        {
                            team1: { className: "9", state: "win" },
                            team2: { className: "10", state: "lose" },
                        },
                        {
                            team1: { className: "11", state: "lose" },
                            team2: { className: "12", state: "win" },
                        },
                        {
                            team1: { className: "13", state: "win" },
                            team2: { className: "14", state: "lose" },
                        },
                        {
                            team1: { className: "15", state: "lose" },
                            team2: { className: "16", state: "lose" },
                        },
                        {
                            team1: { className: "17", state: "lose" },
                            team2: { className: "18", state: "win" },
                        },
                        {
                            team1: { className: "19", state: "win" },
                            team2: { className: "20", state: "lose" },
                        },
                        {
                            team1: { className: "21", state: "win" },
                            team2: { className: "22", state: "lose" },
                        },
                        {
                            team1: { className: "23", state: "lose" },
                            team2: { className: "24", state: "win" },
                        },
                        {
                            team1: { className: "25", state: "lose" },
                            team2: { className: "26", state: "lose" },
                        },
                        {
                            team1: { className: "27", state: "win" },
                            team2: { className: "28", state: "lose" },
                        },
                        {
                            team1: { className: "29", state: "win" },
                            team2: { className: "30", state: "lose" },
                        },
                        {
                            team1: { className: "31", state: "win" },
                            team2: {
                                className: "0",
                                state: "lose",
                                notAvailable: true,
                            },
                        },
                    ],
                },
                {
                    title: "Round of 16",
                    matches: [
                        {
                            team1: {
                                className: "1",
                                state: "win",
                                ourTeam: true,
                            },
                            team2: { className: "4", state: "lose" },
                        },
                        {
                            team1: { className: "5", state: "lose" },
                            team2: { className: "7", state: "win" },
                        },
                        {
                            team1: { className: "9", state: "lose" },
                            team2: { className: "12", state: "lose" },
                        },
                        {
                            team1: { className: "13", state: "win" },
                            team2: {
                                className: "0",
                                state: "lose",
                                notAvailable: true,
                            },
                        },
                        {
                            team1: { className: "18", state: "default" },
                            team2: { className: "19", state: "default" },
                        },
                        {
                            team1: { className: "21", state: "default" },
                            team2: { className: "24", state: "default" },
                        },
                        {
                            team1: {
                                className: "0",
                                state: "lose",
                                notAvailable: true,
                            },
                            team2: { className: "27", state: "win" },
                        },
                        {
                            team1: { className: "29", state: "default" },
                            team2: { className: "31", state: "default" },
                        },
                    ],
                },
                {
                    title: "Quarterfinals",
                    matches: [
                        {
                            team1: {
                                className: "1",
                                state: "win",
                                ourTeam: true,
                            },
                            team2: { className: "7", state: "lose" },
                        },
                        {
                            team1: {
                                className: "0",
                                state: "lose",
                                notAvailable: true,
                            },
                            team2: { className: "13", state: "win" },
                        },
                        {
                            team1: { className: "0", state: "default" },
                            team2: { className: "0", state: "default" },
                        },
                        {
                            team1: { className: "27", state: "default" },
                            team2: { className: "0", state: "default" },
                        },
                    ],
                },
                {
                    title: "Semifinals",
                    matches: [
                        {
                            team1: {
                                className: "1",
                                state: "default",
                                ourTeam: true,
                            },
                            team2: { className: "13", state: "default" },
                        },
                        {
                            team1: { className: "0", state: "default" },
                            team2: { className: "0", state: "default" },
                        },
                    ],
                },
                {
                    title: "Finals",
                    matches: [
                        {
                            team1: { className: "0", state: "default" },
                            team2: { className: "0", state: "default" },
                        },
                    ],
                },
                {
                    title: "Winner",
                    matches: [
                        {
                            team1: { className: "0", state: "default" },
                            team2: {
                                className: "0",
                                state: "default",
                                notAvailable: true,
                            },
                        },
                    ],
                },
            ];
        }

        // Generic mock data for other tabs representing 31 classes
        const matches32 = Array.from({ length: 16 }).map((_, i) => ({
            team1: { className: String(i * 2 + 1), state: "default" as const },
            team2:
                i === 15
                    ? {
                          className: "0",
                          state: "default" as const,
                          notAvailable: true,
                      }
                    : {
                          className: String(i * 2 + 2),
                          state: "default" as const,
                      },
        }));

        return [
            {
                title: "Round of 32",
                matches: matches32,
            },
            {
                title: "Round of 16",
                matches: Array.from({ length: 8 }).map(() => ({
                    team1: { className: "-", state: "default" as const },
                    team2: { className: "-", state: "default" as const },
                })),
            },
            {
                title: "Quarterfinals",
                matches: Array.from({ length: 4 }).map(() => ({
                    team1: { className: "-", state: "default" as const },
                    team2: { className: "-", state: "default" as const },
                })),
            },
            {
                title: "Semifinals",
                matches: Array.from({ length: 2 }).map(() => ({
                    team1: { className: "-", state: "default" as const },
                    team2: { className: "-", state: "default" as const },
                })),
            },
            {
                title: "Finals",
                matches: [
                    {
                        team1: { className: "-", state: "default" as const },
                        team2: { className: "-", state: "default" as const },
                    },
                ],
            },
            {
                title: "Winner",
                matches: [
                    {
                        team1: { className: "-", state: "default" as const },
                        team2: {
                            className: "0",
                            state: "default" as const,
                            notAvailable: true,
                        },
                    },
                ],
            },
        ];
    }
</script>

<div class="flex flex-col w-full h-full">
    <!-- Event Tabs (Tab UI rendering inside the dynamic Bracket component) -->
    <div
        class="border-zinc-300 border-b border-solid flex items-start overflow-clip sticky top-0 w-full bg-zinc-100 z-10 m-0 p-0"
    >
        {#each [{ id: "futsal", label: "풋살" }, { id: "basketball", label: "농구" }, { id: "mens_badminton", label: "남자 배드민턴" }, { id: "womens_badminton", label: "여자 배드민턴" }] as tab, index}
            <button
                on:click={() => (activeTab = tab.id)}
                class="flex flex-[1_0_0] flex-col h-[3.125rem] items-center justify-center min-h-px min-w-px px-[2.1875rem] py-[0.5rem] relative outline-none cursor-pointer hover:bg-zinc-200 transition-colors m-0
                {activeTab === tab.id
                    ? 'bg-white border-none'
                    : 'bg-zinc-100 border-zinc-300 ' +
                      (index > 0 ? 'border-l ' : '') +
                      'border-solid border-t-0 border-b-0 border-r-0'}"
            >
                <p
                    class="font-pretendard font-semibold leading-[normal] relative shrink-0 text-[1rem] m-0 {activeTab ===
                    tab.id
                        ? 'text-zinc-900'
                        : 'text-zinc-600'}"
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
        {#if isLoading}
            <div
                class="w-full h-full flex flex-col items-center justify-center p-[5rem] gap-4"
            >
                <div
                    class="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"
                ></div>
                <p class="text-zinc-500 font-pretendard font-semibold">
                    대진표를 불러오고 있어요
                </p>
            </div>
        {:else if bracketData.length === 0}
            <div
                class="w-full h-full flex flex-col items-center justify-center p-[5rem]"
            >
                <p class="text-zinc-500 font-pretendard">
                    선택된 종목의 대진표 데이터가 없어요.
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
                        class="flex flex-[1_0_0] flex-col gap-[1.25rem] p-[0.625rem] relative min-h-px min-w-px {isWinnerColumn
                            ? 'justify-center'
                            : roundIndex === 0
                              ? 'h-fit self-start items-start'
                              : 'h-full'}"
                    >
                        {#each round.matches as match}
                            {#if isWinnerColumn}
                                <div
                                    class="flex flex-[1_0_0] flex-col w-full justify-center"
                                >
                                    <TeamNode {...match.team1} />
                                </div>
                            {:else}
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
                            {/if}
                        {/each}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>
