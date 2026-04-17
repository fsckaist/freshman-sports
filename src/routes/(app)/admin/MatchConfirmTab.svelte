<script lang="ts">
    import ScheduleSelectionGrid from "$lib/components/schedule/ScheduleSelectionGrid.svelte";
    import { enhance } from "$app/forms";
    import { i18n } from "$lib/i18n.svelte";

    let {
        sports = [],
        activeSportId = null,
        completedClasses = [],
        activeMatch = null,
        confirmGridData = {},
        allUsers = [],
    }: {
        sports: any[];
        activeSportId: string | null;
        completedClasses: any[];
        activeMatch: any;
        confirmGridData: Record<string, any[]>;
        allUsers: any[];
    } = $props();

    let isModalOpen = $state(false);
    let selectedSlotId: string | null = $state(null);
    let selectedSlotTime = $derived.by(() => {
        if (!selectedSlotId) return null;
        for (const [, slots] of Object.entries(confirmGridData)) {
            for (const slot of slots) {
                if (slot.id === selectedSlotId) return new Date(slot.startTime).getTime();
            }
        }
        return null;
    });
    let selectedRefereeId = $state("");
    let selectedManagerId = $state("");
    let selectedLocation = $state("");

    function openFinalizeModal(slotId: string) {
        selectedSlotId = slotId;
        selectedRefereeId = activeMatch?.refereeId || "";
        selectedManagerId = activeMatch?.managerId || "";
        selectedLocation = activeMatch?.location || "";
        isModalOpen = true;
    }

    function closeModal() {
        isModalOpen = false;
        selectedSlotId = null;
        selectedRefereeId = "";
        selectedManagerId = "";
        selectedLocation = "";
    }

    let isForfeitModalOpen = $state(false);
    let forfeitWinner = $state<string | null>("");

    function openForfeitModal() {
        if (!activeMatch) return;
        forfeitWinner = "";
        isForfeitModalOpen = true;
    }

    function closeForfeitModal() {
        isForfeitModalOpen = false;
        forfeitWinner = "";
    }
</script>

<div
    class="flex flex-col bg-white dark:bg-zinc-900 rounded-[1.25rem] w-full flex-[1_0_0] relative overflow-hidden shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] dark:shadow-none h-full"
>
    <!-- Sport Selection Tabs (Secondary) -->
    <div
        class="flex items-center shrink-0 w-full border-b border-zinc-200 dark:border-zinc-800"
    >
        {#each sports as sport, i}
            <a
                href="?tab=confirm&sportId={sport.id}"
                class="flex flex-[1_0_0] items-center justify-center h-[3.125rem] cursor-pointer outline-none transition-colors duration-200 no-underline
                {activeSportId === sport.id
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-500'
                    : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-transparent'}
                {i !== sports.length - 1
                    ? 'border-r border-zinc-200 dark:border-zinc-800'
                    : ''}"
            >
                <p
                    class="font-pretendard font-semibold text-[1rem] m-0 transition-colors duration-200"
                >
                    {i18n.decode(sport.name)}
                </p>
            </a>
        {/each}
    </div>
    <!-- Header -->
    <div
        class="flex items-center justify-between px-[1.875rem] py-4 shrink-0 border-b border-zinc-100 dark:border-zinc-800"
    >
        <div class="flex flex-col">
            <h2
                class="font-pretendard font-bold text-zinc-800 dark:text-zinc-100 text-[1.25rem] m-0"
            >
                {i18n.t({
                    ko: "경기 확정 대기 목록",
                    en: "Pending Match Confirmation",
                })}
            </h2>
            <p
                class="font-pretendard font-normal text-zinc-500 text-[0.875rem] m-0 mt-1"
            >
                {i18n.t({
                    ko: "서로 투표를 진행 중인 반들의 목록입니다. 가장 인원이 많이 겹치는 시간대를 골라 경기를 확정해 주세요.",
                    en: "List of classes currently voting on schedules. Please select the most overlapping time slot to confirm the match.",
                })}
            </p>
        </div>
        {#if activeMatch}
            <div class="flex items-center shrink-0 ml-4">
                <button
                    class="px-4 py-2 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl text-sm transition-colors hover:bg-red-100 dark:hover:bg-red-900/40"
                    onclick={() => openForfeitModal()}
                >
                    {i18n.t({ ko: "기권승/몰수패 처리", en: "Set Forfeit" })}
                </button>
            </div>
        {/if}
    </div>

    <!-- Main Content Area: Left Sidebar (Matches) & Right Content (Grid) -->
    <div class="flex flex-row flex-[1_0_0] w-full min-h-0 overflow-hidden">
        <!-- Match Navigation Sidebar -->
        <div
            class="flex flex-col gap-3 overflow-y-auto w-[18rem] shrink-0 p-[1.875rem] py-6 border-r border-zinc-100 dark:border-zinc-800 hide-scrollbar scroll-smooth bg-zinc-50/50 dark:bg-zinc-900/50"
        >
            {#each completedClasses.filter((m) => m.classA && m.classB) as matchPair}
                <a
                    href="?tab=confirm&sportId={activeSportId}&matchId={matchPair.id}"
                    class="flex flex-[0_0_auto] flex-col gap-1 items-center justify-center py-4 px-4 rounded-xl border transition-all cursor-pointer no-underline
                    {activeMatch?.id === matchPair.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-[0_0_0.625rem_rgba(245,158,11,0.1)]'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:shadow-sm'}"
                >
                    <div
                        class="flex gap-1 items-center font-bold tracking-wide px-2 py-0.5 rounded text-[0.7rem]
                        {activeMatch?.id === matchPair.id
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100'
                            : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'}"
                    >
                        {#if matchPair.matchName}
                            <span>{i18n.decode(matchPair.matchName)}</span>
                        {/if}
                    </div>
                    <div
                        class="flex gap-2 items-center font-bold text-lg text-zinc-800 dark:text-zinc-100"
                    >
                        <span
                            >{i18n.t({
                                ko: "",
                                en: "Class ",
                            })}{matchPair.classA}{i18n.t({
                                ko: "반",
                                en: "",
                            })}</span
                        >
                        <span
                            class="text-[0.6rem] text-zinc-400 dark:text-zinc-500"
                            >VS</span
                        >
                        <span
                            >{i18n.t({
                                ko: "",
                                en: "Class ",
                            })}{matchPair.classB}{i18n.t({
                                ko: "반",
                                en: "",
                            })}</span
                        >
                    </div>
                    {#if matchPair.scheduleWindowDeadline}
                        <div
                            class="mt-1 text-[0.7rem] font-semibold text-zinc-500 dark:text-zinc-400 w-full text-center rounded py-1"
                        >
                            {i18n.t({ ko: "신청 마감", en: "Apply Deadline" })}: {new Date(
                                matchPair.scheduleWindowDeadline,
                            ).toLocaleString(
                                i18n.locale === "ko" ? "ko-KR" : "en-US",
                                {
                                    month: "numeric",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                },
                            )}
                        </div>
                    {/if}
                    
                    {#if matchPair.scheduledAt}
                        <div class="mt-1 text-[0.7rem] font-bold text-amber-600 dark:text-amber-400 w-full text-center">
                            {i18n.t({ ko: "경기 일정", en: "Match Time" })}: {new Date(matchPair.scheduledAt).toLocaleString(
                                i18n.locale === "ko" ? "ko-KR" : "en-US",
                                { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }
                            )}
                        </div>
                    {:else}
                        <div class="mt-1 text-[0.7rem] font-semibold text-zinc-400 dark:text-zinc-500 w-full text-center">
                            {i18n.t({ ko: "경기 일정 미설정", en: "Match Time Not Set" })}
                        </div>
                    {/if}
                </a>
            {/each}
            {#if completedClasses.length === 0}
                <div
                    class="text-zinc-400 dark:text-zinc-500 text-sm py-4 text-center"
                >
                    {i18n.t({
                        ko: "경기 확정 대기 중인 매치가 없습니다.",
                        en: "No matches pending confirmation.",
                    })}
                </div>
            {/if}
        </div>

        <!-- Grid Container -->
        <div
            class="flex-1 flex flex-col overflow-auto w-0 min-w-0 min-h-0 relative py-6 bg-white dark:bg-zinc-950"
        >
            {#if Object.keys(confirmGridData).length === 0}
                <div
                    class="flex items-center justify-center w-full h-full py-12"
                >
                    <p
                        class="font-pretendard font-normal text-zinc-400 dark:text-zinc-500 text-[0.875rem] m-0 text-center"
                    >
                        {i18n.t({
                            ko: "선택된 매치의 일정이 없습니다.",
                            en: "No schedule for the selected match.",
                        })}
                    </p>
                </div>
            {:else}
                <div class="w-full h-fit p-[1.875rem]">
                    <div class="w-fit mx-auto">
                        <ScheduleSelectionGrid
                            gridData={confirmGridData}
                            currentUserClassId={activeMatch?.classAId}
                            opponentClassId={activeMatch?.classBId}
                            minPlayers={sports.find(
                                (s) => s.id === activeSportId,
                            )?.minPlayers ?? 5}
                            isDisabled={false}
                            isAdmin={false}
                            isConfirmMode={true}
                            onSlotClick={openFinalizeModal}
                            highlightPeriodStart={activeMatch?.scheduleWindowStart}
                            highlightPeriodEnd={activeMatch?.scheduleWindowEnd}
                            scheduledSlotId={activeMatch?.scheduleId}
                        />
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>

<!-- Modal -->
{#if isModalOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 cursor-pointer"
        onclick={closeModal}
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="bg-white dark:bg-zinc-900 rounded-[1.5rem] w-full max-w-[28rem] flex flex-col items-center justify-center p-[2rem] gap-[1.5rem] shadow-2xl cursor-default border dark:border-zinc-800"
            onclick={(e) => e.stopPropagation()}
        >
            <h3
                class="font-pretendard font-bold text-[1.5rem] text-zinc-800 dark:text-zinc-100 m-0"
            >
                {i18n.t({ ko: "경기 시간 확정", en: "Confirm Match Time" })}
            </h3>
            <p
                class="text-center text-zinc-500 dark:text-zinc-400 font-pretendard text-[0.9rem] m-0 leading-relaxed"
            >
                {i18n.t({
                    ko: `해당 시간대로 ${activeMatch?.classA ? `${activeMatch.classA}반` : "미정"}과 ${activeMatch?.classB ? `${activeMatch.classB}반` : "미정"}의`,
                    en: `Confirm match between ${activeMatch?.classA ? `Class ${activeMatch.classA}` : "TBD"} and ${activeMatch?.classB ? `Class ${activeMatch.classB}` : "TBD"}`,
                })}<br />
                <b>{i18n.decode(activeMatch?.sportName)}</b>
                {i18n.t({
                    ko: "경기를 확정하시겠습니까?",
                    en: "at this time?",
                })}
            </p>

            <form
                method="POST"
                action="?/finalizeMatch"
                use:enhance={() => {
                    return async ({ update }) => {
                        await update();
                        closeModal();
                    };
                }}
                class="w-full flex flex-col gap-4"
            >
                <input type="hidden" name="matchId" value={activeMatch?.id} />
                <input type="hidden" name="scheduleId" value={selectedSlotId} />

                <div class="flex flex-col gap-2 w-full">
                    <label
                        for="location"
                        class="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                        >{i18n.t({
                            ko: "경기 장소 선택",
                            en: "Select Location",
                        })}</label
                    >
                    <select
                        id="location"
                        name="location"
                        bind:value={selectedLocation}
                        class="w-full text-base p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-amber-500 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 transition-colors"
                    >
                        <option value=""
                            >{i18n.t({
                                ko: "장소 선택 안 함",
                                en: "No Location",
                            })}</option
                        >
                        {#if activeSportId && sports.find((s) => s.id === activeSportId)?.locations}
                            {#each sports.find((s) => s.id === activeSportId).locations as loc}
                                <option value={loc.name}
                                    >{i18n.decode(loc.name)}</option
                                >
                            {/each}
                        {/if}
                    </select>
                </div>

                <div class="flex flex-col gap-2 w-full">
                    <label
                        for="refereeId"
                        class="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                        >{i18n.t({
                            ko: "심판 배정",
                            en: "Assign Referee",
                        })}</label
                    >
                    <select
                        id="refereeId"
                        name="refereeId"
                        bind:value={selectedRefereeId}
                        class="w-full text-base p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-amber-500 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 transition-colors"
                    >
                        <option value=""
                            >{i18n.t({
                                ko: "심판 선택 안 함",
                                en: "No Referee",
                            })}</option
                        >
                        {#each allUsers.filter((u) => u.isReferee && u.classId !== activeMatch?.classAId && u.classId !== activeMatch?.classBId && (!selectedSlotTime || !u.busyAssignments?.some((ba: any) => ba.scheduledAtTime === selectedSlotTime && ba.matchId !== activeMatch?.id))) as user}
                            <option value={user.id}
                                >{user.studentNumber ? `${user.studentNumber} ` : ''}{user.name}{i18n.t({
                                    ko: ` (${user.refereeCount || 0})`,
                                    en: ` (${user.refereeCount || 0})`,
                                })}</option
                            >
                        {/each}
                    </select>
                </div>

                <div class="flex flex-col gap-2 w-full">
                    <label
                        for="managerId"
                        class="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                        >{i18n.t({
                            ko: "담당 매니저 배정",
                            en: "Assign Manager",
                        })}</label
                    >
                    <select
                        id="managerId"
                        name="managerId"
                        bind:value={selectedManagerId}
                        class="w-full text-base p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-amber-500 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 transition-colors"
                    >
                        <option value=""
                            >{i18n.t({
                                ko: "매니저 선택 안 함",
                                en: "No Manager",
                            })}</option
                        >
                        {#each allUsers.filter((u) => u.isManager && u.classId !== activeMatch?.classAId && u.classId !== activeMatch?.classBId && (!selectedSlotTime || !u.busyAssignments?.some((ba: any) => ba.scheduledAtTime === selectedSlotTime && ba.matchId !== activeMatch?.id))) as user}
                            <option value={user.id}
                                >{user.studentNumber ? `${user.studentNumber} ` : ''}{user.name}{i18n.t({
                                    ko: ` (${user.managerCount || 0})`,
                                    en: ` (${user.managerCount || 0})`,
                                })}</option
                            >
                        {/each}
                    </select>
                </div>

                <div class="flex gap-3 w-full mt-4">
                    <button
                        type="button"
                        class="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl transition-colors"
                        onclick={closeModal}
                    >
                        {i18n.t({ ko: "취소하기", en: "Cancel" })}
                    </button>
                    <button
                        type="submit"
                        class="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors"
                    >
                        {i18n.t({ ko: "경기 확정", en: "Confirm Match" })}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Forfeit Modal -->
{#if isForfeitModalOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 cursor-pointer"
        onclick={closeForfeitModal}
    >
        <div
            class="bg-white dark:bg-zinc-900 rounded-[1.5rem] w-full max-w-[28rem] flex flex-col items-center justify-center p-[2rem] gap-[1.5rem] shadow-2xl cursor-default border dark:border-zinc-800"
            onclick={(e) => e.stopPropagation()}
        >
            <h3 class="font-pretendard font-bold text-[1.5rem] text-zinc-800 dark:text-zinc-100 m-0">
                {i18n.t({ ko: "기권패/몰수패 설정", en: "Set Forfeit" })}
            </h3>
            <p class="text-center text-zinc-500 dark:text-zinc-400 font-pretendard text-[0.9rem] m-0 leading-relaxed">
                {i18n.t({
                    ko: "경기 시간을 확정하지 않고 바로 승리 팀을 지정합니다.",
                    en: "Specify a winning team without confirming the match time."
                })}
            </p>

            <form
                method="POST"
                action="?/finalizeMatchResult"
                use:enhance={() => {
                    return async ({ update }) => {
                        await update();
                        closeForfeitModal();
                    };
                }}
                class="w-full flex flex-col gap-4"
            >
                <input type="hidden" name="matchId" value={activeMatch?.id} />
                <input type="hidden" name="isForfeit" value="true" />
                
                <div class="flex flex-col gap-2 w-full">
                    <label for="forfeitWinnerSelect" class="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        {i18n.t({ ko: "승리 팀 (기권승)", en: "Winning Team (Forfeit Win)" })}
                    </label>
                    <select
                        id="forfeitWinnerSelect"
                        name="winnerClassId"
                        bind:value={forfeitWinner}
                        class="w-full text-base p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-amber-500 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 transition-colors"
                        required
                    >
                        <option value="" disabled selected>{i18n.t({ ko: "승리 팀 선택", en: "Select Winning Team" })}</option>
                        <option value={activeMatch?.classAId}>{i18n.t({ko: "Class", en: "Class"})} {activeMatch?.classA}{i18n.t({ko:"반", en:""})}</option>
                        <option value={activeMatch?.classBId}>{i18n.t({ko: "Class", en: "Class"})} {activeMatch?.classB}{i18n.t({ko:"반", en:""})}</option>
                        <option value="none">{i18n.t({ ko: "양 팀 모두 기권 (동반 탈락)", en: "Both teams forfeit (Both eliminated)" })}</option>
                    </select>
                </div>

                <div class="flex gap-3 w-full mt-4">
                    <button
                        type="button"
                        class="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl transition-colors"
                        onclick={closeForfeitModal}
                    >
                        {i18n.t({ ko: "취소하기", en: "Cancel" })}
                    </button>
                    <button
                        type="submit"
                        class="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                        disabled={!forfeitWinner}
                    >
                        {i18n.t({ ko: "확인", en: "Confirm" })}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
