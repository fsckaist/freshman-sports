<script lang="ts">
    function handleClose() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.close();
        }
    }
</script>

<svelte:head>
    <title>규정 | 새내기 체육 대회</title>
</svelte:head>

<div
    class="relative size-full min-h-screen bg-white dark:bg-zinc-900 overflow-hidden flex justify-center"
>
    <!-- Centered 90rem wrapper so the absolute watermark is properly anchored -->
    <div
        class="relative flex flex-col gap-[1.875rem] h-screen items-start w-full max-w-[90rem] px-[12.5rem] py-[6.25rem]"
    >
        <!-- Glowing Right Side Watermark -->
        <div
            class="absolute -translate-y-1/2 blur-[0.625rem] opacity-20 dark:opacity-10 right-[-12.8125rem] size-[65.3125rem] top-[calc(50%+7.65625rem)] pointer-events-none select-none mix-blend-multiply dark:mix-blend-plus-lighter z-0"
        >
            <img
                src="/logo.png"
                alt="watermark logo"
                class="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
            />
        </div>

        <!-- Title & Button Frame -->
        <div
            class="content-stretch flex items-end justify-between p-[0.625rem] relative shrink-0 w-full z-10"
        >
            <div
                class="content-stretch flex flex-col gap-[0.3125rem] items-start leading-[normal] relative shrink-0 text-zinc-800 dark:text-zinc-100"
            >
                <p
                    class="font-pretendard font-semibold relative shrink-0 text-[1.5rem] m-0"
                >
                    2026 봄학기 새내기 체육 대회
                </p>
                <h1
                    class="font-pretendard font-bold relative shrink-0 text-[4rem] leading-[1.1] m-0"
                >
                    규정
                </h1>
            </div>
            <button
                onclick={handleClose}
                aria-label="Confirm and close"
                class="bg-amber-500 hover:bg-amber-600 active:bg-amber-800 transition-colors cursor-pointer content-stretch flex flex-col items-center justify-center px-[2.1875rem] py-[0.5rem] relative rounded-[6.25rem] shrink-0"
            >
                <span
                    class="font-pretendard font-semibold leading-[normal] relative shrink-0 text-[1.25rem] text-white whitespace-pre-wrap"
                    >확인</span
                >
            </button>
        </div>

        <!-- Scrollable Document Area -->
        <div
            class="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-x-hidden overflow-y-auto p-[0.625rem] relative w-full"
        >
            <div
                class="flex-[1_0_0] font-pretendard font-medium leading-[1.6] min-h-px min-w-px relative text-zinc-800 dark:text-zinc-300 text-[1.25rem] w-full"
            >
                <p class="mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Quisque nibh nisi, blandit nec ultricies ornare, tincidunt
                    eu nibh. Aenean consequat velit nec congue dapibus.
                    Curabitur aliquam metus sit amet nisl viverra, et
                    ullamcorper ipsum pellentesque. Vivamus elementum arcu quis
                    varius fringilla. Phasellus faucibus hendrerit lorem, et
                    auctor dui tristique quis. Nunc convallis suscipit
                    sollicitudin. Nunc tristique in tortor eu pharetra. Nullam
                    feugiat aliquam odio, sit amet dapibus sapien gravida id.
                    Cras ut erat ac tellus venenatis scelerisque interdum eget
                    augue. Ut mattis risus consequat, efficitur tortor at,
                    blandit justo. Etiam non diam vel ligula sodales blandit
                    vitae vitae nunc. Cras vel consectetur elit, in mattis ex.
                    Suspendisse vel malesuada massa. Duis pulvinar libero quam.
                    Orci varius natoque penatibus et magnis dis parturient
                    montes, nascetur ridiculus mus.
                </p>
                <p class="mb-4">
                    Maecenas maximus, elit non consectetur feugiat, nunc leo
                    varius mi, in sollicitudin ipsum magna euismod tortor.
                    Phasellus consequat nunc a dui rutrum, semper posuere felis
                    egestas. Integer varius at elit vel vestibulum. Morbi
                    faucibus, quam sit amet aliquam convallis, dolor mauris
                    sodales mauris, ut consequat dolor leo non augue. Nullam
                    sollicitudin faucibus leo, eget mattis magna feugiat ut.
                    Aliquam id metus vehicula, iaculis magna non, facilisis
                    ipsum. Fusce malesuada ipsum id tortor sagittis, eget
                    dignissim est ultricies.
                </p>
                <p class="mb-4">
                    Aliquam sit amet odio a urna sollicitudin sollicitudin ut a
                    eros. Pellentesque elementum ornare suscipit. Phasellus eget
                    bibendum sapien, nec dapibus sem. Nulla nisl massa, bibendum
                    vitae tincidunt sed, rutrum at justo. Cras et elit eros.
                    Duis ac nisl nisi. Morbi nulla risus, dignissim sed metus
                    sit amet, gravida vestibulum risus. Curabitur venenatis,
                    nisi sit amet tristique tempus, diam nisi laoreet mauris,
                    vitae mattis orci risus sed diam. Nam cursus nisi tortor,
                    non mollis felis imperdiet sit amet. Quisque convallis, arcu
                    non eleifend placerat, eros mauris consectetur purus, in
                    euismod ex velit sit amet enim. Nam pellentesque egestas
                    sodales. Morbi sem ex, vestibulum eu tempor ut, placerat id
                    nulla. Donec aliquet augue sit amet tempor porta. Class
                    aptent taciti sociosqu ad litora torquent per conubia
                    nostra, per inceptos himenaeos.
                </p>
                <p class="mb-4">
                    Curabitur tristique lobortis odio, non faucibus lectus.
                    Integer volutpat magna et tellus rhoncus tincidunt. Nullam
                    efficitur placerat ipsum nec aliquam. Suspendisse potenti.
                    Class aptent taciti sociosqu ad litora torquent per conubia
                    nostra, per inceptos himenaeos. Quisque eget arcu tristique,
                    blandit felis ac, facilisis enim. Aenean ornare volutpat
                    velit ac laoreet. Sed eget molestie mi. Integer congue velit
                    tortor.
                </p>
                <p class="mb-4">
                    Maecenas malesuada, purus et imperdiet facilisis, erat lorem
                    tincidunt sem, non porta ante lorem et elit. Pellentesque
                    interdum diam vitae consequat placerat. Vestibulum eget
                    tristique velit. Lorem ipsum dolor sit amet, consectetur
                    adipiscing elit. Ut ac orci finibus, hendrerit lorem sed,
                    dictum velit. Morbi ultrices massa efficitur ligula aliquet
                    sagittis. Morbi vulputate orci mauris. Etiam nibh est,
                    facilisis eu justo in, tincidunt consectetur eros. Quisque
                    ultricies quam augue, eu suscipit ligula feugiat eget.
                    Suspendisse elementum mattis maximus. Mauris ornare diam
                    lectus, eu maximus velit sodales id. Aliquam et iaculis
                    massa, et commodo nisl. Sed ac commodo nibh. Mauris varius
                    magna vitae sem mattis auctor.
                </p>
                <p class="mb-0">
                    Nunc in suscipit metus. Fusce id pretium erat. Vivamus
                    varius, magna sit amet bibendum accumsan, neque ex cursus
                    mauris, quis iaculis nunc erat quis dui. Curabitur vel
                    mauris sed erat bibendum fringilla dignissim vitae quam.
                    Nulla rhoncus dui mi, et auctor purus euismod sit amet.
                    Curabitur posuere elit at turpis maximus porta. Donec ligula
                    nunc, egestas at fringilla vel, fringilla vel est. Sed porta
                    ligula tristique sem lobortis accumsan. Donec sodales lacus
                    a quam hendrerit iaculis.
                </p>
            </div>
        </div>

        <!-- Sticky Footer -->
        <div
            class="content-stretch flex items-center p-[0.625rem] relative shrink-0 w-full"
        >
            <p
                class="font-pretendard font-medium text-zinc-800 dark:text-zinc-100 m-0 p-0 text-[1.125rem]"
            >
                제23대 새내기학생회 <span class="text-amber-500">샛별</span>
            </p>
        </div>
    </div>
</div>
