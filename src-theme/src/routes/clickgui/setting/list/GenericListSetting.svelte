<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import {slide} from "svelte/transition";
    import type {ListSetting, ModuleSetting, NamedItem} from "../../../../integration/types";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../../theme/theme_config";
    import ExpandArrow from "../common/ExpandArrow.svelte";
    import {setItem} from "../../../../integration/persistent_storage";
    import ListItem from "./ListItem.svelte";
    import SearchableList from "./SearchableList.svelte";

    export let setting: ModuleSetting;
    export let path: string;
    export let items: NamedItem[];

    const cSetting = setting as ListSetting;
    const thisPath = `${path}.${cSetting.name}`;

    const dispatch = createEventDispatcher();
    let expanded = localStorage.getItem(thisPath) === "true";

    $: setItem(thisPath, expanded.toString());

    function handleItemToggle(e: CustomEvent<{ value: string, enabled: boolean }>) {
        if (e.detail.enabled) {
            cSetting.value = [...cSetting.value, e.detail.value];
        } else {
            cSetting.value = cSetting.value.filter(b => b !== e.detail.value);
        }

        setting = {...cSetting};
        dispatch("change");
    }
</script>

<div class="setting">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="head" class:expanded on:click={() => expanded = !expanded}
         on:contextmenu|preventDefault={() => expanded = !expanded}>
        <div class="name">{$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}</div>
        <ExpandArrow bind:expanded/>
    </div>
    {#if expanded}
        <div class="body" in:slide={{duration: 200, axis: "y"}} out:slide={{duration: 200, axis: "y"}}>
            <SearchableList {items} let:item>
                <ListItem value={item.value} name={item.name} icon={item.icon}
                          enabled={cSetting.value.includes(item.value)} on:toggle={handleItemToggle} />
            </SearchableList>
        </div>
    {/if}
</div>

<style lang="scss">
  .setting {
    padding: 0;
  }

  .head {
    min-height: 36px;
    padding: 7px 0;
    display: flex;
    align-items: center;
    cursor: pointer;

    .name {
      flex: 1;
      min-width: 0;
      color: var(--label);
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .body {
    margin-left: 2px;
    padding: 0 0 8px 14px;
  }
</style>
