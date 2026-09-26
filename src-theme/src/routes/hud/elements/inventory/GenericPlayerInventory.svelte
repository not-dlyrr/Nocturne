<script lang="ts">
    import type {ItemStack} from "../../../../integration/types";
    import {listen} from "../../../../integration/ws";
    import type {ClientPlayerInventoryEvent, PlayerInventory} from "../../../../integration/events";
    import ItemStackView from "./ItemStackView.svelte";
    import {onMount} from "svelte";
    import {getPlayerInventory} from "../../../../integration/rest";

    export let rowLength: number;
    export let backgroundColor: string = "var(--inventory-background-color)";
    export let gap: string = "0.5rem";
    export let getRenderedStacks: (inventory: PlayerInventory) => ItemStack[];

    let inventory: PlayerInventory | undefined;
    let stacks: ItemStack[] = [];

    listen("clientPlayerInventory", (data: ClientPlayerInventoryEvent) => {
        inventory = data.inventory;
    });

    onMount(async () => {
        inventory = await getPlayerInventory();
    });

    $: stacks = inventory ? getRenderedStacks(inventory) : [];
    // A backed inventory becomes a solid HUD card; transparent ones (armor, statistics) stay bare.
    $: surfaced = backgroundColor !== "transparent";
</script>

<div class="inventory" class:nc-surface={surfaced} class:nc-hud={surfaced} style="
    {surfaced ? "" : `background-color: ${backgroundColor};`}
    gap: {gap};
    --row-length: {rowLength};
">
    {#each stacks as stack (stack)}
        <ItemStackView {stack}/>
    {/each}
</div>

<style lang="scss">
  .inventory {
    padding: 4px;
    border-radius: var(--radius-md);
    display: grid;
    grid-template-columns: repeat(var(--row-length), 1fr);

    &.nc-surface {
      padding: 8px;
    }
  }
</style>
