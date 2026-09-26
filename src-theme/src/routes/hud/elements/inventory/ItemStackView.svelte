<script lang="ts">
    import type {ItemStack} from "../../../../integration/types";
    import {mapToColor} from "../../../../util/color_utils";
    import {itemTextureUrl} from "../../../../integration/rest";

    export let stack: ItemStack;

    const {count, damage, identifier, maxDamage, enchantments} = stack;

    const countColor = count <= 0 ? "red" : "white";

    const valueColor = mapToColor(120 * (maxDamage - damage) / maxDamage);
</script>

<div class="item-stack">
    {#if enchantments}
        <div class="mask" style="mask-image: url({itemTextureUrl(identifier)})"></div>
    {/if}
    <img class="item-icon" src={itemTextureUrl(identifier)} alt={identifier}/>

    <div class="durability-bar" class:hidden={damage === 0}>
        <div class="durability"
             style="width: {100 * (maxDamage - damage) / maxDamage}%; background-color: {valueColor}">
        </div>
    </div>

    <div class="count" class:hidden={count === 1 || identifier === "minecraft:air"} style="color: {countColor}">
        {count}
    </div>
</div>

<style lang="scss">
  .hidden {
    display: none;
  }

  .item-stack {
    position: relative;
    width: 36px;
    height: 36px;
    padding: 2px;
    border-radius: var(--radius-xs);
    background: var(--fill-tertiary);
  }

  .mask {
    position: absolute;
    background: radial-gradient(circle, var(--item-enchant-glow-start-color), var(--item-enchant-glow-end-color) 100%);
    mix-blend-mode: screen;
    scale: 105%;
    top: 2px;
    left: 2px;
    width: 32px;
    height: 32px;
    mask-size: cover;
  }

  .item-icon {
    display: block;
    width: 100%;
    height: 100%;
  }

  .durability-bar {
    position: absolute;
    bottom: 3px;
    left: 6px;
    right: 6px;
    height: 2px;
    border-radius: var(--radius-pill);
    overflow: hidden;
    background-color: var(--item-damage-background-color);
  }

  .durability {
    height: 100%;
    transition: width 150ms;
  }

  .count {
    position: absolute;
    bottom: 1px;
    right: 3px;
    font-family: var(--font-text);
    font-size: 12px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    text-shadow: 1px 1px var(--item-count-shadow-color); // This is inconsistent with other UI elements but it looks better so I will let it pass ~Senk Ju
  }
</style>
