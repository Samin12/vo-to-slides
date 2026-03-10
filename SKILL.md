# VO-to-Slides Skill

Turn voiceover scripts into diagram-heavy, visual slide decks. One idea per slide. Minimal text. Maximum visual impact.

## Overview

This skill takes a voiceover script (the narration for a video) and produces a complete `.pptx` presentation where every slide communicates exactly one idea through diagrams, icons, and visual layouts — not walls of text.

**The pipeline:**
```
Heptabase / Folder → Gather Script + Assets → Slide Spec (JSON) → Generated .pptx → QA Loop
```

## Phase 0: Gather Inputs

Scripts and assets come from one of two sources:

### Source A: Heptabase Whiteboard (primary)

The user gives a whiteboard name, topic, or ID.

1. **Find the whiteboard** — Use `search_whiteboards` with keywords, or `semantic_search_objects` to find script cards
2. **Load everything** — Call `get_whiteboard_with_objects` to see all objects: cards, images, sections, text elements, connections
3. **Read the script** — Use `get_object` on the script card(s) to get the full voiceover text. Check `hasMore` flag and paginate if needed
4. **Grab images** — Identify all `imageCard` / `imageElement` objects on the whiteboard. These are screenshots, screen share demos, diagrams, UI mockups. Download and save each one to `vo-to-slides/assets/` with descriptive filenames (e.g., `assets/dashboard-screenshot.png`, `assets/mcp-diagram.png`)
5. **Note context** — Read any section headers or text elements on the whiteboard for additional context about slide ordering or emphasis

### Source B: Local Folder

The user gives a folder path containing the script (`.md` file) and images.

1. **Read the script** — Find and read the `.md` file
2. **Copy images** — Copy all `.png`, `.jpg`, `.gif`, `.webp` files to `vo-to-slides/assets/`
3. **Note any README or notes** for context

### Source C: Pasted Text

The user pastes the script directly. No asset gathering needed unless they provide image paths separately.

## Phase 1: Parse the Voiceover into Slide Moments

Read the voiceover script and break it into **slide moments** — each moment is one idea that deserves its own slide. **Err heavily on the side of more slides.** A 10-minute script should produce 30-50+ slides minimum. They go fast in a video — the viewer barely registers each one before the next appears.

### Rules for splitting:
- **Chapter titles** get their own slide (icon + big text centered)
- **Each distinct concept** gets its own slide (don't combine "the model" and "the tools" - separate slides)
- **Analogies** get their own slide (visual comparison)
- **Quotes** get their own slide
- **Transitions** between sections get a chapter title slide
- **Examples** get their own slide
- **Screen share demos** get their own `reference_image` slide using assets gathered in Phase 0
- **Before/after comparisons** mentioned in the script get split into separate slides or a `before_after` / `comparison` type
- When in doubt, **make more slides** - it's a video, slides go fast
- **NEVER combine two ideas on one slide** - if you're tempted, that's two slides

### For each moment, determine:
1. What is the ONE idea?
2. What **slide type** best communicates it? (see `spec-schema.md`)
3. What visual elements tell the story? (icons, diagrams, flows, comparisons)
4. What text is needed? (labels only — not sentences)

## Phase 2: Generate the Slide Spec

Output a JSON spec following the schema in `spec-schema.md`. Each slide is an object with:
- `type` — the layout template
- `vo` — the voiceover line(s) this slide accompanies
- `data` — type-specific content (titles, icons, labels, elements)

Read `spec-schema.md` for all available types and their data formats.

## Phase 3: Build the Slides

Run `generate.js` with the spec to produce the `.pptx`:

```bash
# Install deps (first time only)
npm install -g pptxgenjs react-icons react react-dom sharp

# Generate
node generate.js --spec spec.json --theme theme.json --output slides.pptx
```

The generator reads the JSON spec, the theme config, and any assets in `assets/`, then produces the final deck.

## Phase 4: QA

```bash
# Convert to images
python3 scripts/office/soffice.py --headless --convert-to pdf slides.pptx
rm -f slide-*.jpg
pdftoppm -jpeg -r 150 slides.pdf slide
ls -1 "$PWD"/slide-*.jpg
```

Inspect every slide. Check for:
- Overlapping elements
- Missing icons or broken layouts
- Text overflow
- Slides that have too much text (should be mostly visual)
- Slides that don't communicate their ONE idea clearly

## Design System

**Read `design-guide.md` before generating any spec.** It defines the full Anthropic visual language.

### Quick Reference

**Backgrounds:** Cream `#faf9f5` (slides), Light gray `#e8e6dc` (cards), White `#ffffff` (highlight cards). NEVER pure white backgrounds.

**Text:** Dark `#141413` (headings/primary), Mid gray `#b0aea5` (secondary). NEVER pure black.

**Accents:** Orange `#d97757` (primary pop), Blue `#6a9bcc` (secondary), Green `#788c5d` (success). Cycle through them for multi-item layouts.

**Fonts:** Poppins (headings, Bold/SemiBold), Lora (body/labels, Regular), JetBrains Mono (code).

**Shapes:** Rounded corners (12-16px radius), 2px borders, generous padding. No shadows - depth via color only.

### Theme File

Edit `theme.json` to change colors/fonts. The generator reads it at build time. See `design-guide.md` for the full color palette, type scale, layout standards, and do's/don'ts.

## Assets

Assets are gathered automatically in Phase 0 from Heptabase whiteboards or local folders. They live in `assets/` and are referenced by filename in the spec.

### How assets become slides

When the script references a demo, screenshot, UI, or diagram, match it to the corresponding asset and create a `reference_image` slide:

```json
{
  "type": "reference_image",
  "vo": "Here's what the MCP dashboard looks like...",
  "data": { "image": "assets/mcp-dashboard.png" }
}
```

The generator reads the file, converts to base64, and embeds it full-bleed (16:9 cover).

### Asset naming convention

Use descriptive kebab-case names when saving assets:
- `assets/claude-code-terminal.png` (not `assets/img1.png`)
- `assets/mcp-server-diagram.png`
- `assets/before-refactor.png`

### Interleaving assets with diagrams

Don't dump all screenshots in a row. Interleave them with diagrammatic slides:
```
chapter_title → reference_image (demo) → single_concept (explain) → reference_image (result) → comparison
```

This keeps the visual rhythm varied and engaging.

## Icon Library

Icons come from `react-icons`. Use the icon key names defined in the generator. Common ones:

| Key | Icon | Use for |
|-----|------|---------|
| `brain` | Brain | Models, AI, thinking |
| `wrench` | Wrench | Tools, building |
| `file` | Document | Prompts, skills, docs |
| `globe` | Globe | Browser, web, world |
| `db` | Database | Data, storage |
| `plug` | Plug | APIs, connections, MCP |
| `terminal` | Terminal | Code, CLI |
| `cogs` | Gears | Processing, systems |
| `folder` | Folder | Files, skills |
| `bulb` | Lightbulb | Ideas, smart |
| `grad` | Graduation cap | Experience, learning |
| `medal` | Medal | Achievement, expertise |
| `user` | Person | People, users |
| `userTie` | Professional | Business, CPA |
| `handshake` | Handshake | Onboarding, deals |
| `headset` | Headset | Support |
| `calc` | Calculator | Finance, accounting |
| `gavel` | Gavel | Legal |
| `envelope` | Envelope | Email |
| `chart` | Bar chart | Analytics, data |
| `comment` | Speech bubble | Chat, conversation |
| `rocket` | Rocket | Launch, build |
| `laptop` | Laptop | Code, work |
| `star` | Star | Quality, featured |
| `search` | Magnifying glass | Discovery, search |
| `book` | Book | Knowledge, reading |
| `bookOpen` | Open book | Learning, skills |
| `check` | Checkmark | Success, done |
| `xCircle` | X circle | Failure, wrong |
| `warning` | Warning | Danger, overload |
| `clipboard` | Clipboard | Tasks, lists |

## Key Principles

1. **Diagrams over text** - If you can show it with icons and arrows, don't write a paragraph
2. **One idea per slide** - If a slide has two ideas, split it. No exceptions
3. **Labels not sentences** - Text on slides should be 1-5 words max
4. **Visual variety** - Don't repeat the same layout 3 slides in a row. Alternate between diagram types and reference images
5. **Icons tell stories** - A lightbulb + "≠" + graduation cap says "smart isn't experienced" without a single sentence
6. **Reference images slot in** - Screenshots, demos, and diagrams from Heptabase or folders go in as full-bleed `reference_image` slides
7. **More slides = better** - For video, 30-50+ slides for a 10-15 min script is the minimum. When in doubt, add another slide
8. **Interleave demos with diagrams** - Don't cluster all screenshots together. Alternate: demo → explain → demo → compare
9. **Every slide earns its place** - Each slide should make the viewer understand something they didn't 2 seconds ago
