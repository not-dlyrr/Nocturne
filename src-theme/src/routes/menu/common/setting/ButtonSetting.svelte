<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import CircleLoader from "../CircleLoader.svelte";

    export let title: string;
    export let disabled = false;
    export let secondary = false;
    export let inset = false;
    export let listenForEnter = false;
    export let loading = false;

    const dispatch = createEventDispatcher();

    function handleKeyDown(e: KeyboardEvent) {
        if (!listenForEnter) {
            return;
        }
        if (e.key === "Enter") {
            dispatch("click");
        }
    }
</script>

<svelte:window on:keydown={handleKeyDown}/>
<button class="button-setting sg-btn sg-btn-small" class:sg-btn-filled={!secondary} class:sg-btn-tinted={secondary}
        class:inset type="button" on:click={() => dispatch("click")} {disabled}>
    {#if loading}
        <CircleLoader/>
    {/if}
    {title}
</button>

<style lang="scss">
  .button-setting {
    height: 32px;
    min-height: 32px;
    padding: 0 14px;
    font-size: 13px;
    line-height: 18px;
    letter-spacing: -0.08px;
    white-space: nowrap;

    &:not([disabled]):hover {
      filter: brightness(1.08);
    }
  }
</style>
