import { LuminaElement } from '../core/LuminaElement.js';
import { RovingTabindex } from '../core/RovingTabindex.js';

// Light DOM on purpose: aria-controls and aria-labelledby use ids,
// and ids do not resolve across a shadow boundary.
export class LuminaTabs extends LuminaElement {
  static tag = 'lumina-tabs';
  static #uid = 0;

  #tabs = [];
  #panels = [];
  #rover;

  #onClick = (event) => this.select(this.#tabs.indexOf(event.currentTarget));

  #onKey = (event) => {
    const index = this.#tabs.indexOf(document.activeElement);
    if (index !== -1) this.#rover.handleKey(event, index);
  };

  setup() {
    this.#tabs = [...this.querySelectorAll('[role="tab"]')];
    this.#panels = [...this.querySelectorAll('[role="tabpanel"]')];
    this.#rover = new RovingTabindex(this.#tabs, (i, focus) => this.select(i, focus));

    const n = ++LuminaTabs.#uid;
    this.#tabs.forEach((tab, i) => {
      const panel = this.#panels[i];
      tab.id ||= `lumina-tab-${n}-${i}`;
      panel.id ||= `lumina-panel-${n}-${i}`;
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('aria-labelledby', tab.id);
      tab.addEventListener('click', this.#onClick);
    });
    this.addEventListener('keydown', this.#onKey);
  }

  teardown() {
    this.#tabs.forEach((tab) => tab.removeEventListener('click', this.#onClick));
    this.removeEventListener('keydown', this.#onKey);
  }

  sync() {
    const start = this.#tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    this.select(start === -1 ? 0 : start, false, true);
  }

  select(index, focus = false, silent = false) {
    this.#tabs.forEach((tab, j) => {
      tab.setAttribute('aria-selected', String(j === index));
      this.#panels[j].hidden = j !== index;
    });
    this.#rover.apply(index);
    if (focus) this.#tabs[index].focus();
    if (!silent) this.emit('lumina-tab-change', { index });
  }
}
