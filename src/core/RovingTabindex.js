// Layer 3: a behavior object that components own (composition, not inheritance).
export class RovingTabindex {
  #items;
  #onSelect;

  constructor(items, onSelect) {
    this.#items = items;
    this.#onSelect = onSelect;
  }

  apply(selected) {
    this.#items.forEach((el, i) => {
      el.tabIndex = i === selected ? 0 : -1;
    });
  }

  handleKey(event, current) {
    const last = this.#items.length - 1;
    const next = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return false;
    event.preventDefault();
    this.#onSelect(next, true);
    return true;
  }
}
