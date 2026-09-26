<script lang="ts">
    let {checked = false, label, onchange}: {
        checked?: boolean;
        label?: string;
        onchange?: (value: boolean) => void;
    } = $props();
</script>

<!-- santi.glass Switch (bundle.css .sg-switch) -->
<label class="sg-switch">
    <input type="checkbox" role="switch" aria-label={label} {checked}
           onchange={e => onchange?.((e.currentTarget as HTMLInputElement).checked)}/>
    <span class="sg-switch-track"><span class="sg-switch-knob"></span></span>
</label>
