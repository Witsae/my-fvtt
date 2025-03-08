/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class CWNItemSheet extends ItemSheet {

  constructor(item, options = {}) {
    super(item, options);
    console.log("CWN | ItemSheet constructor called for:", item?.name, options);
    console.log("CWN | Item data in constructor:", item);
  }

  /** @override */
  static get defaultOptions() {
    console.log("CWN | ItemSheet defaultOptions called");
    const options = foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cwn", "sheet", "item"],
      width: 520,
      height: 480,
      resizable: true,
      scrollY: [".sheet-body"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
    console.log("CWN | ItemSheet defaultOptions:", options);
    return options;
  }

  /** @override */
  get template() {
    console.log("CWN | ItemSheet template getter called for:", this.item?.name, this.item?.type);
    
    // 아이템 타입에 따른 템플릿 경로 설정
    const type = this.item?.type || "gear";
    
    // 타입별 템플릿 파일이 있는지 확인
    const typeTemplate = `systems/cwn-system/templates/item/item-${type}-sheet.hbs`;
    
    // 기본 템플릿 경로
    const defaultTemplate = "systems/cwn-system/templates/item/item-sheet.hbs";
    
    // 템플릿 경로 결정 - 항상 기본 템플릿 사용
    const template = defaultTemplate;
    
    console.log("CWN | Using template:", template);
    return template;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    console.log("CWN | ItemSheet getData called for:", this.item?.name);
    console.log("CWN | Item data in getData:", this.item);
    
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
      context.type = this.item.type || "gear"; // 기본값으로 gear 설정
      console.log("CWN | Item type in getData:", context.type);

      // 아이템 타입이 유효한지 확인
      const validTypes = ["weapon", "armor", "skill", "focus", "gear", "cyberware", "drug", "asset", "power", "vehicle"];
      if (!validTypes.includes(context.type)) {
        console.warn(`CWN | Invalid item type: ${context.type}, defaulting to gear`);
        context.type = "gear";
      }

      // Prepare specific data for different item types
      this._prepareItemData(context);

      console.log("CWN | Final context for item sheet:", context);
      return context;
    } catch (error) {
      console.error("CWN | Error in ItemSheet getData:", error);
      throw error;
    }
  }

  /**
   * Prepare data for different item types
   * @param {Object} context The context data for the template
   * @private
   */
  _prepareItemData(context) {
    console.log("CWN | _prepareItemData called for type:", context.type);
    // Handle different item types
    if (this.item.type === 'weapon') {
      this._prepareWeaponData(context);
    } else if (this.item.type === 'armor') {
      this._prepareArmorData(context);
    } else if (this.item.type === 'skill') {
      this._prepareSkillData(context);
    } else if (this.item.type === 'focus') {
      this._prepareFocusData(context);
    } else if (this.item.type === 'gear') {
      this._prepareGearData(context);
    } else if (this.item.type === 'cyberware') {
      this._prepareCyberwareData(context);
    } else if (this.item.type === 'drug') {
      this._prepareDrugData(context);
    } else if (this.item.type === 'asset') {
      this._prepareAssetData(context);
    } else if (this.item.type === 'power') {
      this._preparePowerData(context);
    } else if (this.item.type === 'vehicle') {
      this._prepareVehicleData(context);
    } else {
      console.warn("CWN | Unknown item type:", this.item.type);
    }
  }

  /**
   * Prepare weapon-specific data
   * @param {Object} context The context data for the template
   * @private
   */
  _prepareWeaponData(context) {
    console.log("CWN | _prepareWeaponData called");
    // Add weapon range options
    context.weaponRanges = CONFIG.CWN.weaponRanges;
  }

  /**
   * Prepare armor-specific data
   * @param {Object} context The context data for the template
   * @private
   */
  _prepareArmorData(context) {
    console.log("CWN | _prepareArmorData called");
    // Add armor type options
    context.armorTypes = CONFIG.CWN.armorTypes;
  }

  /**
   * Prepare skill-specific data
   * @param {Object} context The context data for the template
   * @private
   */
  _prepareSkillData(context) {
    console.log("CWN | _prepareSkillData called");
    // Add skill category options
    context.skillCategories = CONFIG.CWN.skillCategories;
    // Add attribute options
    context.attributes = CONFIG.CWN.attributes;
  }

  /**
   * Prepare focus-specific data
   * @param {Object} context The context data for the template
   * @private
   */
  _prepareFocusData(context) {
    console.log("CWN | _prepareFocusData called");
    // Add focus level options
    context.focusLevels = CONFIG.CWN.focusLevels;
  }

  /**
   * Prepare gear-specific data
   * @param {Object} context The context data for the template
   * @private
   */
  _prepareGearData(context) {
    console.log("CWN | _prepareGearData called");
    // Add gear type options
    context.gearTypes = CONFIG.CWN.gearTypes;
  }

  /**
   * Prepare cyberware-specific data
   * @param {Object} context The context data for the template
   * @private
   */
  _prepareCyberwareData(context) {
    console.log("CWN | _prepareCyberwareData called");
    // Add cyberware type options
    context.cyberwareTypes = CONFIG.CWN.cyberwareTypes;
  }

  /**
   * Prepare drug-specific data
   * @param {Object} context The context data for the template
   * @private
   */
  _prepareDrugData(context) {
    console.log("CWN | _prepareDrugData called");
    // Add drug type options
    context.drugTypes = CONFIG.CWN.drugTypes;
  }

  /**
   * Prepare asset-specific data
   * @param {Object} context The context data for the template
   * @private
   */
  _prepareAssetData(context) {
    console.log("CWN | _prepareAssetData called");
    // Add asset type options
    context.assetTypes = CONFIG.CWN.assetTypes;
  }

  /**
   * Prepare power-specific data
   * @param {Object} context The context data for the template
   * @private
   */
  _preparePowerData(context) {
    console.log("CWN | _preparePowerData called");
    // Add power type options
    context.powerTypes = CONFIG.CWN.powerTypes;
  }

  /**
   * Prepare vehicle-specific data
   * @param {Object} context The context data for the template
   * @private
   */
  _prepareVehicleData(context) {
    console.log("CWN | _prepareVehicleData called");
    // Add vehicle type options
    context.vehicleTypes = CONFIG.CWN.vehicleTypes;
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
      console.log("CWN | Tag add button clicked");
      ev.preventDefault();
      const item = this.item;
      const tags = foundry.utils.deepClone(item.system.tags || []);
      tags.push("");
      item.update({ "system.tags": tags });
    });

    // Delete tag
    html.find('.tag-delete').click(ev => {
      console.log("CWN | Tag delete button clicked for index:", ev.currentTarget.dataset.index);
      ev.preventDefault();
      const item = this.item;
      const tags = foundry.utils.deepClone(item.system.tags || []);
      const index = Number(ev.currentTarget.dataset.index);
      tags.splice(index, 1);
      item.update({ "system.tags": tags });
    });

    // Add item property
    html.find('.property-add').click(ev => {
      console.log("CWN | Property add button clicked");
      ev.preventDefault();
      const item = this.item;
      const properties = foundry.utils.deepClone(item.system.properties || []);
      properties.push({
        name: "",
        value: ""
      });
      item.update({ "system.properties": properties });
    });

    // Delete item property
    html.find('.property-delete').click(ev => {
      console.log("CWN | Property delete button clicked for index:", ev.currentTarget.dataset.index);
      ev.preventDefault();
      const item = this.item;
      const properties = foundry.utils.deepClone(item.system.properties || []);
      const index = Number(ev.currentTarget.dataset.index);
      properties.splice(index, 1);
      item.update({ "system.properties": properties });
    });

    // Active Effect management
    html.find(".effect-control").click(ev => {
      console.log("CWN | Effect control button clicked:", ev.currentTarget.dataset.action);
      const button = ev.currentTarget;
      const effectId = button.closest(".effect").dataset.effectId;
      const effect = this.item.effects.get(effectId);
      
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
    
    // Rollable elements
    html.find('.rollable').click(this._onRoll.bind(this));
  }

  /**
   * Handle clickable rolls
   * @param {Event} event The originating click event
   * @private
   */
  _onRoll(event) {
    console.log("CWN | Roll button clicked:", event.currentTarget.dataset);
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    
    // Handle different roll types
    if (dataset.rollType) {
      switch (dataset.rollType) {
        case 'attack':
          console.log("CWN | Rolling attack for:", this.item.name);
          this.item.rollAttack();
          break;
        case 'damage':
          console.log("CWN | Rolling damage for:", this.item.name);
          this.item.rollDamage();
          break;
        default:
          console.log("CWN | Rolling item:", this.item.name);
          this.item.roll();
      }
    }
  }

  /** @override */
  _getHeaderButtons() {
    console.log("CWN | ItemSheet _getHeaderButtons called for:", this.item?.name);
    const buttons = super._getHeaderButtons();
    
    // Add custom buttons for item sheets
    if (this.item.isOwned) {
      buttons.unshift({
        label: "Roll",
        class: "roll-item",
        icon: "fas fa-dice-d20",
        onclick: () => this.item.roll()
      });
    }
    
    // Add active effects management button
    if (game.user.isGM || this.item.isOwner) {
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
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onManageActiveEffects(event) {
    console.log("CWN | Manage active effects button clicked");
    event.preventDefault();
    return this.item.sheet.effects.render(true);
  }

  /** @override */
  async _onDrop(event) {
    console.log("CWN | ItemSheet _onDrop called");
    event.preventDefault();
    
    // Get dropped data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
      console.log("CWN | Dropped data:", data);
    } catch (err) {
      console.error("CWN | Error parsing dropped data:", err);
      return false;
    }
    
    // Handle dropped active effects
    if (data.type === "ActiveEffect") {
      return this._onDropActiveEffect(event, data);
    }
    
    return false;
  }

  /**
   * Handle dropping an Active Effect on this Item Sheet
   * @param {DragEvent} event     The drop event
   * @param {Object} data         The dropped data
   * @return {Promise<boolean>}   Whether the drop was successful
   * @private
   */
  async _onDropActiveEffect(event, data) {
    console.log("CWN | ItemSheet _onDropActiveEffect called with data:", data);
    const effect = await ActiveEffect.implementation.fromDropData(data);
    return this.item.createEmbeddedDocuments("ActiveEffect", [effect.toObject()]);
  }

  /** @override */
  render(force = false, options = {}) {
    console.log("CWN | ItemSheet render called for:", this.item?.name, "force:", force, "options:", options);
    return super.render(force, options);
  }
} 