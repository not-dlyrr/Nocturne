<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import GenericSelect from "./GenericSelect.svelte";

    export let options: string[];
    export let value: string;
    export let title: string;

    const dispatch = createEventDispatcher<{
        change: { value: string }
    }>();

    function handleOptionClick(o: string) {
        value = o;
        dispatch("change", {value: o});
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<GenericSelect closeOnInternalClick={true}>
    <span slot="title"><span class="title">{title}</span> {value}</span>

    <svelte:fragment slot="options">
        {#each options as o}
            <div on:click={() => handleOptionClick(o)} class="option" class:active={o === value}>
                <span class="mark">{#if o === value}<span class="dot"></span>{/if}</span>{o}
            </div>
        {/each}
    </svelte:fragment>
</GenericSelect>

<style lang="scss">
  .title {
    font-weight: 400;
    color: var(--label-secondary);
  }

  .option {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 28px;
    padding: 5px 10px 5px 8px;
    border-radius: var(--radius-xs);
    font-size: 13px;
    line-height: 18px;
    color: var(--label);
    white-space: nowrap;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--fill-tertiary);
    }

    &.active {
      color: var(--accent-text);
      font-weight: 600;
    }
  }

  /* leading mark column; pointer-events off so clicks always land on .option (WrappedSetting checks that class) */
  .mark {
    width: 12px;
    flex: none;
    display: flex;
    justify-content: center;
    pointer-events: none;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--accent-text);
  }
</style>
