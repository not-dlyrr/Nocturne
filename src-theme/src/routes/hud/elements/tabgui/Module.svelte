<script lang="ts">
    import {afterUpdate} from "svelte";
    import {setModuleEnabled} from "../../../../integration/rest";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../../theme/theme_config";

    export let name: string;
    export let enabled: boolean;
    export let selected: boolean;

    let moduleElement: HTMLElement;

    afterUpdate(() => {
        if (moduleElement && selected) {
            moduleElement.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    });

    async function handleKeyDown(e: KeyboardEvent) {
        if (selected && e.key === "Enter") {
            await setModuleEnabled(name, !enabled);
        }
    }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="module" class:enabled class:selected bind:this={moduleElement}>
    <div class="name">{$spaceSeperatedNames ? convertToSpacedString(name) : name}</div>
    <span class="dot"></span>
</div>

<style lang="scss">
    .module {
        flex: none;
        display: flex;
        align-items: center;
        gap: 10px;
        height: 32px;
        padding: 0 12px;
        border-radius: var(--radius-sm);
        color: var(--label-secondary);
        font-size: 13px;
        font-weight: 500;
        transition: background-color 0.2s ease, color 0.2s ease;

        .name {
            flex: 1;
            white-space: nowrap;
        }

        &.enabled {
            color: var(--label);

            .dot {
                background: var(--switch-on);
            }
        }

        &.selected {
            background: var(--glass-selection);
            color: var(--accent-text);
        }
    }

    .dot {
        flex: none;
        width: 6px;
        height: 6px;
        border-radius: var(--radius-pill);
        background: var(--fill-secondary);
        transition: background-color 0.2s ease;
    }
</style>
