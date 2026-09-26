<script lang="ts">
    import {fade} from "svelte/transition";

    export let name: string;
    export let selected: boolean;

    $: iconPath = `img/hud/tabgui/${name.toLowerCase()}.svg`;
</script>

<div class="category" class:selected>
    <div class="icon">
        <span
            class="category-icon"
            aria-hidden="true"
            transition:fade={{ duration: 200 }}
            style={`mask-image: url('${location.origin}${location.pathname}/${iconPath}');`}
        >
            <img class="category-icon-size" src={iconPath} alt="" />
        </span>
    </div>
    <div class="name">
        {name}
    </div>
</div>

<style lang="scss">
    .category {
        display: flex;
        align-items: center;
        gap: 10px;
        height: 32px;
        padding: 0 12px 0 10px;
        border-radius: var(--radius-sm);
        color: var(--label);
        transition: background-color 0.2s ease, color 0.2s ease;

        &.selected {
            background: var(--glass-selection);
            color: var(--accent-text);
        }
    }

    .icon {
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        color: var(--label-secondary);
        transition: color 0.2s ease;

        .selected & {
            color: var(--accent-text);
        }
    }

    .name {
        flex: 1;
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
    }

    .category-icon {
        display: inline-block;
        background-color: currentColor;
        mask-position: center;
        mask-repeat: no-repeat;
        mask-size: contain;
    }

    .category-icon-size {
        display: block;
        width: 16px;
        height: 16px;
        visibility: hidden;
    }
</style>
