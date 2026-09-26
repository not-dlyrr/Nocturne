<script lang="ts">
    import {onMount} from "svelte";

    // Screens no longer play long outros, so only a short beat is needed before the next one comes in.
    const TRANSITION_DURATION = 150;

    let ready = false;

    onMount(() => {
        const timeout = window.setTimeout(() => {
            ready = true;
        }, TRANSITION_DURATION);

        return () => window.clearTimeout(timeout);
    });
</script>

{#if ready}
    <slot/>
{/if}
