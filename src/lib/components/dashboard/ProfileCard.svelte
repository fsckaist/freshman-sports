<script lang="ts">
    import rawBarcodeIcon from "@gravity-ui/icons/svgs/qr-code.svg?raw";
    import * as QRCode from "qrcode";
    import chevronDownIcon from "@gravity-ui/icons/svgs/chevron-down.svg?raw";
    import { slide, fade } from "svelte/transition";
    import { i18n } from "$lib/i18n.svelte";
    import { themeManager } from "$lib/theme.svelte";

    let {
        name = i18n.t({ ko: "임시 이름", en: "Dummy" }),
        studentNumber = "00000000",
        phone = "010-000-0000",
        sports = [] as string[],
        userId = "00000000-0000-0000-0000-000000000000",
    } = $props<{
        name?: string;
        studentNumber?: string;
        phone?: string;
        sports?: string[];
        userId?: string;
    }>();

    let qrCodeUrl = $state("");
    let isCollapsed = $state(false);
    let showQrModal = $state(false);

    function portal(node: HTMLElement) {
        if (typeof document !== "undefined") {
            document.body.appendChild(node);
        }
        return {
            destroy() {
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            },
        };
    }

    $effect(() => {
        if (userId) {
            QRCode.toDataURL(userId, {
                margin: 0,
                width: 130,
                color: { dark: "#1f1f22", light: "#ffffff" },
            }).then((url) => {
                qrCodeUrl = url;
            });
        }
    });
</script>

<div class="flex flex-col gap-[0.625rem] items-start shrink-0 w-full relative">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="flex gap-[0.625rem] items-center justify-center shrink-0 w-full relative cursor-pointer group"
        onclick={() => (isCollapsed = !isCollapsed)}
    >
        <h2
            class="font-pretendard font-bold text-zinc-600 dark:text-zinc-400 text-[1.5rem] leading-[normal] shrink-0 m-0"
        >
            {i18n.t({ ko: "내 정보", en: "My Info" })}
        </h2>
        <div
            class="flex items-center justify-center size-8 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-all {isCollapsed
                ? ''
                : 'rotate-180'}"
        >
            {@html chevronDownIcon}
        </div>
        <div
            class="flex flex-[1_0_0] h-[1px] items-center justify-center min-w-px relative bg-zinc-300 dark:bg-zinc-700 rounded-full"
        ></div>
    </div>

    {#if !isCollapsed}
        <div
            transition:slide={{ duration: 300 }}
            class="bg-white dark:bg-zinc-900 rounded-[1.25rem] shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] dark:shadow-none shrink-0 w-full relative overflow-hidden"
        >
            <div
                class="flex flex-col md:flex-row items-stretch md:overflow-clip rounded-[1.25rem] w-full h-full relative"
            >
                <!-- Info Grid -->
                <div class="flex flex-1 items-stretch">
                    <div
                        class="bg-neutral-50 dark:bg-zinc-800/50 border-r border-zinc-200 dark:border-zinc-800 flex flex-col font-pretendard font-normal gap-[0.9375rem] items-end justify-center leading-[normal] overflow-clip pl-8 md:pl-[3.125rem] pr-[1.25rem] py-[1.25rem] shrink-0 text-zinc-600 dark:text-zinc-400 text-base md:text-[1.125rem]"
                    >
                        <p class="shrink-0 m-0">
                            {i18n.t({ ko: "이름", en: "Name" })}
                        </p>
                        <p class="shrink-0 m-0">
                            {i18n.t({ ko: "학번", en: "ID" })}
                        </p>
                        <p class="shrink-0 m-0">
                            {i18n.t({ ko: "전화번호", en: "Phone" })}
                        </p>
                        <p class="shrink-0 m-0">
                            {i18n.t({ ko: "내 종목", en: "My Sports" })}
                        </p>
                    </div>

                    <div
                        class="flex flex-[1_0_0] flex-col font-pretendard font-medium gap-[0.9375rem] items-start justify-center leading-[normal] min-w-px overflow-clip p-[1.25rem] text-zinc-800 dark:text-zinc-200 text-base md:text-[1.125rem]"
                    >
                        <p class="shrink-0 m-0">{name}</p>
                        <p class="shrink-0 m-0">{studentNumber}</p>
                        <p class="shrink-0 m-0">{phone}</p>
                        <p class="shrink-0 m-0">
                            {sports && sports.length > 0
                                ? sports
                                      .map((s: string) => i18n.decode(s))
                                      .join(", ")
                                : i18n.t({
                                      ko: "참여 종목 없음",
                                      en: "No participations",
                                  })}
                        </p>
                    </div>
                </div>

                <!-- QR Code Area -->
                <div
                    class="flex flex-col items-center justify-center p-[1.25rem] md:p-[0.625rem] shrink-0 border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800"
                >
                    <button
                        class="aspect-square bg-neutral-50 hover:bg-neutral-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 transition-colors flex flex-col gap-[0.5rem] items-center justify-center p-[0.5rem] rounded-[0.625rem] size-32 md:h-[8.125rem] md:w-[8.125rem] border border-zinc-200 dark:border-zinc-700 overflow-clip cursor-pointer outline-none"
                        onclick={() => (showQrModal = true)}
                    >
                        <div class="size-8 text-zinc-400 dark:text-zinc-500">
                            {@html rawBarcodeIcon.replace(
                                "<svg",
                                '<svg class="size-full"',
                            )}
                        </div>
                        <span
                            class="font-pretendard font-medium text-sm text-zinc-600 dark:text-zinc-400"
                        >
                            {i18n.t({ ko: "QR 보기", en: "View QR" })}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    {/if}

    <!-- Fallback/Portal works best, but absolute inset-fixed here will cover the viewport -->
    {#if showQrModal}
        <!-- Use role="dialog" or a similar accessibility wrapper if needed, here just absolute screen cover -->
        <div
            use:portal
            transition:fade={{ duration: 200 }}
            class="fixed inset-0 z-[99999] bg-white text-zinc-900 flex flex-col items-center justify-center overflow-hidden"
        >
            <!-- Glowing Right Side Watermark (Match Login Screen) -->
            <div
                class="absolute -translate-y-1/2 blur-[0.625rem] opacity-50 right-[-12.8125rem] size-[40rem] md:size-[65.3125rem] top-[calc(50%+7.65625rem)] pointer-events-none select-none mix-blend-multiply z-0"
            >
                <img
                    src="/logo.png"
                    alt="watermark logo"
                    class="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                />
            </div>

            <!-- Content Container -->
            <div
                class="z-10 flex flex-col items-center gap-8 w-full px-6 max-w-sm"
            >
                <!-- QR Card Area -->
                <div
                    class="rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-zinc-100 flex flex-col items-center gap-6 w-full relative overflow-hidden"
                >
                    <div class="flex flex-col items-center gap-1 w-full">
                        <img
                            src="/logo.png"
                            alt="logo"
                            class="h-[6rem] w-auto object-contain mb-1"
                        />
                        <h2
                            class="font-pretendard font-bold text-2xl text-zinc-800 m-0 text-center break-keep"
                        >
                            {i18n.t({
                                ko: "새내기 체육대회",
                                en: "Freshman Sports Festival",
                            })}
                        </h2>
                        <p class="text-zinc-500 text-sm">
                            {i18n.t({
                                ko: "모바일 인증",
                                en: "Mobile Authentication",
                            })}
                        </p>
                    </div>
                    <!-- Rotating Anti-Capture Border -->
                    <div
                        class="relative flex items-center justify-center rounded-[1.75rem] overflow-hidden w-60 h-60 z-20"
                    >
                        <!-- Spinning Gradient -->
                        <div
                            class="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#fde68a_0deg,#fbbf24_90deg,#d97706_180deg,#fbbf24_270deg,#fde68a_360deg)] animate-[spin_2s_linear_infinite]"
                        ></div>
                        <!-- Inner White Container -->
                        <div
                            class="absolute inset-[5px] bg-white rounded-[1.5rem] z-10 flex items-center justify-center overflow-hidden"
                        >
                            {#if qrCodeUrl}
                                <img
                                    src={qrCodeUrl}
                                    alt="QR Code"
                                    class="w-48 h-48 object-cover pointer-events-none select-none"
                                    draggable="false"
                                />
                            {:else}
                                <div
                                    class="w-48 h-48 bg-zinc-100 animate-pulse rounded-2xl"
                                ></div>
                            {/if}
                        </div>
                    </div>

                    <!-- User Verification Info -->
                    <div class="flex flex-col items-center gap-1 mb-2">
                        <p
                            class="font-pretendard font-bold text-xl text-zinc-900 m-0"
                        >
                            {name}
                        </p>
                        <p
                            class="font-pretendard font-medium text-zinc-500 text-sm m-0"
                        >
                            {studentNumber}
                        </p>
                    </div>

                    <!-- Close Button -->
                    <button
                        class="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-pretendard font-semibold text-lg py-4 rounded-2xl transition-colors cursor-pointer outline-none"
                        onclick={() => (showQrModal = false)}
                    >
                        {i18n.t({ ko: "돌아가기", en: "Go Back" })}
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>
