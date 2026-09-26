<script lang="ts">
    import {fade, scale} from "svelte/transition";
    import {backOut} from "svelte/easing";
    import {createEventDispatcher} from "svelte";
    import {portal} from "../../../../integration/util";

    export let title: string;
    export let visible: boolean;

    const dispatch = createEventDispatcher();

    function handleClick() {
        dispatch("close");
        visible = false;
    }
</script>

{#if visible}
    <div class="modal-wrapper" transition:fade={{duration: 150}} use:portal>
        <div class="modal nc-surface" transition:scale={{duration: 250, start: 0.96, easing: backOut}}>
            <div class="head">
                <div class="title">{title}</div>
                <button class="button-modal-close" type="button" aria-label="Close" on:click={handleClick}>
                    <img src="img/menu/icon-close.svg" alt="close">
                </button>
            </div>

            <div class="content">
                <slot />
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
  .modal-wrapper {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background-color: rgba(0, 0, 0, 0.45);
    z-index: 999;
  }

  .modal {
    width: 420px;
    max-width: 100%;
    padding: 16px 20px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    border-radius: var(--radius-lg);
    font-family: var(--font-text);
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .title {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.3px;
    color: var(--label);
  }

  .content {
    display: flex;
    flex-direction: column;
    row-gap: 10px;

    /* switch settings read as grouped rows in a sheet: label left, switch right */
    :global(.switch-setting) {
      flex-direction: row-reverse;
      justify-content: space-between;
      height: 36px;
      padding: 0 8px 0 12px;
      border-radius: var(--radius-sm);
      background-color: var(--fill-tertiary);
    }

    /* the resource pack / proxy type dropdowns span the sheet */
    :global(.select .header) {
      height: 36px;
      border-radius: var(--radius-sm);
    }

    :global(.select .options) {
      width: 100%;
    }

    /* primary action gets a touch of room above it */
    :global(.sg-btn-filled) {
      margin-top: 4px;
    }
  }

  .button-modal-close {
    height: 26px;
    width: 26px;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    border-radius: 50%;
    background-color: var(--fill-tertiary);
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.35s cubic-bezier(0.3, 1.4, 0.5, 1);

    img {
      width: 10px;
      height: 10px;
      opacity: 0.8;
    }

    &:hover {
      background-color: var(--fill-secondary);
    }

    &:active {
      transform: scale(0.96);
    }
  }

  @media screen and (max-height: 540px) {
    .modal {
      zoom: 0.85;
    }
  }
</style>
