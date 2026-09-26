<script lang="ts" module>
    // santi.glass line glyphs, copied verbatim from components/bundle.js (24px grid).
    export const PATHS: Record<string, string> = {
        house: "M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1z",
        search: "M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM15.5 15.5 20 20",
        sliders: "M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4",
        person: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5",
        bell: "M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5h4",
        wifi: "M3.5 9.5a12 12 0 0 1 17 0M6.5 12.8a7.5 7.5 0 0 1 11 0M9.5 16a3 3 0 0 1 5 0M12 19.2v.1",
        moon: "M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z",
        music: "M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM19 16a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z",
        sun: "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4",
        lock: "M6.5 11h11v9h-11zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
        plus: "M12 5v14M5 12h14",
        drop: "M12 3.5c3.5 4.2 6 7.6 6 10.5a6 6 0 0 1-12 0c0-2.9 2.5-6.3 6-10.5z",
        play: "M8 5.5v13l10.5-6.5z",
        chevron: "M9.5 6l6 6-6 6"
    };
</script>

<script lang="ts">
    let {name, size = 22, weight}: { name: string; size?: number; weight?: number } = $props();
</script>

<svg class="sg-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width={weight ?? (size <= 18 ? 2 : 1.8)} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d={PATHS[name] ?? ""}/>
</svg>
