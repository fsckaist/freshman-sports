<script lang="ts">
    import { enhance } from "$app/forms";
    let { form } = $props();
</script>

<div
    class="relative size-full min-h-screen bg-white dark:bg-zinc-950 overflow-hidden flex justify-center"
>
    <!-- Centered 90rem wrapper so the absolute watermark is properly anchored -->
    <div
        class="relative flex flex-col gap-[0.625rem] min-h-[56.25rem] min-h-screen items-start w-full max-w-[90rem] px-[12.5rem] py-[6.25rem]"
    >
        <!-- Glowing Right Side Watermark -->
        <div
            class="absolute -translate-y-1/2 blur-[0.625rem] opacity-20 dark:opacity-10 right-[-12.8125rem] size-[65.3125rem] top-[calc(50%+7.65625rem)] pointer-events-none select-none mix-blend-multiply dark:mix-blend-plus-lighter z-0"
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
                class="content-stretch flex flex-col items-center justify-center overflow-visible relative shrink-0 size-[7.5rem]"
            >
                <img
                    src="/logo.png"
                    alt="샛별 로고"
                    class="absolute max-w-none object-contain h-[10.625rem] w-[10.625rem] left-[-1.5625rem] top-[-1.5625rem]"
                />
            </div>

            <div
                class="content-stretch flex flex-col gap-[0.3125rem] items-start leading-[normal] relative shrink-0 text-zinc-800 dark:text-zinc-100"
            >
                <p
                    class="font-pretendard font-semibold relative shrink-0 text-[1.5rem]"
                >
                    2026 봄학기
                </p>
                <h1
                    class="font-pretendard font-bold relative shrink-0 text-[4rem] tracking-tight leading-[1.1]"
                >
                    새내기 체육 대회
                </h1>
            </div>
        </div>

        <!-- Bottom Input & Footer Area -->
        <div
            class="content-stretch flex flex-[1_0_0] flex-col items-start justify-between min-h-px min-w-px p-[0.625rem] relative w-full overflow-visible"
        >
            <form
                method="POST"
                action="?/login"
                use:enhance
                novalidate
                class="bg-zinc-100 dark:bg-zinc-900 content-stretch flex h-[3.125rem] items-center justify-between pl-[1.25rem] pr-[0.4375rem] py-[0.4375rem] relative rounded-[6.25rem] shrink-0 w-full max-w-[25rem] border transition-colors {form?.error
                    ? 'border-red-500 focus-within:border-red-500'
                    : 'border-zinc-100 dark:border-zinc-800 focus-within:border-amber-500/30'}"
            >
                <input
                    type="text"
                    id="student_number"
                    name="student_number"
                    placeholder="학번을 입력하세요"
                    required
                    class="flex-1 font-pretendard font-normal leading-[normal] min-w-0 relative shrink text-zinc-800 dark:text-zinc-100 text-[1.125rem] bg-transparent outline-none h-full placeholder:text-zinc-400 dark:placeholder:text-zinc-500 mr-[0.625rem]"
                />
                <button
                    type="submit"
                    aria-label="Login"
                    class="bg-amber-500 content-stretch flex flex-col items-center justify-center relative rounded-[6.25rem] shrink-0 size-[2.25rem] hover:bg-amber-600 active:bg-amber-800 transition-colors cursor-pointer"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                        class="text-white"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M5 12h14m-5-5l5 5-5 5"
                        />
                    </svg>
                </button>

                {#if form?.error}
                    <p
                        class="absolute -bottom-[1.75rem] left-[1.25rem] text-rose-500 font-pretendard text-[0.875rem] font-medium whitespace-nowrap"
                    >
                        {form.error}
                    </p>
                {/if}
            </form>

            <p
                class="font-pretendard font-medium leading-[normal] relative shrink-0 text-[1.125rem] m-0 text-zinc-800 dark:text-zinc-100"
            >
                제23대 새내기학생회 <span class="text-amber-500">샛별</span>
            </p>
        </div>
    </div>
</div>
