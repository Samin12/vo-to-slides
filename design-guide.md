# Anthropic Design Guide for VO-to-Slides

This file defines the visual language for all slide decks. Every slide should feel like it came from Anthropic's own presentations.

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| Dark | `#141413` | Primary text, headings, dark backgrounds |
| Light / Cream | `#faf9f5` | Slide backgrounds, light text on dark |
| Mid Gray | `#b0aea5` | Secondary text, muted labels, borders |
| Light Gray | `#e8e6dc` | Card backgrounds, subtle containers |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| Orange (Primary) | `#d97757` | Primary accent - highlights, active states, CTAs, key labels |
| Blue (Secondary) | `#6a9bcc` | Secondary accent - connections, links, data, info states |
| Green (Tertiary) | `#788c5d` | Tertiary accent - success, checkmarks, completed states |

### Extended Palette

| Name | Hex | Usage |
|------|-----|-------|
| Claude Red | `#d4543c` | Claude icon background, brand mark |
| Sage | `#a7beae` | Connections, MCP, integrations |
| Lavender | `#b8b8d1` | Skills, filesystem, special categories |
| Danger Red | `#cc4444` | Errors, X marks, rejected states |
| Card Beige | `#e8e6dc` | Card/container backgrounds |
| Card Dark | `#ddd5c8` | Deeper card backgrounds, secondary containers |
| White | `#ffffff` | Code blocks, highlight cards, contrast containers |

### Background Hierarchy

1. **Slide background**: `#faf9f5` (warm cream, NOT pure white)
2. **Card/container**: `#e8e6dc` (light gray, subtle lift from background)
3. **Nested card**: `#ddd5c8` (slightly deeper for depth)
4. **Highlight card**: `#ffffff` (white pops against cream)
5. **Dark section**: `#141413` (inverted, use for emphasis slides)

### Color Rules

- NEVER use pure white (`#ffffff`) as a slide background - always use cream `#faf9f5`
- NEVER use pure black (`#000000`) for text - use dark `#141413`
- Accent orange `#d97757` is the primary pop color - use it for the most important element on each slide
- Cycle through orange, blue, green for multi-item layouts to maintain visual interest
- Use mid gray `#b0aea5` for secondary/supporting text, never for primary content
- Danger red `#cc4444` only for negative states (errors, rejections, X marks)
- Green `#788c5d` for positive states (checkmarks, success, completion)

## Typography

### Font Stack

| Role | Primary | Fallback | Notes |
|------|---------|----------|-------|
| Headings | **Poppins** | Arial | Clean, modern geometric sans-serif. Bold weight for titles. |
| Body | **Lora** | Georgia | Warm serif with personality. Regular weight for labels. |
| Code | **JetBrains Mono** | Consolas | Monospace for code blocks, terminal output, file paths. |

### Anthropic's Brand Fonts (Reference)

Anthropic internally uses Styrene (Commercial Type) and Tiempos (Klim), but these are licensed/commercial fonts. For our slides:
- **Poppins** captures the geometric clarity of Styrene
- **Lora** captures the warm serif character of Tiempos
- Both are free Google Fonts, available everywhere

### Type Scale

| Level | Size (pt) | Font | Weight | Usage |
|-------|-----------|------|--------|-------|
| Display | 48-56 | Poppins | Bold | Title slides, chapter titles |
| Title | 36-40 | Poppins | Bold | Slide titles |
| Heading | 28-32 | Poppins | SemiBold | Section headings, key statements |
| Subheading | 20-24 | Poppins | Medium | Subtitles, supporting headlines |
| Body | 16-18 | Lora | Regular | Labels, descriptions, card text |
| Caption | 12-14 | Lora | Regular | Small annotations, source text |
| Code | 14-16 | JetBrains Mono | Regular | Code snippets, file names, terminal |

### Typography Rules

- Headings: ALL use Poppins. Bold for titles, SemiBold for headings, Medium for subheadings
- Body text on slides should be 1-5 words MAX - these are visual slides, not documents
- Labels inside shapes use Lora at 16pt minimum
- NEVER use font sizes below 12pt - slides are viewed on screens, readability matters
- Letter spacing: slightly loose on headings (+0.5pt) for breathing room
- Line height: 1.3x for headings, 1.5x for body text

## Design Principles

### 1. Warm Minimalism
Anthropic's design is warm, not cold. The cream backgrounds, soft accents, and serif body text create approachability. Avoid stark black-on-white. Every slide should feel inviting.

### 2. Technical Clarity
Despite the warmth, the content is precise. Diagrams should be clean and unambiguous. Every visual element earns its place. No decoration without purpose.

### 3. Human-Centered
The design serves comprehension. If a viewer can't understand the slide in 2-3 seconds, it's too complex. Split it.

### 4. Consistent Rhythm
Alternate between slide types. Never repeat the same layout 3 times in a row. The visual rhythm should feel like a conversation, not a lecture.

### 5. Breathing Room
Generous padding and margins. Elements should never feel cramped. White space (cream space) is a design element, not wasted space.

## Shape & Layout Standards

### Cards
- Corner radius: 12-16px (rounded, not sharp)
- Border: 1-2px solid, color matches the card's semantic meaning
- Background: `#e8e6dc` for standard, `#ffffff` for highlight
- Padding: 20-30px internal padding minimum
- Shadow: none (flat design, depth via color only)

### Icons
- Size: 48-96px depending on importance
- Color: match the semantic accent (orange for primary, blue for secondary, green for success)
- Style: solid fill, not outlined - matches Anthropic's confident visual tone
- Always centered within their container

### Arrows & Connectors
- Stroke: 2-3px
- Color: mid gray `#b0aea5` for neutral connections, accent colors for emphasis
- Arrowhead: simple triangle, not decorative
- Curved when possible (organic feel), straight only for rigid sequences

### Comparison Layouts
- Side by side with clear visual separation
- Use opacity (50%) + danger red border for "rejected" option
- Use full opacity + green/sage border for "selected" option
- Symbol between (=, vs, ->, !=) in accent orange at 48pt

### Flow Diagrams
- Left to right or top to bottom
- 3-step max per slide (more = split into multiple slides)
- Each step: icon in colored circle + short label below
- Arrow connectors between steps in mid gray

## Slide-Specific Standards

### Chapter Title Slides
- Background: `#faf9f5` (cream)
- Large icon centered, 96px, in accent color
- Title below in Poppins Bold 48pt, dark `#141413`
- No other elements - chapter titles breathe

### Equation Slides
- Terms: icon + label cards in light gray `#e8e6dc`
- Operators (+, =): Poppins Bold 28pt in dark `#141413`
- Result: highlighted card in accent orange with white text
- Horizontal layout, centered

### Checklist Slides
- Left-aligned rows with colored left border (4px)
- Icon + label per row
- Alternate accent colors: orange, blue, green, orange...
- Title at top in Poppins SemiBold

### Hub-Spoke Slides
- Center: Claude icon (red circle + asterisk)
- Spokes: radiating lines in sage `#a7beae`
- Badges: rounded pills in lavender `#b8b8d1` or light gray
- 4-8 spokes maximum

### Comparison Slides
- Two equal-width containers side by side
- Left: icon + label (one concept)
- Right: icon + label (other concept)
- Center: operator symbol in accent orange
- Clear visual weight balance

## Do's and Don'ts

### Do
- Use cream `#faf9f5` backgrounds everywhere
- Keep text to 1-5 words per element
- Use diagrams over text
- Cycle through accent colors (orange -> blue -> green)
- Add generous padding
- Use Poppins for all headings
- Use Lora for body/label text

### Don't
- Use pure white backgrounds
- Use pure black text
- Put paragraphs on slides
- Use more than 3 colors per slide
- Cram elements together
- Use thin/light font weights
- Use decorative fonts or script fonts
- Mix more than 2 fonts per slide (heading + body)
