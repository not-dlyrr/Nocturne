<script lang="ts">
    import {createEventDispatcher} from "svelte";

    export let value: boolean;
    export let name: string;

    const dispatch = createEventDispatcher();
</script>

<!-- santi.glass Switch row: label left, switch right -->
<label class="switch-container sg-switch">
    <span class="name">{name}</span>
    <input type="checkbox" role="switch" bind:checked={value} on:change={() => dispatch("change")}/>
    <span class="sg-switch-track"><span class="sg-switch-knob"></span></span>
</label>

<style lang="scss">
  .switch-container {
    display: flex;
    width: 100%;
    min-width: 0;
    justify-content: space-between;
    gap: 12px;
  }

  .name {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    color: var(--label);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
