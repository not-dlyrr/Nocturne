import type {Module} from "../../../integration/types";

/**
 * Hand-organized sections for the module list: grouped by what a module is for, and ordered within a
 * section by how often people reach for it, not alphabetically. Keys are module names as the client
 * reports them. Anything not listed (addons, new upstream modules) lands in "Other" at the end, A-Z.
 */
const SECTIONS: Record<string, [string, string[]][]> = {
    Combat: [
        ["Attacking", ["KillAura", "AutoClicker", "Criticals", "AutoWeapon", "KeepSprint", "SuperKnockback",
            "NoMissCooldown", "Hitbox", "TpAura", "MaceKill", "SpearKill"]],
        ["Aiming", ["Aimbot", "ProjectileAimbot", "AutoBow", "AutoShoot", "AutoRod", "ElytraTarget", "DroneControl"]],
        ["Defense", ["Velocity", "AutoArmor", "SwordBlock", "AutoDodge", "AutoLeave"]],
        ["Timing", ["Backtrack", "FakeLag", "TickBase", "TimerRange"]],
    ],
    Movement: [
        ["Speed", ["Sprint", "Speed", "NoSlow", "Strafe", "TargetStrafe", "TerrainSpeed", "InventoryMove", "NoWeb",
            "SnapTap"]],
        ["Air", ["Fly", "LongJump", "HighJump", "AirJump", "NoJumpDelay", "ElytraFly", "ElytraRecast",
            "ExtendedFirework", "TridentBoost"]],
        ["Terrain", ["Step", "ReverseStep", "SafeWalk", "Spider", "Parkour", "AvoidHazards", "BlockWalk",
            "BlockBounce", "AntiBounce", "Sneak", "NoPose"]],
        ["Physics", ["NoPush", "AntiLevitation", "Freeze", "NoClip", "Clip"]],
        ["Vehicles", ["EntityControl", "VehicleControl", "VehicleBoost"]],
    ],
    Render: [
        ["Players & Entities", ["ESP", "Nametags", "Tracers", "Chams", "ItemESP", "ItemTags", "ItemChams", "TrueSight",
            "MobOwners", "CombineMobs", "MurderMystery", "ProphuntESP", "Hats", "Wings"]],
        ["World", ["FullBright", "XRay", "StorageESP", "BlockESP", "Trajectories", "BlockOutline", "HoleESP",
            "VoidESP", "BedPlates", "TNTTimer", "NewChunks", "LogoffSpot", "Breadcrumbs", "ProtectionZones",
            "CrystalView", "Radar", "CustomAmbience"]],
        ["Camera", ["FreeCam", "Zoom", "AntiBlind", "NoHurtCam", "NoBob", "NoFOV", "CameraClip", "AutoF5",
            "SmoothCamera", "Aspect"]],
        ["Effects", ["Animations", "HitFX", "DamageParticles", "JumpEffect", "TotemEffect", "PotionFX", "NoSwing",
            "Rotations", "Crosshair", "SkinChanger"]],
        ["Interface", ["HUD", "ClickGUI", "BetterChat", "BetterTab", "BetterInventory", "SilentHotbar", "Debug"]],
    ],
    Player: [
        ["Survival", ["NoFall", "AntiVoid", "SmartEat", "Offhand", "Replenish", "AutoRespawn", "FastUse",
            "PotionSpoof"]],
        ["Items", ["ChestStealer", "AutoCrafter", "AutoShop", "AutoWindCharge"]],
        ["Interaction", ["Reach", "AutoBreak", "NoBlockInteract", "NoEntityInteract"]],
        ["Server", ["Blink", "NoRotateSet", "NoSlotSet", "AntiExploit"]],
        ["Automation", ["AntiAFK", "AutoWalk", "AutoFish", "AutoQueue", "ReportHelper"]],
    ],
    World: [
        ["Building", ["Scaffold", "FastPlace", "AirPlace", "AutoBuild", "LiquidPlace", "LiquidFiller", "Extinguish"]],
        ["Breaking", ["Nuker", "FastBreak", "AutoTool", "PacketMine", "NoSlowBreak"]],
        ["Traps & Holes", ["Surround", "BlockIn", "HoleFiller", "AutoTrap", "BlockTrap"]],
        ["Utility", ["Timer", "AutoFarm", "AutoDisable", "InventoryTracker", "NoInterpolation"]],
    ],
    Misc: [
        ["Targeting", ["AntiBot", "Teams", "TargetLock"]],
        ["Staff & Checks", ["AntiStaff", "AntiCheatDetect", "FlagCheck", "Notifier"]],
        ["Chat & Privacy", ["NameProtect", "TextFieldProtect", "Spammer", "AutoChatGame"]],
        ["Tools", ["Macros", "EasyPearl", "ItemScroller", "PacketLogger", "DebugRecorder"]],
    ],
    Exploit: [
        ["Anticheat", ["Disabler", "PingSpoof", "TimeShift", "ResetVL"]],
        ["Movement", ["Phase", "ClickTp", "Teleport", "NoPitchLimit", "SleepWalker", "PortalMenu"]],
        ["Interaction", ["GhostHand", "MultiActions", "AbortBreaking", "MoreCarry", "AntiHunger", "VehicleOneHit"]],
        ["Server", ["Plugins", "NameCollector", "BookBot", "Dupe", "Damage", "Kick", "ServerCrasher",
            "AntiReducedDebugInfo", "YggdrasilSignatureFix"]],
    ],
    Fun: [
        ["Player Model", ["Derp", "HandDerp", "SkinDerp", "Twerk"]],
        ["Other", ["DankBobbing", "Vomit", "Notebot"]],
    ],
};

const OTHER = "Other";

/** Sections of one category's modules, in curated order; unlisted modules go last under "Other". */
export function sectionsFor(category: string, modules: Module[], displayName: (n: string) => string) {
    const byName = new Map(modules.map(m => [m.name, m]));
    const sections: [string, Module[]][] = [];
    const placed = new Set<string>();

    for (const [heading, names] of SECTIONS[category] ?? []) {
        const inSection = names.flatMap(n => byName.get(n) ?? []);
        inSection.forEach(m => placed.add(m.name));
        if (inSection.length) sections.push([heading, inSection]);
    }

    const rest = modules.filter(m => !placed.has(m.name))
        .sort((a, b) => displayName(a.name).localeCompare(displayName(b.name)));
    if (rest.length) {
        const other = sections.find(([heading]) => heading === OTHER);
        if (other) other[1].push(...rest);
        else sections.push([OTHER, rest]);
    }

    return sections;
}
