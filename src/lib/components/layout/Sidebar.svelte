<script lang="ts">
    import { page } from "$app/stores";
    import { enhance } from "$app/forms";

    import rawOverviewIcon from "@gravity-ui/icons/svgs/house.svg?raw";
    import rawApplyIcon from "@gravity-ui/icons/svgs/circle-arrow-right.svg?raw";
    import rawScheduleIcon from "@gravity-ui/icons/svgs/calendar.svg?raw";
    import rawBracketIcon from "@gravity-ui/icons/svgs/branches-down.svg?raw";
    import rawRulesIcon from "@gravity-ui/icons/svgs/book.svg?raw";
    import rawRecordIcon from "@gravity-ui/icons/svgs/scales-balanced.svg?raw";
    import rawAdminIcon from "@gravity-ui/icons/svgs/wrench.svg?raw";
    import rawSunIcon from "@gravity-ui/icons/svgs/sun.svg?raw";
    import rawMoonIcon from "@gravity-ui/icons/svgs/moon.svg?raw";
    import rawXmarkIcon from "@gravity-ui/icons/svgs/xmark.svg?raw";
    import { themeManager } from "$lib/theme.svelte";
    import { isMenuOpen } from "$lib/stores/nav";

    const resizeSvg = (svg: string) =>
        svg.replace('width="16" height="16"', 'width="24" height="24"');

    const ThemeIcon = $derived(
        themeManager.theme === "dark"
            ? resizeSvg(rawSunIcon)
            : resizeSvg(rawMoonIcon),
    );

    const allNavItems = [
        {
            id: "overview",
            name: "개요",
            path: "/",
            icon: resizeSvg(rawOverviewIcon),
            states: ["REGISTRATION", "ONGOING", "COMPLETED"],
        },
        {
            id: "apply",
            name: "지원하기",
            path: "/apply",
            icon: resizeSvg(rawApplyIcon),
            states: ["REGISTRATION"],
            requiresParticipant: true,
        },
        {
            id: "schedule",
            name: "일정 정하기",
            path: "/schedule",
            icon: resizeSvg(rawScheduleIcon),
            states: ["ONGOING"],
            requiresParticipant: true,
        },
        {
            id: "bracket",
            name: "대진표 보기",
            path: "/bracket",
            icon: resizeSvg(rawBracketIcon),
            states: ["ONGOING"],
        },
        {
            id: "rules",
            name: "규정 읽기",
            path: "/rules",
            icon: resizeSvg(rawRulesIcon),
            states: ["REGISTRATION", "ONGOING", "COMPLETED"],
        },
    ];

    const adminNavItems = [
        {
            id: "record",
            name: "경기 기록지",
            path: "/record",
            icon: resizeSvg(rawRecordIcon),
            requiresManager: true,
        },
        {
            id: "admin",
            name: "관리",
            path: "/admin",
            icon: resizeSvg(rawAdminIcon),
            requiresAdmin: true,
        },
    ];

    const eventState = $derived(
        ($page.data.eventState ?? "REGISTRATION") as
            | "REGISTRATION"
            | "ONGOING"
            | "COMPLETED",
    );
    const user = $derived($page.data.user);

    const visibleGeneral = $derived(
        allNavItems.filter((item) => {
            if (!item.states.includes(eventState)) return false;
            if (item.requiresParticipant) {
                return user?.classId != null || user?.isProctor === true;
            }
            return true;
        }),
    );
    const visibleAdmin = $derived(
        adminNavItems.filter((item) => {
            if (item.requiresAdmin) return user?.isAdmin;
            if (item.requiresManager) return user?.isManager || user?.isAdmin;
            return true;
        }),
    );
</script>

<aside
    class="bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col gap-[1.875rem] h-full items-start overflow-hidden py-[3.125rem] relative shrink-0 w-full md:w-[12.5rem]"
>
    <!-- Mobile Close Button -->
    <button
        onclick={() => isMenuOpen.set(false)}
        class="absolute top-4 left-4 md:hidden p-2 text-zinc-400 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        aria-label="Close menu"
    >
        <div class="size-6">
            {@html resizeSvg(rawXmarkIcon)}
        </div>
    </button>
    <!-- Brand -->
    <div
        class="flex flex-col items-end justify-center px-[1.875rem] shrink-0 w-full relative"
    >
        <div class="flex items-center justify-between w-full">
            <button
                onclick={() => themeManager.toggle()}
                class="flex self-start items-center justify-center size-[2.5rem] rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-600 transition-colors cursor-pointer"
                title="테마 변경"
            >
                <div class="size-6">
                    {@html ThemeIcon}
                </div>
            </button>
            <div
                class="size-20 shrink-0 relative overflow-visible translate-x-3"
            >
                <img
                    src="/logo.png"
                    alt="샛별 로고"
                    class="absolute inset-0 size-full object-contain"
                />
            </div>
        </div>
        <div
            class="font-pretendard font-bold text-neutral-800 dark:text-zinc-100 text-[1.75rem] leading-tight text-right whitespace-nowrap shrink-0 relative"
        >
            <p class="m-0">새내기</p>
            <p class="m-0">체육 대회</p>
        </div>
    </div>

    <!-- Menu -->
    <div
        class="flex flex-[1_0_0] flex-col items-end justify-between min-h-px min-w-px pl-[1.875rem] w-full relative"
    >
        <nav class="flex flex-col gap-[0.625rem] items-start shrink-0 relative">
            {#each visibleGeneral as item}
                {@const isActive = item.path === "/" ? $page.url.pathname === "/" : $page.url.pathname.startsWith(item.path)}
                <a
                    href={item.path}
                    class="group flex h-[3rem] items-center justify-end gap-[0.625rem] overflow-clip px-[1.25rem] py-[0.75rem] rounded-l-[0.625rem] shrink-0 w-[10.625rem] decoration-transparent transition-colors cursor-pointer {isActive
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                        : 'bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-100 active:bg-zinc-300 dark:active:bg-zinc-600 active:text-zinc-800 dark:active:text-zinc-50'}"
                >
                    <div
                        class="overflow-clip relative shrink-0 size-[1.5rem] text-current transition-colors"
                    >
                        {@html item.icon}
                    </div>
                    <div
                        class="flex flex-[1_0_0] items-center min-h-px min-w-px relative"
                    >
                        <p
                            class="font-pretendard font-normal text-[1rem] leading-tight shrink-0 m-0 transition-colors"
                        >
                            {item.name}
                        </p>
                    </div>
                </a>
            {/each}
        </nav>

        <nav class="flex flex-col gap-[0.625rem] items-start shrink-0 relative">
            {#each visibleAdmin as item}
                {@const isActive = item.path === "/" ? $page.url.pathname === "/" : $page.url.pathname.startsWith(item.path)}
                <a
                    href={item.path}
                    class="group flex h-[3rem] items-center justify-end gap-[0.625rem] overflow-clip px-[1.25rem] py-[0.75rem] rounded-l-[0.625rem] shrink-0 w-[10.625rem] decoration-transparent transition-colors cursor-pointer {isActive
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                        : 'bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-100 active:bg-zinc-300 dark:active:bg-zinc-600 active:text-zinc-800 dark:active:text-zinc-50'}"
                >
                    <div
                        class="overflow-clip relative shrink-0 size-[1.5rem] text-current transition-colors"
                    >
                        {@html item.icon}
                    </div>
                    <div
                        class="flex flex-[1_0_0] items-center min-h-px min-w-px relative"
                    >
                        <p
                            class="font-pretendard font-normal text-[1rem] leading-tight shrink-0 m-0 transition-colors"
                        >
                            {item.name}
                        </p>
                    </div>
                </a>
            {/each}
        </nav>
    </div>

    <!-- Extra -->
    <div
        class="flex flex-col gap-[1.25rem] items-end justify-center px-[1.875rem] shrink-0 w-full relative"
    >
        <div
            class="flex flex-col font-pretendard font-normal gap-[0.625rem] items-end justify-center leading-tight shrink-0 relative"
        >
            <a
                href="/contact"
                class="decoration-solid underline shrink-0 transition-colors cursor-pointer m-0 text-[0.75rem] {$page.url.pathname.startsWith(
                    '/contact',
                )
                    ? 'text-zinc-800 dark:text-zinc-200 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}"
                >문의 하기</a
            >
            <a
                href="/privacy"
                class="decoration-solid underline shrink-0 transition-colors cursor-pointer m-0 text-[0.75rem] {$page.url.pathname.startsWith(
                    '/privacy',
                )
                    ? 'text-zinc-800 dark:text-zinc-200 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}"
                >개인정보 처리방침</a
            >
            <form
                action="/logout"
                method="POST"
                use:enhance
                class="m-0 shrink-0 relative"
            >
                <button
                    type="submit"
                    class="decoration-solid underline shrink-0 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer m-0 bg-transparent border-0 p-0 font-pretendard text-[0.75rem]"
                    >로그아웃</button
                >
            </form>
        </div>

        <div class="flex items-end justify-end w-full">
            <p
                class="font-pretendard font-medium leading-tight shrink-0 text-black dark:text-white text-[0.75rem] m-0 w-max relative"
            >
                <span class="text-zinc-800 dark:text-zinc-300"
                    >제23대 새내기학생회
                </span>
                <span class="text-amber-500">샛별</span>
            </p>
        </div>
    </div>
</aside>
