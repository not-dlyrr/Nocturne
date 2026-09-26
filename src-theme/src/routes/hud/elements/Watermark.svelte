<script lang="ts">
    import {onDestroy, onMount} from "svelte";
    import {listen} from "../../../integration/ws";
    import {getClientInfo} from "../../../integration/rest";
    import type {ClientPlayerDataEvent, FpsChangeEvent} from "../../../integration/events";

    let fps = 0;
    let ping: number | null = null;
    let clock = "";

    function updateClock() {
        const now = new Date();
        clock = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    }

    updateClock();
    const clockInterval = setInterval(updateClock, 1000);
    onDestroy(() => clearInterval(clockInterval));

    onMount(async () => {
        fps = (await getClientInfo()).fps;
    });

    listen("fps", (e: FpsChangeEvent) => {
        fps = e.fps;
    });

    listen("clientPlayerData", (e: ClientPlayerDataEvent) => {
        ping = e.playerData.ping;
    });
</script>

<div class="watermark nc-glass">
    <span class="wordmark">nocturne</span>
    <div class="stats">
        <span>{fps} <span class="unit">FPS</span></span>
        {#if ping !== null}
            <span class="divider"></span>
            <span>{ping} <span class="unit">ms</span></span>
        {/if}
        <span class="divider"></span>
        <span>{clock}</span>
    </div>
</div>

<style lang="scss">
  .watermark {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 8px 8px 16px;
    border-radius: var(--radius-pill);
    width: max-content;
  }

  .wordmark {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.2px;
    color: var(--label);
  }

  .stats {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 28px;
    padding: 0 12px;
    border-radius: var(--radius-pill);
    background: var(--fill-tertiary);
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    color: var(--label);
  }

  .unit {
    color: var(--label-secondary);
  }

  .divider {
    width: 0.5px;
    height: 14px;
    background: var(--separator);
  }
</style>
