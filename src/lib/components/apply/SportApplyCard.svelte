<script lang="ts">
    import triangleExclamationSvg from "@gravity-ui/icons/svgs/triangle-exclamation.svg?raw";
    import { enhance } from "$app/forms";
    import { i18n } from "$lib/i18n.svelte";

    interface RosterMember {
        name: string;
        isCurrentUser?: boolean;
    }

    let {
        id = "",
        title = i18n.t({ ko: "종목명", en: "Sport Name" }),
        currentSpots = 0,
        maxSpots = 10,
        descriptionLines = [],
        rosters = [] as RosterMember[],
        buttonState = "apply",
        alertMessage = "",
        requiredGender = "MIXED",
        onButtonClick = () => {},
    } = $props<{
        id: string;
        title: string;
        currentSpots: number;
        maxSpots: number;
        descriptionLines: string[];
        rosters: RosterMember[];
        buttonState: "apply" | "cancel" | "closed" | "disabled";
        alertMessage?: string;
        requiredGender?: "MALE_ONLY" | "FEMALE_ONLY" | "MIXED";
        onButtonClick?: () => void;
    }>();

    let borderClass = $derived(
        alertMessage
            ? "border-2 border-solid border-red-600"
            : "border-2 border-transparent",
    );

    function resizeSvg(svgString: string) {
        return svgString
            .replace(/width="16"/g, 'width="12"')
            .replace(/height="16"/g, 'height="12"');
    }
</script>

<div
    class="bg-white dark:bg-zinc-900 flex lg:flex-[1_0_0] flex-col gap-[0.9375rem] lg:h-full items-center justify-start lg:overflow-clip p-[1.875rem] relative rounded-[1.25rem] shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] dark:shadow-none {borderClass} transition-all duration-200 w-full"
>
    <div
        class="flex flex-col gap-[0.625rem] items-start justify-center leading-tight relative shrink-0 w-full"
    >
        <div class="flex items-start justify-between relative shrink-0 w-full">
            <div class="flex flex-col gap-1">
                <h2
                    class="font-pretendard font-bold relative shrink-0 text-zinc-800 dark:text-zinc-100 text-[1.6rem] m-0"
                >
                    {i18n.decode(title)}
                </h2>
            </div>
            <p
                class="font-pretendard font-medium relative shrink-0 text-zinc-600 dark:text-zinc-400 text-[1.125rem] m-0"
            >
                {currentSpots}/{maxSpots}
            </p>
        </div>
        <div
            class="flex flex-col font-pretendard font-normal gap-[0.3125rem] items-start relative shrink-0 text-zinc-600 dark:text-zinc-400 text-[0.875rem] w-full"
        >
            {#each descriptionLines as line}
                <p class="relative shrink-0 m-0">{i18n.decode(line)}</p>
            {/each}
        </div>
    </div>

    <div
        class="w-full border-t-2 border-zinc-300 dark:border-zinc-700 shrink-0 relative my-[0.3125rem]"
    ></div>

    <div
        class="flex lg:flex-[1_0_0] flex-col gap-[0.625rem] items-center justify-start relative w-full lg:overflow-y-auto lg:hide-scrollbar lg:min-h-0"
    >
        {#if rosters.length > 0}
            <div class="flex flex-col gap-[0.625rem] w-full pb-[0.625rem]">
                {#each rosters as player}
                    <div
                        class="bg-white dark:bg-zinc-800 border-1 border-solid content-stretch flex flex-col items-center justify-center overflow-clip px-[1.875rem] py-[0.625rem] relative rounded-[0.5rem] shrink-0 w-full transition-colors duration-200
                        {player.isCurrentUser
                            ? 'border-orange-500'
                            : 'border-zinc-300 dark:border-zinc-700'}"
                    >
                        <p
                            class="font-pretendard font-normal leading-tight relative shrink-0 text-zinc-800 dark:text-zinc-200 text-[0.875rem] m-0"
                        >
                            {player.name}
                        </p>
                    </div>
                {/each}
            </div>
        {:else}
            <div
                class="flex flex-[1_0_0] flex-col items-center justify-center min-h-px min-w-px relative w-full"
            >
                <p
                    class="font-pretendard font-normal leading-tight relative shrink-0 text-zinc-400 dark:text-zinc-500 text-[0.875rem] m-0"
                >
                    {i18n.t({
                        ko: "아직 지원자가 없어요.",
                        en: "No applicants yet.",
                    })}
                </p>
            </div>
        {/if}
    </div>

    <div
        class="flex flex-col gap-[0.625rem] items-start mt-auto overflow-clip relative shrink-0 w-full pt-[0.3125rem]"
    >
        {#if alertMessage}
            <div
                class="flex gap-[0.25rem] items-center justify-center relative shrink-0 w-full"
            >
                <div
                    class="relative shrink-0 flex items-center justify-center text-red-600"
                >
                    {@html resizeSvg(triangleExclamationSvg)}
                </div>
                <p
                    class="font-pretendard font-normal leading-tight relative shrink-0 text-red-600 dark:text-red-400 text-[0.75rem] m-0"
                >
                    {i18n.decode(alertMessage)}
                </p>
            </div>
        {/if}

        {#if buttonState === "apply" || buttonState === "cancel"}
            <form
                method="POST"
                action={buttonState === "apply" ? "?/apply" : "?/cancel"}
                use:enhance
                class="w-full m-0"
            >
                <input type="hidden" name="sportId" value={id} />
                <button
                    class="content-stretch flex border-none h-[3.125rem] items-center justify-center px-[2.1875rem] py-[0.5rem] relative rounded-[0.9375rem] shrink-0 w-full transition-colors duration-200 group cursor-pointer
                    {buttonState === 'apply'
                        ? 'bg-amber-500 hover:bg-amber-600 active:bg-amber-800'
                        : 'bg-zinc-500 hover:bg-zinc-600 active:bg-zinc-800'}"
                    onclick={onButtonClick}
                >
                    <p
                        class="font-pretendard font-semibold leading-tight relative shrink-0 text-[1rem] m-0 text-white"
                    >
                        {buttonState === "apply"
                            ? i18n.t({ ko: "지원하기", en: "Apply" })
                            : i18n.t({ ko: "취소하기", en: "Cancel" })}
                    </p>
                </button>
            </form>
        {:else}
            <button
                class="content-stretch flex border-none h-[3.125rem] items-center justify-center px-[2.1875rem] py-[0.5rem] relative rounded-[0.9375rem] shrink-0 w-full bg-zinc-300 dark:bg-zinc-800 cursor-not-allowed"
                disabled
            >
                <p
                    class="font-pretendard font-semibold leading-tight relative shrink-0 text-[1rem] m-0 text-zinc-500 dark:text-zinc-400"
                >
                    {buttonState === "closed"
                        ? i18n.t({ ko: "마감", en: "Closed" })
                        : i18n.t({ ko: "지원 불가", en: "Not Eligible" })}
                </p>
            </button>
        {/if}
    </div>
</div>
