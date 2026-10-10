// Layer 2: the base class every Lumina component extends.
// Template method: the base class fixes the lifecycle order,
// subclasses fill in setup(), sync() and teardown().
export class LuminaElement extends HTMLElement {
  static tag = ''; // subclasses set their tag name
  static template = null; // an HTMLTemplateElement; null means light DOM
  static delegatesFocus = false;

  #connected = false;

  constructor() {
    super();
    const Type = this.constructor;
    if (Type.template) {
      this.attachShadow({ mode: 'open', delegatesFocus: Type.delegatesFocus })
        .append(Type.template.content.cloneNode(true));
    }
  }

  get root() {
    return this.shadowRoot ?? this;
  }

  connectedCallback() {
    if (this.#connected) return;
    this.#connected = true;
    this.setup();
    this.sync();
  }

  disconnectedCallback() {
    this.#connected = false;
    this.teardown();
  }

  attributeChangedCallback() {
    if (this.#connected) this.sync();
  }

  setup() {} // find elements, add listeners
  sync() {} // make the DOM match the current attributes
  teardown() {} // remove listeners

  hasFlag(name) {
    return this.hasAttribute(name);
  }

  setFlag(name, on) {
    this.toggleAttribute(name, Boolean(on));
  }

  emit(name, detail) {
    return this.dispatchEvent(
      new CustomEvent(name, { detail, bubbles: true, composed: true }),
    );
  }

  static define(tag = this.tag) {
    if (!customElements.get(tag)) customElements.define(tag, this);
  }
}
