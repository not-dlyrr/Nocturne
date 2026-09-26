<script lang="ts">
    import {fly} from "svelte/transition";
    import {createEventDispatcher} from "svelte";
    import {backIn, backOut} from "svelte/easing";
    import TitleButtonIcon from "./TitleButtonIcon.svelte";

    export let title: string;
    export let icon: string;
    export let index: number;

    let hovered = false;

    const dispatch = createEventDispatcher();
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="main-button nc-surface" on:mouseenter={() => hovered = true} on:mouseleave={() => hovered = false} on:click={() => hovered = false}
     on:click={() => dispatch("click")} out:fly={{duration: 220, x: -24, delay: index * 40, easing: backIn}}
     in:fly|global={{duration: 380, x: -24, delay: index * 50, easing: backOut}}>
    <div class="icon">
        <TitleButtonIcon {icon} />
    </div>

    <div class="title">{title}</div>

    <div class="wrapped-content">
        <slot parentHovered={hovered}/>
    </div>
</div>

<style lang="scss">
  /* santi.glass solid row with an icon square; press scales like DS buttons */
  .main-button {
    width: 300px;
    min-height: 44px;
    padding: 8px 12px 8px 8px;
    display: grid;
    grid-template-columns: max-content 1fr max-content;
    align-items: center;
    column-gap: 10px;
    cursor: pointer;
    border-radius: var(--radius-md);
    transition: background-color 0.2s ease, transform 0.35s cubic-bezier(0.3, 1.4, 0.5, 1);

    &:hover {
      background-color: color-mix(in srgb, var(--surface), white 5%);
    }

    &:active {
      transform: scale(0.96);
    }
  }

  .icon {
    background-color: var(--accent);
    color: var(--on-accent);
    width: 28px;
    height: 28px;
    border-radius: var(--radius-xs);
    display: flex;
    align-items: center;
    justify-content: center;

    :global(.title-button-icon-size) {
      width: 16px;
      height: 16px;
    }
  }

  .title {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.23px;
    color: var(--label);
  }
</style>
