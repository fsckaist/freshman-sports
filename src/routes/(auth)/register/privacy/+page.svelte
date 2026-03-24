<script lang="ts">
    import { enhance } from "$app/forms";
    import rawSunIcon from "@gravity-ui/icons/svgs/sun.svg?raw";
    import rawMoonIcon from "@gravity-ui/icons/svgs/moon.svg?raw";
    import rawGlobeIcon from "@gravity-ui/icons/svgs/globe.svg?raw";
    import { themeManager } from "$lib/theme.svelte";
    import { i18n } from "$lib/i18n.svelte";

    let { form } = $props();

    const resizeSvg = (svg: string) =>
        svg.replace('width="16" height="16"', 'width="24" height="24"');

    const ThemeIcon = $derived(
        themeManager.theme === "dark"
            ? resizeSvg(rawSunIcon)
            : resizeSvg(rawMoonIcon),
    );
</script>

<div
    class="relative size-full min-h-screen bg-white dark:bg-zinc-950 overflow-hidden flex justify-center"
>
    <!-- Toggles (Top Right) -->
    <div
        class="absolute top-4 right-4 md:top-8 md:right-8 z-50 flex items-center gap-2"
    >
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
        class="relative flex flex-col gap-[0.625rem] min-h-[56.25rem] min-h-screen items-center md:items-start w-full max-w-[90rem] px-6 py-12 md:px-[12.5rem] md:py-[6.25rem]"
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
            class="content-stretch flex flex-[1_0_0] flex-col gap-[1.875rem] items-center md:items-start justify-end min-h-px min-w-px p-[0.625rem] relative w-full overflow-visible z-10 border-b border-transparent dark:border-zinc-800/50 pb-[1.875rem]"
        >
            <div
                class="content-stretch flex flex-col items-center justify-center overflow-visible relative shrink-0 size-20 md:size-[7.5rem]"
            >
                <img
                    src="/logo.png"
                    alt={i18n.t({ ko: "샛별 로고", en: "Saetbyeol Logo" })}
                    class="absolute max-w-none object-contain h-[6rem] w-[6rem] md:h-[10.625rem] md:w-[10.625rem] left-[-0.5rem] top-[-0.5rem] md:left-[-1.5625rem] md:top-[-1.5625rem]"
                />
            </div>

            <div
                class="content-stretch flex flex-col gap-[0.3125rem] items-center md:items-start leading-[normal] relative shrink-0 text-zinc-800 dark:text-zinc-100"
            >
                <p
                    class="font-pretendard font-semibold relative shrink-0 text-center md:text-left text-lg md:text-[1.5rem]"
                >
                    {i18n.t({ ko: "2026 봄학기", en: "Spring 2026" })}
                </p>
                <h1
                    class="font-pretendard font-bold relative shrink-0 text-center md:text-left text-[2.0rem] md:text-[4rem] tracking-tight leading-[1.1] break-keep"
                >
                    {i18n.t({
                        ko: "새내기 체육 대회",
                        en: "Freshman Sports Festival",
                    })}
                </h1>
            </div>
        </div>

        <!-- Bottom Privacy Agreement Area -->
        <div
            class="content-stretch flex flex-[1_0_0] flex-col items-center md:items-start justify-between min-h-px min-w-px p-[0.625rem] relative w-full overflow-visible"
        >
            <div
                class="content-stretch flex flex-col font-pretendard font-normal gap-[0.625rem] items-center md:items-start leading-[normal] overflow-clip relative shrink-0 text-lg md:text-[1.25rem] break-keep"
            >
                <p
                    class="relative shrink-0 text-center md:text-left text-zinc-800 dark:text-zinc-300 m-0"
                >
                    {i18n.t({
                        ko: "효율적인 체육 대회를 위하여 여러분의 일부 개인 정보와 학적 정보가 필요해요.",
                        en: "We require some of your personal and academic information for an efficient sports event.",
                    })}
                </p>
                <a
                    href="/info/privacy"
                    target="_blank"
                    class="decoration-solid relative shrink-0 text-center md:text-left text-amber-500 underline hover:text-amber-600 transition-colors cursor-pointer m-0"
                >
                    {i18n.t({
                        ko: "개인정보 처리방침 전문 확인하기",
                        en: "Read full Privacy Policy",
                    })}
                </a>
            </div>

            <form
                method="POST"
                action="?/agree"
                use:enhance
                class="content-stretch flex flex-col gap-[1rem] items-center md:items-start relative shrink-0 break-keep"
            >
                <p
                    class="font-pretendard font-normal leading-[normal] relative shrink-0 text-center md:text-left text-zinc-800 dark:text-zinc-100 text-lg md:text-[1.25rem] m-0"
                >
                    {i18n.t({
                        ko: "개인정보 제공에 대해 동의하시나요?",
                        en: "Do you agree to the provision of personal information?",
                    })}
                </p>
                <button
                    type="submit"
                    aria-label="Agree to privacy policy"
                    class="bg-amber-500 content-stretch flex flex-col items-center justify-center px-[2.1875rem] py-[0.5rem] relative rounded-[6.25rem] shrink-0 hover:bg-amber-600 active:bg-amber-800 transition-colors cursor-pointer"
                >
                    <span
                        class="font-pretendard font-semibold leading-[normal] relative shrink-0 text-lg md:text-[1.25rem] text-white"
                        >{i18n.t({ ko: "동의", en: "Agree" })}</span
                    >
                </button>
            </form>

            <p
                class="font-pretendard font-medium leading-[normal] relative shrink-0 text-center md:text-left text-[1.125rem] m-0 text-zinc-800 dark:text-zinc-100 border-t border-transparent dark:border-zinc-800/50 w-full pt-[1.25rem]"
            >
                {i18n.t({
                    ko: "제23대 새내기학생회",
                    en: "23rd Freshman Council",
                })}
                <span class="text-amber-500"
                    >{i18n.t({ ko: "샛별", en: "Saetbyeol" })}</span
                >
            </p>
        </div>
    </div>
</div>
