# Lumina Core — CSS architecture and integration notes

## Target

A framework-independent design system using Vite, vanilla JavaScript Web Components, CSS custom properties, and three themes: `light`, `dark`, and `velvet`.

This package provides a token foundation and component-style updates that match the previously shared component JavaScript. It is not a claim that the complete, unseen repository has already passed build, browser, contrast, or accessibility tests.

## Architecture map

```text
main.js (Vite entry; preserve current behavior)
  ├── token.css                  design-token contract + cascade layer order
  ├── base.css                   document reset, typography, focus defaults
  ├── home.css                   documentation-page layout only
  ├── button.css                 document-level/demo button styles only
  ├── modal.css                  <lumina-modal> host only
  ├── tabs.css                   <lumina-tabs> Light DOM styles
  └── demo/demo.css              demo-specific layout only

components/lumina-button.js
  └── Shadow DOM template owns internal native <button> presentation

components/lumina-modal.js
  └── Shadow DOM template owns <dialog>, backdrop, animation, and inner layout

components/lumina-tabs.js
  └── Light DOM behavior + tabs.css presentation
```

## DOM boundary rules

| Component | DOM boundary | Correct place for styles | Public styling API |
|---|---|---|---|
| `lumina-button` | Shadow DOM | Inline `<style>` in its template | Inherited CSS tokens and `part="button"` |
| `lumina-modal` | Shadow DOM | Inline `<style>` in its template | Inherited CSS tokens and `part="dialog"`, `part="box"`, `part="title"`, `part="actions"` |
| `lumina-tabs` | Light DOM | `tabs.css` | Public role-based markup and inherited tokens |

CSS custom properties set on `:root` inherit through a shadow boundary unless a nearer element overrides them. Normal global selectors do not cross the boundary. `::part()` can style only elements explicitly exposed with a `part` attribute.

## Token contract

`token.css` preserves the current import name used by `main.js`. Although the architecture description sometimes calls the file `tokens.css`, do not rename it unless you also update the `main.js` import.

Theme switching remains compatible with code that writes `document.documentElement.dataset.theme`:

```js
document.documentElement.dataset.theme = 'dark';
```

Supported values are `light`, `dark`, and `velvet`. When no theme is selected, `:root` supplies the light defaults.

Token families include:

- Semantic color: surface, text, primary, danger, border, focus, chrome and backdrop.
- Typography: family, monospace family, sizes, weights and line heights.
- Spacing: `--space-xs` through `--space-xl`.
- Geometry: border widths and radii.
- Motion: durations, easing, press offset, disabled opacity and modal motion.
- Elevation: small, medium and large shadows.
- Component geometry: button size tokens and modal sizing tokens.

Add new tokens to this contract instead of introducing component-specific literal colors, spacing, type sizes, or radii.

## Cascade layers

`token.css` declares the shared order before the other stylesheets are imported:

```css
@layer tokens, base, components, page, extras;
```

- `tokens`: custom-property values for themes.
- `base`: document reset, baseline typography and shared accessibility defaults.
- `components`: reusable component presentation.
- `page`: documentation shell and page-only layout.
- `extras`: narrow, justified overrides only.

Do not add selectors to `extras` just to win a specificity fight. Fix ownership and layer placement instead.

## File-specific notes

### `components/lumina-button.js`

The internal native button remains inside Shadow DOM, so its focus, disabled, hover, variant and size styles stay in the component template. The `sync()` behavior and the public element attributes are unchanged. A loading button is genuinely disabled by the existing JavaScript and is given a progress cursor; this stylesheet does not invent a spinner or claim a remote operation is happening.

### `components/lumina-modal.js`

The native dialog, backdrop, responsive bottom-sheet treatment, focus styling and optional motion are now colocated with the Shadow DOM markup they style. The existing `heading`, `open`, `show()`, `close()`, and `lumina-close` behavior is preserved. `textContent` remains the heading update mechanism.

The `30rem` media-query breakpoint is a layout threshold, not a color/spacing/type/radius token. CSS custom properties cannot be substituted directly into standard media-query conditions, so document any future breakpoint change here rather than faking a token that CSS cannot consume.

### `tabs.css`

Tabs remains Light DOM to preserve ID-based ARIA relationships. Only its presentation is styled here; `lumina-tabs.js` remains the owner of selection, hidden panels, roving tabindex, keyboard handling, and the `lumina-tab-change` event.

### `modal.css`

A global `dialog`, `.box`, or `.actions` selector cannot style elements inside `lumina-modal`'s Shadow DOM. This stylesheet intentionally targets only the custom-element host; the internals live in `lumina-modal.js`.

## Important existing-repository follow-up

The previously shared `base.css` and `home.css` still contain numerous literal font sizes, layout spacing values, and `var(..., fallback)` declarations. This package does not rewrite those large page stylesheets. Therefore it establishes the theme/token/component architecture, but **does not by itself satisfy a repository-wide zero-hardcoded-style audit**. Normalize the remaining page CSS incrementally to the token scale, keeping structural values such as `100%`, `0`, grid fractions, and media-query thresholds where appropriate.

The supplied source did not include `package.json`, the HTML entry point, or the entire repository. Build scripts, Vite asset paths, axe-core results, WCAG contrast in rendered states, and browser tests remain unverified until run in the actual project.

## Install

1. Back up the existing `token.css`, `tabs.css`, `modal.css`, `components/lumina-button.js`, and `components/lumina-modal.js`.
2. Copy these files into the matching paths in the project.
3. Keep `main.js` importing `./token.css` and `./modal.css`; those names are preserved here.
4. Do not replace `base.css`, `home.css`, `button.css`, `demo/demo.css`, `LuminaElement.js`, `RovingTabindex.js`, or `lumina-tabs.js` with files from this package; they are outside this package's change scope.
5. Run the existing Vite build, Vitest suite, and Playwright suite.
6. Test all three themes with keyboard-only interaction and axe-core. Do not mark the themes WCAG AA-compliant until actual foreground/background pairs and focus/non-text states have been measured.
