/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CWNActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cwn", "sheet", "actor"],
      template: "systems/cwn-system/templates/actor/actor-sheet.hbs",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }],
      dragDrop: [
        {dragSelector: ".item-list .item", dropSelector: null},
        {dragSelector: ".actor-list .actor", dropSelector: null}
      ],
      scrollY: [".sheet-body", ".tab.skills", ".tab.items", ".tab.effects"]
    });
  }

  /** @override */
  get template() {
    return `systems/cwn-system/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet.
    const context = await super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Prepare faction data.
    if (actorData.type == 'faction') {
      this._prepareFactionData(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Add config data
    context.config = CONFIG.CWN;

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    for (let [k, v] of Object.entries(context.system.attributes)) {
      v.label = game.i18n.localize(CONFIG.CWN.attributes[k]) ?? k;
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const skills = [];
    const foci = [];
    const weapons = [];
    const armor = [];
    const gear = [];
    const cyberware = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to skills.
      if (i.type === 'skill') {
        skills.push(i);
      }
      // Append to foci.
      else if (i.type === 'focus') {
        foci.push(i);
      }
      // Append to weapons.
      else if (i.type === 'weapon') {
        weapons.push(i);
      }
      // Append to armor.
      else if (i.type === 'armor') {
        armor.push(i);
      }
      // Append to gear.
      else if (i.type === 'gear') {
        gear.push(i);
      }
      // Append to cyberware.
      else if (i.type === 'cyberware') {
        cyberware.push(i);
      }
    }

    // Sort items by name
    skills.sort((a, b) => a.name.localeCompare(b.name));
    foci.sort((a, b) => a.name.localeCompare(b.name));
    weapons.sort((a, b) => a.name.localeCompare(b.name));
    armor.sort((a, b) => a.name.localeCompare(b.name));
    gear.sort((a, b) => a.name.localeCompare(b.name));
    cyberware.sort((a, b) => a.name.localeCompare(b.name));

    // Assign and return
    context.skills = skills;
    context.foci = foci;
    context.weapons = weapons;
    context.armor = armor;
    context.gear = gear;
    context.cyberware = cyberware;
  }

  /**
   * Prepare faction data.
   *
   * @param {Object} context The actor data to prepare.
   *
   * @return {undefined}
   */
  _prepareFactionData(context) {
    // Initialize containers.
    const assets = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to assets.
      if (i.type === 'asset') {
        assets.push(i);
      }
    }

    // Sort assets by name
    assets.sort((a, b) => a.name.localeCompare(b.name));

    // Assign and return
    context.assets = assets;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      ev.preventDefault();
      const li = $(ev.currentTarget).closest(".item");
      const itemId = li.attr("data-item-id");
      const item = this.actor.items.get(itemId);
      if (item) {
        this._openItemSheet(item);
      }
    });

    // Item name click to open sheet
    html.find('.item-name').click(ev => {
      ev.preventDefault();
      if ($(ev.target).hasClass('rollable')) return;
      
      const li = $(ev.currentTarget).closest(".item");
      const itemId = li.attr("data-item-id");
      const item = this.actor.items.get(itemId);
      
      if (item) {
        this._openItemSheet(item);
      } else {
        console.error("Item not found with ID:", itemId);
      }
    });

    // Direct item click handler
    html.find('li.item').click(ev => {
      // Skip if clicking on controls
      if ($(ev.target).closest('.item-controls').length) return;
      if ($(ev.target).hasClass('rollable')) return;
      if ($(ev.target).hasClass('item-name')) return; // Already handled above
      
      // Get the item
      const li = $(ev.currentTarget);
      const itemId = li.attr("data-item-id");
      const item = this.actor.items.get(itemId);
      
      if (item) {
        this._openItemSheet(item);
      } else {
        console.error("Item not found with ID:", itemId);
      }
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).closest(".item");
      const itemId = li.attr("data-item-id");
      const item = this.actor.items.get(itemId);
      if (item) {
        this._deleteItemDialog(item);
      }
    });

    // Active Effect management
    html.find(".effect-control").click(ev => {
      const button = ev.currentTarget;
      const effectId = button.closest(".effect").dataset.effectId;
      const effect = this.actor.effects.get(effectId);
      
      switch (button.dataset.action) {
        case "toggle":
          effect.update({disabled: !effect.disabled});
          break;
        case "edit":
          effect.sheet.render(true);
          break;
        case "delete":
          effect.delete();
          break;
      }
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Display a dialog to confirm item deletion
   * @param {Item} item The item to delete
   * @private
   */
  _deleteItemDialog(item) {
    const content = `<p>Are you sure you want to delete ${item.name}?</p>`;
    
    new Dialog({
      title: `Delete ${item.name}`,
      content: content,
      buttons: {
        delete: {
          icon: '<i class="fas fa-trash"></i>',
          label: "Delete",
          callback: () => item.delete()
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel"
        }
      },
      default: "cancel"
    }).render(true);
  }

  /**
   * Helper method to open an item sheet
   * @param {Item} item The item to open
   * @private
   */
  _openItemSheet(item) {
    try {
      console.log("CWN | Attempting to open item sheet for:", item);
      console.log("CWN | Item sheet instance:", item.sheet);
      console.log("CWN | Item type:", item.type);
      console.log("CWN | Item data:", item);
      
      if (!item.sheet) {
        console.warn("CWN | Item sheet not found, creating new sheet instance");
        const ItemSheetClass = CONFIG.Item.sheetClasses.cwn?.CWNItemSheet || CONFIG.Item.sheetClass;
        console.log("CWN | Using sheet class:", ItemSheetClass);
        item.sheet = new ItemSheetClass(item);
      }
      
      console.log("CWN | Rendering item sheet:", item.sheet);
      const result = item.sheet.render(true);
      console.log("CWN | Render result:", result);
    } catch (error) {
      console.error("CWN | Error opening item sheet:", error);
      ui.notifications.error(`Error opening item sheet: ${error.message}`);
    }
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = $(element).closest('.item').attr("data-item-id");
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
      else if (dataset.rollType == 'attack') {
        const itemId = $(element).closest('.item').attr("data-item-id");
        const item = this.actor.items.get(itemId);
        if (item) return item.rollAttack();
      }
      else if (dataset.rollType == 'damage') {
        const itemId = $(element).closest('.item').attr("data-item-id");
        const item = this.actor.items.get(itemId);
        if (item) return item.rollDamage();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }

    // Handle attribute rolls
    if (dataset.rollAttribute) {
      const attribute = dataset.rollAttribute;
      const attributeObj = this.actor.system.attributes[attribute];
      if (!attributeObj) return;

      const label = game.i18n.format("CWN.AttributeCheck", {attribute: game.i18n.localize(CONFIG.CWN.attributes[attribute])});
      const formula = `2d6 + ${attributeObj.mod}`;
      
      let roll = new Roll(formula);
      roll.evaluate({async: true}).then(roll => {
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: label,
          rollMode: game.settings.get('core', 'rollMode'),
        });
      });
      return roll;
    }

    // Handle skill rolls
    if (dataset.rollSkill) {
      return this.actor.rollSkill(dataset.rollSkill);
    }

    // Handle save rolls
    if (dataset.rollSave) {
      return this.actor.rollSave(dataset.rollSave);
    }

    // Handle morale rolls
    if (dataset.rollMorale) {
      return this.actor.rollMorale();
    }
  }

  /** @override */
  _getHeaderButtons() {
    const buttons = super._getHeaderButtons();
    
    // Add custom buttons for actor sheets
    if (this.actor.isOwner) {
      buttons.unshift({
        label: "Effects",
        class: "manage-effects",
        icon: "fas fa-bolt",
        onclick: ev => this._onManageActiveEffects(ev)
      });
    }
    
    return buttons;
  }

  /**
   * Handle managing active effects
   * @param {Event} event The triggering event
   * @private
   */
  _onManageActiveEffects(event) {
    event.preventDefault();
    const a = game.actors.get(this.actor.id);
    new ActiveEffectConfig(a).render(true);
  }

  /** @override */
  async _onDropItemCreate(itemData) {
    // Override the default Item drop handler to handle duplicates
    const type = itemData.type;
    const name = itemData.name;
    
    // Check for duplicate items
    const duplicate = this.actor.items.find(i => i.type === type && i.name === name);
    if (duplicate) {
      const updateData = {};
      
      // Handle stackable items
      if (["gear"].includes(type)) {
        const quantity = duplicate.system.quantity + (itemData.system.quantity || 1);
        updateData["system.quantity"] = quantity;
        await duplicate.update(updateData);
        return duplicate;
      }
      
      // Ask the user if they want to replace the existing item
      const replace = await this._duplicateItemDialog(name);
      if (replace) {
        await duplicate.delete();
      } else {
        return null;
      }
    }
    
    // Create the owned item as normal
    return super._onDropItemCreate(itemData);
  }

  /**
   * Display a dialog for handling duplicate items
   * @param {string} itemName The name of the duplicate item
   * @returns {Promise<boolean>} Whether to replace the item
   * @private
   */
  async _duplicateItemDialog(itemName) {
    return new Promise(resolve => {
      const content = `<p>An item named "${itemName}" already exists on this Actor. Do you want to replace it?</p>`;
      
      new Dialog({
        title: "Duplicate Item",
        content: content,
        buttons: {
          replace: {
            icon: '<i class="fas fa-check"></i>',
            label: "Replace",
            callback: () => resolve(true)
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            callback: () => resolve(false)
          }
        },
        default: "cancel"
      }).render(true);
    });
  }
} 