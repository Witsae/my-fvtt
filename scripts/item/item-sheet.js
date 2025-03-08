/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class CWNItemSheet extends ItemSheet {

  constructor(item, options = {}) {
    super(item, options);
    console.log("CWN | ItemSheet constructor called for:", item?.name, options);
  }

  /** @override */
  static get defaultOptions() {
    console.log("CWN | ItemSheet defaultOptions called");
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cwn", "sheet", "item"],
      width: 520,
      height: 480,
      resizable: true,
      scrollY: [".sheet-body"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    console.log("CWN | ItemSheet template getter called for:", this.item?.name, this.item?.type);
    const path = "systems/cwn-system/templates/item";
    const template = `${path}/item-${this.item.type}-sheet.hbs`;
    console.log("CWN | Using template:", template);
    return template;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    console.log("CWN | ItemSheet getData called for:", this.item?.name);
    
    try {
      // Retrieve base data structure.
      const context = await super.getData();
      console.log("CWN | Base context from super.getData():", context);

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

      console.log("CWN | Final context for item sheet:", context);
      return context;
    } catch (error) {
      console.error("CWN | Error in ItemSheet getData:", error);
      throw error;
    }
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    console.log("CWN | ItemSheet activateListeners called for:", this.item?.name);
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add tag
    html.find('.tag-add').click(ev => {
      ev.preventDefault();
      const item = this.item;
      const tags = foundry.utils.deepClone(item.system.tags || []);
      tags.push("");
      item.update({ "system.tags": tags });
    });

    // Delete tag
    html.find('.tag-delete').click(ev => {
      ev.preventDefault();
      const item = this.item;
      const tags = foundry.utils.deepClone(item.system.tags || []);
      const index = Number(ev.currentTarget.dataset.index);
      tags.splice(index, 1);
      item.update({ "system.tags": tags });
    });
  }

  /** @override */
  _getHeaderButtons() {
    console.log("CWN | ItemSheet _getHeaderButtons called for:", this.item?.name);
    const buttons = super._getHeaderButtons();
    console.log("CWN | Header buttons:", buttons);
    return buttons;
  }

  /** @override */
  render(force = false, options = {}) {
    console.log("CWN | ItemSheet render called for:", this.item?.name, "force:", force, "options:", options);
    try {
      const result = super.render(force, options);
      console.log("CWN | Render result:", result);
      return result;
    } catch (error) {
      console.error("CWN | Error in ItemSheet render:", error);
      throw error;
    }
  }
} 