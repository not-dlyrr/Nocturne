<script lang="ts">
    import {onMount} from "svelte";
    import type {ConfigurableSetting} from "../../../integration/types";
    import {getGlobalSettings, getModuleSettings, setGlobalSettings, setModuleSettings} from "../../../integration/rest";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import GenericSetting from "../setting/common/GenericSetting.svelte";

    // Module-backed groups first (what people reach for), then the client's global settings.
    const MODULE_GROUPS = [
        {module: "HUD", label: "HUD", footer: "Blur sets how much the game frosts behind HUD glass."},
        {module: "ClickGUI", label: "Menu", footer: "Opens and hides this menu in game."}
    ];

    let {onHudEditor}: { onHudEditor: () => void } = $props();

    let moduleSettings = $state<Record<string, ConfigurableSetting>>({});
    let globalSettings = $state<ConfigurableSetting | null>(null);

    const globalGroups = $derived((globalSettings?.value ?? []).filter(
        s => s.valueType === "CONFIGURABLE" || s.valueType === "TOGGLEABLE"
    ) as ConfigurableSetting[]);

    const name = (n: string) => $spaceSeperatedNames ? convertToSpacedString(n) : n;

    async function updateModule(module: string) {
        await setModuleSettings(module, $state.snapshot(moduleSettings[module]));
        moduleSettings[module] = await getModuleSettings(module);
    }

    async function updateGlobal() {
        if (!globalSettings) return;
        await setGlobalSettings($state.snapshot(globalSettings));
        globalSettings = await getGlobalSettings();
    }

    onMount(async () => {
        const loaded = await Promise.all(MODULE_GROUPS.map(g => getModuleSettings(g.module)));
        MODULE_GROUPS.forEach((g, i) => moduleSettings[g.module] = loaded[i]);
        globalSettings = await getGlobalSettings();
    });
</script>

<div class="page">
    <div class="heading">
        <span class="title">Client Settings</span>
        <span class="subtitle">Changes apply to the overlay right away.</span>
    </div>

    <section>
        <span class="group-header">Layout</span>
        <div class="group">
            <div class="row">
                <div class="row-text">
                    <span>HUD Editor</span>
                    <span class="row-desc">Move, add and remove HUD elements</span>
                </div>
                <button class="sg-btn sg-btn-tinted sg-btn-small" type="button" onclick={onHudEditor}>Edit</button>
            </div>
        </div>
    </section>

    {#each MODULE_GROUPS as g (g.module)}
        {#if moduleSettings[g.module]}
            <section>
                <span class="group-header">{g.label}</span>
                <div class="group">
                    {#each moduleSettings[g.module].value as setting, i (setting.name)}
                        {#if setting.valueType !== "BIND" && setting.name !== "Hidden"}
                            <GenericSetting path="clickgui.nocturne.{g.module}"
                                            bind:setting={moduleSettings[g.module].value[i]}
                                            on:change={() => updateModule(g.module)}/>
                        {/if}
                    {/each}
                </div>
                <span class="group-footer">{g.footer}</span>
            </section>
        {/if}
    {/each}

    {#each globalGroups as group (group.name)}
        <section>
            <span class="group-header">{name(group.name)}</span>
            <div class="group">
                {#each group.value as setting, i (setting.name)}
                    <GenericSetting path="clickgui.global.{group.name}" bind:setting={group.value[i]}
                                    on:change={updateGlobal}/>
                {/each}
            </div>
        </section>
    {/each}
</div>

<style lang="scss">
  .page {
    max-width: 600px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .heading {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .title {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  .subtitle {
    font-size: 12px;
    color: var(--label-secondary);
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .group-header,
  .group-footer {
    font-size: 11px;
    color: var(--label-secondary);
    padding: 0 12px;
  }

  .group-header {
    font-weight: 600;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 42px;
    padding: 6px 12px;
    font-size: 13px;
  }

  .row-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .row-desc {
    font-size: 11px;
    color: var(--label-secondary);
  }

  .group {
    display: flex;
    flex-direction: column;
    border-radius: var(--radius-sm);
    background: var(--fill-tertiary);

    > :global(div) {
      padding: 0 12px;
    }

    > :global(div + div) {
      box-shadow: inset 0 0.5px 0 var(--separator);
    }
  }
</style>
