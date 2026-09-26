<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import Icon from "../../../../components/sg/Icon.svelte";

    export let expanded: boolean;

    const dispatch = createEventDispatcher();

    function handleClick() {
        expanded = !expanded;
        dispatch("click");
    }
</script>

<button class="arrow" class:expanded type="button" aria-label={expanded ? "Collapse" : "Expand"}
        aria-expanded={expanded} on:click|stopPropagation={handleClick}>
    <Icon name="chevron" size={12} weight={2.4}/>
</button>

<style lang="scss">
  .arrow {
    width: 22px;
    height: 22px;
    flex: none;
    margin-left: 4px;
    margin-right: -4px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--label-secondary);
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;

    :global(.sg-icon) {
      transition: transform 0.35s cubic-bezier(0.3, 1.4, 0.5, 1);
    }

    &:hover {
      background: var(--fill-secondary);
      color: var(--label);
    }

    &.expanded :global(.sg-icon) {
      transform: rotate(90deg);
    }
  }
</style>
