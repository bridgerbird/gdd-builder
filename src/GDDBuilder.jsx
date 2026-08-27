import React, { useState } from "react";
import { Plus, Trash2, Copy, Download, FileText, ArrowLeft, Check } from "lucide-react";

/* ============================================================
   THEME TOKENS — drafting-table / ledger aesthetic.
   Dark slate "table", brass accent for actions, muted teal
   for "selected" state (like ink stamps on a ledger).
   ============================================================ */
const theme = {
  bg: "#161A21",
  panel: "#1E242E",
  panelAlt: "#252C38",
  border: "#333D4C",
  borderSoft: "#2A313D",
  ink: "#EAE4D3",
  inkMuted: "#8E97A4",
  inkFaint: "#5C6572",
  accent: "#C68A46",
  accentDim: "#8C6636",
  accentSoft: "#372C1E",
  select: "#5C8C81",
  selectSoft: "#1E2E2B",
  danger: "#B5573F",
  paper: "#EFEAD9",
  paperInk: "#232017",
  serif: "'Iowan Old Style','Palatino Linotype',Georgia,serif",
  mono: "'IBM Plex Mono','SFMono-Regular',Menlo,Consolas,monospace",
  sans: "-apple-system,'Segoe UI',Inter,sans-serif",
};

/* ============================================================
   SCHEMA — the single source of truth. Add a new object to
   `sections`, or a new entry to any `subsections` array, and
   the UI + generated document pick it up automatically.
   ============================================================ */
// Helper: turn a plain string list into {label, definition} objects.
// Used for subsections that don't have researched definitions yet —
// definition starts empty, so no tooltip shows until one is added.
const plain = (labels) => labels.map((label) => ({ label, definition: "" }));

const initialSections = [
  {
    id: "mechanics",
    title: "Gameplay Mechanics",
    subsections: [
      {
        id: "core_mechanics",
        label: "Core Mechanics",
        options: [
          { label: "Movement (Walk/Run)", definition: "Basic locomotion allowing the player to traverse the game space at variable speed." },
          { label: "Jump", definition: "A vertical traversal action that clears gaps, obstacles, or reaches higher ground." },
          { label: "Melee Attack", definition: "A close-range offensive action using direct-contact weapons or unarmed strikes." },
          { label: "Ranged Attack", definition: "An offensive action that damages targets at a distance using projectiles or hitscan weapons." },
          { label: "Block/Parry", definition: "A defensive action that mitigates or negates incoming damage when timed or held correctly." },
          { label: "Dodge/Evade", definition: "A quick directional movement that avoids incoming damage or attacks, often with brief invulnerability." },
          { label: "Sprint", definition: "A temporary speed boost to movement, typically limited by a stamina resource." },
          { label: "Crouch/Prone", definition: "Lowering the character's stance to reduce visibility, fit through spaces, or improve accuracy." },
          { label: "Climb", definition: "Vertical or angled traversal along surfaces such as ladders, walls, or ledges." },
          { label: "Swim", definition: "Movement through liquid environments, often governed by different controls than movement on land." },
          { label: "Interact", definition: "A general-purpose action for engaging with objects, NPCs, or the environment, such as opening or activating something." },
          { label: "Grab/Carry", definition: "Picking up and physically moving objects or characters within the world." },
          { label: "Aim", definition: "Directing a weapon or tool precisely before or during an action, typically affecting accuracy." },
          { label: "Reload", definition: "Restocking ammunition or a limited resource for a weapon or tool before it can be used again." },
          { label: "Aerial Mobility (Double Jump/Air Dash)", definition: "Extended mid-air movement options that let the player alter trajectory or gain height after leaving the ground." },
          { label: "Grapple/Hook", definition: "A traversal mechanic that pulls the player toward, or lets them swing from, a fixed anchor point." },
          { label: "Stealth/Sneak", definition: "Moving while minimizing detection by enemies or sensors, usually tied to noise level or visibility." },
          { label: "Build/Place", definition: "Constructing or placing structures, objects, or terrain pieces within the world." },
          { label: "Craft", definition: "Combining materials or components according to a recipe to create a new item." },
          { label: "Gather/Harvest", definition: "Collecting resources from the environment, such as plants, ore, or loot." },
          { label: "Trade/Barter", definition: "Exchanging items, currency, or resources with NPCs or other players." },
          { label: "Dialogue Choice", definition: "Selecting from branching conversation options that affect narrative outcomes or relationships." },
          { label: "Cast/Channel Ability", definition: "Activating a spell or special ability, often requiring a resource cost, cooldown, or charge time." },
          { label: "Summon", definition: "Calling forth an ally, creature, or object to fight or assist alongside the player." },
          { label: "Transform/Shapeshift", definition: "Changing the player character's form, temporarily or permanently altering their abilities or stats." },
          { label: "Push/Pull", definition: "Physically manipulating objects in the environment by applying directional force." },
          { label: "Throw", definition: "Launching an item, weapon, or projectile at a target location." },
          { label: "Heal/Restore", definition: "Recovering health, resources, or a status condition through an item, ability, or timed action." },
          { label: "Drive/Pilot", definition: "Taking control of a vehicle, mount, or mechanized unit instead of moving the character directly." },
          { label: "Time Manipulation", definition: "Slowing, stopping, rewinding, or fast-forwarding time as a direct, player-triggered action." },
        ],
      },
      {
        id: "secondary_mechanics",
        label: "Secondary Mechanics",
        options: [
          { label: "Inventory Management", definition: "A system for storing, organizing, and equipping the items the player collects." },
          { label: "Crafting System", definition: "Combining materials or components to create new items, gear, or consumables." },
          { label: "Dialogue System", definition: "Structured conversations with NPCs, often including branching choices that affect outcomes." },
          { label: "Stealth Mechanics", definition: "Supporting systems for avoiding detection, such as noise meters, visibility indicators, or patrol patterns." },
          { label: "Skill Tree/Talent System", definition: "A branching set of unlockable upgrades or abilities the player chooses from over time." },
          { label: "Companion/Pet System", definition: "Managing an AI ally or creature that assists, follows, or can be commanded by the player." },
          { label: "Reputation/Faction System", definition: "Tracking the player's standing with groups or factions that changes how those groups behave toward them." },
          { label: "Relationship/Affinity System", definition: "Tracking individual NPC relationships that shift based on player choices, gifts, or dialogue." },
          { label: "Quest/Journal Log", definition: "A system for tracking active, completed, and available objectives." },
          { label: "Fast Travel", definition: "A shortcut system letting players instantly move between previously discovered locations." },
          { label: "Housing/Base Building", definition: "Player-owned spaces that can be customized, decorated, or expanded over time." },
          { label: "Mount/Vehicle System", definition: "Managing rideable creatures or vehicles used for faster or specialized traversal." },
          { label: "Weather/Day-Night Cycle", definition: "Environmental systems that change conditions over time and may affect visibility, enemy behavior, or available actions." },
          { label: "Economy/Currency System", definition: "Managing money or trade goods used to buy, sell, or upgrade throughout the game." },
          { label: "Shop/Vendor System", definition: "Interfaces for buying and selling items with NPC merchants or other players." },
          { label: "Cooking/Alchemy System", definition: "Combining ingredients according to recipes to create food, potions, or temporary buffs." },
          { label: "Enchanting/Upgrading System", definition: "Enhancing existing gear with additional stats, effects, or higher rarity tiers." },
          { label: "Photo Mode", definition: "A non-gameplay feature that lets players pause the action and compose or capture in-game scenes." },
          { label: "Codex/Lore Collection", definition: "Collectible in-world text or item entries that expand on the setting's backstory without affecting core progression." },
          { label: "Achievement/Trophy System", definition: "Tracking optional milestones or challenges that exist outside the main progression path." },
          { label: "Minigame System", definition: "Self-contained smaller games embedded within the larger game, such as lockpicking or fishing." },
          { label: "Emote/Social Gesture System", definition: "Non-verbal communication options for expressing emotion or interacting socially with other players." },
          { label: "Difficulty/Assist Options", definition: "Adjustable settings that modify the game's challenge level or improve accessibility." },
          { label: "Weapon/Gear Customization", definition: "Modifying the appearance or stats of equipment through attachments, skins, or visual dyes." },
          { label: "Party/Squad Management", definition: "Assembling and directing a group of characters as a coordinated unit." },
          { label: "Notoriety/Wanted System", definition: "Tracking escalating law-enforcement or NPC response based on the player's recent actions." },
          { label: "Map/Cartography System", definition: "Revealing, marking, or annotating a world map as the player explores it." },
        ],
      },
      { id: "mechanic_interactions", label: "Mechanic Interactions", options: plain(["Fire + Oil = Spreading Flame", "Water + Electricity = Chain Shock", "Ice + Fire = Melt", "Wind + Fire = Extinguish"]) },
      { id: "rules_constraints", label: "Rules and Constraints", options: plain(["Stamina Limit", "Cooldown Timers", "Ammo Limits", "Weight Limits", "Permadeath"]) },
      { id: "edge_cases", label: "Edge Cases", options: plain(["Heal While Stunned?", "Attack While Reloading?", "Interact During Cutscene?", "Status Effects Stack?"]) },
    ],
  },
  {
    id: "loops",
    title: "Gameplay Loops",
    subsections: [
      { id: "core_loop", label: "Core Loop", options: plain(["Explore → Fight → Loot → Upgrade", "Plant → Tend → Harvest → Sell", "Scout → Plan → Execute → Extract"]) },
      { id: "macro_loop", label: "Macro Loop", options: plain(["Complete Level → Unlock Next", "Clear Dungeon → Boss Fight", "Win Match → Season Progress"]) },
      { id: "meta_loop", label: "Meta Loop", options: plain(["Unlock New Zones", "Prestige System", "Seasonal Content", "Skill Tree Mastery"]) },
      { id: "social_loop", label: "Social Loop", options: plain(["Trading", "Leaderboards", "Co-op Runs", "Competitive Ranking", "Guilds / Clans"]) },
    ],
  },
  {
    id: "characters",
    title: "Character Descriptions and Abilities",
    isCharacterSection: true,
    characterFields: [
      { key: "Name", multiline: false },
      { key: "Role/Archetype", multiline: false },
      { key: "Personality", multiline: true },
      { key: "Stat System", multiline: false },
      { key: "Abilities", multiline: true },
      { key: "Progression", multiline: true },
      { key: "Narrative Role", multiline: true },
      { key: "Balancing Notes", multiline: true },
    ],
  },
  {
    id: "world",
    title: "Level/World Design Overview",
    subsections: [
      {
        id: "world_structure",
        label: "World Structure",
        options: [
          { label: "Linear", definition: "A single, fixed path from start to finish with little or no deviation, used to control pacing and story order precisely." },
          { label: "Open World", definition: "A large, freely traversable continuous space the player can explore in almost any order with minimal gating." },
          { label: "Hub-and-Spoke", definition: "A central hub area connects to multiple discrete levels or zones that the player enters and exits individually." },
          { label: "Metroidvania (Interconnected)", definition: "A single sprawling map where new abilities or keys unlock shortcuts and previously inaccessible areas, encouraging backtracking." },
          { label: "Procedurally Generated", definition: "Levels or maps are assembled algorithmically at runtime rather than hand-authored, producing a different layout each playthrough." },
          { label: "Semi-Open / Zone-Based", definition: "The world is split into large, mostly open zones that are unlocked or connected sequentially rather than forming one continuous space." },
          { label: "Sandbox", definition: "A structure-light space built around player-driven systems (building, simulation, emergent play) rather than an authored critical path." },
          { label: "Level Select / Mission-Based", definition: "Discrete, self-contained levels or missions are chosen from a menu or map screen rather than travelled to in-world." },
          { label: "Branching / Non-Linear Path", definition: "The critical path forks into multiple routes or orderings the player can choose between, often converging again later." },
          { label: "Overworld with Dungeons", definition: "A traversable overworld map connects self-contained dungeons or instanced areas — the classic action-adventure structure." },
          { label: "Nodal Map", definition: "Locations are represented as connected nodes on an abstract map, and the player travels node-to-node rather than through continuous space." },
          { label: "Room-Based / Roguelike Floors", definition: "The world is built from discrete rooms or floors, often randomized, cleared one at a time before the player progresses." },
          { label: "Corridor / Tunnel", definition: "A narrow, mostly single-direction path with tightly controlled sightlines and encounters, common in linear shooters." },
          { label: "Persistent World (Shared/MMO)", definition: "A continuous, always-running world shared by many players simultaneously, persisting state between sessions." },
          { label: "Vertical Structure (Tower/Descent)", definition: "Progression is structured along a single vertical axis, climbing or descending through stacked levels." },
          { label: "Interconnected Hubs", definition: "Multiple hub areas are themselves connected to one another, layering the hub-and-spoke model." },
          { label: "District-Based / City Structure", definition: "The world is divided into named districts or neighborhoods, each with its own theme, tone, or unlock gate." },
          { label: "Island-Based / Archipelago", definition: "Discrete islands or landmasses are connected by travel — boat, portal, or flight — across open water or void." },
          { label: "Layered / Onion Structure", definition: "Concentric rings or layers surround a central point, with progression moving inward or outward through each layer." },
          { label: "Voxel / User-Generated World", definition: "The world is built — and often modifiable — from block-like units, frequently authored or altered by players themselves." },
          { label: "Arena-Based", definition: "Discrete, bounded combat spaces are the unit of world structure, with little or no traversal between encounters." },
          { label: "Time-Loop Structure", definition: "The same space is revisited repeatedly within a resetting time loop, with player knowledge — not new geography — driving progress." },
          { label: "Multiverse / Parallel Worlds", definition: "Multiple distinct versions of the same or related space exist and are traversed or compared against one another." },
        ],
      },
      {
        id: "level_flow",
        label: "Level Flow",
        options: [
          { label: "Linear Flow", definition: "A single, uninterrupted path through the level with no branching, so encounters and pacing occur in one fixed order." },
          { label: "Branching Flow", definition: "Paths diverge at one or more points into distinct routes that later reconverge before the level's end." },
          { label: "Parallel Path Flow", definition: "Multiple mutually exclusive routes let the player pick one path without ever crossing or rejoining the others." },
          { label: "Loop Flow", definition: "The level's path curves back on itself, returning the player near earlier areas from a new angle or elevation." },
          { label: "Hub-Based Flow", definition: "A central room or junction within the level branches out to sub-objectives, looping back to the hub between each." },
          { label: "Gauntlet Flow", definition: "Continuous, escalating challenges with little or no downtime between encounters, testing sustained performance." },
          { label: "Rising Action (Crescendo) Flow", definition: "Intensity builds gradually and steadily from the level's start toward a climactic finish." },
          { label: "Peak-and-Valley Flow", definition: "High-intensity encounters alternate with deliberate lulls or rest points, creating a rhythm of tension and release." },
          { label: "Combat–Puzzle Alternation", definition: "The level alternates between combat encounters and puzzle-solving segments in a repeating pattern." },
          { label: "Exploration-to-Confrontation Flow", definition: "An open exploration segment funnels into a fixed, high-stakes encounter such as a boss fight." },
          { label: "Backtrack/Unlock Flow", definition: "The level requires revisiting earlier sections with a newly acquired ability or key to reach previously blocked areas." },
          { label: "Wave-Based Flow", definition: "Progress is gated by discrete waves of enemies, with a breather or reward beat between each wave." },
          { label: "Checkpoint-Segmented Flow", definition: "The level is broken into discrete segments divided by checkpoints or save points, each with its own mini-arc." },
          { label: "Chase/Pursuit Flow", definition: "Forward momentum is continuous and time-pressured, as the player flees or pursues something with no chance to backtrack." },
          { label: "Stealth Flow", definition: "Pacing is driven by patrol timing and controlled visibility, alternating between careful waiting and short bursts of movement." },
          { label: "Vertical Flow (Ascent/Descent)", definition: "The level's progression is organized primarily along a vertical axis, climbing or descending through it." },
          { label: "Funnel Flow", definition: "The level opens with wide, open exploration that progressively narrows toward a single fixed objective or exit." },
          { label: "Bottleneck Flow", definition: "Deliberate chokepoints force all paths to converge at specific moments regardless of the route taken to reach them." },
          { label: "Escort/Companion Flow", definition: "Pacing is tied to protecting or guiding an NPC or object through the level at a pace it dictates." },
          { label: "Set-Piece (Scripted Sequence) Flow", definition: "Player-controlled sections are interspersed with scripted, cinematic moments that punctuate the pacing." },
          { label: "Free-Roam Interlude Flow", definition: "An otherwise structured level includes an open, objective-light segment before returning to structured progression." },
          { label: "Boss Rush Flow", definition: "The level consists of consecutive boss or mini-boss encounters with minimal traversal or downtime between them." },
          { label: "Non-Linear Objective Flow", definition: "A set of objectives within the level can be completed in any order the player chooses." },
          { label: "Time-Pressure Flow", definition: "An overall time limit governs pacing, forcing decisions about which paths or optional content to skip." },
        ],
      },
      { id: "env_storytelling", label: "Environmental Storytelling", options: plain(["Ruined Battlefields", "Abandoned Camps", "Graffiti / Notes", "Lighting Cues", "Audio Logs"]) },
      { id: "landmarks_nav", label: "Landmarks and Navigation", options: plain(["Minimap", "Compass", "Waypoint Markers", "Visual Landmarks", "Fast Travel Points"]) },
      { id: "encounter_design", label: "Encounter Design", options: plain(["Ambush Encounters", "Wave-Based Combat", "Puzzle-Gated Rooms", "Boss Arenas"]) },
      { id: "blockout_refs", label: "Blockout References", options: plain(["Top-Down Sketch", "Greybox Screenshot", "3D Blockout Model", "Flow Diagram"]) },
    ],
  },
  {
    id: "controls",
    title: "Control Schemes",
    subsections: [
      { id: "input_mapping", label: "Input Mapping", options: plain(["Controller Layout", "Keyboard/Mouse Layout", "Touch Controls", "Remappable Bindings"]) },
      { id: "context_sensitivity", label: "Context Sensitivity", options: plain(["Interact/Pickup/Talk (Shared Button)", "Context-Sensitive Sprint/Dodge", "Aim-Dependent Actions"]) },
      { id: "feedback", label: "Feedback", options: plain(["Haptic Feedback", "Animation Confirmation", "Sound Cues", "Screen Shake"]) },
      { id: "camera_controls", label: "Camera Controls", options: plain(["Fixed Camera", "Free Camera", "Over-the-Shoulder", "Top-Down", "Cinematic Cutscene Camera"]) },
    ],
  },
  {
    id: "progression",
    title: "Progression and Reward Systems",
    subsections: [
      { id: "progression_types", label: "Progression Types", options: plain(["Linear Leveling", "Skill Trees", "Gear-Based", "Narrative Unlocks", "Hybrid"]) },
      { id: "reward_schedule", label: "Reward Schedule", options: plain(["Fixed Rewards", "Variable / Random Rewards", "Milestone Rewards", "Daily Rewards"]) },
      { id: "reward_types", label: "Reward Types", options: plain(["Cosmetic", "Mechanical (Power)", "Narrative Unlock", "Social Status"]) },
      { id: "pacing_curve", label: "Pacing Curve", options: plain(["Steady Linear Curve", "Steep Early, Flat Late", "Flat Early, Steep Late", "Spiky (Boss Spikes)"]) },
      { id: "player_agency", label: "Player Agency", options: plain(["Free Specialization", "Fixed Progression Path", "Respec Allowed"]) },
      { id: "retention_hooks", label: "Retention Hooks", options: plain(["Daily Login Rewards", "Battle Pass", "Achievements", "Seasonal Events"]) },
    ],
  },
];

function withRuntimeState(sections) {
  return sections.map((s) =>
    s.isCharacterSection
      ? { ...s, characters: [] }
      : { ...s, subsections: s.subsections.map((sub) => ({ ...sub, selected: [], notes: "" })) }
  );
}

let uid = 0;
const nextId = () => `c${Date.now()}_${uid++}`;

/* ============================================================
   MULTI-SELECT CHECKLIST — replaces the native <select multiple>
   ============================================================ */
// options: [{ label, definition }]   selected: [label, ...]
function OptionList({ options, selected, onToggle, onAdd }) {
  const [draft, setDraft] = useState("");
  const [draftDefinition, setDraftDefinition] = useState("");

  const submitDraft = () => {
    const val = draft.trim();
    if (!val) return;
    onAdd(val, draftDefinition.trim());
    setDraft("");
    setDraftDefinition("");
  };

  return (
    <div>
      <div
        style={{ border: `1px solid ${theme.border}`, borderRadius: 8, background: theme.bg, maxHeight: 230, overflowY: "auto" }}
      >
        {options.length === 0 && (
          <div style={{ padding: "14px 12px", color: theme.inkFaint, fontSize: 13, fontFamily: theme.mono }}>
            No options yet — add one below.
          </div>
        )}
        {options.map((opt) => {
          const isSelected = selected.includes(opt.label);
          return (
            <div
              key={opt.label}
              className="gdd-opt-row"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderBottom: `1px solid ${theme.borderSoft}`,
                background: isSelected ? theme.selectSoft : "transparent",
                cursor: "pointer",
              }}
              onClick={() => onToggle(opt.label)}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  border: `1px solid ${isSelected ? theme.select : theme.inkFaint}`,
                  background: isSelected ? theme.select : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isSelected && <Check size={11} color={theme.bg} strokeWidth={3} />}
              </span>
              <span style={{ flex: 1, fontSize: 13.5, color: isSelected ? theme.ink : theme.inkMuted, lineHeight: 1.3 }}>
                {opt.label}
              </span>

              {opt.definition && (
                <div className="gdd-tooltip">
                  {opt.definition}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitDraft()}
          placeholder="Add a new option…"
          style={{
            background: theme.panelAlt,
            border: `1px solid ${theme.border}`,
            borderRadius: 6,
            padding: "7px 10px",
            fontSize: 13,
            color: theme.ink,
            outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={draftDefinition}
            onChange={(e) => setDraftDefinition(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitDraft()}
            placeholder="Definition (optional)…"
            style={{
              flex: 1,
              background: theme.panelAlt,
              border: `1px solid ${theme.border}`,
              borderRadius: 6,
              padding: "7px 10px",
              fontSize: 12.5,
              color: theme.inkMuted,
              outline: "none",
            }}
          />
          <button
            onClick={submitDraft}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: theme.accentSoft,
              border: `1px solid ${theme.accentDim}`,
              color: theme.accent,
              borderRadius: 6,
              padding: "0 10px",
              fontSize: 12.5,
              cursor: "pointer",
              fontFamily: theme.mono,
              flexShrink: 0,
            }}
          >
            <Plus size={13} /> ADD
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SUBSECTION BLOCK (H2 unit): checklist + free-text note
   ============================================================ */
function Subsection({ sub, onToggle, onAdd, onNotes }) {
  return (
    <div style={{ padding: "16px 18px", borderBottom: `1px solid ${theme.borderSoft}` }}>
      <h3
        style={{
          fontFamily: theme.mono,
          fontSize: 11.5,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: theme.inkMuted,
          marginBottom: 10,
          fontWeight: 600,
        }}
      >
        {sub.label}
      </h3>
      <OptionList
        options={sub.options}
        selected={sub.selected}
        onToggle={(opt) => onToggle(sub.id, opt)}
        onAdd={(val, definition) => onAdd(sub.id, val, definition)}
      />
      <textarea
        value={sub.notes}
        onChange={(e) => onNotes(sub.id, e.target.value)}
        placeholder="Additional notes for this item…"
        rows={2}
        style={{
          width: "100%",
          marginTop: 10,
          background: theme.panelAlt,
          border: `1px solid ${theme.border}`,
          borderRadius: 6,
          padding: "8px 10px",
          fontSize: 13,
          color: theme.ink,
          outline: "none",
          resize: "vertical",
          fontFamily: theme.sans,
        }}
      />
    </div>
  );
}

/* ============================================================
   CHARACTER CARD
   ============================================================ */
function CharacterCard({ char, index, fields, onChange, onRemove }) {
  return (
    <div style={{ border: `1px solid ${theme.border}`, borderRadius: 8, background: theme.bg, padding: 14, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontFamily: theme.mono, fontSize: 11.5, color: theme.accent, letterSpacing: "0.06em" }}>
          CHARACTER {String(index + 1).padStart(2, "0")}
        </span>
        <button
          onClick={onRemove}
          style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: theme.danger, cursor: "pointer", fontSize: 12 }}
        >
          <Trash2 size={13} /> Remove
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {fields.map((f) => (
          <div key={f.key} style={{ gridColumn: f.multiline ? "1 / -1" : "auto" }}>
            <label style={{ display: "block", fontFamily: theme.mono, fontSize: 10.5, color: theme.inkFaint, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {f.key}
            </label>
            {f.multiline ? (
              <textarea
                rows={2}
                value={char.values[f.key] || ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                style={{ width: "100%", background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 6, padding: "7px 9px", fontSize: 13, color: theme.ink, outline: "none", resize: "vertical", fontFamily: theme.sans }}
              />
            ) : (
              <input
                value={char.values[f.key] || ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                style={{ width: "100%", background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 6, padding: "7px 9px", fontSize: 13, color: theme.ink, outline: "none" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   TOP-LEVEL SECTION CONTAINER (H1 unit)
   ============================================================ */
function SectionContainer({ section, index, children }) {
  return (
    <div style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 12, marginBottom: 22, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontFamily: theme.mono, fontSize: 12, color: theme.accent, letterSpacing: "0.08em" }}>
          SECTION {String(index + 1).padStart(2, "0")}
        </span>
        <h2 style={{ fontFamily: theme.serif, fontSize: 22, color: theme.ink, fontWeight: 500 }}>{section.title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ============================================================
   DOCUMENT GENERATION — pure organization, no invented text
   ============================================================ */
function generateMarkdown(sections) {
  const lines = [];
  sections.forEach((section) => {
    lines.push(`# ${section.title}`, "");
    if (section.isCharacterSection) {
      section.characters.forEach((char, idx) => {
        const name = (char.values["Name"] || "").trim() || `Character ${idx + 1}`;
        lines.push(`## ${name}`, "");
        section.characterFields.forEach((f) => {
          const val = (char.values[f.key] || "").trim();
          if (val) lines.push(`- **${f.key}:** ${val}`);
        });
        lines.push("");
      });
    } else {
      section.subsections.forEach((sub) => {
        lines.push(`## ${sub.label}`, "");
        sub.selected.forEach((opt) => lines.push(`- ${opt}`));
        if (sub.notes.trim()) {
          if (sub.selected.length) lines.push("");
          lines.push(sub.notes.trim());
        }
        lines.push("");
      });
    }
  });
  return lines.join("\n").trim() + "\n";
}

/* ============================================================
   APP
   ============================================================ */
export default function GDDBuilder() {
  const [sections, setSections] = useState(() => withRuntimeState(initialSections));
  const [doc, setDoc] = useState(null);
  const [copied, setCopied] = useState(false);

  const updateSub = (sectionId, subId, patch) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, subsections: s.subsections.map((sub) => (sub.id !== subId ? sub : { ...sub, ...patch(sub) })) }
      )
    );
  };

  const toggleOption = (sectionId, subId, opt) =>
    updateSub(sectionId, subId, (sub) => ({
      selected: sub.selected.includes(opt) ? sub.selected.filter((o) => o !== opt) : [...sub.selected, opt],
    }));

  const addOption = (sectionId, subId, val, definition = "") =>
    updateSub(sectionId, subId, (sub) =>
      sub.options.some((o) => o.label === val)
        ? {}
        : { options: [...sub.options, { label: val, definition }], selected: [...sub.selected, val] }
    );

  const setNotes = (sectionId, subId, val) => updateSub(sectionId, subId, () => ({ notes: val }));

  const addCharacter = (sectionId) =>
    setSections((prev) =>
      prev.map((s) => (s.id !== sectionId ? s : { ...s, characters: [...s.characters, { id: nextId(), values: {} }] }))
    );

  const removeCharacter = (sectionId, charId) =>
    setSections((prev) =>
      prev.map((s) => (s.id !== sectionId ? s : { ...s, characters: s.characters.filter((c) => c.id !== charId) }))
    );

  const updateCharacterField = (sectionId, charId, field, value) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, characters: s.characters.map((c) => (c.id !== charId ? c : { ...c, values: { ...c.values, [field]: value } })) }
      )
    );

  const handleGenerate = () => setDoc(generateMarkdown(sections));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(doc);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleDownload = () => {
    const blob = new Blob([doc], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "game-design-document.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- DOCUMENT PREVIEW VIEW ---------- */
  if (doc !== null) {
    return (
      <div style={{ minHeight: "100%", background: theme.bg, fontFamily: theme.sans, padding: "32px 16px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <button
              onClick={() => setDoc(null)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: theme.inkMuted, cursor: "pointer", fontSize: 13, fontFamily: theme.mono }}
            >
              <ArrowLeft size={15} /> BACK TO EDITOR
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleCopy} style={btnGhost}>
                {copied ? <Check size={14} color={theme.select} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
              </button>
              <button onClick={handleDownload} style={btnAccent}>
                <Download size={14} /> Download .md
              </button>
            </div>
          </div>
          <div
            style={{
              background: theme.paper,
              color: theme.paperInk,
              borderRadius: 10,
              padding: "40px 46px",
              fontFamily: theme.serif,
              fontSize: 15.5,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
            }}
          >
            {doc}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- EDITOR VIEW ---------- */
  return (
    <div style={{ minHeight: "100%", background: theme.bg, fontFamily: theme.sans, padding: "32px 16px 90px" }}>
      <style>{`
        .gdd-tooltip {
          position: absolute;
          left: 30px;
          bottom: 100%;
          transform: translateY(-6px);
          background: ${theme.panelAlt};
          color: ${theme.ink};
          border: 1px solid ${theme.border};
          padding: 9px 11px;
          border-radius: 7px;
          font-size: 12px;
          line-height: 1.45;
          width: 270px;
          max-width: 65vw;
          box-shadow: 0 10px 26px rgba(0,0,0,0.45);
          opacity: 0;
          visibility: hidden;
          transition: opacity .12s ease;
          z-index: 50;
          pointer-events: none;
        }
        .gdd-opt-row:hover .gdd-tooltip { opacity: 1; visibility: visible; }
      `}</style>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <FileText size={20} color={theme.accent} />
          <span style={{ fontFamily: theme.mono, fontSize: 11.5, color: theme.inkFaint, letterSpacing: "0.1em" }}>GDD BUILDER</span>
        </div>
        <h1 style={{ fontFamily: theme.serif, fontSize: 34, color: theme.ink, marginBottom: 28, fontWeight: 500 }}>
          Game Design Document
        </h1>
        <p style={{ fontSize: 13, color: theme.inkFaint, marginTop: -20, marginBottom: 28 }}>
          Hover any option with a definition (like World Structure) to see what it means.
        </p>

        {sections.map((section, i) => (
          <SectionContainer key={section.id} section={section} index={i}>
            {section.isCharacterSection ? (
              <div style={{ padding: 18 }}>
                {section.characters.map((char, idx) => (
                  <CharacterCard
                    key={char.id}
                    char={char}
                    index={idx}
                    fields={section.characterFields}
                    onChange={(field, val) => updateCharacterField(section.id, char.id, field, val)}
                    onRemove={() => removeCharacter(section.id, char.id)}
                  />
                ))}
                <button onClick={() => addCharacter(section.id)} style={{ ...btnAccent, width: "100%", justifyContent: "center" }}>
                  <Plus size={14} /> Add Character
                </button>
              </div>
            ) : (
              section.subsections.map((sub) => (
                <Subsection
                  key={sub.id}
                  sub={sub}
                  onToggle={(subId, opt) => toggleOption(section.id, subId, opt)}
                  onAdd={(subId, val, definition) => addOption(section.id, subId, val, definition)}
                  onNotes={(subId, val) => setNotes(section.id, subId, val)}
                />
              ))
            )}
          </SectionContainer>
        ))}

        <button onClick={handleGenerate} style={{ ...btnAccent, width: "100%", justifyContent: "center", padding: "13px 0", fontSize: 14.5 }}>
          <FileText size={16} /> Generate Document
        </button>
      </div>
    </div>
  );
}

const btnGhost = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "none",
  border: `1px solid ${theme.border}`,
  color: theme.inkMuted,
  borderRadius: 7,
  padding: "7px 12px",
  fontSize: 13,
  cursor: "pointer",
};

const btnAccent = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: theme.accentSoft,
  border: `1px solid ${theme.accentDim}`,
  color: theme.accent,
  borderRadius: 7,
  padding: "7px 12px",
  fontSize: 13,
  cursor: "pointer",
  fontFamily: theme.mono,
};
