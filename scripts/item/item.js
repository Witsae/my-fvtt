/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class CWNItem extends Item {
  /**
   * 아이템 생성 메서드 오버라이드
   * @override
   * v12 호환성: Item.create 메서드
   */
  static async create(data, options = {}) {
    console.log("CWN | CWNItem.create 호출됨:", data, options);
    
    // 기본 이미지 설정
    if (data.img === undefined || data.img === null) {
      data.img = this.defaultIcons[data.type] || "icons/svg/item-bag.svg";
      console.log(`CWN | 아이템 기본 이미지 설정: ${data.img}`);
    }
    
    // 부모 클래스의 create 메서드 호출
    console.log("CWN | 부모 클래스의 create 메서드 호출");
    const item = await super.create(data, options);
    
    // 생성된 아이템 로깅
    console.log("CWN | 아이템 생성 완료:", item);
    
    return item;
  }
  
  /**
   * 아이템 타입별 기본 아이콘 정의
   */
  static get defaultIcons() {
    return {
      weapon: "icons/svg/sword.svg",
      armor: "icons/svg/shield.svg",
      skill: "icons/svg/book.svg",
      focus: "icons/svg/eye.svg",
      gear: "icons/svg/backpack.svg",
      cyberware: "icons/svg/robot.svg",
      drug: "icons/svg/potion.svg",
      asset: "icons/svg/coins.svg",
      power: "icons/svg/explosion.svg",
      vehicle: "icons/svg/tank.svg"
    };
  }
  
  /**
   * Augment the basic Item data model with additional dynamic data.
   * v12 호환성: 아이템 데이터 준비 메서드
   * v10부터 item.data.data 대신 item.system을 사용합니다.
   */
  prepareData() {
    super.prepareData();
    
    // 아이템 데이터 참조
    const itemData = this;
    const systemData = itemData.system; // v12 호환성: system 속성 사용
    const flags = itemData.flags;
    
    // 아이템 타입별 데이터 준비
    this._prepareItemData();
  }
  
  /**
   * 아이템 타입별 데이터 준비
   * v12 호환성: 아이템 타입별 데이터 준비 메서드
   */
  _prepareItemData() {
    // 아이템 타입별 처리
    switch (this.type) {
      case 'weapon':
        this._prepareWeaponData(this);
        break;
      case 'armor':
        this._prepareArmorData(this);
        break;
      case 'skill':
        this._prepareSkillData(this);
        break;
      case 'focus':
        this._prepareFocusData(this);
        break;
      case 'cyberware':
        this._prepareCyberwareData(this);
        break;
      case 'asset':
        this._prepareAssetData(this);
        break;
      case 'vehicle':
        this._prepareVehicleData(this);
        break;
      case 'power':
        this._preparePowerData(this);
        break;
      case 'drug':
        this._prepareDrugData(this);
        break;
      case 'gear':
        this._prepareGearData(this);
        break;
      default:
        console.log(`CWN | 알 수 없는 아이템 타입: ${this.type}`);
        break;
    }
  }
  
  /**
   * 무기 아이템 데이터 준비
   * @param {Object} itemData 아이템 데이터
   * @private
   */
  _prepareWeaponData(itemData) {
    // 시스템 데이터가 없으면 초기화
    if (!itemData.system) {
      itemData.system = {};
    }
    
    const data = itemData.system;
    
    // 기본값 설정
    if (data.ammo === undefined) {
      data.ammo = { value: 0, max: 0 };
    }
    
    // 태그 배열 확인
    if (!Array.isArray(data.tags)) {
      data.tags = [];
    }
    
    // 공격 보너스가 없으면 0으로 설정
    if (data.attackBonus === undefined) {
      data.attackBonus = 0;
    }
    
    // 피해 주사위가 없으면 기본값 설정
    if (!data.damage) {
      data.damage = "1d6";
    }
  }
  
  /**
   * 방어구 아이템 데이터 준비
   * @param {Object} itemData 아이템 데이터
   * @private
   */
  _prepareArmorData(itemData) {
    // 시스템 데이터가 없으면 초기화
    if (!itemData.system) {
      itemData.system = {};
    }
    
    const data = itemData.system;
    
    // 기본값 설정
    if (data.ac === undefined) {
      data.ac = 10;
    }
    
    // 근접 AC가 없으면 일반 AC와 동일하게 설정
    if (data.meleeAC === undefined) {
      data.meleeAC = data.ac;
    }
    
    // 태그 배열 확인
    if (!Array.isArray(data.tags)) {
      data.tags = [];
    }
  }
  
  /**
   * 기술 아이템 데이터 준비
   * @param {Object} itemData 아이템 데이터
   * @private
   */
  _prepareSkillData(itemData) {
    // 시스템 데이터가 없으면 초기화
    if (!itemData.system) {
      itemData.system = {};
    }
    
    const data = itemData.system;
    
    // 기본값 설정
    if (data.level === undefined) {
      data.level = 0;
    }
    
    // 속성이 없으면 기본값 설정
    if (!data.attribute) {
      data.attribute = "int";
    }
  }
  
  /**
   * 특성 아이템 데이터 준비
   * @param {Object} itemData 아이템 데이터
   * @private
   */
  _prepareFocusData(itemData) {
    // 시스템 데이터가 없으면 초기화
    if (!itemData.system) {
      itemData.system = {};
    }
    
    const data = itemData.system;
    
    // 기본값 설정
    if (data.level === undefined) {
      data.level = 1;
    }
    
    // 레벨 효과가 없으면 빈 객체로 설정
    if (!data.levelEffects) {
      data.levelEffects = { level1: "", level2: "" };
    }
  }
  
  /**
   * 사이버웨어 아이템 데이터 준비
   * @param {Object} itemData 아이템 데이터
   * @private
   */
  _prepareCyberwareData(itemData) {
    // 시스템 데이터가 없으면 초기화
    if (!itemData.system) {
      itemData.system = {};
    }
    
    const data = itemData.system;
    
    // 기본값 설정
    if (data.systemStrain === undefined) {
      data.systemStrain = 0;
    }
    
    // 태그 배열 확인
    if (!Array.isArray(data.tags)) {
      data.tags = [];
    }
  }
  
  /**
   * 자산 아이템 데이터 준비
   * @param {Object} itemData 아이템 데이터
   * @private
   */
  _prepareAssetData(itemData) {
    // 시스템 데이터가 없으면 초기화
    if (!itemData.system) {
      itemData.system = {};
    }
    
    const data = itemData.system;
    
    // 기본값 설정
    if (data.rating === undefined) {
      data.rating = 1;
    }
    
    // 비용이 없으면 기본값 설정
    if (data.cost === undefined) {
      data.cost = 0;
    }
  }

  /**
   * 일반 아이템 굴림
   */
  async roll() {
    console.log("CWN | 아이템 굴림:", this.name);
    
    // 아이템 타입에 따라 다른 굴림 메서드 호출
    if (this.type === 'weapon') {
      return this.rollAttack();
    }
    
    // 아이템 정보를 채팅에 표시
    const chatData = {
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `${this.name}`,
      content: await TextEditor.enrichHTML(this.system.description, {async: true})
    };
    
    ChatMessage.create(chatData);
  }

  /**
   * Get the appropriate sheet class for this item
   * @override
   */
  static get sheetClass() {
    console.log("CWN | Getting sheetClass for CWNItem");
    
    // First try to get from CONFIG directly
    if (CONFIG.Item.sheetClasses?.cwn?.base) {
      console.log("CWN | Found sheet class in CONFIG.Item.sheetClasses.cwn.base");
      return CONFIG.Item.sheetClasses.cwn.base.cls;
    }
    
    // Fallback to default ItemSheet
    console.log("CWN | Using default ItemSheet class");
    return ItemSheet;
  }

  /**
   * Get the sheet instance for this item
   * @override
   */
  get sheet() {
    console.log("CWN | Getting sheet for item:", this.name);
    
    // If a sheet is already defined, return it
    if (this._sheet) {
      console.log("CWN | Sheet instance already exists:", this._sheet);
      return this._sheet;
    }
    
    // No sheet exists, create one
    console.log("CWN | No sheet instance exists, creating one");
    
    // Try to get the appropriate sheet class
    let SheetClass = null;
    
    // First check if there's a type-specific sheet class
    if (CONFIG.Item.sheetClasses?.cwn?.[this.type]) {
      console.log(`CWN | Found type-specific sheet class for ${this.type}`);
      SheetClass = CONFIG.Item.sheetClasses.cwn[this.type].cls;
    } 
    // Otherwise use the base sheet class
    else if (CONFIG.Item.sheetClasses?.cwn?.base) {
      console.log("CWN | Using base sheet class");
      SheetClass = CONFIG.Item.sheetClasses.cwn.base.cls;
    }
    // Fallback to default
    else {
      console.log("CWN | Using default ItemSheet class");
      SheetClass = ItemSheet;
    }
    
    console.log("CWN | Creating CWNItemSheet instance");
    this._sheet = new SheetClass(this);
    console.log("CWN | Created sheet instance:", this._sheet);
    
    return this._sheet;
  }

  /**
   * 태그 추가 메서드
   * @param {string} tag 추가할 태그
   */
  async addTag(tag) {
    console.log(`CWN | 태그 추가: "${tag}"`);
    if (!tag) return;
    
    const tags = this.system.tags || [];
    if (tags.includes(tag)) return;
    
    tags.push(tag);
    return this.update({ "system.tags": tags });
  }
  
  /**
   * 태그 제거 메서드
   * @param {string} tag 제거할 태그
   */
  async popTag(tag) {
    console.log(`CWN | 태그 제거: "${tag}"`);
    if (!tag) return;
    
    const tags = this.system.tags || [];
    const index = tags.indexOf(tag);
    if (index === -1) return;
    
    tags.splice(index, 1);
    return this.update({ "system.tags": tags });
  }
  
  /**
   * 무기 공격 굴림 수행
   * @param {Object} options 옵션
   * @returns {Promise<Roll>} 굴림 결과
   */
  async rollAttack(options = {}) {
    if (this.type !== 'weapon') {
      console.error("CWN | 무기가 아닌 아이템으로 공격 굴림을 시도했습니다:", this.name, this.type);
      return null;
    }
    
    console.log(`CWN | 무기 공격 굴림 시작: ${this.name}`);
    
    // 액터가 없으면 굴림 불가
    if (!this.actor) {
      ui.notifications.warn(`${this.name}의 소유자가 없어 공격 굴림을 할 수 없습니다.`);
      return null;
    }
    
    // 장착 상태 확인
    if (!this.system.equipped) {
      ui.notifications.warn(`${this.name}이(가) 장착되어 있지 않습니다.`);
      console.log(`CWN | 무기가 장착되어 있지 않음: ${this.name}`);
      
      // 옵션에 따라 자동 장착
      if (options.autoEquip) {
        await this.toggleEquipped(true);
        console.log(`CWN | 무기 자동 장착됨: ${this.name}`);
      } else {
        return null;
      }
    }
    
    // 액터 데이터 가져오기
    const actorData = this.actor.getRollData();
    
    // 무기 데이터 가져오기
    const weaponData = this.system;
    
    // 공격 보너스 계산
    let attackBonus = 0;
    
    // 무기 유형에 따른 능력치 보너스 적용
    if (weaponData.attackAttribute) {
      const attrMod = actorData.attributes[weaponData.attackAttribute].mod;
      attackBonus += attrMod;
      console.log(`CWN | 능력치 보너스 적용: ${weaponData.attackAttribute} (${attrMod})`);
    } else {
      // 기본값: 근접 무기는 STR, 원거리 무기는 DEX 사용
      if (weaponData.range === 'melee') {
        attackBonus += actorData.attributes.str.mod;
        console.log(`CWN | 근접 무기 STR 보너스 적용: ${actorData.attributes.str.mod}`);
      } else {
        attackBonus += actorData.attributes.dex.mod;
        console.log(`CWN | 원거리 무기 DEX 보너스 적용: ${actorData.attributes.dex.mod}`);
      }
    }
    
    // 무기 보너스 적용
    if (weaponData.attackBonus) {
      attackBonus += parseInt(weaponData.attackBonus);
      console.log(`CWN | 무기 자체 보너스 적용: ${weaponData.attackBonus}`);
    }
    
    // 캐릭터 레벨 보너스 적용 (선택적)
    if (weaponData.useLevelBonus && actorData.level) {
      attackBonus += Math.floor(actorData.level / 2);
      console.log(`CWN | 레벨 보너스 적용: +${Math.floor(actorData.level / 2)}`);
    }
    
    // 최종 공격 보너스
    console.log(`CWN | 최종 공격 보너스: ${attackBonus}`);
    
    // 공격 굴림 수식 생성
    const formula = `1d20 + ${attackBonus}`;
    
    // 굴림 수행
    const roll = new Roll(formula, actorData);
    const result = await roll.evaluate({async: true});
    
    // 결과 메시지 생성
    let flavor = `<h2>${this.name} 공격 굴림</h2>`;
    
    // 크리티컬 및 실패 확인
    const d20Result = result.dice[0].results[0].result;
    if (d20Result === 20) {
      flavor += `<div class="dice-formula">${formula}</div>`;
      flavor += `<div class="dice-total critical">${result.total} (크리티컬!)</div>`;
    } else if (d20Result === 1) {
      flavor += `<div class="dice-formula">${formula}</div>`;
      flavor += `<div class="dice-total fumble">${result.total} (실패!)</div>`;
    } else {
      flavor += `<div class="dice-formula">${formula}</div>`;
      flavor += `<div class="dice-total">${result.total}</div>`;
    }
    
    // 채팅 메시지 전송
    await result.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: flavor,
      rollMode: game.settings.get('core', 'rollMode')
    });
    
    console.log(`CWN | 무기 공격 굴림 완료: ${this.name}, 결과: ${result.total}`);
    
    return result;
  }
  
  /**
   * 무기 피해 굴림 수행
   * @param {Object} options 옵션
   * @returns {Promise<Roll>} 굴림 결과
   */
  async rollDamage(options = {}) {
    if (this.type !== 'weapon') {
      console.error("CWN | 무기가 아닌 아이템으로 피해 굴림을 시도했습니다:", this.name, this.type);
      return null;
    }
    
    console.log(`CWN | 무기 피해 굴림 시작: ${this.name}`);
    
    // 액터가 없으면 굴림 불가
    if (!this.actor) {
      ui.notifications.warn(`${this.name}의 소유자가 없어 피해 굴림을 할 수 없습니다.`);
      return null;
    }
    
    // 장착 상태 확인
    if (!this.system.equipped && !options.ignoreEquipped) {
      ui.notifications.warn(`${this.name}이(가) 장착되어 있지 않습니다.`);
      console.log(`CWN | 무기가 장착되어 있지 않음: ${this.name}`);
      return null;
    }
    
    // 액터 데이터 가져오기
    const actorData = this.actor.getRollData();
    
    // 무기 데이터 가져오기
    const weaponData = this.system;
    
    // 피해 보너스 계산
    let damageBonus = 0;
    
    // 무기 유형에 따른 능력치 보너스 적용
    if (weaponData.damageAttribute) {
      const attrMod = actorData.attributes[weaponData.damageAttribute].mod;
      damageBonus += attrMod;
      console.log(`CWN | 피해 능력치 보너스 적용: ${weaponData.damageAttribute} (${attrMod})`);
    } else if (weaponData.range === 'melee') {
      // 기본값: 근접 무기만 STR 보너스 적용
      damageBonus += actorData.attributes.str.mod;
      console.log(`CWN | 근접 무기 STR 피해 보너스 적용: ${actorData.attributes.str.mod}`);
    }
    
    // 무기 보너스 적용
    if (weaponData.damageBonus) {
      damageBonus += parseInt(weaponData.damageBonus);
      console.log(`CWN | 무기 자체 피해 보너스 적용: ${weaponData.damageBonus}`);
    }
    
    // 피해 주사위 가져오기
    let damageDice = weaponData.damage || "1d6";
    
    // 피해 수식 생성
    let formula = damageDice;
    if (damageBonus !== 0) {
      formula += damageBonus >= 0 ? ` + ${damageBonus}` : ` - ${Math.abs(damageBonus)}`;
    }
    
    console.log(`CWN | 피해 수식: ${formula}`);
    
    // 굴림 수행
    const roll = new Roll(formula, actorData);
    const result = await roll.evaluate({async: true});
    
    // 결과 메시지 생성
    let flavor = `<h2>${this.name} 피해 굴림</h2>`;
    
    // 무기 태그 정보 추가
    if (Array.isArray(weaponData.tags) && weaponData.tags.length > 0) {
      flavor += `<div class="tags">태그: ${weaponData.tags.join(', ')}</div>`;
    }
    
    // 피해 유형 정보 추가
    if (weaponData.damageType) {
      flavor += `<div class="damage-type">피해 유형: ${weaponData.damageType}</div>`;
    }
    
    flavor += `<div class="dice-formula">${formula}</div>`;
    flavor += `<div class="dice-total">${result.total}</div>`;
    
    // 채팅 메시지 전송
    await result.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: flavor,
      rollMode: game.settings.get('core', 'rollMode')
    });
    
    console.log(`CWN | 무기 피해 굴림 완료: ${this.name}, 결과: ${result.total}`);
    
    return result;
  }
  
  /**
   * 아이템 복제 메서드
   * @returns {Promise<CWNItem>} 복제된 아이템
   */
  async duplicate() {
    console.log(`CWN | 아이템 복제 시작: ${this.name}`);
    
    // 아이템 데이터 복제
    const itemData = this.toObject();
    
    // 복제된 아이템 이름 수정
    itemData.name = `${itemData.name} (복사본)`;
    console.log(`CWN | 복제된 아이템 이름: ${itemData.name}`);
    
    // 새 아이템 생성
    let newItem;
    if (this.actor) {
      // 액터에 속한 아이템인 경우 해당 액터에 추가
      console.log(`CWN | 액터 ${this.actor.name}에 아이템 복제`);
      newItem = await this.actor.createEmbeddedDocuments("Item", [itemData]);
      newItem = newItem[0];
    } else {
      // 독립 아이템인 경우 월드 아이템으로 생성
      console.log(`CWN | 월드 아이템으로 복제`);
      newItem = await CWNItem.create(itemData);
    }
    
    console.log(`CWN | 아이템 복제 완료:`, newItem);
    return newItem;
  }

  /**
   * 아이템 카테고리 정의
   * @returns {Object} 아이템 카테고리 정의
   */
  static get categories() {
    return {
      weapon: {
        label: "CWN.ItemCategory.Weapon",
        types: ["weapon"],
        icon: "fas fa-sword"
      },
      armor: {
        label: "CWN.ItemCategory.Armor",
        types: ["armor"],
        icon: "fas fa-shield"
      },
      gear: {
        label: "CWN.ItemCategory.Gear",
        types: ["gear"],
        icon: "fas fa-backpack"
      },
      skill: {
        label: "CWN.ItemCategory.Skill",
        types: ["skill"],
        icon: "fas fa-book"
      },
      focus: {
        label: "CWN.ItemCategory.Focus",
        types: ["focus"],
        icon: "fas fa-eye"
      },
      tech: {
        label: "CWN.ItemCategory.Tech",
        types: ["cyberware", "drug"],
        icon: "fas fa-microchip"
      },
      asset: {
        label: "CWN.ItemCategory.Asset",
        types: ["asset"],
        icon: "fas fa-coins"
      },
      power: {
        label: "CWN.ItemCategory.Power",
        types: ["power"],
        icon: "fas fa-bolt"
      },
      vehicle: {
        label: "CWN.ItemCategory.Vehicle",
        types: ["vehicle"],
        icon: "fas fa-car"
      }
    };
  }
  
  /**
   * 아이템 태그 정의
   * @returns {Object} 아이템 태그 정의
   */
  static get tagCategories() {
    return {
      common: {
        label: "CWN.TagCategory.Common",
        tags: ["valuable", "rare", "heavy", "light", "fragile"]
      },
      weapon: {
        label: "CWN.TagCategory.Weapon",
        tags: ["melee", "ranged", "thrown", "reload", "burst", "blast", "shock"]
      },
      armor: {
        label: "CWN.TagCategory.Armor",
        tags: ["light", "medium", "heavy", "powered", "sealed", "stealthy"]
      },
      tech: {
        label: "CWN.TagCategory.Tech",
        tags: ["implant", "external", "illegal", "military", "medical", "utility"]
      }
    };
  }
  
  /**
   * 아이템 필터링 메서드
   * @param {Array} items 필터링할 아이템 배열
   * @param {Object} filters 필터 옵션
   * @returns {Array} 필터링된 아이템 배열
   */
  static filterItems(items, filters = {}) {
    console.log("CWN | 아이템 필터링 시작:", filters);
    
    // 필터가 없으면 원본 배열 반환
    if (!filters || Object.keys(filters).length === 0) {
      return items;
    }
    
    // 필터링 로직
    let filtered = [...items];
    
    // 타입 필터
    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter(item => filters.types.includes(item.type));
      console.log(`CWN | 타입 필터 적용 후 아이템 수: ${filtered.length}`);
    }
    
    // 카테고리 필터
    if (filters.categories && filters.categories.length > 0) {
      const validTypes = [];
      filters.categories.forEach(cat => {
        if (this.categories[cat]) {
          validTypes.push(...this.categories[cat].types);
        }
      });
      
      if (validTypes.length > 0) {
        filtered = filtered.filter(item => validTypes.includes(item.type));
        console.log(`CWN | 카테고리 필터 적용 후 아이템 수: ${filtered.length}`);
      }
    }
    
    // 태그 필터
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(item => {
        const itemTags = item.system.tags || [];
        return filters.tags.some(tag => itemTags.includes(tag));
      });
      console.log(`CWN | 태그 필터 적용 후 아이템 수: ${filtered.length}`);
    }
    
    // 검색어 필터
    if (filters.search && filters.search.trim() !== "") {
      const search = filters.search.toLowerCase().trim();
      filtered = filtered.filter(item => {
        const name = item.name.toLowerCase();
        const desc = (item.system.description || "").toLowerCase();
        return name.includes(search) || desc.includes(search);
      });
      console.log(`CWN | 검색어 필터 적용 후 아이템 수: ${filtered.length}`);
    }
    
    // 장착 상태 필터
    if (filters.equipped !== undefined) {
      filtered = filtered.filter(item => {
        return (item.system.equipped === true) === filters.equipped;
      });
      console.log(`CWN | 장착 상태 필터 적용 후 아이템 수: ${filtered.length}`);
    }
    
    console.log("CWN | 아이템 필터링 완료:", filtered);
    return filtered;
  }
  
  /**
   * 아이템 정렬 메서드
   * @param {Array} items 정렬할 아이템 배열
   * @param {Object} sortOptions 정렬 옵션
   * @returns {Array} 정렬된 아이템 배열
   */
  static sortItems(items, sortOptions = {}) {
    console.log("CWN | 아이템 정렬 시작:", sortOptions);
    
    // 정렬 옵션이 없으면 원본 배열 반환
    if (!sortOptions || Object.keys(sortOptions).length === 0) {
      return items;
    }
    
    // 정렬 로직
    const sorted = [...items];
    
    // 정렬 필드와 방향
    const field = sortOptions.field || "name";
    const direction = sortOptions.direction || "asc";
    const dirMod = direction === "asc" ? 1 : -1;
    
    sorted.sort((a, b) => {
      let aValue, bValue;
      
      // 필드에 따른 값 추출
      if (field === "name") {
        aValue = a.name;
        bValue = b.name;
      } else if (field === "type") {
        aValue = a.type;
        bValue = b.type;
      } else if (field.startsWith("system.")) {
        const systemField = field.substring(7);
        aValue = foundry.utils.getProperty(a.system, systemField);
        bValue = foundry.utils.getProperty(b.system, systemField);
      }
      
      // 값 비교
      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * dirMod;
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * dirMod;
      } else {
        return 0;
      }
    });
    
    console.log("CWN | 아이템 정렬 완료:", sorted);
    return sorted;
  }
  
  /**
   * 아이템을 카테고리별로 그룹화하는 메서드
   * @param {Array} items 그룹화할 아이템 배열
   * @returns {Object} 카테고리별로 그룹화된 아이템
   */
  static groupItemsByCategory(items) {
    console.log("CWN | 아이템 카테고리별 그룹화 시작");
    
    const grouped = {};
    
    // 카테고리 초기화
    Object.keys(this.categories).forEach(cat => {
      grouped[cat] = {
        label: this.categories[cat].label,
        icon: this.categories[cat].icon,
        items: []
      };
    });
    
    // 아이템 분류
    items.forEach(item => {
      // 아이템 타입에 맞는 카테고리 찾기
      const category = Object.keys(this.categories).find(cat => 
        this.categories[cat].types.includes(item.type)
      );
      
      if (category) {
        grouped[category].items.push(item);
      }
    });
    
    // 빈 카테고리 제거 옵션
    // Object.keys(grouped).forEach(cat => {
    //   if (grouped[cat].items.length === 0) {
    //     delete grouped[cat];
    //   }
    // });
    
    console.log("CWN | 아이템 카테고리별 그룹화 완료:", grouped);
    return grouped;
  }

  /**
   * 아이템 장착 상태 토글
   * @param {boolean} equipped 장착 상태 (true: 장착, false: 해제)
   * @returns {Promise<Item>} 업데이트된 아이템
   */
  async toggleEquipped(equipped = undefined) {
    console.log(`CWN | 아이템 장착 상태 토글 시작: ${this.name}`);
    
    // 현재 장착 상태 확인
    const currentEquipped = this.system.equipped || false;
    
    // 새 장착 상태 결정 (파라미터가 없으면 현재 상태 반전)
    const newEquipped = equipped !== undefined ? equipped : !currentEquipped;
    
    console.log(`CWN | 아이템 장착 상태 변경: ${this.name} (${currentEquipped} -> ${newEquipped})`);
    
    // 아이템 업데이트
    const updated = await this.update({'system.equipped': newEquipped});
    
    // 소유자가 있는 경우 효과 적용
    if (this.actor) {
      // 아이템 자체 효과 적용
      await this._applyEquipmentEffects(newEquipped);
      
      // 액터의 모든 장착 아이템 효과 재계산
      await this.actor.calculateEquippedItemEffects();
    }
    
    return updated;
  }
  
  /**
   * 장착 효과 적용
   * @param {boolean} isEquipped 장착 여부
   * @private
   */
  async _applyEquipmentEffects(isEquipped) {
    console.log(`CWN | 장착 효과 적용: ${this.name} (장착: ${isEquipped})`);
    
    // 아이템 타입별 효과 적용
    switch (this.type) {
      case 'armor':
        await this._applyArmorEffects(isEquipped);
        break;
      case 'weapon':
        await this._applyWeaponEffects(isEquipped);
        break;
      case 'cyberware':
        await this._applyCyberwareEffects(isEquipped);
        break;
      default:
        // 기타 아이템 타입은 특별한 효과 없음
        console.log(`CWN | ${this.type} 타입은 장착 효과가 없습니다.`);
        break;
    }
    
    // 액티브 이펙트 적용 (향후 확장)
    this._toggleActiveEffects(isEquipped);
  }
  
  /**
   * 방어구 효과 적용
   * @param {boolean} isEquipped 장착 여부
   * @private
   */
  async _applyArmorEffects(isEquipped) {
    if (!this.actor) return;
    
    const armorData = this.system;
    console.log(`CWN | 방어구 효과 적용: ${this.name}, AC: ${armorData.ac}`);
    
    // 액터의 현재 AC 계산
    const actorData = this.actor.system;
    let baseAC = 10; // 기본 AC
    
    // 민첩 보너스 적용
    const dexMod = actorData.attributes.dex.mod;
    
    // 장착된 모든 방어구 가져오기
    const equippedArmors = this.actor.items.filter(i => 
      i.type === 'armor' && 
      i.system.equipped && 
      i._id !== this._id // 현재 아이템 제외
    );
    
    // 가장 높은 AC 값을 가진 방어구 찾기
    let highestAC = 0;
    equippedArmors.forEach(armor => {
      if (armor.system.ac > highestAC) {
        highestAC = armor.system.ac;
      }
    });
    
    // 현재 아이템이 장착되고 AC가 더 높으면 사용
    if (isEquipped && armorData.ac > highestAC) {
      highestAC = armorData.ac;
    }
    
    // 최종 AC 계산
    let finalAC = baseAC + dexMod;
    if (highestAC > 0) {
      finalAC = highestAC + (armorData.allowDex ? Math.min(dexMod, armorData.maxDex || 0) : 0);
    }
    
    console.log(`CWN | 최종 AC 계산: ${finalAC} (기본: ${baseAC}, 방어구: ${highestAC}, 민첩: ${dexMod})`);
    
    // 액터 데이터 업데이트
    await this.actor.update({
      'system.ac.value': finalAC
    });
  }
  
  /**
   * 무기 효과 적용
   * @param {boolean} isEquipped 장착 여부
   * @private
   */
  async _applyWeaponEffects(isEquipped) {
    if (!this.actor) return;
    
    const weaponData = this.system;
    console.log(`CWN | 무기 효과 적용: ${this.name}, 피해: ${weaponData.damage}`);
    
    // 무기 장착 시 효과 (예: 전투 준비 상태 등)
    // 현재는 특별한 효과 없이 로깅만 수행
    
    // 무기 태그에 따른 특수 효과 적용 (향후 확장)
    if (Array.isArray(weaponData.tags)) {
      weaponData.tags.forEach(tag => {
        console.log(`CWN | 무기 태그 효과 검사: ${tag}`);
        // 태그별 효과 적용 로직 (향후 구현)
      });
    }
  }
  
  /**
   * 사이버웨어 효과 적용
   * @param {boolean} isEquipped 장착 여부
   * @private
   */
  async _applyCyberwareEffects(isEquipped) {
    if (!this.actor) return;
    
    const cyberwareData = this.system;
    console.log(`CWN | 사이버웨어 효과 적용: ${this.name}, 시스템 스트레인: ${cyberwareData.systemStrain}`);
    
    // 현재 시스템 스트레인 값 가져오기
    const currentStrain = this.actor.system.systemStrain.value;
    
    // 장착/해제에 따른 시스템 스트레인 조정
    let newStrain = currentStrain;
    if (isEquipped) {
      // 장착 시 스트레인 증가
      newStrain += (cyberwareData.systemStrain || 0);
    } else {
      // 해제 시 스트레인 감소
      newStrain -= (cyberwareData.systemStrain || 0);
    }
    
    // 음수 방지
    newStrain = Math.max(0, newStrain);
    
    console.log(`CWN | 시스템 스트레인 조정: ${currentStrain} -> ${newStrain}`);
    
    // 액터 데이터 업데이트
    await this.actor.update({
      'system.systemStrain.value': newStrain
    });
    
    // 사이버웨어 능력치 보너스 적용 (향후 확장)
    if (cyberwareData.attributeBonus) {
      // 능력치 보너스 적용 로직 (향후 구현)
    }
  }
  
  /**
   * 액티브 이펙트 토글
   * @param {boolean} isActive 활성화 여부
   * @private
   */
  _toggleActiveEffects(isActive) {
    // 아이템에 정의된 액티브 이펙트 가져오기
    const effects = this.effects;
    if (!effects || effects.size === 0) return;
    
    console.log(`CWN | 액티브 이펙트 토글: ${this.name}, 효과 수: ${effects.size}, 활성화: ${isActive}`);
    
    // 각 이펙트 활성화/비활성화
    effects.forEach(effect => {
      if (effect.transfer) {
        console.log(`CWN | 이펙트 상태 변경: ${effect.label} (${effect.disabled} -> ${!isActive})`);
        effect.update({disabled: !isActive});
      }
    });
  }

  /**
   * 차량 아이템 데이터 준비
   * @param {Object} itemData 아이템 데이터
   * @private
   */
  _prepareVehicleData(itemData) {
    // 시스템 데이터가 없으면 초기화
    if (!itemData.system) {
      itemData.system = {};
    }
    
    const data = itemData.system;
    
    // 기본값 설정
    if (!data.type) {
      data.type = "ground";
    }
    
    if (data.speed === undefined) {
      data.speed = 0;
    }
    
    if (data.armor === undefined) {
      data.armor = 0;
    }
    
    if (!data.hp) {
      data.hp = { value: 10, max: 10 };
    }
    
    if (data.crew === undefined) {
      data.crew = 1;
    }
    
    if (data.price === undefined) {
      data.price = 0;
    }
    
    // 태그 배열 확인
    if (!Array.isArray(data.tags)) {
      data.tags = [];
    }
  }
  
  /**
   * 능력 아이템 데이터 준비
   * @param {Object} itemData 아이템 데이터
   * @private
   */
  _preparePowerData(itemData) {
    // 시스템 데이터가 없으면 초기화
    if (!itemData.system) {
      itemData.system = {};
    }
    
    const data = itemData.system;
    
    // 기본값 설정
    if (data.level === undefined) {
      data.level = 1;
    }
    
    if (!data.type) {
      data.type = "psychic";
    }
    
    if (data.cost === undefined) {
      data.cost = 0;
    }
    
    if (!data.range) {
      data.range = "self";
    }
    
    if (!data.duration) {
      data.duration = "instant";
    }
    
    // 태그 배열 확인
    if (!Array.isArray(data.tags)) {
      data.tags = [];
    }
  }
  
  /**
   * 약물 아이템 데이터 준비
   * @param {Object} itemData 아이템 데이터
   * @private
   */
  _prepareDrugData(itemData) {
    // 시스템 데이터가 없으면 초기화
    if (!itemData.system) {
      itemData.system = {};
    }
    
    const data = itemData.system;
    
    // 기본값 설정
    if (!data.duration) {
      data.duration = "1 hour";
    }
    
    if (!data.type) {
      data.type = "medical";
    }
    
    if (data.price === undefined) {
      data.price = 0;
    }
    
    if (data.quantity === undefined) {
      data.quantity = 1;
    }
    
    if (!data.effect) {
      data.effect = "";
    }
    
    if (!data.sideEffect) {
      data.sideEffect = "";
    }
    
    if (!data.overdose) {
      data.overdose = "";
    }
    
    // 태그 배열 확인
    if (!Array.isArray(data.tags)) {
      data.tags = [];
    }
  }
  
  /**
   * 장비 아이템 데이터 준비
   * @param {Object} itemData 아이템 데이터
   * @private
   */
  _prepareGearData(itemData) {
    // 시스템 데이터가 없으면 초기화
    if (!itemData.system) {
      itemData.system = {};
    }
    
    const data = itemData.system;
    
    // 기본값 설정
    if (data.quantity === undefined) {
      data.quantity = 1;
    }
    
    if (data.weight === undefined) {
      data.weight = 0.1;
    }
    
    if (data.price === undefined) {
      data.price = 0;
    }
    
    if (!data.location) {
      data.location = "stowed";
    }
    
    if (!data.type) {
      data.type = "general";
    }
    
    // 태그 배열 확인
    if (!Array.isArray(data.tags)) {
      data.tags = [];
    }
  }
} 