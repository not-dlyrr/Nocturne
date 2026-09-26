<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import RippleLoader from "../RippleLoader.svelte";

    export let image: string;
    export let imageText: string | null = null;
    export let imageTextBackgroundColor: string | null = null;
    export let title: string;
    export let favorite = false;

    const dispatch = createEventDispatcher();

    let previewImageLoaded = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="menu-list-item" on:dblclick={() => dispatch("dblclick")}>
    <div class="image">
        {#if !previewImageLoaded}
            <div class="loader">
                <RippleLoader size={28}/>
            </div>
        {/if}
        <img class="preview" on:load={() => previewImageLoaded = true} src={image} alt="preview">
        {#if favorite}
            <img class="favorite-mark" src="img/menu/icon-favorite-mark.svg" alt="fav">
        {/if}
    </div>
    <div class="title">
        <span class="text">{title}</span>
        <slot name="tag"/>
    </div>
    <div class="subtitle">
        <slot name="subtitle"/>
    </div>
    <div class="buttons">
        <div class="active">
            <slot name="active-visible"/>
        </div>

        {#if imageText !== null && imageTextBackgroundColor !== null}
            <span class="ping"><span class="dot" style="background-color: {imageTextBackgroundColor};"></span>{imageText}</span>
        {/if}

        <div class="always">
            <slot name="always-visible"/>
        </div>
    </div>
</div>

<style lang="scss">
  .menu-list-item {
    flex: none;
    display: grid;
    grid-template-areas:
        "a b c"
        "a d c";
    grid-template-columns: max-content minmax(0, 1fr) max-content;
    min-height: 48px;
    padding: 7px 8px;
    column-gap: 10px;
    row-gap: 1px;
    border-radius: var(--radius-sm);
    transition: background-color 0.2s ease;
    align-items: center;
    cursor: grab;

    &:hover {
      background-color: var(--fill-tertiary);

      .buttons .active {
        opacity: 1;
      }
    }

    &:focus-within .buttons .active {
      opacity: 1;
    }
  }

  .image {
    grid-area: a;
    position: relative;
    width: 32px;
    height: 32px;

    .loader {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .preview {
      display: block;
      height: 32px;
      width: 32px;
      object-fit: cover;
      border-radius: var(--radius-xs);
      image-rendering: pixelated;
    }

    .favorite-mark {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 13px;
      height: 13px;
    }
  }

  .title {
    grid-area: b;
    align-self: end;
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;

    .text {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -0.08px;
      color: var(--label);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .subtitle {
    grid-area: d;
    align-self: start;
    min-width: 0;
    font-size: 11px;
    line-height: 14px;
    color: var(--label-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .buttons {
    grid-area: c;
    display: flex;
    align-items: center;
    gap: 2px;

    .active {
      display: flex;
      gap: 2px;
      margin-right: 6px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .always {
      display: flex;
      gap: 2px;
    }

    /* the row's primary action (Join, Open, Login, Connect): an accent disc; the play glyph's own ring is its rim */
    .always :global(.button) {
      background-color: var(--accent);
    }

    .always :global(.button .icon) {
      width: 28px;
      height: 28px;
    }

    .always :global(.button:hover) {
      background-color: color-mix(in srgb, var(--accent) 85%, white);
    }
  }

  .ping {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-right: 8px;
    font-size: 11px;
    font-weight: 600;
    color: var(--label-secondary);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
  }
</style>
