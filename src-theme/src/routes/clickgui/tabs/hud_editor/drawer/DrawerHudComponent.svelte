<script lang="ts">

    import type {HudComponentCatalogEntry} from "../../../../../integration/types";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../../../theme/theme_config";

    interface Props {
        component: HudComponentCatalogEntry,
        onselect: (component: HudComponentCatalogEntry) => void
    }

    const {component, onselect}: Props = $props();
</script>

<button
        type="button"
        class="drawer-hud-component"
        disabled={!component.canAdd}
        onclick={() => onselect(component)}
>
    <span class="name">{$spaceSeperatedNames ? convertToSpacedString(component.name) : component.name}</span>
    <span class="description">{component.description}</span>
</button>

<style lang="scss">
  .drawer-hud-component {
    all: unset;
    display: block;
    box-sizing: border-box;
    width: 100%;
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:disabled {
      opacity: 0.4;
      cursor: default;
    }

    &:not(:disabled):hover {
      background-color: var(--fill-tertiary);
    }

    &:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: -2px;
    }
  }

  .name {
    display: block;
    color: var(--label);
    font-weight: 600;
    font-size: 13px;
  }

  .description {
    display: block;
    color: var(--label-secondary);
    font-size: 11px;
    line-height: 14px;
  }
</style>
