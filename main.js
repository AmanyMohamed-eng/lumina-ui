import './token.css';
import './base.css';
import './home.css';
import './button.css';
import './modal.css';
import './tabs.css';
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
// Documentation navigation: keep aria-current in sync with the section in view.
// Every navigation href must point to a real element id for this to activate.
// ---------------------------------------------------------------------------
function initNavigation() {
  const nav = document.querySelector('.sidebar .nav');
  if (!nav) return;

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const pairs = links
    .map((link) => {
      const id = link.getAttribute('href').slice(1);
      return { link, target: id ? document.getElementById(id) : null };
    })
    .filter((pair) => pair.target);

  if (!pairs.length) return;

  const setCurrent = (currentLink) => {
    for (const { link } of pairs) {
      if (link === currentLink) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };

  const updateFromViewport = () => {
    const threshold = Math.max(80, window.innerHeight * 0.22);
    const passed = pairs.filter(
      ({ target }) => target.getBoundingClientRect().top <= threshold,
    );
    const current = passed.at(-1) ?? pairs[0];
    setCurrent(current.link);
  };

  for (const { link } of pairs) {
    link.addEventListener('click', () => setCurrent(link));
  }

  // Scroll listener is intentionally passive and only reads layout.
  let scheduled = false;
  const scheduleUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      updateFromViewport();
    });
  };

  const observer = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(scheduleUpdate, {
        rootMargin: '-10% 0px -65% 0px',
        threshold: 0,
      })
    : null;

  // Observe after the observer exists (older browsers use the scroll fallback).
  if (observer) pairs.forEach(({ target }) => observer.observe(target));
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  window.addEventListener('hashchange', scheduleUpdate);
  updateFromViewport();
}

// ---------------------------------------------------------------------------
// Copy controls: opt in from HTML with data-copy-target="#some-code-element".
// Clipboard errors are surfaced on the button rather than silently ignored.
// ---------------------------------------------------------------------------
function initCopyControls() {
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-copy-target]');
    if (!button) return;

    const selector = button.getAttribute('data-copy-target');
    let target;
    try { target = document.querySelector(selector); } catch { return; }
    if (!target) return;

    const originalLabel = button.dataset.copyLabel || button.textContent.trim() || 'Copy';
    const text = target.textContent ?? '';

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable. Use HTTPS or localhost.');
      }
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copied';
      button.setAttribute('aria-label', 'Copied to clipboard');
    } catch (error) {
      button.textContent = 'Copy failed';
      button.setAttribute('aria-label', 'Copy failed. Select and copy the code manually.');
      console.warn('[Lumina] Could not copy text:', error);
    }

    window.setTimeout(() => {
      button.textContent = originalLabel;
      button.removeAttribute('aria-label');
    }, 1600);
  });
}

// ---------------------------------------------------------------------------
// Demo page wiring (only runs when the page has the demo markup).
// ---------------------------------------------------------------------------
function initDemo() {
  const $ = (selector) => document.querySelector(selector);

  initNavigation();
  initCopyControls();

  const theme = new ThemeManager();
  theme.restore();
  $('#theme-toggle')?.addEventListener('click', () => theme.toggle());

  // One state object drives the actual component, its generated snippet, and reset.
  const preview = $('#pg-preview');
  if (preview) {
    const code = $('#pg-code');
    const variant = $('#pg-variant');
    const size = $('#pg-size');
    const disabled = $('#pg-disabled');
    const loading = $('#pg-loading');
    const defaults = { variant: 'primary', size: 'md', disabled: false, loading: false };
    const state = new PlaygroundState(defaults);

    state.subscribe((s) => {
      preview.setAttribute('variant', s.variant);
      preview.setAttribute('size', s.size);
      preview.toggleAttribute('disabled', s.disabled);
      preview.toggleAttribute('loading', s.loading);
      if (code) code.textContent = ButtonSnippet.build(s); // Never use innerHTML.
    });

    variant?.addEventListener('change', (event) => state.set({ variant: event.target.value }));
    size?.addEventListener('change', (event) => state.set({ size: event.target.value }));
    disabled?.addEventListener('change', (event) => state.set({ disabled: event.target.checked }));
    loading?.addEventListener('change', (event) => state.set({ loading: event.target.checked }));

    $('#pg-reset')?.addEventListener('click', () => {
      if (variant) variant.value = defaults.variant;
      if (size) size.value = defaults.size;
      if (disabled) disabled.checked = defaults.disabled;
      if (loading) loading.checked = defaults.loading;
      state.set(defaults);
    });
  }

  // Modal demo controls are optional in the shared docs bundle.
  const modal = $('#demo-modal');
  if (modal) {
    $('#open-modal')?.addEventListener('click', () => modal.show());
    $('#modal-cancel')?.addEventListener('click', () => modal.close());
    $('#modal-confirm')?.addEventListener('click', () => modal.close());
    modal.addEventListener('lumina-close', () => {
      const out = $('#modal-status');
      if (out) out.textContent = 'Modal closed.';
    });
  }

  // Tabs
  $('#demo-tabs')?.addEventListener('lumina-tab-change', (event) => {
    const out = $('#tabs-status');
    if (out) out.textContent = `Selected tab index: ${event.detail.index}`;
  });
}

defineAll();
if (typeof document !== 'undefined') initDemo();
