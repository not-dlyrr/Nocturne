<script lang="ts">
    import type {ListSetting, ModuleSetting} from "../../../../integration/types";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../../theme/theme_config";
    import {createEventDispatcher} from "svelte";
    import SettingButton from "../common/SettingButton.svelte";
    import RemovableItem from "../common/RemovableItem.svelte";

    export let setting: ModuleSetting;

    const cSetting = setting as ListSetting;

    const dispatch = createEventDispatcher();

    function handleChange() {
        setting = {...cSetting};
        dispatch("change");
    }

    function removeValueIndex(index: number) {
        cSetting.value.splice(index, 1);
        cSetting.value = cSetting.value;
        handleChange();
    }

    function addValueIndex() {
        cSetting.value = ["", ...cSetting.value];
        handleChange();
    }
</script>

<div class="setting">
    <div class="name">{$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}</div>
    <SettingButton value="Add Value" on:click={addValueIndex} />
    {#if cSetting.value.length > 0}
        <div class="inputs">
            {#each cSetting.value as _, index}
                <RemovableItem on:remove={() => removeValueIndex(index)}>
                    <input type="text" class="value" spellcheck="false" placeholder={setting.name} bind:value={cSetting.value[index]}
                           on:input={handleChange}>
                </RemovableItem>
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">
  .setting {
    padding: 7px 0 8px;
  }

  .inputs {
    display: flex;
    flex-direction: column;
    row-gap: 6px;
    margin-top: 6px;
  }

  .name {
    color: var(--label);
    font-size: 13px;
    margin-bottom: 6px;
  }

  .value {
    width: 100%;
    height: 28px;
    padding: 0 8px;
    border: 0.5px solid var(--glass-stroke);
    border-radius: var(--radius-xs);
    background-color: var(--fill-tertiary);
    color: var(--label);
    font-family: var(--font-text);
    font-size: 12px;
    outline: none;
    transition: background-color 0.2s ease;

    &:focus {
      outline: 2px solid var(--focus-ring);
      outline-offset: -1px;
    }

    &::placeholder {
      color: var(--label-secondary);
    }

    &::-webkit-scrollbar {
      background-color: transparent;
    }
  }
</style>
