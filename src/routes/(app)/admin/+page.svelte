<script lang="ts">
    import { page } from "$app/stores";
    import { enhance } from "$app/forms";
    import TabGroup from "./TabGroup.svelte";
    import ScheduleConfigTab from "./ScheduleConfigTab.svelte";
    import MatchConfirmTab from "./MatchConfirmTab.svelte";
    import MatchResultTab from "./MatchResultTab.svelte";
    import SettingsTab from "./SettingsTab.svelte";
    import UserInfoTab from "./UserInfoTab.svelte";
    import { i18n } from "$lib/i18n.svelte";

    let { data } = $props();

    // The tabs for the admin dashboard
    let tabs = $derived([
        {
            id: "schedule",
            label: i18n.t({ ko: "일정 준비", en: "Schedule Prep" }),
        },
        {
            id: "confirm",
            label: i18n.t({ ko: "경기 시간 확정", en: "Confirm Match Time" }),
        },
        {
            id: "result",
            label: i18n.t({ ko: "경기 결과 확정", en: "Confirm Match Result" }),
        },
        { id: "users", label: i18n.t({ ko: "사용자 정보", en: "User Info" }) },
        {
            id: "settings",
            label: i18n.t({ ko: "시스템 설정", en: "System Settings" }),
        },
    ]);

    let activeTab = $state("");

    // Sync activeTab with data from server when URL changes
    $effect(() => {
        if (data.activeTab) {
            activeTab = data.activeTab;
        }
    });

    let impersonateStudentNumber = $state("");
</script>

<div class="flex flex-col gap-[1.25rem] w-full h-full relative">
    <!-- Header with Tabs -->
    <div class="flex flex-col gap-[1.25rem] shrink-0 w-full relative">
        <div
            class="flex gap-[0.625rem] items-center justify-between shrink-0 w-full relative"
        >
            <h1
                class="font-pretendard font-bold text-zinc-800 dark:text-zinc-100 text-[1.75rem] md:text-[2rem] m-0"
            >
                {i18n.t({ ko: "관리자 대시보드", en: "Admin Dashboard" })}
            </h1>

            <!-- Impersonate Form -->
            <form
                method="POST"
                action="?/impersonate"
                use:enhance
                class="flex items-center gap-2"
            >
                <input
                    type="text"
                    name="studentNumber"
                    bind:value={impersonateStudentNumber}
                    placeholder={i18n.t({
                        ko: "학번 입력",
                        en: "Enter Student ID",
                    })}
                    class="px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500 w-32"
                />
                <button
                    type="submit"
                    disabled={!impersonateStudentNumber.trim()}
                    class="px-3 py-1.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-400 rounded-lg transition-colors"
                >
                    {i18n.t({ ko: "유저 전환", en: "Impersonate User" })}
                </button>
            </form>
        </div>

        <!-- Custom Tab Group component modeled after the Schedule tabs -->
        <TabGroup {tabs} bind:activeTab />
    </div>

    <!-- Main Content Area -->
    <div
        class="flex flex-[1_0_0] flex-col min-h-px min-w-px relative w-full h-full overflow-hidden"
    >
        {#if activeTab === "schedule"}
            <ScheduleConfigTab
                sports={data.sports}
                activeSportId={data.activeSportId}
                gridData={data.gridData}
            />
        {:else if activeTab === "confirm"}
            <MatchConfirmTab
                sports={data.sports}
                activeSportId={data.activeSportId}
                completedClasses={data.completedClasses}
                activeMatch={data.activeMatch}
                confirmGridData={data.confirmGridData}
                allUsers={data.allUsers}
            />
        {:else if activeTab === "result"}
            <MatchResultTab
                sports={data.sports}
                activeSportId={data.activeSportId}
                finishedMatches={data.finishedMatches}
                activeResultMatch={data.activeResultMatch}
            />
        {:else if activeTab === "settings"}
            <SettingsTab
                eventState={data.eventState as
                    | "REGISTRATION"
                    | "ONGOING"
                    | "COMPLETED"}
                sports={data.sports ?? []}
                registrationDeadline={data.registrationDeadline}
                activeSportId={data.activeSportId ?? undefined}
            />
        {:else if activeTab === "users"}
            <UserInfoTab
                allClasses={data.allClasses ?? []}
                allUserInfo={data.allUserInfo ?? []}
                allRosters={data.allRosters ?? []}
                allSportsInfo={data.allSportsInfo ?? []}
            />
        {/if}
    </div>
</div>
