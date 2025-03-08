/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class CWNItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cwn", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/my-fvtt-cwn/templates/item";
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    // Add config data
    context.config = CONFIG.CWN;
    
    // Add type for template
    context.type = this.item.type;

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add tag
    html.find('.tag-add').click(ev => {
      ev.preventDefault();
      const item = this.item;
      const tags = item.system.tags || [];
      tags.push("");
      item.update({ "system.tags": tags });
    });

    // Delete tag
    html.find('.tag-delete').click(ev => {
      ev.preventDefault();
      const item = this.item;
      const tags = item.system.tags || [];
      const index = Number(ev.currentTarget.dataset.index);
      tags.splice(index, 1);
      item.update({ "system.tags": tags });
    });
  }
} 