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
    const options = mergeObject(super.defaultOptions, {
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
    
    // 아이템 타입이 없는 경우 기본 템플릿 반환
    if (!this.item?.type) {
      console.warn("CWN | Item has no type, using default template");
      return "systems/cwn-system/templates/item/item-sheet.hbs";
    }
    
    // 아이템 타입별 템플릿 경로
    const path = "systems/cwn-system/templates/item";
    const templatePath = `${path}/item-${this.item.type}-sheet.hbs`;
    
    console.log("CWN | Using template path:", templatePath);
    return templatePath;
  }

  /** @override */
  async getData() {
    console.log("CWN | ItemSheet getData called for:", this.item?.name, this.item?.type);
    
    // 기본 데이터 가져오기
    const context = await super.getData();
    
    // v12 호환성: context.data 대신 context 사용
    const itemData = this.item;
    const source = itemData.toObject();
    
    // 아이템 데이터 설정
    context.system = itemData.system;
    context.source = source.system;
    
    // 편집 권한 설정
    context.editable = this.isEditable;
    context.owner = this.item.isOwner;
    
    // 아이템 타입 설정
    context.type = this.item.type;
    
    // 설정 데이터 추가
    context.config = CONFIG.CWN;
    
    // 아이템 타입별 추가 데이터 설정
    this._prepareItemData(context);
    
    // 디버깅 정보
    console.log("CWN | Item sheet data:", context);
    
    return context;
  }

  /**
   * Prepare data for different item types
   * @param {Object} context The context data for the template
   * @private
   */
  _prepareItemData(context) {
    console.log("CWN | _prepareItemData called for type:", context.type);
    
    // 아이템 타입 확인
    if (!context.type) {
      console.warn("CWN | Item type is undefined in _prepareItemData");
      context.type = "gear"; // 기본값 설정
    }
    
    // 시스템 데이터 확인
    if (!context.system) {
      console.warn("CWN | System data is undefined in _prepareItemData");
      context.system = {}; // 빈 객체로 초기화
    }
    
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
    
    // 데이터 준비 후 최종 확인
    console.log("CWN | Item data prepared for type:", context.type);
    console.log("CWN | Final system data:", context.system);
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
    context.weaponTags = CONFIG.CWN.weaponTags;
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
    context.cyberwareLocations = CONFIG.CWN.cyberwareLocations;
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

    // 모든 상호작용 요소에 대한 리스너
    if (this.isEditable) {
      // 태그 관리
      html.find('.tag-delete').click(this._onTagDelete.bind(this));
      html.find('.tag-add').click(this._onTagAdd.bind(this));
      
      // 아이템 타입별 특수 리스너
      if (this.item.type === 'weapon') {
        html.find('.ammo-control').click(this._onAmmoControl.bind(this));
      }
    }
    
    // 탭 초기화 - 이미 탭 핸들러가 있는지 확인
    const tabs = html.find('.tabs');
    if (tabs.length > 0 && !tabs.hasClass('initialized')) {
      console.log("CWN | Initializing tabs for item sheet");
      
      // 첫 번째 탭에 active 클래스 추가
      tabs.find('.item').first().addClass('active');
      html.find('.tab').first().addClass('active');
      
      tabs.addClass('initialized');
    }

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

  /**
   * 태그 삭제 처리
   * @param {Event} event 클릭 이벤트
   * @private
   */
  async _onTagDelete(event) {
    event.preventDefault();
    const tagIndex = event.currentTarget.dataset.tagIndex;
    const tags = Array.from(this.item.system.tags || []);
    
    if (tagIndex !== undefined && tags.length > parseInt(tagIndex)) {
      tags.splice(parseInt(tagIndex), 1);
      await this.item.update({"system.tags": tags});
    }
  }

  /**
   * 태그 추가 처리
   * @param {Event} event 클릭 이벤트
   * @private
   */
  async _onTagAdd(event) {
    event.preventDefault();
    const input = event.currentTarget.previousElementSibling;
    const tagName = input.value.trim();
    
    if (tagName) {
      const tags = Array.from(this.item.system.tags || []);
      if (!tags.includes(tagName)) {
        tags.push(tagName);
        await this.item.update({"system.tags": tags});
        input.value = "";
      }
    }
  }

  /**
   * 탄약 증가/감소 처리
   * @param {Event} event 클릭 이벤트
   * @private
   */
  async _onAmmoControl(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const action = button.dataset.action;
    const ammo = this.item.system.ammo || {};
    
    if (action === "increase") {
      await this.item.update({"system.ammo.value": Math.min((ammo.value || 0) + 1, ammo.max || 0)});
    } else if (action === "decrease") {
      await this.item.update({"system.ammo.value": Math.max((ammo.value || 0) - 1, 0)});
    } else if (action === "reload") {
      await this.item.update({"system.ammo.value": ammo.max || 0});
    }
  }
} 