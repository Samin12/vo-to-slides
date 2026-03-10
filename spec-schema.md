# Slide Spec Schema

The spec is a JSON file with this top-level structure:

```json
{
  "title": "Presentation Title",
  "author": "Author Name",
  "theme": "theme.json",
  "assets": ["assets/image1.png", "assets/image2.png"],
  "slides": [ ... ]
}
```

Each slide in the `slides` array is an object with:
- `type` (required) — the layout template name
- `vo` (required) — the voiceover line(s) this slide accompanies
- `data` (required) — type-specific content

---

## Slide Types

### `chapter_title`

Big centered text with an icon above. Used for section transitions.

```json
{
  "type": "chapter_title",
  "vo": "What Are Skills?",
  "data": {
    "title": "What Are Skills?",
    "icon": "bookOpen",
    "icon_color": "accent",
    "secondary_icon": "cog"
  }
}
```

- `title` — the chapter name (large centered text)
- `icon` — main icon key (displayed large above title)
- `icon_color` — color key from theme (default: "accent")
- `secondary_icon` — optional small icon next to main icon

---

### `credit`

Attribution card for source material.

```json
{
  "type": "credit",
  "vo": "Based on the Anthropic team's talk...",
  "data": {
    "title": "Don't Build Agents, Build Skills Instead",
    "attribution": "Anthropic Team",
    "note": "Link in description"
  }
}
```

---

### `single_concept`

One concept shown as a large icon/diagram in a card with a label.

```json
{
  "type": "single_concept",
  "vo": "The model is the brain...",
  "data": {
    "title": "The Model",
    "subtitle": "The brain that powers everything",
    "main_icon": "brain",
    "main_icon_size": 1.5,
    "card": true,
    "supporting_icons": [
      {"icon": "claude", "label": "Claude"},
      {"icon": "cog", "label": "GPT"},
      {"icon": "robot", "label": "Other"}
    ]
  }
}
```

- `card` — whether to wrap in a beige rounded card
- `supporting_icons` — optional row of smaller icons below

---

### `icon_grid`

Grid of icons in cards, each with a label. Good for showing multiple items of the same category.

```json
{
  "type": "icon_grid",
  "vo": "APIs, file systems, browsers, databases...",
  "data": {
    "title": "The Tools",
    "subtitle": "What it can interact with",
    "columns": 3,
    "items": [
      {"icon": "globe", "label": "Browser"},
      {"icon": "db", "label": "Database"},
      {"icon": "folder", "label": "Files"},
      {"icon": "plug", "label": "APIs"},
      {"icon": "terminal", "label": "Terminal"},
      {"icon": "cogs", "label": "Services"}
    ]
  }
}
```

---

### `tagged_concept`

A central icon with floating tag pills around it.

```json
{
  "type": "tagged_concept",
  "vo": "The system prompt defines identity, behavior, capabilities...",
  "data": {
    "title": "The System Prompt",
    "subtitle": "Instructions that define the agent",
    "main_icon": "file",
    "tags": [
      {"text": "Identity", "color": "accent"},
      {"text": "Behavior", "color": "sage"},
      {"text": "Capabilities", "color": "lavender"}
    ]
  }
}
```

---

### `equation`

Visual equation: Icon + Icon + Icon = Result. Icons with labels connected by + and = signs.

```json
{
  "type": "equation",
  "vo": "You put those three things together and you get an agent",
  "data": {
    "title": "Model + Tools + Prompt = Agent",
    "terms": [
      {"icon": "brain", "label": "Model"},
      {"icon": "wrench", "label": "Tools"},
      {"icon": "file", "label": "Prompt"}
    ],
    "result": {
      "type": "agent_card",
      "label": "Agent"
    }
  }
}
```

---

### `agent_card`

A single rounded card showing the Claude icon looping with a tool icon. Matches Anthropic's agent card style.

```json
{
  "type": "agent_card",
  "vo": "A marketing agent is Claude plus marketing tools...",
  "data": {
    "title": "Example: Marketing Agent",
    "card_label": "Marketing Agent",
    "tool_icon": "horn",
    "supporting_icons": ["envelope", "chart", "comment", "bullseye"]
  }
}
```

---

### `card_row`

Multiple agent/concept cards in a horizontal row. Matches the Anthropic "How we used to think about agents" layout.

```json
{
  "type": "card_row",
  "vo": "A separate agent for every use case...",
  "data": {
    "title": "How we used to think about agents",
    "cards": [
      {"label": "Coding Agent", "tool_icon": "laptop"},
      {"label": "Research Agent", "tool_icon": "globe"},
      {"label": "Finance Agent", "tool_icon": "chart"},
      {"label": "Marketing Agent", "tool_icon": "horn"}
    ]
  }
}
```

---

### `broken_grid`

Multiple cards scattered with broken connections (dashed red lines, X marks). Shows disconnection/chaos.

```json
{
  "type": "broken_grid",
  "vo": "Ten different systems that don't talk to each other...",
  "data": {
    "title": "This Doesn't Scale",
    "subtitle": "Like hiring a new person for every single task",
    "count": 8
  }
}
```

---

### `comparison`

Two items side by side with a symbol between them (≠, vs, →).

```json
{
  "type": "comparison",
  "vo": "Smart isn't the same as experienced...",
  "data": {
    "left": {"icon": "bulb", "label": "Smart"},
    "right": {"icon": "grad", "label": "Experienced", "secondary_icon": "medal"},
    "symbol": "≠",
    "symbol_color": "accent"
  }
}
```

---

### `option_card`

A single option card (Option A or Option B) with visuals inside.

```json
{
  "type": "option_card",
  "vo": "A genius who never filed a tax return...",
  "data": {
    "option_label": "Option A",
    "option_color": "accent",
    "main_icon": "bulb",
    "scatter_icons": ["file_grey", "file_grey", "question_red"],
    "caption": "Genius -- but never filed a tax return"
  }
}
```

---

### `option_pick`

Two option cards side by side, one dimmed with X, one highlighted with checkmark.

```json
{
  "type": "option_pick",
  "vo": "You pick the CPA. Every time.",
  "data": {
    "title": "You pick the CPA. Every time.",
    "left": {"icon": "bulb_grey", "label": "Option A", "state": "rejected"},
    "right": {"icon": "userTie", "label": "Option B", "state": "selected"}
  }
}
```

---

### `missing_piece`

Agent card with a dashed-outline missing element. Shows something is incomplete.

```json
{
  "type": "missing_piece",
  "vo": "Brilliant, but missing expertise...",
  "data": {
    "title": "Every AI agent right now",
    "caption": "Brilliant. Missing expertise.",
    "attribution": "-- Anthropic Team"
  }
}
```

---

### `transition_diagram`

Left side (old/faded with X) → arrow → right side (new/highlighted). Shows a paradigm shift.

```json
{
  "type": "transition_diagram",
  "vo": "From many agents to one agent with skills...",
  "data": {
    "title": "The New Approach",
    "left": {"type": "agent_stack", "count": 4, "state": "rejected"},
    "right": {"type": "agent_with_filesystem"}
  }
}
```

---

### `file_tree`

A white card showing a monospace file tree. Matches the Anthropic "Skills are just folders" style.

```json
{
  "type": "file_tree",
  "vo": "A skill is just a folder with text files...",
  "data": {
    "title": "Skills are just folders",
    "folder": "anthropic_brand",
    "files": [
      {"name": "SKILL.md", "color": "blue"},
      {"name": "docs.md", "color": "blue"},
      {"name": "slide-decks.md", "color": "orange"},
      {"name": "apply_template.py", "color": "purple"}
    ]
  }
}
```

---

### `checklist`

Rows of icon + label pairs with colored left borders. Like an "inside a skill" breakdown.

```json
{
  "type": "checklist",
  "vo": "What to do, steps to follow, tools and how to use them...",
  "data": {
    "title": "Inside a Skill",
    "items": [
      {"icon": "bullseye", "label": "What to do", "color": "accent"},
      {"icon": "clipboard", "label": "Steps to follow", "color": "sage"},
      {"icon": "wrench", "label": "Tools available", "color": "lavender"},
      {"icon": "handshake", "label": "How to use them", "color": "accent"}
    ]
  }
}
```

---

### `hub_spoke`

Central element with radiating connections to surrounding badges/cards.

```json
{
  "type": "hub_spoke",
  "vo": "One great hire trained on everything...",
  "data": {
    "title": "One great hire. Trained on everything.",
    "center": "claude",
    "spokes": [
      {"label": "Onboarding"},
      {"label": "Support"},
      {"label": "Follow-Up"},
      {"label": "Invoicing"},
      {"label": "Marketing"},
      {"label": "Outreach"}
    ],
    "spoke_color": "lavender"
  }
}
```

---

### `dual_playbook`

Two side-by-side cards that look like open playbook pages with mini-diagrams inside.

```json
{
  "type": "dual_playbook",
  "vo": "Here's how we onboard. Here's how we do support...",
  "data": {
    "title": "Skills are playbooks",
    "left": {"header": "Client Onboarding", "icon": "handshake", "color": "sage", "diagram": "steps_3"},
    "right": {"header": "Customer Support", "icon": "headset", "color": "accent", "diagram": "flowchart"}
  }
}
```

---

### `before_after`

Split comparison: messy left (Before) → clean right (After).

```json
{
  "type": "before_after",
  "vo": "Instead of ten agents, just text files...",
  "data": {
    "title": "Easier to manage",
    "before": {"type": "agent_grid", "count": 8, "state": "chaotic"},
    "after": {"type": "file_stack", "files": ["skill-1.md", "skill-2.md", "skill-3.md"]}
  }
}
```

---

### `share_flow`

Central item with arrows fanning out to multiple destinations.

```json
{
  "type": "share_flow",
  "vo": "Zip them up and share...",
  "data": {
    "title": "Share anywhere",
    "source_icon": "folderOpen",
    "destinations": [
      {"icon": "github", "label": "GitHub"},
      {"icon": "fileCode", "label": ".zip"},
      {"icon": "share", "label": "Drive"}
    ]
  }
}
```

---

### `filing_cabinet`

Visual metaphor: filing cabinet with one drawer open/highlighted.

```json
{
  "type": "filing_cabinet",
  "vo": "Progressive disclosure...",
  "data": {
    "title": "Progressive Disclosure",
    "drawers": 5,
    "active_drawer": 2
  }
}
```

---

### `overload`

Agent card overflowing with crammed document icons. Shows system overload.

```json
{
  "type": "overload",
  "vo": "Everything loads at once...",
  "data": {
    "title": "Everything at once",
    "doc_count": 10
  }
}
```

---

### `index_expand`

Table of contents on the left, one item highlighted, expanding into a full card on the right.

```json
{
  "type": "index_expand",
  "vo": "Claude sees an index, loads only what it needs...",
  "data": {
    "title": "Claude sees an index",
    "index_items": ["onboarding", "support", "invoicing", "marketing", "outreach", "scheduling"],
    "active_item": 2,
    "expanded_folder": "invoicing",
    "expanded_files": ["SKILL.md", "templates.md", "examples.md", "tools.py"]
  }
}
```

---

### `highlight_grid`

Grid of rectangles with one highlighted. Shows selection from many.

```json
{
  "type": "highlight_grid",
  "vo": "Picks the right one automatically...",
  "data": {
    "title": "Loads only what it needs",
    "rows": 3,
    "cols": 5,
    "active_row": 1,
    "active_col": 2,
    "grid_color": "lavender",
    "active_color": "accent"
  }
}
```

---

### `book_split`

Split: left shows book overload (X), right shows reading one chapter (checkmark).

```json
{
  "type": "book_split",
  "vo": "Like trying to remember 10 books at once...",
  "data": {
    "left_label": "10 books at once",
    "right_label": "One chapter at a time"
  }
}
```

---

### `professional_row`

Row of professional figure icons. Shows non-technical roles.

```json
{
  "type": "professional_row",
  "vo": "Anyone can build a skill...",
  "data": {
    "title": "Anyone Can Build a Skill",
    "icons": ["userTie", "calc", "gavel", "headset"]
  }
}
```

---

### `quote_visual`

Large quote mark + row of professional icons creating skill docs.

```json
{
  "type": "quote_visual",
  "vo": "Skills are being built by non-technical people...",
  "data": {
    "quote": "Skills are being built by people that aren't technical.",
    "attribution": "-- Anthropic Team",
    "icon_pairs": [
      {"person": "userTie", "label": "Finance"},
      {"person": "handshake", "label": "Recruiting"},
      {"person": "calc", "label": "Accounting"},
      {"person": "gavel", "label": "Legal"},
      {"person": "clipboard", "label": "Ops"}
    ]
  }
}
```

---

### `code_vs_chat`

Code icon with X vs chat icon with checkmark. "No code, just conversation."

```json
{
  "type": "code_vs_chat",
  "vo": "You don't need to write a single line of code...",
  "data": {
    "caption": "No code. Just conversation."
  }
}
```

---

### `three_step_flow`

Horizontal 3-step flow: Step 1 → Step 2 → Step 3.

```json
{
  "type": "three_step_flow",
  "vo": "Just say turn this into a skill...",
  "data": {
    "title": "The Skill Creator",
    "steps": [
      {"icon": "comment", "content": "\"Turn this\\ninto a skill\"", "label": "Conversation"},
      {"icon": "claude_processing", "label": "Processing"},
      {"icon": "folder_with_files", "files": ["SKILL.md", "docs.md", "tools.py"], "label": "Packaged Skill"}
    ]
  }
}
```

---

### `spoke_diagram`

Center icon with radiating connections to app/tool icons. Used for MCP connections.

```json
{
  "type": "spoke_diagram",
  "vo": "MCP connects Claude to your tools...",
  "data": {
    "title": "MCP = Access",
    "center": "claude",
    "spokes": [
      {"icon": "envelope", "label": "Email"},
      {"icon": "calendar", "label": "Calendar"},
      {"icon": "db", "label": "CRM"},
      {"icon": "globe", "label": "Browser"},
      {"icon": "chart", "label": "Analytics"},
      {"icon": "comments", "label": "Slack"}
    ],
    "spoke_color": "sage",
    "spoke_state": "connected"
  }
}
```

Use `spoke_state: "confused"` to show question marks (connected but lost), or `spoke_state: "skilled"` to show checkmarks with skill badges.

---

### `three_panel`

Three-column layout: Left panel + Center agent + Right panel.

```json
{
  "type": "three_panel",
  "vo": "MCP is access. Skills are experience.",
  "data": {
    "title": "One Agent. Any Tool. Your Way.",
    "left": {
      "color": "sage",
      "header_icon": "plug",
      "header": "Access",
      "items": ["Calendar", "Slack", "CRM"]
    },
    "right": {
      "color": "lavender",
      "header_icon": "bookOpen",
      "header": "Experience",
      "items": ["How to schedule", "How to outreach", "How to qualify"]
    }
  }
}
```

---

### `closing`

Energetic closing slide with icon + bold text.

```json
{
  "type": "closing",
  "vo": "Let's dive in and start building...",
  "data": {
    "title": "Let's Build.",
    "icons": ["rocket", "claude", "terminal"]
  }
}
```

---

### `reference_image`

Full-bleed reference image from assets folder.

```json
{
  "type": "reference_image",
  "vo": "...",
  "data": {
    "image": "assets/agents-diagram.png"
  }
}
```

---

### `screenshot` (auto-captured)

A slide that will be auto-captured from a live URL using Playwright. Run `capture-screenshots.py` to convert these into `reference_image` slides.

```json
{
  "type": "screenshot",
  "vo": "Here's what the Claude Code interface looks like...",
  "data": {
    "screenshot_url": "https://claude.ai/code",
    "screenshot_selector": ".main-content",
    "screenshot_delay": 3000,
    "screenshot_full_page": false
  }
}
```

- `screenshot_url` (required) - URL to capture
- `screenshot_selector` (optional) - CSS selector to capture a specific element instead of full viewport
- `screenshot_delay` (optional, default: 2000) - milliseconds to wait after page load before capturing
- `screenshot_full_page` (optional, default: false) - capture the full scrollable page

After running `capture-screenshots.py`, the slide is automatically converted to a `reference_image` with the captured PNG in `assets/`.

---

## Color Keys

Use these keys in `color` fields — they map to `theme.json`:

| Key | Default | Use |
|-----|---------|-----|
| `accent` | `#C4703F` | Burnt orange — highlights, active items |
| `red` | `#D4543C` | Claude icon background |
| `sage` | `#A7BEAE` | MCP connections, Option B |
| `lavender` | `#B8B8D1` | Skills, filesystem badges |
| `green` | `#6DAA6D` | Checkmarks, success |
| `danger` | `#CC4444` | X marks, failures, warnings |
| `card` | `#DDD5C8` | Card backgrounds |
| `white` | `#FFFFFF` | White card backgrounds |
