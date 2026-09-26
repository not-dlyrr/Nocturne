<script lang="ts">
    import {slide} from "svelte/transition";
    import {createEventDispatcher} from "svelte";
    import type {BooleanSetting as TBooleanSetting, ModuleSetting, TogglableSetting,} from "../../../integration/types";
    import ExpandArrow from "./common/ExpandArrow.svelte";
    import GenericSetting from "./common/GenericSetting.svelte";
    import Switch from "./common/Switch.svelte";
    import {setItem} from "../../../integration/persistent_storage";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";

    export let setting: ModuleSetting;
    export let path: string;

    const cSetting = setting as TogglableSetting;
    const thisPath = `${path}.${cSetting.name}`;

    const dispatch = createEventDispatcher();

    const enabledSetting = cSetting.value[0] as TBooleanSetting;

    let nestedSettings = cSetting.value.slice(1);

    let expanded = localStorage.getItem(thisPath) === "true";

    $: setItem(thisPath, expanded.toString());

    function handleChange() {
        setting = {...cSetting};
        dispatch("change");
    }

    function disable() {
        enabledSetting.value = false;
        handleChange();
    }

    function toggleExpanded() {
        if (nestedSettings.length === 0) return;
        expanded = !expanded;
    }
</script>

<div class="setting">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
            class="head"
            class:expand={nestedSettings.length > 0}
            class:expanded={expanded && nestedSettings.length > 0}
            on:contextmenu|preventDefault={toggleExpanded}
    >
        <slot
                name="control"
                {disable}
                label={$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}
        >
            <Switch
                    name={$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}
                    bind:value={enabledSetting.value}
                    on:change={handleChange}
            />
        </slot>

        {#if nestedSettings.length > 0}
            <ExpandArrow bind:expanded/>
        {/if}
    </div>

    {#if expanded}
        <div class="nested-settings" transition:slide={{duration: 200, axis: "y"}}>
            {#each nestedSettings as setting (setting.name)}
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

  .head > :global(*:first-child) {
    flex: 1;
    min-width: 0;
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
