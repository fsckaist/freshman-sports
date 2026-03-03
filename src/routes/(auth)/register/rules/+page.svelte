<script lang="ts">
    import { enhance } from "$app/forms";
    let { form } = $props();
</script>

<div
    class="relative size-full min-h-screen bg-white overflow-hidden flex justify-center"
>
    <!-- Centered 90rem wrapper so the absolute watermark is properly anchored -->
    <div
        class="relative flex flex-col gap-[0.625rem] min-h-[56.25rem] min-h-screen items-start w-full max-w-[90rem] px-[12.5rem] py-[6.25rem]"
    >
        <!-- Glowing Right Side Watermark -->
        <div
            class="absolute -translate-y-1/2 blur-[0.625rem] opacity-20 right-[-12.8125rem] size-[65.3125rem] top-[calc(50%+7.65625rem)] pointer-events-none select-none mix-blend-multiply z-0"
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
                class="content-stretch flex flex-col gap-[0.3125rem] items-start leading-[normal] relative shrink-0 text-zinc-900"
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

        <!-- Bottom Rule Agreement Area -->
        <div
            class="content-stretch flex flex-[1_0_0] flex-col items-start justify-between min-h-px min-w-px p-[0.625rem] relative w-full overflow-visible"
        >
            <div
                class="content-stretch flex flex-col font-pretendard font-normal gap-[0.625rem] items-start leading-[normal] overflow-clip relative shrink-0 text-[1.25rem]"
            >
                <p class="relative shrink-0 text-zinc-900 m-0">
                    공정하고 원활한 체육 대회 진행을 위하여 아래 규정을 꼭
                    확인해주세요.
                </p>
                <a
                    href="/info/rules"
                    target="_blank"
                    class="decoration-solid relative shrink-0 text-amber-500 underline hover:text-amber-600 transition-colors cursor-pointer m-0"
                >
                    체육 대회 규정 전문 확인하기
                </a>
            </div>

            <form
                method="POST"
                action="?/agree"
                use:enhance
                class="content-stretch flex flex-col gap-[1rem] items-start relative shrink-0"
            >
                <p
                    class="font-pretendard font-normal leading-[normal] relative shrink-0 text-zinc-900 text-[1.25rem] m-0"
                >
                    체육 대회 진행 규정에 대해 동의하시나요?
                </p>
                <button
                    type="submit"
                    aria-label="Agree to rules"
                    class="bg-amber-500 content-stretch flex flex-col items-center justify-center px-[2.1875rem] py-[0.5rem] relative rounded-[6.25rem] shrink-0 hover:bg-amber-600 active:bg-amber-800 transition-colors cursor-pointer"
                >
                    <span
                        class="font-pretendard font-semibold leading-[normal] relative shrink-0 text-[1.25rem] text-white"
                        >동의</span
                    >
                </button>
            </form>

            <p
                class="font-pretendard font-medium leading-[normal] relative shrink-0 text-[1.125rem] m-0 text-zinc-900"
            >
                제23대 새내기학생회 <span class="text-amber-500">샛별</span>
            </p>
        </div>
    </div>
</div>
