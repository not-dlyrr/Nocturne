<script lang="ts">
    import Header from "./header/Header.svelte";
    import {fly} from "svelte/transition";
    import {cubicOut} from "svelte/easing";
    import {onMount} from "svelte";

    const transitionDuration = 200; // TODO: suboptimal

    let ready = false;

    onMount(() => {
        setTimeout(() => {
            ready = true;
        }, transitionDuration);
    });
</script>

<div class="menu">
    {#if ready}
        <div in:fly|global={{duration: 350, y: -12, easing: cubicOut}}>
            <Header/>
        </div>
    {/if}

    <div class="menu-wrapper">
        <slot/>
    </div>
</div>

<style lang="scss">
  .menu {
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    // Not sized in vh, which not every browser scales with zoom
    position: fixed;
    inset: 0;
  }

  .menu-wrapper {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  /* The desktop-sized chrome fits most windows as is; only shrink on really small ones. */
  @media screen and (max-width: 1000px), screen and (max-height: 640px) {
    .menu {
      zoom: 0.85;
    }
  }

  @media screen and (max-width: 760px), screen and (max-height: 480px) {
    .menu {
      zoom: 0.7;
    }
  }
</style>
