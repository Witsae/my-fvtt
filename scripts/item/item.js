/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class CWNItem extends Item {
  /**
   * 아이템 생성 메서드 오버라이드
   * @override
   */
  static async create(data, options = {}) {
    console.log("CWN | CWNItem.create 호출됨:", data, options);
    
    // 부모 클래스의 create 메서드 호출
    console.log("CWN | 부모 클래스의 create 메서드 호출");
    const item = await super.create(data, options);
    
    // 생성된 아이템 로깅
    console.log("CWN | 아이템 생성 완료:", item);
    
    return item;
  }
  
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
    
    // 아이템 타입별 데이터 준비
    const itemData = this;
    const systemData = itemData.system;
    const flags = itemData.flags;
    
    // 아이템 타입별 준비 메서드 호출
    this._prepareItemData(itemData);
  }

  /**
   * 아이템 타입별 데이터 준비
   * @param {Object} itemData 아이템 데이터
   * @private
   */
  _prepareItemData(itemData) {
    if (itemData.type === 'weapon') {
      this._prepareWeaponData(itemData);
    } else if (itemData.type === 'armor') {
      this._prepareArmorData(itemData);
    } else if (itemData.type === 'skill') {
      this._prepareSkillData(itemData);
    } else if (itemData.type === 'focus') {
      this._prepareFocusData(itemData);
    } else if (itemData.type === 'cyberware') {
      this._prepareCyberwareData(itemData);
    } else if (itemData.type === 'asset') {
      this._prepareAssetData(itemData);
    }
  }
  
  /**
   * 무기 아이템 데이터 준비
   * @param {Object} itemData 아이템 데이터
   * @private
   */
  _prepareWeaponData(itemData) {
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
   * 아이템 굴림 처리
   * @param {Object} options 옵션
   */
  async roll(options = {}) {
    // 아이템 타입별 굴림 처리
    if (this.type === 'weapon') {
      return this._rollWeapon(options);
    } else if (this.type === 'skill') {
      return this._rollSkill(options);
    } else if (this.type === 'focus') {
      return this._rollFocus(options);
    } else if (this.type === 'asset') {
      return this._rollAsset(options);
    } else {
      // 기본 아이템 정보 표시
      return this._displayItemInfo(options);
    }
  }
  
  /**
   * 무기 공격 굴림
   * @param {Object} options 옵션
   * @private
   */
  async _rollWeapon(options = {}) {
    // 액터 확인
    const actor = this.actor;
    if (!actor) {
      ui.notifications.warn(game.i18n.localize("CWN.Errors.NoActor"));
      return null;
    }
    
    // 탄약 확인 (원거리 무기인 경우)
    const isRanged = this.system.range && this.system.range !== "melee";
    if (isRanged && this.system.ammo && this.system.ammo.max > 0) {
      if (this.system.ammo.value <= 0) {
        ui.notifications.warn(game.i18n.format("CWN.Errors.NoAmmo", {name: this.name}));
        return null;
      }
    }
    
    // 공격 보너스 계산
    const attackBonus = this.system.attackBonus || 0;
    const attributeMod = actor.system.attributes[this.system.attribute || "str"].mod;
    const totalBonus = attackBonus + attributeMod;
    
    // 공격 굴림 수식
    const formula = `1d20 + ${totalBonus}`;
    
    // 무기 타입 결정
    const weaponType = isRanged ? 
      game.i18n.localize(CONFIG.CWN.weaponRanges[this.system.range]) : 
      game.i18n.localize("CWN.WeaponRangeMelee");
    
    // 공격 라벨
    const label = game.i18n.format("CWN.Chat.WeaponAttack", {
      name: this.name,
      type: weaponType
    });
    
    // 공격 굴림 대화상자
    const rollDialog = await new Promise(resolve => {
      new Dialog({
        title: game.i18n.format("CWN.Dialogs.WeaponAttack", {name: this.name}),
        content: `
          <form>
            <div class="form-group">
              <label>${game.i18n.localize("CWN.AttackBonus")}:</label>
              <input type="number" name="bonus" value="0">
            </div>
            <div class="form-group">
              <label>${game.i18n.localize("CWN.Burst")}:</label>
              <input type="checkbox" name="burst" ${this.system.tags.includes("burst") ? "" : "disabled"}>
            </div>
          </form>
        `,
        buttons: {
          roll: {
            icon: '<i class="fas fa-dice-d20"></i>',
            label: game.i18n.localize("CWN.Dialogs.Roll"),
            callback: html => resolve(html.find('[name=bonus]').val())
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("CWN.Dialogs.Cancel"),
            callback: () => resolve(null)
          }
        },
        default: "roll"
      }).render(true);
    });
    
    if (rollDialog === null) return null;
    
    // 추가 보너스 적용
    const extraBonus = parseInt(rollDialog) || 0;
    const finalFormula = `1d20 + ${totalBonus + extraBonus}`;
    
    // 주사위 굴림
    const roll = await new Roll(finalFormula).evaluate({async: true});
    
    // 탄약 감소 (원거리 무기인 경우)
    if (isRanged && this.system.ammo && this.system.ammo.max > 0) {
      await this.update({"system.ammo.value": Math.max(this.system.ammo.value - 1, 0)});
    }
    
    // 채팅 메시지 생성
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({actor: actor}),
      flavor: label,
      rollMode: options.rollMode || game.settings.get("core", "rollMode"),
      sound: CONFIG.sounds.dice
    };
    
    // 피해 버튼 추가
    const damageFormula = this.system.damage;
    if (damageFormula) {
      chatData.content = `
        <div class="card-buttons">
          <button data-action="damage" data-formula="${damageFormula}">${game.i18n.localize("CWN.Damage")}</button>
        </div>
      `;
    }
    
    // 채팅 메시지 생성
    if (roll) {
      chatData.roll = roll;
      return ChatMessage.create(chatData);
    }
    
    return null;
  }
  
  /**
   * 기술 굴림
   * @param {Object} options 옵션
   * @private
   */
  async _rollSkill(options = {}) {
    // 액터 확인
    const actor = this.actor;
    if (!actor) {
      ui.notifications.warn(game.i18n.localize("CWN.Errors.NoActor"));
      return null;
    }
    
    // 캐릭터 확인
    if (actor.type !== "character" && actor.type !== "npc") {
      ui.notifications.warn(game.i18n.localize("CWN.Errors.NonCharacter"));
      return null;
    }
    
    // 기술 레벨 및 속성 수정치 가져오기
    const skillLevel = this.system.level || 0;
    const attribute = this.system.attribute || "int";
    const attributeMod = actor.system.attributes[attribute].mod;
    
    // 기술 굴림 수식 결정
    let formula = "2d6";
    if (skillLevel >= 3) formula = "3d6kh2"; // 3d6 중 높은 2개
    if (skillLevel >= 5) formula = "4d6kh2"; // 4d6 중 높은 2개
    
    // 기술 레벨 및 속성 수정치 추가
    formula += ` + ${skillLevel} + ${attributeMod}`;
    
    // 기술 라벨
    const label = game.i18n.format("CWN.SkillCheck", {skill: this.name});
    
    // 기술 굴림 대화상자
    const rollDialog = await new Promise(resolve => {
      new Dialog({
        title: game.i18n.format("CWN.Dialogs.SkillRoll", {name: this.name}),
        content: `
          <form>
            <div class="form-group">
              <label>${game.i18n.localize("CWN.SkillBonus")}:</label>
              <input type="number" name="bonus" value="0">
            </div>
          </form>
        `,
        buttons: {
          roll: {
            icon: '<i class="fas fa-dice-d20"></i>',
            label: game.i18n.localize("CWN.Dialogs.Roll"),
            callback: html => resolve(html.find('[name=bonus]').val())
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("CWN.Dialogs.Cancel"),
            callback: () => resolve(null)
          }
        },
        default: "roll"
      }).render(true);
    });
    
    if (rollDialog === null) return null;
    
    // 추가 보너스 적용
    const extraBonus = parseInt(rollDialog) || 0;
    const finalFormula = `${formula} + ${extraBonus}`;
    
    // 주사위 굴림
    const roll = await new Roll(finalFormula).evaluate({async: true});
    
    // 채팅 메시지 생성
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({actor: actor}),
      flavor: label,
      rollMode: options.rollMode || game.settings.get("core", "rollMode"),
      sound: CONFIG.sounds.dice
    };
    
    // 채팅 메시지 생성
    if (roll) {
      chatData.roll = roll;
      return ChatMessage.create(chatData);
    }
    
    return null;
  }
  
  /**
   * 특성 정보 표시
   * @param {Object} options 옵션
   * @private
   */
  async _rollFocus(options = {}) {
    // 액터 확인
    const actor = this.actor;
    if (!actor) {
      ui.notifications.warn(game.i18n.localize("CWN.Errors.NoActor"));
      return null;
    }
    
    // 특성 정보 생성
    const description = this.system.description || game.i18n.localize("CWN.Chat.NoDescription");
    const level1Effect = this.system.levelEffects?.level1 || "";
    const level2Effect = this.system.levelEffects?.level2 || "";
    
    // 채팅 메시지 내용
    const content = `
      <div class="cwn chat-card">
        <h2>${this.name}</h2>
        <div class="card-content">
          <p>${description}</p>
          ${level1Effect ? `<p><strong>${game.i18n.localize("CWN.Chat.Level1")}:</strong> ${level1Effect}</p>` : ""}
          ${level2Effect ? `<p><strong>${game.i18n.localize("CWN.Chat.Level2")}:</strong> ${level2Effect}</p>` : ""}
        </div>
      </div>
    `;
    
    // 채팅 메시지 생성
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({actor: actor}),
      content: content,
      rollMode: options.rollMode || game.settings.get("core", "rollMode")
    };
    
    return ChatMessage.create(chatData);
  }
  
  /**
   * 자산 액션 굴림
   * @param {Object} options 옵션
   * @private
   */
  async _rollAsset(options = {}) {
    // 액터 확인
    const actor = this.actor;
    if (!actor) {
      ui.notifications.warn(game.i18n.localize("CWN.Errors.NoActor"));
      return null;
    }
    
    // 세력 확인
    if (actor.type !== "faction") {
      ui.notifications.warn(game.i18n.localize("CWN.Errors.AssetFaction"));
      return null;
    }
    
    // 자산 정보 생성
    const description = this.system.description || "";
    const rating = this.system.rating || 1;
    const type = this.system.type || "military";
    
    // 자산 액션 대화상자
    const actionType = await new Promise(resolve => {
      new Dialog({
        title: game.i18n.format("CWN.Dialogs.AssetAction", {name: this.name}),
        content: `
          <form>
            <div class="form-group">
              <label>${game.i18n.localize("CWN.Dialogs.Action")}:</label>
              <select name="action">
                <option value="attack">${game.i18n.localize("CWN.Dialogs.Attack")}</option>
                <option value="defense">${game.i18n.localize("CWN.Dialogs.Defense")}</option>
                <option value="info">${game.i18n.localize("CWN.Dialogs.Info")}</option>
              </select>
            </div>
          </form>
        `,
        buttons: {
          roll: {
            icon: '<i class="fas fa-dice-d20"></i>',
            label: game.i18n.localize("CWN.Dialogs.Roll"),
            callback: html => resolve(html.find('[name=action]').val())
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("CWN.Dialogs.Cancel"),
            callback: () => resolve(null)
          }
        },
        default: "roll"
      }).render(true);
    });
    
    if (actionType === null) return null;
    
    // 액션 타입에 따른 처리
    if (actionType === "info") {
      // 자산 정보 표시
      return this._displayItemInfo(options);
    } else if (actionType === "attack" || actionType === "defense") {
      // 공격 또는 방어 굴림
      const formula = `1d6 + ${rating}`;
      const roll = await new Roll(formula).evaluate({async: true});
      
      // 채팅 메시지 생성
      const chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({actor: actor}),
        flavor: `${this.name} - ${actionType === "attack" ? game.i18n.localize("CWN.Dialogs.Attack") : game.i18n.localize("CWN.Dialogs.Defense")}`,
        rollMode: options.rollMode || game.settings.get("core", "rollMode"),
        sound: CONFIG.sounds.dice
      };
      
      // 채팅 메시지 생성
      if (roll) {
        chatData.roll = roll;
        return ChatMessage.create(chatData);
      }
    }
    
    return null;
  }
  
  /**
   * 아이템 정보 표시
   * @param {Object} options 옵션
   * @private
   */
  async _displayItemInfo(options = {}) {
    // 액터 확인
    const actor = this.actor;
    
    // 아이템 정보 생성
    const description = this.system.description || "";
    
    // 아이템 타입별 추가 정보
    let additionalInfo = "";
    
    if (this.type === "weapon") {
      additionalInfo = `
        <p><strong>${game.i18n.localize("CWN.Damage")}:</strong> ${this.system.damage}</p>
        <p><strong>${game.i18n.localize("CWN.Range")}:</strong> ${game.i18n.localize(CONFIG.CWN.weaponRanges[this.system.range] || "CWN.WeaponRangeMelee")}</p>
      `;
    } else if (this.type === "armor") {
      additionalInfo = `
        <p><strong>${game.i18n.localize("CWN.AC")}:</strong> ${this.system.ac}</p>
        <p><strong>${game.i18n.localize("CWN.Chat.MeleeAC")}:</strong> ${this.system.meleeAC}</p>
      `;
    } else if (this.type === "cyberware") {
      additionalInfo = `
        <p><strong>${game.i18n.localize("CWN.Chat.SystemStrain")}:</strong> ${this.system.systemStrain}</p>
      `;
    }
    
    // 태그 정보 추가
    if (this.system.tags && this.system.tags.length > 0) {
      additionalInfo += `<p><strong>${game.i18n.localize("CWN.Tags")}:</strong> ${this.system.tags.join(", ")}</p>`;
    }
    
    // 채팅 메시지 내용
    const content = `
      <div class="cwn chat-card">
        <h2>${this.name}</h2>
        <div class="card-content">
          ${additionalInfo}
          <p>${description}</p>
        </div>
      </div>
    `;
    
    // 채팅 메시지 생성
    const chatData = {
      user: game.user.id,
      speaker: actor ? ChatMessage.getSpeaker({actor: actor}) : ChatMessage.getSpeaker(),
      content: content,
      rollMode: options.rollMode || game.settings.get("core", "rollMode")
    };
    
    return ChatMessage.create(chatData);
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
} 