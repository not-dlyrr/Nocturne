<script lang="ts">
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();
</script>

<div class="removable-item">
    <slot/>

    <button class="button-remove" title="Remove" on:click={() => dispatch("remove")}>
        <img src="img/clickgui/icon-cross.svg" alt="remove">
    </button>
</div>

<style lang="scss">
  .removable-item {
    display: grid;
    grid-template-columns: 1fr max-content;
    column-gap: 4px;
    align-items: center;
  }

  .button-remove {
    width: 22px;
    height: 22px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background-color: transparent;
    cursor: pointer;
    transition: background-color 0.2s ease;

    img {
      width: 9px;
      height: 9px;
      opacity: 0.7;
    }

    &:hover {
      background-color: color-mix(in srgb, var(--danger) 20%, transparent);
    }
  }
</style>
