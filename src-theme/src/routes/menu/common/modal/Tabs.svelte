<script lang="ts">
    import type {Component, Snippet} from "svelte";

    type Content = Component | Snippet;

    type SubTab = {
        title: string;
        content: Content;
    };

    type Tab = {
        title: string;
        icon: string;
        content: Content | SubTab[];
    };

    let availableTabsElement = $state<HTMLElement | undefined>();
    let activeSubTabs = $state<Record<number, number>>({});

    let {tabs, activeTab = $bindable(0), onChangeTab}: {
        tabs: Tab[];
        activeTab?: number;
        onChangeTab?: (activeTab: number) => void | Promise<void>;
    } = $props();

    const ActiveContent = $derived.by(() => {
        const content = tabs[activeTab]?.content;

        if (Array.isArray(content)) {
            if (content.length === 0) {
                return undefined;
            }

            const activeSubTab = activeSubTabs[activeTab] ?? 0;
            return content[Math.min(activeSubTab, content.length - 1)]?.content;
        }

        return content;
    });

    function setActiveTab(i: number) {
        activeTab = i;
        onChangeTab?.(activeTab);
    }

    function setActiveSubTab(i: number) {
        activeSubTabs[activeTab] = i;
    }
</script>

<div class="tabs">
    <div class="available-tabs sg-seg" role="radiogroup" aria-label="Account type" bind:this={availableTabsElement}
         style="--n: {tabs.length}; --i: {activeTab};">
        <span class="sg-seg-thumb"></span>
        {#each tabs as {title, icon}, index}
            <button
                    class="tab-button sg-seg-item"
                    class:is-on={index === activeTab}
                    role="radio"
                    aria-checked={index === activeTab}
                    onclick={() => setActiveTab(index)}
                    type="button"
            >
                <img class="icon" src="img/menu/altmanager/{icon}" alt="">
                <span>{title}</span>
            </button>
        {/each}
    </div>

    <div style="width: {availableTabsElement?.clientWidth}px">
        {#if Array.isArray(tabs[activeTab]?.content)}
            {@const subTabs = tabs[activeTab].content as SubTab[]}
            <div class="available-sub-tabs sg-seg" role="radiogroup" aria-label="Sign-in method"
                 style="--n: {subTabs.length}; --i: {Math.min(activeSubTabs[activeTab] ?? 0, subTabs.length - 1)};">
                <span class="sg-seg-thumb"></span>
                {#each subTabs as subTab, index (subTab.title)}
                    <button
                            class="sub-tab-button sg-seg-item"
                            class:is-on={index === (activeSubTabs[activeTab] ?? 0)}
                            role="radio"
                            aria-checked={index === (activeSubTabs[activeTab] ?? 0)}
                            onclick={() => setActiveSubTab(index)}
                            type="button"
                    >
                        {subTab.title}
                    </button>
                {/each}
            </div>
        {/if}

        <div class="content">
            {#if ActiveContent}
                <ActiveContent/>
            {/if}
        </div>
    </div>
</div>

<style lang="scss">
  .available-tabs {
    display: grid;
    width: 100%;
  }

  .tab-button {
    min-width: 0;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 8px;
    font-size: 12px;
    white-space: nowrap;

    .icon {
      width: 14px;
      height: 14px;
      object-fit: contain;
    }
  }

  .available-sub-tabs {
    display: grid;
    width: 100%;
    margin-top: 8px;
  }

  .sub-tab-button {
    min-width: 0;
    height: 24px;
    padding: 0 8px;
    font-size: 11px;
  }

  .content {
    margin-top: 14px;
  }
</style>
