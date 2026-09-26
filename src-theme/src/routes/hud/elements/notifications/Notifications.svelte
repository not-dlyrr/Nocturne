<script lang="ts">
    import {flip} from "svelte/animate";
    import {listen} from "../../../../integration/ws";
    import {fly} from "svelte/transition";
    import {backOut} from "svelte/easing";
    import Notification from "./Notification.svelte";
    import type {NotificationEvent, NotificationSeverity} from "../../../../integration/events";
    import {getModules} from "../../../../integration/rest";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../../theme/theme_config";

    const DURATION = 3000;

    // Module name -> category, so toggle toasts can wear their category's icon square.
    let moduleCategories: Record<string, string> = {};
    getModules().then(modules => {
        moduleCategories = Object.fromEntries(modules.map(m => [m.name, m.category]));
    });

    interface TNotification {
        animationKey: number;
        id: number;
        title: string;
        severity: NotificationSeverity;
        message: string;
        category: string | null;
    }

    export let settings: { [name: string]: any };

    let cSettings: HudNotificationsSettings;

    $: cSettings = settings as HudNotificationsSettings;

    let notifications: TNotification[] = [];

    function addNotification(title: string, message: string, severity: NotificationSeverity) {
        if (!cSettings.severities.includes(severity)) return;

        let animationKey = Date.now();
        const id = animationKey;

        if (severity === "ENABLED" || severity === "DISABLED") {
            // Check if there still exists an enable/disable notification for the same module
            const index = notifications.findIndex((n) => n.message === message)
            if (index !== -1) {
                // Set the id of the new notification to the old notification's id.
                // This will make svelte able to animate it correctly
                animationKey = notifications[index].animationKey;

                // Remove the old notification
                notifications.splice(index, 1);
            }
        }

        notifications = [
            {
                animationKey, id, title, message, severity,
                category: moduleCategories[message] ?? null
            },
            ...notifications,
        ];
        
        setTimeout(() => {
            notifications = notifications.filter((n) => n.id !== id);
        }, DURATION);
    }

    listen("notification", (e: NotificationEvent) => {
        addNotification(e.title, e.message, e.severity);
    });
</script>

<div class="notifications">
    {#each notifications as {id, title, message, severity, category, animationKey} (animationKey)}
        <div
                animate:flip={{ duration: 350 }}
                in:fly={{ x: 452, duration: 450, easing: backOut }}
                out:fly={{ x: 40, duration: 300 }}
        >
            <Notification {id} {title} {severity} {category} duration={DURATION}
                          message={category && $spaceSeperatedNames ? convertToSpacedString(message) : message}/>
        </div>
    {/each}
</div>

<style lang="scss">
  .notifications {
    display: flex;
    flex-direction: column-reverse;
    /* cards are content-width; keep them flush with the stack's right (anchored) edge */
    align-items: flex-end;
  }
</style>
