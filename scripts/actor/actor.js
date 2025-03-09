/**
 * Extend the base Actor document for CWN.
 * @extends {Actor}
 */
export class CWNActor extends Actor {

  /** @override */
  prepareData() {
    super.prepareData();

    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags;

    // 액터 타입별 데이터 준비
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
    this._prepareFactionData(actorData);
    
    // 장착된 아이템 효과 계산 (비동기 함수이므로 결과를 기다리지 않음)
    // 실제 효과는 calculateEquippedItemEffects 메서드에서 비동기적으로 적용됨
    if (this.type === 'character' || this.type === 'npc') {
      this.calculateEquippedItemEffects().catch(err => {
        console.error(`CWN | 장착된 아이템 효과 계산 중 오류 발생:`, err);
      });
    }
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    const systemData = actorData.system;

    // Calculate attribute modifiers
    for (let [key, attribute] of Object.entries(systemData.attributes)) {
      attribute.mod = Math.floor((attribute.value - 10) / 2);
    }

    // Calculate max health
    systemData.health.max = systemData.level * 4 + systemData.attributes.con.mod;
    if (systemData.health.max < 1) systemData.health.max = 1;

    // Calculate max sanity if enabled
    try {
      const enableSanity = game.settings.get("cwn-system", "enableSanity");
      if (enableSanity) {
        systemData.sanity.max = 10 + systemData.attributes.wis.mod;
        if (systemData.sanity.max < 1) systemData.sanity.max = 1;
      }
    } catch (error) {
      console.warn("CWN | Error accessing enableSanity setting, defaulting to enabled:", error);
      // Default behavior if setting is not available
      systemData.sanity.max = 10 + systemData.attributes.wis.mod;
      if (systemData.sanity.max < 1) systemData.sanity.max = 1;
    }

    // Calculate max system strain
    systemData.systemStrain.max = systemData.attributes.con.value / 2;
    if (systemData.systemStrain.max < 1) systemData.systemStrain.max = 1;
    
    // Calculate cyberware strain
    const cyberware = this.items.filter(i => i.type === "cyberware");
    let cyberwareStrain = 0;
    
    // Sum up cyberware strain
    cyberwareStrain = cyberware.reduce((total, item) => total + Number(item.system.systemStrain), 0);
    
    systemData.systemStrain.max -= cyberwareStrain;
    systemData.systemStrain.cyberware = cyberwareStrain;

    // Calculate saves
    systemData.saves.physical = 15 - systemData.level - Math.max(systemData.attributes.str.mod, systemData.attributes.con.mod);
    systemData.saves.evasion = 15 - systemData.level - Math.max(systemData.attributes.dex.mod, systemData.attributes.int.mod);
    systemData.saves.mental = 15 - systemData.level - Math.max(systemData.attributes.wis.mod, systemData.attributes.cha.mod);
    systemData.saves.luck = 15 - systemData.level;

    // Ensure saves are not below 2
    for (let [key, save] of Object.entries(systemData.saves)) {
      if (save < 2) systemData.saves[key] = 2;
    }

    // Calculate max effort
    systemData.effort.max = 1 + Math.floor(systemData.level / 3);
    if (systemData.effort.max < 1) systemData.effort.max = 1;
  }

  /**
   * Prepare NPC type specific data
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    const systemData = actorData.system;

    // Calculate attribute modifiers
    for (let [key, attribute] of Object.entries(systemData.attributes)) {
      attribute.mod = Math.floor((attribute.value - 10) / 2);
    }

    // Calculate max health if not set
    if (!systemData.health.max) {
      systemData.health.max = 4 + systemData.attributes.con.mod;
      if (systemData.health.max < 1) systemData.health.max = 1;
    }
  }

  /**
   * Prepare Faction type specific data
   */
  _prepareFactionData(actorData) {
    if (actorData.type !== 'faction') return;

    const systemData = actorData.system;

    // Calculate faction HP
    systemData.hp.max = systemData.force + systemData.cunning + systemData.wealth;
  }

  /**
   * Override getRollData() to include items as d.items
   */
  getRollData() {
    const data = super.getRollData();
    
    // Include items data for macros
    data.items = this.items.map(i => i.system);
    
    // Add itemTypes for easier access
    data.itemTypes = {};
    // 이전 코드: Object.groupBy 사용
    // for (let [key, items] of Object.groupBy(this.items, i => i.type)) {
    //   data.itemTypes[key] = items.map(i => i.system);
    // }
    
    // 새로운 코드: 수동으로 그룹화
    const itemsByType = {};
    this.items.forEach(item => {
      if (!itemsByType[item.type]) {
        itemsByType[item.type] = [];
      }
      itemsByType[item.type].push(item);
    });
    
    // 그룹화된 아이템을 data.itemTypes에 추가
    Object.entries(itemsByType).forEach(([key, items]) => {
      data.itemTypes[key] = items.map(i => i.system);
    });
    
    return data;
  }

  /**
   * Roll a skill check
   * @param {string} skillId   The skill id (e.g. "athletics")
   * @param {Object} options   Options which configure how the skill check is rolled
   */
  async rollSkill(skillId, options = {}) {
    const skill = this.items.find(i => i.type === "skill" && i.name.toLowerCase() === skillId.toLowerCase());
    
    if (!skill) {
      ui.notifications.warn(`${this.name} does not have the ${skillId} skill.`);
      return null;
    }

    const label = game.i18n.format("CWN.SkillCheck", {skill: skill.name});
    const attribute = skill.system.attribute;
    const attributeMod = this.system.attributes[attribute]?.mod || 0;
    const skillLevel = skill.system.level || 0;

    // Determine the dice to roll based on skill level
    let formula = "2d6";
    if (skillLevel >= 3) formula = "3d6kh2"; // Roll 3d6, keep highest 2
    if (skillLevel >= 5) formula = "4d6kh2"; // Roll 4d6, keep highest 2

    // Add skill level and attribute modifier
    formula += ` + ${skillLevel} + ${attributeMod}`;

    // Roll the dice
    const roll = await new Roll(formula).evaluate({async: true});

    // Prepare chat data
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({actor: this}),
      flavor: label,
      rollMode: options.rollMode || game.settings.get("core", "rollMode"),
      sound: CONFIG.sounds.dice
    };

    // Create the chat message
    if (roll) {
      chatData.roll = roll;
      return ChatMessage.create(chatData);
    }
    
    return null;
  }

  /**
   * Roll a saving throw
   * @param {string} saveId    The save id (e.g. "physical")
   * @param {Object} options   Options which configure how the save is rolled
   */
  async rollSave(saveId, options = {}) {
    const save = this.system.saves[saveId];
    
    if (save === undefined) {
      ui.notifications.warn(`${this.name} does not have a ${saveId} save.`);
      return null;
    }

    const label = game.i18n.format("CWN.SaveCheck", {save: game.i18n.localize(`CWN.Save${saveId.capitalize()}`)});
    
    // Roll the dice
    const roll = await new Roll("1d20").evaluate({async: true});
    
    // Determine success or failure
    const success = roll.total >= save;
    const resultLabel = success ? game.i18n.localize("CWN.Success") : game.i18n.localize("CWN.Failure");
    const flavor = `${label} (${save}) - ${resultLabel}`;

    // Prepare chat data
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({actor: this}),
      flavor: flavor,
      rollMode: options.rollMode || game.settings.get("core", "rollMode"),
      sound: CONFIG.sounds.dice
    };

    // Create the chat message
    if (roll) {
      chatData.roll = roll;
      return ChatMessage.create(chatData);
    }
    
    return null;
  }

  /**
   * Roll a morale check for NPCs
   * @param {Object} options   Options which configure how the morale check is rolled
   */
  async rollMorale(options = {}) {
    if (this.type !== "npc") {
      ui.notifications.warn(`${this.name} is not an NPC and cannot make morale checks.`);
      return null;
    }

    const morale = this.system.morale;
    const label = game.i18n.localize("CWN.MoraleCheck");
    
    // Roll the dice
    const roll = await new Roll("2d6").evaluate({async: true});
    
    // Determine success or failure
    const success = roll.total <= morale;
    const resultLabel = success ? game.i18n.localize("CWN.MoraleHolds") : game.i18n.localize("CWN.MoraleBreaks");
    const flavor = `${label} (${morale}) - ${resultLabel}`;

    // Prepare chat data
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({actor: this}),
      flavor: flavor,
      rollMode: options.rollMode || game.settings.get("core", "rollMode"),
      sound: CONFIG.sounds.dice
    };

    // Create the chat message
    if (roll) {
      chatData.roll = roll;
      return ChatMessage.create(chatData);
    }
    
    return null;
  }

  /**
   * Create a new item for this actor
   * @param {Object} itemData The item data to create
   * @returns {Promise<Item>} The created item
   */
  async createEmbeddedItem(itemData) {
    const created = await this.createEmbeddedDocuments("Item", [itemData]);
    return created[0];
  }
  
  /**
   * Get a skill by name
   * @param {string} skillName The name of the skill to find
   * @returns {Item|null} The skill item or null if not found
   */
  getSkill(skillName) {
    return this.items.find(i => i.type === "skill" && i.name.toLowerCase() === skillName.toLowerCase()) || null;
  }

  /**
   * 장착된 아이템의 효과를 계산하여 액터에 적용
   * @returns {Promise<void>}
   */
  async calculateEquippedItemEffects() {
    console.log(`CWN | 장착된 아이템 효과 계산 시작: ${this.name}`);
    
    // 액터 타입이 캐릭터나 NPC가 아니면 무시
    if (this.type !== 'character' && this.type !== 'npc') {
      console.log(`CWN | 캐릭터/NPC가 아니므로 장착 효과 계산 무시: ${this.type}`);
      return;
    }
    
    // 장착된 아이템 가져오기
    const equippedItems = this.items.filter(i => i.system.equipped === true);
    console.log(`CWN | 장착된 아이템 수: ${equippedItems.length}`);
    
    // 방어구 효과 계산
    await this._calculateArmorEffects(equippedItems);
    
    // 무기 효과 계산
    await this._calculateWeaponEffects(equippedItems);
    
    // 사이버웨어 효과 계산
    await this._calculateCyberwareEffects(equippedItems);
    
    // 기타 장비 효과 계산
    await this._calculateGearEffects(equippedItems);
    
    console.log(`CWN | 장착된 아이템 효과 계산 완료: ${this.name}`);
  }
  
  /**
   * 방어구 효과 계산
   * @param {Array} equippedItems 장착된 아이템 배열
   * @private
   */
  async _calculateArmorEffects(equippedItems) {
    // 장착된 방어구 필터링
    const armors = equippedItems.filter(i => i.type === 'armor');
    console.log(`CWN | 장착된 방어구 수: ${armors.length}`);
    
    if (armors.length === 0) {
      // 방어구가 없으면 기본 AC로 설정
      const dexMod = this.system.attributes.dex.mod;
      const baseAC = 10 + dexMod;
      
      console.log(`CWN | 방어구 없음, 기본 AC 설정: ${baseAC} (10 + ${dexMod})`);
      
      await this.update({
        'system.ac.value': baseAC
      });
      
      return;
    }
    
    // 가장 높은 AC 값을 가진 방어구 찾기
    let bestArmor = armors[0];
    for (let i = 1; i < armors.length; i++) {
      if (armors[i].system.ac > bestArmor.system.ac) {
        bestArmor = armors[i];
      }
    }
    
    // 최종 AC 계산
    const dexMod = this.system.attributes.dex.mod;
    const armorAC = bestArmor.system.ac;
    const allowDex = bestArmor.system.allowDex !== false;
    const maxDex = bestArmor.system.maxDex !== undefined ? bestArmor.system.maxDex : Infinity;
    
    let finalAC = armorAC;
    if (allowDex) {
      finalAC += Math.min(dexMod, maxDex);
    }
    
    console.log(`CWN | 최종 AC 계산: ${finalAC} (방어구: ${armorAC}, 민첩: ${allowDex ? Math.min(dexMod, maxDex) : 0})`);
    
    // AC 업데이트
    await this.update({
      'system.ac.value': finalAC,
      'system.ac.fromArmor': bestArmor.name
    });
  }
  
  /**
   * 무기 효과 계산
   * @param {Array} equippedItems 장착된 아이템 배열
   * @private
   */
  async _calculateWeaponEffects(equippedItems) {
    // 장착된 무기 필터링
    const weapons = equippedItems.filter(i => i.type === 'weapon');
    console.log(`CWN | 장착된 무기 수: ${weapons.length}`);
    
    if (weapons.length === 0) {
      return;
    }
    
    // 무기 태그 효과 적용 (향후 확장)
    // 현재는 로깅만 수행
    weapons.forEach(weapon => {
      if (Array.isArray(weapon.system.tags)) {
        weapon.system.tags.forEach(tag => {
          console.log(`CWN | 무기 태그 효과 검사: ${weapon.name}, 태그: ${tag}`);
        });
      }
    });
  }
  
  /**
   * 사이버웨어 효과 계산
   * @param {Array} equippedItems 장착된 아이템 배열
   * @private
   */
  async _calculateCyberwareEffects(equippedItems) {
    // 장착된 사이버웨어 필터링
    const cyberware = equippedItems.filter(i => i.type === 'cyberware');
    console.log(`CWN | 장착된 사이버웨어 수: ${cyberware.length}`);
    
    if (cyberware.length === 0) {
      return;
    }
    
    // 총 시스템 스트레인 계산
    let totalStrain = 0;
    cyberware.forEach(item => {
      const strain = item.system.systemStrain || 0;
      totalStrain += strain;
      console.log(`CWN | 사이버웨어 스트레인 추가: ${item.name}, 스트레인: ${strain}`);
    });
    
    console.log(`CWN | 총 사이버웨어 스트레인: ${totalStrain}`);
    
    // 시스템 스트레인 업데이트
    await this.update({
      'system.systemStrain.fromCyberware': totalStrain
    });
    
    // 사이버웨어 능력치 보너스 적용 (향후 확장)
  }
  
  /**
   * 기타 장비 효과 계산
   * @param {Array} equippedItems 장착된 아이템 배열
   * @private
   */
  async _calculateGearEffects(equippedItems) {
    // 장착된 기타 장비 필터링
    const gear = equippedItems.filter(i => i.type === 'gear');
    console.log(`CWN | 장착된 기타 장비 수: ${gear.length}`);
    
    if (gear.length === 0) {
      return;
    }
    
    // 장비 효과 적용 (향후 확장)
    // 현재는 로깅만 수행
    gear.forEach(item => {
      console.log(`CWN | 장비 효과 검사: ${item.name}`);
    });
  }
} 