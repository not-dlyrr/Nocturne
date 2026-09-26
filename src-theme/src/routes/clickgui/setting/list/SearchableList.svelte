<script lang="ts">
    import VirtualList from "./VirtualList.svelte";
    import type {NamedItem} from "../../../../integration/types.ts";

    export let items: NamedItem[];

    let searchQuery = "";
    let renderedItems: NamedItem[] = items;

    $: {
        const queryParts = searchQuery.toLowerCase().match(/\S+/g) ?? [];

        renderedItems = items.filter(item => {
            const name = item.name.toLowerCase();
            return queryParts.every(part => name.includes(part));
        });
    }
</script>

<div class="list-item-list">
    <input type="text" placeholder="Search Items" class="search-input" bind:value={searchQuery} spellcheck="false">
    <div class="results">
        <VirtualList items={renderedItems} let:item>
            <slot item={item} />
        </VirtualList>
    </div>
</div>

<style lang="scss">
  .results {
    height: 200px;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 100px;
    max-height: 500px;
    position: relative;
  }

  .search-input {
    width: 100%;
    height: 28px;
    margin-bottom: 6px;
    padding: 0 12px;
    border: 0.5px solid var(--glass-stroke);
    border-radius: var(--radius-pill);
    background-color: var(--fill-tertiary);
    color: var(--label);
    font-family: var(--font-text);
    font-size: 12px;
    outline: none;

    &:focus {
      outline: 2px solid var(--focus-ring);
      outline-offset: -1px;
    }

    &::placeholder {
      color: var(--label-secondary);
    }
  }
</style>
