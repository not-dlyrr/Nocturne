<script lang="ts">
    import {listen} from "../../../integration/ws";
    import type {ClientPlayerDataEvent, ClientPlayerEffectEvent} from "../../../integration/events";
    import type {StatusEffect} from "../../../integration/types";
    import {effectTextureUrl} from "../../../integration/rest";

    let effects: StatusEffect[] = [];

    listen("clientPlayerData", (event: ClientPlayerDataEvent) => {
        effects = event.playerData.effects;
    });

    listen("clientPlayerEffect", (event: ClientPlayerEffectEvent) => {
        effects = event.effects;
    });

    function formatTime(duration: number): string {
        if (duration === -1) {
            return "*:*";
        }

        const totalSeconds = Math.floor(duration / 20);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    function formatAmplifier(n: number): string {
        return (n + 1).toString();
    }
</script>

{#if effects.length > 0}
    <div class="effects nc-glass">
        {#each effects as e}
            <div class="effect">
                <img class="effect-icon" src={effectTextureUrl(e.effect)} alt={e.localizedName}/>
                <span class="name">{e.localizedName}  <span
                        class="amplifier">{formatAmplifier(e.amplifier)}</span></span>
                <span class="duration">{formatTime(e.duration)}</span>
            </div>
        {/each}
    </div>
{/if}

<style lang="scss">
  .effects {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 6px;
    border-radius: var(--radius-md);
    font-family: var(--font-text);
  }

  .effect {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 28px;
    padding: 0 6px 0 4px;
    font-size: 13px;

    .effect-icon {
      width: 18px;
      height: 18px;
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
      image-rendering: crisp-edges;
    }

    .name {
      color: var(--label);
      font-weight: 500;
    }

    .amplifier {
      margin-left: 2px;
      color: var(--label-secondary);
      font-weight: 600;
    }

    .duration {
      margin-left: auto;
      padding-left: 12px;
      color: var(--label-secondary);
      font-size: 12px;
      font-variant-numeric: tabular-nums;
    }
  }
</style>
