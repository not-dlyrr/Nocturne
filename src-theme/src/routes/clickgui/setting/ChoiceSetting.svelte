<script lang="ts">
    import {slide} from "svelte/transition";
    import {createEventDispatcher} from "svelte";
    import type {ChoiceSetting, ModuleSetting,} from "../../../integration/types";
    import ExpandArrow from "./common/ExpandArrow.svelte";
    import GenericSetting from "./common/GenericSetting.svelte";
    import {setItem} from "../../../integration/persistent_storage";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import Dropdown from "./common/Dropdown.svelte";

    export let setting: ModuleSetting;
    export let path: string;

    const cSetting = setting as ChoiceSetting;
    const thisPath = `${path}.${cSetting.name}`;

    const dispatch = createEventDispatcher();
    const options = Object.keys(cSetting.choices);
    let expanded = localStorage.getItem(thisPath) === "true";

    let nestedSettings = cSetting.choices[cSetting.active]
        .value as ModuleSetting[];
    $: nestedSettings = cSetting.choices[cSetting.active]
        .value as ModuleSetting[];

    $: setItem(thisPath, expanded.toString());

    function handleChange() {
        setting = { ...cSetting };
        dispatch("change");
    }

    function toggleExpanded() {
        expanded = !expanded;
    }
</script>

<div class="setting">
    {#if nestedSettings.length > 0}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="head expand" class:expanded on:contextmenu|preventDefault={toggleExpanded}>
            <Dropdown
                bind:value={cSetting.active}
                {options}
                name={$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}
                on:change={handleChange}
            />
            <ExpandArrow bind:expanded />
        </div>
    {:else}
        <div class="head">
            <Dropdown
                bind:value={cSetting.active}
                {options}
                name={$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}
                on:change={handleChange}
            />
        </div>
    {/if}

    {#if expanded && nestedSettings.length > 0}
        <div class="nested-settings" transition:slide={{duration: 200, axis: "y"}}>
            {#each nestedSettings as setting (`${cSetting.active}.${setting.name}`)}
                <GenericSetting path={thisPath} bind:setting={setting} on:change={handleChange} />
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">

    .setting {
        padding: 11px 0;

        .head {
          transition: ease margin-bottom .2s;

          &.expand {
              display: grid;
              grid-template-columns: 1fr max-content;
          }

          &.expanded {
              margin-bottom: 10px;
          }
        }
    }
    .nested-settings {
        margin: 0 -4px 4px 0;
        padding: 0 0 0 12px;
        border-left: 2px solid var(--fill-secondary);
        border-radius: 1px;
    }
</style>
