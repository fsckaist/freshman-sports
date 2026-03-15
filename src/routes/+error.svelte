<script lang="ts">
    import { page } from "$app/stores";

    const errorMessages: Record<
        number,
        { title: string; description: string }
    > = {
        404: {
            title: "404",
            description: "페이지를 찾을 수 없습니다.",
        },
        403: {
            title: "403",
            description: "이 페이지에 접근할 수 있는 권한이 없습니다.",
        },
        500: {
            title: "500",
            description: "서버 내부에서 오류가 발생했습니다.",
        },
        502: {
            title: "502",
            description: "게이트웨이 오류가 발생했습니다.",
        },
        503: {
            title: "503",
            description: "서비스를 일시적으로 사용할 수 없습니다.",
        },
    };

    $: status = $page.status;
    $: error = errorMessages[status] || {
        title: status.toString(),
        description: $page.error?.message || "알 수 없는 오류가 발생했습니다.",
    };
</script>

<div
    class="relative size-full min-h-screen bg-white dark:bg-zinc-950 overflow-hidden flex justify-center"
>
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
                    alt="샛별 로고"
                    class="absolute max-w-none object-contain h-[6rem] w-[6rem] md:h-[10.625rem] md:w-[10.625rem] left-[-0.5rem] top-[-0.5rem] md:left-[-1.5625rem] md:top-[-1.5625rem]"
                />
            </div>

            <div
                class="content-stretch flex flex-col gap-[0.3125rem] items-start leading-[normal] relative shrink-0 text-zinc-800 dark:text-zinc-100"
            >
                <h1
                    class="font-pretendard font-bold relative shrink-0 text-xl md:text-[4rem] tracking-tighter leading-[0.9]"
                >
                    {error.title}
                </h1>
                <p
                    class="font-pretendard font-medium text-xl md:text-[1.25rem] mt-4 opacity-70"
                >
                    {error.description}
                </p>
            </div>
        </div>

        <!-- Action Area -->
        <div
            class="content-stretch flex flex-[1_0_0] flex-col items-start justify-between min-h-px min-w-px p-[0.625rem] relative w-full overflow-visible z-10"
        >
            <div class="mt-8">
                <a
                    href="/"
                    class="group flex items-center gap-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3.5 rounded-2xl font-pretendard font-bold text-[1.125rem] hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg shadow-zinc-200 dark:shadow-none"
                >
                    <span>메인 페이지로 돌아가기</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.5"
                        class="transform group-hover:translate-x-1 transition-transform"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M5 12h14m-5-5l5 5-5 5"
                        />
                    </svg>
                </a>
            </div>

            <p
                class="font-pretendard font-medium leading-[normal] relative shrink-0 text-[1.125rem] m-0 text-zinc-800 dark:text-zinc-100"
            >
                제23대 새내기학생회 <span class="text-amber-500">샛별</span>
            </p>
        </div>
    </div>
</div>
