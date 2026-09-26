<script lang="ts">
    import type {FileSetting, ModuleSetting} from "../../../integration/types";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import {browsePath, openFileDialog} from "../../../integration/rest";
    import {createEventDispatcher} from "svelte";

    export let setting: ModuleSetting;

    const cSetting = setting as FileSetting;

    let selecting = false;

    const dispatch = createEventDispatcher();

    function handleChange() {
        setting = {...cSetting};
        dispatch("change");
    }

    async function selectFile() {
        if (selecting) {
            return;
        }

        selecting = true;

        let file = await openFileDialog({
            mode: cSetting.dialogMode,
            supportedExtensions: cSetting.supportedExtensions
        });

        selecting = false;
        if (file.file !== undefined) {
            cSetting.value = file.file;
            handleChange();
        }
    }

    function resetFile() {
        cSetting.value = '';
        handleChange();
    }
</script>

<div class="setting">
    <div class="name">{spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}</div>

    <div class="body">
        <button class="button-select" on:click={selectFile}>{cSetting.value === "" ? "<empty>" : cSetting.value}</button>

        {#if cSetting.value !== ""}
            <button class="button-action" on:click={resetFile}>
                <img class="icon" src="img/clickgui/icon-reset.svg" alt="reset-file" title="Reset" />
            </button>

            <button class="button-action" on:click={() => browsePath(cSetting.value)}>
                <img class="icon" src="img/clickgui/icon-open-file.svg" alt="open-file" title="Open" />
            </button>
        {/if}
    </div>
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

  .body {
    display: flex;
    align-items: center;
    column-gap: 4px;
  }

  .button-action {
    width: 26px;
    height: 26px;
    flex: none;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background-color: transparent;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--fill-secondary);
    }

    .icon {
      height: 14px;
      opacity: 0.8;
    }
  }

  .button-select {
    flex: 1;
    min-width: 0;
    cursor: pointer;
    height: 28px;
    padding: 0 8px;
    border: 0.5px solid var(--glass-stroke);
    border-radius: var(--radius-xs);
    background-color: var(--fill-tertiary);
    color: var(--label-secondary);
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

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    direction: rtl;
    text-align: left;

    &:hover {
      background-color: var(--fill-secondary);
    }
  }
</style>
