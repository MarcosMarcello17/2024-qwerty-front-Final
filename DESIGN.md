---
name: CashFlowPro
description: Personal finance tracker that makes spending visible and actionable.
colors:
  ledger-gold: "#ffc300"
  signal-yellow: "#ffd60a"
  midnight-ink: "#000814"
  deep-navy: "#001d3d"
  steel-blue: "#003566"
  soft-ice: "#e6f1ff"
  muted-sky: "#b5e0ff"
  alert-red: "#e5484d"
  chart-cyan: "#4cc9f0"
  chart-orange: "#f77f00"
  chart-mint: "#06d6a0"
  vault-shadow: "#001429"
typography:
  display:
    fontFamily: "'Inter Variable', Inter, Arial, Helvetica, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "'Inter Variable', Inter, Arial, Helvetica, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "'Inter Variable', Inter, Arial, Helvetica, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Inter Variable', Inter, Arial, Helvetica, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "calc(0.625rem - 4px)"
  md: "calc(0.625rem - 2px)"
  lg: "0.625rem"
  xl: "0.75rem"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ledger-gold}"
    textColor: "{colors.midnight-ink}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
  button-primary-hover:
    backgroundColor: "color-mix(in oklch, {colors.ledger-gold}, transparent 20%)"
  button-secondary:
    backgroundColor: "{colors.steel-blue}"
    textColor: "{colors.soft-ice}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.soft-ice}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
  button-ghost-hover:
    backgroundColor: "{colors.steel-blue}"
    textColor: "{colors.soft-ice}"
  button-destructive:
    backgroundColor: "color-mix(in oklch, {colors.alert-red}, transparent 90%)"
    textColor: "{colors.alert-red}"
    rounded: "{rounded.lg}"
  card-default:
    backgroundColor: "{colors.deep-navy}"
    textColor: "{colors.soft-ice}"
    rounded: "{rounded.xl}"
    padding: "16px"
  input-default:
    backgroundColor: "transparent"
    textColor: "{colors.soft-ice}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
---

# Design System: CashFlowPro

## 1. Overview

**Creative North Star: "The Ledger Room"**

A private, well-lit workspace where everything has its place. The interface is a surface for work, not a stage for performance. Deep dark backgrounds absorb visual noise so numbers, labels, and charts can do their job without competition. Gold highlights act like ruled lines in a physical ledger: they mark structure and draw the eye to what matters, never decorating for decoration's sake.

The system rejects generic AI-generated dashboards, hero-metric templates with gradient accents, and over-designed fintech aesthetics that prioritize looking impressive over being usable. It also rejects gamified-first interfaces where achievements overshadow the core utility, and cookie-cutter SaaS dashboards with teal/purple gradients and rounded-everything.

**Key Characteristics:**
- Tonal layering over shadows: depth is communicated through background color steps, not drop shadows
- Compact density: controls are sized for efficiency, not for touch-target generosity on desktop
- Single accent discipline: Ledger Gold is the only saturated color in the UI chrome; chart colors are confined to data visualization
- Spanish-language interface with utilitarian copy

## 2. Colors

A restrained palette anchored by a single warm accent against cold, deep surfaces. The gold is rare and purposeful.

### Primary
- **Ledger Gold** (#ffc300): Primary actions, active states, the brand wordmark, ring/focus indicators. The only saturated color permitted in UI chrome.
- **Signal Yellow** (#ffd60a): Accent variant used in chart highlights, sidebar active states, and secondary emphasis where Ledger Gold would compete with a nearby primary action.

### Neutral
- **Midnight Ink** (#000814): Page background. The darkest surface in the system.
- **Deep Navy** (#001d3d): Card backgrounds, popover surfaces, elevated containers. One step lighter than Midnight Ink.
- **Steel Blue** (#003566): Borders, input strokes, muted backgrounds, secondary button fills. The workhorse neutral.
- **Vault Shadow** (#001429): Sidebar background. Between Midnight Ink and Deep Navy, creating a subtle channel separation.
- **Soft Ice** (#e6f1ff): Primary text color. Cool-tinted off-white that reads clearly against all dark surfaces without the harshness of pure white.
- **Muted Sky** (#b5e0ff): Secondary text, placeholder text, muted labels. Lower contrast for de-emphasized content.

### Data Visualization (chart use only)
- **Chart Cyan** (#4cc9f0), **Chart Orange** (#f77f00), **Chart Mint** (#06d6a0): Reserved exclusively for Recharts data series. Never used in UI chrome, buttons, or status indicators.

### Named Rules
**The Single Voice Rule.** Ledger Gold is the only accent color in UI chrome. Its rarity is the point. When everything is gold, nothing is. Chart colors exist in their own namespace and never leak into navigation, buttons, or status badges.

## 3. Typography

**Display Font:** Inter Variable (with Arial, Helvetica, sans-serif fallback)
**Body Font:** Inter Variable (with Arial, Helvetica, sans-serif fallback)

**Character:** One family throughout. Hierarchy is built entirely through weight and size contrast, not font switching. Inter's large x-height and open apertures keep small labels legible at the compact sizes this system uses.

### Hierarchy
- **Display** (700, 2rem, 1.2 line-height): Page titles only. One per screen maximum.
- **Headline** (600, 1.25rem, 1.3 line-height): Section headers, card titles, modal titles.
- **Body** (400, 0.875rem / 14px, 1.5 line-height): All running text, table cells, form descriptions. Cap line length at 65ch where applicable.
- **Label** (500, 0.8rem, 1.4 line-height, 0.01em tracking): Form labels, badge text, nav items, metadata. Slightly tighter than body.

### Named Rules
**The Weight Ladder Rule.** Adjacent hierarchy levels must differ by at least one weight step (100 units) AND one size step (minimum 1.25x ratio). If two text elements look the same at a glance, one of them is at the wrong level.

## 4. Elevation

This system is flat by design. Depth is conveyed through tonal layering: Midnight Ink (lowest) to Deep Navy (cards/containers) to Steel Blue (interactive borders). No box-shadow tokens exist in the design system.

The single exception is the header's `shadow-sm`, which provides a subtle separation between the fixed navigation bar and scrolling content. This is structural, not decorative.

### Named Rules
**The Flat-by-Default Rule.** Surfaces are flat at rest. The background color step IS the elevation. If you need to distinguish a surface, change its background one step lighter in the tonal stack, do not add a shadow.

## 5. Components

### Buttons
Compact and direct. Sized for frequent, repeated use.

- **Shape:** Gently rounded (0.625rem / 10px radius)
- **Primary:** Ledger Gold background, Midnight Ink text, 32px height, 10px horizontal padding. The only button that uses the accent color.
- **Hover:** Primary fades to 80% opacity. No color shift, no scale transform.
- **Focus:** 3px ring in Ledger Gold at 50% opacity, border shifts to ring color.
- **Secondary:** Steel Blue background, Soft Ice text. Same dimensions as primary.
- **Ghost:** Transparent at rest, Steel Blue background on hover. Used for toolbar actions and icon-only buttons.
- **Destructive:** Alert Red at 10% opacity background, Alert Red text. Tinted surface, not a solid red button. Avoids accidental prominence.
- **Sizes:** xs (24px), sm (28px), default (32px), lg (36px). Icon-only variants match height to width.

### Cards / Containers
- **Corner Style:** Slightly rounder than buttons (0.75rem / 12px radius)
- **Background:** Deep Navy (#001d3d) with a subtle 10% foreground ring border
- **Shadow Strategy:** None. Tonal step from Midnight Ink to Deep Navy provides separation.
- **Internal Padding:** 16px (--card-spacing), reduced to 12px on small variant
- **Footer:** Muted background at 50% opacity with top border, creating a distinct action zone

### Inputs / Fields
- **Style:** Transparent background, Steel Blue border stroke, 0.625rem radius, 32px height
- **Focus:** Border shifts to Ledger Gold, 3px ring in Ledger Gold at 50% opacity
- **Error:** Border and ring shift to Alert Red
- **Disabled:** Input background at 50% opacity, 50% overall opacity, no pointer events
- **Placeholder:** Muted Sky color

### Navigation
- **Sidebar:** 16rem wide (desktop), 18rem on mobile via sheet overlay. Vault Shadow background creates a subtle channel distinct from the page.
- **Active item:** Steel Blue background with Signal Yellow text
- **Header:** Sticky, full-width, Deep Navy-ish (sidebar color), 64px height, bottom border in Steel Blue, minimal shadow-sm for scroll separation
- **Brand wordmark:** "CashFlowPro" in Ledger Gold, 1.5rem, bold, headline font

### Tables
- **Style:** Full-width, no outer border, rows separated by Steel Blue bottom borders
- **Header:** Uppercase labels, 0.05rem letter spacing
- **Density:** 1rem cell padding on desktop, 0.75rem on mobile with reduced font size

## 6. Do's and Don'ts

### Do:
- **Do** use Ledger Gold exclusively for primary actions and active states. Its scarcity creates hierarchy.
- **Do** convey elevation through the tonal stack (Midnight Ink, Deep Navy, Steel Blue) rather than shadows.
- **Do** keep button heights compact (32px default). This is a daily-use tool, not a first-time onboarding flow.
- **Do** confine chart colors (Cyan, Orange, Mint) strictly to data visualization. They do not exist in the component palette.
- **Do** use Inter's weight axis (400, 500, 600, 700) to build hierarchy. The font is the same everywhere; weight and size do the work.
- **Do** respect the existing Spanish-language copy conventions. Labels are utilitarian, not clever.

### Don't:
- **Don't** use gradient text, glassmorphism, or side-stripe borders. These are explicitly banned.
- **Don't** build hero-metric templates (big number, small label, gradient accent). This is the first pattern people identify as "AI made that."
- **Don't** create identical card grids with icon + heading + text repeated in uniform blocks.
- **Don't** use modals as a first thought. Inline editing, popovers, and progressive disclosure come first.
- **Don't** use `#000000` or `#ffffff`. Every dark uses Midnight Ink or darker navy tints; every light uses Soft Ice or Muted Sky.
- **Don't** add teal/purple gradients, neon accents, or rounded-everything aesthetics. These are the cookie-cutter SaaS patterns this system explicitly rejects.
- **Don't** let achievements or gamification elements compete visually with core financial data. Utility first.
- **Don't** use bounce or elastic easing. Ease-out with exponential curves only.
