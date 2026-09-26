<script lang="ts">
    import {onMount, tick} from "svelte";
    import type {Module} from "../../../integration/types";
    import {getModules} from "../../../integration/rest";
    import {listen} from "../../../integration/ws";
    import {getTextWidth} from "../../../integration/text_measurement";
    import {flip} from "svelte/animate";
    import {fly} from "svelte/transition";

    // santi.glass sliding-selection spring, cubic-bezier(0.3, 1.3, 0.5, 1). ponytail: evaluates y(t) with t
    // standing in for x, close enough for a 450ms slide; solve x(t) first if it ever looks off.
    function springSlide(t: number) {
        const u = 1 - t;
        return 3 * u * u * t * 1.3 + 3 * u * t * t + t * t * t;
    }
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";

    export let settings: { [name: string]: any };

    let cSettings = settings as HudArrayListSettings;

    let enabledModules: Module[] = [];

    async function updateEnabledModules() {
        const modules = await getModules();
        const visibleModules = modules.filter(m => m.enabled && !m.hidden);

        const modulesWithWidths = visibleModules.map(module => {
            const formattedName = $spaceSeperatedNames ? convertToSpacedString(module.name) : module.name;
            const fullName = module.tag == null || !cSettings.showTags
                ? formattedName
                : formattedName + " " + module.tag;

            return {
                ...module,
                width: getTextWidth(fullName, "500 13px 'SF Pro Text'")
            };
        });

        modulesWithWidths.sort((a, b) => cSettings.order === "Ascending" ? a.width - b.width : b.width - a.width);

        enabledModules = modulesWithWidths;
        await tick();
    }

    $: if (cSettings !== settings) {
        cSettings = settings as HudArrayListSettings;
        updateEnabledModules();
    }

    spaceSeperatedNames.subscribe(async () => {
        await updateEnabledModules();
    });

    onMount(async () => {
        await updateEnabledModules();
    });

    listen("moduleToggle", async () => {
        await updateEnabledModules();
    });

    listen("refreshArrayList", async () => {
        await updateEnabledModules();
    });
</script>

<div class="arraylist" class:left={cSettings.itemAlignment === "Left"}>
    {#each enabledModules as {name, tag} (name)}
        <div
                class="module nc-glass"
                animate:flip={{ duration: 450, easing: springSlide }}
                transition:fly={{ x: cSettings.itemAlignment === "Left" ? -40 : 40, duration: 300 }}
        >
            <span class="name">{$spaceSeperatedNames ? convertToSpacedString(name) : name}</span>
            {#if tag && cSettings.showTags}
                <span class="tag">{tag}</span>
            {/if}
            <span class="bar"></span>
        </div>
    {/each}
</div>

<style lang="scss">
  .arraylist {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    padding: 16px;

    &.left {
      align-items: flex-start;

      .module {
        flex-direction: row-reverse;
        padding: 0 12px 0 8px;
      }
    }
  }

  /* Liquid Glass pill (nc-glass); the native blur frosts the game behind it */
  .module {
    height: 26px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px 0 12px;
    border-radius: var(--radius-pill);
    white-space: nowrap;
    font-size: 13px;
  }

  .name {
    font-weight: 500;
    color: var(--label);
  }

  .tag {
    color: var(--label-secondary);
  }

  .bar {
    width: 3px;
    height: 12px;
    border-radius: 2px;
    background: var(--accent);
    margin-left: 2px;
  }
</style>
