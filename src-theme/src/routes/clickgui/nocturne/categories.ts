// Sidebar glyph + icon-square color per module category. santi.glass allows accent, wall-blue,
// wall-indigo, wall-pink, danger and success-text behind row icons (never yellow or teal).
const STYLES: Record<string, { icon: string; tone: string }> = {
    Combat: {icon: "drop", tone: "var(--wall-pink)"},
    Movement: {icon: "play", tone: "var(--wall-blue)"},
    Render: {icon: "sun", tone: "var(--wall-indigo)"},
    Player: {icon: "person", tone: "var(--accent)"},
    World: {icon: "house", tone: "var(--success-text)"},
    Misc: {icon: "bell", tone: "var(--wall-blue)"},
    Exploit: {icon: "lock", tone: "var(--danger)"},
    Fun: {icon: "music", tone: "var(--wall-pink)"},
};

export function categoryStyle(category: string) {
    return STYLES[category] ?? {icon: "chevron", tone: "var(--accent)"};
}
