<script lang="ts">
    import ToolTip from "../ToolTip.svelte";
    import {createEventDispatcher} from "svelte";

    export let title: string;
    export let icon: string;

    const dispatch = createEventDispatcher();
</script>

<button class="button" type="button" aria-label={title} on:click={() => dispatch("click")}>
    <ToolTip text={title}/>
    <img class="icon" src="img/menu/icon-{icon}.svg" alt={icon}>
</button>

<style lang="scss">
  .button {
    position: relative;
    width: 28px;
    height: 28px;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    border-radius: 50%;
    background-color: transparent;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.35s cubic-bezier(0.3, 1.4, 0.5, 1);

    &:hover {
      background-color: var(--fill-secondary);
    }

    &:active {
      transform: scale(0.96);
    }
  }

  .icon {
    height: 15px;
    width: 15px;
  }
</style>
