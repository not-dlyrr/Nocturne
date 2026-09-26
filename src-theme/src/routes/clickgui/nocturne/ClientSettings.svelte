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
    max-width: 680px;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .heading {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  .subtitle {
    font-size: 13px;
    color: var(--label-secondary);
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .group-header,
  .group-footer {
    font-size: 13px;
    color: var(--label-secondary);
    padding: 0 16px;
  }

  .group-footer {
    font-size: 12px;
  }

  .group {
    display: flex;
    flex-direction: column;
    border-radius: var(--radius-md);
    background: var(--fill-tertiary);

    > :global(div) {
      padding: 0 16px;
    }

    > :global(div + div) {
      box-shadow: inset 0 0.5px 0 var(--separator);
    }
  }
</style>
