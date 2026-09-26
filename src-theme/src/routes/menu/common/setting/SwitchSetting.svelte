<script lang="ts">
    import {createEventDispatcher} from "svelte";

    export let value: boolean;
    export let title: string;

    const dispatch = createEventDispatcher();
</script>

<!-- santi.glass switch at the compact desktop size -->
<label class="switch-setting sg-switch">
    <input type="checkbox" role="switch" bind:checked={value} on:change={() => dispatch("change")}/>
    <span class="sg-switch-track"><span class="sg-switch-knob"></span></span>
    <span class="title">{title}</span>
</label>

<style lang="scss">
  .switch-setting {
    gap: 8px;
    font-size: 13px;
    line-height: 18px;
    letter-spacing: -0.08px;
    white-space: nowrap;
    user-select: none;
  }

  .title {
    color: var(--label);
    font-weight: 500;
  }

  .sg-switch-track {
    width: 36px;
    height: 22px;
  }

  .sg-switch-knob {
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
  }

  input:checked + .sg-switch-track .sg-switch-knob {
    transform: translateX(14px);
  }
</style>
