<script lang="ts">
    import { page } from "$app/stores";
    import rawSunIcon from "@gravity-ui/icons/svgs/sun.svg?raw";
    import rawMoonIcon from "@gravity-ui/icons/svgs/moon.svg?raw";
    import rawGlobeIcon from "@gravity-ui/icons/svgs/globe.svg?raw";
    import { themeManager } from "$lib/theme.svelte";
    import { i18n } from "$lib/i18n.svelte";
    import { loadingEnhance } from "$lib/actions/loading";

    const resizeSvg = (svg: string) =>
        svg.replace('width="16" height="16"', 'width="24" height="24"');

    const ThemeIcon = $derived(
        themeManager.theme === "dark"
            ? resizeSvg(rawSunIcon)
            : resizeSvg(rawMoonIcon),
    );

    let { data, form } = $props();
    const errorMessage = $derived(
        form?.error || data.cookieError || $page.url.searchParams.get("error"),
    );
</script>

<svelte:head>
    <link rel="preload" href="/logo.png" as="image" fetchpriority="high" />
</svelte:head>

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
                fetchpriority="high"
                decoding="async"
            />
        </div>

        <!-- Top Text & Logo Area -->
        <div
            class="content-stretch flex flex-[1_0_0] flex-col gap-[1.875rem] items-center md:items-start justify-end min-h-px min-w-px p-[0.625rem] relative w-full overflow-visible z-10"
        >
            <div
                class="content-stretch flex flex-col items-center justify-center overflow-visible relative shrink-0 size-20 md:size-[7.5rem]"
            >
                <img
                    src="/logo.png"
                    alt={i18n.t({ ko: "샛별 로고", en: "Saetbyeol Logo" })}
                    class="absolute max-w-none object-contain h-[6rem] w-[6rem] md:h-[10.625rem] md:w-[10.625rem] left-[-0.5rem] top-[-0.5rem] md:left-[-1.5625rem] md:top-[-1.5625rem]"
                    fetchpriority="high"
                    decoding="async"
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
                    class="font-pretendard font-bold relative shrink-0 text-center md:text-left text-[2.0rem] md:text-[4rem] tracking-tight leading-[1.1]"
                >
                    {i18n.t({
                        ko: "새내기 체육 대회",
                        en: "Freshman Sports Festival",
                    })}
                </h1>
            </div>
        </div>

        <!-- Bottom: SSO Login Button & Footer -->
        <div
            class="content-stretch flex flex-[1_0_0] flex-col items-center md:items-start justify-between min-h-px min-w-px p-[0.625rem] relative w-full overflow-visible"
        >
            <div class="flex flex-col gap-3 items-center md:items-start">
                {#if data.useSparcsSso}
                    <a
                        href="/login/sso"
                        id="sso-login-button"
                        class="flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-pretendard font-bold text-[1.125rem] rounded-[6.25rem] px-8 h-[3.125rem] transition-colors cursor-pointer no-underline shadow-md hover:shadow-lg w-full"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2.5"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                            />
                        </svg>
                        {i18n.t({
                            ko: "SPARCS SSO 로그인",
                            en: "SPARCS SSO Login",
                        })}
                    </a>
                {:else}
                    <form
                        method="POST"
                        action="?/login"
                        use:loadingEnhance
                        class="flex flex-col gap-3 w-full max-w-[20rem]"
                    >
                        <input
                            type="text"
                            name="studentNumber"
                            placeholder={i18n.t({
                                ko: "학번 입력 (예: 20241234)",
                                en: "Student Number (e.g. 20241234)",
                            })}
                            class="flex-1 px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-pretendard h-[3.125rem]"
                            required
                        />
                        <button
                            type="submit"
                            class="flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-pretendard font-bold text-[1.125rem] rounded-[6.25rem] px-8 h-[3.125rem] transition-colors cursor-pointer shadow-md hover:shadow-lg w-full"
                        >
                            {i18n.t({
                                ko: "학번으로 로그인",
                                en: "Login by Student ID",
                            })}
                        </button>
                    </form>
                {/if}

                {#if errorMessage}
                    <p
                        class="text-rose-500 font-pretendard text-[0.875rem] font-medium m-0"
                    >
                        {i18n.decode(errorMessage)}
                    </p>
                {/if}
            </div>

            <p
                class="font-pretendard font-medium leading-[normal] relative shrink-0 text-center md:text-left text-[1.125rem] m-0 text-zinc-800 dark:text-zinc-100"
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
