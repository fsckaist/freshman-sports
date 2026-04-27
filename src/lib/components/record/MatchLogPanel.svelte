<script lang="ts">
    import { untrack } from "svelte";
    import { enhance } from "$app/forms";
    import { i18n } from "$lib/i18n.svelte";
    import Plus from "@gravity-ui/icons/svgs/plus.svg?raw";
    import Minus from "@gravity-ui/icons/svgs/minus.svg?raw";

    let { activeMatch } = $props();

    let isSubmitting = $state(false);
    let showForfeitConfirm = $state(false);
    let showStartConfirm = $state(false);
    let showEndConfirm = $state(false);
    let showDetailsModal = $state(false);

    // --- Approval State ---
    let approvedA = $state(false);
    let approvedB = $state(false);

    // --- QR Scanner State ---
    import { Html5Qrcode } from "html5-qrcode";
    import { onDestroy } from "svelte";
    import rawXmarkIcon from "@gravity-ui/icons/svgs/xmark.svg?raw";
    import rawBarcodeIcon from "@gravity-ui/icons/svgs/qr-code.svg?raw";
    import { toast } from "$lib/toast.svelte";

    const resizeSvgTo20 = (svg: string) =>
        svg.replace(
            'width="16" height="16"',
            'width="20" height="20" viewBox="0 0 16 16" class="text-current"',
        );

    const CloseIcon = resizeSvgTo20(rawXmarkIcon);
    const ScanIcon = resizeSvgTo20(rawBarcodeIcon);

    let scanModalOpen = $state(false);
    let scanningTarget = $state<"A" | "B">("A");
    let studentNumberInput = $state("");
    let html5Qrcode: Html5Qrcode | null = null;
    let scanError = $state("");
    let scannedUser = $state<{
        name: string;
        studentNumber: string;
        id: string;
        class?: number | string;
    } | null>(null);
    let isScanPaused = $state(false);

    // --- Record Structure & State ---
    interface Stat {
        key: string;
        label: string;
    }
    interface Phase {
        key: string;
        label: string;
        stats: Stat[];
    }

    const recordStructure = $derived(
        (activeMatch.recordStructure as Phase[]) || [
            {
                key: "half1",
                label: i18n.t({ ko: "전반", en: "1st Half" }),
                stats: [
                    {
                        key: "score",
                        label: i18n.t({ ko: "득점", en: "Score" }),
                    },
                    { key: "foul", label: i18n.t({ ko: "파울", en: "Foul" }) },
                ],
            },
            {
                key: "half2",
                label: i18n.t({ ko: "후반", en: "2nd Half" }),
                stats: [
                    {
                        key: "score",
                        label: i18n.t({ ko: "득점", en: "Score" }),
                    },
                    { key: "foul", label: i18n.t({ ko: "파울", en: "Foul" }) },
                ],
            },
            {
                key: "penalty",
                label: i18n.t({ ko: "승부차기", en: "Penalty" }),
                stats: [
                    {
                        key: "score",
                        label: i18n.t({ ko: "득점", en: "Score" }),
                    },
                ],
            },
        ],
    );

    // Dynamic Score State: { [phaseKey]: { [statKey]: number } }
    let scoreDataA = $state<Record<string, Record<string, number>>>(
        createDefaultScores(),
    );
    let scoreDataB = $state<Record<string, Record<string, number>>>(
        createDefaultScores(),
    );

    let cardsA: Record<string, number> = $state({});
    let cardsB: Record<string, number> = $state({});

    interface DetailedNotes {
        teamA: {
            scores: Record<string, Record<string, number>>;
            cards: Record<string, number>;
            approved?: boolean;
        };
        teamB: {
            scores: Record<string, Record<string, number>>;
            cards: Record<string, number>;
            approved?: boolean;
        };
    }

    function createDefaultScores(): Record<string, Record<string, number>> {
        const scores: Record<string, Record<string, number>> = {};
        recordStructure.forEach((phase) => {
            scores[phase.key] = {};
            phase.stats.forEach((stat) => {
                scores[phase.key][stat.key] = 0;
            });
        });
        return scores;
    }

    const parsedNotes = $derived(
        (() => {
            try {
                if (!activeMatch.matchNotes) return null;
                const parsed = JSON.parse(activeMatch.matchNotes);
                if (typeof parsed !== "object" || parsed === null) return null;
                return parsed as DetailedNotes;
            } catch {
                return null;
            }
        })(),
    );

    // Initialize state when activeMatch ID changes (i.e. user selects a different match)
    let lastMatchId = $state<string | null>(null);

    $effect(() => {
        const currentId = activeMatch.id;
        const _structure = recordStructure;
        const _parsed = parsedNotes;

        untrack(() => {
            if (currentId === lastMatchId) return;
            lastMatchId = currentId;

            const initialA = createDefaultScores();
            const initialB = createDefaultScores();
            let initialCardsA: Record<string, number> = {};
            let initialCardsB: Record<string, number> = {};

            if (parsedNotes) {
                // Merge existing notes into state
                recordStructure.forEach((phase) => {
                    phase.stats.forEach((stat) => {
                        if (
                            parsedNotes.teamA?.scores?.[phase.key]?.[
                                stat.key
                            ] !== undefined
                        ) {
                            initialA[phase.key][stat.key] =
                                parsedNotes.teamA.scores[phase.key][stat.key];
                        }
                        if (
                            parsedNotes.teamB?.scores?.[phase.key]?.[
                                stat.key
                            ] !== undefined
                        ) {
                            initialB[phase.key][stat.key] =
                                parsedNotes.teamB.scores[phase.key][stat.key];
                        }
                    });
                });
                initialCardsA = { ...parsedNotes.teamA?.cards };
                initialCardsB = { ...parsedNotes.teamB?.cards };
            }

            // Initialize cards for current players if missing
            activeMatch.attendance.teamA.forEach((u: any) => {
                if (initialCardsA[u.name] === undefined)
                    initialCardsA[u.name] = 0;
            });
            activeMatch.attendance.teamB.forEach((u: any) => {
                if (initialCardsB[u.name] === undefined)
                    initialCardsB[u.name] = 0;
            });

            // Update state
            scoreDataA = initialA;
            scoreDataB = initialB;
            cardsA = initialCardsA;
            cardsB = initialCardsB;
            approvedA = !!parsedNotes?.teamA?.approved;
            approvedB = !!parsedNotes?.teamB?.approved;
        });
    });

    // Reactively add card entries for newly registered players WITHOUT resetting scores
    $effect(() => {
        const teamA = activeMatch.attendance.teamA;
        const teamB = activeMatch.attendance.teamB;

        untrack(() => {
            let cardsAChanged = false;
            const newCardsA = { ...cardsA };
            teamA.forEach((u: any) => {
                if (newCardsA[u.name] === undefined) {
                    newCardsA[u.name] = 0;
                    cardsAChanged = true;
                }
            });
            if (cardsAChanged) cardsA = newCardsA;

            let cardsBChanged = false;
            const newCardsB = { ...cardsB };
            teamB.forEach((u: any) => {
                if (newCardsB[u.name] === undefined) {
                    newCardsB[u.name] = 0;
                    cardsBChanged = true;
                }
            });
            if (cardsBChanged) cardsB = newCardsB;
        });
    });

    // Computed comma separated strings for the summary section
    const teamAPlayers = $derived(
        activeMatch.attendance.teamA.map((u: any) => u.name).join(", ") ||
            i18n.t({ ko: "없음", en: "None" }),
    );
    const teamBPlayers = $derived(
        activeMatch.attendance.teamB.map((u: any) => u.name).join(", ") ||
            i18n.t({ ko: "없음", en: "None" }),
    );

    const isSatisfied = $derived(
        (activeMatch.attendance.teamATotal === 0 ||
            activeMatch.attendance.teamA.length >=
                activeMatch.attendance.teamATotal) &&
            (activeMatch.attendance.teamBTotal === 0 ||
                activeMatch.attendance.teamB.length >=
                    activeMatch.attendance.teamBTotal),
    );

    // Calculate total scores to send to the server (sums all stats with key 'score')
    const totalScoreA = $derived(
        Object.values(scoreDataA).reduce(
            (acc, phase) => acc + (phase.score || 0),
            0,
        ),
    );
    const totalScoreB = $derived(
        Object.values(scoreDataB).reduce(
            (acc, phase) => acc + (phase.score || 0),
            0,
        ),
    );

    const matchNotesJson = $derived(
        JSON.stringify({
            teamA: { scores: scoreDataA, cards: cardsA, approved: approvedA },
            teamB: { scores: scoreDataB, cards: cardsB, approved: approvedB },
        }),
    );

    // Helper to render IncDec
    function updateScore(
        team: "A" | "B",
        phaseKey: string,
        statKey: string,
        delta: number,
    ) {
        if (team === "A") {
            const val = (scoreDataA[phaseKey]?.[statKey] || 0) + delta;
            if (val >= 0) {
                scoreDataA[phaseKey] = {
                    ...scoreDataA[phaseKey],
                    [statKey]: val,
                };
            }
        } else {
            const val = (scoreDataB[phaseKey]?.[statKey] || 0) + delta;
            if (val >= 0) {
                scoreDataB[phaseKey] = {
                    ...scoreDataB[phaseKey],
                    [statKey]: val,
                };
            }
        }
    }

    // Helper to toggle Card status: Default(0) -> Yellow(1) -> Red(2) -> Default(0)
    function toggleCard(team: "A" | "B", playerName: string) {
        if (team === "A") {
            const current = cardsA[playerName] || 0;
            cardsA = { ...cardsA, [playerName]: (current + 1) % 3 };
        } else {
            const current = cardsB[playerName] || 0;
            cardsB = { ...cardsB, [playerName]: (current + 1) % 3 };
        }
    }

    // --- QR Approval Functions ---
    function openScan(target: "A" | "B") {
        scanningTarget = target;
        studentNumberInput = "";
        scanError = "";
        isScanPaused = false;
        scannedUser = null;
        scanModalOpen = true;

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
                                    ? i18n.t({
                                          ko: "등록되지 않은 인원이거나 유효하지 않은 QR입니다.",
                                          en: "Unregistered user or invalid QR.",
                                      })
                                    : i18n.t({
                                          ko: "유저 정보를 불러올 수 없습니다.",
                                          en: "Failed to load user info.",
                                      }),
                            );
                            resumeScanning();
                        }
                    } catch (e) {
                        console.error("Fetch error:", e);
                        toast.error(
                            i18n.t({
                                ko: "네트워크 오류가 발생했습니다.",
                                en: "Network error occurred.",
                            }),
                        );
                        resumeScanning();
                    }
                },
                (errorMessage) => {},
            );
        } catch (err) {
            console.error("Error starting QR scanner:", err);
            scanError = i18n.t({
                ko: "카메라를 시작할 수 없습니다. 권한을 확인해주세요.",
                en: "Cannot start camera. Please check permissions.",
            });
        }
    }

    async function stopScanner() {
        if (html5Qrcode && html5Qrcode.isScanning) {
            try {
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

    async function handleManualApproval() {
        if (!studentNumberInput) return;

        isSubmitting = true;
        try {
            const res = await fetch(`/api/user/${studentNumberInput}`);
            if (res.ok) {
                const data = await res.json();
                const user = {
                    name: data.name,
                    studentNumber: data.studentNumber,
                    id: data.id,
                    class: data.class ?? "N/A",
                };
                
                // For manual input, approve immediately
                if (validateUser(user)) {
                    performApproval(user);
                    closeScan();
                }
            } else {
                toast.error(
                    i18n.t({
                        ko: "유저 정보를 찾을 수 없습니다.",
                        en: "User not found.",
                    }),
                );
            }
        } catch (e) {
            toast.error("Network error");
        } finally {
            isSubmitting = false;
        }
    }

    function validateUser(user: any) {
        // Verify class
        const targetClass =
            scanningTarget === "A" ? activeMatch.classA : activeMatch.classB;
        if (Number(user.class) !== Number(targetClass)) {
            toast.error(
                i18n.t({
                    ko: "해당 반의 학생이 아닙니다.",
                    en: "This student is not in the correct class.",
                }),
            );
            return false;
        }

        // Verify if the user is in the attendance list (online/planned)
        const teamAttendance =
            scanningTarget === "A"
                ? activeMatch.attendance.teamA
                : activeMatch.attendance.teamB;
        const plannedAttendance =
            scanningTarget === "A"
                ? activeMatch.attendance.plannedTeamA
                : activeMatch.attendance.plannedTeamB;

        const isAttendee =
            teamAttendance.some((u: any) => u.userId === user.id) ||
            plannedAttendance.some((u: any) => u.userId === user.id);

        if (!isAttendee) {
            toast.error(
                i18n.t({
                    ko: "이 경기에 등록된 선수가 아닙니다.",
                    en: "This student is not a registered player for this match.",
                }),
            );
            return false;
        }
        return true;
    }

    function performApproval(user: any) {
        if (scanningTarget === "A") {
            approvedA = true;
        } else {
            approvedB = true;
        }

        toast.success(
            i18n.t({
                ko: "승인되었습니다.",
                en: "Approved successfully.",
            }),
        );
    }

    function confirmApproval() {
        if (!scannedUser) return;

        if (validateUser(scannedUser)) {
            performApproval(scannedUser);
            closeScan();
        } else {
            resumeScanning();
        }
    }

    // --- Debounced Auto-Save ---
    let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
    let isSaving = $state(false);
    let lastSavedJson = $state("");

    function autoSave(notesJson: string, scoreA: number, scoreB: number) {
        if (notesJson === lastSavedJson) return;
        lastSavedJson = notesJson;
        isSaving = true;

        fetch(`/api/match/${activeMatch.id}/save-notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scoreA, scoreB, matchNotes: notesJson })
        })
            .then(res => {
                if (!res.ok) console.error('Auto-save failed:', res.status);
            })
            .catch(err => console.error('Auto-save error:', err))
            .finally(() => { isSaving = false; });
    }

    // Watch for score/card/approval changes and debounce save (2s)
    $effect(() => {
        // Track all mutable recording state
        const notesJson = matchNotesJson;
        const scoreA = totalScoreA;
        const scoreB = totalScoreB;

        untrack(() => {
            // Skip auto-save if match is not ongoing or is already verified
            if (activeMatch.status !== "ONGOING" || activeMatch.isVerified) return;
            // Skip the very first render (initial load from DB)
            if (!lastSavedJson && notesJson) {
                lastSavedJson = notesJson;
                return;
            }

            if (autoSaveTimer) clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => autoSave(notesJson, scoreA, scoreB), 2000);
        });
    });

    onDestroy(() => {
        stopScanner();
        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        // Flush any pending save immediately on destroy
        if (lastSavedJson !== matchNotesJson && activeMatch.status === "ONGOING" && !activeMatch.isVerified) {
            autoSave(matchNotesJson, totalScoreA, totalScoreB);
        }
    });
</script>

{#if showDetailsModal}
    <div
        class="fixed inset-0 bg-zinc-800/80 flex items-center justify-center z-[9999] p-4"
        style="backdrop-filter: blur(4px);"
    >
        <div
            class="bg-white dark:bg-zinc-900 flex flex-col gap-6 items-center justify-start overflow-clip p-6 relative rounded-[1.25rem] shadow-2xl shrink-0 w-[45rem] max-w-full max-h-[90vh] overflow-y-auto"
        >
            <div class="w-full flex justify-between items-center">
                <h2
                    class="text-[1.5rem] font-bold text-zinc-800 dark:text-zinc-100"
                >
                    {i18n.t({ ko: "경기 상세 정보", en: "Match Details" })}
                </h2>
                <button
                    onclick={() => (showDetailsModal = false)}
                    class="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    aria-label={i18n.t({ ko: "닫기", en: "Close" })}
                    title={i18n.t({ ko: "닫기", en: "Close" })}
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        ><line x1="18" y1="6" x2="6" y2="18"></line><line
                            x1="6"
                            y1="6"
                            x2="18"
                            y2="18"
                        ></line></svg
                    >
                </button>
            </div>

            <!-- Score Comparison Table -->
            <div class="w-full grid grid-cols-3 gap-4">
                <div class="col-span-1 flex flex-col items-center">
                    <span class="text-zinc-500 dark:text-zinc-400 text-sm mb-1"
                        >{i18n.t({
                            ko: "",
                            en: "Class ",
                        })}{activeMatch.classA}{i18n.t({
                            ko: "반",
                            en: "",
                        })}</span
                    >
                    <span
                        class="text-3xl font-black text-zinc-800 dark:text-zinc-100"
                        >{activeMatch.scoreA}</span
                    >
                </div>
                <div class="col-span-1 flex items-center justify-center">
                    <span
                        class="text-2xl font-bold text-zinc-300 dark:text-zinc-600"
                        >VS</span
                    >
                </div>
                <div class="col-span-1 flex flex-col items-center">
                    <span class="text-zinc-500 dark:text-zinc-400 text-sm mb-1"
                        >{i18n.t({
                            ko: "",
                            en: "Class ",
                        })}{activeMatch.classB}{i18n.t({
                            ko: "반",
                            en: "",
                        })}</span
                    >

                    <span
                        class="text-3xl font-black text-zinc-800 dark:text-zinc-100"
                        >{activeMatch.scoreB}</span
                    >
                </div>
            </div>

            <div class="w-full h-px bg-zinc-200"></div>

            <!-- Detail Tabs -->
            <div class="w-full grid grid-cols-2 gap-8">
                <!-- Team A Details -->
                <div class="flex flex-col gap-4">
                    <h3
                        class="text-lg font-bold text-zinc-700 dark:text-zinc-200"
                    >
                        {i18n.t({
                            ko: `${activeMatch.classA}반 상세`,
                            en: `Class ${activeMatch.classA} Details`,
                        })}
                    </h3>

                    <div
                        class="bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800 p-4"
                    >
                        <div class="flex flex-col gap-3">
                            {#if parsedNotes}
                                {#each recordStructure as phase}
                                    <div class="flex flex-col gap-1">
                                        <span
                                            class="text-zinc-500 font-medium text-xs"
                                            >{i18n.decode(phase.label)}</span
                                        >
                                        <div
                                            class="grid grid-cols-2 gap-y-1 text-sm bg-white/50 dark:bg-white/5 rounded-lg p-2 border border-zinc-100 dark:border-zinc-800"
                                        >
                                            {#each phase.stats as stat}
                                                <span
                                                    class="text-zinc-400 dark:text-zinc-500"
                                                    >{i18n.decode(
                                                        stat.label,
                                                    )}</span
                                                >
                                                <span
                                                    class="font-bold text-right text-zinc-800 dark:text-zinc-200"
                                                >
                                                    {parsedNotes.teamA.scores[
                                                        phase.key
                                                    ]?.[stat.key] ?? 0}
                                                </span>
                                            {/each}
                                        </div>
                                    </div>
                                {/each}
                            {:else}
                                <div class="text-zinc-400 text-sm italic">
                                    {i18n.t({
                                        ko: "기록된 상세 정보가 없습니다.",
                                        en: "No detailed records found.",
                                    })}
                                </div>
                            {/if}
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <span class="text-sm font-bold text-zinc-500"
                            >{i18n.t({
                                ko: "경고 및 퇴장",
                                en: "Cards & Sent-offs",
                            })}</span
                        >
                        <div class="flex flex-wrap gap-2">
                            {#if parsedNotes}
                                {#each Object.entries(parsedNotes.teamA.cards) as [name, type]}
                                    {#if type > 0}
                                        <div
                                            class="px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 {type ===
                                            1
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-red-100 text-red-700'}"
                                        >
                                            <div
                                                class="w-2 h-3 rounded-sm {type ===
                                                1
                                                    ? 'bg-amber-500'
                                                    : 'bg-red-500'}"
                                            ></div>
                                            {name}
                                        </div>
                                    {/if}
                                {/each}
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Team B Details -->
                <div class="flex flex-col gap-4">
                    <h3
                        class="text-lg font-bold text-zinc-700 dark:text-zinc-200"
                    >
                        {i18n.t({
                            ko: `${activeMatch.classB}반 상세`,
                            en: `Class ${activeMatch.classB} Details`,
                        })}
                    </h3>

                    <div
                        class="bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800 p-4"
                    >
                        <div class="flex flex-col gap-3">
                            {#if parsedNotes}
                                {#each recordStructure as phase}
                                    <div class="flex flex-col gap-1">
                                        <span
                                            class="text-zinc-500 font-medium text-xs"
                                            >{i18n.decode(phase.label)}</span
                                        >
                                        <div
                                            class="grid grid-cols-2 gap-y-1 text-sm bg-white/50 dark:bg-white/5 rounded-lg p-2 border border-zinc-100 dark:border-zinc-800"
                                        >
                                            {#each phase.stats as stat}
                                                <span
                                                    class="text-zinc-400 dark:text-zinc-500"
                                                    >{i18n.decode(
                                                        stat.label,
                                                    )}</span
                                                >
                                                <span
                                                    class="font-bold text-right text-zinc-800 dark:text-zinc-200"
                                                >
                                                    {parsedNotes.teamB.scores[
                                                        phase.key
                                                    ]?.[stat.key] ?? 0}
                                                </span>
                                            {/each}
                                        </div>
                                    </div>
                                {/each}
                            {:else}
                                <div class="text-zinc-400 text-sm italic">
                                    {i18n.t({
                                        ko: "기록된 상세 정보가 없습니다.",
                                        en: "No detailed records found.",
                                    })}
                                </div>
                            {/if}
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <span class="text-sm font-bold text-zinc-500"
                            >{i18n.t({
                                ko: "경고 및 퇴장",
                                en: "Cards & Sent-offs",
                            })}</span
                        >
                        <div class="flex flex-wrap gap-2">
                            {#if parsedNotes}
                                {#each Object.entries(parsedNotes.teamB.cards) as [name, type]}
                                    {#if type > 0}
                                        <div
                                            class="px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 {type ===
                                            1
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-red-100 text-red-700'}"
                                        >
                                            <div
                                                class="w-2 h-3 rounded-sm {type ===
                                                1
                                                    ? 'bg-amber-500'
                                                    : 'bg-red-500'}"
                                            ></div>
                                            {name}
                                        </div>
                                    {/if}
                                {/each}
                            {/if}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Additional Notes / Forfeit Info -->
            {#if activeMatch.matchNotes}
                {@const rawNotes = (() => {
                    try {
                        const parsed = JSON.parse(activeMatch.matchNotes);
                        if (parsed.note) return parsed.note;
                        if (!parsed.teamA && !parsed.teamB)
                            return activeMatch.matchNotes;
                        return null;
                    } catch {
                        return activeMatch.matchNotes;
                    }
                })()}

                {#if rawNotes}
                    <div class="w-full h-px bg-zinc-200 dark:bg-zinc-800"></div>
                    <div class="w-full flex flex-col gap-2">
                        <h3
                            class="text-lg font-bold text-zinc-700 dark:text-zinc-200"
                        >
                            {i18n.t({ ko: "기타 정보", en: "Additional Info" })}
                        </h3>
                        <div
                            class="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 text-zinc-600 dark:text-zinc-300 text-[1rem] leading-relaxed break-keep"
                        >
                            {rawNotes}
                        </div>
                    </div>
                {/if}
            {/if}

            <button
                onclick={() => {
                    console.log("Confirm clicked");
                    showDetailsModal = false;
                }}
                class="w-full mt-4 py-3 bg-zinc-800 dark:bg-zinc-700 text-white font-bold rounded-xl hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors"
            >
                {i18n.t({ ko: "확인", en: "Confirm" })}
            </button>
        </div>
    </div>
{/if}

<!-- We need a hidden form to submit the complex data -->
{#if activeMatch.status === "ONGOING"}
    <form
        id="finalizeForm"
        method="POST"
        action="?/finalizeMatch"
        use:enhance={() => {
            isSubmitting = true;
            return async ({ update }) => {
                isSubmitting = false;
                update();
            };
        }}
    >
        <input type="hidden" name="matchId" value={activeMatch.id} />
        <input type="hidden" name="scoreA" value={totalScoreA} />
        <input type="hidden" name="scoreB" value={totalScoreB} />
        <input type="hidden" name="matchNotes" value={matchNotesJson} />
    </form>
{/if}

<div
    class="bg-white dark:bg-zinc-900 flex flex-col gap-[0.625rem] items-start min-h-[25rem] overflow-clip p-[1.25rem] relative rounded-[1.25rem] shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] w-full h-full border border-zinc-100 dark:border-zinc-800"
>
    <!-- Auto-save indicator -->
    {#if activeMatch.status === "ONGOING" && !activeMatch.isVerified}
        <div class="absolute top-3 right-4 flex items-center gap-1.5 text-[0.7rem] font-medium z-10">
            {#if isSaving}
                <svg class="animate-spin h-3 w-3 text-amber-500" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-amber-500">{i18n.t({ ko: '저장 중…', en: 'Saving…' })}</span>
            {:else if lastSavedJson}
                <svg class="h-3 w-3 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-emerald-500">{i18n.t({ ko: '자동 저장됨', en: 'Auto-saved' })}</span>
            {/if}
        </div>
    {/if}
    <div
        class="content-stretch flex flex-col md:flex-row flex-[1_0_0] gap-[0.625rem] items-center min-h-px min-w-px relative w-full overflow-y-auto md:overflow-hidden"
    >
        <!-- Team A Column -->
        <div
            class="content-stretch flex flex-none md:flex-[1_0_0] flex-col gap-[0.625rem] w-full md:h-full items-center min-h-px min-w-px md:overflow-y-auto relative rounded-[1.25rem] px-2 shrink-0"
        >
            <p
                class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-zinc-800 dark:text-zinc-100 text-[1.5rem] whitespace-nowrap mt-2"
            >
                {activeMatch.classA
                    ? `${i18n.t({ ko: "", en: "Class " })}${activeMatch.classA}${i18n.t({ ko: "반", en: "" })}`
                    : "Unknown"}
            </p>
            <div
                class="h-px w-full bg-zinc-200 dark:bg-zinc-800 shrink-0 my-1"
            ></div>

            {#if activeMatch.status === "FINISHED"}
                <div
                    class="text-[3.375rem] font-black text-zinc-800 dark:text-zinc-100 my-4"
                >
                    {activeMatch.scoreA}
                </div>
            {:else if activeMatch.status === "ONGOING"}
                <!-- Detailed Scoring UI -> Team A -->
                <div class="w-full flex flex-col gap-4 py-2 flex items-start">
                    {#each recordStructure as phase}
                        <div class="w-full flex flex-col gap-1">
                            <p class="text-zinc-500 font-medium text-[1rem]">
                                {i18n.decode(phase.label)}
                            </p>
                            <div
                                class="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center overflow-hidden"
                            >
                                <div
                                    class="bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center gap-2 px-4 py-2 h-full shrink-0 border-r border-zinc-200 dark:border-zinc-800 min-w-[5rem]"
                                >
                                    {#each phase.stats as stat}
                                        <span
                                            class="text-sm text-zinc-600 dark:text-zinc-400"
                                            >{i18n.decode(stat.label)}</span
                                        >
                                    {/each}
                                </div>
                                <div
                                    class="flex-1 flex flex-col h-full bg-white dark:bg-zinc-900"
                                >
                                    {#each phase.stats as stat, idx}
                                        <div
                                            class="flex-1 flex items-center justify-between px-4 py-2 {idx <
                                            phase.stats.length - 1
                                                ? 'border-b border-zinc-100 dark:border-zinc-800'
                                                : ''}"
                                        >
                                            <button
                                                type="button"
                                                onclick={() =>
                                                    updateScore(
                                                        "A",
                                                        phase.key,
                                                        stat.key,
                                                        -1,
                                                    )}
                                                class="w-7 h-7 rounded border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                                >{@html Minus}</button
                                            >
                                            <span
                                                class="font-medium text-zinc-700 dark:text-zinc-200"
                                            >
                                                {scoreDataA[phase.key]?.[
                                                    stat.key
                                                ] ?? 0}
                                            </span>
                                            <button
                                                type="button"
                                                onclick={() =>
                                                    updateScore(
                                                        "A",
                                                        phase.key,
                                                        stat.key,
                                                        1,
                                                    )}
                                                class="w-7 h-7 rounded border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                                >{@html Plus}</button
                                            >
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    {/each}

                    <!-- Cards -->
                    <div class="w-full flex flex-col gap-1 mt-2">
                        <p class="text-zinc-500 font-medium text-[1rem]">
                            {i18n.t({
                                ko: "경고 및 퇴장",
                                en: "Cards & Sent-offs",
                            })}
                        </p>
                        <div
                            class="w-full border border-zinc-200 p-[0.9375rem] rounded-[1.25rem] gap-[0.3125rem] grid grid-cols-3"
                        >
                            {#each activeMatch.attendance.teamA as player}
                                <button
                                    type="button"
                                    onclick={() => toggleCard("A", player.name)}
                                    class="bg-white dark:bg-zinc-800 border border-[#e4e4e7] dark:border-zinc-700 border-solid content-stretch flex flex-col items-center justify-center px-[0.625rem] py-[0.3125rem] relative rounded-[0.5rem] transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700"
                                >
                                    <p
                                        class="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[0.875rem] whitespace-nowrap {cardsA[
                                            player.name
                                        ] === 2
                                            ? 'text-red-500'
                                            : cardsA[player.name] === 1
                                              ? 'text-amber-500'
                                              : 'text-zinc-600'}"
                                    >
                                        {player.name}
                                    </p>
                                </button>
                            {/each}
                            {#if activeMatch.attendance.teamA.length === 0}
                                <p
                                    class="text-xs text-zinc-400 col-span-3 text-center py-2"
                                >
                                    {i18n.t({
                                        ko: "등록된 선수가 없습니다.",
                                        en: "No players registered.",
                                    })}
                                </p>
                            {/if}
                        </div>
                    </div>
                </div>
            {/if}

            <p
                class="font-['Pretendard_Variable'] font-medium leading-[1.5rem] min-w-full relative shrink-0 text-zinc-800 dark:text-zinc-200 text-[1.125rem] text-center w-full pt-4"
            >
                {i18n.t({
                    ko: "출전 선수",
                    en: "Players",
                })}
            </p>
            <p
                class="font-['Pretendard_Variable'] font-medium leading-relaxed min-w-full relative shrink-0 text-zinc-500 text-[1rem] text-center w-full pb-4 whitespace-normal break-keep"
            >
                {teamAPlayers}
            </p>

            {#if activeMatch.status === "ONGOING"}
                <button
                    type="button"
                    onclick={() => openScan("A")}
                    disabled={approvedA}
                    class="w-full mt-2 py-3 {approvedA
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-500 text-white hover:bg-amber-600'} font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-80"
                >
                    {#if approvedA}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="3"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><polyline points="20 6 9 17 4 12"></polyline></svg
                        >
                        {i18n.t({ ko: "승인됨", en: "Approved" })}
                    {:else}
                        {@html ScanIcon}
                        {i18n.t({ ko: "승인받기", en: "Approve" })}
                    {/if}
                </button>
            {/if}
        </div>

        <!-- Vertical/Horizontal Divider -->
        <div
            class="flex h-px w-full md:h-full md:w-px bg-zinc-200 dark:bg-zinc-800 items-center justify-center relative self-center shrink-0 my-2 md:mx-2 md:my-0"
        ></div>

        <!-- Team B Column -->
        <div
            class="content-stretch flex flex-none md:flex-[1_0_0] flex-col gap-[0.625rem] w-full md:h-full items-center min-h-px min-w-px md:overflow-y-auto relative rounded-[1.25rem] px-2 shrink-0"
        >
            <p
                class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-zinc-800 dark:text-zinc-100 text-[1.5rem] whitespace-nowrap mt-2"
            >
                {activeMatch.classB
                    ? `${i18n.t({ ko: "", en: "Class " })}${activeMatch.classB}${i18n.t({ ko: "반", en: "" })}`
                    : "Unknown"}
            </p>
            <div
                class="h-px w-full bg-zinc-200 dark:bg-zinc-800 shrink-0 my-1"
            ></div>

            {#if activeMatch.status === "FINISHED"}
                <div
                    class="text-[3.375rem] font-black text-zinc-800 dark:text-zinc-100 my-4"
                >
                    {activeMatch.scoreB}
                </div>
            {:else if activeMatch.status === "ONGOING"}
                <div class="w-full flex-col gap-4 py-2 flex items-start">
                    {#each recordStructure as phase}
                        <div class="w-full flex flex-col gap-1">
                            <p class="text-zinc-500 font-medium text-[1rem]">
                                {i18n.decode(phase.label)}
                            </p>
                            <div
                                class="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center overflow-hidden"
                            >
                                <div
                                    class="bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center gap-2 px-4 py-2 h-full shrink-0 border-r border-zinc-200 dark:border-zinc-800 min-w-[5rem]"
                                >
                                    {#each phase.stats as stat}
                                        <span
                                            class="text-sm text-zinc-600 dark:text-zinc-400"
                                            >{i18n.decode(stat.label)}</span
                                        >
                                    {/each}
                                </div>
                                <div
                                    class="flex-1 flex flex-col h-full bg-white dark:bg-zinc-900"
                                >
                                    {#each phase.stats as stat, idx}
                                        <div
                                            class="flex-1 flex items-center justify-between px-4 py-2 {idx <
                                            phase.stats.length - 1
                                                ? 'border-b border-zinc-100 dark:border-zinc-800'
                                                : ''}"
                                        >
                                            <button
                                                type="button"
                                                onclick={() =>
                                                    updateScore(
                                                        "B",
                                                        phase.key,
                                                        stat.key,
                                                        -1,
                                                    )}
                                                class="w-7 h-7 rounded border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                                >{@html Minus}</button
                                            >
                                            <span
                                                class="font-medium text-zinc-700 dark:text-zinc-200"
                                            >
                                                {scoreDataB[phase.key]?.[
                                                    stat.key
                                                ] ?? 0}
                                            </span>
                                            <button
                                                type="button"
                                                onclick={() =>
                                                    updateScore(
                                                        "B",
                                                        phase.key,
                                                        stat.key,
                                                        1,
                                                    )}
                                                class="w-7 h-7 rounded border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                                >{@html Plus}</button
                                            >
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    {/each}

                    <!-- Cards -->

                    <!-- Cards -->
                    <div class="w-full flex flex-col gap-1 mt-2">
                        <p class="text-zinc-500 font-medium text-[1rem]">
                            {i18n.t({
                                ko: "경고 및 퇴장",
                                en: "Cards & Sent-offs",
                            })}
                        </p>
                        <div
                            class="w-full border border-zinc-200 p-[0.9375rem] rounded-[1.25rem] gap-[0.3125rem] grid grid-cols-3"
                        >
                            {#each activeMatch.attendance.teamB as player}
                                <button
                                    type="button"
                                    onclick={() => toggleCard("B", player.name)}
                                    class="bg-white dark:bg-zinc-800 border border-[#e4e4e7] dark:border-zinc-700 border-solid content-stretch flex flex-col items-center justify-center px-[0.625rem] py-[0.3125rem] relative rounded-[0.5rem] transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700"
                                >
                                    <p
                                        class="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[0.875rem] whitespace-nowrap {cardsB[
                                            player.name
                                        ] === 2
                                            ? 'text-red-500'
                                            : cardsB[player.name] === 1
                                              ? 'text-amber-500'
                                              : 'text-zinc-600'}"
                                    >
                                        {player.name}
                                    </p>
                                </button>
                            {/each}
                            {#if activeMatch.attendance.teamB.length === 0}
                                <p
                                    class="text-xs text-zinc-400 col-span-3 text-center py-2"
                                >
                                    {i18n.t({
                                        ko: "등록된 선수가 없습니다.",
                                        en: "No players registered.",
                                    })}
                                </p>
                            {/if}
                        </div>
                    </div>
                </div>
            {/if}

            <p
                class="font-['Pretendard_Variable'] font-medium leading-[1.5rem] min-w-full relative shrink-0 text-zinc-800 dark:text-zinc-200 text-[1.125rem] text-center w-full pt-4"
            >
                {i18n.t({
                    ko: "출전 선수",
                    en: "Players",
                })}
            </p>
            <p
                class="font-['Pretendard_Variable'] font-medium leading-relaxed min-w-full relative shrink-0 text-zinc-500 text-[1rem] text-center w-full pb-4 whitespace-normal break-keep"
            >
                {teamBPlayers}
            </p>

            {#if activeMatch.status === "ONGOING"}
                <button
                    type="button"
                    onclick={() => openScan("B")}
                    disabled={approvedB}
                    class="w-full mt-2 py-3 {approvedB
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-500 text-white hover:bg-amber-600'} font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-80"
                >
                    {#if approvedB}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="3"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><polyline points="20 6 9 17 4 12"></polyline></svg
                        >
                        {i18n.t({ ko: "승인됨", en: "Approved" })}
                    {:else}
                        {@html ScanIcon}
                        {i18n.t({ ko: "승인받기", en: "Approve" })}
                    {/if}
                </button>
            {/if}
        </div>
    </div>

    <!-- Action Button -->
    <div class="w-full mt-4 shrink-0">
        {#if activeMatch.status === "PENDING_SCHEDULE" || activeMatch.status === "SCHEDULED"}
            {#if isSatisfied}
                <button
                    onclick={() => (showStartConfirm = true)}
                    class="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-colors content-stretch flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-[0.5rem] relative rounded-[0.9375rem] shrink-0 w-full"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                    >
                        {i18n.t({ ko: "경기 시작하기", en: "Start Match" })}
                    </p>
                </button>
            {:else}
                <button
                    onclick={() => (showForfeitConfirm = true)}
                    class="bg-zinc-500 hover:bg-zinc-600 active:bg-zinc-800 transition-colors content-stretch flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-[0.5rem] relative rounded-[0.9375rem] shrink-0 w-full"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                    >
                        {i18n.t({
                            ko: "기권패 / 몰수패",
                            en: "Forfeit / Walkover",
                        })}
                    </p>
                </button>
            {/if}
        {:else if activeMatch.status === "ONGOING"}
            <!-- Form submit button mapped from the hidden input form setup -->
            <button
                disabled={isSubmitting || !approvedA || !approvedB}
                onclick={() => (showEndConfirm = true)}
                class="bg-zinc-500 hover:bg-zinc-600 active:bg-zinc-800 transition-colors content-stretch flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-[0.5rem] relative rounded-[0.9375rem] shrink-0 w-full disabled:opacity-50"
            >
                <p
                    class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                >
                    {i18n.t({ ko: "경기 종료하기", en: "End Match" })}
                </p>
            </button>
        {:else if activeMatch.status === "FINISHED"}
            <div class="flex gap-2 w-full">
                <button
                    type="button"
                    onclick={() => {
                        showDetailsModal = true;
                    }}
                    class="bg-zinc-800 dark:bg-zinc-700 flex-1 hover:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-bold content-stretch flex flex-col h-[3.125rem] items-center justify-center px-[1.5rem] py-[0.5rem] relative rounded-[0.9375rem] shrink-0"
                >
                    {i18n.t({ ko: "상세 정보", en: "Details" })}
                </button>
            </div>
        {/if}
    </div>
</div>

{#if showForfeitConfirm}
    <div
        class="fixed inset-0 bg-zinc-800/30 flex items-center justify-center z-50 p-4"
        style="backdrop-filter: blur(2px);"
    >
        <div
            class="bg-zinc-50 dark:bg-zinc-900 flex flex-col gap-2.5 items-center justify-center overflow-clip p-5 relative rounded-[1.25rem] shadow-[0_0_1.875rem_0_rgba(0,0,0,0.05)] shrink-0 max-w-full"
        >
            <div
                class="flex flex-col gap-5 items-center justify-center p-[3.125rem] relative shrink-0 w-full text-center"
            >
                <p
                    class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-zinc-800 dark:text-zinc-100 text-[1.5rem] break-keep"
                >
                    {i18n.t({
                        ko: "정말로 기권패 / 몰수패 처리가 맞나요?",
                        en: "Are you sure you want to process a forfeit/walkover?",
                    })}
                </p>
                <p
                    class="font-['Pretendard_Variable'] font-medium relative shrink-0 text-zinc-600 dark:text-zinc-400 text-[1.125rem]"
                >
                    {i18n.t({
                        ko: "시스템 상 결과를 번복할 수 없습니다.",
                        en: "Results cannot be undone in the system.",
                    })}
                </p>
            </div>
            <div
                class="flex gap-2.5 items-start justify-center relative shrink-0 w-full sm:flex-row flex-col"
            >
                <button
                    onclick={() => (showForfeitConfirm = false)}
                    class="bg-zinc-500 dark:bg-zinc-600 hover:bg-zinc-600 dark:hover:bg-zinc-500 active:bg-zinc-800 transition-colors flex-1 flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-2 relative rounded-[0.9375rem] w-full"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                    >
                        {i18n.t({ ko: "돌아가기", en: "Go Back" })}
                    </p>
                </button>
                <form
                    method="POST"
                    action="?/forfeitMatch"
                    use:enhance={() => {
                        isSubmitting = true;
                        return async ({ update }) => {
                            isSubmitting = false;
                            showForfeitConfirm = false;
                            update();
                        };
                    }}
                    class="flex-1 w-full"
                >
                    <input
                        type="hidden"
                        name="matchId"
                        value={activeMatch.id}
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        class="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-colors w-full flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-2 relative rounded-[0.9375rem] disabled:opacity-50"
                    >
                        <p
                            class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                        >
                            {i18n.t({
                                ko: "기권패 / 몰수패 처리하기",
                                en: "Process Forfeit/Walkover",
                            })}
                        </p>
                    </button>
                </form>
            </div>
        </div>
    </div>
{/if}

{#if showStartConfirm}
    <div
        class="fixed inset-0 bg-zinc-800/30 flex items-center justify-center z-50 p-4"
        style="backdrop-filter: blur(2px);"
    >
        <div
            class="bg-zinc-50 dark:bg-zinc-900 flex flex-col gap-2.5 items-center justify-center overflow-clip p-5 relative rounded-[1.25rem] shadow-[0_0_1.875rem_0_rgba(0,0,0,0.05)] shrink-0 max-w-full"
        >
            <div
                class="flex flex-col gap-5 items-center justify-center p-[3.125rem] relative shrink-0 w-full text-center"
            >
                <p
                    class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-zinc-800 dark:text-zinc-100 text-[1.5rem] break-keep"
                >
                    {i18n.t({
                        ko: "정말로 경기를 시작할까요?",
                        en: "Are you sure you want to start the match?",
                    })}
                </p>
                <p
                    class="font-['Pretendard_Variable'] font-medium relative shrink-0 text-zinc-600 dark:text-zinc-400 text-[1.125rem]"
                >
                    {i18n.t({
                        ko: "시스템 상 결과를 번복할 수 없습니다.",
                        en: "Results cannot be undone in the system.",
                    })}
                </p>
            </div>
            <div
                class="flex gap-2.5 items-center justify-center relative shrink-0 w-full sm:flex-row flex-col"
            >
                <button
                    onclick={() => (showStartConfirm = false)}
                    class="bg-zinc-500 dark:bg-zinc-600 hover:bg-zinc-600 dark:hover:bg-zinc-500 active:bg-zinc-800 transition-colors flex-1 flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-2 relative rounded-[0.9375rem] w-full"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                    >
                        {i18n.t({ ko: "돌아가기", en: "Go Back" })}
                    </p>
                </button>

                <form
                    method="POST"
                    action="?/startMatch"
                    use:enhance={() => {
                        isSubmitting = true;
                        return async ({ update }) => {
                            isSubmitting = false;
                            showStartConfirm = false;
                            update();
                        };
                    }}
                    class="contents"
                >
                    <input
                        type="hidden"
                        name="matchId"
                        value={activeMatch.id}
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        class="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-colors flex-1 flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-2 relative rounded-[0.9375rem] w-full disabled:opacity-50"
                    >
                        <p
                            class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                        >
                            {i18n.t({ ko: "경기 시작하기", en: "Start Match" })}
                        </p>
                    </button>
                </form>
            </div>
        </div>
    </div>
{/if}

{#if showEndConfirm}
    <div
        class="fixed inset-0 bg-zinc-800/30 flex items-center justify-center z-50 p-4"
        style="backdrop-filter: blur(2px);"
    >
        <div
            class="bg-zinc-50 dark:bg-zinc-900 flex flex-col gap-2.5 items-center justify-center overflow-clip p-5 relative rounded-[1.25rem] shadow-[0_0_1.875rem_0_rgba(0,0,0,0.05)] shrink-0 w-[35.5625rem] max-w-full"
        >
            <div
                class="flex flex-col items-center justify-center p-[3.125rem] pb-[3.125rem] relative shrink-0 w-full text-center"
            >
                <p
                    class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-zinc-800 dark:text-zinc-100 text-[1.5rem] break-keep"
                >
                    {i18n.t({
                        ko: "정말로 경기가 끝났나요?",
                        en: "Is the match really over?",
                    })}
                </p>
                <div
                    class="flex flex-col mt-5 gap-1.5 items-center justify-center"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-medium relative shrink-0 text-zinc-600 dark:text-zinc-400 text-[1.125rem] break-keep"
                    >
                        {i18n.t({
                            ko: "시스템 상 결과를 번복할 수 없습니다.",
                            en: "Results cannot be undone in the system.",
                        })}
                    </p>
                    <p
                        class="font-['Pretendard_Variable'] font-medium relative shrink-0 text-red-600 dark:text-red-400 text-[1.125rem] break-keep leading-tight"
                    >
                        {i18n.t({
                            ko: "반드시 모든 선수의 결과 확인을 받은 후 경기를 종료해주세요.",
                            en: "Please ensure all players have confirmed the result before ending the match.",
                        })}
                    </p>
                </div>
            </div>
            <div
                class="flex gap-2.5 items-center justify-center relative shrink-0 w-full sm:flex-row flex-col"
            >
                <button
                    onclick={() => (showEndConfirm = false)}
                    class="bg-zinc-500 dark:bg-zinc-600 hover:bg-zinc-600 dark:hover:bg-zinc-500 active:bg-zinc-800 transition-colors flex-1 flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-2 relative rounded-[0.9375rem] w-full"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                    >
                        {i18n.t({ ko: "돌아가기", en: "Go Back" })}
                    </p>
                </button>
                <button
                    disabled={isSubmitting}
                    onclick={() => {
                        showEndConfirm = false;
                        const form = document.querySelector(
                            "#finalizeForm",
                        ) as HTMLFormElement | null;
                        if (form) form.requestSubmit();
                    }}
                    class="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-colors w-full flex-1 flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-2 relative rounded-[0.9375rem] disabled:opacity-50"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                    >
                        {i18n.t({ ko: "경기 종료하기", en: "End Match" })}
                    </p>
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- approval Scan Modal -->
{#if scanModalOpen}
    <div
        class="fixed inset-0 bg-zinc-800/30 flex items-center justify-center z-[10000] p-4"
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
                    {i18n.t({ ko: "경기 결과 승인", en: "Approve Results" })}
                    ({scanningTarget === "A"
                        ? activeMatch.classA
                        : activeMatch.classB}{i18n.t({
                        ko: "반",
                        en: "",
                    })})
                </p>
                <p
                    class="font-['Pretendard_Variable'] font-medium relative shrink-0 text-zinc-600 dark:text-zinc-400 text-[1rem]"
                >
                    {i18n.t({
                        ko: "선수의 QR 코드를 스캔하거나 학번을 입력해주세요.",
                        en: "Scan player's QR code or enter Student ID.",
                    })}
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
                                >{scannedUser.studentNumber} · {i18n.t({
                                    ko: "",
                                    en: "Class ",
                                })}{scannedUser.class}{i18n.t({
                                    ko: "반",
                                    en: "",
                                })}</span
                            >
                        </div>
                        <p class="text-lg font-medium mb-4">
                            {i18n.t({
                                ko: "위 선수로 승인할까요?",
                                en: "Approve with this student?",
                            })}
                        </p>
                        <div class="flex justify-center gap-4 w-full px-4 mt-2">
                            <button
                                type="button"
                                onclick={resumeScanning}
                                class="flex-1 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl transition-colors flex items-center justify-center"
                            >
                                {i18n.t({ ko: "취소", en: "Cancel" })}
                            </button>
                            <button
                                type="button"
                                onclick={confirmApproval}
                                class="flex-1 h-12 bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors flex items-center justify-center font-bold"
                            >
                                {i18n.t({ ko: "승인", en: "Approve" })}
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
            <div
                class="w-full flex inset-0 flex-col gap-5 items-center justify-center relative shrink-0"
            >
                <div class="w-full flex flex-col gap-2">
                    <label
                        for="studentNumber_approval"
                        class="font-['Pretendard_Variable'] font-semibold text-zinc-700 dark:text-zinc-300 text-[0.875rem]"
                    >
                        {i18n.t({
                            ko: "학번 수동 입력",
                            en: "Manual Student ID Input",
                        })}
                    </label>
                    <input
                        type="text"
                        id="studentNumber_approval"
                        bind:value={studentNumberInput}
                        placeholder={i18n.t({
                            ko: "예: 20240001",
                            en: "e.g. 20240001",
                        })}
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
                            {i18n.t({ ko: "돌아가기", en: "Go Back" })}
                        </p>
                    </button>
                    <button
                        type="button"
                        disabled={isSubmitting || !studentNumberInput}
                        onclick={handleManualApproval}
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
                                {i18n.t({ ko: "승인하기", en: "Approve" })}
                            </p>
                        {/if}
                    </button>
                </div>
            </div>
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
