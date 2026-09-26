<script lang="ts">
    import "@simonwep/pickr/dist/themes/classic.min.css";
    import "./pickr.scss";
    import {createEventDispatcher, onMount} from "svelte";
    import type {ColorSetting, ModuleSetting,} from "../../../integration/types.js";
    import Pickr from "@simonwep/pickr";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import {intToRgba, rgbaToHex, rgbaToInt} from "../../../integration/util";

    export let setting: ModuleSetting;

    const cSetting = setting as ColorSetting;

    const dispatch = createEventDispatcher();

    let colorPicker: HTMLElement;
    let pickr: Pickr;
    let hidden = true;

    let hex = rgbaToHex(intToRgba(cSetting.value));

    onMount(() => {
        pickr = Pickr.create({
            el: colorPicker,
            theme: "classic",
            showAlways: true,
            inline: true,
            default: rgbaToHex(intToRgba(cSetting.value)),

            components: {
                preview: false,
                opacity: true,
                hue: true,

                interaction: {
                    hex: false,
                    rgba: false,
                    hsla: false,
                    hsva: false,
                    cmyk: false,
                    input: false,
                    clear: false,
                    save: false,
                },
            },
        });

        pickr.on("change", (v: any) => {
            hex = v.toHEXA().toString();

            const [r, g, b, a] = v.toRGBA();
            const rgba = [r, g, b, a * 255];

            cSetting.value = rgbaToInt(rgba);
            setting = { ...cSetting };
            dispatch("change");
        });
    });

    function handleValueInput() {
        pickr.setColor(hex);
    }
</script>

<div class="setting">
    <div class="name">{$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}</div>
    <div class="value-spot">
        <input
            class="value"
            bind:value={hex}
            on:input={handleValueInput}
        />
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button
            class="color-pickr-button"
            on:click={() => (hidden = !hidden)}
            style="background-color: {hex};"
        ></button>
    </div>
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <div class="color-picker" class:hidden>
        <!-- svelte-ignore element_invalid_self_closing_tag -->
        <button bind:this={colorPicker} />
    </div>
</div>

<style lang="scss">
    .setting {
        display: grid;
        grid-template-areas:
            "a b"
            "c c";
        grid-template-columns: minmax(0, 1fr) max-content;
        align-items: center;
        padding: 7px 0;
        min-height: 36px;
    }

    .name {
        grid-area: a;
        color: var(--label);
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .hidden {
        height: 0px;
        display: none;
    }

    .value {
        width: 76px;
        margin: 0 8px 0 auto;
        padding: 1px 4px;
        border: none;
        border-radius: 6px;
        background-color: transparent;
        color: var(--label-secondary);
        text-align: right;
        font-family: var(--font-text);
        font-size: 12px;
        font-variant-numeric: tabular-nums;
        text-transform: uppercase;
        cursor: text;
        outline: none;
        transition: background-color 0.2s ease;

        &:hover,
        &:focus {
            background-color: var(--fill-secondary);
            color: var(--label);
        }
    }

    .value-spot {
        grid-area: b;
        display: flex;
        align-items: center;
    }

    .color-picker {
        grid-area: c;
    }

    .color-pickr-button {
        width: 22px;
        height: 22px;
        padding: 0;
        border-radius: 6px;
        border-style: none;
        cursor: pointer;
        transition: transform 0.35s cubic-bezier(0.3, 1.4, 0.5, 1);

        &:active {
            transform: scale(0.96);
        }
    }

    .color-pickr-button:focus-visible {
        outline: 2px solid var(--focus-ring);
        outline-offset: 2px;
    }
</style>
