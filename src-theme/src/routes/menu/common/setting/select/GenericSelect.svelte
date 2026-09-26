<script lang="ts">
    import {fly} from "svelte/transition";
    import Icon from "../../../../../components/sg/Icon.svelte";

    export let closeOnInternalClick: boolean;

    let expanded = false;
    let selectElement: HTMLElement;
    let headerElement: HTMLElement;

    function handleWindowClick(e: MouseEvent) {
        if (!selectElement.contains(e.target as Node)) {
            expanded = false;
        }
    }

    function handleSelectClick(e:MouseEvent) {
        if (closeOnInternalClick) {
            expanded = !expanded;
        } else {
            if (!expanded) {
                expanded = true;
            } else {
                expanded = !headerElement.contains(e.target as Node);
            }
        }
    }
</script>

<svelte:window on:click={handleWindowClick}/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="select" class:expanded bind:this={selectElement} on:click={handleSelectClick}>
    <div class="header" bind:this={headerElement}>
        <span class="title">
            <slot name="title"/>
        </span>
        <span class="chevron"><Icon name="chevron" size={12} weight={2.4}/></span>
    </div>
    {#if expanded}
        <div class="options" transition:fly={{ y: -4, duration: 150 }}>
            <slot name="options"></slot>
        </div>
    {/if}
</div>

<style lang="scss">
  .select {
    cursor: pointer;
    position: relative;
    flex: none;
  }

  .header {
    height: 30px;
    padding: 0 10px 0 12px;
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: space-between;
    border-radius: var(--radius-pill);
    background-color: var(--fill-tertiary);
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--fill-secondary);
    }

    .title {
      color: var(--label);
      font-size: 13px;
      font-weight: 500;
      letter-spacing: -0.08px;
      white-space: nowrap;
    }
  }

  .chevron {
    display: flex;
    color: var(--label-secondary);
    transform: rotate(90deg);
    transition: transform 0.35s cubic-bezier(0.3, 1.4, 0.5, 1);
  }

  .expanded .chevron {
    transform: rotate(-90deg);
  }

  .options {
    position: absolute;
    z-index: 1000;
    top: calc(100% + 4px);
    left: 0;
    min-width: max(100%, 160px);
    max-height: 250px;
    overflow: auto;
    padding: 4px;
    border-radius: var(--radius-sm);
    background-color: var(--surface-elevated);
    border: 0.5px solid var(--glass-stroke);
    box-shadow: var(--shadow-solid);
  }
</style>
