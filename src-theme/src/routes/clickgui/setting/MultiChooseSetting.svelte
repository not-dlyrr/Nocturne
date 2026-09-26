<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import type {ModuleSetting, MultiChooseSetting,} from "../../../integration/types";
    import {slide} from "svelte/transition";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import ExpandArrow from "./common/ExpandArrow.svelte";
    import {setItem} from "../../../integration/persistent_storage";

    export let setting: ModuleSetting;
    export let path: string;

    const cSetting = setting as MultiChooseSetting;
    const thisPath = `${path}.${cSetting.name}`;

    let errorValue: string | null = null;
    let timeoutId: ReturnType<typeof setTimeout>;

    const dispatch = createEventDispatcher();

    function handleChange(v: string) {
        if (cSetting.value.includes(v)) {
            const filtered = cSetting.value.filter(item => item !== v);

            if (filtered.length === 0 && !cSetting.canBeNone) {
                // Doesn't remove the element because in this case the value will be empty
                // And indicate the value
                errorValue = v
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => errorValue = null, 300);

                return;
            }

            cSetting.value = filtered;
        } else {
            cSetting.value = [...cSetting.value, v]
        }

        setting = {...cSetting};
        dispatch("change");
    }

    let expanded = localStorage.getItem(thisPath) === "true";

    $: setItem(thisPath, expanded.toString());

    function toggleExpanded() {
        expanded = !expanded;
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="setting">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="head" class:expanded on:click={toggleExpanded} on:contextmenu|preventDefault={toggleExpanded}>
        <div class="title">{$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}</div>
        <div class="amount">{cSetting.value.length}/{cSetting.choices.length}</div>
        <ExpandArrow bind:expanded/>
    </div>

    {#if expanded}
        <div class="choices" transition:slide={{duration: 200, axis: "y"}}>
            {#each cSetting.choices as choice (choice)}
                <div
                        class="choice"
                        class:active={cSetting.value.includes(choice)}
                        class:error={errorValue === choice}
                        on:click={() => {
                            handleChange(choice)
                        }}
                >
                    {$spaceSeperatedNames ? convertToSpacedString(choice) : choice}
                </div>
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">
  .setting {
    padding: 0;
  }

  .head {
    min-height: 36px;
    padding: 7px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .title {
    flex: 1;
    min-width: 0;
    color: var(--label);
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .amount {
    font-size: 12px;
    color: var(--label-secondary);
    font-variant-numeric: tabular-nums;
  }

  .choices {
    margin-left: 2px;
    padding: 2px 0 10px 14px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .choice {
    height: 24px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    border-radius: var(--radius-pill);
    background-color: var(--fill-secondary);
    color: var(--label-secondary);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    overflow-wrap: anywhere;
    transition: background-color 0.2s ease, color 0.2s ease, transform 0.35s cubic-bezier(0.3, 1.4, 0.5, 1);

    &:hover {
      color: var(--label);
    }

    &:active {
      transform: scale(0.96);
    }

    &.active {
      background-color: var(--accent-tint);
      color: var(--accent-text);
      font-weight: 600;
    }

    &.error {
      background-color: color-mix(in srgb, var(--danger) 18%, transparent) !important;
      color: var(--danger-text) !important;
    }
  }
</style>
