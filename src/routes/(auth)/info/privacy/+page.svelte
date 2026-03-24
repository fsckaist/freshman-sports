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
                class="flex-[1_0_0] font-pretendard font-medium leading-[1.6] min-h-px min-w-px relative text-zinc-800 dark:text-zinc-300 text-lg md:text-[1.25rem] w-full"
            >
                <p class="mb-4">
                    {i18n.t({
                        ko: "새내기학생회(이하 '주최 측')는 개인정보보호법 등 관련 법령상의 개인정보보호 규정을 준수하며, 개인정보처리방침은 아래와 같습니다. 본 방침은 시행일로부터 적용되며, 변경사항이 있을 경우 시행 7일 전부터 공지사항을 통해 고지하겠습니다.",
                        en: "The Freshmen Student Council (hereinafter referred to as \"the Organizer\") complies with the personal information protection regulations under relevant laws, such as the Personal Information Protection Act. The Privacy Policy is as follows. This policy shall apply from the effective date, and any additions, deletions, or corrections to the contents due to changes in laws or policies will be notified through announcements at least 7 days before the implementation of the changes.",
                    })}
                </p>

                <div class="mb-8">
                    <h2 class="font-bold text-xl mb-2">
                        {i18n.t({ ko: '제1조. 개인정보의 처리 목적', en: 'Article 1. Purpose of Processing Personal Information' })}
                    </h2>
                    <p class="mb-2">
                        {i18n.t({
                            ko: '주최 측은 다음의 목적을 위해 개인정보를 처리합니다. 처리한 개인정보는 목적 외의 용도로는 사용되지 않으며, 이용 목적 변경 시 사전 동의를 구할 예정입니다.',
                            en: 'The Organizer processes personal information for the following purposes. The processed personal information will not be used for purposes other than the following, and prior consent will be sought if the purpose of use changes.',
                        })}
                    </p>
                    <ul class="list-disc pl-6">
                        <li>{i18n.t({ ko: '새내기 체육대회 참가 신청 및 당일 본인 식별', en: 'Registration for the Freshmen Sports Festival and identification on the day of the event' })}</li>
                        <li>{i18n.t({ ko: '행사 운영 안내(대진표, 장소 알림 등) 및 비상 연락', en: 'Event operation guidance (tournament brackets, venue notifications, etc.) and emergency contact' })}</li>
                        <li>{i18n.t({ ko: '경품 지급을 위한 본인 확인', en: 'Identity verification for prize distribution' })}</li>
                        <li>{i18n.t({ ko: '안전사고 등 긴급 상황 발생 시 신속한 대응', en: 'Prompt response in case of emergencies such as safety accidents' })}</li>
                    </ul>
                </div>

                <div class="mb-8">
                    <h2 class="font-bold text-xl mb-2">
                        {i18n.t({ ko: '제2조. 개인정보 처리 및 보유 기간', en: 'Article 2. Processing and Retention Period of Personal Information' })}
                    </h2>
                    <p class="mb-1">
                        <strong>{i18n.t({ ko: '보유 및 이용 기간:', en: 'Retention and Use Period:' })}</strong>
                        {i18n.t({ ko: '수집 일로부터 가을학기 개강 날까지', en: 'From the date of collection until the start date of the Fall Semester.' })}
                    </p>
                    <p>
                        <strong>{i18n.t({ ko: '예외 사항:', en: 'Exceptions:' })}</strong>
                        {i18n.t({
                            ko: '보험 청구 등 사후 처리가 필요한 경우 해당 업무 종료 시까지, 또는 관련 법령에 따라 보존이 필요한 경우 해당 기간까지 보관합니다.',
                            en: 'In cases where follow-up processing such as insurance claims is required, the information will be retained until the completion of the relevant task; if it must be preserved according to laws and regulations, it will be kept for the period specified by such laws.',
                        })}
                    </p>
                </div>

                <div class="mb-8">
                    <h2 class="font-bold text-xl mb-2">
                        {i18n.t({ ko: '제3조. 정보주체의 권리·의무 및 행사 방법', en: 'Article 3. Rights and Obligations of Data Subjects and Methods of Exercise' })}
                    </h2>
                    <p class="mb-2">
                        {i18n.t({ ko: '이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.', en: 'Users, as data subjects, may exercise the following rights:' })}
                    </p>
                    <ol class="list-decimal pl-6">
                        <li>{i18n.t({ ko: '개인정보 열람, 정정(오류 시), 삭제 및 처리 정지 요구', en: 'Request for access to personal information, request for correction in case of errors, request for deletion, and request for suspension of processing.' })}</li>
                        <li>
                            <strong>{i18n.t({ ko: '행사 방법:', en: 'Method of Exercise:' })}</strong>
                            {i18n.t({ ko: '주최 측 서면 또는 전자우편(E-mail)을 통해 접수', en: 'Rights can be exercised through written documents or email (E-mail) to the Organizer.' })}
                        </li>
                    </ol>
                </div>

                <div class="mb-8">
                    <h2 class="font-bold text-xl mb-2">
                        {i18n.t({ ko: '제4조. 처리하는 개인정보 항목', en: 'Article 4. Items of Personal Information Processed' })}
                    </h2>
                    <p class="mb-2">
                        {i18n.t({ ko: '공정하고 효율적인 대회 운영을 위해 아래의 필수 정보를 수집합니다.', en: 'The Organizer processes the following information for the fair and efficient operation of the sports day.' })}
                    </p>
                    <p>
                        <strong>{i18n.t({ ko: '필수 항목', en: 'Mandatory Items' })}</strong> :
                        {i18n.t({ ko: '성명, 학번, 전화번호, 성별, 새터반', en: 'Name, Student ID Number, Phone Number, Gender, Freshmen Orientation Group' })}
                    </p>
                </div>

                <div class="mb-8">
                    <h2 class="font-bold text-xl mb-2">
                        {i18n.t({ ko: '제5조. 개인정보 파기 절차 및 방법', en: 'Article 5. Procedures and Methods for Destruction of Personal Information' })}
                    </h2>
                    <p class="mb-1">
                        <strong>{i18n.t({ ko: '절차:', en: 'Procedure:' })}</strong>
                        {i18n.t({ ko: '목적 달성(행사 종료 및 정산 완료) 후 즉시 파기합니다.', en: 'Information is destroyed immediately after the purpose is achieved (completion of the event and settlement).' })}
                    </p>
                    <p>
                        <strong>{i18n.t({ ko: '방법:', en: 'Method:' })}</strong>
                        {i18n.t({ ko: '전자적 파일은 복구가 불가능한 방법으로 삭제하며, 종이 문서는 분쇄기로 파쇄합니다.', en: 'Electronic files are deleted using methods that make recovery impossible, and paper documents are shredded using a paper shredder.' })}
                    </p>
                </div>

                <div class="mb-8">
                    <h2 class="font-bold text-xl mb-2">
                        {i18n.t({ ko: '제6조. 개인정보 안전성 확보 조치', en: 'Article 6. Measures to Ensure the Safety of Personal Information' })}
                    </h2>
                    <ul class="list-disc pl-6">
                        <li>{i18n.t({ ko: '개인정보 포함 명단은 암호화된 파일로 보관하며 담당자 외 접근을 엄격히 제한합니다.', en: 'Lists containing personal information are stored as encrypted files, and access is strictly limited to authorized personnel only.' })}</li>
                        <li>{i18n.t({ ko: '개인정보를 취급하는 직원은 최소한의 인원으로 구성하며, 담당자 외 접근을 엄격히 제한합니다.', en: 'The number of staff members handling personal information is kept to a minimum, and access by unauthorized persons is strictly restricted.' })}</li>
                        <li>{i18n.t({ ko: '지속적인 보안 점검 및 보안 시스템 활용 등 기술적 조치를 취하고 있습니다.', en: 'Technical measures such as continuous security inspections and the utilization of security systems are being implemented.' })}</li>
                    </ul>
                </div>

                <div class="mb-8">
                    <h2 class="font-bold text-xl mb-2">
                        {i18n.t({ ko: '제7조. 권익침해 구제방법', en: 'Article 7. Remedies for Infringement of Rights and Interests' })}
                    </h2>
                    <p class="mb-2">
                        {i18n.t({ ko: '개인정보 침해로 인한 구제 및 상담이 필요한 경우 아래 기관에 문의하실 수 있습니다.', en: 'Data subjects may apply for dispute resolution or consultation at the Personal Information Infringement Reporting Center of the Korea Internet & Security Agency (KISA) to receive remedies for personal information infringement.' })}
                    </p>
                    <p>
                        <strong>{i18n.t({ ko: '개인정보 침해신고 센터:', en: 'Personal Information Infringement Reporting Center:' })}</strong>
                        {i18n.t({ ko: '국번 없이 118번 (한국인터넷진흥원 운영)', en: 'Dial 118 (without area code)' })}
                    </p>
                </div>

                <div class="mb-8">
                    <h2 class="font-bold text-xl mb-2">
                        {i18n.t({ ko: '제8조. 개인정보보호 책임관 및 담당자', en: 'Article 8. Personal Information Protection Officer and Contact Information' })}
                    </h2>
                    <ul class="list-disc pl-6">
                        <li>
                            <strong>{i18n.t({ ko: '개인정보 보호 책임관:', en: 'Chief Privacy Officer:' })}</strong>
                            {i18n.t({ ko: '새내기학생회 기획국장 유태우', en: 'Yu Tae-woo, Director of Planning, Freshmen Student Council' })}
                        </li>
                        <li>
                            <strong>{i18n.t({ ko: '담당자:', en: 'Person in Charge:' })}</strong>
                            {i18n.t({ ko: '유태우', en: 'Yu Tae-woo' })}
                        </li>
                        <li>
                            <strong>{i18n.t({ ko: '연락처:', en: 'Contact:' })}</strong>
                            contact@kaistfsc.org
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 class="font-bold text-xl mb-2">
                        {i18n.t({ ko: '제9조. 개인정보처리방침 변경', en: 'Article 9. Changes to the Privacy Policy' })}
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
