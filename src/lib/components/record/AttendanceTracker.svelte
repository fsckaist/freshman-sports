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

    let { activeMatch } = $props();

    let scanModalOpen = $state(false);
    let scanningTarget = $state("");
    let studentNumberInput = $state("");
    let isSubmitting = $state(false);
    const isMatchFinished = $derived(activeMatch.status === "FINISHED");

    let activeTab = $state("teamA");

    const tabs = $derived([
        {
            id: "teamA",
            label: `${activeMatch.classA}반 선수`,
            current: activeMatch.attendance.teamA.length,
            total: activeMatch.attendance.teamATotal,
            color: "amber",
        },
        {
            id: "teamB",
            label: `${activeMatch.classB}반 선수`,
            current: activeMatch.attendance.teamB.length,
            total: activeMatch.attendance.teamBTotal,
            color: "amber",
        },
        {
            id: "cheering",
            label: "응원 인원",
            current:
                activeMatch.attendance.cheeringA.length +
                activeMatch.attendance.cheeringB.length,
            total: null,
            color: "zinc",
        },
    ]);

    const currentTab = $derived(tabs.find((t) => t.id === activeTab));

    function openScan(target: string) {
        scanningTarget = target;
        studentNumberInput = "";
        scanModalOpen = true;
    }

    function closeScan() {
        scanModalOpen = false;
        studentNumberInput = "";
    }
    import { toast } from "$lib/toast.svelte";
</script>

<div
    class="flex gap-4 w-full h-[10.5rem] bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden"
>
    <!-- Left: Vertical Tabs -->
    <div class="flex-1 bg-zinc-50 border-r border-zinc-100 flex flex-col pt-1">
        {#each tabs as tab}
            <button
                type="button"
                onclick={() => (activeTab = tab.id)}
                class="flex flex-col flex-1 justify-center items-start px-4 py-2.5 transition-all relative {activeTab ===
                tab.id
                    ? 'bg-white'
                    : 'hover:bg-zinc-100/50'}"
            >
                {#if activeTab === tab.id}
                    <div
                        class="absolute left-0 top-2 bottom-2 w-1 bg-amber-500 rounded-r-full"
                    ></div>
                {/if}
                <span
                    class="text-[0.9rem] font-medium {activeTab === tab.id
                        ? 'text-zinc-800'
                        : 'text-zinc-500'}"
                >
                    {tab.label}
                </span>
            </button>
        {/each}
    </div>

    <!-- Right: Content Area -->
    <div
        class="flex-2 flex flex-col p-3 justify-between items-center text-center"
    >
        <div class="flex flex-col items-center justify-center flex-1">
            <h3 class="text-[1rem] font-bold text-zinc-800">
                {currentTab?.label} 등록
            </h3>

            <div class="mt-2 text-zinc-600 text-[0.875rem] flex justify-center">
                {#if activeTab === "cheering"}
                    <div class="flex gap-4 items-center">
                        <div class="flex flex-col">
                            <span
                                class="text-[0.8rem] text-zinc-600 font-medium"
                                >{activeMatch.classA}반</span
                            >
                            <span class="text-[1.25rem] font-bold text-zinc-800"
                                >{activeMatch.attendance.cheeringA.length}</span
                            >
                        </div>
                        <div class="w-px h-8 bg-zinc-100 self-end mb-1"></div>
                        <div class="flex flex-col">
                            <span
                                class="text-[0.8rem] text-zinc-600 font-medium"
                                >{activeMatch.classB}반</span
                            >
                            <span class="text-[1.25rem] font-bold text-zinc-800"
                                >{activeMatch.attendance.cheeringB.length}</span
                            >
                        </div>
                    </div>
                {:else}
                    <div
                        class="flex items-baseline justify-center gap-1.5 mt-1"
                    >
                        <span class="text-[1.75rem] font-black text-zinc-800"
                            >{currentTab?.current}</span
                        >
                        <span class="text-[1rem] text-zinc-400 font-bold"
                            >/</span
                        >
                        <span class="text-[1.125rem] text-zinc-600 font-bold"
                            >{currentTab?.total}</span
                        >
                    </div>
                {/if}
            </div>
        </div>

        <button
            type="button"
            disabled={isMatchFinished}
            onclick={() =>
                openScan(
                    activeTab === "teamA"
                        ? "Team A"
                        : activeTab === "teamB"
                          ? "Team B"
                          : "Cheering",
                )}
            class="w-full h-10 rounded-xl font-bold text-[0.9375rem] transition-all flex items-center justify-center gap-2
            {activeTab === 'cheering'
                ? 'bg-zinc-800 text-white hover:bg-zinc-700 active:scale-[0.98]'
                : 'bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.98] shadow-sm shadow-amber-200'}
            disabled:opacity-40 disabled:grayscale disabled:scale-100"
        >
            {@html ScanIcon}
            {activeTab === "cheering" ? "응원 인원 스캔" : "선수 스캔"}
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
                            const message = result.data?.message;
                            toast.success(typeof message === 'string' ? message : "등록되었습니다.");
                        } else if (result.type === "failure") {
                            const message = result.data?.message;
                            toast.error(typeof message === 'string' ? message : "Failed to register");
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
                        onclick={closeScan}
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
