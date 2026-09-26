<script lang="ts">
    import type {BooleanSetting as TBooleanSetting, ModuleSetting,} from "../../../../integration/types";
    import {fly} from "svelte/transition";
    import SwitchSetting from "./SwitchSetting.svelte";
    import GenericSetting from "../../../clickgui/setting/common/GenericSetting.svelte";
    import {convertToSpacedString} from "../../../../theme/theme_config";
    import Icon from "../../../../components/sg/Icon.svelte";

    interface Props {
        value: NesterSetting,
        path: string
    }

    interface NesterSetting {
        name: string;
        valueType: string;
        value: ModuleSetting[];
    }

    const {value = $bindable(), path}: Props = $props();

    const enabledSetting = value.value[0] as TBooleanSetting;

    let expanded = $state(false);
    let wrappedSettingElement: HTMLElement;
    let headerElement: HTMLElement;

    function handleWrapperClick(e: MouseEvent) {
        if (!expanded) {
            expanded = true;
        } else {
            expanded = !headerElement.contains(e.target as Node);
        }
    }

    function handleWindowClick(e: MouseEvent) {
        if (!wrappedSettingElement) return;

        const node = e.target as HTMLElement;

        if (!wrappedSettingElement.contains(node)
            && !node.classList.contains("option")) { // Don't close when a select option is pressed
            expanded = false;
        }
    }
</script>

<svelte:window on:click={handleWindowClick}/>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="wrapped-setting" class:expanded class:has-nested-settings={value.value.length > 0}
     onclick={handleWrapperClick} bind:this={wrappedSettingElement}>
    <div class="header" bind:this={headerElement}>
        {#if value.valueType === "TOGGLEABLE"}
            <SwitchSetting title={convertToSpacedString(value.name)} bind:value={enabledSetting.value}/>
        {:else if value.valueType === "CONFIGURABLE"}
            <span class="configurable-title">{convertToSpacedString(value.name)}</span>
        {:else }
            Unsupported value type {value.valueType}
        {/if}
        {#if value.value.length > 0}
            <span class="chevron"><Icon name="chevron" size={12} weight={2.4}/></span>
        {/if}
    </div>

    {#if expanded && value.value.length > 0}
        <div class="nested-settings" transition:fly={{ y: -4, duration: 150 }}>
            {#each value.value as setting, i (setting.name)}
                <GenericSetting {path} bind:setting={value.value[i]} on:change/>
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">
  .configurable-title {
    color: var(--label);
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
  }

  .wrapped-setting {
    position: relative;
    flex: none;

    &.has-nested-settings {
      cursor: pointer;

      .header {
        height: 30px;
        padding: 0 10px 0 4px;
        display: flex;
        gap: 8px;
        align-items: center;
        border-radius: var(--radius-pill);
        background-color: var(--fill-tertiary);
        transition: background-color 0.2s ease;

        &:hover {
          background-color: var(--fill-secondary);
        }
      }
    }
  }

  .chevron {
    display: flex;
    color: var(--label-secondary);
    transform: rotate(90deg);
    transition: transform 0.35s cubic-bezier(0.3, 1.4, 0.5, 1);
  }

  .expanded .chevron {
    transform: rotate(-90deg);
  }

  /* popover of click GUI settings, laid out like the click GUI's grouped settings */
  .nested-settings {
    position: absolute;
    z-index: 1000;
    top: calc(100% + 4px);
    left: 0;
    width: 320px;
    max-height: 60vh;
    overflow: auto;
    padding: 2px 0;
    border-radius: var(--radius-sm);
    background-color: var(--surface-elevated);
    border: 0.5px solid var(--glass-stroke);
    box-shadow: var(--shadow-solid);
    cursor: default;

    > :global(div) {
      padding: 0 12px;
    }

    > :global(div + div) {
      box-shadow: inset 0 0.5px 0 var(--separator);
    }
  }
</style>
