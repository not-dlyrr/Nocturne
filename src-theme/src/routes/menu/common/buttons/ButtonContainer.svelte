<script lang="ts">
    export let vertical = false;
</script>

<div class="button-container nc-surface" class:vertical>
    <slot />
</div>

<style lang="scss">
    /* santi.glass pill toolbar, solid */
    .button-container {
      padding: 4px;
      width: max-content;
      border-radius: var(--radius-pill);
      display: flex;
      align-items: center;
      column-gap: 2px;

      &.vertical {
        flex-direction: column;
        row-gap: 2px;
      }
    }
</style>
