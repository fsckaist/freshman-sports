<script lang="ts">
    import * as QRCode from "qrcode";
    import chevronDownIcon from "@gravity-ui/icons/svgs/chevron-down.svg?raw";
    import { slide } from "svelte/transition";

    let {
        name = "홍길동",
        studentNumber = "20251234",
        phone = "010-1234-5678",
        sports = "풋살, 농구, 배드민턴",
        userId = "123e4567-e89b-12d3-a456-426614174000",
    } = $props();

    let qrCodeUrl = $state("");
    let isCollapsed = $state(false);

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
            내 정보
        </h2>
        <div
            class="flex items-center justify-center size-8 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-all {isCollapsed ? '' : 'rotate-180'}"
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
                        <p class="shrink-0 m-0">이름</p>
                        <p class="shrink-0 m-0">학번</p>
                        <p class="shrink-0 m-0">전화번호</p>
                        <p class="shrink-0 m-0">내 종목</p>
                    </div>

                    <div
                        class="flex flex-[1_0_0] flex-col font-pretendard font-medium gap-[0.9375rem] items-start justify-center leading-[normal] min-w-px overflow-clip p-[1.25rem] text-zinc-800 dark:text-zinc-200 text-base md:text-[1.125rem]"
                    >
                        <p class="shrink-0 m-0">{name}</p>
                        <p class="shrink-0 m-0">{studentNumber}</p>
                        <p class="shrink-0 m-0">{phone}</p>
                        <p class="shrink-0 m-0">{sports}</p>
                    </div>
                </div>

                <!-- QR Code Area -->
                <div
                    class="flex flex-col items-center justify-center p-[1.25rem] md:p-[0.625rem] shrink-0 border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800"
                >
                    <div
                        class="aspect-square bg-white flex flex-col items-center justify-center p-[0.5rem] rounded-[0.625rem] size-32 md:h-[8.125rem] md:w-[8.125rem] border border-zinc-100 dark:border-zinc-700 overflow-clip"
                    >
                        {#if qrCodeUrl}
                            <img
                                src={qrCodeUrl}
                                alt="QR Code"
                                class="h-full w-full object-cover pointer-events-none"
                            />
                        {:else}
                            <div
                                class="h-full w-full bg-gray-100 animate-pulse rounded-[0.3125rem]"
                            ></div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>
