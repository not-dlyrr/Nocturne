<script lang="ts">
    import {fly} from "svelte/transition";
    import {cubicOut} from "svelte/easing";
</script>

<div class="option-bar nc-surface" in:fly|global={{duration: 350, y: 12, easing: cubicOut}}>
    <slot />
</div>

<style lang="scss">
    .option-bar {
      position: relative;
      z-index: 2;
      padding: 8px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      border-radius: var(--radius-md);
      margin-bottom: 10px;
    }
</style>
