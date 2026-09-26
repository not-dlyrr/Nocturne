<script lang="ts">
    import {slide} from "svelte/transition";
    import {createEventDispatcher} from "svelte";
    import type {ConfigurableSetting, ModuleSetting,} from "../../../integration/types";
    import GenericSetting from "./common/GenericSetting.svelte";
    import ExpandArrow from "./common/ExpandArrow.svelte";
    import {setItem} from "../../../integration/persistent_storage";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";

    export let setting: ModuleSetting;
    export let path: string;
    export let hideExpandControl: boolean = false;

    const cSetting = setting as ConfigurableSetting;
    const thisPath = `${path}.${cSetting.name}`;

    const dispatch = createEventDispatcher();

    function handleChange() {
        setting = {...cSetting};
        dispatch("change");
    }

    let expanded = hideExpandControl ? true : localStorage.getItem(thisPath) === "true";

    $: setItem(thisPath, expanded.toString());

    function toggleExpanded() {
        if (hideExpandControl) {
            return;
        }
        expanded = !expanded;
    }
</script>

<div class="setting">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="head" class:expanded class:clickable={!hideExpandControl}
         on:click={toggleExpanded} on:contextmenu|preventDefault={toggleExpanded}>
        <div class="title">{$spaceSeperatedNames ? convertToSpacedString(setting.name) : setting.name}</div>
        {#if !hideExpandControl}
            <ExpandArrow bind:expanded />
        {/if}
    </div>

    {#if expanded}
        <div class="nested-settings" transition:slide={{duration: 200, axis: "y"}}>
            {#each cSetting.value as setting (setting.name)}
                <GenericSetting path={thisPath} bind:setting on:change={handleChange}/>
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">
  .setting {
    padding: 0;
  }

  .head {
    min-height: 36px;
    padding: 7px 0;
    display: flex;
    align-items: center;
  }

  .head.clickable {
    cursor: pointer;
  }

  .title {
    flex: 1;
    min-width: 0;
    color: var(--label);
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* nested rows: indented under the group head, separated by hairlines that start at the indent */
  .nested-settings {
    margin-left: 2px;
    padding: 0 0 4px 14px;

    > :global(div) {
      box-shadow: inset 0 0.5px 0 var(--separator);
    }
  }
</style>
