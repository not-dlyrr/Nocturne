<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import type {ModuleSetting, TextSetting,} from "../../../integration/types";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import {setTyping} from "../../../integration/rest";

    export let setting: ModuleSetting;

    const cSetting = setting as TextSetting;

    const dispatch = createEventDispatcher();

    function handleChange() {
        setting = {...cSetting};
        dispatch("change");
    }
</script>

<div class="setting">
    <div class="name">{$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}</div>
    <input type="text" class="value" spellcheck="false"
           placeholder={$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}
           bind:value={cSetting.value}
           on:input={handleChange}
           on:focusin={async () => await setTyping(true)}
           on:focusout={async () => await setTyping(false)}
    >
</div>

<style lang="scss">
  .setting {
    padding: 7px 0 8px;
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
