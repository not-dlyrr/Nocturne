<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import {itemTextureUrl} from "../../../../integration/rest";

    const dispatch = createEventDispatcher<{
        toggle: { value: string, enabled: boolean }
    }>();

    export let value: string;
    export let name: string;
    export let icon: string | undefined;
    export let enabled: boolean;
    // NOTE: It would be better if enabled state handling was performed by a wrapper element.
    export let showEnabledState = true;
    export let pointerCursor = true;

    let showingFallbackImage = false;

    function showFallbackIcon(event: Event) {
        const img = event.currentTarget as HTMLImageElement;

        showingFallbackImage = true;
        img.src = itemTextureUrl("minecraft:grass_block");
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="item" class:has-icon={icon !== undefined} class:has-enabled-state={showEnabledState}
     class:pointer-cursor={pointerCursor} on:click={() => dispatch("toggle", {enabled: !enabled, value: value})}>
    {#if icon}
        <img class="icon" class:fallback={showingFallbackImage} src="{icon}" alt={value} on:error={showFallbackIcon}/>
    {/if}
    <div class="name">{name}</div>
    {#if showEnabledState}
        <div class="tick">
            {#if enabled}
                <img src="img/clickgui/icon-tick-checked.svg" alt="enabled">
            {:else}
                <img src="img/clickgui/icon-tick.svg" alt="disabled">
            {/if}
        </div>
    {/if}
</div>

<style lang="scss">
  .item {
    display: grid;
    grid-template-columns: 1fr;
    align-items: center;
    column-gap: 8px;
    min-height: 28px;
    margin: 0 4px 1px 0;
    padding: 2px 6px;
    border-radius: var(--radius-xs);
    transition: background-color 0.2s ease;

    &.pointer-cursor {
      cursor: pointer;

      &:hover {
        background-color: var(--fill-secondary);
      }
    }

    &.has-icon:not(.has-enabled-state) {
      grid-template-columns: max-content 1fr;
    }

    &.has-icon.has-enabled-state {
      grid-template-columns: max-content 1fr max-content;
    }

    &:not(.has-icon).has-enabled-state {
      grid-template-columns: 1fr max-content;
    }
  }

  .icon {
    height: 20px;
    width: 20px;
    image-rendering: pixelated;

    &.fallback {
      filter: grayscale(1);
    }
  }

  .name {
    font-size: 12px;
    color: var(--label);
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .tick {
    display: flex;

    img {
      width: 14px;
      height: 14px;
    }
  }
</style>
