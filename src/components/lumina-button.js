import { LuminaElement } from '../core/LuminaElement.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: inline-block; }
    :host([disabled]), :host([loading]) { pointer-events: none; }
    button {
      font: inherit; border: 0; cursor: pointer;
      background: var(--color-primary, #4f46e5);
      color: var(--color-on-primary, #fff);
      border-radius: var(--radius-md, 8px);
      padding: var(--space-sm, 8px) var(--space-md, 16px);
    }
    button:hover:not(:disabled) { background: var(--color-primary-hover, #4338ca); }
    :host([variant="secondary"]) button {
      background: transparent; color: var(--color-primary, #4f46e5);
      outline: 1px solid currentColor;
    }
    :host([variant="ghost"]) button {
      background: transparent; color: var(--color-primary, #4f46e5);
    }
    :host([variant="danger"]) button {
      background: var(--color-danger, #b42318); color: #fff;
    }
    :host([size="sm"]) button { padding: 4px 10px; font-size: .875rem; }
    :host([size="lg"]) button { padding: 12px 22px; font-size: 1.125rem; }
    button:focus-visible { outline: 3px solid #a5b4fc; outline-offset: 2px; }
    button:disabled { opacity: .6; cursor: not-allowed; }
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
