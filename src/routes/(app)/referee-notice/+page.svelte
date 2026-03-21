<script lang="ts">
    import rawBriefcaseSlashIcon from "@gravity-ui/icons/svgs/ban.svg?raw";
    import { enhance } from "$app/forms";

    const ErrorIcon = rawBriefcaseSlashIcon.replace(
        'width="16" height="16"',
        'width="64" height="64" class="text-zinc-600 dark:text-zinc-500"',
    );
</script>

<div class="flex flex-col items-center justify-center h-full w-full p-[3.125rem]">
    <div class="flex flex-col items-center max-w-[28rem] text-center gap-6">
        <div class="mb-[0.625rem]">
            {@html ErrorIcon}
        </div>
        
        <h1 class="font-pretendard font-bold text-zinc-800 dark:text-zinc-100 text-[2rem] leading-tight m-0">
            접근 제한 알림
        </h1>
        
        <p class="font-pretendard font-medium text-zinc-500 dark:text-zinc-400 text-[1.125rem] leading-snug">
            심판은 새내기 체육대회 웹사이트를 사용할 수 없어요.<br/>
            심판 일정 관리는 아직 만들어지지 않았어요.
        </p>

        <form method="POST" action="/logout" use:enhance class="mt-6">
            <button
                type="submit"
                class="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-pretendard font-semibold rounded-xl transition-colors text-[1rem]"
            >
                계정 로그아웃
            </button>
        </form>
    </div>
</div>
