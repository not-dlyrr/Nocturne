<script lang="ts">
    import {createEventDispatcher, tick} from "svelte";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../../theme/theme_config";
    import Icon from "../../../../components/sg/Icon.svelte";

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
        <span class="text">
            <span class="value">{$spaceSeperatedNames ? convertToSpacedString(value) : value}</span>
            <span class="chevron"><Icon name="chevron" size={10} weight={2.6}/></span>
        </span>
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
  .dropdown {
    position: relative;
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
      display: flex;
      align-items: center;
      gap: 6px;
      max-width: 60%;
      height: 24px;
      padding: 0 8px 0 10px;
      border-radius: var(--radius-pill);
      background-color: var(--fill-secondary);
      font-size: 12px;
      font-weight: 500;
      color: var(--label);
      transition: background-color 0.2s ease;
    }

    .value {
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &:not(.named) .text {
      max-width: none;
      flex: 1;
      justify-content: space-between;
    }

    &:hover .text {
      background-color: color-mix(in srgb, var(--fill-secondary), white 8%);
    }
  }

  .chevron {
    display: flex;
    flex: none;
    color: var(--label-secondary);
    transform: rotate(90deg);
    transition: transform 0.35s cubic-bezier(0.3, 1.4, 0.5, 1);
  }

  .expanded .chevron {
    transform: rotate(-90deg);
  }

  .options {
    --dropdown-scale: 1;
    margin-top: 4px;
    padding: 4px;
    max-height: 260px;
    overflow-y: auto;
    background-color: var(--surface-elevated);
    border: 0.5px solid var(--glass-stroke);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-solid);
    z-index: 999999;
    position: fixed;
    box-sizing: border-box;
    transform: scale(var(--dropdown-scale));
    transform-origin: top left;
    font-family: var(--font-text);

    .option {
      min-height: 26px;
      display: flex;
      align-items: center;
      color: var(--label);
      font-size: 13px;
      padding: 4px 8px;
      border-radius: var(--radius-xs);
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: var(--fill-tertiary);
      }

      &.active {
        color: var(--accent-text);
        font-weight: 600;
      }
    }
  }
</style>
