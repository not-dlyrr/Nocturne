<script lang="ts">
    export let max: number;
    export let value: number;
    export let color: string;
    export let alignRight: boolean;
    export let label: string | null = null;
    export let icon: string | null = null;
</script>

<div class="progress" class:align-right={alignRight}>
    {#if icon}
        <img class="icon" src="img/hud/hotbar/icon-{icon}.svg" alt={icon}>
    {/if}
    <div class="track">
        <div
                class:align-right={alignRight}
                class="progress-bar"
                style="width: {Math.floor(
                (value / max) * 100,
            )}%; background-color: {color};"
        ></div>
    </div>
    {#if label}
        <div class="label">{label}</div>
    {/if}
</div>

<style lang="scss">
  .progress {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 12px;

    &.align-right {
      flex-direction: row-reverse;
    }
  }

  .icon {
    flex: none;
    width: 10px;
    height: 10px;
  }

  .label {
    flex: none;
    color: var(--label);
    font-family: var(--font-text);
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .track {
    flex: 1;
    height: 5px;
    border-radius: var(--radius-pill);
    background: var(--fill-secondary);
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    border-radius: var(--radius-pill);
    will-change: width;
    transition: width 0.2s ease;

    &.align-right {
      margin-left: auto;
    }
  }
</style>
