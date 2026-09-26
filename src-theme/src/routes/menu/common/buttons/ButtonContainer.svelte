<script lang="ts">
    export let vertical = false;
</script>

<div class="button-container sg-glass sg-glass-strong" class:vertical>
    <slot />
</div>

<style lang="scss">
    /* santi.glass pill toolbar */
    .button-container {
      padding: 6px;
      width: max-content;
      border-radius: var(--radius-pill);
      display: flex;
      align-items: center;
      column-gap: 4px;

      &.vertical {
        flex-direction: column;
        row-gap: 4px;
        padding: 6px;
      }
    }
</style>
