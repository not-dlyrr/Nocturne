<script lang="ts">
    let {options, value, label, format = (o: string) => o, onchange}: {
        options: string[];
        value: string;
        label?: string;
        format?: (option: string) => string;
        onchange?: (value: string) => void;
    } = $props();

    const index = $derived(Math.max(0, options.indexOf(value)));
</script>

<!-- santi.glass SegmentedControl (bundle.css .sg-seg) -->
<div class="sg-seg" role="radiogroup" aria-label={label} style="--n: {options.length}; --i: {index};">
    <span class="sg-seg-thumb"></span>
    {#each options as option (option)}
        <button type="button" role="radio" aria-checked={option === value}
                class="sg-seg-item" class:is-on={option === value}
                onclick={() => option !== value && onchange?.(option)}>
            {format(option)}
        </button>
    {/each}
</div>
