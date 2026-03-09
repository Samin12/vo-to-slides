# VO-to-Slides Skill

Turn voiceover scripts into diagram-heavy, visual slide decks. One idea per slide. Minimal text. Maximum visual impact.

## Overview

This skill takes a voiceover script (the narration for a video) and produces a complete `.pptx` presentation where every slide communicates exactly one idea through diagrams, icons, and visual layouts — not walls of text.

**The pipeline:**
```
Voiceover Script → Slide Spec (JSON) → Generated .pptx
```

## Phase 1: Parse the Voiceover into Slide Moments

Read the voiceover script and break it into **slide moments** — each moment is one idea that deserves its own slide.

### Rules for splitting:
- **Chapter titles** get their own slide (icon + big text centered)
- **Each distinct concept** gets its own slide (don't combine "the model" and "the tools" — separate slides)
- **Analogies** get their own slide (visual comparison)
- **Quotes** get their own slide
- **Transitions** between sections get a chapter title slide
- **Examples** get their own slide
- When in doubt, **make more slides** — it's a video, slides go fast

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

## Theme Configuration

Edit `theme.json` to change the visual style. The default theme matches Anthropic's warm presentation style:
- Cream background (#F5F0E8)
- Beige cards (#DDD5C8)
- Burnt orange accent (#C4703F)
- Sage green for connections (#A7BEAE)
- Lavender for skills (#B8B8D1)
- Georgia headings, Calibri body, Consolas code

To use a different brand, replace the colors/fonts in `theme.json`.

## Assets

Place reference images in `assets/`. Reference them in the spec by filename:

```json
{
  "type": "reference_image",
  "data": { "image": "assets/agents-diagram.png" }
}
```

The generator will embed them as base64.

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

1. **Diagrams over text** — If you can show it with icons and arrows, don't write a paragraph
2. **One idea per slide** — If a slide has two ideas, split it
3. **Labels not sentences** — Text on slides should be 1-5 words max
4. **Visual variety** — Don't repeat the same layout 3 slides in a row
5. **Icons tell stories** — A lightbulb + "≠" + graduation cap says "smart isn't experienced" without a single sentence
6. **Reference images slot in** — If the user provides reference diagrams, use them directly
7. **More slides = better** — For video, 30-50 slides for a 10-15 min script is normal
