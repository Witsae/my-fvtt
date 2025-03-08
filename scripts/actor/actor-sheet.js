/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CWNActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cwn", "sheet", "actor"],
      template: "systems/my-fvtt-cwn/templates/actor/actor-sheet.hbs",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }]
    });
  }

  /** @override */
  get template() {
    return `systems/my-fvtt-cwn/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet.
    const context = super.getData();

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
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

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
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
      else if (dataset.rollType == 'attack') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.rollAttack();
      }
      else if (dataset.rollType == 'damage') {
        const itemId = element.closest('.item').dataset.itemId;
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
} 