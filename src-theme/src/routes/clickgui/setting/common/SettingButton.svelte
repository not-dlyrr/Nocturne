<script lang="ts">
    export let value: string;
</script>

<button class="setting-button sg-btn sg-btn-tinted sg-btn-small" type="button" on:click>{value}</button>

<style lang="scss">
  .setting-button {
    width: 100%;
    min-height: 26px;
    height: 26px;
    padding: 0 12px;
    font-size: 12px;
    line-height: 16px;
  }
</style>
