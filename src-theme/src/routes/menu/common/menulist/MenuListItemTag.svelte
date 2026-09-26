<script lang="ts">
    export let text: string;
</script>

<div class="tag">
    {text}
</div>

<style lang="scss">
  .tag {
    flex: none;
    background-color: var(--fill-tertiary);
    color: var(--label-secondary);
    font-size: 11px;
    font-weight: 600;
    line-height: 16px;
    padding: 0 7px;
    border-radius: var(--radius-pill);
    white-space: nowrap;
  }
</style>
