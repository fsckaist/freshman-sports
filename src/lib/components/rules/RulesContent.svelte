<script lang="ts">
    import { i18n } from "$lib/i18n.svelte";
</script>

<div class="flex flex-col gap-6 w-full leading-relaxed">
    <!-- Chapter 1 -->
    <h3 class="font-bold text-xl m-0">
        {i18n.t({ ko: "제1장 총칙", en: "CHAPTER 1. GENERAL PROVISIONS" })}
    </h3>
    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제1조 (목적)",
                    en: "Article 1 (Purpose)",
                })}</strong
            >
        </p>
        <p class="m-0">
            {i18n.t({
                ko: "본 규정은 2026년도 봄학기 새내기 체육대회를 통하여 KAIST 새내기들의 화합과 친목을 도모하고, 학교와 새터반 내 소속감을 고취시키며, 공정하고 안전한 체육대회 운영을 위한 전반적인 기준과 원칙을 규정함을 목적으로 한다.",
                en: "The purpose of these regulations is to promote harmony and friendship among KAIST freshmen through the 2026 Spring Semester Freshman Sports Day, to enhance the sense of belonging within the school and orientation groups (Saeter-ban), and to establish overall standards and principles for fair and safe event operation.",
            })}
        </p>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제2조 (명칭)",
                    en: "Article 2 (Title)",
                })}</strong
            >
        </p>
        <p class="m-0">
            {i18n.t({
                ko: "본 행사의 공식 명칭은 '2026년도 봄학기 새내기 체육대회' (이하 '본 대회'라 한다)라 칭한다.",
                en: "The official title of this event shall be the '2026 Spring Semester Freshman Sports Day' (hereinafter referred to as 'the Tournament').",
            })}
        </p>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제3조 (일시 및 장소)",
                    en: "Article 3 (Date and Venue)",
                })}</strong
            >
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "본 대회는 2026년 4월 6일부터 2026년 6월 5일까지 카이스트 교내에서 개최한다.",
                    en: "The Tournament shall be held within the KAIST campus from April 6, 2026, to June 5, 2026.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "본 대회의 장소는 종목에 따라 교내 풋살장, 서측 실내 체육관, 스포츠 컴플렉스 주경기장으로 정한다.",
                    en: "The venues for the Tournament shall be the Campus Futsal Court, West Indoor Gymnasium, and the Sports Complex Main Stadium, depending on the sports category.",
                })}
            </li>
        </ol>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제4조 (적용 범위 및 준수 의무)",
                    en: "Article 4 (Scope of Application and Obligation to Comply)",
                })}</strong
            >
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "본 규정은 본 대회에 참여하는 모든 선수, 응원단, 관람객 및 행사를 주관하는 운영진과 심판진 등 본 대회에 직간접적으로 참여하는 모든 인원에게 적용된다.",
                    en: "These regulations apply to all individuals directly or indirectly participating in the Tournament, including all athletes, cheering squads, spectators, and the organizing staff and referees presiding over the event.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "본 대회에 참가하는 모든 인원은 본 규정을 숙지하고 준수할 의무가 있으며, 규정 위반 시 운영위원회의 제재를 받을 수 있다.",
                    en: "All participants in the Tournament have an obligation to be familiar with and comply with these regulations. Violations may result in sanctions imposed by the Organizing Committee.",
                })}
            </li>
        </ol>
    </section>

    <!-- Chapter 2 -->
    <h3 class="font-bold text-xl m-0 mt-4">
        {i18n.t({
            ko: "제2장 조직 및 운영",
            en: "CHAPTER 2. ORGANIZATION AND OPERATION",
        })}
    </h3>
    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제5조 (조직의 구성)",
                    en: "Article 5 (Composition of Organization)",
                })}</strong
            >
        </p>
        <p class="m-0">
            {i18n.t({
                ko: "본 대회의 원활한 진행과 공정한 판정을 위하여 기획 및 실무를 총괄하는 '새내기 체육대회 운영위원회'(이하 '운영위원회'라 한다)와 경기 판정을 전담하는 '심판진'을 각각 구성한다.",
                en: "For the smooth progress and fair judging of the Tournament, a 'Freshmen Sports Festival Steering Committee' (hereinafter referred to as the 'Steering Committee') shall be formed to oversee planning and practical affairs, and a 'Referee Panel' shall be formed exclusively for match officiating.",
            })}
        </p>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제6조 (운영위원회의 구성 및 역할)",
                    en: "Article 6 (Composition and Role of the Organizing Committee)",
                })}</strong
            >
        </p>
        <p class="m-0">
            {i18n.t({
                ko: "운영위원회는 새내기학생회 기획국 산하 새내기 체육대회 팀을 주축으로 한다. 운영위원회는 위원장, 종목별 팀장, 운영위원으로 구성되며, 각 주체의 역할과 권한은 다음과 같다.",
                en: "The Steering Committee is primarily composed of the Freshmen Sports Day Team under the Planning Bureau of the Freshmen Student Council. The Steering Committee consists of a Chairperson, Event Team Leaders, and Steering Committee Members, with the roles and authorities of each party defined as follows:",
            })}
        </p>
        <ul class="list-disc pl-6 m-0">
            <li>
                <strong>{i18n.t({ ko: "위원장:", en: "Chairperson:" })}</strong>
                {i18n.t({
                    ko: "본 대회의 기획 및 운영을 총괄하며, 천재지변이나 돌발 상황 발생 시 행사 중단, 일정 조율 등에 대한 최종 의사결정권을 가진다.",
                    en: "Oversees the overall planning and operation of the Tournament and holds final decision-making authority regarding event suspension or schedule adjustments in case of natural disasters or unexpected situations.",
                })}
            </li>
            <li>
                <strong
                    >{i18n.t({
                        ko: "종목별 팀장:",
                        en: "Category Team Leader:",
                    })}</strong
                >
                {i18n.t({
                    ko: "배정된 특정 경기 종목의 진행 및 운영 실무를 총괄한다.",
                    en: "Oversees the progress and operational practicalities of a specific assigned sports category.",
                })}
            </li>
            <li>
                <strong
                    >{i18n.t({
                        ko: "운영위원:",
                        en: "Operating Member:",
                    })}</strong
                >
                {i18n.t({
                    ko: "종목별 팀장의 지시에 따라 배정된 경기의 기록, 장비 세팅, 인원 확인, 안전 관리 등의 실무를 담당한다.",
                    en: "Responsible for practical tasks such as match recording, equipment setup, attendance verification, and safety management under the direction of the Category Team Leader.",
                })}
            </li>
        </ul>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제7조 (심판진의 구성 및 권한)",
                    en: "Article 7 (Composition and Authority of the Referee Panel)",
                })}</strong
            >
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "심판진은 공정한 경기 진행을 위하여 교내 운동 동아리 소속 등 해당 종목에 대한 이해도가 높은 외부 협력 인원으로 구성한다.",
                    en: "The Referee Panel shall consist of external cooperating personnel with a high understanding of the respective sport, such as members of campus sports clubs, to ensure fair match progression.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "심판진은 배정된 경기장 내에서 발생하는 모든 규칙 적용과 판정에 대하여 독립적이고 절대적인 권한을 가진다.",
                    en: "Referees shall hold independent and absolute authority regarding all rule applications and rulings occurring within the assigned match venue.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "심판진의 판정은 최종적이며, 참가자는 경기 진행 중 심판의 판정에 불복하거나 항의할 수 없다. (이의 제기 절차는 제6장 규정에 따른다.)",
                    en: "The rulings of the Referee Panel are final, and participants may not disobey or protest a referee's decision during the match. (Procedures for filing an objection shall follow the provisions in Chapter 6.)",
                })}
            </li>
        </ol>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제8조 (운영위원회의 면책)",
                    en: "Article 8 (Exemption of the Organizing Committee)",
                })}</strong
            >
        </p>
        <p class="m-0">
            {i18n.t({
                ko: "참가자가 본 규정 및 운영위원회의 지시를 따르지 않아 발생한 사고, 부상, 물품 분실 등에 대해서 운영위는 도의적 책임 외의 법적, 금전적 책임을 지지 않는다.",
                en: "The Organizing Committee shall not bear legal or financial responsibility, other than moral responsibility, for accidents, injuries, or loss of property resulting from a participant's failure to follow these regulations or the instructions of the Organizing Committee.",
            })}
        </p>
    </section>

    <!-- Chapter 3 -->
    <h3 class="font-bold text-xl m-0 mt-4">
        {i18n.t({
            ko: "제3장 참가 자격 및 선수 등록",
            en: "CHAPTER 3. ELIGIBILITY AND ATHLETE REGISTRATION",
        })}
    </h3>
    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제9조 (참가 자격)",
                    en: "Article 9 (Eligibility for Participation)",
                })}</strong
            >
        </p>
        <p class="m-0">
            {i18n.t({
                ko: "본 대회에 선수로 참가할 수 있는 자격은 다음 각 호 중 하나에 해당하는 자로 한정한다.",
                en: "Eligibility to participate as an athlete in the Tournament is limited to those who fall under any of the following:",
            })}
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "2026년도 봄학기 기준 KAIST 새내기과정학부에 소속된 자",
                    en: "Individuals belonging to the KAIST School of Freshman Program as of the Spring Semester of 2026.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "「반도체시스템공학과 새내기의 새내기학생회 사업 참여를 위한 합의서」에 따라 새내기학생회 준회원으로 인정되는 KAIST 반도체시스템공학과에 소속된 자",
                    en: "Individuals belonging to the KAIST Department of Semiconductor System Engineering who are recognized as associate members of the Freshman Student Council under the 「Agreement for the Participation of Semiconductor System Engineering Freshmen in Freshman Student Council Projects」.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "2026년도 기준 각 새터반의 공식적인 프락터로 활동하는 자",
                    en: "Individuals serving as official Proctors for each orientation group (Saeter-ban) as of 2026.",
                })}
            </li>
        </ol>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제10조 (팀 구성 및 참가 인원)",
                    en: "Article 10 (Team Composition and Number of Participants)",
                })}</strong
            >
        </p>
        <p class="m-0">
            {i18n.t({
                ko: "본 대회에 참가하고자 하는 새터반은 종목별로 다음의 인원 기준에 맞춰 팀을 구성해야한다.",
                en: "Orientation groups wishing to participate in the Tournament must form teams according to the following personnel standards for each sport:",
            })}
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                <strong
                    >{i18n.t({
                        ko: "종목별 출전 인원:",
                        en: "Participants per Category:",
                    })}</strong
                >
                <ul class="list-disc pl-6 m-0">
                    <li>
                        {i18n.t({
                            ko: "풋살: 주전 5명, 후보 최대 5명",
                            en: "Futsal: 5 starters, maximum 5 substitutes",
                        })}
                    </li>
                    <li>
                        {i18n.t({
                            ko: "농구: 주전 3명, 후보 최대 5명",
                            en: "Basketball: 3 starters, maximum 5 substitutes",
                        })}
                    </li>
                    <li>
                        {i18n.t({
                            ko: "남자 배드민턴 복식 : 주전 2명, 후보 최대 2명 (남성만 출전 가능)",
                            en: "Men's Badminton Doubles: 2 starters, maximum 2 substitutes (Men only)",
                        })}
                    </li>
                    <li>
                        {i18n.t({
                            ko: "여자 배드민턴 복식 : 주전 2명, 후보 최대 2명 (여성만 출전 가능)",
                            en: "Women's Badminton Doubles: 2 starters, maximum 2 substitutes (Women only)",
                        })}
                    </li>
                </ul>
            </li>
            <li>
                <strong
                    >{i18n.t({
                        ko: "최소 인원:",
                        en: "Minimum Personnel:",
                    })}</strong
                >
                {i18n.t({
                    ko: "각 종목별 주전 인원은 반드시 충족되어야 하며, 출전 인원이 주전 인원보다 적을 경우 해당 새터반은 해당 종목에서 몰수패 처리한다.",
                    en: "The starting personnel for each sport must be met. If the number of participants is fewer than the required starting personnel, the respective orientation group shall be forfeited for that sport.",
                })}
            </li>
        </ol>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제11조 (선수 등록 및 명단 제출)",
                    en: "Article 11 (Athlete Registration and Submission of Roster)",
                })}</strong
            >
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "각 팀은 4월 10일 23시 59분까지 운영위원회가 배포한 지정 양식에 맞추어 출전 선수 명단을 제출해야 한다.",
                    en: "Each team must submit its participant roster by April 10, 23:59, using the designated format distributed by the Organizing Committee.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "출전 신청은 개별 신청이 원칙이며, 희망자 본인이 직접 수행해야한다.",
                    en: "Participation applications must, in principle, be submitted individually by the applicant themselves.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "제출 기한 이후 3일까지는 해당 반 프락터의 공식적인 요청이 있는 경우 운영위원회의 승인을 받아 명단을 수정할 수 있다.",
                    en: "Rosters may be modified within 3 days after the submission deadline upon the official request of the respective group's Proctor and approval by the Organizing Committee.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "전항의 기한이 지난 후 결원이 발생할 경우, 원칙적으로 후보 선수 내에서만 교체 가능하다. 다만, 부상·질병 등 불가피한 사유가 있는 경우, 해당 팀의 다음 경기 일정이 확정되기 전에 한하여 운영위원회에 증빙 서류를 제출하고 승인을 얻어 명단을 수정할 수 있다.",
                    en: "If a vacancy occurs after the aforementioned period, replacement is, in principle, only possible from the registered substitutes. However, in cases of unavoidable reasons such as injury or illness, the roster may be modified by submitting evidentiary documents to the Organizing Committee and obtaining approval before the schedule for the team's next match is confirmed.",
                })}
            </li>
        </ol>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제12조 (부정 선수 및 징계)",
                    en: "Article 12 (Ineligible Athletes and Disciplinary Action)",
                })}</strong
            >
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "다음 각 호에 해당하는 자를 '부정 선수'로 규정한다.",
                    en: "Individuals falling under any of the following shall be defined as 'Ineligible Athletes':",
                })}
                <ul class="list-disc pl-6 m-0">
                    <li>
                        {i18n.t({
                            ko: "제9조의 참가 자격을 충족하지 않은 자",
                            en: "Individuals who do not meet the eligibility requirements of Article 9.",
                        })}
                    </li>
                    <li>
                        {i18n.t({
                            ko: "사전에 등록되지 않은 자",
                            en: "Individuals who were not registered in advance.",
                        })}
                    </li>
                    <li>
                        {i18n.t({
                            ko: "타인의 이름으로 대리 출전한 자",
                            en: "Individuals participating under another person's name (substitution).",
                        })}
                    </li>
                </ul>
            </li>
            <li>
                {i18n.t({
                    ko: "부정 선수가 경기에 출전한 사실이 적발될 경우, 해당 경기는 즉시 몰수패 처리하며, 해당 팀은 대회 종합 우승 평가 등에서 감점을 받는 등 추가 징계를 받을 수 있다.",
                    en: "If an ineligible athlete is found to have participated in a match, the respective match shall be immediately forfeited, and the team may face additional disciplinary actions, such as point deductions in the overall tournament rankings.",
                })}
            </li>
        </ol>
    </section>

    <!-- Chapter 4 -->
    <h3 class="font-bold text-xl m-0 mt-4">
        {i18n.t({
            ko: "제4장 경기 진행 및 승패 결정",
            en: "CHAPTER 4. MATCH PROGRESSION AND DETERMINATION OF WINNER",
        })}
    </h3>
    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제13조 (경기 종목)",
                    en: "Article 13 (Sports Categories)",
                })}</strong
            >
        </p>
        <p class="m-0">
            {i18n.t({
                ko: "본 대회는 다음 각 호의 정식 종목으로 진행된다.",
                en: "The Tournament shall consist of the following official sports:",
            })}
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>{i18n.t({ ko: "풋살", en: "Futsal" })}</li>
            <li>{i18n.t({ ko: "농구", en: "Basketball" })}</li>
            <li>
                {i18n.t({
                    ko: "남자 배드민턴 복식",
                    en: "Men's Badminton Doubles",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "여자 배드민턴 복식",
                    en: "Women's Badminton Doubles",
                })}
            </li>
        </ol>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제14조 (경기 종목별 진행 일정 및 장소)",
                    en: "Article 14 (Schedule and Venue per Category)",
                })}</strong
            >
        </p>
        <p class="m-0">
            {i18n.t({
                ko: "본 대회의 모든 경기는 2026년 4월 27일 ~ 2026년 6월 5일 사이에 진행하며, 장소는 종목별로 다음과 같다.",
                en: "All matches of the Tournament shall take place between April 27, 2026, and June 5, 2026, at the following venues:",
            })}
        </p>
        <ul class="list-disc pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "풋살: 교내 풋살장 A, B코트",
                    en: "Futsal: Campus Futsal Courts A and B",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "농구: 서측 실내 체육관",
                    en: "Basketball: West Indoor Gymnasium",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "배드민턴: 스포츠 컴플렉스 주경기장 A, B구역",
                    en: "Badminton: Sports Complex Main Stadium Sections A and B",
                })}
            </li>
        </ul>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제15조 (경기 진행 방식 및 일정 협의)",
                    en: "Article 15 (Match Format and Schedule Negotiation)",
                })}</strong
            >
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "본 대회의 모든 종목은 각 새터반 당 1팀씩 출전하는 31강 단판 토너먼트 방식으로 진행된다. 패배한 팀은 즉시 탈락하며, 승리한 팀은 다음 경기에 진출한다.",
                    en: "All sports in the Tournament shall follow a 31-team single-elimination tournament format, with one team per orientation group. Losing teams are eliminated immediately, and winning teams advance to the next round.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "대진표에 따라 맞붙게 되는 두 팀은 운영위원회가 사전에 공지한 경기 가능 시간표 내에서 일정을 상호 협의하여 기한 내에 경기 일시를 확정해야 한다.",
                    en: 'The two teams facing each other according to the bracket must mutually negotiate and confirm the match date and time within the "available match time slots" previously announced by the Organizing Committee.',
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "일정 협의가 완료되면 각 팀은 경기 진행일 기준 최소 3일 전까지 운영위원회에 확정된 일정을 통보해야 한다.",
                    en: "Once the schedule negotiation is complete, each team must notify the Organizing Committee of the confirmed schedule at least 3 days prior to the match date.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "정해진 기한 내에 두 팀이 일정 합의에 실패하거나 통보하지 않을 경우, 운영위원회가 각 반 참여 선수들의 일정을 고려하여 임의로 경기 시간을 지정할 수 있으며, 해당 시간에 출전하지 못하는 팀은 기권 처리한다.",
                    en: "If two teams fail to reach an agreement or fail to notify the Committee within the deadline, the Organizing Committee may arbitrarily designate a match time considering the schedules of the participating students. Teams unable to participate at that time shall be treated as having withdrawn.",
                })}
            </li>
        </ol>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제16조 (종목별 경기 시간 및 코트 운영)",
                    en: "Article 16 (Match Duration and Court Operation per Category)",
                })}</strong
            >
        </p>
        <p class="m-0">
            {i18n.t({
                ko: "본 대회의 모든 경기는 인원 확인 및 결과 확정을 포함하여 한 경기당 1시간을 배정하며, 원활한 진행을 위해 구장 내 여러 코트에서 동시에 경기를 진행할 수 있다. 종목별 세부 기준은 다음과 같다.",
                en: "Every match is allocated 1 hour, including identity verification and result confirmation. To ensure smooth progression, matches may be conducted simultaneously on multiple courts. Detailed standards are as follows:",
            })}
        </p>
        <ul class="list-disc pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "풋살: 전·후반 각 15분, 휴식 5분 / A코트 및 B코트 활용",
                    en: "Futsal: Two 15-minute halves, 5-minute break / Utilization of Courts A and B",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "농구: 전·후반 각 10분, 휴식 5분 / 서측 체육관 반 코트 양쪽 활용",
                    en: "Basketball: Two 10-minute halves, 5-minute break / Utilization of both sides of the West Gymnasium half-courts",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "배드민턴: 3세트 2선승제 / 스포츠 컴플렉스 내 가용 코트 전체 활용",
                    en: "Badminton: Best of 3 sets / Utilization of all available courts in the Sports Complex",
                })}
            </li>
        </ul>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제17조 (세부 경기 규칙)",
                    en: "Article 17 (Detailed Match Rules)",
                })}</strong
            >
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "각 종목별 파울, 득점 등 세부적인 경기 규칙은 다음 각 호의 공식 협회 규정을 준용한다. 다만, 본 규정에 별도로 명시된 대회 자체 규칙이 있는 경우 이를 최우선으로 적용한다.",
                    en: "Detailed match rules regarding fouls, scoring, etc., for each sport shall conform to the official association regulations listed below. However, if there are Tournament-specific rules explicitly stated in these regulations, they shall take precedence.",
                })}
                <ul class="list-disc pl-6 m-0 mt-1">
                    <li>
                        {i18n.t({
                            ko: "풋살: 대한축구협회 「풋살 경기 규칙 2024-25」",
                            en: "Futsal: Korea Football Association 「Futsal Laws of the Game 2024-25」",
                        })}
                    </li>
                    <li>
                        {i18n.t({
                            ko: "농구: 대한민국농구협회 「2026 FIBA 3X3 농구 규칙서」",
                            en: "Basketball: Korea Basketball Association 「2026 FIBA 3x3 Basketball Rules」",
                        })}
                    </li>
                    <li>
                        {i18n.t({
                            ko: "배드민턴: 대한배드민턴협회 「2025 배드민턴 경기규정」",
                            en: "Badminton: Badminton Korea Association 「2025 Badminton Regulations」",
                        })}
                    </li>
                </ul>
            </li>
            <li>
                {i18n.t({
                    ko: "경기장 내에서 발생하는 파울, 득점 등 세부 경기 규칙에 대한 해석 및 판정 권한은 전적으로 해당 경기의 심판에게 있으며, 어떠한 경우에도 번복될 수 없다.",
                    en: "Authority over the interpretation and ruling of detailed match rules (fouls, scoring, etc.) occurring within the venue lies entirely with the referee of the respective match and cannot be overturned under any circumstances.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "참가 자격, 경기 일정 조율, 지각 및 몰수패 처리 등 대회 운영 전반에 관한 규칙 해석 및 최종 결정 권한은 운영위원회에 있다.",
                    en: "Final decision-making authority and interpretation of rules regarding overall tournament operation, such as eligibility, schedule coordination, tardiness, and forfeits, lie with the Organizing Committee.",
                })}
            </li>
        </ol>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제18조 (경기 일정의 진행 및 조율)",
                    en: "Article 18 (Management and Coordination of Match Schedule)",
                })}</strong
            >
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "모든 경기는 사전에 공지된 시간표에 따라 진행된다. 각 팀의 출전 선수는 해당 경기 배정 시간의 정각까지 경기장에 도착해야 하며, 배정 시간 시작 시점으로부터 10분간 운영위원의 출석 및 인원 확인을 마친 후 본 경기를 진행한다.",
                    en: "All matches shall proceed according to the pre-announced timetable. Participants must arrive at the venue by the sharp start of their assigned time slot. The match shall proceed after 10 minutes of attendance and personnel verification by the Operating Member.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "앞 경기의 지연, 기상 악화 등 불가피한 사유 발생 시, 종목별 팀장 및 위원장의 판단하에 경기 시간을 단축하거나 일정을 새로 조율할 수 있다.",
                    en: "In case of unavoidable reasons such as delays in previous matches or severe weather, the Category Team Leader or Chairperson may shorten match times or re-coordinate the schedule.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "전항의 일정 조율 과정에는 해당 경기의 담당 운영위원, 심판, 그리고 각 팀의 대표자가 참여하여 협의하며, 일정이 확정되는 즉시 관련 인원 모두에게 통지하여야 한다. 단, 협의 과정에서 운영 위원 및 심판은 가용 가능한 다른 인원으로 교체될 수 있다.",
                    en: "During the schedule coordination process mentioned above, the assigned Operating Member, referee, and representatives of each team shall participate in negotiations. All relevant personnel must be notified as soon as the schedule is confirmed. Referees or Operating Members may be replaced with other available personnel during the negotiation.",
                })}
            </li>
        </ol>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제19조 (지각 및 차등 패널티 부여)",
                    en: "Article 19 (Tardiness and Graduated Penalties)",
                })}</strong
            >
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "제17조에 명시된 출석 및 인원 확인 시간(해당 경기 배정 시간의 시작 시점으로부터 10분) 이내에 경기장에 도착하여 확인을 마친 팀은 지각으로 간주하지 않으며, 정상적으로 경기를 진행한다.",
                    en: "Teams that arrive and complete verification within the attendance check period (10 minutes from the start of the assigned time slot) as specified in Article 17 shall not be considered late and will proceed normally.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "경기 배정 시간의 시작 시점으로부터 10분을 초과하여 도착하거나, 해당 시점 이후에 최소 출전 인원을 충족한 팀에 대해서는 지각 시간에 따라 다음 각 호의 패널티를 차등 적용한다.",
                    en: "For teams arriving more than 10 minutes late or meeting the minimum personnel requirement only after that point, the following penalties shall be applied based on the duration of the delay:",
                })}
                <ul class="list-disc pl-6 m-0">
                    <li>
                        {i18n.t({
                            ko: "지각 시간이 10분 초과 15분 이하인 경우: 해당 경기의 선공권 및 서브권을 상대 팀에게 양도한다.",
                            en: "Delay of 10 to 15 minutes: The right to first possession or serve shall be transferred to the opposing team.",
                        })}
                    </li>
                    <li>
                        {i18n.t({
                            ko: "지각 시간이 15분 초과 20분 이하인 경우: 배드민턴은 첫 세트를 몰수패로 처리하며, 풋살 및 농구는 최소 출전 인원 규정의 적용을 예외로 두고 전반전에 한하여 지각한 선수를 제외한 인원만으로 경기를 진행한다. 단, 원활한 경기 진행이 불가능하다고 심판이 판단하는 경우 운영위원은 해당 경기를 몰수패 처리할 수 있다.",
                            en: "Delay of 15 to 20 minutes: In Badminton, the first set is forfeited. In Futsal and Basketball, the minimum personnel requirement is waived for the first half, and the match proceeds only with the members present. However, if the referee determines that a smooth match is impossible, the Operating Member may forfeit the match.",
                        })}
                    </li>
                    <li>
                        {i18n.t({
                            ko: "지각 시간이 20분을 초과하는 경우: 해당 경기를 전체 몰수패로 처리한다.",
                            en: "Delay of more than 20 minutes: The entire match shall be forfeited.",
                        })}
                    </li>
                </ul>
            </li>
            <li>
                {i18n.t({
                    ko: "양 팀 모두 지각 시간이 20분을 초과하거나, 최소 출전 인원을 충족하지 못하여 몰수패 조건에 해당하는 경우, 해당 경기는 양 팀 모두 기권 처리하며 다음 라운드 진출 팀은 없는 것으로 한다.",
                    en: "If both teams are more than 20 minutes late or fail to meet the minimum personnel requirement, the match shall be treated as a withdrawal for both teams, and no team shall advance to the next round.",
                })}
            </li>
        </ol>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제20조 (경기 결과 확인)",
                    en: "Article 20 (Confirmation of Match Results)",
                })}</strong
            >
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "경기가 종료된 직후, 각 팀의 대표자 1인은 운영위원으로부터 경기 결과가 적힌 기록표를 확인하고, 심판으로부터 주요 판정 결과에 대한 설명을 들을 수 있다. 단, 이는 판정 결과 확인을 위한 절차이며 심판의 주관적 판정에 대한 불복이나 논쟁의 수단이 될 수 없다.",
                    en: "Immediately following the conclusion of a match, one representative from each team shall review the scoresheet recorded by the Operating Member and may receive an explanation of key rulings from the referee. This is a procedure for confirming results and shall not be used as a means of protest or argument against the referee's subjective judgment.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "확인 결과 이상이 없을 경우, 각 팀의 대표자 1인은 기록표를 운영위원회가 정한 방법(서명 또는 디지털 승인 등)으로 최종 승인하는 과정을 거쳐야하며, 승인된 기록지는 공식적인 경기 결과로 간주된다.",
                    en: "If there are no discrepancies, the representative must provide final approval of the scoresheet through the method designated by the Organizing Committee (signature, digital approval, etc.). Approved scoresheets are considered official results.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "승인을 거부할 경우, 해당 팀은 반드시 그 사유를 현장에서 운영위원회에 구두로 소명해야 한다. 운영위원회가 그 사유가 타당하지 않다고 판단하거나 소명을 거부할 시에는 기록지상의 결과를 그대로 확정한 것으로 간주한다.",
                    en: "If approval is refused, the team must verbally explain the reason to the Organizing Committee on-site. If the Committee determines the reason is invalid or if the team refuses to explain, the result on the scoresheet shall be considered confirmed.",
                })}
            </li>
        </ol>
    </section>

    <!-- Chapter 5 -->
    <h3 class="font-bold text-xl m-0 mt-4">
        {i18n.t({
            ko: "제5장 안전·의료 및 경기 용품",
            en: "CHAPTER 5. SAFETY, MEDICAL SUPPORT, AND EQUIPMENT",
        })}
    </h3>
    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제21조 (복장·장비 및 참가자의 안전 의무)",
                    en: "Article 21 (Attire, Equipment, and Safety Obligations of Participants)",
                })}</strong
            >
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "본 대회에 참가하는 모든 선수는 본인의 신체적 상태를 스스로 판단하여 경기에 임해야 하며, 경기 전 충분한 준비운동을 실시하여 부상을 예방할 의무를 가진다.",
                    en: "All athletes participating in the Tournament must judge their own physical condition and have the obligation to prevent injuries by performing sufficient warm-up exercises before the match.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "모든 선수는 타인에게 상해를 입힐 수 있는 장신구(반지, 시계, 귀걸이, 날카로운 머리핀 등)를 착용한 채로 경기에 출전할 수 없다. 적발 시 탈거 후 출전 가능하다.",
                    en: "Athletes may not participate in a match wearing jewelry or accessories that could cause injury to others (rings, watches, earrings, sharp hairpins, etc.). They may participate only after removing such items.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "풋살 종목 참가자는 부상 방지 및 구장 보호를 위해 스터드가 있는 축구화(FG, HG, AG 등) 착용이 금지되며, 반드시 풋살화(TF) 또는 일반 운동화를 착용해야 한다. 이를 위반할 경우 경기에 출전할 수 없다.",
                    en: "Futsal participants are prohibited from wearing football boots with studs (FG, HG, AG, etc.) to prevent injuries and protect the pitch, and must wear futsal shoes (TF) or regular sneakers. If violated, they cannot participate in the match.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "참가자는 본인의 안전과 원활한 경기 진행을 위해 심판진 및 운영위원회의 지시에 적극적으로 순응해야 한다.",
                    en: "Participants must actively comply with the instructions of the Referee Panel and the Organizing Committee for their own safety and the smooth progression of the event.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "배드민턴 종목 참가자는 개인 라켓을 지참하여 경기에 참여하는 것을 원칙으로 한다. 다만, 개인 라켓을 지참하지 못한 선수에 한하여 운영위원회에서 구비된 라켓을 대여할 수 있다.",
                    en: "Badminton participants must bring their own personal rackets. Rackets are not available for rent at the venue, and those without a racket cannot participate in the match.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "풋살공, 농구공, 조끼, 셔틀콕 등 경기 진행에 필요한 공용 물품은 운영위원회에서 제공한다.",
                    en: "The Organizing Committee provides common items necessary for match progression, such as futsal balls, basketballs, vests, and shuttlecocks.",
                })}
            </li>
        </ol>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제22조 (의료 지원 및 응급 상황 대처)",
                    en: "Article 22 (Medical Support and Emergency Response)",
                })}</strong
            >
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "운영위원회는 대회 기간 동안 구급상자를 본부에 상시 비치한다.",
                    en: "The Organizing Committee shall maintain a first-aid kit at the headquarters throughout the Tournament period.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "경기 중 찰과상 등 경미한 부상이 발생한 경우, 운영위원은 비치된 구급약품을 활용하여 기초적인 응급처치를 제공한다.",
                    en: "In case of minor injuries such as abrasions, the Operating Member shall provide basic first aid using the available medical supplies.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "중대한 부상이나 응급 상황 발생 시, 해당 경기의 운영위원은 즉시 경기를 중단하고 119 구급대 호출 및 환자의 지정 병원 이송 등 필요한 초동 조치를 신속하게 취해야 한다.",
                    en: "In the event of a serious injury or emergency, the Operating Member must immediately stop the match and take prompt initial action, such as calling 119 emergency services and transporting the patient to a designated hospital.",
                })}
            </li>
        </ol>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제23조 (부상 발생 시 경기 진행)",
                    en: "Article 23 (Match Progression in Case of Injury)",
                })}</strong
            >
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "경기 중 선수의 부상이 발생할 경우, 해당 경기의 심판 및 운영위원은 선수의 보호를 위해 즉시 경기를 중단시킬 수 한다.",
                    en: "If an injury occurs during a match, the referee and Operating Member may immediately stop the match for the protection of the athlete.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "부상 선수의 상태 확인 및 응급처치에 소요되는 시간을 경기 시간에 포함할지 여부는 해당 종목 심판의 재량에 따라 결정한다.",
                    en: "Whether to include the time spent on injury assessment and first aid in the match time shall be determined at the discretion of the respective referee.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "부상으로 인해 선수가 경기를 속행하기 어렵다고 심판이 판단하는 경우, 사전에 등록된 예비 선수와 교체하여 경기를 진행할 수 있다.",
                    en: "If the referee determines it is difficult for the injured athlete to continue, they may be replaced by a pre-registered substitute.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "교체할 예비 선수가 없어 종목별 최소 출전 인원에 미달하게 되는 경우, 해당 팀은 다음 각 호 중 하나를 선택하여야 한다.",
                    en: "If a team falls below the minimum personnel requirement due to a lack of substitutes, the team must choose one of the following:",
                })}
                <ul class="list-disc pl-6 m-0">
                    <li>
                        {i18n.t({
                            ko: "부족한 인원 그대로 해당 경기를 끝까지 속행한다. 단, 원활한 경기 진행이 불가능하다고 심판이 판단하는 경우 운영위원은 경기를 강제 종료 및 몰수패 처리할 수 있다.",
                            en: "Continue the match until the end with the remaining personnel. However, if the referee determines that smooth progression is impossible, the Operating Member may forcibly end and forfeit the match.",
                        })}
                    </li>
                    <li>
                        {i18n.t({
                            ko: "해당 경기를 포기하고 기권 처리한다.",
                            en: "Forfeit the match and treat it as a withdrawal.",
                        })}
                    </li>
                </ul>
            </li>
        </ol>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제24조 (책임 소재 및 면책)",
                    en: "Article 24 (Liability and Indemnification)",
                })}</strong
            >
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "본 대회는 참가자의 안전을 위해 기초적인 응급처치를 지원하나, 대회 자체적으로 행사 배상책임보험 및 상해보험에 가입하지 않는다.",
                    en: "While the Tournament provides basic first aid for safety, the event does not provide liability or injury insurance.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "경기 및 행사 도중 발생한 부상에 대한 1차적인 책임은 참가자 본인에게 있으며, 치료에 소요되는 병원비 등 일체의 비용은 참가자 개인의 건강보험 및 실손의료보험 등을 통해 개별적으로 처리하여야 한다.",
                    en: "Primary responsibility for injuries occurring during matches or the event lies with the participant, and all costs, such as hospital fees, must be handled individually through the participant's own health insurance or private medical insurance.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "참가자가 제19조의 안전 의무를 위반하거나, 심판 및 운영위원회의 통제를 벗어난 개인적인 행동, 지병 등으로 인해 발생한 사고에 대하여 운영위원회는 기초적인 초동 조치 외의 어떠한 법적, 도의적, 금전적 책임을 지지 않는다.",
                    en: "The Organizing Committee shall not bear any legal, moral, or financial responsibility—other than basic initial response—for accidents caused by a participant's violation of safety obligations (Article 19), personal actions outside the control of the referees/Committee, or pre-existing medical conditions.",
                })}
            </li>
        </ol>
    </section>

    <!-- Chapter 6 -->
    <h3 class="font-bold text-xl m-0 mt-4">
        {i18n.t({
            ko: "제6장 이의 제기 및 징계",
            en: "CHAPTER 6. OBJECTIONS AND DISCIPLINARY ACTIONS",
        })}
    </h3>
    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제25조 (이의 제기 절차)",
                    en: "Article 25 (Objection Procedure)",
                })}</strong
            >
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "경기 결과 또는 운영 과정에 대해 이의가 있는 팀은 해당 팀의 프락터를 통해 운영위원회에 공식적으로 이의를 제기할 수 있다. 단, 프락터 부재 시 해당 팀의 대표자 1인이 이를 대행할 수 있다.",
                    en: "A team wishing to object to match results or operational processes may officially file an objection to the Organizing Committee through the team's Proctor. In the absence of a Proctor, one representative of the team may act on their behalf.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "모든 이의 제기는 해당 경기가 종료된 시점으로부터 30분 이내에 운영위원회에 구두 또는 서면으로 전달되어야 한다. 해당 시간이 경과한 후의 이의 제기는 원칙적으로 효력을 상실한다. 단, 제19조에 따라 경기 기록표를 승인한 경우, 기록지에 명시된 사실 관계에 대한 이의 제기는 원칙적으로 불가능하며, 규정 적용의 오류나 부정 선수 적발 등에 한하여 이의를 제기할 수 있다.",
                    en: "All objections must be delivered verbally or in writing to the Organizing Committee within 30 minutes of the conclusion of the match. Objections filed after this time are, in principle, void. However, if a match scoresheet has been approved under Article 19, objections regarding facts stated on the sheet are impossible; objections may only be filed regarding errors in rule application or the discovery of ineligible athletes.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "운영위원회는 제기된 이의에 대해 심판진과 협의하여 신속하게 판정하며, 필요한 경우 관련자 청문이나 자료(기록지 등) 확인을 거쳐 최종 결정을 내린다.",
                    en: "The Organizing Committee shall consult with the Referee Panel to make a prompt ruling and may conduct hearings or review materials (scoresheets, etc.) if necessary.",
                })}
            </li>
        </ol>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제26조 (이의 제기의 범위 및 한계)",
                    en: "Article 26 (Scope and Limits of Objection)",
                })}</strong
            >
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "제16조 제2항에 따라, 경기 중 발생한 심판의 주관적인 판정(파울 유무, 아웃 판정, 득점 인정 등)에 대해서는 원칙적으로 이의를 제기할 수 없다.",
                    en: "Pursuant to Article 16, Paragraph 2, objections cannot, in principle, be raised against the subjective judgments of the referee (fouls, out-of-bounds, scoring, etc.).",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "이의 제기는 다음 각 호의 경우로 한정한다.",
                    en: "Objections are limited to the following cases:",
                })}
                <ul class="list-disc pl-6 m-0">
                    <li>
                        {i18n.t({
                            ko: "상대 팀의 부정 선수 기용이 의심되는 경우",
                            en: "Suspicion of the opposing team using an ineligible athlete.",
                        })}
                    </li>
                    <li>
                        {i18n.t({
                            ko: "경기 규칙이 규정집과 다르게 잘못 적용된 경우",
                            en: "Incorrect application of match rules contrary to the regulation book.",
                        })}
                    </li>
                    <li>
                        {i18n.t({
                            ko: "점수 기록이나 대진표 운영상 명백한 행정적 오류가 발생한 경우",
                            en: "Obvious administrative errors in score recording or bracket management.",
                        })}
                    </li>
                </ul>
            </li>
        </ol>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제27조 (비매너 행위 및 징계)",
                    en: "Article 27 (Unsportsmanlike Conduct and Sanctions)",
                })}</strong
            >
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "운영위원회는 대회의 건전한 분위기를 저해하는 다음 각 호의 행위를 '비매너 행위'로 규정하고 징계를 부과할 수 있다.",
                    en: "The Organizing Committee defines the following acts as 'Unsportsmanlike Conduct' and may impose sanctions:",
                })}
                <ul class="list-disc pl-6 m-0">
                    <li>
                        {i18n.t({
                            ko: "심판 또는 운영위원에 대한 과도한 폭언, 욕설 및 위협 행위",
                            en: "Excessive verbal abuse, swearing, or threatening behavior toward referees or Operating Members.",
                        })}
                    </li>
                    <li>
                        {i18n.t({
                            ko: "상대 팀 선수나 관중을 향한 모욕적인 언행 및 도발",
                            en: "Insulting remarks or provocations toward opposing athletes or spectators.",
                        })}
                    </li>
                    <li>
                        {i18n.t({
                            ko: "고의적인 경기 지연 또는 경기장 기물 파손",
                            en: "Intentional delay of the match or damage to venue equipment.",
                        })}
                    </li>
                    <li>
                        {i18n.t({
                            ko: "스포츠 정신에 어긋나는 과도한 몸싸움 및 폭력 행위",
                            en: "Excessive physical altercations or violence contrary to the spirit of sportsmanship.",
                        })}
                    </li>
                </ul>
            </li>
            <li>
                {i18n.t({
                    ko: "비매너 행위 적발 시 운영위원회는 사안의 경중에 따라 다음 각 호의 징계를 단독 또는 병과하여 내릴 수 있다.",
                    en: "Upon discovery of unsportsmanlike conduct, the Organizing Committee may impose the following sanctions individually or in combination, depending on the severity:",
                })}
                <ul class="list-disc pl-6 m-0">
                    <li>
                        <strong
                            >{i18n.t({
                                ko: "주의 및 경고:",
                                en: "Caution and Warning:",
                            })}</strong
                        >
                        {i18n.t({
                            ko: "현장에서 구두 주의 또는 팀 경고 부여",
                            en: "On-site verbal caution or team warning.",
                        })}
                    </li>
                    <li>
                        <strong
                            >{i18n.t({
                                ko: "해당 경기 패배:",
                                en: "Match Loss:",
                            })}</strong
                        >
                        {i18n.t({
                            ko: "해당 경기를 즉시 기권(몰수패) 처리",
                            en: "Immediate forfeiture of the respective match.",
                        })}
                    </li>
                    <li>
                        <strong
                            >{i18n.t({
                                ko: "대회 퇴출:",
                                en: "Expulsion:",
                            })}</strong
                        >
                        {i18n.t({
                            ko: "해당 팀의 잔여 경기 출전권을 박탈",
                            en: "Stripping the team of its right to participate in remaining matches.",
                        })}
                    </li>
                </ul>
            </li>
        </ol>
    </section>

    <section class="flex flex-col gap-2">
        <p class="m-0">
            <strong
                >{i18n.t({
                    ko: "제28조 (최종 결정의 효력)",
                    en: "Article 28 (Effect of Final Decisions)",
                })}</strong
            >
        </p>
        <ol class="list-decimal pl-6 m-0">
            <li>
                {i18n.t({
                    ko: "운영위원회가 내린 최종 결정은 본 대회와 관련하여 최고 권위를 가지며, 모든 참가 팀은 이에 승복해야 한다.",
                    en: "Final decisions made by the Organizing Committee hold the highest authority regarding the Tournament, and all participating teams must comply.",
                })}
            </li>
            <li>
                {i18n.t({
                    ko: "결정 사항에 대해 재차 항의하거나 경기 진행을 방해하는 경우, 운영위원회는 해당 팀에게 추가적인 감점이나 참가 제한 등의 강력한 조치를 취할 수 있다.",
                    en: "If a team continues to protest a decision or disrupts the progress of the Tournament, the Organizing Committee may take strong measures, such as additional point deductions or restrictions on future participation.",
                })}
            </li>
        </ol>
    </section>
</div>
