<script lang="ts">
    import {onMount} from "svelte";
    import {getModules} from "../../../integration/rest";
    import {listen} from "../../../integration/ws";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import type {Module} from "../../../integration/types";
    import {UNKNOWN_KEY} from "../../../util/utils";
    import BindDisplay from "../../clickgui/setting/bind/BindDisplay.svelte";
    import Icon from "../../../components/sg/Icon.svelte";

    let modules: Module[] = $state([]);

    async function updateModulesWithBinds() {
        modules = (await getModules()).filter(m => m.keyBind.boundKey !== UNKNOWN_KEY);
    }

    listen("moduleToggle", updateModulesWithBinds);
    listen("valueChanged", async (e) => {
        if (e.value.name === "Bind") {
            await updateModulesWithBinds();
        }
    })

    onMount(async () => {
        await updateModulesWithBinds();
    });
</script>

<div class="keybinds nc-surface nc-hud">
    <div class="header">
        <Icon name="sliders" size={14} weight={2}/>
        <span class="title">Keybinds</span>
    </div>
    <div class="entries">
        {#each modules as m (m.name)}
            <div class="row" class:enabled={m.enabled}>
                <span class="dot"></span>
                <span class="module-name">{$spaceSeperatedNames ? convertToSpacedString(m.name) : m.name}</span>
                <span class="key-bind">
                    <BindDisplay boundKey={m.keyBind.boundKey} modifiers={m.keyBind.modifiers}/>
                </span>
            </div>
        {:else}
            <div class="no-binds">No key bindings</div>
        {/each}
    </div>
</div>

<style lang="scss">
  .keybinds {
    width: max-content;
    min-width: 170px;
    max-width: 240px;
    padding: 8px;
    border-radius: var(--radius-md);
    font-family: var(--font-text);
  }

  .header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 6px 6px;
    color: var(--label-secondary);

    .title {
      font-size: 13px;
      font-weight: 600;
    }
  }

  .entries {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .no-binds {
    padding: 4px 6px;
    font-size: 13px;
    color: var(--label-secondary);
  }

  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    height: 26px;
    padding: 0 4px 0 6px;
    color: var(--label-secondary);
    transition: color 0.2s ease;

    &.enabled {
      color: var(--label);

      .dot {
        background: var(--switch-on);
      }
    }
  }

  .dot {
    flex: none;
    width: 6px;
    height: 6px;
    border-radius: var(--radius-pill);
    background: var(--fill-secondary);
    transition: background-color 0.2s ease;
  }

  .module-name {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .key-bind {
    flex: none;
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 7px;
    border-radius: var(--radius-pill);
    background: var(--fill-tertiary);
    color: var(--label-secondary);
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
</style>
