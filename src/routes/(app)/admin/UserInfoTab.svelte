<script lang="ts">
    import { i18n } from "$lib/i18n.svelte";
    import { loadingEnhance } from '$lib/actions/loading';

    interface UserInfo {
        id: string;
        name: string | null;
        studentNumber: string;
        phoneNumber: string | null;
        isManager: boolean | null;
        isReferee: boolean | null;
        isAdmin: boolean | null;
        isProctor: boolean | null;
        agreedPrivacy: boolean | null;
        agreedRules: boolean | null;
        classId: string | null;
        gender: "MALE" | "FEMALE" | null;
    }

    interface RosterEntry {
        id: string;
        userId: string;
        classId: string;
        sportId: string;
        sportName: string;
    }

    interface SportInfo {
        id: string;
        name: string;
        minPlayers: number;
    }

    interface RoleTag {
        label: string;
        classes: string;
    }

    let { allClasses, allUserInfo, allRosters, allSportsInfo } = $props<{
        allClasses: { id: string; classNumber: number }[];
        allUserInfo: UserInfo[];
        allRosters: RosterEntry[];
        allSportsInfo: SportInfo[];
    }>();

    let userSelectedClassId: string | null = $state(null);
    let selectedClassId = $derived(
        userSelectedClassId ??
            (allClasses.length > 0 ? allClasses[0].id : null),
    );

    let filteredUsers = $derived(
        selectedClassId
            ? allUserInfo
                  .filter((u: UserInfo) => u.classId === selectedClassId)
                  .sort((a: UserInfo, b: UserInfo) => a.studentNumber.localeCompare(b.studentNumber))
            : [],
    );

    // Build a map of userId -> UserInfo for quick lookup
    let userMap = $derived(
        new Map(allUserInfo.map((u: UserInfo) => [u.id, u])),
    );

    // Sport rosters filtered by selected class, grouped by sport
    let sportRosterData = $derived.by(() => {
        if (!selectedClassId) return [];
        return allSportsInfo.map((sport: SportInfo) => {
            const entries = allRosters.filter(
                (r: RosterEntry) =>
                    r.classId === selectedClassId && r.sportId === sport.id,
            );
            const participants = entries
                .map((r: RosterEntry) => userMap.get(r.userId))
                .filter((u: UserInfo | undefined): u is UserInfo => !!u)
                .sort((a: UserInfo, b: UserInfo) => a.studentNumber.localeCompare(b.studentNumber));
            return {
                sportId: sport.id,
                sportName: sport.name,
                minPlayers: sport.minPlayers,
                participants,
                count: participants.length,
            };
        });
    });

    // --- Summary Stats ---
    let registeredCount = $derived(
        filteredUsers.filter((u: UserInfo) => u.agreedPrivacy && u.agreedRules)
            .length,
    );
    let unregisteredCount = $derived(filteredUsers.length - registeredCount);
    let totalCount = $derived(filteredUsers.length);
    let registeredPct = $derived(
        totalCount > 0 ? (registeredCount / totalCount) * 100 : 0,
    );

    // SVG donut chart helpers
    const DONUT_RADIUS = 40;
    const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
    let registeredArc = $derived((registeredPct / 100) * DONUT_CIRCUMFERENCE);
    let unregisteredArc = $derived(DONUT_CIRCUMFERENCE - registeredArc);

    // Proctors for the selected class
    let classProctors = $derived(
        filteredUsers.filter((u: UserInfo) => u.isProctor),
    );

    function getRoleTags(user: UserInfo): RoleTag[] {
        const tags: RoleTag[] = [];
        if (user.isAdmin)
            tags.push({
                label: i18n.t({ ko: "관리자", en: "Admin" }),
                classes:
                    "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
            });
        if (user.isManager)
            tags.push({
                label: i18n.t({ ko: "매니저", en: "Manager" }),
                classes:
                    "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
            });
        if (user.isReferee)
            tags.push({
                label: i18n.t({ ko: "심판", en: "Referee" }),
                classes:
                    "bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800",
            });
        if (user.isProctor)
            tags.push({
                label: i18n.t({ ko: "프락터", en: "Proctor" }),
                classes:
                    "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
            });
        if (user.classId && !user.isProctor)
            tags.push({
                label: i18n.t({ ko: "참가자", en: "Participant" }),
                classes:
                    "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
            });
        return tags;
    }
</script>

<div
    class="flex flex-col bg-white dark:bg-zinc-900 rounded-[1.25rem] w-full flex-[1_0_0] relative overflow-hidden shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] dark:shadow-none h-full"
>
    <!-- Header with Class Selector -->
    <div
        class="flex items-center gap-4 px-[1.875rem] py-4 shrink-0 border-b border-zinc-100 dark:border-zinc-800"
    >
        <div class="flex gap-2 overflow-x-auto min-w-0 scrollbar-thin">
            {#each allClasses as c}
                <button
                    class="px-4 py-2 rounded-lg font-medium text-sm transition-colors shrink-0
                           {selectedClassId === c.id
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'}"
                    onclick={() => (userSelectedClassId = c.id)}
                >
                    {i18n.t({ ko: "", en: "Class " })}{c.classNumber}{i18n.t({
                        ko: "반",
                        en: "",
                    })}
                </button>
            {/each}
        </div>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-auto p-[1.875rem]">
        <!-- ===== Summary Dashboard ===== -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <!-- Registration Stats Card -->
            <div
                class="flex flex-col gap-4 p-5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
            >
                <h3
                    class="text-sm font-semibold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide"
                >
                    {i18n.t({ ko: "등록 현황", en: "Registration Status" })}
                </h3>
                <div class="flex items-center gap-6">
                    <!-- Donut Chart -->
                    <div class="relative shrink-0">
                        <svg
                            width="110"
                            height="110"
                            viewBox="0 0 110 110"
                            class="transform -rotate-90"
                        >
                            <!-- Background circle -->
                            <circle
                                cx="55"
                                cy="55"
                                r={DONUT_RADIUS}
                                fill="none"
                                stroke="currentColor"
                                class="text-zinc-200 dark:text-zinc-700"
                                stroke-width="12"
                            />
                            <!-- Registered arc (green) -->
                            {#if totalCount > 0}
                                <circle
                                    cx="55"
                                    cy="55"
                                    r={DONUT_RADIUS}
                                    fill="none"
                                    stroke="#22c55e"
                                    stroke-width="12"
                                    stroke-dasharray="{registeredArc} {unregisteredArc}"
                                    stroke-linecap="round"
                                    class="transition-all duration-500 ease-out"
                                />
                            {/if}
                        </svg>
                        <!-- Center text -->
                        <div
                            class="absolute inset-0 flex flex-col items-center justify-center"
                        >
                            <span
                                class="text-lg font-bold text-zinc-800 dark:text-zinc-100"
                                >{totalCount}</span
                            >
                            <span
                                class="text-[0.625rem] text-zinc-500 dark:text-zinc-400"
                                >{i18n.t({ ko: "전체", en: "Total" })}</span
                            >
                        </div>
                    </div>
                    <!-- Legend -->
                    <div class="flex flex-col gap-3 flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-2">
                            <div class="flex items-center gap-2 min-w-0">
                                <div
                                    class="w-3 h-3 rounded-full bg-green-500 shrink-0"
                                ></div>
                                <span
                                    class="text-sm text-zinc-700 dark:text-zinc-300 truncate"
                                    >{i18n.t({
                                        ko: "등록 완료",
                                        en: "Registered",
                                    })}</span
                                >
                            </div>
                            <div class="flex items-baseline gap-1.5 shrink-0">
                                <span
                                    class="text-lg font-bold text-green-600 dark:text-green-400"
                                    >{registeredCount}</span
                                >
                                <span
                                    class="text-xs text-zinc-400 dark:text-zinc-500"
                                    >({totalCount > 0
                                        ? Math.round(registeredPct)
                                        : 0}%)</span
                                >
                            </div>
                        </div>
                        <div class="flex items-center justify-between gap-2">
                            <div class="flex items-center gap-2 min-w-0">
                                <div
                                    class="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0"
                                ></div>
                                <span
                                    class="text-sm text-zinc-700 dark:text-zinc-300 truncate"
                                    >{i18n.t({
                                        ko: "미등록",
                                        en: "Unregistered",
                                    })}</span
                                >
                            </div>
                            <div class="flex items-baseline gap-1.5 shrink-0">
                                <span
                                    class="text-lg font-bold text-zinc-500 dark:text-zinc-400"
                                    >{unregisteredCount}</span
                                >
                                <span
                                    class="text-xs text-zinc-400 dark:text-zinc-500"
                                    >({totalCount > 0
                                        ? Math.round(100 - registeredPct)
                                        : 0}%)</span
                                >
                            </div>
                        </div>
                        <!-- Progress bar -->
                        <div
                            class="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mt-1"
                        >
                            <div
                                class="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
                                style="width: {registeredPct}%"
                            ></div>
                        </div>
                    </div>
                </div>
                <!-- Proctor Info -->
                {#if classProctors.length > 0}
                    <div
                        class="mt-1 pt-4 border-t border-zinc-200 dark:border-zinc-700"
                    >
                        <div class="flex items-center gap-1.5 mb-2.5">
                            <svg
                                class="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                /></svg
                            >
                            <span
                                class="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide"
                                >{i18n.t({ ko: "프락터", en: "Proctor" })}</span
                            >
                        </div>
                        <div class="flex flex-col gap-2">
                            {#each classProctors as proctor}
                                <div
                                    class="flex items-center justify-between gap-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg border border-zinc-200 dark:border-zinc-700"
                                >
                                    <span
                                        class="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                                        >{proctor.name || "-"}</span
                                    >
                                    <span
                                        class="text-xs text-zinc-500 dark:text-zinc-400 font-mono"
                                        >{proctor.phoneNumber ||
                                            "-"}</span
                                    >
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Sport Summary Table Card -->
            <div
                class="flex flex-col gap-4 p-5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
            >
                <h3
                    class="text-sm font-semibold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide"
                >
                    {i18n.t({
                        ko: "종목별 지원 현황",
                        en: "Sport Registration Summary",
                    })}
                </h3>
                <div class="w-full overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead>
                            <tr
                                class="border-b border-zinc-200 dark:border-zinc-700"
                            >
                                <th
                                    class="pb-2 pr-3 font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase whitespace-nowrap"
                                >
                                    {i18n.t({ ko: "종목", en: "Sport" })}
                                </th>
                                <th
                                    class="pb-2 px-3 font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase text-center whitespace-nowrap"
                                >
                                    {i18n.t({ ko: "지원자", en: "Applied" })}
                                </th>
                                <th
                                    class="pb-2 px-3 font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase text-center whitespace-nowrap"
                                >
                                    {i18n.t({ ko: "최소 인원", en: "Min Req" })}
                                </th>
                                <th
                                    class="pb-2 pl-3 font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase text-center whitespace-nowrap"
                                >
                                    {i18n.t({ ko: "상태", en: "Status" })}
                                </th>
                            </tr>
                        </thead>
                        <tbody
                            class="divide-y divide-zinc-100 dark:divide-zinc-700/50"
                        >
                            {#each sportRosterData as sport}
                                <tr>
                                    <td
                                        class="py-2.5 pr-3 font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap"
                                    >
                                        {i18n.decode(sport.sportName)}
                                    </td>
                                    <td
                                        class="py-2.5 px-3 text-center font-semibold text-zinc-700 dark:text-zinc-300"
                                    >
                                        {sport.count}
                                    </td>
                                    <td
                                        class="py-2.5 px-3 text-center text-zinc-500 dark:text-zinc-400"
                                    >
                                        {sport.minPlayers}
                                    </td>
                                    <td class="py-2.5 pl-3 text-center">
                                        {#if sport.count >= sport.minPlayers}
                                            <span
                                                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                                            >
                                                <svg
                                                    class="w-3 h-3"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    stroke-width="2.5"
                                                    ><path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        d="M5 13l4 4L19 7"
                                                    /></svg
                                                >
                                                {i18n.t({
                                                    ko: "충족",
                                                    en: "Met",
                                                })}
                                            </span>
                                        {:else if sport.count > 0}
                                            <span
                                                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                                            >
                                                <svg
                                                    class="w-3 h-3"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    stroke-width="2.5"
                                                    ><path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    /></svg
                                                >
                                                {i18n.t({
                                                    ko: "부족",
                                                    en: "Short",
                                                })}
                                            </span>
                                        {:else}
                                            <span
                                                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                                            >
                                                {i18n.t({
                                                    ko: "없음",
                                                    en: "None",
                                                })}
                                            </span>
                                        {/if}
                                    </td>
                                </tr>
                            {:else}
                                <tr>
                                    <td
                                        colspan="4"
                                        class="py-4 text-center text-sm text-zinc-400 dark:text-zinc-500"
                                    >
                                        {i18n.t({
                                            ko: "종목 정보가 없습니다.",
                                            en: "No sport data available.",
                                        })}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <!-- User Table (Desktop) -->
        <div
            class="hidden md:block w-full border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-800"
        >
            <div class="w-full overflow-x-auto">
                <table
                    class="w-full text-left text-sm text-zinc-600 dark:text-zinc-300"
                >
                    <thead
                        class="text-xs text-zinc-800 dark:text-zinc-100 uppercase bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700"
                    >
                        <tr>
                            <th class="px-4 py-3 font-medium whitespace-nowrap"
                                >{i18n.t({ ko: "이름", en: "Name" })}</th
                            >
                            <th class="px-4 py-3 font-medium whitespace-nowrap"
                                >{i18n.t({ ko: "학번", en: "Student ID" })}</th
                            >
                            <th class="px-4 py-3 font-medium whitespace-nowrap"
                                >{i18n.t({ ko: "연락처", en: "Contact" })}</th
                            >
                            <th class="px-4 py-3 font-medium whitespace-nowrap"
                                >{i18n.t({ ko: "역할", en: "Role" })}</th
                            >
                            <th class="px-4 py-3 font-medium whitespace-nowrap"
                                >{i18n.t({
                                    ko: "등록 여부",
                                    en: "Registered",
                                })}</th
                            >
                        </tr>
                    </thead>
                    <tbody
                        class="divide-y divide-zinc-200 dark:divide-zinc-700"
                    >
                        {#each filteredUsers as user}
                            {@const isRegistered =
                                user.agreedPrivacy && user.agreedRules}
                            <tr
                                class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                            >
                                <td
                                    class="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap"
                                    >{user.name || "-"}</td
                                >
                                <td class="px-4 py-3 whitespace-nowrap"
                                    >{user.studentNumber}</td
                                >
                                <td class="px-4 py-3 whitespace-nowrap"
                                    >{user.phoneNumber || "-"}</td
                                >
                                <td class="px-4 py-3">
                                    <div class="flex flex-wrap gap-1">
                                        {#each getRoleTags(user) as tag}
                                            <span
                                                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border {tag.classes}"
                                            >
                                                {tag.label}
                                            </span>
                                        {:else}
                                            <span
                                                class="text-xs text-zinc-400 dark:text-zinc-500"
                                                >-</span
                                            >
                                        {/each}
                                    </div>
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap">
                                    {#if isRegistered}
                                        <span
                                            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 cursor-help"
                                            title={i18n.t({
                                                ko: "개인정보 이용 동의 및 규정 동의 완료",
                                                en: "Agreed to privacy and rules",
                                            })}
                                        >
                                            <div
                                                class="w-1.5 h-1.5 rounded-full bg-green-500"
                                            ></div>
                                            {i18n.t({ ko: "완료", en: "Done" })}
                                        </span>
                                    {:else}
                                        <span
                                            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 cursor-help"
                                            title="[{i18n.t({
                                                ko: '미동의 상태:',
                                                en: 'Not agreed:',
                                            })}] {user.agreedPrivacy
                                                ? ''
                                                : i18n.t({
                                                      ko: '개인정보 ',
                                                      en: 'Privacy ',
                                                  })}{user.agreedRules
                                                ? ''
                                                : i18n.t({
                                                      ko: '규정',
                                                      en: 'Rules',
                                                  })}"
                                        >
                                            <div
                                                class="w-1.5 h-1.5 rounded-full bg-red-500"
                                            ></div>
                                            {i18n.t({
                                                ko: "미등록",
                                                en: "Pending",
                                            })}
                                        </span>
                                    {/if}
                                </td>
                            </tr>
                        {:else}
                            <tr>
                                <td
                                    colspan="5"
                                    class="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400"
                                >
                                    {i18n.t({
                                        ko: "해당 반의 유저 정보가 없습니다.",
                                        en: "No users found for this class.",
                                    })}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Mobile View -->
        <div class="flex flex-col gap-3 md:hidden">
            {#each filteredUsers as user}
                {@const isRegistered = user.agreedPrivacy && user.agreedRules}
                <div
                    class="flex flex-col gap-2 p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                >
                    <div class="flex justify-between items-start">
                        <div class="flex flex-col">
                            <span
                                class="font-bold text-lg text-zinc-900 dark:text-zinc-100"
                                >{user.name || "-"}</span
                            >
                            <span
                                class="text-sm text-zinc-500 dark:text-zinc-400"
                                >{user.studentNumber}</span
                            >
                        </div>
                        {#if isRegistered}
                            <span
                                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                            >
                                <div
                                    class="w-1.5 h-1.5 rounded-full bg-green-500"
                                ></div>
                                {i18n.t({ ko: "완료", en: "Done" })}
                            </span>
                        {:else}
                            <span
                                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                            >
                                <div
                                    class="w-1.5 h-1.5 rounded-full bg-red-500"
                                ></div>
                                {i18n.t({ ko: "미등록", en: "Pending" })}
                            </span>
                        {/if}
                    </div>

                    <div
                        class="h-px w-full bg-zinc-100 dark:bg-zinc-700 my-1"
                    ></div>

                    <div class="flex flex-col gap-1.5 text-sm">
                        <div class="flex items-center justify-between">
                            <span class="text-zinc-500 dark:text-zinc-400"
                                >{i18n.t({ ko: "연락처", en: "Contact" })}</span
                            >
                            <span
                                class="text-zinc-800 dark:text-zinc-200 font-medium"
                                >{user.phoneNumber || "-"}</span
                            >
                        </div>
                        <div class="flex items-center justify-between gap-2">
                            <span
                                class="text-zinc-500 dark:text-zinc-400 shrink-0"
                                >{i18n.t({ ko: "역할", en: "Role" })}</span
                            >
                            <div class="flex flex-wrap gap-1 justify-end">
                                {#each getRoleTags(user) as tag}
                                    <span
                                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border {tag.classes}"
                                    >
                                        {tag.label}
                                    </span>
                                {:else}
                                    <span
                                        class="text-xs text-zinc-400 dark:text-zinc-500"
                                        >-</span
                                    >
                                {/each}
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
            {#if filteredUsers.length === 0}
                <div
                    class="p-8 text-center text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                >
                    {i18n.t({
                        ko: "해당 반의 유저 정보가 없습니다.",
                        en: "No users found for this class.",
                    })}
                </div>
            {/if}
        </div>

        <!-- Sport Roster Tables -->
        <div class="flex flex-col gap-6 mt-8">
            <h2 class="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                {i18n.t({
                    ko: "종목별 참가 신청 현황",
                    en: "Sport Registration Status",
                })}
            </h2>

            {#each sportRosterData as sport}
                {@const availableUsers = filteredUsers.filter((u: UserInfo) => !sport.participants.some((p: UserInfo) => p.id === u.id))}
                <div
                    class="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-800"
                >
                    <!-- Sport Header -->
                    <div
                        class="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700"
                    >
                        <span
                            class="font-semibold text-sm text-zinc-800 dark:text-zinc-100"
                            >{i18n.decode(sport.sportName)}</span
                        >
                        <span
                            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium {sport.count >=
                            sport.minPlayers
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                : sport.count > 0
                                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'}"
                        >
                            {sport.count}/{sport.minPlayers}
                        </span>
                    </div>

                    {#if sport.count > 0}
                        <!-- Desktop Table -->
                        <div class="hidden md:block w-full overflow-x-auto">
                            <table
                                class="w-full text-left text-sm text-zinc-600 dark:text-zinc-300"
                            >
                                <thead
                                    class="text-xs text-zinc-800 dark:text-zinc-100 uppercase border-b border-zinc-200 dark:border-zinc-700"
                                >
                                    <tr>
                                        <th
                                            class="px-4 py-2.5 font-medium w-12 text-center"
                                            >#</th
                                        >
                                        <th class="px-4 py-2.5 font-medium"
                                            >{i18n.t({
                                                ko: "이름",
                                                en: "Name",
                                            })}</th
                                        >
                                        <th class="px-4 py-2.5 font-medium"
                                            >{i18n.t({
                                                ko: "학번",
                                                en: "Student ID",
                                            })}</th
                                        >
                                        <th class="px-4 py-2.5 font-medium"
                                            >{i18n.t({
                                                ko: "연락처",
                                                en: "Contact",
                                            })}</th
                                        >
                                        <th class="px-4 py-2.5 font-medium w-16 text-center"
                                            >{i18n.t({
                                                ko: "관리",
                                                en: "Manage",
                                            })}</th
                                        >
                                    </tr>
                                </thead>
                                <tbody
                                    class="divide-y divide-zinc-200 dark:divide-zinc-700"
                                >
                                    {#each sport.participants as p, idx}
                                        <tr
                                            class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                        >
                                            <td
                                                class="px-4 py-2.5 text-center text-zinc-400 dark:text-zinc-500"
                                                >{idx + 1}</td
                                            >
                                            <td
                                                class="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-100"
                                                >{p.name || "-"}</td
                                            >
                                            <td class="px-4 py-2.5"
                                                >{p.studentNumber}</td
                                            >
                                            <td class="px-4 py-2.5"
                                                >{p.phoneNumber || "-"}</td
                                            >
                                            <td class="px-4 py-2.5 text-center">
                                                <form action="?/removeUserFromRoster" method="POST" use:loadingEnhance class="inline">
                                                    <input type="hidden" name="sportId" value={sport.sportId} />
                                                    <input type="hidden" name="userId" value={p.id} />
                                                    <button type="submit" class="text-zinc-400 hover:text-red-500 transition-colors" title={i18n.t({ko: "삭제", en: "Delete"})}>
                                                        <svg class="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>

                        <!-- Mobile List -->
                        <div
                            class="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-700 md:hidden"
                        >
                            {#each sport.participants as p, idx}
                                <div class="flex items-center justify-between px-4 py-3">
                                    <div class="flex items-center gap-3">
                                        <span
                                            class="text-xs font-medium text-zinc-400 dark:text-zinc-500 w-5 text-center shrink-0"
                                            >{idx + 1}</span
                                        >
                                        <div class="flex flex-col min-w-0">
                                            <span
                                                class="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate"
                                                >{p.name || "-"}</span
                                            >
                                            <span
                                                class="text-xs text-zinc-500 dark:text-zinc-400"
                                                >{p.studentNumber}</span
                                            >
                                        </div>
                                    </div>
                                    <form action="?/removeUserFromRoster" method="POST" use:loadingEnhance class="shrink-0 flex items-center h-full">
                                        <input type="hidden" name="sportId" value={sport.sportId} />
                                        <input type="hidden" name="userId" value={p.id} />
                                        <button type="submit" class="p-2 text-zinc-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/30" title={i18n.t({ko: "삭제", en: "Delete"})} aria-label={i18n.t({ko: "삭제", en: "Delete"})}>
                                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div
                            class="px-4 py-6 text-center text-sm text-zinc-400 dark:text-zinc-500"
                        >
                            {i18n.t({
                                ko: "신청자가 없습니다.",
                                en: "No registrations.",
                            })}
                        </div>
                    {/if}

                    {#if availableUsers.length > 0}
                        <div class="px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-700 flex flex-col md:flex-row items-stretch md:items-center gap-3">
                            <span class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{i18n.t({ko: "학생 수동 추가", en: "Manual Add Student"})}</span>
                            <form action="?/addUserToRoster" method="POST" use:loadingEnhance class="flex flex-1 items-center gap-2 max-w-sm">
                                <input type="hidden" name="sportId" value={sport.sportId} />
                                <input type="hidden" name="classId" value={selectedClassId} />
                                <select name="userId" class="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-amber-500 outline-none text-zinc-800 dark:text-zinc-100 min-w-0 font-medium h-9">
                                    {#each availableUsers as au}
                                        <option value={au.id}>{au.name || "-"} ({au.studentNumber})</option>
                                    {/each}
                                </select>
                                <button type="submit" class="px-4 py-1.5 h-9 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shrink-0 shadow-sm border border-transparent">
                                    {i18n.t({ ko: "추가", en: "Add" })}
                                </button>
                            </form>
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .scrollbar-thin {
        scrollbar-width: thin;
        scrollbar-color: rgba(161, 161, 170, 0.4) transparent;
    }
    .scrollbar-thin::-webkit-scrollbar {
        height: 4px;
    }
    .scrollbar-thin::-webkit-scrollbar-track {
        background: transparent;
    }
    .scrollbar-thin::-webkit-scrollbar-thumb {
        background-color: rgba(161, 161, 170, 0.4);
        border-radius: 9999px;
    }
    .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background-color: rgba(161, 161, 170, 0.6);
    }
</style>
