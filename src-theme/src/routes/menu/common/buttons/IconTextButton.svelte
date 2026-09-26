<script lang="ts">
    import {createEventDispatcher} from "svelte";

    export let title: string;
    export let icon: string;
    export let disabled = false;

    const dispatch = createEventDispatcher();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<button class="icon-text-button" on:click={() => dispatch("click")} {disabled}>
    <div class="icon">
        <img src="img/menu/{icon}" alt={title}>
    </div>
    <div class="title">{title}</div>
</button>

<style lang="scss">
    .icon-text-button {
      display: flex;
      align-items: center;
      gap: 10px;
      height: 48px;
      padding: 0 20px 0 6px;
      border: none;
      border-radius: var(--radius-pill);
      background: transparent;
      font-family: var(--font-text);
      transition: background-color 0.2s ease, opacity 0.2s ease, transform 0.35s cubic-bezier(0.3, 1.4, 0.5, 1);

      &:not([disabled]):hover {
        background-color: var(--fill-tertiary);
        cursor: pointer;
      }

      &:not([disabled]):active {
        transform: scale(0.96);
      }

      &[disabled] {
        opacity: .4;
      }
    }

    .icon {
      height: 36px;
      width: 36px;
      border-radius: 50%;
      background-color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 18px;
        height: 18px;
      }
    }

    .title {
      font-size: 17px;
      font-weight: 600;
      letter-spacing: -0.43px;
      color: var(--label);
    }
</style>
