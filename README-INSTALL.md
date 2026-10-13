# Lumina Core UX upgrade — install in one pass

This package patches the two uploaded files that control the current page-level layout and browser behavior. It keeps your existing Web Components, tokens, and component CSS.

## Files in this package

- `home.css` — replacement for your current `home.css`; retains the existing stylesheet and adds calmer visual hierarchy plus an explicit active-section treatment.
- `main.js` — replacement for your current `main.js`; retains your existing component registration and demo wiring, and adds scroll-aware navigation, safer optional playground controls, reset support, and opt-in copy buttons.
- `html-additions.html` — small examples for connecting the copy and reset actions to your existing HTML.

## Install

1. Make a backup of your current `home.css` and `main.js`.
2. Extract this ZIP.
3. Copy the replacement `home.css` and `main.js` into the same source directory as your current files, overwriting those two files only. Keep all your other files and folders, including `core/`, `components/`, and `demo/`.
4. Confirm that every sidebar link such as `href="#tokens"` points to a real element with the matching `id="tokens"`. Missing targets are skipped safely.
5. To enable clipboard buttons, add `data-copy-target="#the-code-id"` to each existing Copy button and give its code element that ID. See `html-additions.html`.
6. To expose Reset in the playground, add a button with `id="pg-reset"` inside the playground. The reset behavior is optional; the page works if the button is absent.
7. Run your usual development command and test the page at desktop and mobile widths.

## What changes immediately

- The selected navigation item follows the section currently being read and sets `aria-current="location"`.
- Navigation focus is easier to see with a keyboard.
- Gradients and hover shadows are more restrained; your purple identity remains.
- Playground controls no longer crash if an optional control is absent, and the preview and generated code continue to use the same state object.
- Optional Reset restores the playground defaults.
- Any button marked with `data-copy-target` attempts to copy the corresponding code text and briefly reports success or failure.

## Important limitations

The HTML entry page was not included in the uploaded files, so this package does not replace or invent your `index.html`. The navigation enhancement requires real matching section IDs. Existing Copy buttons need the `data-copy-target` attribute to specify which code block they copy. The `main.js` imports the existing `core/`, `components/`, and `demo/` files; do not delete or move those folders.

## Quick verification checklist

- Click Design Tokens, Themes, and Components; each should scroll to a matching section.
- Scroll manually; the active sidebar item should follow the current section.
- Change the playground variant, size, disabled, and loading settings; both preview and code should change.
- Click Reset if you added the optional `#pg-reset` button.
- Click Copy on a code block whose button has `data-copy-target`; test on HTTPS or localhost because browsers restrict clipboard access on insecure origins.
- Open and close the Modal, and switch Tabs, to confirm the existing demo still works.
