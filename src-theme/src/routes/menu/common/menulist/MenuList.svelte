<script lang="ts">
    import {fly} from "svelte/transition";
    import {cubicOut} from "svelte/easing";
    import {SortableList} from "@jhubbardsf/svelte-sortablejs";
    import "./menulist.scss";
    import {createEventDispatcher} from "svelte";

    export let sortable = false;
    export let elementCount = -1;

    let sortableElement: HTMLElement | undefined;
    let remountKey = 0;

    interface MenuListSortEvent {
        newOrder: number[];
        complete: () => void;
    }

    const dispatch = createEventDispatcher<{
        sort: MenuListSortEvent
    }>();

    function handleChange(e: any) {
        let completed = false;

        dispatch("sort", {
            newOrder: calculateNewOrder(e.oldIndex, e.newIndex, elementCount),
            complete: () => {
                if (!completed) {
                    completed = true;
                    remountKey++;
                }
            }
        });
    }

    function calculateNewOrder(oldIndex: number, newIndex: number, length: number): number[] {
        const a = Array.from({length}, (x, i) => i);
        a.splice(oldIndex, 1);
        a.splice(newIndex, 0, oldIndex);
        return a;
    }
</script>

<div class="menu-list nc-surface" in:fly|global={{duration: 350, y: 12, easing: cubicOut}}>
    {#key remountKey}
        {#if sortable && elementCount > -1}
            <SortableList class="menu-list-items" onSort={handleChange} forceFallback={true} animation={150}>
                <slot/>
            </SortableList>
        {:else}
            <div class="menu-list-items">
                <slot/>
            </div>
        {/if}
    {/key}
</div>

<style lang="scss">
  .menu-list {
    flex: 1;
    min-height: 0;
    border-radius: var(--radius-md);
    margin-bottom: 10px;
    position: relative;
    overflow: hidden;
  }
</style>
