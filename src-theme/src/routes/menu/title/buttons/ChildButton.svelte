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
    <ToolTip color="var(--menu-base-color)" text="Join Realms server" />

    <div class="icon">
        <TitleButtonIcon {icon} />
    </div>

    <div class="title">{title}</div>
</div>

<style lang="scss">
    .child-button {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px 8px 10px;
      border-radius: var(--radius-pill);
      background-color: var(--accent-tint);
      transition: background-color 0.2s ease;

      &.parent-hovered,
      &:hover {
        background-color: var(--accent);

        .icon,
        .title {
          color: var(--on-accent);
        }
      }
    }

    .title {
      color: var(--accent-text);
      font-weight: 600;
      font-size: 15px;
      transition: color 0.2s ease;
    }

    .icon { /* necessary because svelte's transition system sucks */
      color: var(--accent-text);
      width: 22px;
      height: 22px;
      transition: color 0.2s ease;
    }
</style>
