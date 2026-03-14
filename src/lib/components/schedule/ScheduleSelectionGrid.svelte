<script lang="ts">
    import TimeSlotCard from "./TimeSlotCard.svelte";
    import { enhance } from "$app/forms";

    interface Participant {
        name: string;
        userId: string;
        classId: string | null;
    }

    interface ScheduleSlot {
        id: string;
        startTime: string;
        isSlotAvailable: boolean;
        registrations: Participant[];
        totalVotes: number;
        isVoted: boolean;
        scheduledMatchesCount: number;
        maxParallelMatches: number;
    }

    let {
        gridData = {},
        currentUserClassId = null,
        opponentClassId = null,
        isOpponentUndecided = false,
        minPlayers = 5,
        isDisabled = false,
        isAdmin = false,
        isConfirmMode = false,
        onSlotClick = undefined,
    } = $props<{
        gridData: Record<string, ScheduleSlot[]>;
        currentUserClassId?: string | null;
        opponentClassId?: string | null;
        isOpponentUndecided?: boolean;
        minPlayers?: number;
        isDisabled?: boolean;
        isAdmin?: boolean;
        isConfirmMode?: boolean;
        onSlotClick?: (slotId: string) => void;
    }>();

    // Svelte derives sorted dates for rows
    let dates = $derived(Object.keys(gridData).sort());

    // Determines grid column span dynamically based on maximum slots per day
    let maxSlots = $derived(
        dates.length > 0
            ? Math.max(...dates.map((d) => gridData[d].length))
            : 7,
    );

    // Time headers? Find the time labels using the day with the most slots to ensure coverage.
    let timeHeaders = $derived(
        dates.length > 0
            ? (() => {
                  const dayWithMostSlots = dates.reduce((a, b) =>
                      gridData[a].length > gridData[b].length ? a : b,
                  );
                  return gridData[dayWithMostSlots].map((s: ScheduleSlot) => {
                      const d = new Date(s.startTime);
                      return d.toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                      });
                  });
              })()
            : [],
    );

    function formatDateDisplay(dateStr: string) {
        // e.g., '2026-03-05' -> '3/5 (목)'
        const d = new Date(dateStr);
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const days = ["일", "월", "화", "수", "목", "금", "토"];
        const dayName = days[d.getDay()];
        return `${month}/${day} (${dayName})`;
    }
</script>

{#if dates.length > 0}
    <div
        class="grid h-fit w-fit gap-x-[0.625rem] gap-y-[0.5rem] min-h-0 ml-0"
        style="grid-template-columns: 5rem repeat({maxSlots}, max-content); grid-template-rows: auto repeat({dates.length}, max-content);"
    >
        <!-- Header Row -->
        <div
            class="flex items-center justify-center text-zinc-400 dark:text-zinc-500 font-pretendard text-[0.875rem] font-semibold text-center"
            style="grid-column-start: 1;"
        >
            날짜 / 시간
        </div>
        {#each timeHeaders as time}
            <div
                class="flex items-center justify-center text-zinc-800 dark:text-zinc-200 font-pretendard text-[0.9375rem] font-bold text-center py-[0.625rem]"
            >
                {time}
            </div>
        {/each}

        <!-- Grids -->
        {#each dates as date}
            <!-- Date column -->
            <div
                class="flex items-center justify-center text-zinc-600 dark:text-zinc-400 font-pretendard text-[1rem] font-semibold text-center w-full h-full px-[0.625rem] whitespace-nowrap"
                style="grid-column-start: 1;"
            >
                {formatDateDisplay(date)}
            </div>

            <!-- Time columns -->
            {#each gridData[date] as slot}
                <!-- TimeSlotCard rendered mapped directly to real Database models and logic -->
                <form
                    method="POST"
                    action={isAdmin
                        ? "?/toggleSlotAvailability"
                        : "?/toggleVote"}
                    use:enhance
                    class="m-0 p-0 block"
                >
                    <input type="hidden" name="slotId" value={slot.id} />
                    <TimeSlotCard
                        isAvailable={slot.isSlotAvailable}
                        isVoted={slot.isVoted}
                        ourCount={slot.registrations.filter(
                            (r: Participant) =>
                                r.classId === currentUserClassId,
                        ).length}
                        oppCount={slot.registrations.filter(
                            (r: Participant) => r.classId === opponentClassId,
                        ).length}
                        ourMax={minPlayers}
                        oppMax={minPlayers}
                        {isOpponentUndecided}
                        participantNames={slot.registrations.map(
                            (r: Participant) => r.name,
                        )}
                        isDisabled={isAdmin ? false : isDisabled}
                        {isAdmin}
                        {isConfirmMode}
                        scheduledMatchesCount={slot.scheduledMatchesCount}
                        maxParallelMatches={slot.maxParallelMatches}
                        onSlotClick={onSlotClick
                            ? () => onSlotClick?.(slot.id)
                            : undefined}
                    />
                </form>
            {/each}
        {/each}
    </div>
{:else}
    <div class="flex items-center justify-center w-full h-full py-12">
        <p
            class="font-pretendard font-normal text-zinc-400 dark:text-zinc-500 text-[0.875rem] m-0"
        >
            해당 종목의 일정이 아직 등록되지 않았어요.
        </p>
    </div>
{/if}
