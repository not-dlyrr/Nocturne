<script lang="ts">
    import type {Browser} from "../../integration/types.js";
    import {onMount} from "svelte";
    import {
        browserForceReload,
        browserGoBack,
        browserGoForward,
        browserNavigate,
        browserReload,
        getBrowser
    } from "../../integration/rest.js";
    import {listen} from "../../integration/ws";
    import type {BrowserUrlChangeEvent} from "../../integration/events";
    import {delay} from "../../integration/util";
    import Icon from "../../components/sg/Icon.svelte";

    let browser: Browser;

    async function loadBrowser() {
        browser = await getBrowser();
    }

    onMount(async () => {
        await delay(250);
        await loadBrowser();
    });

    async function onKeyPress(event: KeyboardEvent) {
        if (event.key === "Enter") {
            await browserNavigate(browser.url);
        }
    }

    async function handleGo() {
        await browserNavigate(browser.url);
    }

    async function handleBack() {
        await browserGoBack();
    }

    async function handleForward() {
        await browserGoForward();
    }

    async function handleReload() {
        await browserReload();
    }

    async function handleForceReload() {
        await browserForceReload();
    }

    listen("browserUrlChange", (e: BrowserUrlChangeEvent) => {
        browser.url = e.url;
    });
</script>

{#if browser}
    <div class="browser-controls nc-surface">
        <button class="round back" type="button" aria-label="Back" title="Back" on:click={handleBack}>
            <Icon name="chevron" size={14} weight={2.2}/>
        </button>
        <button class="round" type="button" aria-label="Forward" title="Forward" on:click={handleForward}>
            <Icon name="chevron" size={14} weight={2.2}/>
        </button>
        <button class="round" type="button" aria-label="Reload" title="Reload" on:click={handleReload}>
            <img src="img/menu/icon-refresh.svg" alt="">
        </button>
        <label class="address-bar sg-search nc-field">
            <Icon name="search" size={15} weight={2}/>
            <input id="url" bind:value={browser.url} on:keypress={onKeyPress} placeholder="Enter URL" spellcheck="false"/>
        </label>
        <button class="sg-btn sg-btn-filled sg-btn-small action" type="button" on:click={handleGo}>Go</button>
        <button class="sg-btn sg-btn-tinted sg-btn-small action" type="button" on:click={handleForceReload}>Force Reload</button>
    </div>
{/if}

<style lang="scss">
    .browser-controls {
        position: fixed;
        bottom: 12px;
        left: 12px;
        right: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px;
        border-radius: var(--radius-pill);
        font-family: var(--font-text);
    }

    .round {
        width: 32px;
        height: 32px;
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--label);
        cursor: pointer;
        transition: background-color 0.2s ease, transform 0.35s cubic-bezier(0.3, 1.4, 0.5, 1);

        img {
            width: 15px;
            height: 15px;
        }

        &:hover {
            background-color: var(--fill-tertiary);
        }

        &:active {
            transform: scale(0.96);
        }

        &.back :global(.sg-icon) {
            transform: rotate(180deg);
        }
    }

    .address-bar {
        flex: 1;
        min-width: 0;
        min-height: 32px;
        margin: 0 4px;
        padding: 0 12px;
        gap: 6px;

        input {
            font-size: 13px;
            line-height: 18px;
            letter-spacing: -0.08px;
        }
    }

    .action {
        height: 32px;
        font-size: 13px;
        line-height: 18px;
        letter-spacing: -0.08px;
        white-space: nowrap;
    }
</style>
