<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import type {ChooseSetting, ModuleSetting,} from "../../../integration/types";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import Dropdown from "./common/Dropdown.svelte";
    import SegmentedControl from "../../../components/sg/SegmentedControl.svelte";

    export let setting: ModuleSetting;

    const cSetting = setting as ChooseSetting;

    const dispatch = createEventDispatcher();

    function handleChange() {
        setting = { ...cSetting };
        dispatch("change");
    }
</script>

<div class="setting">
    {#if cSetting.choices.length <= 3}
        <div class="segmented-row">
            <span class="name">{$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}</span>
            <SegmentedControl
                options={cSetting.choices}
                value={cSetting.value}
                label={cSetting.name}
                format={o => $spaceSeperatedNames ? convertToSpacedString(o) : o}
                onchange={v => { cSetting.value = v; handleChange(); }}
            />
        </div>
    {:else}
    <Dropdown
        on:change={handleChange}
        bind:value={cSetting.value}
        options={cSetting.choices}
        name={$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}
    />
    {/if}
</div>

<style lang="scss">
    .setting {
        padding: 8px 0;
    }

    .segmented-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;

        .name {
            flex: 1;
            min-width: 0;
            font-size: 13px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        :global(.sg-seg-item) {
            min-width: 64px;
        }
    }
</style>
