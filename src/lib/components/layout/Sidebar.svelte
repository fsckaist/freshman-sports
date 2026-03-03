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

    const resizeSvg = (svg: string) =>
        svg.replace('width="16" height="16"', 'width="24" height="24"');

    const navItemsGeneral = [
        { name: "개요", path: "/dashboard", icon: resizeSvg(rawOverviewIcon) },
        { name: "지원하기", path: "/apply", icon: resizeSvg(rawApplyIcon) },
        {
            name: "일정 정하기",
            path: "/schedule",
            icon: resizeSvg(rawScheduleIcon),
        },
        {
            name: "대진표 보기",
            path: "/bracket",
            icon: resizeSvg(rawBracketIcon),
        },
        { name: "규정 읽기", path: "/rules", icon: resizeSvg(rawRulesIcon) },
    ];

    const navItemsAdmin = [
        {
            name: "경기 기록지",
            path: "/record",
            icon: resizeSvg(rawRecordIcon),
        },
        { name: "관리", path: "/admin", icon: resizeSvg(rawAdminIcon) },
    ];
</script>

<aside
    class="bg-white border-r border-zinc-200 flex flex-col gap-[1.875rem] h-full items-start overflow-hidden py-[3.125rem] relative shrink-0 w-[12.5rem]"
>
    <!-- Brand -->
    <div
        class="flex flex-col items-end justify-center px-[1.875rem] shrink-0 w-full relative"
    >
        <div
            class="font-pretendard font-bold text-neutral-800 text-[1.75rem] leading-tight text-right whitespace-nowrap shrink-0 relative"
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
            {#each navItemsGeneral as item}
                {@const isActive = $page.url.pathname.startsWith(item.path)}
                <a
                    href={item.path}
                    class="group flex h-[3rem] items-center justify-end gap-[0.625rem] overflow-clip px-[1.25rem] py-[0.75rem] rounded-l-[0.625rem] shrink-0 w-[10.625rem] decoration-transparent transition-colors cursor-pointer {isActive
                        ? 'bg-zinc-100 text-zinc-600'
                        : 'bg-transparent text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 active:bg-zinc-300 active:text-zinc-900'}"
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
            {#each navItemsAdmin as item}
                {@const isActive = $page.url.pathname.startsWith(item.path)}
                <a
                    href={item.path}
                    class="group flex h-[3rem] items-center justify-end gap-[0.625rem] overflow-clip px-[1.25rem] py-[0.75rem] rounded-l-[0.625rem] shrink-0 w-[10.625rem] decoration-transparent transition-colors cursor-pointer {isActive
                        ? 'bg-zinc-100 text-zinc-600'
                        : 'bg-transparent text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 active:bg-zinc-300 active:text-zinc-900'}"
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
                    ? 'text-zinc-900 font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'}">문의 하기</a
            >
            <a
                href="/privacy"
                class="decoration-solid underline shrink-0 transition-colors cursor-pointer m-0 text-[0.75rem] {$page.url.pathname.startsWith(
                    '/privacy',
                )
                    ? 'text-zinc-900 font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'}">개인정보 처리방침</a
            >
            <form
                action="/logout"
                method="POST"
                use:enhance
                class="m-0 shrink-0 relative"
            >
                <button
                    type="submit"
                    class="decoration-solid underline shrink-0 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer m-0 bg-transparent border-0 p-0 font-pretendard text-[0.75rem]"
                    >로그아웃</button
                >
            </form>
        </div>

        <p
            class="font-pretendard font-medium leading-tight shrink-0 text-black text-[0.75rem] m-0 w-max relative"
        >
            <span class="text-zinc-900">제23대 새내기학생회 </span>
            <span class="text-amber-500">샛별</span>
        </p>
    </div>
</aside>
