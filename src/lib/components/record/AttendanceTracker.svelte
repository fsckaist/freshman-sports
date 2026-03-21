<script lang="ts">
    import { enhance } from "$app/forms";
    import { page } from "$app/stores";
    import { Html5Qrcode } from "html5-qrcode";
    import { onDestroy } from "svelte";

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
    let html5Qrcode: Html5Qrcode | null = null;
    let scanError = $state("");
    let formElement: HTMLFormElement | null = $state(null);
    let scannedUser = $state<{
        name: string;
        studentNumber: string;
        id: string;
        class?: number | string;
    } | null>(null);
    let isScanPaused = $state(false);
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
        scanError = "";
        isScanPaused = false;
        scannedUser = null;
        scanModalOpen = true;

        // Start scanner slightly after modal opens to ensure DOM is ready
        setTimeout(startScanner, 100);
    }

    function closeScan() {
        stopScanner();
        scanModalOpen = false;
        studentNumberInput = "";
    }

    async function startScanner() {
        if (!html5Qrcode) {
            html5Qrcode = new Html5Qrcode("qr-reader");
        }
        try {
            await html5Qrcode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                async (decodedText) => {
                    if (isSubmitting || isScanPaused || scannedUser) return;

                    isScanPaused = true;
                    if (html5Qrcode && html5Qrcode.isScanning) {
                        html5Qrcode.pause();
                    }

                    try {
                        const res = await fetch(`/api/user/${decodedText}`);
                        if (res.ok) {
                            const data = await res.json();
                            scannedUser = {
                                name: data.name,
                                studentNumber: data.studentNumber,
                                id: data.id,
                                class: data.class ?? "N/A",
                            };
                            studentNumberInput = data.studentNumber;
                        } else {
                            toast.error(
                                res.status === 404
                                    ? "등록되지 않은 인원이거나 유효하지 않은 QR입니다."
                                    : "유저 정보를 불러올 수 없습니다.",
                            );
                            resumeScanning();
                        }
                    } catch (e) {
                        console.error("Fetch error:", e);
                        toast.error("네트워크 오류가 발생했습니다.");
                        resumeScanning();
                    }
                },
                (errorMessage) => {
                    // Ignore continuous scan read errors
                },
            );
        } catch (err) {
            console.error("Error starting QR scanner:", err);
            scanError = "카메라를 시작할 수 없습니다. 권한을 확인해주세요.";
        }
    }

    async function stopScanner() {
        if (html5Qrcode && html5Qrcode.isScanning) {
            try {
                // If paused, we must resume before stopping
                if (html5Qrcode.getState() === 3) {
                    html5Qrcode.resume();
                }
                await html5Qrcode.stop();
            } catch (err) {
                console.error("Error stopping scanner:", err);
            }
        }
    }

    function resumeScanning() {
        scannedUser = null;
        studentNumberInput = "";
        isScanPaused = false;
        if (html5Qrcode && html5Qrcode.getState() === 3) {
            html5Qrcode.resume();
        }
    }

    onDestroy(() => {
        stopScanner();
    });

    import { toast } from "$lib/toast.svelte";
</script>

<div
    class="flex w-full h-[10.5rem] bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden"
>
    <!-- Left: Vertical Tabs -->
    <div
        class="flex-4 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-800 flex flex-col"
    >
        {#each tabs as tab}
            <button
                type="button"
                onclick={() => (activeTab = tab.id)}
                class="flex flex-col flex-1 justify-center items-start px-4 py-2.5 transition-all relative {activeTab ===
                tab.id
                    ? 'bg-white dark:bg-zinc-900'
                    : 'hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50'}"
            >
                {#if activeTab === tab.id}
                    <div
                        class="absolute left-0 top-2 bottom-2 w-1 bg-amber-500 rounded-r-full"
                    ></div>
                {/if}
                <span
                    class="text-[0.9rem] font-medium {activeTab === tab.id
                        ? 'text-zinc-800 dark:text-zinc-100'
                        : 'text-zinc-500 dark:text-zinc-400'}"
                >
                    {tab.label}
                </span>
            </button>
        {/each}
    </div>

    <!-- Right: Content Area -->
    <div
        class="flex-6 flex flex-col p-3 justify-between items-center text-center"
    >
        <div class="flex flex-col items-center justify-center flex-1">
            <h3 class="text-[1rem] font-bold text-zinc-800 dark:text-zinc-100">
                {currentTab?.label} 등록
            </h3>

            <div class="mt-2 text-zinc-600 text-[0.875rem] flex justify-center">
                {#if activeTab === "cheering"}
                    <div class="flex gap-4 items-center">
                        <div class="flex flex-col">
                            <span
                                class="text-[0.8rem] text-zinc-600 dark:text-zinc-400 font-medium"
                                >{activeMatch.classA}반</span
                            >
                            <span
                                class="text-[1.25rem] font-bold text-zinc-800 dark:text-zinc-100"
                                >{activeMatch.attendance.cheeringA.length}</span
                            >
                        </div>
                        <div
                            class="w-px h-8 bg-zinc-100 dark:bg-zinc-800 self-end mb-1"
                        ></div>
                        <div class="flex flex-col">
                            <span
                                class="text-[0.8rem] text-zinc-600 dark:text-zinc-400 font-medium"
                                >{activeMatch.classB}반</span
                            >
                            <span
                                class="text-[1.25rem] font-bold text-zinc-800 dark:text-zinc-100"
                                >{activeMatch.attendance.cheeringB.length}</span
                            >
                        </div>
                    </div>
                {:else}
                    <div
                        class="flex items-baseline justify-center gap-1.5 mt-1"
                    >
                        <span
                            class="text-[1.75rem] font-black text-zinc-800 dark:text-zinc-100"
                            >{currentTab?.current}</span
                        >
                        <span class="text-[1rem] text-zinc-400 font-bold"
                            >/</span
                        >
                        <span
                            class="text-[1.125rem] text-zinc-600 dark:text-zinc-300 font-bold"
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
                ? 'bg-zinc-800 dark:bg-zinc-700 text-white hover:bg-zinc-700 dark:hover:bg-zinc-600 active:scale-[0.98]'
                : 'bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.98] shadow-sm shadow-amber-200 dark:shadow-none'}
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
            class="bg-zinc-50 dark:bg-zinc-900 flex flex-col gap-[1.875rem] items-center justify-center overflow-clip p-[1.875rem] relative rounded-[1.25rem] shadow-[0_0_1.875rem_0_rgba(0,0,0,0.05)] border dark:border-zinc-800 shrink-0 w-[31.3125rem] max-w-full"
        >
            <div
                class="flex flex-col gap-2 items-center justify-center relative shrink-0 w-full text-center"
            >
                <p
                    class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-zinc-800 dark:text-zinc-100 text-[1.5rem]"
                >
                    {scanningTarget === "Cheering" ? "응원 스캔" : "선수 스캔"}
                </p>
                <p
                    class="font-['Pretendard_Variable'] font-medium relative shrink-0 text-zinc-600 dark:text-zinc-400 text-[1rem]"
                >
                    QR 코드를 스캔하거나 학번을 입력해주세요.
                </p>
            </div>

            <!-- QR Code Scanner Area -->
            <div
                class="w-full aspect-square bg-black rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center relative overflow-hidden shrink-0"
            >
                <div
                    id="qr-reader"
                    class="w-full h-full absolute inset-0 z-0 flex items-center justify-center"
                ></div>

                {#if scannedUser}
                    <!-- 2-Step Confirmation Overlay Layer -->
                    <div
                        class="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white"
                    >
                        <div class="flex flex-col items-center mb-6">
                            <span
                                class="text-[2rem] font-bold font-pretendard mb-1"
                                >{scannedUser.name}</span
                            >
                            <span class="text-xl text-zinc-300 font-medium"
                                >{scannedUser.studentNumber} · {scannedUser.class}반</span
                            >
                        </div>
                        <p class="text-lg font-medium mb-4">
                            해당 인원을 등록할까요?
                        </p>
                        <div class="flex justify-center w-full px-4 mt-2">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onclick={resumeScanning}
                                class="size-14 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                                <div
                                    class="size-6 text-white flex items-center justify-center"
                                >
                                    {@html CloseIcon}
                                </div>
                            </button>
                        </div>
                    </div>
                {:else if scanError}
                    <div
                        class="z-10 bg-white/90 dark:bg-zinc-900/90 p-4 rounded-xl text-center flex flex-col items-center gap-2"
                    >
                        <div
                            class="text-zinc-500 w-8 h-8 flex items-center justify-center"
                        >
                            {@html ScanIcon}
                        </div>
                        <p class="text-red-500 font-medium text-sm">
                            {scanError}
                        </p>
                    </div>
                {:else if !scanModalOpen}
                    <!-- Placeholder when not scanning -->
                    <div
                        class="z-10 text-zinc-500 w-8 h-8 flex items-center justify-center"
                    >
                        {@html ScanIcon}
                    </div>
                {/if}
            </div>

            <!-- Manual Input Form -->
            <form
                bind:this={formElement}
                method="POST"
                action="?/registerPlayer"
                use:enhance={() => {
                    isSubmitting = true;
                    return async ({ result, update }) => {
                        isSubmitting = false;
                        if (result.type === "success") {
                            const message = result.data?.message;
                            toast.success(
                                typeof message === "string"
                                    ? message
                                    : "등록되었습니다.",
                            );
                            if (isScanPaused) resumeScanning();
                            studentNumberInput = ""; // clear for next scan
                        } else if (result.type === "failure") {
                            const message = result.data?.message;
                            toast.error(
                                typeof message === "string"
                                    ? message
                                    : "Failed to register",
                            );
                            if (isScanPaused) resumeScanning();
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
                        class="font-['Pretendard_Variable'] font-semibold text-zinc-700 dark:text-zinc-300 text-[0.875rem]"
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
                        class="w-full h-[3.125rem] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[0.9375rem] px-4 font-['Pretendard_Variable'] text-[1rem] text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
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

<style>
    /* Styling to make sure html5-qrcode video scales perfectly */
    :global(#qr-reader video) {
        object-fit: cover !important;
        width: 100% !important;
        height: 100% !important;
    }

    /* Hide the annoying license/info footer from html5-qrcode */
    :global(#qr-reader__dashboard_section_swaplink) {
        display: none !important;
    }
    :global(#qr-reader a) {
        display: none !important;
    }
</style>
