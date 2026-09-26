<script lang="ts">
    import {listen} from "../../../../integration/ws.js";
    import type {PlayerData} from "../../../../integration/types";
    import {REST_BASE} from "../../../../integration/host";
    import {fly} from "svelte/transition";
    import type {ClientPlayerDataEvent, TargetChangeEvent} from "../../../../integration/events";

    let target: PlayerData | null = null;
    let self: PlayerData | null = null;
    let visible = true;

    let hideTimeout: number;

    function startHideTimeout() {
        hideTimeout = setTimeout(() => {
            visible = false;
        }, 1000);
    }

    listen("targetChange", (data: TargetChangeEvent) => {
        target = data.target;
        visible = true;
        clearTimeout(hideTimeout);
        startHideTimeout();
    });

    listen("clientPlayerData", (data: ClientPlayerDataEvent) => {
        self = data.playerData;
    });

    startHideTimeout();

    $: maxHealth = target ? target.maxHealth + target.absorption : 20;
    $: health = target ? target.actualHealth + target.absorption : 0;
    $: distance = target && self
        ? Math.hypot(target.position.x - self.position.x, target.position.y - self.position.y, target.position.z - self.position.z)
        : null;
</script>

{#if visible && target != null}
    <div class="targethud sg-glass sg-glass-strong nc-hud-glass" transition:fly={{ y: 8, duration: 250 }}>
        <div class="avatar">
            <img src="{REST_BASE}/api/v1/client/resource/skin?uuid={target.uuid}" alt="" />
        </div>
        <div class="info">
            <div class="top">
                <span class="name">{target.username}</span>
                {#if distance !== null}
                    <span class="distance">{distance.toFixed(1)} m</span>
                {/if}
            </div>
            <div class="bar">
                <div class="fill" style="width: {Math.max(0, Math.min(100, health / maxHealth * 100))}%;"></div>
            </div>
            <span class="hp">{health.toFixed(1)} <span class="dim">/ {maxHealth.toFixed(0)} HP</span></span>
        </div>
    </div>
{/if}

<style lang="scss">
  .targethud {
    width: 280px;
    display: flex;
    gap: 12px;
    padding: 12px;
    border-radius: var(--radius-lg);
  }

  .avatar {
    width: 44px;
    height: 44px;
    flex: none;
    position: relative;
    border-radius: var(--radius-sm);
    overflow: hidden;
    image-rendering: pixelated;
    background: var(--fill-secondary) url("/img/steve.png") no-repeat center / cover;

    img {
      position: absolute;
      scale: 5.5;
      left: 100px;
      top: 100px;
    }
  }

  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
  }

  .top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
  }

  .name {
    font-size: 15px;
    font-weight: 600;
    color: var(--label);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .distance {
    font-size: 13px;
    color: var(--label-secondary);
    font-variant-numeric: tabular-nums;
  }

  .bar {
    height: 6px;
    border-radius: var(--radius-pill);
    background: var(--fill-secondary);
    overflow: hidden;
  }

  .fill {
    height: 100%;
    border-radius: var(--radius-pill);
    background: var(--accent);
    transition: width 0.45s cubic-bezier(0.3, 1.3, 0.5, 1);
  }

  .hp {
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--label);
  }

  .dim {
    color: var(--label-secondary);
  }
</style>
