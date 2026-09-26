<script lang="ts">
    import {onMount, tick} from "svelte";
    import {fly} from "svelte/transition";
    import type {ConfigurableSetting, Module} from "../../../integration/types";
    import type {ModuleToggleEvent} from "../../../integration/events";
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
    import {UNKNOWN_KEY} from "../../../util/utils";
    import Icon from "../../../components/sg/Icon.svelte";
    import Switch from "../../../components/sg/Switch.svelte";
    import GenericSetting from "../setting/common/GenericSetting.svelte";
    import ClientSettings from "./ClientSettings.svelte";
    import {categoryStyle} from "./categories";

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

    let configurable = $state<ConfigurableSetting | null>(null);

    let x = $state(saved.x ?? -1);
    let y = $state(saved.y ?? -1);
    let dragging = $state(false);

    let windowElement: HTMLElement;
    let searchInput: HTMLInputElement;
    let sidebarItems: Record<string, HTMLElement> = $state({});

    const name = (n: string) => $spaceSeperatedNames ? convertToSpacedString(n) : n;

    const trimmedQuery = $derived(query.trim().toLowerCase().replaceAll(" ", ""));
    const categoryModules = $derived(modules.filter(m => m.category === category));
    const listed = $derived(trimmedQuery
        ? modules.filter(m => m.name.toLowerCase().includes(trimmedQuery)
            || m.aliases.some(a => a.toLowerCase().includes(trimmedQuery)))
        : categoryModules);
    const selectedModule = $derived(modules.find(m => m.name === selected) ?? null);
    const showSettings = $derived(view === "settings" && !trimmedQuery);

    // The sidebar selection pill slides to the active category; it fades out on Settings and search.
    const pillY = $derived(sidebarItems[category]?.offsetTop ?? 0);

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
        const inCategory = modules.filter(m => m.category === c);
        selectModule((inCategory.find(m => m.enabled) ?? inCategory[0])?.name ?? null);
    }

    function toggleSettings() {
        view = showSettings ? "modules" : "settings";
        query = "";
        persist();
    }

    async function selectModule(n: string | null) {
        selected = n;
        persist();
        configurable = null;
        if (n) {
            const loaded = await getModuleSettings(n);
            if (selected === n) configurable = loaded;
        }
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
            const inCategory = modules.filter(m => m.category === category);
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
            <Icon name="search" size={18} weight={2}/>
            <input type="search" placeholder="Search Modules" spellcheck="false" bind:value={query} bind:this={searchInput}
                   onfocusin={() => setTyping(true)} onfocusout={() => setTyping(false)}
                   onkeydown={e => { if (e.key === "Escape") { query = ""; searchInput.blur(); } }}/>
        </label>
        <div class="spacer"></div>
        <button class="icon-btn" class:active={showSettings} type="button" aria-label="Client Settings"
                aria-pressed={showSettings} onclick={toggleSettings}>
            <Icon name="sliders" size={20} weight={2}/>
        </button>
        <button class="sg-btn sg-btn-plain sg-btn-small" type="button" onclick={() => deleteScreen()}>Hide</button>
    </header>
    <div class="hairline"></div>

    <div class="body">
        <nav class="sidebar" class:dimmed={!!trimmedQuery}>
            <div class="pill" style="transform: translateY({pillY}px); opacity: {trimmedQuery || showSettings ? 0 : 1};"></div>
            {#each categories as c (c)}
                {@const style = categoryStyle(c)}
                {@const inCategory = modules.filter(m => m.category === c)}
                <button type="button" class="side-row" class:active={c === category && !showSettings && !trimmedQuery}
                        bind:this={sidebarItems[c]} onclick={() => selectCategory(c)}>
                    <span class="icon-square" style="background: {style.tone};"><Icon name={style.icon} size={18} weight={2}/></span>
                    <span class="side-label">{c}</span>
                    <span class="count">{enabledCount(inCategory)}/{inCategory.length}</span>
                </button>
            {/each}
        </nav>
        <div class="vline"></div>

        {#if showSettings}
            <div class="client-settings" in:fly={{y: 8, duration: 250}}>
                <ClientSettings {onHudEditor}/>
            </div>
        {:else}
            <section class="list">
                <div class="list-head">
                    <span class="list-title">{trimmedQuery ? "Results" : category}</span>
                    <span class="meta">
                        {trimmedQuery ? `${listed.length} found` : `${enabledCount(categoryModules)} of ${categoryModules.length} on`}
                    </span>
                </div>
                {#key trimmedQuery ? "results" : category}
                    <div class="rows" in:fly={{y: 8, duration: 250}}>
                        {#each listed as module (module.name)}
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
                        {#if trimmedQuery && listed.length === 0}
                            <div class="empty">No modules match “{query.trim()}”.</div>
                        {/if}
                    </div>
                {/key}
            </section>
            <div class="vline"></div>

            <section class="pane">
                {#if selectedModule}
                    {@const style = categoryStyle(selectedModule.category)}
                    {#key selectedModule.name}
                        <div class="pane-inner" in:fly={{y: 8, duration: 250}}>
                            <div class="pane-head">
                                <span class="icon-square" style="background: {style.tone};"><Icon name={style.icon} size={18} weight={2}/></span>
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
    width: min(1000px, calc(100% - 32px));
    height: min(640px, calc(100% - 32px));
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: var(--radius-lg);
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
    height: 64px;
    flex: none;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0 12px 0 24px;
    cursor: grab;
  }

  .dragging header {
    cursor: grabbing;
  }

  .brand {
    width: 176px;
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .wordmark {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  .version {
    font-size: 12px;
    color: var(--label-secondary);
    white-space: nowrap;
  }

  .search {
    width: 360px;
    min-height: 40px;
    min-width: 0;
    cursor: text;

    input {
      font-size: 15px;
      letter-spacing: -0.23px;
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
    width: 208px;
    flex: none;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
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
    height: 44px;
    border-radius: var(--radius-md);
    background: var(--glass-selection);
    transition: transform 0.45s cubic-bezier(0.3, 1.3, 0.5, 1), opacity 0.2s ease;
    pointer-events: none;
  }

  .side-row {
    all: unset;
    position: relative;
    height: 44px;
    flex: none;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 12px 0 8px;
    border-radius: var(--radius-md);
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: -2px;
    }

    &.active .side-label {
      color: var(--accent-text);
      font-weight: 600;
    }
  }

  .side-label {
    flex: 1;
    font-size: 15px;
    color: var(--label);
    transition: color 0.2s ease;
  }

  .count {
    font-size: 12px;
    color: var(--label-secondary);
    font-variant-numeric: tabular-nums;
  }

  .icon-btn {
    all: unset;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: var(--accent-text);
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.35s cubic-bezier(0.3, 1.4, 0.5, 1);

    &:hover {
      background: var(--fill-tertiary);
    }

    &.active {
      background: var(--accent-tint);
    }

    &:active {
      transform: scale(0.94);
    }

    &:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }
  }

  .icon-square {
    width: 29px;
    height: 29px;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-xs);
    color: #fff;
  }

  .list {
    width: 340px;
    flex: none;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .list-head {
    height: 56px;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
  }

  .list-title {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.2px;
  }

  .meta {
    font-size: 13px;
    color: var(--label-secondary);
  }

  .rows {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 0 8px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .row {
    min-height: 56px;
    flex: none;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: var(--radius-md);
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
    gap: 2px;
  }

  .row-name {
    font-size: 15px;
    font-weight: 500;
    color: var(--label-secondary);
    transition: color 0.2s ease;

    &.on {
      color: var(--label);
    }
  }

  .row-desc {
    font-size: 12px;
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
    padding: 20px 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .pane-head {
    display: flex;
    align-items: flex-start;
    gap: 12px;

    .icon-square {
      margin-top: 2px;
    }
  }

  .pane-title {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .title-line {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .pane-name {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  .status {
    font-size: 13px;
    font-weight: 600;
    color: var(--label-secondary);
    transition: color 0.2s ease;

    &.on {
      color: var(--success-text);
    }
  }

  .pane-desc {
    font-size: 13px;
    color: var(--label-secondary);
    text-wrap: pretty;
  }

  /* grouped list: settings are rows on fill-tertiary with inset hairlines */
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

  .footer {
    font-size: 12px;
    color: var(--label-secondary);
    padding: 0 16px;
    margin-top: -12px;
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
