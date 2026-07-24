---
name: Calyx Home
colors:
  surface: '#fff8f6'
  surface-dim: '#e9d6d2'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0ee'
  surface-container: '#fdeae6'
  surface-container-high: '#f8e4e0'
  surface-container-highest: '#f2deda'
  on-surface: '#231917'
  on-surface-variant: '#56423e'
  inverse-surface: '#392e2b'
  inverse-on-surface: '#ffede9'
  outline: '#89726d'
  outline-variant: '#ddc0ba'
  surface-tint: '#9f402d'
  primary: '#9f402d'
  on-primary: '#ffffff'
  primary-container: '#e2725b'
  on-primary-container: '#5a0d02'
  inverse-primary: '#ffb4a5'
  secondary: '#725a39'
  on-secondary: '#ffffff'
  secondary-container: '#fbdbb0'
  on-secondary-container: '#765f3d'
  tertiary: '#006b5b'
  on-tertiary: '#ffffff'
  tertiary-container: '#00a58e'
  on-tertiary-container: '#00322a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad3'
  primary-fixed-dim: '#ffb4a5'
  on-primary-fixed: '#3e0500'
  on-primary-fixed-variant: '#802918'
  secondary-fixed: '#feddb3'
  secondary-fixed-dim: '#e1c299'
  on-secondary-fixed: '#281801'
  on-secondary-fixed-variant: '#584324'
  tertiary-fixed: '#7bf8dd'
  tertiary-fixed-dim: '#5cdbc2'
  on-tertiary-fixed: '#00201a'
  on-tertiary-fixed-variant: '#005144'
  background: '#fff8f6'
  on-background: '#231917'
  surface-variant: '#f2deda'
typography:
  display-temp:
    fontFamily: Plus Jakarta Sans
    fontSize: 64px
    fontWeight: '600'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is centered on "Tactile Warmth" and "Domestic Serenity." It bridges the gap between cold, technical 3D visualization and the comforting emotional experience of a lived-in home. The target audience is homeowners seeking a sophisticated yet approachable way to manage their environment.

The visual style is a hybrid of **Soft Minimalism** and **Natural Glassmorphism**. It utilizes a "Creamy" foundation—avoiding the clinical harshness of pure white in favor of organic, warm tones. The UI should feel like a physical object in a sunlit room: soft-edged, slightly translucent, and subtly reactive to light. Depth is achieved through layering rather than complex ornamentation, ensuring the 3D model of the home remains the focal point while the interface feels like a graceful overlay.

## Colors

This design system uses a palette inspired by natural architectural materials. 
- **Primary (Terracotta Orange):** Used for active states, primary actions, and heating indicators.
- **Secondary (Linen):** Used for secondary controls and subtle structural elements.
- **Backgrounds:** A base of `Cream` provides a soft, non-fatiguing canvas, while `Light Wood` textures may be used for specific 3D environmental accents.

**Temperature Mapping:**
The system uses a soft-gradient approach for temperature visualization:
- **<18°C (Frost):** Soft Pale Blue (#A5CAD2)
- **18-22°C (Misty):** Pale Cyan/Mint (#B4D6C1)
- **22-26°C (Breeze):** Muted Sage Green (#C8D5A1)
- **26-30°C (Amber):** Warm Muted Orange (#E8B88C)
- **>30°C (Cinder):** Soft Coral Red (#E88C8C)

## Typography

The design system utilizes **Plus Jakarta Sans** for its friendly, rounded geometry and excellent legibility in digital interfaces. 

- **Numerical Displays:** Large temperature readings should use the `display-temp` style with tight tracking to feel like a cohesive unit.
- **Hierarchy:** Use font weight rather than size to distinguish between primary and secondary information to maintain a clean, minimalist look.
- **Labels:** Use `label-caps` for technical data or section headers to provide a structured, organized feel against the soft UI elements.

## Layout & Spacing

The layout follows a **Fluid Floating** philosophy. Elements are not locked into rigid grids but rather "float" over the 3D visualization using safe margins.

- **Desktop:** Controls are grouped in high-level floating panels on the left and right periphery, keeping the center 3D view clear.
- **Mobile:** Uses a bottom-sheet paradigm for controls, allowing the 3D room view to occupy the top 60% of the screen.
- **Rhythm:** An 8px base grid ensures consistent alignment. Generous padding (`container-padding`) is essential to prevent the UI from feeling cluttered or "tech-heavy."

## Elevation & Depth

Depth is established through **Natural Light Simulation**. 

- **Surface Treatment:** Panels use a `Frosted Glass` effect with a 20px-30px backdrop blur and 60% opacity of the `Linen` or `Cream` color. This allows the 3D environment colors to bleed through subtly.
- **Shadows:** Avoid black shadows. Use "Ambient Glow" shadows—low-opacity (10-15%) offsets using a slightly darker version of the underlying color (e.g., a warm taupe shadow rather than grey).
- **Light Source:** UI shadows and highlights should imply a top-down, slightly angled light source to mimic natural interior lighting.

## Shapes

The shape language is strictly **Rounded and Borderless**. 

- **Main Panels:** Use `rounded-xl` (1.5rem / 24px) to create a soft, tablet-like appearance.
- **Interactive Elements:** Buttons and toggles use `rounded-lg` (1rem / 16px).
- **Inputs:** Sliders and value pickers should have fully rounded ends (pill-shaped) to invite touch and interaction.
- **Zero Borders:** No hard strokes are used to define boundaries. Contrast is created through changes in backdrop blur intensity and subtle shadow shifts.

## Components

- **Thermostat Dial:** A large, semi-transparent circular slider. The track color changes dynamically based on the target temperature using the defined status colors. The handle is a tactile, "squishy" white disc with a soft drop shadow.
- **Floating Cards:** Used for room statistics (humidity, air quality). These should have high backdrop blur and no visible borders.
- **Buttons:** Primary buttons use a solid `Terracotta Orange` with white text. Secondary buttons use a glass effect with a subtle `Linen` tint.
- **Glass Chips:** Small, rounded indicators for status (e.g., "Heating," "Eco Mode"). These should use the temperature mapping colors at 20% opacity with a saturated label.
- **Segmented Control:** For mode switching (Heat/Cool/Auto), use a "sliding pill" animation within a recessed glass container.
- **3D Interactive Pins:** Pins placed within the 3D view to identify sensors should be soft spheres that pulse gently with the color of the current room temperature.