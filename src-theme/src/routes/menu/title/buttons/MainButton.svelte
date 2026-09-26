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
     on:click={() => dispatch("click")} out:fly|global={{duration: 400, x: -500, delay: index * 100, easing: backIn}}
     in:fly|global={{duration: 400, x: -500, delay: index * 100, easing: backOut}}>
    <div class="icon">
        <TitleButtonIcon {icon} />
    </div>

    <div class="title">{title}</div>

    <div class="wrapped-content">
        <slot parentHovered={hovered}/>
    </div>
</div>

<style lang="scss">
  /* santi.glass solid card with an icon square; press scales like DS buttons */
  .main-button {
    width: 460px;
    padding: 14px 20px 14px 14px;
    display: grid;
    grid-template-columns: max-content 1fr max-content;
    align-items: center;
    column-gap: 16px;
    cursor: pointer;
    border-radius: var(--radius-lg);
    transition: background-color 0.2s ease, transform 0.35s cubic-bezier(0.3, 1.4, 0.5, 1);

    &:hover {
      background-color: color-mix(in srgb, var(--surface), white 6%);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .icon {
    background-color: var(--accent);
    color: var(--on-accent);
    width: 56px;
    height: 56px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.3px;
    color: var(--label);
  }
</style>
