<script lang="ts">
    import rawSunIcon from "@gravity-ui/icons/svgs/sun.svg?raw";
    import rawMoonIcon from "@gravity-ui/icons/svgs/moon.svg?raw";
    import rawGlobeIcon from "@gravity-ui/icons/svgs/globe.svg?raw";
    import { themeManager } from "$lib/theme.svelte";
    import { i18n } from "$lib/i18n.svelte";
    import { loadingEnhance } from '$lib/actions/loading';

    const resizeSvg = (svg: string) =>
        svg.replace('width="16" height="16"', 'width="24" height="24"');

    const ThemeIcon = $derived(
        themeManager.theme === "dark"
            ? resizeSvg(rawSunIcon)
            : resizeSvg(rawMoonIcon),
    );

    let { data } = $props();
</script>

<div
    class="relative size-full min-h-screen bg-white dark:bg-zinc-950 overflow-hidden flex justify-center"
>
    <!-- Toggles (Top Right) -->
    <div class="absolute top-4 right-4 md:top-8 md:right-8 z-50 flex items-center gap-2">
        <button
            onclick={() => i18n.toggle()}
            class="flex items-center justify-center size-12 rounded-xl bg-white/50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 backdrop-blur-sm transition-colors cursor-pointer"
            title={i18n.t({ ko: "언어 변경", en: "Change Language" })}
        >
            <div class="size-6 text-current">
                {@html resizeSvg(rawGlobeIcon)}
            </div>
        </button>
        <button
            onclick={() => themeManager.toggle()}
            class="flex items-center justify-center size-12 rounded-xl bg-white/50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 backdrop-blur-sm transition-colors cursor-pointer"
            title={i18n.t({ ko: "테마 변경", en: "Toggle Theme" })}
        >
            <div class="size-6 text-current">
                {@html ThemeIcon}
            </div>
        </button>
    </div>

    <!-- Centered 90rem wrapper so the absolute watermark is properly anchored -->
    <div
        class="relative flex flex-col gap-[0.625rem] min-h-[56.25rem] min-h-screen items-start w-full max-w-[90rem] px-6 py-12 md:px-[12.5rem] md:py-[6.25rem]"
    >
        <!-- Glowing Right Side Watermark -->
        <div
            class="absolute -translate-y-1/2 blur-[0.625rem] opacity-20 dark:opacity-10 right-[-12.8125rem] size-[40rem] md:size-[65.3125rem] top-[calc(50%+7.65625rem)] pointer-events-none select-none mix-blend-multiply dark:mix-blend-plus-lighter z-0"
        >
            <img
                src="/logo.png"
                alt="watermark logo"
                class="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
            />
        </div>

        <!-- Top Text & Logo Area -->
        <div
            class="content-stretch flex flex-[1_0_0] flex-col gap-[1.875rem] items-start justify-end min-h-px min-w-px p-[0.625rem] relative w-full overflow-visible z-10"
        >
            <div
                class="content-stretch flex flex-col items-center justify-center overflow-visible relative shrink-0 size-20 md:size-[7.5rem]"
            >
                <img
                    src="/logo.png"
                    alt={i18n.t({ ko: '샛별 로고', en: 'Saetbyeol Logo' })}
                    class="absolute max-w-none object-contain h-[6rem] w-[6rem] md:h-[10.625rem] md:w-[10.625rem] left-[-0.5rem] top-[-0.5rem] md:left-[-1.5625rem] md:top-[-1.5625rem]"
                />
            </div>

            <div
                class="content-stretch flex flex-col gap-[0.3125rem] items-start leading-[normal] relative shrink-0 text-zinc-800 dark:text-zinc-100"
            >
                <h1
                    class="font-pretendard font-bold relative shrink-0 text-[1.75rem] md:text-[2rem] tracking-tight leading-[1.4] mb-[1rem]"
                    style="word-break: keep-all;"
                >
                    {i18n.t({ ko: '새내기 체육대회에 참여할 수 없어요!', en: 'You cannot participate in Freshman Sports!' })}
                </h1>
                <p
                    class="font-pretendard font-semibold relative shrink-0 text-md md:text-[1.25rem] text-zinc-600 dark:text-zinc-300"
                >
                    {data.name}{i18n.t({ ko: '님은 새내기 체육대회 사업 수혜자가 아니에요', en: ' is not an eligible participant for the event.' })}<br />
                    {i18n.t({ ko: '문제가 있다고 판단되시면 새내기학생회에 문의해주세요', en: 'Please contact the Freshman Council with any concerns.' })}
                </p>
            </div>
        </div>

        <!-- Bottom: Logout Button & Footer -->
        <div
            class="content-stretch flex flex-[1_0_0] flex-col items-start justify-between min-h-px min-w-px p-[0.625rem] relative w-full overflow-visible z-10"
        >
            <div class="flex flex-col gap-3 items-start w-full">
                <form
                    method="POST"
                    action="/logout"
                    use:loadingEnhance
                    class="w-full max-w-[20rem]"
                >
                    <button
                        type="submit"
                        class="flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-pretendard font-bold text-[1.125rem] rounded-[6.25rem] px-8 h-[3.125rem] transition-colors cursor-pointer shadow-md hover:shadow-lg w-full"
                    >
                        {i18n.t({ ko: '로그아웃', en: 'Log out' })}
                    </button>
                </form>
            </div>

            <p
                class="font-pretendard font-medium leading-[normal] relative shrink-0 text-[1.125rem] m-0 text-zinc-800 dark:text-zinc-100"
            >
                {i18n.t({ ko: '제23대 새내기학생회', en: '23rd Freshman Council' })} <span class="text-amber-500">{i18n.t({ ko: '샛별', en: 'Saetbyeol' })}</span>
            </p>
        </div>
    </div>
</div>
