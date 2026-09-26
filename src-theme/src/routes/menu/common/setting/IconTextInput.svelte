<script lang="ts">
    export let icon: string;
    export let title: string;
    export let type = "text";
    export let value = "";
    export let maxLength: number | null = null;
    export let pattern: string | null = null;
</script>

<div class="icon-text-input nc-field">
    <img class="icon" src="img/menu/icon-{icon}.svg" alt={icon}>
    {#if type === "text"}
        <input {pattern} maxlength={maxLength} class="input" spellcheck="false" type="text" placeholder={title} bind:value={value} autocomplete="off">
    {:else if type === "password"}
        <input {pattern} maxlength={maxLength} class="input" type="password" placeholder={title} bind:value={value} autocomplete="off">
    {/if}
    <div class="button-container">
        <slot />
    </div>
</div>

<style lang="scss">
  .icon-text-input {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 36px;
    padding: 0 4px 0 12px;
    border-radius: var(--radius-sm);
    cursor: text;
    transition: border-color 0.2s ease;

    &:focus-within {
      outline: 2px solid var(--focus-ring);
      outline-offset: 1px;
    }

    &:has(.input:invalid) {
      border-color: var(--danger-text);
    }
  }

  .icon {
    width: 14px;
    height: 14px;
    flex: none;
    opacity: 0.6;
  }

  .input {
    flex: 1;
    min-width: 0;
    height: 100%;
    color: var(--label);
    font-family: var(--font-text);
    font-size: 13px;
    letter-spacing: -0.08px;
    background: transparent;
    border: none;
    outline: none;
    padding: 0;

    &::placeholder {
      color: var(--label-secondary);
    }
  }

  .button-container {
    display: flex;
    align-items: center;

    /* e.g. the Random button: a small round icon button inside the field */
    :global(.icon) {
      width: 28px;
      height: 28px;
    }

    :global(.icon img) {
      width: 15px;
      height: 15px;
    }
  }
</style>
