<script>
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="draggable-item" on:dragstart|preventDefault>
    <img src="img/clickgui/icon-drag.svg" alt="drag" draggable="false">

    <slot />
</div>

<style lang="scss">
  .draggable-item {
    display: grid;
    grid-template-columns: max-content 1fr;
    column-gap: 6px;
    align-items: center;
    cursor: grab;

    > img {
      width: 12px;
      opacity: 0.5;
    }

    :global(img) {
      -webkit-user-drag: none;
      user-select: none;
    }
  }
</style>
