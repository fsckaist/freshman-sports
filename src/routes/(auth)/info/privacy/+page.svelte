<script lang="ts">
    import rawSunIcon from "@gravity-ui/icons/svgs/sun.svg?raw";
    import rawMoonIcon from "@gravity-ui/icons/svgs/moon.svg?raw";
    import rawGlobeIcon from "@gravity-ui/icons/svgs/globe.svg?raw";
    import { themeManager } from "$lib/theme.svelte";
    import { i18n } from "$lib/i18n.svelte";

    function handleClose() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.close();
        }
    }

    const resizeSvg = (svg: string) =>
        svg.replace('width="16" height="16"', 'width="24" height="24"');

    const ThemeIcon = $derived(
        themeManager.theme === "dark"
            ? resizeSvg(rawSunIcon)
            : resizeSvg(rawMoonIcon),
    );
</script>

<div
    class="relative size-full min-h-screen bg-white dark:bg-zinc-950 overflow-hidden flex justify-center"
>
    <!-- Toggles (Top Right) -->
    <div
        class="absolute top-4 right-4 md:top-8 md:right-8 z-50 flex items-center gap-2"
    >
        <button
            onclick={() => i18n.toggle()}
            class="flex items-center justify-center size-12 rounded-xl bg-white/50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 backdrop-blur-sm transition-colors cursor-pointer"
            title={i18n.t({ ko: "언어 변경", en: "Change Language" })}
        >
            <div class="size-6 text-current">
                {@html resizeSvg(rawGlobeIcon)}
            </div>
        </button>
        <button
            onclick={() => themeManager.toggle()}
            class="flex items-center justify-center size-12 rounded-xl bg-white/50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 backdrop-blur-sm transition-colors cursor-pointer"
            title={i18n.t({ ko: "테마 변경", en: "Toggle Theme" })}
        >
            <div class="size-6 text-current">
                {@html ThemeIcon}
            </div>
        </button>
    </div>
    <!-- Centered 90rem wrapper so the absolute watermark is properly anchored -->
    <div
        class="relative flex flex-col gap-[1.875rem] h-screen items-start w-full max-w-[90rem] px-6 py-12 md:px-[12.5rem] md:py-[6.25rem]"
    >
        <!-- Glowing Right Side Watermark -->
        <div
            class="absolute -translate-y-1/2 blur-[0.625rem] opacity-20 dark:opacity-10 right-[-12.8125rem] size-[40rem] md:size-[65.3125rem] top-[calc(50%+7.65625rem)] pointer-events-none select-none mix-blend-multiply dark:mix-blend-plus-lighter z-0"
        >
            <img
                src="/logo.png"
                alt="watermark logo"
                class="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
            />
        </div>

        <!-- Title & Button Frame -->
        <div
            class="content-stretch flex flex-col md:flex-row items-center md:items-end justify-between p-[0.625rem] relative shrink-0 w-full z-10 border-b border-transparent dark:border-zinc-800/50 pb-[1.25rem] gap-4"
        >
            <div
                class="content-stretch flex flex-col gap-[0.3125rem] items-center md:items-start leading-[normal] relative shrink-0 text-zinc-800 dark:text-zinc-100 break-keep"
            >
                <p
                    class="font-pretendard font-semibold relative shrink-0 text-center md:text-left text-lg md:text-[1.5rem] m-0"
                >
                    {i18n.t({ ko: '2026 봄학기 새내기 체육 대회', en: 'Spring 2026 Freshman Sports' })}
                </p>
                <h1
                    class="font-pretendard font-bold relative shrink-0 text-center md:text-left text-4xl md:text-[4rem] leading-[1.1] m-0"
                >
                    {i18n.t({ ko: '개인정보 처리방침', en: 'Privacy Policy' })}
                </h1>
            </div>
            <button
                onclick={handleClose}
                aria-label="Confirm and close"
                class="bg-amber-500 hover:bg-amber-600 active:bg-amber-800 transition-colors cursor-pointer content-stretch flex flex-col items-center justify-center px-[2.1875rem] py-[0.5rem] relative rounded-[6.25rem] shrink-0 w-full md:w-auto"
            >
                <span
                    class="font-pretendard font-semibold leading-[normal] relative shrink-0 text-lg md:text-[1.25rem] text-white whitespace-pre-wrap"
                    >{i18n.t({ ko: '확인', en: 'Confirm' })}</span
                >
            </button>
        </div>

        <!-- Scrollable Document Area -->
        <div
            class="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-x-hidden overflow-y-auto p-[0.625rem] relative w-full break-keep"
        >
            <div
                class="flex-[1_0_0] font-pretendard font-medium leading-[1.6] min-h-px min-w-px relative text-zinc-800 dark:text-zinc-300 text-base md:text-[1rem] w-full"
            >
                <p class="mb-4">
                    {i18n.t({
                        ko: "새내기학생회(이하 '주최 측')는 개인정보보호법 등 관련 법령상의 개인정보보호 규정을 준수하며, 개인정보처리방침은 아래와 같습니다. 이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.",
                        en: "The Freshman Student Council (hereinafter referred to as 'the Organizer') complies with the personal information protection regulations under relevant laws, such as the Personal Information Protection Act, and the Privacy Policy is as follows. This Privacy Policy applies from the date of implementation, and in the event of any additions, deletions, or corrections to the contents in accordance with laws and policies, notice will be provided through announcements from 7 days prior to the implementation of the changes.",
                    })}
                </p>

                <div class="mb-8">
                    <h2 class="font-bold text-xl mb-2">
                        {i18n.t({ ko: '1조. 개인정보의 처리 목적', en: 'Article 1. Purpose of Processing Personal Information' })}
                    </h2>
                    <p class="mb-2">
                        {i18n.t({
                            ko: '개인정보를 다음의 목적을 위해 처리합니다. 처리한 개인정보는 다음의 목적 이외의 용도로는 사용되지 않으며 이용 목적이 변경될 시에는 사전 동의를 구할 예정입니다.',
                            en: 'Personal information is processed for the following purposes. The processed personal information will not be used for purposes other than the following, and prior consent will be sought if the purpose of use changes.',
                        })}
                    </p>
                    <ul class="list-disc pl-6">
                        <li>{i18n.t({ ko: '새내기 체육대회 참가 신청 및 대회 당일 본인 식별', en: 'Registration for the Freshman Sports Day and identification of the individual on the day of the event' })}</li>
                        <li>{i18n.t({ ko: '행사 운영 안내(대진표, 장소 알림 등) 및 비상시 연락', en: 'Guidance on event operations (tournament brackets, location notifications, etc.) and contact in case of emergency' })}</li>
                        <li>{i18n.t({ ko: '경품 지급을 위한 본인 확인', en: 'Identity verification for the distribution of prizes' })}</li>
                        <li>{i18n.t({ ko: '안전사고 등 긴급한 상황 발생 시 신속한 대응', en: 'Rapid response in the event of an emergency, such as a safety accident' })}</li>
                    </ul>
                </div>

                <div class="mb-8">
                    <h2 class="font-bold text-xl mb-2">
                        {i18n.t({ ko: '2조. 개인정보 처리 및 보유기간', en: 'Article 2. Processing and Retention Period of Personal Information' })}
                    </h2>
                    <p class="mb-1">
                        {i18n.t({
                            ko: '보유 및 이용 기간: 수집 일로부터 가을학기 개강 날 까지.',
                            en: 'Retention and Use Period: From the date of collection until the first day of the Fall semester.',
                        })}
                    </p>
                    <p>
                        {i18n.t({
                            ko: '단, 보험 청구 등 사후 처리가 필요한 경우 해당 업무 종료 시까지 보유하며, 법령에 따라 보존해야 하는 경우 해당 기간까지 보관합니다.',
                            en: 'However, if post-processing such as insurance claims is required, the information will be retained until the conclusion of such tasks, and if it must be preserved according to laws and regulations, it will be stored until the end of that period.',
                        })}
                    </p>
                </div>

                <div class="mb-8">
                    <h2 class="font-bold text-xl mb-2">
                        {i18n.t({ ko: '3조. 정보주체 권리·의무 및 그 행사방법에 관한 사항', en: 'Article 3. Rights and Duties of Information Subjects and Methods of Exercise' })}
                    </h2>
                    <p class="mb-2">
                        {i18n.t({ ko: '이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.', en: 'Users, as personal information subjects, may exercise the following rights:' })}
                    </p>
                    <ul class="list-disc pl-6">
                        <li>{i18n.t({ ko: '개인정보 열람 요구, 오류가 있을 경우 정정 요구, 삭제 요구, 처리 정지 요구.', en: 'The right to request access to personal information, request correction in case of errors, request deletion, and request suspension of processing.' })}</li>
                        <li>{i18n.t({ ko: '권리 행사는 주최 측 서면, 전자우편 등을 통하여 하실 수 있습니다.', en: 'Rights can be exercised through the Organizer in writing or via e-mail.' })}</li>
                    </ul>
                </div>

                <div class="mb-8">
                    <h2 class="font-bold text-xl mb-2">
                        {i18n.t({ ko: '4조. 처리하는 개인정보 항목', en: 'Article 4. Items of Personal Information to be Processed' })}
                    </h2>
                    <p class="mb-2">
                        {i18n.t({ ko: '주최 측은 공정하고 효율적인 체육대회 운영을 위하여 아래 정보를 처리합니다.', en: 'The Organizer processes the following information for fair and efficient operation of the sports day.' })}
                    </p>
                    <p>
                        <strong>{i18n.t({ ko: '필수 항목:', en: 'Mandatory Items:' })}</strong>
                        {i18n.t({ ko: '성명, 학번, 전화번호, 성별, 새터반', en: "Name, Student ID number, Phone number, Gender, 'Saeter' group (Orientation group)" })}
                    </p>
                </div>

                <div class="mb-8">
                    <h2 class="font-bold text-xl mb-2">
                        {i18n.t({ ko: '5조. 개인정보 파기 절차 및 방법', en: 'Article 5. Procedures and Methods for Destruction of Personal Information' })}
                    </h2>
                    <p class="mb-1">
                        <strong>{i18n.t({ ko: '절차:', en: 'Procedures:' })}</strong>
                        {i18n.t({ ko: '목적 달성(행사 종료 및 정산 완료) 후 즉시 파기합니다.', en: 'Destroyed immediately after achieving the purpose (conclusion of the event and completion of settlement).' })}
                    </p>
                    <p>
                        <strong>{i18n.t({ ko: '방법:', en: 'Methods:' })}</strong>
                        {i18n.t({ ko: '전자적 파일은 복구가 불가능한 방법으로 삭제하며, 종이 문서는 분쇄기로 파쇄합니다.', en: 'Electronic files are deleted using methods that make recovery impossible, and paper documents are shredded with a shredder.' })}
                    </p>
                </div>

                <div class="mb-8">
                    <h2 class="font-bold text-xl mb-2">
                        {i18n.t({ ko: '6조. 개인정보 안전성 확보 조치', en: 'Article 6. Measures to Ensure the Safety of Personal Information' })}
                    </h2>
                    <ul class="list-disc pl-6">
                        <li>{i18n.t({ ko: '개인정보가 포함된 명단은 암호화된 파일로 보관하며, 담당자 외 접근을 엄격히 제한합니다.', en: 'Lists containing personal information are kept as encrypted files, and access is strictly restricted to those in charge.' })}</li>
                        <li>{i18n.t({ ko: '지속적인 보안 점검 및 보안 시스템 활용 등 기술적 조치를 취하고 있습니다.', en: 'Technical measures such as continuous security inspections and the utilization of security systems are being taken.' })}</li>
                    </ul>
                </div>

                <div class="mb-8">
                    <h2 class="font-bold text-xl mb-2">
                        {i18n.t({ ko: '7조. 권익침해 구제방법', en: 'Article 7. Remedies for Infringement of Rights and Interests' })}
                    </h2>
                    <p class="mb-2">
                        {i18n.t({ ko: '개인정보주체는 개인정보침해로 인한 구제를 받기 위하여 한국인터넷진흥원 개인정보침해 신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.', en: 'Personal information subjects may apply for dispute resolution or consultation with the Personal Information Infringement Report Center of the Korea Internet & Security Agency to receive relief for personal information infringement.' })}
                    </p>
                    <p>
                        <strong>{i18n.t({ ko: '개인정보 침해신고 센터:', en: 'Personal Information Infringement Report Center:' })}</strong>
                        {i18n.t({ ko: '국번없이 118번', en: '118 (no area code required)' })}
                    </p>
                </div>

                <div class="mb-8">
                    <h2 class="font-bold text-xl mb-2">
                        {i18n.t({ ko: '8조. 개인정보보호 책임관 및 담당자 연락처', en: 'Article 8. Personal Information Protection Officer and Person in Charge Contact Information' })}
                    </h2>
                    <ul class="list-disc pl-6">
                        <li>
                            <strong>{i18n.t({ ko: '개인정보 보호 책임관:', en: 'Personal Information Protection Officer:' })}</strong>
                            {i18n.t({ ko: '새내기학생회 기획국장 유태우', en: 'Tae-woo Yoo, Director of Planning, Freshman Student Council' })}
                        </li>
                        <li>
                            <strong>{i18n.t({ ko: '담당자 이름:', en: 'Name of Person in Charge:' })}</strong>
                            {i18n.t({ ko: '유태우', en: 'Tae-woo Yoo' })}
                        </li>
                        <li>
                            <strong>{i18n.t({ ko: '연락처:', en: 'Contact:' })}</strong>
                            contact@kaistfsc.org
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 class="font-bold text-xl mb-2">
                        {i18n.t({ ko: '9조. 개인정보처리방침 변경', en: 'Article 9. Changes to the Privacy Policy' })}
                    </h2>
                    <p>
                        {i18n.t({
                            ko: '본 방침은 2026년 3월 25일부터 시행됩니다.',
                            en: 'This policy is effective as of March 25, 2026.',
                        })}
                    </p>
                </div>
            </div>
        </div>

        <!-- Sticky Footer -->
        <div
            class="content-stretch flex items-center p-[0.625rem] relative shrink-0 w-full border-t border-transparent dark:border-zinc-800/50 pt-[1.25rem]"
        >
            <p
                class="font-pretendard font-medium text-zinc-800 dark:text-zinc-100 m-0 p-0 text-[1.125rem]"
            >
                {i18n.t({ ko: '제23대 새내기학생회', en: '23rd Freshman Council' })} <span class="text-amber-500 text-center md:text-left">{i18n.t({ ko: '샛별', en: 'Saetbyeol' })}</span>
            </p>
        </div>
    </div>
</div>
