<script lang="ts">
    import {listen} from "../../../../integration/ws";
    import type {KeyEvent} from "../../../../integration/events";
    import type {MinecraftKeybind} from "../../../../integration/types";

    export let gridArea: string;
    export let key: MinecraftKeybind | undefined;

    let active = false;

    listen("key", (e: KeyEvent) => {
        if (e.key !== key?.key.translationKey) {
            return;
        }

        active = e.action === 1 || e.action === 2;
    });
</script>

<div class="key nc-glass" style="grid-area: {gridArea};" class:active>
    {key?.key.localized ?? "???"}
</div>

<style lang="scss">
  .key {
    height: 50px;
    color: var(--label);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    font-family: var(--font-text);
    font-size: 15px;
    font-weight: 600;
    text-align: center;
    transition: background-color 0.2s ease, color 0.2s ease, transform 0.35s cubic-bezier(0.3, 1.4, 0.5, 1);

    &.active {
      background: var(--keystrokes-active-color);
      color: var(--on-accent);
      transform: scale(0.93);
      transition: background-color 0.08s ease, color 0.08s ease, transform 0.08s ease;
    }
  }
</style>
