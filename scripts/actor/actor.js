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

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
    this._prepareFactionData(actorData);
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
} 