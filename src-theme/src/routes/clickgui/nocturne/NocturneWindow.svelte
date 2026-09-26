<script lang="ts">
    import {onMount, tick} from "svelte";
    import {fly} from "svelte/transition";
    import type {ConfigurableSetting, Module} from "../../../integration/types";
    import type {KeyboardKeyEvent, ModuleToggleEvent} from "../../../integration/events";
    import {
        deleteScreen,
        getCategories,
        getClientInfo,
        getModules,
        getModuleSettings,
        getPrintableKeyName,
        setModuleEnabled,
        setModuleSettings,
        setTyping
    } from "../../../integration/rest";
    import {listen} from "../../../integration/ws";
    import {setItem} from "../../../integration/persistent_storage";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import {scaleFactor} from "../clickgui_store";
    import {isClickGuiScreen, UNKNOWN_KEY} from "../../../util/utils";
    import Icon from "../../../components/sg/Icon.svelte";
    import Switch from "../../../components/sg/Switch.svelte";
    import SegmentedControl from "../../../components/sg/SegmentedControl.svelte";
    import GenericSetting from "../setting/common/GenericSetting.svelte";
    import ClientSettings from "./ClientSettings.svelte";
    import {categoryStyle} from "./categories";
    import {sectionsFor} from "./moduleSections";

    let {onHudEditor}: { onHudEditor: () => void } = $props();

    const STORAGE_KEY = "nocturne.window";
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as {
        x?: number; y?: number; category?: string; selected?: string; view?: string;
    };

    let modules = $state<Module[]>([]);
    let categories = $state<string[]>([]);
    let version = $state("");
    let menuKey = $state("Right Shift");

    let view = $state<"modules" | "settings">(saved.view === "settings" ? "settings" : "modules");
    let category = $state(saved.category ?? "Combat");
    let selected = $state<string | null>(saved.selected ?? null);
    let query = $state("");
    let onlyEnabled = $state(false);
    let clickGuiKey = UNKNOWN_KEY;

    let configurable = $state<ConfigurableSetting | null>(null);

    let x = $state(saved.x ?? -1);
    let y = $state(saved.y ?? -1);
    let dragging = $state(false);

    let windowElement: HTMLElement;
    let paneElement: HTMLElement | undefined = $state();
    let searchInput: HTMLInputElement;
    let sidebarItems: Record<string, HTMLElement> = $state({});

    const name = (n: string) => $spaceSeperatedNames ? convertToSpacedString(n) : n;

    const trimmedQuery = $derived(query.trim().toLowerCase().replaceAll(" ", ""));
    const categoryModules = $derived(modules.filter(m => m.category === category));
    const listed = $derived(trimmedQuery
        ? modules.filter(m => m.name.toLowerCase().includes(trimmedQuery)
            || m.aliases.some(a => a.toLowerCase().includes(trimmedQuery)))
        : categoryModules);
    const shown = $derived(onlyEnabled ? listed.filter(m => m.enabled) : listed);

    // Sticky sections from the hand-organized groups (moduleSections.ts). Search results are grouped by
    // category, in sidebar order, each keeping its curated order.
    const sections = $derived(trimmedQuery
        ? categories
            .map(c => [c, sectionsFor(c, shown.filter(m => m.category === c), name).flatMap(([, ms]) => ms)] as [string, Module[]])
            .filter(([, ms]) => ms.length > 0)
        : sectionsFor(category, shown, name));
    const selectedModule = $derived(modules.find(m => m.name === selected) ?? null);
    const showSettings = $derived(view === "settings" && !trimmedQuery);

    // The sidebar selection pill slides to the active row (a category or Settings); it fades out while searching.
    const pillY = $derived(sidebarItems[showSettings ? "__settings" : category]?.offsetTop ?? 0);

    const settingsWithoutBind = $derived(configurable?.value.filter(s => s.valueType !== "BIND") ?? []);
    const bindIndex = $derived(configurable?.value.findIndex(s => s.valueType === "BIND") ?? -1);
    const boundKey = $derived(bindIndex >= 0 ? (configurable!.value[bindIndex].value as { boundKey: string }).boundKey : UNKNOWN_KEY);
    let boundKeyName = $state<string | null>(null);

    $effect(() => {
        const key = boundKey;
        boundKeyName = null;
        if (key !== UNKNOWN_KEY) {
            getPrintableKeyName(key).then(k => { if (key === boundKey) boundKeyName = k.localized; });
        }
    });

    const hasGroups = $derived(settingsWithoutBind.some(s =>
        s.valueType === "CHOICE" || s.valueType === "TOGGLEABLE" || s.valueType === "CONFIGURABLE"));

    function persist() {
        setItem(STORAGE_KEY, JSON.stringify({x, y, category, selected, view}));
    }

    function enabledCount(list: Module[]) {
        return list.filter(m => m.enabled).length;
    }

    function selectCategory(c: string) {
        if (c === category && view === "modules" && !trimmedQuery) return;
        category = c;
        view = "modules";
        query = "";
        const inCategory = sectionsFor(c, modules.filter(m => m.category === c), name).flatMap(([, ms]) => ms);
        selectModule((inCategory.find(m => m.enabled) ?? inCategory[0])?.name ?? null);
    }

    function openSettings() {
        view = "settings";
        query = "";
        persist();
    }

    let selectRequest = 0;

    // Load first, then swap name + settings in one go, so the pane never shows a half-built state.
    // Only the latest click wins if several requests overlap.
    async function selectModule(n: string | null) {
        const request = ++selectRequest;
        const loaded = n ? await getModuleSettings(n) : null;
        if (request !== selectRequest) return;

        selected = n;
        configurable = loaded;
        if (paneElement) paneElement.scrollTop = 0;
        persist();
    }

    async function updateSettings() {
        if (!selected || !configurable) return;
        await setModuleSettings(selected, $state.snapshot(configurable));
        configurable = await getModuleSettings(selected);
    }

    async function toggle(module: Module, enabled: boolean) {
        await setModuleEnabled(module.name, enabled);
    }

    // Dragging the header moves the window; coordinates live in the scaled (virtual) space.
    function startDrag(e: MouseEvent) {
        if (e.button !== 0 || (e.target as HTMLElement).closest("input, button, label")) return;
        e.preventDefault();
        const toVirtual = 2 / $scaleFactor;
        const startX = e.clientX, startY = e.clientY, originX = x, originY = y;
        const parent = windowElement.parentElement!;

        const move = (ev: MouseEvent) => {
            x = clamp(originX + (ev.clientX - startX) * toVirtual, 80 - windowElement.offsetWidth, parent.clientWidth - 80);
            y = clamp(originY + (ev.clientY - startY) * toVirtual, 0, parent.clientHeight - 64);
        };
        const up = () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", up);
            dragging = false;
            persist();
        };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
        dragging = true;
    }

    function clamp(v: number, min: number, max: number) {
        return Math.max(min, Math.min(v, max));
    }

    // Typing anywhere starts a search, like the stock ClickGUI's search bar auto focus.
    function handleWindowKeyDown(e: KeyboardEvent) {
        if (document.activeElement === document.body && e.key.length === 1 && !e.ctrlKey && !e.altKey) {
            searchInput?.focus();
        }
    }

    // The menu key closes the menu too (Minecraft only closes screens on Escape). Not while typing (Shift is
    // for capitals) and not while a keybind is being recorded. The page is preloaded and stays mounted, so
    // the press that opens the menu also reaches here: e.screen is what was open when the key went down,
    // which is only the ClickGUI for a press made while the menu was already up.
    listen("keyboardKey", (e: KeyboardKeyEvent) => {
        if (e.action !== 1 || e.key !== clickGuiKey || !isClickGuiScreen(e.screen)) return;
        const focused = document.activeElement as HTMLElement | null;
        if (focused?.matches("input, textarea, [contenteditable]") || document.querySelector(".change-bind.sg-btn-filled")) return;
        deleteScreen();
    });

    listen("moduleToggle", (e: ModuleToggleEvent) => {
        const module = modules.find(m => m.name === e.moduleName);
        if (module) module.enabled = e.enabled;
    });

    onMount(async () => {
        const [loadedModules, loadedCategories, clientInfo] = await Promise.all([
            getModules(), getCategories(), getClientInfo()
        ]);
        modules = loadedModules;
        categories = loadedCategories.map(c => c.name).filter(c => loadedModules.some(m => m.category === c));
        version = clientInfo.clientVersion;

        if (!categories.includes(category)) category = categories[0] ?? category;
        if (!selected || !modules.some(m => m.name === selected)) {
            const inCategory = sectionsFor(category, modules.filter(m => m.category === category), name).flatMap(([, ms]) => ms);
            selected = (inCategory.find(m => m.enabled) ?? inCategory[0])?.name ?? null;
        }
        selectModule(selected);

        await tick();
        const parent = windowElement.parentElement!;
        if (x < 0 || y < 0 || x > parent.clientWidth - 80 || y > parent.clientHeight - 64) {
            x = Math.max(16, (parent.clientWidth - windowElement.offsetWidth) / 2);
            y = Math.max(16, (parent.clientHeight - windowElement.offsetHeight) / 2);
        }

        const boundKey = loadedModules.find(m => m.name === "ClickGUI")?.keyBind.boundKey;
        clickGuiKey = boundKey ?? UNKNOWN_KEY;
        if (boundKey && boundKey !== UNKNOWN_KEY) {
            menuKey = (await getPrintableKeyName(boundKey)).localized;
        }
    });
</script>

<svelte:window onkeydown={handleWindowKeyDown}/>

<div class="window nc-surface" bind:this={windowElement} class:dragging style="left: {x}px; top: {y}px;">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <header onmousedown={startDrag}>
        <div class="brand">
            <span class="wordmark">nocturne</span>
            <span class="version">{version}</span>
        </div>
        <label class="sg-search nc-field search">
            <Icon name="search" size={15} weight={2}/>
            <input type="search" placeholder="Search Modules" spellcheck="false" bind:value={query} bind:this={searchInput}
                   onfocusin={() => setTyping(true)} onfocusout={() => setTyping(false)}
                   onkeydown={e => { if (e.key === "Escape") { query = ""; searchInput.blur(); } }}/>
        </label>
        <div class="spacer"></div>
        <button class="sg-btn sg-btn-plain sg-btn-small" type="button" onclick={() => deleteScreen()}>Hide</button>
    </header>
    <div class="hairline"></div>

    <div class="body">
        <nav class="sidebar" class:dimmed={!!trimmedQuery}>
            <div class="pill" style="transform: translateY({pillY}px); opacity: {trimmedQuery ? 0 : 1};"></div>
            {#each categories as c (c)}
                {@const style = categoryStyle(c)}
                {@const inCategory = modules.filter(m => m.category === c)}
                <button type="button" class="side-row" class:active={c === category && !showSettings && !trimmedQuery}
                        bind:this={sidebarItems[c]} onclick={() => selectCategory(c)}>
                    <span class="icon-square" style="background: {style.tone};"><Icon name={style.icon} size={14} weight={2.2}/></span>
                    <span class="side-label">{c}</span>
                    <span class="count">{enabledCount(inCategory)}/{inCategory.length}</span>
                </button>
            {/each}
            <button type="button" class="side-row" class:active={showSettings && !trimmedQuery}
                    bind:this={sidebarItems.__settings} onclick={openSettings}>
                <span class="icon-square settings-square"><Icon name="sliders" size={14} weight={2.2}/></span>
                <span class="side-label">Settings</span>
            </button>
        </nav>
        <div class="vline"></div>

        {#if showSettings}
            <div class="client-settings" in:fly={{y: 8, duration: 250}}>
                <ClientSettings {onHudEditor}/>
            </div>
        {:else}
            <section class="list">
                <div class="list-head">
                    <div class="list-heading">
                        <span class="list-title">{trimmedQuery ? "Results" : category}</span>
                        <span class="meta">
                            {trimmedQuery ? `${listed.length} found` : `${enabledCount(categoryModules)} of ${categoryModules.length} on`}
                        </span>
                    </div>
                    <div class="filter">
                        <SegmentedControl options={["All", "On"]} value={onlyEnabled ? "On" : "All"} label="Show"
                                          onchange={v => (onlyEnabled = v === "On")}/>
                    </div>
                </div>
                {#key `${trimmedQuery ? "results" : category}:${onlyEnabled}`}
                    <div class="rows" in:fly={{y: 8, duration: 250}}>
                        {#each sections as [heading, sectionModules] (heading)}
                        <div class="section-head">{heading}</div>
                        {#each sectionModules as module (module.name)}
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_static_element_interactions -->
                            <div class="row" class:selected={module.name === selected}
                                 onclick={e => !(e.target as HTMLElement).closest("label") && module.name !== selected && selectModule(module.name)}>
                                <div class="row-text">
                                    <span class="row-name" class:on={module.enabled}>{name(module.name)}</span>
                                    <span class="row-desc">
                                        {trimmedQuery ? `${module.category} · ${module.description}` : module.description}
                                    </span>
                                </div>
                                <Switch checked={module.enabled} label={module.name} onchange={v => toggle(module, v)}/>
                            </div>
                        {/each}
                        {/each}
                        {#if shown.length === 0}
                            <div class="empty">
                                {trimmedQuery ? `No modules match “${query.trim()}”.` : `No ${category} modules are on.`}
                            </div>
                        {/if}
                    </div>
                {/key}
            </section>
            <div class="vline"></div>

            <section class="pane" bind:this={paneElement}>
                {#if selectedModule}
                    {@const style = categoryStyle(selectedModule.category)}
                    {#key selectedModule.name}
                        <div class="pane-inner" in:fly={{y: 6, duration: 220}}>
                            <div class="pane-head">
                                <span class="icon-square" style="background: {style.tone};"><Icon name={style.icon} size={14} weight={2.2}/></span>
                                <div class="pane-title">
                                    <div class="title-line">
                                        <span class="pane-name">{name(selectedModule.name)}</span>
                                        <span class="status" class:on={selectedModule.enabled}>{selectedModule.enabled ? "On" : "Off"}</span>
                                    </div>
                                    <span class="pane-desc">{selectedModule.description}</span>
                                </div>
                            </div>

                            {#if configurable}
                                {#if settingsWithoutBind.length > 0}
                                    <div class="group">
                                        {#each configurable.value as setting, i (setting.name)}
                                            {#if setting.valueType !== "BIND"}
                                                <GenericSetting path="clickgui.{selectedModule.name}"
                                                                bind:setting={configurable.value[i]}
                                                                on:change={updateSettings}/>
                                            {/if}
                                        {/each}
                                    </div>
                                    {#if hasGroups}
                                        <span class="footer">Right-click a group to show its settings.</span>
                                    {/if}
                                {/if}
                                {#if bindIndex >= 0}
                                    <div class="group">
                                        <GenericSetting path="clickgui.{selectedModule.name}"
                                                        bind:setting={configurable.value[bindIndex]}
                                                        on:change={updateSettings}/>
                                    </div>
                                    <span class="footer">
                                        {boundKeyName
                                            ? `Press ${boundKeyName} in game to toggle ${name(selectedModule.name)}.`
                                            : "Choose a key to toggle this module in game."}
                                    </span>
                                {/if}
                            {/if}
                        </div>
                    {/key}
                {/if}
            </section>
        {/if}
    </div>
</div>

<div class="hint nc-surface">
    <span class="key">{menuKey}</span>
    <span>Hides the menu</span>
</div>

<style lang="scss">
  .window {
    position: absolute;
    width: min(860px, calc(100% - 32px));
    height: min(560px, calc(100% - 32px));
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: var(--radius-md);
    animation: nc-window-in 0.4s cubic-bezier(0.3, 1.4, 0.5, 1) both;
    transform-origin: 24px 24px;
  }

  @keyframes nc-window-in {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
  }

  header {
    height: 52px;
    flex: none;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 10px 0 18px;
    cursor: grab;
  }

  .dragging header {
    cursor: grabbing;
  }

  .brand {
    width: 150px;
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .wordmark {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  .version {
    font-size: 11px;
    color: var(--label-secondary);
    white-space: nowrap;
  }

  .search {
    width: 300px;
    min-height: 32px;
    min-width: 0;
    cursor: text;

    padding: 0 12px;
    gap: 6px;

    input {
      font-size: 13px;
      letter-spacing: -0.08px;
    }

    input::-webkit-search-cancel-button {
      display: none;
    }
  }

  .spacer {
    flex: 1;
  }

  .hairline {
    height: 0.5px;
    flex: none;
    background: var(--separator);
  }

  .vline {
    width: 0.5px;
    flex: none;
    background: var(--separator);
  }

  .body {
    flex: 1;
    min-height: 0;
    display: flex;
  }

  .sidebar {
    position: relative;
    width: 176px;
    flex: none;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 1px;
    overflow-y: auto;
    transition: opacity 0.2s ease;

    &.dimmed {
      opacity: 0.5;
    }
  }

  .pill {
    position: absolute;
    left: 12px;
    right: 12px;
    top: 0;
    height: 34px;
    border-radius: var(--radius-sm);
    background: var(--glass-selection);
    transition: transform 0.45s cubic-bezier(0.3, 1.3, 0.5, 1), opacity 0.2s ease;
    pointer-events: none;
  }

  .side-row {
    all: unset;
    position: relative;
    height: 34px;
    flex: none;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 10px 0 6px;
    border-radius: var(--radius-sm);
    cursor: pointer;

    &:focus {
      outline: none;
    }

    &.active .side-label {
      color: var(--accent-text);
      font-weight: 600;
    }
  }

  .side-label {
    flex: 1;
    font-size: 13px;
    color: var(--label);
    transition: color 0.2s ease;
  }

  .count {
    font-size: 11px;
    color: var(--label-secondary);
    font-variant-numeric: tabular-nums;
  }

  .icon-square {
    width: 22px;
    height: 22px;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    color: #fff;
  }

  .list {
    width: 290px;
    flex: none;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .list-head {
    height: 52px;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 10px 0 16px;
  }

  .list-heading {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .filter :global(.sg-seg-item) {
    min-width: 40px;
    height: 24px;
    padding: 0 8px;
    font-size: 11px;
  }

  .section-head {
    position: sticky;
    top: 0;
    z-index: 1;
    flex: none;
    padding: 8px 10px 3px;
    background: var(--surface);
    font-size: 11px;
    font-weight: 600;
    color: var(--label-secondary);
    letter-spacing: 0.2px;
  }

  .settings-square {
    background: var(--fill-secondary);
  }

  .list-title {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.2px;
  }

  .meta {
    font-size: 11px;
    color: var(--label-secondary);
  }

  .rows {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 0 6px 10px;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .row {
    min-height: 42px;
    flex: none;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 5px 10px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: var(--fill-tertiary);
    }

    &.selected {
      background: var(--glass-selection);
    }
  }

  .row-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .row-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--label-secondary);
    transition: color 0.2s ease;

    &.on {
      color: var(--label);
    }
  }

  .row-desc {
    font-size: 11px;
    color: var(--label-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .empty {
    padding: 24px 12px;
    font-size: 13px;
    color: var(--label-secondary);
    text-align: center;
  }

  .pane {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
  }

  .pane-inner {
    padding: 14px 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .pane-head {
    display: flex;
    align-items: flex-start;
    gap: 10px;

    .icon-square {
      margin-top: 2px;
    }
  }

  .pane-title {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .title-line {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .pane-name {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  .status {
    font-size: 12px;
    font-weight: 600;
    color: var(--label-secondary);
    transition: color 0.2s ease;

    &.on {
      color: var(--success-text);
    }
  }

  .pane-desc {
    font-size: 12px;
    color: var(--label-secondary);
    text-wrap: pretty;
  }

  /* grouped list: settings are rows on fill-tertiary with inset hairlines */
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

  .footer {
    font-size: 11px;
    color: var(--label-secondary);
    padding: 0 12px;
    margin-top: -12px;
  }

  /* Compact segmented controls inside setting rows (the list filter has its own, smaller size). */
  .pane :global(.sg-seg-item) {
    min-width: 48px;
    height: 24px;
    padding: 0 8px;
    font-size: 11px;
  }

  /* Compact santi.glass switches: the DS size (51x31) is built for touch, not a dense desktop panel. */
  .window :global(.sg-switch-track) {
    width: 36px;
    height: 22px;
  }

  .window :global(.sg-switch-knob) {
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
  }

  .window :global(.sg-switch input:checked + .sg-switch-track .sg-switch-knob) {
    transform: translateX(14px);
  }

  .client-settings {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
  }

  .hint {
    position: absolute;
    left: 20px;
    bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px 6px 6px;
    border-radius: var(--radius-pill);
    font-size: 13px;
    color: var(--label-secondary);

    .key {
      padding: 3px 10px;
      border-radius: var(--radius-pill);
      background: var(--fill-secondary);
      font-size: 12px;
      font-weight: 600;
      color: var(--label);
    }
  }
</style>
