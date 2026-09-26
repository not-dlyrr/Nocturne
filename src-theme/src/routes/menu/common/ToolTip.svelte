<script lang="ts">
    import {fly} from "svelte/transition";
    import {onMount, tick} from "svelte";
    import {portal} from "../../../integration/util";
    import {location} from "svelte-spa-router";
    import {routeChangeStart} from "../../../integration/router";

    export let text: string;
    export let color = "var(--tooltip-background-color)";

    let element: HTMLElement;
    let shown = false;
    let x = 0;
    let y = 0;

    function updatePosition() {
        const parent = element.parentElement;
        if (!parent) return;

        const bounding = parent.getBoundingClientRect();

        x = bounding.left + bounding.width / 2;
        y = bounding.top;
    }

    async function show() {
        updatePosition();
        shown = true;
        await tick();
        updatePosition();
    }

    function hide() {
        shown = false;
    }

    onMount(() => {
        const unsubscribeRouteChangeStart = routeChangeStart.subscribe(hide);
        const unsubscribeLocation = location.subscribe(hide);
        const parent = element.parentElement;
        if (!parent) {
            return () => {
                unsubscribeRouteChangeStart();
                unsubscribeLocation();
            };
        }

        parent.addEventListener("mouseenter", show);
        parent.addEventListener("mouseleave", hide);

        return () => {
            unsubscribeRouteChangeStart();
            unsubscribeLocation();
            parent.removeEventListener("mouseenter", show);
            parent.removeEventListener("mouseleave", hide);
        };
    });
</script>

<div bind:this={element}>
    {#if shown}
        <div transition:fly="{{ y: 4, duration: 150 }}" class="tooltip"
             style="background-color: {color}; left: {x}px; top: {y}px;" use:portal>{text}</div>
    {/if}
</div>

<style lang="scss">
  .tooltip {
    color: var(--tooltip-text-color);
    padding: 4px 9px;
    border-radius: var(--radius-xs);
    border: 0.5px solid var(--glass-stroke);
    box-shadow: var(--shadow-solid);
    font-family: var(--font-text);
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    position: fixed;
    white-space: nowrap;
    transform: translate(-50%, calc(-100% - 6px));
    pointer-events: none;
    z-index: 9999;
  }
</style>
