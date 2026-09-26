<script lang="ts">
    import NocturneWindow from "./nocturne/NocturneWindow.svelte";
    import ScaledClickGuiContent from "./ScaledClickGuiContent.svelte";
    import {gridSize, os, scaleFactor, snappingEnabled, darken} from "./clickgui_store";
    import type {ConfigurableSetting, TogglableSetting} from "../../integration/types";
    import {onMount} from "svelte";
    import {
        getClientInfo,
        getGameWindow,
        getModuleSettings,
        setHudEditorSelected,
        setTyping
    } from "../../integration/rest";
    import {listen} from "../../integration/ws";
    import type {ClickGuiValueChangeEvent, ScaleFactorChangeEvent} from "../../integration/events";
    import HudEditor from "./tabs/hud_editor/HudEditor.svelte";

    let hudEditor = $state(false);
    let minecraftScaleFactor = $state(2);
    let clickGuiScaleFactor = $state(1);

    $effect(() => {
        $scaleFactor = minecraftScaleFactor * clickGuiScaleFactor;
    });

    function applyValues(configurable: ConfigurableSetting) {
        const scaleValue = configurable.value.find(v => v.name === "Scale");
        const snappingValue = configurable.value.find(v => v.name === "Snapping") as TogglableSetting | undefined;

        if (scaleValue) {
            clickGuiScaleFactor = scaleValue.value as number;
        }

        if (snappingValue) {
            $snappingEnabled = snappingValue.value.find(v => v.name === "Enabled")?.value as boolean ?? true;
            $gridSize = snappingValue.value.find(v => v.name === "GridSize")?.value as number ?? 10;
        }
    }

    onMount(async () => {
        await setHudEditorSelected(false);

        $os = (await getClientInfo()).os;

        const gameWindow = await getGameWindow();
        minecraftScaleFactor = gameWindow.scaleFactor;

        const clickGuiSettings = await getModuleSettings("ClickGUI");
        applyValues(clickGuiSettings);

        await setTyping(false);
    });

    listen("scaleFactorChange", (e: ScaleFactorChangeEvent) => {
        minecraftScaleFactor = e.scaleFactor;
    });

    listen("clickGuiValueChange", (e: ClickGuiValueChangeEvent) => {
        applyValues(e.configurable);
    });
</script>

<div
        class="tabbed-clickgui"
        class:darken={$darken}
>
    {#if hudEditor}
        <HudEditor/>
        <button class="done sg-btn sg-btn-filled sg-btn-small" type="button" onclick={() => (hudEditor = false)}>
            Done
        </button>
    {:else}
        <ScaledClickGuiContent>
            <NocturneWindow onHudEditor={() => (hudEditor = true)}/>
        </ScaledClickGuiContent>
    {/if}
</div>

<style lang="scss">
  .tabbed-clickgui {
    overflow: hidden;
    position: absolute;
    inset: 0;
    transition: ease background-color .2s;

    &.darken {
      background-color: var(--clickgui-overlay-background-color);
    }
  }

  .done {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    min-height: 30px;
    height: 30px;
    padding: 0 18px;
    font-size: 13px;
    line-height: 18px;
    box-shadow: var(--shadow-solid);

    &:active {
      transform: translateX(-50%) scale(0.96);
    }
  }
</style>
