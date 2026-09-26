<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import GenericSelect from "./GenericSelect.svelte";

    export let options: string[];
    export let values: string[];
    export let title: string;

    const dispatch = createEventDispatcher<{
        change: { values: string[] }
    }>();

    function handleOptionClick(o: string) {
        if (values.includes(o)) {
            values = values.filter(v => v !== o);
        } else {
            values = [...values, o]
        }
        dispatch("change", {values});
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<GenericSelect closeOnInternalClick={false}>
    <svelte:fragment slot="title">
        {title}
    </svelte:fragment>

    <svelte:fragment slot="options">
        {#each options as o}
            <div on:click={() => handleOptionClick(o)} class="option" class:active={values.includes(o)}>
                <span class="mark"><span class="box" class:on={values.includes(o)}></span></span>
                <span class="label">{o}</span>
            </div>
        {/each}
    </svelte:fragment>
</GenericSelect>

<style lang="scss">
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

  .box {
    width: 12px;
    height: 12px;
    border-radius: 4px;
    box-shadow: inset 0 0 0 1px var(--fill-secondary);
    transition: background-color 0.2s ease, box-shadow 0.2s ease;

    &.on {
      background-color: var(--accent);
      box-shadow: none;
    }
  }

  .label {
    pointer-events: none;
  }
</style>
