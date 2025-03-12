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
    const itemType = this.item.type;
    // 아이템 타입별 템플릿 경로
    const path = `systems/cwn-system/templates/item/item-${itemType}-sheet.hbs`;
    console.log(`CWN | 아이템 시트 템플릿 요청: ${path}`);
    
    // v12 호환성: 템플릿 경로 단순화
    // 비동기 fetch 대신 단순히 경로만 반환
    // 템플릿이 없으면 Foundry가 자동으로 오류를 처리함
    return path;
  }

  /** @override */
  async getData() {
    console.log(`CWN | 아이템 시트 데이터 요청 - 아이템: "${this.item?.name}", 타입: "${this.item?.type}"`);
    
    // 기본 데이터 가져오기
    const context = await super.getData();
    console.log("CWN | 기본 아이템 시트 데이터:", context);
    
    // 아이템 데이터 추가
    const itemData = this.item.toObject(false);
    context.item = itemData;
    context.system = itemData.system;
    context.type = itemData.type;
    
    // 편집 권한 설정
    context.editable = this.isEditable;
    context.owner = this.item.isOwner;
    
    // 설정 데이터 추가
    context.config = CONFIG.CWN;
    
    // 아이템 타입별 추가 데이터 처리
    if (itemData.type) {
      console.log(`CWN | 아이템 타입별 데이터 준비 시작: ${itemData.type}`);
      
      // 기존 메서드 호출
      this._prepareItemData(context);
      
      // 아이템 타입별 속성 템플릿 경로 설정
      const attributesTemplatePath = `systems/cwn-system/templates/item/parts/item-${itemData.type}-attributes.hbs`;
      console.log(`CWN | 속성 템플릿 경로: ${attributesTemplatePath}`);
      
      // 템플릿 경로 설정
      context.attributesTemplate = attributesTemplatePath;
      
      // 총 무게 및 가격 계산
      if (['weapon', 'armor', 'gear', 'cyberware', 'drug'].includes(itemData.type)) {
        // 수량이 있는 경우 총 무게 및 가격 계산
        const quantity = itemData.system.quantity || 1;
        const weight = itemData.system.weight || 0;
        const price = itemData.system.price || 0;
        
        context.totalWeight = (quantity * weight).toFixed(1);
        context.totalPrice = (quantity * price).toFixed(0);
        
        console.log(`CWN | 총 무게: ${context.totalWeight}, 총 가격: ${context.totalPrice}`);
      }
      
      // 장착된 아이템 처리 (사이버웨어, 차량)
      if (['cyberware', 'vehicle'].includes(itemData.type)) {
        // 장착된 아이템 배열이 없으면 초기화
        if (!itemData.system.mountedItems) {
          itemData.system.mountedItems = [];
        }
        
        console.log(`CWN | 장착된 아이템 수: ${itemData.system.mountedItems.length}`);
      }
    }
    
    console.log("CWN | 최종 아이템 시트 데이터:", context);
    return context;
  }

  /**
   * 아이템 타입별 추가 데이터 준비
   * @param {Object} context 컨텍스트 데이터
   */
  _prepareItemData(context) {
    console.log(`CWN | 아이템 데이터 준비 시작 - 타입: "${context.type}"`);
    
    // 아이템 타입에 따라 추가 데이터 설정
    if (context.type === 'weapon') {
      this._prepareWeaponData(context);
    } else if (context.type === 'armor') {
      this._prepareArmorData(context);
    } else if (context.type === 'skill') {
      this._prepareSkillData(context);
    } else if (context.type === 'focus') {
      this._prepareFocusData(context);
    } else if (context.type === 'gear') {
      this._prepareGearData(context);
    } else if (context.type === 'cyberware') {
      this._prepareCyberwareData(context);
    } else if (context.type === 'drug') {
      this._prepareDrugData(context);
    } else if (context.type === 'asset') {
      this._prepareAssetData(context);
    } else if (context.type === 'power') {
      this._preparePowerData(context);
    } else if (context.type === 'vehicle') {
      this._prepareVehicleData(context);
    }
    
    // 공통 데이터 설정
    this._prepareCommonData(context);
    
    console.log(`CWN | 아이템 데이터 준비 완료 - 타입: "${context.type}"`);
  }

  /**
   * 모든 아이템 타입에 공통적인 데이터 준비
   * @param {Object} context 컨텍스트 데이터
   */
  _prepareCommonData(context) {
    console.log("CWN | 공통 데이터 준비 시작");
    
    // 태그 처리
    if (context.system.tags) {
      // 안전한 복제를 위해 배열 복사
      context.system.tags = Array.from(context.system.tags || []);
    } else {
      // 태그가 없으면 빈 배열 생성
      context.system.tags = [];
    }
    
    // 아이템 위치 옵션
    context.itemLocations = CONFIG.CWN.itemLocations;
    
    // 기타 공통 옵션들
    context.attributes = CONFIG.CWN.attributes;
    context.skillCategories = CONFIG.CWN.skillCategories;
    context.weaponRanges = CONFIG.CWN.weaponRanges;
    context.armorTypes = CONFIG.CWN.armorTypes;
    context.cyberwareLocations = CONFIG.CWN.cyberwareLocations;
    context.cyberwareTypes = CONFIG.CWN.cyberwareTypes;
    context.drugTypes = CONFIG.CWN.drugTypes;
    context.assetTypes = CONFIG.CWN.assetTypes;
    context.powerTypes = CONFIG.CWN.powerTypes;
    context.vehicleTypes = CONFIG.CWN.vehicleTypes;
    
    console.log("CWN | 공통 데이터 준비 완료");
  }

  /**
   * 무기 아이템 데이터 준비
   * @param {Object} context 컨텍스트 데이터
   */
  _prepareWeaponData(context) {
    console.log("CWN | 무기 데이터 준비 시작");
    
    // 기본값 설정
    if (!context.system.damage) {
      context.system.damage = "1d6";
    }
    
    if (!context.system.range) {
      context.system.range = "melee";
    }
    
    if (context.system.attackBonus === undefined) {
      context.system.attackBonus = 0;
    }
    
    if (!context.system.attribute) {
      context.system.attribute = "str";
    }
    
    if (!context.system.ammo) {
      context.system.ammo = { value: 0, max: 0 };
    }
    
    if (context.system.equipped === undefined) {
      context.system.equipped = false;
    }
    
    // 무기 범위 옵션 추가
    context.weaponRanges = CONFIG.CWN?.weaponRanges || {
      melee: "CWN.WeaponRangeMelee",
      thrown: "CWN.WeaponRangeThrown",
      pistol: "CWN.WeaponRangePistol",
      rifle: "CWN.WeaponRangeRifle",
      shotgun: "CWN.WeaponRangeShotgun",
      heavy: "CWN.WeaponRangeHeavy"
    };
    
    // 무기 태그 옵션 추가
    context.weaponTags = CONFIG.CWN?.weaponTags || {
      accurate: "CWN.WeaponTagAccurate",
      area: "CWN.WeaponTagArea",
      blast: "CWN.WeaponTagBlast",
      burst: "CWN.WeaponTagBurst",
      concealed: "CWN.WeaponTagConcealed",
      daze: "CWN.WeaponTagDaze",
      fixed: "CWN.WeaponTagFixed",
      heavy: "CWN.WeaponTagHeavy",
      reload: "CWN.WeaponTagReload",
      silent: "CWN.WeaponTagSilent",
      smart: "CWN.WeaponTagSmart",
      shock: "CWN.WeaponTagShock",
      twoHanded: "CWN.WeaponTagTwoHanded"
    };
    
    console.log("CWN | 무기 데이터 준비 완료:", context.system);
  }

  /**
   * 방어구 아이템 데이터 준비
   * @param {Object} context 컨텍스트 데이터
   */
  _prepareArmorData(context) {
    console.log("CWN | 방어구 데이터 준비 시작");
    
    // 기본값 설정
    if (context.system.ac === undefined) {
      context.system.ac = 10;
    }
    
    if (context.system.meleeAC === undefined) {
      context.system.meleeAC = context.system.ac;
    }
    
    if (!context.system.type) {
      context.system.type = "light";
    }
    
    if (context.system.traumaDiePenalty === undefined) {
      context.system.traumaDiePenalty = 0;
    }
    
    // 방어구 타입 옵션 추가
    context.armorTypes = CONFIG.CWN.armorTypes;
    
    console.log("CWN | 방어구 데이터 준비 완료:", context.system);
  }

  /**
   * 기술 아이템 데이터 준비
   * @param {Object} context 컨텍스트 데이터
   */
  _prepareSkillData(context) {
    console.log("CWN | 기술 데이터 준비 시작");
    
    // 기본값 설정
    if (context.system.level === undefined) {
      context.system.level = 0;
    }
    
    if (!context.system.attribute) {
      context.system.attribute = "int";
    }
    
    if (!context.system.category) {
      context.system.category = "standard";
    }
    
    if (!context.system.specialty) {
      context.system.specialty = "";
    }
    
    if (!context.system.source) {
      context.system.source = "";
    }
    
    // 속성 및 카테고리 옵션 추가
    context.attributes = CONFIG.CWN.attributes;
    context.skillCategories = CONFIG.CWN.skillCategories;
    
    console.log("CWN | 기술 데이터 준비 완료:", context.system);
  }

  /**
   * 특성 아이템 데이터 준비
   * @param {Object} context 컨텍스트 데이터
   */
  _prepareFocusData(context) {
    console.log("CWN | 특성 데이터 준비 시작");
    
    // 기본값 설정
    if (context.system.level === undefined) {
      context.system.level = 1;
    }
    
    if (!context.system.prerequisites) {
      context.system.prerequisites = "";
    }
    
    if (!context.system.levelEffects) {
      context.system.levelEffects = { level1: "", level2: "" };
    }
    
    if (!context.system.source) {
      context.system.source = "";
    }
    
    console.log("CWN | 특성 데이터 준비 완료:", context.system);
  }

  /**
   * 장비 아이템 데이터 준비
   * @param {Object} context 컨텍스트 데이터
   */
  _prepareGearData(context) {
    console.log("CWN | 장비 데이터 준비 시작");
    
    // 기본값 설정
    if (!context.system.type) {
      context.system.type = "general";
    }
    
    if (context.system.quantity === undefined) {
      context.system.quantity = 1;
    }
    
    if (context.system.price === undefined) {
      context.system.price = 0;
    }
    
    if (context.system.weight === undefined) {
      context.system.weight = 0.1;
    }
    
    if (!context.system.location) {
      context.system.location = "stowed";
    }
    
    // 장비 타입 옵션 추가
    context.gearTypes = CONFIG.CWN.gearTypes;
    
    console.log("CWN | 장비 데이터 준비 완료:", context.system);
  }

  /**
   * 사이버웨어 아이템 데이터 준비
   * @param {Object} context 컨텍스트 데이터
   */
  _prepareCyberwareData(context) {
    console.log("CWN | 사이버웨어 데이터 준비 시작");
    
    // 기본값 설정
    if (context.system.systemStrain === undefined) {
      context.system.systemStrain = 1;
    }
    
    if (!context.system.location) {
      context.system.location = "body";
    }
    
    if (!context.system.type) {
      context.system.type = "implant";
    }
    
    if (context.system.price === undefined) {
      context.system.price = 0;
    }
    
    // 사이버웨어 위치 및 타입 옵션 추가
    context.cyberwareLocations = CONFIG.CWN.cyberwareLocations;
    context.cyberwareTypes = CONFIG.CWN.cyberwareTypes;
    
    console.log("CWN | 사이버웨어 데이터 준비 완료:", context.system);
  }

  /**
   * 약물 아이템 데이터 준비
   * @param {Object} context 컨텍스트 데이터
   */
  _prepareDrugData(context) {
    console.log("CWN | 약물 데이터 준비 시작");
    
    // 기본값 설정
    if (!context.system.duration) {
      context.system.duration = "1 hour";
    }
    
    if (!context.system.type) {
      context.system.type = "medical";
    }
    
    if (context.system.quantity === undefined) {
      context.system.quantity = 1;
    }
    
    if (context.system.price === undefined) {
      context.system.price = 0;
    }
    
    if (!context.system.effect) {
      context.system.effect = "";
    }
    
    if (!context.system.sideEffect) {
      context.system.sideEffect = "";
    }
    
    if (!context.system.overdose) {
      context.system.overdose = "";
    }
    
    // 약물 타입 옵션 추가
    context.drugTypes = CONFIG.CWN.drugTypes;
    
    console.log("CWN | 약물 데이터 준비 완료:", context.system);
  }

  /**
   * 자산 아이템 데이터 준비
   * @param {Object} context 컨텍스트 데이터
   */
  _prepareAssetData(context) {
    console.log("CWN | 자산 데이터 준비 시작");
    
    // 기본값 설정
    if (context.system.rating === undefined) {
      context.system.rating = 1;
    }
    
    if (!context.system.type) {
      context.system.type = "military";
    }
    
    if (context.system.cost === undefined) {
      context.system.cost = 1;
    }
    
    if (context.system.maintenance === undefined) {
      context.system.maintenance = 0;
    }
    
    if (context.system.force === undefined) {
      context.system.force = 0;
    }
    
    if (context.system.cunning === undefined) {
      context.system.cunning = 0;
    }
    
    if (context.system.wealth === undefined) {
      context.system.wealth = 0;
    }
    
    if (!context.system.hp) {
      context.system.hp = { value: 1, max: 1 };
    }
    
    if (!context.system.upkeep) {
      context.system.upkeep = "";
    }
    
    // 자산 타입 옵션 추가
    context.assetTypes = CONFIG.CWN.assetTypes;
    
    console.log("CWN | 자산 데이터 준비 완료:", context.system);
  }

  /**
   * 능력 아이템 데이터 준비
   * @param {Object} context 컨텍스트 데이터
   */
  _preparePowerData(context) {
    console.log("CWN | 능력 데이터 준비 시작");
    
    // 기본값 설정
    if (context.system.level === undefined) {
      context.system.level = 1;
    }
    
    if (!context.system.type) {
      context.system.type = "psychic";
    }
    
    if (context.system.cost === undefined) {
      context.system.cost = 0;
    }
    
    if (!context.system.range) {
      context.system.range = "self";
    }
    
    if (!context.system.duration) {
      context.system.duration = "instant";
    }
    
    // 능력 타입 옵션 추가
    context.powerTypes = CONFIG.CWN.powerTypes;
    
    console.log("CWN | 능력 데이터 준비 완료:", context.system);
  }

  /**
   * 차량 아이템 데이터 준비
   * @param {Object} context 컨텍스트 데이터
   */
  _prepareVehicleData(context) {
    console.log("CWN | 차량 데이터 준비 시작");
    
    // 기본값 설정
    if (!context.system.type) {
      context.system.type = "ground";
    }
    
    if (context.system.speed === undefined) {
      context.system.speed = 0;
    }
    
    if (context.system.armor === undefined) {
      context.system.armor = 0;
    }
    
    if (!context.system.hp) {
      context.system.hp = { value: 10, max: 10 };
    }
    
    if (context.system.crew === undefined) {
      context.system.crew = 1;
    }
    
    if (context.system.price === undefined) {
      context.system.price = 0;
    }
    
    // 차량 타입 옵션 추가
    context.vehicleTypes = CONFIG.CWN.vehicleTypes;
    
    console.log("CWN | 차량 데이터 준비 완료:", context.system);
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
        
        // 무기 타입 토글 (근접/원거리)
        html.find('a.melee-toggle').click(() => {
          console.log("CWN | 근접 무기 토글 클릭");
          this.item.update({ "system.melee": !this.item.system.melee });
        });
        
        html.find('a.missile-toggle').click(() => {
          console.log("CWN | 원거리 무기 토글 클릭");
          this.item.update({ "system.missile": !this.item.system.missile });
        });
      }
      
      // 이미지 관리
      html.find('.item-image').click(this._onItemImageClick.bind(this));
      html.find('.item-image-reset').click(this._onItemImageReset.bind(this));
      
      // 입력 필드 포커스 시 전체 선택
      const inputs = html.find("input");
      inputs.focus(ev => ev.currentTarget.select());
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

    // 굴림 가능한 요소
    html.find('.rollable').click(this._onRoll.bind(this));
    
    // 효과 관리
    html.find(".effect-control").click(ev => {
      console.log("CWN | 효과 컨트롤 클릭");
      if (this.item.isOwned) return ui.notifications.warn("아이템 소유자만 효과를 관리할 수 있습니다.");
      const button = ev.currentTarget;
      const li = button.closest("li");
      const effect = li ? this.item.effects.get(li.dataset.effectId) : null;
      
      switch (button.dataset.action) {
        case "create":
          console.log("CWN | 새 효과 생성");
          return this.item.createEmbeddedDocuments("ActiveEffect", [{
            label: "새 효과",
            icon: "icons/svg/aura.svg",
            origin: this.item.uuid,
            "duration.rounds": 1,
            disabled: true
          }]);
        case "edit":
          console.log("CWN | 효과 편집:", effect);
          return effect.sheet.render(true);
        case "delete":
          console.log("CWN | 효과 삭제:", effect);
          return effect.delete();
        case "toggle":
          console.log("CWN | 효과 토글:", effect);
          return effect.update({disabled: !effect.disabled});
      }
    });
    
    // 장착된 아이템 관리
    html.find('.mounted-item-delete').click(this._onMountedItemDelete.bind(this));
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
        label: "복제",
        class: "item-duplicate",
        icon: "fas fa-copy",
        onclick: () => this._onDuplicateItem()
      });
    } else {
      buttons.unshift({
        label: "복제",
        class: "item-duplicate",
        icon: "fas fa-copy",
        onclick: () => this._onDuplicateItem()
      });
    }
    
    // 효과 관리 버튼 추가
    buttons.unshift({
      label: "효과",
      class: "manage-effects",
      icon: "fas fa-bolt",
      onclick: ev => this._onManageActiveEffects(ev)
    });
    
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
    console.log("CWN | 아이템 시트에 드롭 이벤트 발생");
    event.preventDefault();
    
    // 드롭된 데이터 파싱
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
      console.log("CWN | 드롭된 데이터:", data);
    } catch (err) {
      console.error("CWN | 드롭된 데이터 파싱 오류:", err);
      return false;
    }
    
    // 아이템 타입에 따른 처리
    switch (data.type) {
      case "Item":
        return this._onDropItem(event, data);
      case "ActiveEffect":
        return this._onDropActiveEffect(event, data);
      default:
        console.log(`CWN | 지원하지 않는 드롭 타입: ${data.type}`);
        return false;
    }
  }
  
  /**
   * 아이템 드롭 처리
   * @param {DragEvent} event 드래그 이벤트
   * @param {Object} data 드롭 데이터
   * @private
   */
  async _onDropItem(event, data) {
    console.log("CWN | 아이템 드롭 처리:", data);
    
    // 현재 아이템 타입 확인
    const currentType = this.item.type;
    
    // 드롭된 아이템 가져오기
    const droppedItem = await fromUuid(data.uuid);
    if (!droppedItem) {
      console.error("CWN | 드롭된 아이템을 찾을 수 없음:", data.uuid);
      return false;
    }
    
    console.log(`CWN | 드롭된 아이템: ${droppedItem.name}, 타입: ${droppedItem.type}`);
    
    // 아이템 타입별 처리
    switch (currentType) {
      case "cyberware":
        // 사이버웨어에 아이템 장착 처리
        if (droppedItem.type === "weapon" || droppedItem.type === "gear") {
          return this._addItemToCyberware(droppedItem);
        }
        break;
      case "vehicle":
        // 차량에 아이템 장착 처리
        if (droppedItem.type === "weapon" || droppedItem.type === "gear") {
          return this._addItemToVehicle(droppedItem);
        }
        break;
      default:
        console.log(`CWN | ${currentType} 타입에는 아이템을 드롭할 수 없습니다.`);
        return false;
    }
    
    console.log("CWN | 아이템 드롭 처리 완료");
    return false;
  }
  
  /**
   * 사이버웨어에 아이템 추가
   * @param {Item} item 추가할 아이템
   * @private
   */
  async _addItemToCyberware(item) {
    console.log(`CWN | 사이버웨어 ${this.item.name}에 아이템 ${item.name} 추가 시도`);
    
    // 사이버웨어 데이터 가져오기
    const cyberwareData = foundry.utils.deepClone(this.item.system);
    
    // 장착된 아이템 배열이 없으면 생성
    if (!cyberwareData.mountedItems) {
      cyberwareData.mountedItems = [];
    }
    
    // 아이템 데이터 추가
    cyberwareData.mountedItems.push({
      id: item.id,
      name: item.name,
      img: item.img,
      type: item.type
    });
    
    // 사이버웨어 업데이트
    await this.item.update({ "system.mountedItems": cyberwareData.mountedItems });
    
    ui.notifications.info(`${item.name}이(가) ${this.item.name}에 장착되었습니다.`);
    console.log(`CWN | 사이버웨어에 아이템 추가 완료`);
    return true;
  }
  
  /**
   * 차량에 아이템 추가
   * @param {Item} item 추가할 아이템
   * @private
   */
  async _addItemToVehicle(item) {
    console.log(`CWN | 차량 ${this.item.name}에 아이템 ${item.name} 추가 시도`);
    
    // 차량 데이터 가져오기
    const vehicleData = foundry.utils.deepClone(this.item.system);
    
    // 장착된 아이템 배열이 없으면 생성
    if (!vehicleData.mountedItems) {
      vehicleData.mountedItems = [];
    }
    
    // 아이템 데이터 추가
    vehicleData.mountedItems.push({
      id: item.id,
      name: item.name,
      img: item.img,
      type: item.type
    });
    
    // 차량 업데이트
    await this.item.update({ "system.mountedItems": vehicleData.mountedItems });
    
    ui.notifications.info(`${item.name}이(가) ${this.item.name}에 장착되었습니다.`);
    console.log(`CWN | 차량에 아이템 추가 완료`);
    return true;
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
   * 태그 삭제 핸들러
   * @param {Event} event 이벤트 객체
   * @private
   */
  async _onTagDelete(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const tag = element.parentElement.dataset.tag;
    console.log(`CWN | 태그 삭제 요청: "${tag}"`);
    await this.item.popTag(tag);
  }

  /**
   * 태그 추가 핸들러
   * @param {Event} event 이벤트 객체
   * @private
   */
  async _onTagAdd(event) {
    event.preventDefault();
    const input = event.currentTarget.previousElementSibling;
    const tag = input.value.trim();
    console.log(`CWN | 태그 추가 요청: "${tag}"`);
    
    if (tag) {
      await this.item.addTag(tag);
      input.value = "";
    }
  }

  /**
   * 탄약 관리 핸들러
   * @param {Event} event 이벤트 객체
   * @private
   */
  async _onAmmoControl(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const action = element.dataset.action;
    console.log(`CWN | 탄약 관리 요청: "${action}"`);
    
    // 현재 탄약 정보 가져오기
    const ammo = foundry.utils.deepClone(this.item.system.ammo || { value: 0, max: 0 });
    
    // 액션에 따라 처리
    if (action === "increase") {
      ammo.value = Math.min(ammo.value + 1, ammo.max);
    } else if (action === "decrease") {
      ammo.value = Math.max(ammo.value - 1, 0);
    } else if (action === "increaseMax") {
      ammo.max += 1;
    } else if (action === "decreaseMax") {
      ammo.max = Math.max(ammo.max - 1, 0);
      ammo.value = Math.min(ammo.value, ammo.max);
    }
    
    // 업데이트
    await this.item.update({ "system.ammo": ammo });
  }

  /**
   * 아이템 복제 핸들러
   * @private
   */
  async _onDuplicateItem() {
    console.log("CWN | 아이템 복제 요청:", this.item.name);
    const duplicatedItem = await this.item.duplicate();
    
    if (duplicatedItem) {
      ui.notifications.info(`아이템 "${this.item.name}"이(가) 복제되었습니다.`);
      
      // 복제된 아이템이 월드 아이템인 경우 시트 열기
      if (!this.item.isOwned) {
        duplicatedItem.sheet.render(true);
      }
    } else {
      ui.notifications.error(`아이템 "${this.item.name}" 복제 중 오류가 발생했습니다.`);
    }
  }

  /**
   * 아이템 이미지 클릭 핸들러
   * @param {Event} event 이벤트 객체
   * @private
   */
  async _onItemImageClick(event) {
    console.log("CWN | 아이템 이미지 클릭");
    event.preventDefault();
    
    const current = this.item.img;
    const fp = new FilePicker({
      type: "image",
      current: current,
      callback: path => {
        console.log(`CWN | 새 이미지 경로: ${path}`);
        this.item.update({ img: path });
      },
      top: this.position.top + 40,
      left: this.position.left + 10
    });
    
    return fp.browse();
  }
  
  /**
   * 아이템 이미지 초기화 핸들러
   * @param {Event} event 이벤트 객체
   * @private
   */
  async _onItemImageReset(event) {
    console.log("CWN | 아이템 이미지 초기화");
    event.preventDefault();
    
    const defaultIcon = CWNItem.defaultIcons[this.item.type] || "icons/svg/item-bag.svg";
    console.log(`CWN | 기본 이미지로 재설정: ${defaultIcon}`);
    
    return this.item.update({ img: defaultIcon });
  }
  
  /**
   * 장착된 아이템 삭제 핸들러
   * @param {Event} event 이벤트 객체
   * @private
   */
  async _onMountedItemDelete(event) {
    console.log("CWN | 장착된 아이템 삭제 요청");
    event.preventDefault();
    
    const itemId = event.currentTarget.dataset.itemId;
    console.log(`CWN | 삭제할 아이템 ID: ${itemId}`);
    
    // 아이템 타입에 따라 처리
    if (this.item.type === "cyberware") {
      const cyberwareData = foundry.utils.deepClone(this.item.system);
      
      if (cyberwareData.mountedItems) {
        const index = cyberwareData.mountedItems.findIndex(i => i.id === itemId);
        if (index !== -1) {
          const removedItem = cyberwareData.mountedItems.splice(index, 1)[0];
          await this.item.update({ "system.mountedItems": cyberwareData.mountedItems });
          ui.notifications.info(`${removedItem.name}이(가) ${this.item.name}에서 제거되었습니다.`);
        }
      }
    } else if (this.item.type === "vehicle") {
      const vehicleData = foundry.utils.deepClone(this.item.system);
      
      if (vehicleData.mountedItems) {
        const index = vehicleData.mountedItems.findIndex(i => i.id === itemId);
        if (index !== -1) {
          const removedItem = vehicleData.mountedItems.splice(index, 1)[0];
          await this.item.update({ "system.mountedItems": vehicleData.mountedItems });
          ui.notifications.info(`${removedItem.name}이(가) ${this.item.name}에서 제거되었습니다.`);
        }
      }
    }
  }
} 