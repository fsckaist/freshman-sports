<script lang="ts">
    import rawBriefcaseSlashIcon from "@gravity-ui/icons/svgs/ban.svg?raw";
    import { enhance } from "$app/forms";
    import { i18n } from "$lib/i18n.svelte";

    const ErrorIcon = rawBriefcaseSlashIcon.replace(
        'width="16" height="16"',
        'width="64" height="64" class="text-zinc-600 dark:text-zinc-500"',
    );
</script>

<div
    class="flex flex-col items-center justify-center h-full w-full p-[3.125rem]"
>
    <div class="flex flex-col items-center max-w-[50rem] text-center gap-6">
        <div class="mb-[0.625rem]">
            {@html ErrorIcon}
        </div>

        <h1
            class="font-pretendard font-bold text-zinc-800 dark:text-zinc-100 text-[2rem] leading-tight m-0"
        >
            {i18n.t({
                ko: "심판은 새내기 체육대회 웹사이트를 사용할 수 없어요.",
                en: "Referees cannot use the Freshman Sports website.",
            })}
        </h1>

        <p
            class="font-pretendard font-medium text-zinc-500 dark:text-zinc-400 text-[1.125rem] leading-snug"
        >
            {i18n.t({
                ko: "새내기가 아닌 심판들을 위한 심판 일정 관리는 아직 만들어지지 않았어요.",
                en: "Referee schedule management for non-freshman referees is not yet available.",
            })}<br />
            {i18n.t({
                ko: "문제가 있다고 판단되시면 새내기학생회에 문의해주세요.",
                en: "Please contact the Freshman Council with any concerns.",
            })}
        </p>

        <form method="POST" action="/logout" use:enhance class="mt-6">
            <button
                type="submit"
                class="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-pretendard font-semibold rounded-xl transition-colors text-[1rem]"
            >
                {i18n.t({ ko: "로그아웃", en: "Sign Out" })}
            </button>
        </form>
    </div>
</div>
