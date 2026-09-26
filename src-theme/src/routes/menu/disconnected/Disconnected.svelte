<script lang="ts">
    import ButtonSetting from "../common/setting/ButtonSetting.svelte";
    import {
        directLoginToCrackedAccount,
        getAccounts,
        loginToAccount,
        randomUsername,
        reconnectToServer
    } from "../../../integration/rest";
    import {listen} from "../../../integration/ws";
    import {onMount} from "svelte";
    import type {Account} from "../../../integration/types";
    import {restoreSession} from "../../../integration/rest.js";
    import {isLoggingIn} from "../altmanager/altmanager_store";

    const premiumAccounts: Account[] = $state([]);

    async function reconnectWithRandomUsername() {
        const username = await randomUsername();
        await directLoginToCrackedAccount(username, false);
    }

    async function reconnectWithRandomAccount() {
        const account = premiumAccounts[Math.floor(Math.random() * premiumAccounts.length)];
        await loginToAccount(account.id);
    }

    onMount(async () => {
        const accounts = await getAccounts();
        premiumAccounts.push(...accounts.filter(a => a.type !== "Cracked" && !a.favorite));
    });

    listen("accountManagerLogin", reconnectToServer);
</script>

<div class="reconnect nc-surface">
    <ButtonSetting title="Reconnect" on:click={reconnectToServer}
                   disabled={$isLoggingIn}/>
    <ButtonSetting title="Restore Initial Session" secondary={true} on:click={restoreSession}
                   disabled={$isLoggingIn}/>
    <ButtonSetting title="Reconnect with Random Account" secondary={true} on:click={reconnectWithRandomAccount}
                   disabled={premiumAccounts.length === 0 || $isLoggingIn}/>
    <ButtonSetting title="Reconnect with Random Username" secondary={true} on:click={reconnectWithRandomUsername}
                   disabled={$isLoggingIn}/>
</div>

<style lang="scss">
  .reconnect {
    position: fixed;
    bottom: 20px;
    left: 20px;
    width: 260px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    row-gap: 6px;
    border-radius: var(--radius-md);
  }
</style>
