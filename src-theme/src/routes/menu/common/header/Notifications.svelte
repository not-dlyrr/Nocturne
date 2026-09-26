<script lang="ts">
    import {fly} from "svelte/transition";
    import {notification, type TNotification} from "./notification_store";
    import {onMount} from "svelte";

    interface NotificationWithId {
        notification: TNotification;
        id: number;
    }

    let notifications: NotificationWithId[] = [];

    onMount(() => {
       notifications = [];
    });

    notification.subscribe((v) => {
        if (!v) {
            return;
        }
        const id = Date.now();
        const n = {
            notification: v,
            id
        };
        notifications = [...notifications, n];
        setTimeout(() => {
            notifications = notifications.filter(n => n.id !== id);
        }, (v?.delay ?? 3) * 1000);
    });
</script>

<div class="notifications">
    {#each notifications as n (n.id)}
        <div class="notification nc-surface" transition:fly={{duration: 250, y: -8}}>
            <div class="icon" class:error={n.notification.error}>
                <img src="img/hud/notification/icon-info.svg" alt="info">
            </div>
            <div class="title">{n.notification.title}</div>
            <div class="message">{n.notification.message}</div>
        </div>
    {/each}
</div>

<style lang="scss">
  .notifications {
    display: grid;
    grid-template-columns: 1fr;
    min-width: 0;
  }

  .notification {
    grid-row-start: 1;
    grid-column-start: 1;
    display: grid;
    grid-template-areas:
        "a b"
        "a c";
    grid-template-columns: max-content minmax(0, 1fr);
    align-items: center;
    column-gap: 10px;
    min-width: 260px;
    max-width: 380px;
    padding: 8px 14px 8px 8px;
    border-radius: var(--radius-md);

    .title {
      grid-area: b;
      align-self: end;
      color: var(--label);
      font-weight: 600;
      font-size: 13px;
      letter-spacing: -0.08px;
    }

    .message {
      grid-area: c;
      align-self: start;
      color: var(--label-secondary);
      font-size: 12px;
      overflow-wrap: anywhere;
    }

    .icon {
      grid-area: a;
      height: 28px;
      width: 28px;
      border-radius: var(--radius-xs);
      background-color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 14px;
        height: 14px;
      }

      &.error {
        background-color: var(--danger);
      }
    }
  }
</style>
