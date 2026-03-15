<script lang="ts">
  import "../app.css";
  import { themeManager } from "$lib/theme.svelte";
  let { children } = $props();
</script>

{@render children()}
