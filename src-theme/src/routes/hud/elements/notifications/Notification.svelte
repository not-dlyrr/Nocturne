<script lang="ts">
    import Icon from "../../../../components/sg/Icon.svelte";
    import {categoryStyle} from "../../../clickgui/nocturne/categories";

    export let title: string;
    export let message: string;
    export let severity: string;
    /** Category of the toggled module, for ENABLED/DISABLED toasts. */
    export let category: string | null = null;
    export let duration: number;
    /** Changes when a toast is replaced in place, restarting its countdown bar. */
    export let id: number;

    const SEVERITY_STYLE: Record<string, { icon: string; tone: string }> = {
        INFO: {icon: "bell", tone: "var(--accent)"},
        SUCCESS: {icon: "sun", tone: "var(--success-text)"},
        ERROR: {icon: "bell", tone: "var(--danger)"},
    };

    $: toggle = severity === "ENABLED" || severity === "DISABLED";
    $: style = toggle ? categoryStyle(category ?? "") : SEVERITY_STYLE[severity] ?? SEVERITY_STYLE.INFO;
    $: tone = severity === "DISABLED" ? "var(--fill-secondary)" : style.tone;
</script>

<div class="notification nc-glass">
    <div class="icon-square" style="background: {tone};">
        <Icon name={style.icon} size={18} weight={2}/>
    </div>
    <div class="text">
        <span class="title">{toggle ? `Module ${title}` : title}</span>
        <span class="message">{toggle ? `${message} is ${severity === "ENABLED" ? "on" : "off"}` : message}</span>
    </div>
    <span class="time">Now</span>
    <div class="progress">
        {#key id}
            <div class="progress-fill" class:muted={severity === "DISABLED"} style="animation-duration: {duration}ms;"></div>
        {/key}
    </div>
</div>

<style lang="scss">
  .notification {
    position: relative;
    overflow: hidden;
    width: max-content;
    min-width: 320px;
    max-width: 420px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px 16px 12px;
    margin-top: 10px;
    border-radius: var(--radius-lg);
  }

  .icon-square {
    width: 29px;
    height: 29px;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-xs);
    color: #fff;
    transition: background-color 0.2s ease;
  }

  .text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .title {
    font-size: 15px;
    font-weight: 600;
    color: var(--label);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .message {
    font-size: 13px;
    line-height: 18px;
    color: var(--label-secondary);
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    overflow-wrap: anywhere;
  }

  .time {
    font-size: 12px;
    color: var(--label-secondary);
    align-self: flex-start;
    flex: none;
  }

  .progress {
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 6px;
    height: 3px;
    border-radius: 999px;
    background: var(--fill-tertiary);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 999px;
    background: var(--accent);
    transform-origin: left;
    animation: nc-progress linear both;

    &.muted {
      background: var(--label-secondary);
    }
  }

  @keyframes nc-progress {
    from {
      transform: scaleX(1);
    }
    to {
      transform: scaleX(0);
    }
  }
</style>
