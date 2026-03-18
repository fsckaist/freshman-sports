<script lang="ts">
    export let state: "win" | "lose" | "default";
    export let notAvailable: boolean = false;
    export let className: string = "0";
    export let ourTeam: boolean = false;
    export let medal: "gold" | "silver" | "bronze" | undefined = undefined;

    $: isDefault = state === "default";
    $: isLose = state === "lose";
    $: isWin = state === "win";

    // Determine background color
    $: bgClass =
        medal === "gold"
            ? "bg-[#FFAE00]"
            : medal === "silver"
              ? "bg-[#9BB1D1]"
              : medal === "bronze"
                ? "bg-[#CC5D18]"
                : isDefault
                  ? "bg-zinc-200 dark:bg-zinc-800"
                  : isLose
                    ? "bg-zinc-600 dark:bg-zinc-700"
                    : "bg-amber-500";

    // Determine text color
    $: textClass =
        medal === "gold" || medal === "silver" || medal === "bronze"
            ? "text-white font-bold"
            : isDefault
              ? "text-zinc-800 dark:text-zinc-200"
              : "text-white";

    $: gapClass =
        (isDefault || isLose || isWin) && ourTeam
            ? "gap-[0.3125rem]"
            : "gap-[0.0625rem]";
</script>

<div
    class="content-stretch flex items-center justify-center overflow-clip p-[0.625rem] relative rounded-[0.625rem] w-full shrink-0 h-fit {bgClass} {gapClass}"
>
    {#if className === "0" || notAvailable}
        <p
            class="font-pretendard font-semibold leading-tight relative shrink-0 text-[1rem] {textClass} m-0"
        >
            {notAvailable ? "-" : "?"}
        </p>
    {/if}

    {#if state === "win" && ourTeam}
        <div class="relative shrink-0 size-[1rem]">
            <!-- Crown icon -->
            <svg
                class="absolute inset-[6.25%] max-w-none size-[87.5%]"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M7 8C10.85 8 14 10.5 14 12.5C14 12.8978 13.842 13.2794 13.5607 13.5607C13.2794 13.842 12.8978 14 12.5 14H1.5C1.10218 14 0.720644 13.842 0.43934 13.5607C0.158035 13.2794 0 12.8978 0 12.5C0 10.5 3.15 8 7 8ZM7 0C7.92826 0 8.8185 0.368749 9.47487 1.02513C10.1313 1.6815 10.5 2.57174 10.5 3.5C10.5 4.42826 10.1313 5.3185 9.47487 5.97487C8.8185 6.63125 7.92826 7 7 7C6.07174 7 5.1815 6.63125 4.52513 5.97487C3.86875 5.3185 3.5 4.42826 3.5 3.5C3.5 2.57174 3.86875 1.6815 4.52513 1.02513C5.1815 0.368749 6.07174 0 7 0Z"
                    fill="#FEF3C6"
                />
            </svg>
        </div>
    {/if}

    {#if state === "lose" && ourTeam}
        <div class="relative shrink-0 size-[1rem]">
            <svg
                class="absolute inset-[6.25%] max-w-none size-[87.5%]"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M7 8C10.85 8 14 10.5 14 12.5C14 12.8978 13.842 13.2794 13.5607 13.5607C13.2794 13.842 12.8978 14 12.5 14H1.5C1.10218 14 0.720644 13.842 0.43934 13.5607C0.158035 13.2794 0 12.8978 0 12.5C0 10.5 3.15 8 7 8ZM7 0C7.92826 0 8.8185 0.368749 9.47487 1.02513C10.1313 1.6815 10.5 2.57174 10.5 3.5C10.5 4.42826 10.1313 5.3185 9.47487 5.97487C8.8185 6.63125 7.92826 7 7 7C6.07174 7 5.1815 6.63125 4.52513 5.97487C3.86875 5.3185 3.5 4.42826 3.5 3.5C3.5 2.57174 3.86875 1.6815 4.52513 1.02513C5.1815 0.368749 6.07174 0 7 0Z"
                    fill="white"
                />
            </svg>
        </div>
    {/if}

    {#if state === "default" && ourTeam}
        <div class="relative shrink-0 size-[1rem]">
            <svg
                class="absolute inset-[6.25%] max-w-none size-[87.5%]"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M7 8C10.85 8 14 10.5 14 12.5C14 12.8978 13.842 13.2794 13.5607 13.5607C13.2794 13.842 12.8978 14 12.5 14H1.5C1.10218 14 0.720644 13.842 0.43934 13.5607C0.158035 13.2794 0 12.8978 0 12.5C0 10.5 3.15 8 7 8ZM7 0C7.92826 0 8.8185 0.368749 9.47487 1.02513C10.1313 1.6815 10.5 2.57174 10.5 3.5C10.5 4.42826 10.1313 5.3185 9.47487 5.97487C8.8185 6.63125 7.92826 7 7 7C6.07174 7 5.1815 6.63125 4.52513 5.97487C3.86875 5.3185 3.5 4.42826 3.5 3.5C3.5 2.57174 3.86875 1.6815 4.52513 1.02513C5.1815 0.368749 6.07174 0 7 0Z"
                    class="fill-zinc-900 dark:fill-zinc-300"
                />
            </svg>
        </div>
    {/if}

    {#if !notAvailable && className !== "0"}
        <div
            class="content-stretch flex font-pretendard font-semibold items-center leading-tight relative shrink-0 text-[1rem] gap-[0.0625rem] {textClass}"
        >
            <p class="relative shrink-0 m-0">{className}</p>
            <p class="relative shrink-0 m-0">반</p>
        </div>
    {/if}
</div>
