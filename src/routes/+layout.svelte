<script lang="ts">
  import "../app.css";
  import { themeManager } from "$lib/theme.svelte";
  import { initI18n } from "$lib/i18n.svelte";
  let { children, data } = $props();

  // Initialize/Hydrate global i18n manager in context (synchronous for SSR)
  initI18n(data.locale ?? "ko");
</script>

{@render children()}
