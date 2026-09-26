<script lang="ts">
    import ButtonContainer from "../common/buttons/ButtonContainer.svelte";
    import IconButton from "../common/buttons/IconButton.svelte";
    import {openScreen, toggleBasicMode} from "../../../integration/rest";
    import {fly} from "svelte/transition";
    import {cubicOut} from "svelte/easing";
</script>

<!-- Clicks also reach the vanilla screen below, so this stays in its empty left strip. -->
<div class="basic-menu" in:fly|global={{duration: 350, x: -12, easing: cubicOut}}>
    <div class="buttons">
        <ButtonContainer vertical>
            <IconButton title="Full Mode" icon="nocturne" on:click={toggleBasicMode}/>
            <IconButton title="Click GUI" icon="clickgui" on:click={() => openScreen("clickgui")}/>
            <IconButton title="Alt Manager" icon="user" on:click={() => openScreen("altmanager")}/>
            <IconButton title="Proxy Manager" icon="proxymanager" on:click={() => openScreen("proxymanager")}/>
        </ButtonContainer>
    </div>
</div>

<style lang="scss">
  .basic-menu {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
  }

  .buttons {
    margin-left: 16px;
  }

  @media screen and (max-height: 480px) {
    .buttons {
      zoom: 0.8;
    }
  }
</style>
