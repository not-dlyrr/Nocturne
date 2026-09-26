<script>
    import {fade} from 'svelte/transition';
</script>

<div class="watermark" in:fade={{ duration: 100 }} out:fade={{ duration: 100 }}>nocturne</div>

<style>
    .watermark {
        position: absolute;
        bottom: 15px;
        right: 20px;
        opacity: 0.6;
        font-family: var(--font-display);
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -0.5px;
        color: var(--label);
    }
</style>
