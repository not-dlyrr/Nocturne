<script lang="ts">
    import {onMount, tick} from "svelte";
    import {getComponentSettings, setComponentSettings} from "../../../../integration/rest";
    import type {Alignment, ConfigurableSetting} from "../../../../integration/types";
    import TogglableSetting from "../../setting/TogglableSetting.svelte";

    export let name: string;
    export let id: string;
    export let alignment: Alignment;
    export let overlayOffset = 0;

    let element: HTMLElement | undefined;
    let configurable: ConfigurableSetting | undefined;

    let bottom = false;
    let marginLeft = 0;
    let componentHeight = 0;

    const SCREEN_EDGE_MARGIN = 10;

    $: alignment.horizontalAlignment,
        alignment.horizontalOffset,
        alignment.verticalAlignment,
        alignment.verticalOffset,
        updatePosition();

    async function updatePosition() {
        await tick();

        if (!element) {
            return;
        }

        const componentElement = element.parentElement;
        if (componentElement) {
            const componentBounds = componentElement.getBoundingClientRect();
            componentHeight = componentElement.offsetHeight;
            bottom = componentBounds.top + componentBounds.height / 2 < window.innerHeight / 2;
        }

        const bounding = element.getBoundingClientRect();

        if (bounding.right > window.innerWidth - SCREEN_EDGE_MARGIN) {
            marginLeft = window.innerWidth - SCREEN_EDGE_MARGIN - bounding.right;
        } else if (bounding.left < SCREEN_EDGE_MARGIN) {
            marginLeft = SCREEN_EDGE_MARGIN - bounding.left;
        } else {
            marginLeft = 0;
        }
    }

    async function handleSettingChange() {
        if (!configurable) {
            return;
        }

        await setComponentSettings(id, configurable);
    }

    async function loadSettings() {
        const settings = await getComponentSettings(id);
        settings.value = settings.value.filter(setting => setting.name !== "Alignment");
        configurable = settings;
    }

    onMount(() => {
        const resizeObserver = new ResizeObserver(updatePosition);

        resizeObserver.observe(element!);
        if (element?.parentElement) {
            resizeObserver.observe(element.parentElement);
        }

        window.addEventListener("resize", updatePosition);
        loadSettings();

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updatePosition);
        };
    });
</script>

<div
        class="settings-wrapper"
        class:bottom
        style="--component-height: {componentHeight}px; --overlay-offset: {overlayOffset}px"
        bind:this={element}
>
    <div class="settings" style="transform: translateX({marginLeft}px)">
        {#if configurable !== undefined}
            <TogglableSetting path="hud.components.{name}.{id}" bind:setting={configurable} on:change={handleSettingChange}>
                <div class="remove-component" slot="control" let:disable let:label>
                    <span>{label}</span>
                    <button
                            type="button"
                            title="Remove Component"
                            aria-label="Remove component"
                            on:click={disable}
                    >
                        <img src="img/clickgui/icon-cross.svg" alt="">
                    </button>
                </div>
            </TogglableSetting>
        {/if}
    </div>
</div>

<style lang="scss">
  .settings-wrapper {
    position: absolute;
    top: 0;
    left: 50%;
    transition: ease transform .2s;
    transform: translateY(calc(-100% - 10px - var(--overlay-offset))) translateX(-50%);

    .settings {
      width: 240px;
      max-height: 350px;
      overflow: auto;
      padding: 0 12px 2px;
      border-radius: var(--radius-md);
      background-color: var(--surface);
      border: 0.5px solid var(--glass-stroke);
      box-shadow: var(--shadow-glass-edge), var(--shadow-solid);
      font-family: var(--font-text);

      &::-webkit-scrollbar {
        width: 2px;
        height: 2px;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 2px;
      }

      .remove-component {
        display: flex;
        align-items: center;
        gap: 8px;

        span {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          color: var(--label);
          font-size: 13px;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        button {
          width: 22px;
          height: 22px;
          flex: none;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 50%;
          background-color: var(--fill-tertiary);
          cursor: pointer;
          transition: background-color 0.2s ease;

          img {
            display: block;
            width: 8px;
            height: 8px;
          }

          &:hover {
            background-color: color-mix(in srgb, var(--danger) 30%, transparent);
          }
        }
      }
    }

    &.bottom {
      transform: translateY(calc(var(--component-height) + 10px + var(--overlay-offset))) translateX(-50%);
    }
  }
</style>
