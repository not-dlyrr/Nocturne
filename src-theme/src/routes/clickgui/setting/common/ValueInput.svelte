<script lang="ts">
    import {createEventDispatcher} from "svelte";

    export let value: number;
    export let valueType: "int" | "float";

    let inputElement: HTMLElement;
    let inputValue = "";

    $: {
        if (document.activeElement !== inputElement) {
            inputValue = value.toString();
        }
    }

    const dispatch = createEventDispatcher<{
        change: { value: number }
    }>();

    function handleInput() {
        let parsed: number;
        if (valueType === "float") {
            parsed = parseFloat(inputValue);
        } else {
            parsed = parseInt(inputValue);
        }

        if (!isNaN(parsed)) {
            dispatch("change", {value: parsed});
        }
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<span contenteditable="true" class="value" bind:innerText={inputValue} on:input={handleInput} on:keydown={handleKeyDown} bind:this={inputElement}></span>

<style lang="scss">
  .value {
    display: inline-block;
    min-width: 5px;
    padding: 1px 5px;
    border-radius: 6px;
    font-variant-numeric: tabular-nums;
    color: var(--label);
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
    cursor: text;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--fill-secondary);
    }

    &:focus {
      outline: 1.5px solid var(--focus-ring);
      background-color: var(--fill-secondary);
    }
  }
</style>
