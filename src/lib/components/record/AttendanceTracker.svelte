<script lang="ts">
    import { enhance } from "$app/forms";
    import { page } from "$app/stores";

    import rawXmarkIcon from "@gravity-ui/icons/svgs/xmark.svg?raw";
    import rawBarcodeIcon from "@gravity-ui/icons/svgs/qr-code.svg?raw";

    const resizeSvgTo20 = (svg: string) =>
        svg.replace(
            'width="16" height="16"',
            'width="20" height="20" viewBox="0 0 16 16" class="text-current"',
        );

    const CloseIcon = resizeSvgTo20(rawXmarkIcon);
    const ScanIcon = resizeSvgTo20(rawBarcodeIcon);

    export let activeMatch;

    let scanModalOpen = false;
    let scanningTarget = "";
    let studentNumberInput = "";
    let isSubmitting = false;
    $: isMatchFinished = activeMatch.status === "FINISHED";


    $: teamATracker = {
        label: `${activeMatch.classA}반 선수`,
        current: activeMatch.attendance.teamA.length,
        total: activeMatch.attendance.teamATotal,
        color: "indigo",
    };

    $: teamBTracker = {
        label: `${activeMatch.classB}반 선수`,
        current: activeMatch.attendance.teamB.length,
        total: activeMatch.attendance.teamBTotal,
        color: "rose",
    };

    $: cheeringTracker = {
        label: "응원단 & 기타",
        current: activeMatch.attendance.cheering.length,
        total: null,
        color: "emerald",
    };

    function openScan(target: string) {
        scanningTarget = target;
        studentNumberInput = "";
        scanModalOpen = true;
    }

    function closeScan() {
        scanModalOpen = false;
        studentNumberInput = "";
    }

    function getCardStyle(color: string) {
        switch (color) {
            case "indigo":
                return "bg-indigo-50 border-indigo-200 text-indigo-800";
            case "rose":
                return "bg-rose-50 border-rose-200 text-rose-800";
            case "emerald":
                return "bg-emerald-50 border-emerald-200 text-emerald-800";
            default:
                return "bg-zinc-50 border-zinc-200 text-zinc-800";
        }
    }

    function getButtonClass(color: string) {
        switch (color) {
            case "indigo":
                return "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500";
            case "rose":
                return "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500";
            case "emerald":
                return "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500";
            default:
                return "bg-zinc-600 hover:bg-zinc-700 focus:ring-zinc-500";
        }
    }
</script>

<div
    class="flex gap-[0.9375rem] w-full h-[10.5625rem] items-start relative shrink-0"
>
    <!-- Team A Card -->
    <div
        class="bg-white flex flex-[1_0_0] flex-col h-full items-center justify-between overflow-clip p-[0.625rem] relative rounded-[1.25rem] shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)]"
    >
        <div
            class="flex flex-[1_0_0] flex-col gap-[0.625rem] items-center justify-center leading-[normal] relative text-center whitespace-nowrap"
        >
            <p
                class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-zinc-800 text-[1.375rem]"
            >
                {activeMatch.classA ? `${activeMatch.classA}반 ` : ""}선수 등록
            </p>
            <div
                class="flex font-['Pretendard_Variable'] font-normal gap-[2px] items-start justify-center relative shrink-0 text-[1.125rem]"
            >
                <p class="relative shrink-0 text-zinc-500">
                    {teamATracker.current}
                </p>
                <p class="relative shrink-0 text-zinc-400">/</p>
                <p class="relative shrink-0 text-zinc-400">
                    {teamATracker.total}
                </p>
            </div>
        </div>
        <button
            type="button"
            disabled={isMatchFinished}
            on:click={() => openScan("Team A")}
            class="bg-amber-500 flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-[0.5rem] relative rounded-[0.9375rem] shrink-0 w-full hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:bg-zinc-400"
        >
            <p
                class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-[1rem] text-white whitespace-nowrap"
            >
                선수 스캔
            </p>
        </button>
    </div>

    <!-- Team B Card -->
    <div
        class="bg-white flex flex-[1_0_0] flex-col h-full items-center justify-between overflow-clip p-[0.625rem] relative rounded-[1.25rem] shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)]"
    >
        <div
            class="flex flex-[1_0_0] flex-col gap-[0.625rem] items-center justify-center leading-[normal] relative text-center whitespace-nowrap"
        >
            <p
                class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-zinc-800 text-[1.375rem]"
            >
                {activeMatch.classB ? `${activeMatch.classB}반 ` : ""}선수 등록
            </p>
            <div
                class="flex font-['Pretendard_Variable'] font-normal gap-[2px] items-start justify-center relative shrink-0 text-[1.125rem]"
            >
                <p class="relative shrink-0 text-zinc-500">
                    {teamBTracker.current}
                </p>
                <p class="relative shrink-0 text-zinc-400">/</p>
                <p class="relative shrink-0 text-zinc-400">
                    {teamBTracker.total}
                </p>
            </div>
        </div>
        <button
            type="button"
            disabled={isMatchFinished}
            on:click={() => openScan("Team B")}
            class="bg-amber-500 flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-[0.5rem] relative rounded-[0.9375rem] shrink-0 w-full hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:bg-zinc-400"
        >
            <p
                class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-[1rem] text-white whitespace-nowrap"
            >
                선수 스캔
            </p>
        </button>
    </div>

    <!-- Cheering Card -->
    <div
        class="bg-white flex flex-[1_0_0] flex-col h-full items-center justify-between overflow-clip p-[0.625rem] relative rounded-[1.25rem] shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)]"
    >
        <div
            class="flex flex-[1_0_0] flex-col gap-[0.625rem] items-center justify-center leading-[normal] relative text-center whitespace-nowrap"
        >
            <p
                class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-zinc-800 text-[1.375rem]"
            >
                응원 인원 등록
            </p>
            <div
                class="flex font-['Pretendard_Variable'] font-normal gap-[2px] items-start justify-center relative shrink-0 text-[1.125rem]"
            >
                <p class="relative shrink-0 text-zinc-500">
                    {cheeringTracker.current}
                </p>
                <!-- Just displaying the number of cheers -->
            </div>
        </div>
        <button
            type="button"
            disabled={isMatchFinished}
            on:click={() => openScan("Cheering")}
            class="bg-zinc-500 flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-[0.5rem] relative rounded-[0.9375rem] shrink-0 w-full hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:bg-zinc-400"
        >
            <p
                class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-[1rem] text-white whitespace-nowrap"
            >
                응원 스캔
            </p>
        </button>
    </div>
</div>

<!-- Scan Modal -->
{#if scanModalOpen}
    <div
        class="fixed inset-0 bg-zinc-800/30 flex items-center justify-center z-50 p-4"
        style="backdrop-filter: blur(2px);"
    >
        <div
            class="bg-zinc-50 flex flex-col gap-[1.875rem] items-center justify-center overflow-clip p-[1.875rem] relative rounded-[1.25rem] shadow-[0_0_1.875rem_0_rgba(0,0,0,0.05)] shrink-0 w-[31.3125rem] max-w-full"
        >
            <div
                class="flex flex-col gap-2 items-center justify-center relative shrink-0 w-full text-center"
            >
                <p
                    class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-zinc-800 text-[1.5rem]"
                >
                    {scanningTarget === "Cheering" ? "응원 스캔" : "선수 스캔"}
                </p>
                <p
                    class="font-['Pretendard_Variable'] font-medium relative shrink-0 text-zinc-600 text-[1rem]"
                >
                    QR 코드를 스캔하거나 학번을 입력해주세요.
                </p>
            </div>

            <!-- QR Code Scanner Area -->
            <div
                class="w-full aspect-square bg-zinc-200/50 rounded-2xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center relative overflow-hidden shrink-0"
            >
                <div
                    id="qr-reader"
                    class="w-full h-full absolute inset-0 hidden"
                ></div>
                {@html ScanIcon}
                <p
                    class="mt-4 text-zinc-500 font-['Pretendard_Variable'] font-medium"
                >
                    카메라 화면이 여기에 표시됩니다.
                </p>
            </div>

            <!-- Manual Input Form -->
            <form
                method="POST"
                action="?/registerPlayer"
                use:enhance={() => {
                    isSubmitting = true;
                    return async ({ result, update }) => {
                        isSubmitting = false;
                        if (result.type === "success") {
                            studentNumberInput = ""; // clear for next scan
                        } else if (result.type === "failure") {
                            alert(result.data?.message || "Failed to register");
                        }
                        update({ reset: false }); // keep form modal open for rapid scans
                    };
                }}
                class="w-full flex inset-0 flex-col gap-5 items-center justify-center relative shrink-0 contents"
            >
                <input type="hidden" name="matchId" value={activeMatch.id} />
                <input type="hidden" name="scanType" value={scanningTarget} />
                <div class="w-full flex flex-col gap-2">
                    <label
                        for="studentNumber"
                        class="font-['Pretendard_Variable'] font-semibold text-zinc-700 text-[0.875rem]"
                    >
                        학번 수동 입력
                    </label>
                    <input
                        type="text"
                        id="studentNumber"
                        name="studentNumber"
                        bind:value={studentNumberInput}
                        required
                        placeholder="예: 20240001"
                        class="w-full h-[3.125rem] bg-white border border-zinc-200 rounded-[0.9375rem] px-4 font-['Pretendard_Variable'] text-[1rem] text-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    />
                </div>

                <div
                    class="flex gap-2.5 items-start justify-center relative shrink-0 w-full sm:flex-row flex-col pt-2"
                >
                    <button
                        type="button"
                        on:click={closeScan}
                        class="bg-zinc-500 hover:bg-zinc-600 active:bg-zinc-800 transition-colors flex-1 flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-2 relative rounded-[0.9375rem] w-full"
                    >
                        <p
                            class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                        >
                            돌아가기
                        </p>
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !studentNumberInput}
                        class="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-colors w-full flex-1 flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-2 relative rounded-[0.9375rem] disabled:opacity-50"
                    >
                        {#if isSubmitting}
                            <svg
                                class="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    class="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    stroke-width="4"
                                ></circle>
                                <path
                                    class="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        {:else}
                            <p
                                class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                            >
                                등록하기
                            </p>
                        {/if}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
