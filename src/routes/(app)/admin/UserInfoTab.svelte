<script lang="ts">
    import { i18n } from "$lib/i18n.svelte";

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
    }

    let { allClasses, allUserInfo } = $props<{
        allClasses: { id: string; classNumber: number }[];
        allUserInfo: UserInfo[];
    }>();

    let selectedClassId = $state(
        allClasses.length > 0 ? allClasses[0].id : null,
    );

    let filteredUsers = $derived(
        selectedClassId
            ? allUserInfo.filter((u: UserInfo) => u.classId === selectedClassId)
            : [],
    );

    function getRoleText(user: UserInfo) {
        let roles = [];
        if (user.isAdmin) roles.push(i18n.t({ ko: "관리자", en: "Admin" }));
        if (user.isManager) roles.push(i18n.t({ ko: "매니저", en: "Manager" }));
        if (user.isReferee) roles.push(i18n.t({ ko: "심판", en: "Referee" }));
        if (user.isProctor) roles.push(i18n.t({ ko: "프락터", en: "Proctor" }));

        return roles.join(", ") || i18n.t({ ko: "참가자", en: "Participant" });
    }
</script>

<div
    class="flex flex-col bg-white dark:bg-zinc-900 rounded-[1.25rem] w-full flex-[1_0_0] relative overflow-hidden shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] dark:shadow-none h-full"
>
    <!-- Header with Class Selector -->
    <div
        class="flex items-center gap-4 px-[1.875rem] py-4 shrink-0 border-b border-zinc-100 dark:border-zinc-800"
    >
        <div class="flex gap-2 overflow-x-auto shrink-0">
            {#each allClasses as c}
                <button
                    class="px-4 py-2 rounded-lg font-medium text-sm transition-colors shrink-0
                           {selectedClassId === c.id
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'}"
                    onclick={() => (selectedClassId = c.id)}
                >
                    {c.classNumber}{i18n.t({ ko: "반", en: "Class" })}
                </button>
            {/each}
        </div>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto p-[1.875rem]">
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
                                >{i18n.t({ ko: "역", en: "Role" })}</th
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
                                <td class="px-4 py-3 whitespace-nowrap">
                                    <span
                                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                                    >
                                        {getRoleText(user)}
                                    </span>
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
                        <div class="flex items-center justify-between">
                            <span class="text-zinc-500 dark:text-zinc-400"
                                >{i18n.t({ ko: "역할", en: "Role" })}</span
                            >
                            <span
                                class="text-zinc-800 dark:text-zinc-200 font-medium"
                                >{getRoleText(user)}</span
                            >
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
    </div>
</div>
