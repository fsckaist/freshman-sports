<script lang="ts">
  import '../app.css';

  let { children } = $props();
</script>

<div class="relative min-h-screen bg-brand-zinc-100 overflow-clip">
  <!-- Glowing background logo effect simulation based on extracted design (opacity-20 blur-[10px]) -->
  <div class="absolute right-[-205px] top-[50%] blur-[10px] opacity-20 pointer-events-none select-none">
    <div class="size-[1045px] rounded-full bg-brand-orange/30 filter blur-3xl"></div>
  </div>

  <!-- Global Content Container -->
  <div class="absolute w-full h-full inset-0 overflow-y-auto">
    <div class="mx-auto flex w-full max-w-[1440px] items-start my-auto min-h-[900px] h-full justify-center lg:py-[50px]">
      
      <!-- Layout Container -->
      <div class="flex items-stretch bg-transparent h-full w-full relative z-10">
        
        <!-- Left Sidebar (Board) -->
        <aside class="w-[200px] flex-shrink-0 bg-white border border-brand-zinc-200 rounded-l-[30px] flex flex-col py-[50px] shadow-sm relative overflow-hidden">
          
          <!-- Brand -->
          <div class="flex flex-col items-end px-[30px] w-full mb-[30px]">
            <h1 class="font-pretendard font-bold text-[28px] text-brand-black-hard leading-none text-right">
              <span class="block">새내기</span>
              <span class="block">체육 대회</span>
            </h1>
          </div>

          <!-- Navigation Menu -->
          <nav class="flex-1 flex flex-col items-end justify-between pl-[30px] w-full mt-10">
            <!-- General Nav -->
            <ul class="flex flex-col gap-[10px] items-start w-full pr-0">
              <!-- Example Nav Item (Active State) -->
              <li class="w-full">
                <a href="/" class="flex h-[48px] items-center justify-end gap-[10px] rounded-l-[10px] px-[20px] bg-brand-zinc-100 text-brand-zinc-600 transition-colors cursor-pointer w-[170px] ml-auto">
                  <span class="font-pretendard text-[16px]">개요</span>
                </a>
              </li>
              <li class="w-full">
                <a href="/apply" class="flex h-[48px] items-center justify-end gap-[10px] rounded-l-[10px] px-[20px] text-brand-zinc-600 hover:bg-brand-zinc-100/50 transition-colors cursor-pointer w-[170px] ml-auto">
                  <span class="font-pretendard text-[16px]">지원하기</span>
                </a>
              </li>
            </ul>
          </nav>

          <!-- Extra Footer Settings -->
          <div class="flex flex-col items-end px-[30px] w-full text-[12px] mt-[30px] text-brand-zinc-600">
            <div class="flex flex-col items-end gap-[10px] underline mb-[20px]">
              <a href="/info/contact">문의 하기</a>
              <a href="/info/privacy">개인정보 처리방침</a>
            </div>
            <p class="font-medium text-black">
              <span class="text-brand-black-soft">제23대 새내기학생회 </span>
              <span class="text-brand-orange">샛별</span>
            </p>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 bg-transparent p-0 relative overflow-hidden">
          <div class="w-full h-full min-h-px min-w-px py-[50px] px-[30px]">
            {@render children()}
          </div>
        </main>
        
      </div>
    </div>
  </div>
</div>
