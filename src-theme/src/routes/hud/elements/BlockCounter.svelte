<script lang="ts">
    import {listen} from "../../../integration/ws";
    import {fly} from "svelte/transition";
    import {mapToColor} from "../../../util/color_utils";
    import {itemTextureUrl} from "../../../integration/rest";

    export let settings: { [name: string]: any };

    let cSettings: HudBlockCounterSettings;

    $: cSettings = settings as HudBlockCounterSettings;

    let nextBlock: string | undefined = undefined;
    let count: number | undefined = undefined;

    listen("blockCountChange", (data) => {
        nextBlock = data.nextBlock;
        count = data.count;
    });

    const FLEX_DIRECTION = {
        None: "row",
        Left: "row",
        Right: "row-reverse",
        Top: "column",
        Bottom: "column-reverse",
    };
</script>

{#if count !== undefined}
    <div class="counter nc-surface nc-hud" style="color: {mapToColor(count)}; flex-direction: {FLEX_DIRECTION[cSettings.iconPosition]}" in:fly={{ y: -5, duration: 200 }}
         out:fly={{ y: -5, duration: 200 }}>
        {#if nextBlock && cSettings.iconPosition !== "None"}
            <img class="icon" src={itemTextureUrl(nextBlock)} alt={nextBlock}/>
        {/if}
        {count}
    </div>
{/if}

<style lang="scss">
  .counter {
    border-radius: var(--radius-md);
    white-space: nowrap;
    padding: 6px 14px;
    font-family: var(--font-text);
    font-size: 15px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    text-align: center;
    width: fit-content;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    transform: translate(-100%);
  }

  .icon {
    width: 22px;
    height: 22px;
  }
</style>
