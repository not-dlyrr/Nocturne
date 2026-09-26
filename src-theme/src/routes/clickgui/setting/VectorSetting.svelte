<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import type {BlockHitResult, ModuleSetting, Setting, Vec, Vec3Setting, VecAxis} from "../../../integration/types";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import {getCrosshairData, getPlayerData} from "../../../integration/rest";

    export let setting: ModuleSetting;
    export let vecAxes: VecAxis[];
    export let step: number;

    const cSetting = setting as Setting<Vec<typeof vecAxes[number]>>;
    const useLocateButton = (setting as Vec3Setting).useLocateButton ?? false;

    const dispatch = createEventDispatcher();

    function handleChange() {
        setting = {...cSetting};
        dispatch("change");
    }

    async function locate() {
        const hitResult = await getCrosshairData();

        if (hitResult.type === "block") {
            const blockHitResult = hitResult as BlockHitResult;
            (cSetting as Vec3Setting).value = blockHitResult.blockPos;
        } else {
            const playerData = await getPlayerData();
            (cSetting as Vec3Setting).value = playerData.blockPosition;
        }
        handleChange();
    }
</script>

<div class="setting">
    <div class="name">{$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}</div>
    <div class="input-group"
         style="grid-template-columns: repeat({vecAxes.length}, 1fr) {useLocateButton ? '20px' : ''}">
        {#each vecAxes as axis (axis)}
            <input
                    type="number"
                    {step}
                    class="value"
                    spellcheck="false"
                    placeholder={axis.toUpperCase()}
                    bind:value={cSetting.value[axis]}
                    on:input={handleChange}
            />
        {/each}
        {#if useLocateButton}
            <button class="locate-btn" on:click={locate} title="Locate">&#x2299;</button>
        {/if}
    </div>
</div>

<style lang="scss">
  .setting {
    padding: 7px 0 8px;
  }

  .name {
    color: var(--label);
    font-size: 13px;
    margin-bottom: 6px;
  }

  .input-group {
    display: grid;
    column-gap: 6px;
    align-items: center;

    input.value {
      width: 100%;
      min-width: 0;
    height: 28px;
    padding: 0 8px;
    border: 0.5px solid var(--glass-stroke);
    border-radius: var(--radius-xs);
    background-color: var(--fill-tertiary);
    color: var(--label);
    font-family: var(--font-text);
    font-size: 12px;
    outline: none;
    transition: background-color 0.2s ease;

    &:focus {
      outline: 2px solid var(--focus-ring);
      outline-offset: -1px;
    }

    &::placeholder {
      color: var(--label-secondary);
    }

      font-variant-numeric: tabular-nums;
      appearance: textfield;

      &::-webkit-scrollbar {
        background-color: transparent;
      }

      /* Hide the number input spinner buttons */
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }

    .locate-btn {
      width: 20px;
      height: 20px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 50%;
      background-color: transparent;
      color: var(--label-secondary);
      cursor: pointer;
      font-size: 13px;
      transition: background-color 0.2s ease, color 0.2s ease;

      &:hover {
        background-color: var(--fill-secondary);
        color: var(--label);
      }
    }
  }
</style>
