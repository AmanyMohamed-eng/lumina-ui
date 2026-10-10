import './token.css';
import './demo/demo.css';

import { LuminaElement } from './core/LuminaElement.js';
import { RovingTabindex } from './core/RovingTabindex.js';
import { LuminaButton } from './components/lumina-button.js';
import { LuminaModal } from './components/lumina-modal.js';
import { LuminaTabs } from './components/lumina-tabs.js';

export { LuminaElement, RovingTabindex, LuminaButton, LuminaModal, LuminaTabs };

// ---------------------------------------------------------------------------
// Layer 5: the registry. One place registers every component.
// Importing this file registers nothing by itself; the app calls defineAll().
// ---------------------------------------------------------------------------
export function defineAll() {
  [LuminaButton, LuminaModal, LuminaTabs].forEach((Component) => Component.define());
}

// ---------------------------------------------------------------------------
// Layer 6: app objects for the docs site (plain classes, not HTMLElements).
// ---------------------------------------------------------------------------
export class ThemeManager {
  static KEY = 'lumina:theme';
  #root;

  constructor(root = document.documentElement) {
    this.#root = root;
  }

  get current() {
    return this.#root.dataset.theme ?? 'light';
  }

  set(theme) {
    this.#root.dataset.theme = theme;
    try { localStorage.setItem(ThemeManager.KEY, theme); } catch { /* storage may be blocked */ }
    this.#root.dispatchEvent(new CustomEvent('lumina-theme', { detail: { theme } }));
  }

  toggle() {
    this.set(this.current === 'dark' ? 'light' : 'dark');
  }

  restore() {
    let saved = null;
    try { saved = localStorage.getItem(ThemeManager.KEY); } catch { /* ignore */ }
    const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
    this.set(saved ?? (prefersDark ? 'dark' : 'light'));
  }
}

// Observer pattern: controls change one state object, subscribers render.
export class PlaygroundState {
  #state;
  #listeners = new Set();

  constructor(initial) {
    this.#state = { ...initial };
  }

  get value() {
    return { ...this.#state };
  }

  set(patch) {
    this.#state = { ...this.#state, ...patch };
    this.#listeners.forEach((fn) => fn(this.value));
  }

  subscribe(fn) {
    this.#listeners.add(fn);
    fn(this.value);
    return () => this.#listeners.delete(fn);
  }
}

export class ButtonSnippet {
  static build({ variant, size, disabled, loading }) {
    const flags = `${disabled ? ' disabled' : ''}${loading ? ' loading' : ''}`;
    return `<lumina-button variant="${variant}" size="${size}"${flags}>Button</lumina-button>`;
  }
}

// ---------------------------------------------------------------------------
// Demo page wiring (only runs when the page has the demo markup).
// ---------------------------------------------------------------------------
function initDemo() {
  const $ = (selector) => document.querySelector(selector);

  const theme = new ThemeManager();
  theme.restore();
  $('#theme-toggle')?.addEventListener('click', () => theme.toggle());

  // Playground: one state object drives both the preview and the snippet.
  const preview = $('#pg-preview');
  if (preview) {
    const code = $('#pg-code');
    const state = new PlaygroundState({
      variant: 'primary', size: 'md', disabled: false, loading: false,
    });

    state.subscribe((s) => {
      preview.setAttribute('variant', s.variant);
      preview.setAttribute('size', s.size);
      preview.toggleAttribute('disabled', s.disabled);
      preview.toggleAttribute('loading', s.loading);
      code.textContent = ButtonSnippet.build(s); // textContent, never innerHTML
    });

    $('#pg-variant').addEventListener('change', (e) => state.set({ variant: e.target.value }));
    $('#pg-size').addEventListener('change', (e) => state.set({ size: e.target.value }));
    $('#pg-disabled').addEventListener('change', (e) => state.set({ disabled: e.target.checked }));
    $('#pg-loading').addEventListener('change', (e) => state.set({ loading: e.target.checked }));
  }

  // Modal
  const modal = $('#demo-modal');
  if (modal) {
    $('#open-modal').addEventListener('click', () => modal.show());
    $('#modal-cancel').addEventListener('click', () => modal.close());
    $('#modal-confirm').addEventListener('click', () => modal.close());
    modal.addEventListener('lumina-close', () => {
      const out = $('#modal-status');
      if (out) out.textContent = 'Modal closed.';
    });
  }

  // Tabs
  $('#demo-tabs')?.addEventListener('lumina-tab-change', (e) => {
    const out = $('#tabs-status');
    if (out) out.textContent = `Selected tab index: ${e.detail.index}`;
  });
}

defineAll();
if (typeof document !== 'undefined') initDemo();
