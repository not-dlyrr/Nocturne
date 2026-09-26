<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import ToolTip from "../../common/ToolTip.svelte";
    import TitleButtonIcon from "./TitleButtonIcon.svelte";

    export let title: string;
    export let icon: string;
    export let parentHovered: boolean;

    const dispatch = createEventDispatcher();
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="child-button" on:click|stopPropagation={() => dispatch("click")} class:parent-hovered={parentHovered}>
    <ToolTip text="Join a Realms Server" />

    <div class="icon">
        <TitleButtonIcon {icon} />
    </div>

    <div class="title">{title}</div>
</div>

<style lang="scss">
    .child-button {
      position: relative;
      height: 28px;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 10px 0 8px;
      border-radius: var(--radius-pill);
      background-color: var(--accent-tint);
      transition: background-color 0.2s ease, transform 0.35s cubic-bezier(0.3, 1.4, 0.5, 1);

      &.parent-hovered,
      &:hover {
        background-color: var(--accent);

        .icon,
        .title {
          color: var(--on-accent);
        }
      }

      &:active {
        transform: scale(0.96);
      }
    }

    .title {
      color: var(--accent-text);
      font-weight: 600;
      font-size: 12px;
      transition: color 0.2s ease;
    }

    .icon { /* necessary because svelte's transition system sucks */
      display: flex;
      color: var(--accent-text);
      transition: color 0.2s ease;

      :global(.title-button-icon-size) {
        width: 14px;
        height: 14px;
      }
    }
</style>
