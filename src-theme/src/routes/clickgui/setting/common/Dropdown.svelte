<script lang="ts">
    import {createEventDispatcher, tick} from "svelte";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../../theme/theme_config";

    export let name: string | null;
    export let options: string[];
    export let value: string;

    const dispatch = createEventDispatcher();

    let expanded = false;
    let dropdownHead: HTMLElement;
    let optionsStyle = "";

    function portal(node: HTMLElement) {
        document.body.appendChild(node);

        return {
            destroy: () => node.remove()
        };
    }

    function windowClickHide(e: MouseEvent) {
        if (!dropdownHead.contains(e.target as Node)) {
            expanded = false;
        }
    }

    function updateValue(v: string) {
        value = v;
        expanded = false;
        dispatch("change");
    }

    async function toggleExpanded() {
        expanded = !expanded;
        if (!expanded) {
            return;
        }

        await tick();
        updateOptionsPosition();
    }

    function updateOptionsPosition() {
        if (!expanded) {
            return;
        }

        const bounds = dropdownHead.getBoundingClientRect();
        const scale = bounds.width / dropdownHead.offsetWidth;
        optionsStyle = [
            `left: ${bounds.left}px`,
            `top: ${bounds.bottom}px`,
            `width: ${dropdownHead.offsetWidth}px`,
            `--dropdown-scale: ${scale}`
        ].join(";");
    }

    function closeDropdown() {
        expanded = false;
    }
</script>

<svelte:window
        on:click={windowClickHide}
        on:resize={updateOptionsPosition}
        on:scroll|capture={closeDropdown}
/>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="dropdown" class:expanded>
    <div class="head" class:named={name !== null} bind:this={dropdownHead} on:click={toggleExpanded}>
        {#if name !== null}
            <span class="label">{$spaceSeperatedNames ? convertToSpacedString(name) : name}</span>
        {/if}
        <span class="text">{$spaceSeperatedNames ? convertToSpacedString(value) : value}</span>
    </div>

    {#if expanded}
        <div class="options" style={optionsStyle} use:portal>
            {#each options as o (o)}
                <div
                        class="option"
                        class:active={o === value}
                        on:click={() => updateValue(o)}
                >
                    {$spaceSeperatedNames ? convertToSpacedString(o) : o}
                </div>
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">
  @use "../../icon-settings-expand" as *;

  .dropdown {
    position: relative;

    &.expanded .text::after {
      transform: translateY(calc(-50% - 1px)) rotate(0);
      opacity: 1;
    }
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    cursor: pointer;

    .label {
      flex: 1;
      min-width: 0;
      font-size: 13px;
      color: var(--label);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .text {
      position: relative;
      max-width: 60%;
      padding: 5px 30px 5px 12px;
      border-radius: var(--radius-pill);
      background-color: var(--clickgui-dropdown-trigger-background-color);
      font-size: 13px;
      font-weight: 600;
      color: var(--label);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: background-color 0.2s ease;
    }

    &:not(.named) .text {
      max-width: none;
      flex: 1;
    }

    &:hover .text {
      background-color: var(--fill-secondary);
    }

    .text::after {
      @include icon-settings-expand($right: 12px);
    }
  }

  .options {
    --dropdown-scale: 1;
    margin-top: 6px;
    padding: 4px;
    max-height: 280px;
    overflow-y: auto;
    background-color: var(--clickgui-dropdown-background-color);
    border: 0.5px solid var(--clickgui-dropdown-border-color);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-glass);
    z-index: 999999;
    position: fixed;
    box-sizing: border-box;
    transform: scale(var(--dropdown-scale));
    transform-origin: top left;
    font-family: var(--font-text);

    .option {
      color: var(--clickgui-dropdown-option-color);
      font-size: 13px;
      font-weight: 500;
      padding: 7px 10px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease;

      &:hover {
        color: var(--clickgui-dropdown-option-hover-color);
        background-color: var(--fill-tertiary);
      }

      &.active {
        color: var(--clickgui-dropdown-option-selected-color);
        font-weight: 600;
      }
    }
  }
</style>
