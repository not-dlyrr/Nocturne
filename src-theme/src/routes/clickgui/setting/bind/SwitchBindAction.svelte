<script lang="ts">
    import type {BindAction} from "../../../../integration/types";
    import {fly} from "svelte/transition";
    import {cubicOut} from 'svelte/easing';
    import Icon from "../../../../components/sg/Icon.svelte";

    export let choices: BindAction[];
    export let chosen: typeof choices[number];
    export let onchange: () => any;

    let jiggle = 0;

    /**
     * Switch item among {@link choices}.
     */
    function switchAction() {
        const currentIndex = choices.indexOf(chosen);
        if (currentIndex === -1) {
            throw new Error("Unexpected action: " + chosen);
        }

        const nextIndex = (currentIndex + 1) % choices.length;
        chosen = choices[nextIndex];

        triggerArrowAnimation();
        onchange();
    }

    function triggerArrowAnimation() {
        jiggle++;
    }
</script>

<button type="button" title="Switch between Toggle, Hold and Smart" on:click|stopPropagation={switchAction}>
    <span class="chosen-holder">
        {#key chosen}
            <span
                    class="chosen"
                    in:fly={{ x: 5, duration: 100, delay: 100, easing: cubicOut }}
                    out:fly={{ x: -5, duration: 100, easing: cubicOut }}
            >{chosen}</span>
        {/key}
    </span>

    {#key jiggle}
        <span class="arrow"><Icon name="chevron" size={10} weight={2.6}/></span>
    {/key}
</button>

<style lang="scss">
  @keyframes jiggle {
    0% {
      transform: translateX(0);
    }

    50% {
      transform: translateX(2px);
    }

    100% {
      transform: translateX(0);
    }
  }

  .arrow {
    display: flex;
    color: var(--label-secondary);
    animation: jiggle 200ms ease;
  }

  .chosen-holder {
    display: grid;

    .chosen {
      font-weight: 500;
      color: var(--label-secondary);
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
      grid-column: 1/1;
      grid-row: 1/1;
    }
  }

  button {
    all: unset;
    height: 24px;
    padding: 0 6px 0 8px;
    border-radius: var(--radius-pill);
    cursor: pointer;
    display: flex;
    gap: 4px;
    align-items: center;
    position: relative;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--fill-secondary);
    }
  }
</style>
