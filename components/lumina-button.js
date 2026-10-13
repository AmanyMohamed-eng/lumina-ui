import { LuminaElement } from '../core/LuminaElement.js';

const template = document.createElement('template');
template.innerHTML = `
<style>
  @keyframes lumina-button-spin {
    to {
      --lumina-button-angle: 360deg;
    }
  }

  :host {
    display: inline-block;
  }

  :host([disabled]),
  :host([loading]) {
    pointer-events: none;
  }

  button {
    --_button-fill: var(--color-primary);
    --_button-text: var(--color-on-primary);

    box-sizing: border-box;
    min-block-size: var(--button-min-block-size-md);
    padding-block: var(--button-padding-block-md);
    padding-inline: var(--button-padding-inline-md);

    border: var(--border-width-thin) solid var(--color-border);
    border-radius: var(--radius-md);

    background-color: var(--_button-fill);
    color: var(--_button-text);
    font: inherit;
    font-size: var(--button-font-size-md);
    cursor: pointer;

    transition:
      background-color var(--duration-fast) var(--ease-standard),
      color var(--duration-fast) var(--ease-standard),
      border-color var(--duration-fast) var(--ease-standard);
  }

  /* Default primary button */
  button:hover:not(:disabled) {
    --_button-fill: var(--color-primary-hover);
  }

  /* Secondary */
  :host([variant="secondary"]) button {
    --_button-fill: transparent;
    --_button-text: var(--color-primary);
  }

  :host([variant="secondary"]) button:hover:not(:disabled) {
    --_button-fill: var(--color-surface-muted);
  }

  /* Ghost */
  :host([variant="ghost"]) button {
    --_button-fill: transparent;
    --_button-text: var(--color-primary);
    border-color: transparent;
  }

  :host([variant="ghost"]) button:hover:not(:disabled) {
    --_button-fill: var(--color-surface-muted);
  }

  /* Danger */
  :host([variant="danger"]) button {
    --_button-fill: var(--color-danger);
    --_button-text: var(--color-on-danger);
  }

  /* Small size */
  :host([size="sm"]) button {
    min-block-size: var(--button-min-block-size-sm);
    padding-block: var(--button-padding-block-sm);
    padding-inline: var(--button-padding-inline-sm);
    font-size: var(--button-font-size-sm);
  }

  /* Large size */
  :host([size="lg"]) button {
    min-block-size: var(--button-min-block-size-lg);
    padding-block: var(--button-padding-block-lg);
    padding-inline: var(--button-padding-inline-lg);
    font-size: var(--button-font-size-lg);
  }

  /*
   * The first background paints the button interior.
   * The second paints the rotating gradient around its border.
   */
  button:hover:not(:disabled),
  button:focus-visible:not(:disabled) {
    border-color: transparent;

    background-image:
      linear-gradient(
        var(--_button-fill),
        var(--_button-fill)
      ),
      conic-gradient(
        from var(--lumina-button-angle, 0deg),
        transparent 0deg 250deg,
        var(--color-focus-ring) 290deg,
        var(--color-primary) 325deg,
        transparent 360deg
      );

    background-origin: border-box;
    background-clip: padding-box, border-box;

    animation: lumina-button-spin var(--duration-signal) linear infinite;
  }

  button:focus-visible {
    outline: var(--border-width-focus) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
  }

  button:disabled {
    opacity: var(--disabled-opacity);
    cursor: not-allowed;
    animation: none;
  }

  /* Keep interaction visible without motion. */
  @media (prefers-reduced-motion: reduce) {
    button {
      transition: none;
    }

    button:hover:not(:disabled),
    button:focus-visible:not(:disabled) {
      animation: none;
      background-image: none;
    }

    button:hover:not(:disabled) {
      border-color: var(--color-primary);
    }

    button:focus-visible:not(:disabled) {
      border-color: var(--color-focus-ring);
    }
  }

  /* Preserve system accessibility colors. */
  @media (forced-colors: active) {
    button:hover:not(:disabled) {
      background-image: none;
      border-color: ButtonText;
    }

    button:focus-visible {
      outline-color: Highlight;
    }
  }
</style>

  
  <button part="button"><slot></slot></button>`;

export class LuminaButton extends LuminaElement {
  static tag = 'lumina-button';
  static template = template;
  static delegatesFocus = true;
  static observedAttributes = ['disabled', 'loading'];

  #button;

  setup() {
    this.#button = this.root.querySelector('button');
  }

  sync() {
    const busy = this.hasFlag('loading');
    this.#button.disabled = this.hasFlag('disabled') || busy;
    this.#button.setAttribute('aria-busy', String(busy));
  }
}
