import { LuminaElement } from '../core/LuminaElement.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    dialog {
      padding: 0; border: 1px solid var(--color-border, #d9deec);
      border-radius: var(--radius-lg, 14px);
      background: var(--color-surface, #fff);
      color: var(--color-text, #0f172a);
      box-shadow: var(--shadow-md, none);
      font-family: var(--font-family, system-ui, sans-serif);
      max-width: min(440px, calc(100vw - 32px));
    }
    dialog::backdrop { background: rgba(5, 8, 20, .6); }
    .box { padding: var(--space-lg, 24px); }
    h2 { margin: 0 0 12px; font-size: 1.125rem; }
    .actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }
  </style>
  <dialog aria-labelledby="title">
    <div class="box">
      <h2 id="title"></h2>
      <slot></slot>
      <div class="actions"><slot name="actions"></slot></div>
    </div>
  </dialog>`;

export class LuminaModal extends LuminaElement {
  static tag = 'lumina-modal';
  static template = template;
  static observedAttributes = ['heading', 'open'];

  #dialog;
  #title;

  #onClose = () => {
    this.removeAttribute('open');
    this.emit('lumina-close');
  };

  // The box carries the padding, so a click that lands on the dialog itself is the backdrop.
  #onBackdrop = (event) => {
    if (event.target === this.#dialog) this.#dialog.close();
  };

  setup() {
    this.#dialog = this.root.querySelector('dialog');
    this.#title = this.root.querySelector('#title');
    this.#dialog.addEventListener('close', this.#onClose);
    this.#dialog.addEventListener('click', this.#onBackdrop);
  }

  teardown() {
    this.#dialog.removeEventListener('close', this.#onClose);
    this.#dialog.removeEventListener('click', this.#onBackdrop);
  }

  sync() {
    this.#title.textContent = this.getAttribute('heading') ?? '';
    const wantOpen = this.hasFlag('open');
    if (wantOpen && !this.#dialog.open) this.#dialog.showModal();
    if (!wantOpen && this.#dialog.open) this.#dialog.close();
  }

  show() {
    this.setFlag('open', true);
  }

  close() {
    this.setFlag('open', false);
  }
}
