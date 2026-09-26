<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import Icon from "../../../components/sg/Icon.svelte";

    export let placeholder = "Search";

    let value = "";

    const dispatch = createEventDispatcher<{
        search: { query: string }
    }>();
</script>

<label class="search sg-search nc-field">
    <Icon name="search" size={15} weight={2}/>
    <input type="text" {placeholder} bind:value={value}
           on:input={() => dispatch("search", {query: value})} spellcheck="false">
</label>

<style lang="scss">
  .search {
    flex: 1;
    min-width: 180px;
    min-height: 32px;
    padding: 0 12px;
    gap: 6px;

    input {
      font-size: 13px;
      line-height: 18px;
      letter-spacing: -0.08px;
    }
  }
</style>
