<script lang="ts">
  import "../app.css";
  import { themeManager } from "$lib/theme.svelte";
  import { i18n, initI18n } from "$lib/i18n.svelte";
  import { untrack } from "svelte";
  let { children, data } = $props();

  // Initialize/Hydrate global i18n manager in context (synchronous for SSR)
  initI18n(untrack(() => data.locale ?? "ko"));

  // Keep i18n manager in sync with server data during navigation
  $effect(() => {
    if (data.locale) {
      i18n.locale = data.locale;
    }
  });
</script>

{@render children()}
