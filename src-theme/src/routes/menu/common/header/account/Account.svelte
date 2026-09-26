<script lang="ts">
    import ToolTip from "../../ToolTip.svelte";
    import {
        directLoginToCrackedAccount,
        getAccounts,
        getSession,
        loginToAccount,
        openScreen,
        randomUsername
    } from "../../../../../integration/rest";
    import {onMount} from "svelte";
    import {listen} from "../../../../../integration/ws";
    import {location} from "svelte-spa-router";
    import {fade, fly} from "svelte/transition";
    import type {Account} from "../../../../../integration/types";
    import Avatar from "./Avatar.svelte";
    import {notification} from "../notification_store";
    import RippleLoader from "../../RippleLoader.svelte";
    import {isLoggingIn} from "../../../altmanager/altmanager_store";
    import {isAnniversary} from "../../../../../util/utils";
    import Icon from "../../../../../components/sg/Icon.svelte";

    let username = "";
    let service = "";
    let avatar = "";
    let online = true;

    let expanded = false;
    let accountElement: HTMLElement;
    let headerElement: HTMLElement;

    let searchQuery = "";
    let accounts: Account[] = [];

    $: renderedAccounts = accounts.filter(a => a.username.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery === "");

    $: inAccountManager = $location === "/altmanager";
    $: inTitle = $location === "/title";

    async function refreshSession() {
        const session = await getSession();
        username = session.username;
        service = session.service;
        avatar = session.avatar;
        online = session.online;
    }

    async function refreshAccounts() {
        accounts = await getAccounts();
    }

    onMount(async () => {
        await refreshSession();
        await refreshAccounts();
    });

    listen("session", async () => {
        await refreshSession();
    });

    listen("accountManagerRemoval", async () => {
        await refreshAccounts();
    });

    listen("accountManagerAddition", async () => {
        await refreshAccounts();
    });

    function handleWindowClick(e: MouseEvent) {
        if (!accountElement.contains(e.target as Node)) {
            expanded = false;
            searchQuery = "";
        }
    }

    function handleSelectClick(e: MouseEvent) {
        if (!expanded) {
            // Prevent icon buttons from opening quick switcher
            expanded = !(e.target as HTMLElement).classList.contains("icon");
        } else {
            expanded = !headerElement.contains(e.target as Node);
        }

        if (!expanded) {
            searchQuery = "";
        }
    }

    async function login(account: Account) {
        notification.set({
            title: "AltManager",
            message: "Logging in...",
            error: false
        });

        await loginToAccount(account.id);
    }

    async function loginWithRandomUsername() {
        const username = await randomUsername();
        await directLoginToCrackedAccount(username, false);
    }
</script>

<svelte:window on:click={handleWindowClick}/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="account" class:expanded bind:this={accountElement} on:click={handleSelectClick}>
    <div class="header nc-surface" bind:this={headerElement}>
        {#if $isLoggingIn}
            <div class="avatar-wrapper" transition:fade={{ duration: 200 }}>
                <RippleLoader size={40} />
            </div>
        {:else}
            <div class="avatar-wrapper">
                <object data={avatar} type="image/png" class="avatar" aria-label="avatar" in:fade={{ duration: 200, delay: 200 }}>
                    <img src="img/steve.png" alt=avatar class="avatar">
                </object>

                {#if isAnniversary() && inTitle}
                    <img transition:fly={{duration: 500, y: -10}} class="party-hat" src="img/anniversary/party-hat.svg" alt="party-hat">
                {/if}
            </div>
        {/if}
        <div class="username">{username}</div>
        <div class="account-type">
            {#if online}
                <span class="online">{service}</span>
            {:else}
                <span class="offline">{service}</span>
            {/if}
        </div>
        <div class="buttons">
            <button class="icon-button icon" type="button" aria-label="Random username" on:click={loginWithRandomUsername}>
                <ToolTip text="Random Username"/>

                <img class="icon" src="img/menu/account/icon-random.svg" alt="random username">
            </button>
            <button class="icon-button icon" disabled={inAccountManager} type="button" aria-label="Change account"
                    on:click={() => openScreen("altmanager")}>
                <ToolTip text="Change Account"/>

                <img class="icon" src="img/menu/icon-pen.svg" alt="change account">
            </button>
        </div>
    </div>

    {#if expanded}
        <div class="quick-switcher" transition:fly={{ y: -4, duration: 150 }}>
            <label class="account-search sg-search nc-field">
                <Icon name="search" size={15} weight={2}/>
                <!-- svelte-ignore a11y_autofocus -->
                <input type="text" autofocus placeholder="Search Accounts" bind:value={searchQuery}>
            </label>

            {#if accounts.length > 0}
                {#if renderedAccounts.length > 0}
                    <div class="account-list">
                        {#each renderedAccounts as a}
                            <div on:click={() => login(a)} class="account-item"
                                 class:active={a.username === username}>
                                <Avatar url={a.avatar}/>
                                <div class="username">{a.username}</div>
                                <div class="type">{a.type}</div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="placeholder">No results</div>
                {/if}
            {:else}
                <div class="placeholder">No accounts yet</div>
            {/if}
        </div>
    {/if}
</div>

<style lang="scss">
  .account {
    width: 300px;
    flex: none;
    position: relative;
  }

  .header {
    padding: 6px 8px 6px 6px;
    border-radius: var(--radius-md);
    align-items: center;
    display: grid;
    grid-template-areas:
        "a b c"
        "a d c";
    grid-template-columns: max-content minmax(0, 1fr) max-content;
    column-gap: 10px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: color-mix(in srgb, var(--surface), white 4%);
    }

    .avatar-wrapper {
      grid-area: a;
      position: relative;
      width: 40px;
      height: 40px;

      .avatar {
        display: block;
        height: 40px;
        width: 40px;
        border-radius: var(--radius-sm);
      }

      .party-hat {
        position: absolute;
        height: 76px;
        top: -42px;
        left: -22px;
        transform: rotate(-30deg);
      }
    }

    .username {
      grid-area: b;
      align-self: end;
      font-weight: 600;
      color: var(--label);
      font-size: 15px;
      letter-spacing: -0.23px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .account-type {
      grid-area: d;
      align-self: start;
      font-weight: 500;
      font-size: 12px;

      .online {
        color: var(--success-text);
      }

      .offline {
        color: var(--label-secondary);
      }
    }

    .buttons {
      grid-area: c;
      display: flex;
      column-gap: 2px;
      align-items: center;
    }

    .icon-button {
      position: relative;
      width: 28px;
      height: 28px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 50%;
      background-color: transparent;
      cursor: pointer;
      transition: background-color 0.2s ease, opacity 0.2s ease, transform 0.35s cubic-bezier(0.3, 1.4, 0.5, 1);

      img {
        width: 15px;
        height: 15px;
      }

      &:hover {
        background-color: var(--fill-secondary);
      }

      &:active {
        transform: scale(0.96);
      }

      &:disabled {
        pointer-events: none;
        opacity: .4;
      }
    }
  }

  .quick-switcher {
    position: absolute;
    z-index: 1000;
    top: calc(100% + 6px);
    width: 100%;
    padding: 6px;
    border-radius: var(--radius-md);
    background-color: var(--surface-elevated);
    border: 0.5px solid var(--glass-stroke);
    box-shadow: var(--shadow-solid);

    .placeholder {
      font-size: 13px;
      color: var(--label-secondary);
      padding: 14px 8px 10px;
      text-align: center;
    }

    .account-search {
      min-width: 0;
      min-height: 32px;
      padding: 0 12px;
      gap: 6px;
      margin-bottom: 4px;

      input {
        font-size: 13px;
        line-height: 18px;
        letter-spacing: -0.08px;
      }
    }

    .account-list {
      max-height: 300px;
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .account-item {
      display: grid;
      grid-template-areas:
        "a b"
        "a c";
      grid-template-columns: max-content minmax(0, 1fr);
      align-items: center;
      column-gap: 10px;
      padding: 5px 8px 5px 6px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background-color 0.2s ease;

      .username {
        grid-area: b;
        align-self: end;
        font-weight: 600;
        font-size: 13px;
        color: var(--label);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .type {
        grid-area: c;
        align-self: start;
        font-size: 11px;
        color: var(--label-secondary);
      }

      &:hover {
        background-color: var(--fill-tertiary);
      }

      &.active {
        background-color: var(--glass-selection);

        .username {
          color: var(--accent-text);
        }
      }
    }
  }
</style>
