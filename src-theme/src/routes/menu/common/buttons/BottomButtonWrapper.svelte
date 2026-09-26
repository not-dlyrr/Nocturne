<script lang="ts">
    import {fly} from "svelte/transition";
    import {cubicOut} from "svelte/easing";
</script>

<div class="bottom-button-wrapper" in:fly|global={{duration: 350, y: 12, easing: cubicOut}}>
    <slot/>
</div>

<style lang="scss">
  .bottom-button-wrapper {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }
</style>
