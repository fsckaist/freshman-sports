<script lang="ts">
  import "../app.css";
  import { themeManager } from "$lib/theme.svelte.ts";
  let { children } = $props();
</script>

{@render children()}
