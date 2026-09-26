<script lang="ts">
    import type {HudComponentCatalogEntry, Metadata} from "../../../../../integration/types";
    import {onMount, tick} from "svelte";
    import {addComponent, getComponentCatalog, getMetadata} from "../../../../../integration/rest";
    import DrawerHudComponent from "./DrawerHudComponent.svelte";
    import {fly} from "svelte/transition";
    import Icon from "../../../../../components/sg/Icon.svelte";

    let metadata: Metadata;

    let drawerShown = $state(false);
    let components: HudComponentCatalogEntry[] = $state([]);
    let filteredComponents: HudComponentCatalogEntry[] = $state([]);
    let drawerElement: HTMLElement | null = $state(null);
    let searchInput: HTMLInputElement | null = $state(null);
    let query = $state("");

    onMount(async () => {
        metadata = await getMetadata();
        await refreshComponents();
    });

    async function refreshComponents() {
        components = (await getComponentCatalog(metadata.id)).sort((a, b) => a.name.localeCompare(b.name));
        filteredComponents = components.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
    }

    function handleWindowClick(e: MouseEvent) {
        if (!e.target || !drawerElement) return;

        if (!drawerElement.contains(e.target as HTMLBRElement)) {
            drawerShown = false;
        }
    }

    function handleSearch() {
        filteredComponents = components.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
    }

    async function toggleDrawer() {
        drawerShown = !drawerShown;
        query = "";

        if (drawerShown) {
            await refreshComponents();
            await tick();
            searchInput?.focus();
        }
    }

    async function handleAddComponent(component: HudComponentCatalogEntry) {
        await addComponent(component.id);
        if (component.singleton) {
            component.canAdd = false;
        }
        drawerShown = false;
        query = "";
    }
</script>

<svelte:window onclick={handleWindowClick}/>

<div class="component-drawer" bind:this={drawerElement}>
    <button class="button-toggle-drawer sg-btn sg-btn-filled sg-btn-small" type="button" onclick={toggleDrawer}>
        <Icon name="plus" size={13} weight={2.4}/>
        Add Component
    </button>

    {#if drawerShown}
        <div class="drawer nc-surface" transition:fly={{ y: -6, duration: 200 }}>
            <label class="search sg-search nc-field">
                <Icon name="search" size={13} weight={2.2}/>
                <input bind:this={searchInput} type="text" placeholder="Search Components" bind:value={query}
                       oninput={handleSearch} spellcheck="false">
            </label>

            <div class="component-list">
                {#if filteredComponents.length !== 0}
                    {#each filteredComponents as c}
                        <DrawerHudComponent component={c} onselect={handleAddComponent}/>
                    {/each}
                {:else}
                    <span class="no-results">No components found</span>
                {/if}
            </div>
        </div>
    {/if}
</div>

<style lang="scss">
  .component-drawer {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    top: 24px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: var(--font-text);
  }

  .button-toggle-drawer {
    min-height: 30px;
    height: 30px;
    padding: 0 14px 0 10px;
    font-size: 13px;
    line-height: 18px;
    box-shadow: var(--shadow-solid);
  }

  .drawer {
    position: absolute;
    top: 100%;
    left: 50%;
    width: 360px;
    margin-top: 8px;
    padding: 6px;
    border-radius: var(--radius-md);
    transform: translateX(-50%);
  }

  .search {
    min-width: 0;
    min-height: 30px;
    margin-bottom: 4px;
    padding: 0 12px;
    gap: 6px;

    input {
      font-size: 13px;
      line-height: 18px;
    }
  }

  .component-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    max-height: 380px;
    overflow: auto;
  }

  .no-results {
    padding: 16px 8px 12px;
    color: var(--label-secondary);
    font-size: 12px;
    text-align: center;
  }
</style>
