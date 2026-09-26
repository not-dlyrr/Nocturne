<script lang="ts">
    import type {KeySetting, ModuleSetting} from "../../../integration/types";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import {getPrintableKeyName} from "../../../integration/rest";
    import {createEventDispatcher} from "svelte";
    import {listen} from "../../../integration/ws";
    import type {KeyboardKeyEvent, MouseButtonEvent} from "../../../integration/events";
    import {isClickGuiScreen, UNKNOWN_KEY} from "../../../util/utils";

    export let setting: ModuleSetting;

    const cSetting = setting as KeySetting;

    const dispatch = createEventDispatcher();

    let isHovered = false;
    let binding = false;
    let printableKeyName = "";

    $: {
        if (cSetting.value !== UNKNOWN_KEY) {
            getPrintableKeyName(cSetting.value)
                .then(printableKey => {
                    printableKeyName = printableKey.localized;
                });
        }
    }

    async function toggleBinding() {
        if (binding) {
            cSetting.value = UNKNOWN_KEY;
        }

        binding = !binding;

        setting = {...cSetting};

        dispatch("change");
    }

    listen("keyboardKey", async (e: KeyboardKeyEvent) => {
        if (!isClickGuiScreen(e.screen)) {
            return;
        }

        if (!binding) {
            return;
        }

        binding = false;

        if (e.keyCode !== 256) {
            cSetting.value = e.key;
        } else {
            cSetting.value = UNKNOWN_KEY;
        }

        setting = {...cSetting};

        dispatch("change");
    });

    listen("mouseButton", async (e: MouseButtonEvent) => {
        if (!isClickGuiScreen(e.screen)) {
            return;
        }

        if (!binding || (e.button === 0 && isHovered)) {
            return;
        }

        binding = false;

        cSetting.value = e.key;

        setting = {...cSetting};

        dispatch("change");
    })
</script>

<div class="setting">
    <span class="name">{$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}</span>
    <button
            class="change-bind sg-btn sg-btn-small"
            class:sg-btn-tinted={!binding}
            class:sg-btn-filled={binding}
            type="button"
            on:click={toggleBinding}
            on:mouseenter={() => isHovered = true}
            on:mouseleave={() => isHovered = false}
    >
        {#if !binding}
            {#if cSetting.value === UNKNOWN_KEY}
                <span class="none">None</span>
            {:else}
                <span>{printableKeyName}</span>
            {/if}
        {:else}
            <span>Press a Key</span>
        {/if}
    </button>
</div>

<style lang="scss">
  .setting {
    padding: 7px 0;
    min-height: 40px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .name {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    color: var(--label);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .change-bind {
    min-width: 56px;
    min-height: 26px;
    height: 26px;
    padding: 0 12px;
    font-size: 12px;
    line-height: 16px;
    font-weight: 600;

    .none {
      opacity: 0.8;
    }
  }
</style>
