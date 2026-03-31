<script lang="ts">
    import { i18n } from "$lib/i18n.svelte";
</script>

<div
    class="flex flex-col gap-6 sm:gap-10 w-full text-[0.9rem] sm:text-[1rem] break-keep"
>
    <!-- Section 1: Tournament Overview (plain text) -->
    <section class="flex flex-col gap-3">
        <h3
            class="text-lg sm:text-xl font-bold text-zinc-800 dark:text-zinc-100 m-0 border-b border-zinc-300 dark:border-zinc-600 pb-2"
        >
            {i18n.t({ ko: "대회 개요", en: "Tournament Overview" })}
        </h3>
        <ul
            class="list-none m-0 p-0 flex flex-col gap-2 text-zinc-800 dark:text-zinc-200"
        >
            <li class="flex gap-2">
                <span
                    class="font-semibold text-zinc-500 dark:text-zinc-400 shrink-0 min-w-[4rem]"
                >
                    {i18n.t({ ko: "기간", en: "Period" })}
                </span>
                <span>2026.04.06 ~ 06.05</span>
            </li>
            <li class="flex gap-2">
                <span
                    class="font-semibold text-zinc-500 dark:text-zinc-400 shrink-0 min-w-[4rem]"
                >
                    {i18n.t({ ko: "종목", en: "Events" })}
                </span>
                <span>
                    {i18n.t({
                        ko: "풋살, 농구, 남자 배드민턴 복식, 여자 배드민턴 복식",
                        en: "Futsal, Basketball, Men's Badminton Doubles, Women's Badminton Doubles",
                    })}
                </span>
            </li>
            <li class="flex gap-2">
                <span
                    class="font-semibold text-zinc-500 dark:text-zinc-400 shrink-0 min-w-[4rem]"
                >
                    {i18n.t({ ko: "방식", en: "Format" })}
                </span>
                <span>
                    {i18n.t({
                        ko: "31강 단판 토너먼트",
                        en: "31-Team Single Elimination",
                    })}
                </span>
            </li>
            <li class="flex flex-row gap-2">
                <span
                    class="font-semibold text-zinc-500 dark:text-zinc-400 shrink-0 min-w-[4rem]"
                >
                    {i18n.t({ ko: "장소", en: "Venues" })}
                </span>
                <div
                    class="flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-1.5 sm:items-center"
                >
                    <span>
                        {i18n.t({
                            ko: "풋살 - 풋살장 A·B코트",
                            en: "Futsal - Futsal Courts A & B",
                        })}
                    </span>
                    <span
                        class="hidden sm:inline text-zinc-300 dark:text-zinc-600"
                        >/</span
                    >
                    <span>
                        {i18n.t({
                            ko: "농구 - 서측 실내 체육관",
                            en: "Basketball - West Indoor Gymnasium",
                        })}
                    </span>
                    <span
                        class="hidden sm:inline text-zinc-300 dark:text-zinc-600"
                        >/</span
                    >
                    <span>
                        {i18n.t({
                            ko: "배드민턴 - 스포츠 컴플렉스",
                            en: "Badminton - Sports Complex",
                        })}
                    </span>
                </div>
            </li>
        </ul>
    </section>

    <!-- Section 2: Participants per Event -->
    <section class="flex flex-col gap-3">
        <h3
            class="text-lg sm:text-xl font-bold text-zinc-800 dark:text-zinc-100 m-0 border-b border-zinc-300 dark:border-zinc-600 pb-2"
        >
            {i18n.t({ ko: "종목별 출전 인원", en: "Participants per Event" })}
        </h3>
        <div
            class="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800"
        >
            <table class="w-full">
                <thead>
                    <tr
                        class="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                    >
                        <th
                            class="text-center px-2 sm:px-4 py-2 sm:py-3 font-semibold"
                            >{i18n.t({ ko: "종목", en: "Event" })}</th
                        >
                        <th
                            class="text-center px-2 sm:px-4 py-2 sm:py-3 font-semibold whitespace-nowrap"
                            >{i18n.t({ ko: "주전", en: "Starters" })}</th
                        >
                        <th
                            class="text-center px-2 sm:px-4 py-2 sm:py-3 font-semibold whitespace-nowrap"
                            >{i18n.t({
                                ko: "후보 (최대)",
                                en: "Subs (Max)",
                            })}</th
                        >
                        <th
                            class="text-center px-2 sm:px-4 py-2 sm:py-3 font-semibold whitespace-nowrap"
                            >{i18n.t({ ko: "전체 인원", en: "Total" })}</th
                        >
                    </tr>
                </thead>
                <tbody class="text-zinc-800 dark:text-zinc-200">
                    <tr class="border-t border-zinc-200 dark:border-zinc-800">
                        <td
                            class="text-center px-4 py-3 font-medium whitespace-nowrap"
                            >{i18n.t({ ko: "풋살", en: "Futsal" })}</td
                        >
                        <td
                            class="text-center px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap"
                            >{i18n.t({ ko: "5명", en: "5" })}</td
                        >
                        <td class="text-center px-4 py-3 whitespace-nowrap"
                            >{i18n.t({ ko: "5명", en: "5" })}</td
                        >
                        <td
                            class="text-center px-2 sm:px-4 py-2 sm:py-3 font-semibold whitespace-nowrap"
                            >{i18n.t({ ko: "5 ~ 10명", en: "5 – 10" })}</td
                        >
                    </tr>
                    <tr class="border-t border-zinc-200 dark:border-zinc-800">
                        <td
                            class="text-center px-4 py-3 font-medium whitespace-nowrap"
                            >{i18n.t({ ko: "농구", en: "Basketball" })}</td
                        >
                        <td class="text-center px-4 py-3 whitespace-nowrap"
                            >{i18n.t({ ko: "3명", en: "3" })}</td
                        >
                        <td class="text-center px-4 py-3 whitespace-nowrap"
                            >{i18n.t({ ko: "5명", en: "5" })}</td
                        >
                        <td
                            class="text-center px-4 py-3 font-semibold whitespace-nowrap"
                            >{i18n.t({ ko: "3 ~ 8명", en: "3 – 8" })}</td
                        >
                    </tr>
                    <tr class="border-t border-zinc-200 dark:border-zinc-800">
                        <td
                            class="text-center px-4 py-3 font-medium whitespace-nowrap"
                            >{i18n.t({
                                ko: "남자 배드민턴 복식",
                                en: "Men's Badminton Doubles",
                            })}</td
                        >
                        <td class="text-center px-4 py-3 whitespace-nowrap"
                            >{i18n.t({ ko: "2명", en: "2" })}</td
                        >
                        <td class="text-center px-4 py-3 whitespace-nowrap"
                            >{i18n.t({ ko: "2명", en: "2" })}</td
                        >
                        <td
                            class="text-center px-4 py-3 font-semibold whitespace-nowrap"
                            >{i18n.t({ ko: "2 ~ 4명", en: "2 – 4" })}</td
                        >
                    </tr>
                    <tr class="border-t border-zinc-200 dark:border-zinc-800">
                        <td
                            class="text-center px-4 py-3 font-medium whitespace-nowrap"
                            >{i18n.t({
                                ko: "여자 배드민턴 복식",
                                en: "Women's Badminton Doubles",
                            })}</td
                        >
                        <td class="text-center px-4 py-3 whitespace-nowrap"
                            >{i18n.t({ ko: "2명", en: "2" })}</td
                        >
                        <td class="text-center px-4 py-3 whitespace-nowrap"
                            >{i18n.t({ ko: "2명", en: "2" })}</td
                        >
                        <td
                            class="text-center px-4 py-3 font-semibold whitespace-nowrap"
                            >{i18n.t({ ko: "2 ~ 4명", en: "2 – 4" })}</td
                        >
                    </tr>
                </tbody>
            </table>
        </div>
        <p class="text-zinc-500 dark:text-zinc-400 m-0 text-xs">
            {i18n.t({
                ko: "※ 주전 인원 미달 시 해당 종목 몰수패 처리되니 주의해주세요",
                en: "※ Forfeit if starter count is not met",
            })}
        </p>
    </section>

    <!-- Section 3: Eligibility & Registration -->
    <section class="flex flex-col gap-3">
        <h3
            class="text-lg sm:text-xl font-bold text-zinc-800 dark:text-zinc-100 m-0 border-b border-zinc-300 dark:border-zinc-600 pb-2"
        >
            {i18n.t({
                ko: "참가 자격 및 선수 등록",
                en: "Eligibility & Registration",
            })}
        </h3>

        <!-- Eligibility -->
        <div
            class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-5 flex flex-col gap-3"
        >
            <h4 class="font-bold text-zinc-800 dark:text-zinc-200 m-0">
                {i18n.t({ ko: "출전 가능한 선수", en: "Eligible Athletes" })}
            </h4>
            <ol
                class="list-decimal pl-5 m-0 text-zinc-800 dark:text-zinc-300 flex flex-col gap-2"
            >
                <li>
                    {i18n.t({
                        ko: "새내기과정학부 학생",
                        en: "KAIST School of Freshman Program students",
                    })}
                </li>
                <li>
                    {i18n.t({
                        ko: "새내기학생회 준회원으로 인정되는 반도체시스템공학과 1학년 학생",
                        en: "Semiconductor System Engineering students recognized as associate members",
                    })}
                </li>
                <li>
                    {i18n.t({
                        ko: "각 새터반의 프락터",
                        en: "Proctors for each class",
                    })}
                </li>
            </ol>
        </div>

        <!-- Registration -->
        <div
            class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-5 flex flex-col gap-3"
        >
            <h4 class="font-bold text-zinc-800 dark:text-zinc-200 m-0">
                {i18n.t({ ko: "선수 등록", en: "Athlete Registration" })}
            </h4>
            <div class="flex flex-col gap-2 text-zinc-800 dark:text-zinc-300">
                <div class="flex flex-row sm:items-center gap-3">
                    <span
                        class="font-medium text-zinc-500 dark:text-zinc-400 shrink-0"
                    >
                        {i18n.t({ ko: "제출 마감", en: "Deadline" })}
                    </span>
                    <span class="font-bold text-amber-600 dark:text-amber-400">
                        {i18n.t({
                            ko: "4월 10일 (금) 23:59",
                            en: "April 10 (Fri) 23:59",
                        })}
                    </span>
                </div>
                <div class="flex flex-row sm:items-start gap-3">
                    <span
                        class="font-medium text-zinc-500 dark:text-zinc-400 shrink-0"
                    >
                        {i18n.t({ ko: "신청 방법", en: "Method" })}
                    </span>
                    <span>
                        {i18n.t({
                            ko: "새내기 체육대회 웹사이트를 통해 희망자 본인이 직접 개별 신청",
                            en: "Individual application by the applicant using the freshman sports festival website",
                        })}
                    </span>
                </div>
            </div>
        </div>
    </section>

    <!-- Section 4: Match Format -->
    <section class="flex flex-col gap-3">
        <h3
            class="text-lg sm:text-xl font-bold text-zinc-800 dark:text-zinc-100 m-0 border-b border-zinc-300 dark:border-zinc-600 pb-2"
        >
            {i18n.t({ ko: "종목별 경기 방식", en: "Match Format by Event" })}
        </h3>
        <div
            class="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800"
        >
            <table class="w-full">
                <thead>
                    <tr
                        class="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                    >
                        <th class="text-center px-4 py-3 font-semibold"
                            >{i18n.t({ ko: "종목", en: "Event" })}</th
                        >
                        <th class="text-center px-4 py-3 font-semibold"
                            >{i18n.t({ ko: "경기 방식", en: "Format" })}</th
                        >
                    </tr>
                </thead>
                <tbody class="text-zinc-800 dark:text-zinc-200">
                    <tr class="border-t border-zinc-200 dark:border-zinc-800">
                        <td class="text-center px-4 py-3 font-medium"
                            >{i18n.t({ ko: "풋살", en: "Futsal" })}</td
                        >
                        <td class="text-center px-4 py-3 font-medium"
                            >{i18n.t({
                                ko: "전·후반 각 15분, 휴식 5분",
                                en: "Two 15-min halves, 5-min break",
                            })}</td
                        >
                    </tr>
                    <tr class="border-t border-zinc-200 dark:border-zinc-800">
                        <td class="text-center px-4 py-3 font-medium"
                            >{i18n.t({ ko: "농구", en: "Basketball" })}</td
                        >
                        <td class="text-center px-4 py-3"
                            >{i18n.t({
                                ko: "전·후반 각 10분, 휴식 5분",
                                en: "Two 10-min halves, 5-min break",
                            })}</td
                        >
                    </tr>
                    <tr class="border-t border-zinc-200 dark:border-zinc-800">
                        <td class="text-center px-4 py-3 font-medium"
                            >{i18n.t({ ko: "배드민턴", en: "Badminton" })}</td
                        >
                        <td class="text-center px-4 py-3"
                            >{i18n.t({
                                ko: "3세트 2선승제",
                                en: "Best of 3 sets",
                            })}</td
                        >
                    </tr>
                </tbody>
            </table>
        </div>
    </section>

    <!-- Section 5: Tardiness Penalties -->
    <section class="flex flex-col gap-3">
        <h3
            class="text-lg sm:text-xl font-bold text-zinc-800 dark:text-zinc-100 m-0 border-b border-zinc-300 dark:border-zinc-600 pb-2"
        >
            {i18n.t({ ko: "지각 패널티", en: "Tardiness Penalties" })}
        </h3>
        <div
            class="flex flex-col gap-0 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
        >
            <!-- 0-10 min -->
            <div
                class="flex items-stretch border-b border-zinc-200 dark:border-zinc-800"
            >
                <div class="w-1.5 bg-emerald-500 shrink-0"></div>
                <div
                    class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 flex-1 bg-emerald-50/50 dark:bg-emerald-950/20"
                >
                    <span
                        class="font-bold text-emerald-700 dark:text-emerald-400 shrink-0 min-w-[5.5rem]"
                    >
                        0 ~ 10{i18n.t({ ko: "분", en: "min" })}
                    </span>
                    <span class="text-zinc-600 dark:text-zinc-300">
                        {i18n.t({
                            ko: "패널티 없음 (출석 확인 시간)",
                            en: "No penalty (attendance check period)",
                        })}
                    </span>
                </div>
            </div>
            <!-- 10-15 min -->
            <div
                class="flex items-stretch border-b border-zinc-200 dark:border-zinc-800"
            >
                <div class="w-1.5 bg-yellow-500 shrink-0"></div>
                <div
                    class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-4 py-3 flex-1 bg-yellow-50/50 dark:bg-yellow-950/20"
                >
                    <span
                        class="font-bold text-yellow-700 dark:text-yellow-400 shrink-0 min-w-[5.5rem]"
                    >
                        10 ~ 15{i18n.t({ ko: "분", en: "min" })}
                    </span>
                    <span class="text-zinc-600 dark:text-zinc-300">
                        {i18n.t({
                            ko: "선공권 / 서브권을 상대 팀에게 양도",
                            en: "First possession / serve transferred to the opposing team",
                        })}
                    </span>
                </div>
            </div>
            <!-- 15-20 min -->
            <div
                class="flex items-stretch border-b border-zinc-200 dark:border-zinc-800"
            >
                <div class="w-1.5 bg-orange-500 shrink-0"></div>
                <div
                    class="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 flex-1 bg-orange-50/50 dark:bg-orange-950/20"
                >
                    <span
                        class="font-bold text-orange-700 dark:text-orange-400 shrink-0 min-w-[5.5rem]"
                    >
                        15 ~ 20{i18n.t({ ko: "분", en: "min" })}
                    </span>
                    <div
                        class="text-zinc-600 dark:text-zinc-300 flex flex-col gap-0.5"
                    >
                        <span
                            >{i18n.t({
                                ko: "풋살·농구: 전반전 인원 부족 상태로 진행",
                                en: "Futsal/Basketball: First half played with reduced personnel",
                            })}</span
                        >
                        <span
                            >{i18n.t({
                                ko: "배드민턴: 첫 세트 몰수패",
                                en: "Badminton: First set forfeited",
                            })}</span
                        >
                    </div>
                </div>
            </div>
            <!-- 20+ min -->
            <div class="flex items-stretch">
                <div class="w-1.5 bg-red-500 shrink-0"></div>
                <div
                    class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 flex-1 bg-red-50/50 dark:bg-red-950/20"
                >
                    <span
                        class="font-bold text-red-700 dark:text-red-400 shrink-0 min-w-[5.5rem]"
                    >
                        20{i18n.t({ ko: "분 초과", en: "min+" })}
                    </span>
                    <span
                        class="text-zinc-600 dark:text-zinc-300 flex flex-col"
                    >
                        {i18n.t({
                            ko: "경기 전체 몰수패",
                            en: "Entire match forfeited",
                        })}
                    </span>
                </div>
            </div>
        </div>
    </section>

    <!-- Section 6: Safety Rules (plain text) -->
    <section class="flex flex-col gap-3">
        <h3
            class="text-lg sm:text-xl font-bold text-zinc-800 dark:text-zinc-100 m-0 border-b border-zinc-300 dark:border-zinc-600 pb-2"
        >
            {i18n.t({
                ko: "안전 의무 및 금지 사항",
                en: "Safety Obligations & Prohibitions",
            })}
        </h3>
        <ul
            class="list-disc pl-5 m-0 text-zinc-800 dark:text-zinc-200 flex flex-col gap-2.5"
        >
            <li>
                <span class="font-semibold"
                    >{i18n.t({
                        ko: "장신구 등 부상 위험이 있는 물건은 착용할 수 없어요",
                        en: "You cannot wear items that may cause injury, such as jewelry",
                    })}</span
                >
                <span class="text-zinc-600 dark:text-zinc-300">
                    {i18n.t({
                        ko: " — 반지, 시계, 귀걸이, 날카로운 머리핀 등은 착용할 수 없어요. 적발 시 탈거 후 출전 가능해요.",
                        en: " — Rings, watches, earrings, sharp hairpins, etc. are not allowed. May participate after removal.",
                    })}
                </span>
            </li>
            <li>
                <span class="font-semibold"
                    >{i18n.t({
                        ko: "풋살 경기에서 스터드 축구화는 착용할 수 없어요",
                        en: "In futsal matches, studded boots are prohibited",
                    })}</span
                >
                <span class="text-zinc-600 dark:text-zinc-300">
                    {i18n.t({
                        ko: " — FG, HG, AG 등 스터드 축구화는 착용할 수 없어요. 풋살화(TF) 또는 운동화를 착용해주세요.",
                        en: " — FG, HG, AG studs prohibited. Must wear futsal shoes (TF) or sneakers.",
                    })}
                </span>
            </li>
            <li>
                <span class="font-semibold"
                    >{i18n.t({
                        ko: "충분한 준비운동을 해주세요",
                        en: "Adequate warm-up required",
                    })}</span
                >
                <span class="text-zinc-600 dark:text-zinc-300">
                    {i18n.t({
                        ko: " — 승부도 중요하지만 안전이 최우선이에요. 경기 전 준비운동으로 부상을 예방해주세요.",
                        en: " — Safety first! Please warm up before matches to prevent injuries.",
                    })}
                </span>
            </li>
        </ul>
    </section>

    <!-- Notice: Read Full Regulations -->
    <section class="flex flex-col gap-3">
        <p
            class="m-0 text-zinc-500 dark:text-zinc-400 leading-relaxed text-xs sm:text-sm"
        >
            {i18n.t({
                ko: "※ 위 내용은 주요 사항에 대한 요약본이에요. 세부 규정 및 예외 조항을 확인하려면 '규정 전문'을 읽어주세요.",
                en: "※ The above is a summary of key points. Please read the full regulations for detailed rules, exceptions, and additional provisions.",
            })}
        </p>
    </section>
</div>
