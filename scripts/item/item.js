/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class CWNItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
    
    // Call type-specific preparation methods
    const itemData = this;
    const systemData = itemData.system;
    const itemType = itemData.type;
    
    // Call type-specific preparation methods
    if (itemType === 'weapon') this._prepareWeaponData(itemData);
    if (itemType === 'armor') this._prepareArmorData(itemData);
    if (itemType === 'skill') this._prepareSkillData(itemData);
    if (itemType === 'focus') this._prepareFocusData(itemData);
  }
  
  /**
   * Prepare weapon-specific data
   * @param {Object} itemData The item data to prepare
   * @private
   */
  _prepareWeaponData(itemData) {
    const systemData = itemData.system;
    
    // Calculate attack bonus
    if (this.actor) {
      const actorData = this.actor.system;
      
      // Add attribute modifier to attack bonus
      if (systemData.range === 'melee') {
        systemData.totalAttackBonus = systemData.attackBonus + actorData.attributes.str.mod;
      } else {
        systemData.totalAttackBonus = systemData.attackBonus + actorData.attributes.dex.mod;
      }
      
      // Format attack bonus for display
      systemData.attackBonusDisplay = systemData.totalAttackBonus >= 0 
        ? `+${systemData.totalAttackBonus}` 
        : systemData.totalAttackBonus.toString();
    }
  }
  
  /**
   * Prepare armor-specific data
   * @param {Object} itemData The item data to prepare
   * @private
   */
  _prepareArmorData(itemData) {
    const systemData = itemData.system;
    
    // Calculate any armor-specific data here
  }
  
  /**
   * Prepare skill-specific data
   * @param {Object} itemData The item data to prepare
   * @private
   */
  _prepareSkillData(itemData) {
    const systemData = itemData.system;
    
    // Calculate any skill-specific data here
  }
  
  /**
   * Prepare focus-specific data
   * @param {Object} itemData The item data to prepare
   * @private
   */
  _prepareFocusData(itemData) {
    const systemData = itemData.system;
    
    // Calculate any focus-specific data here
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
  getRollData() {
    // If present, return the actor's roll data.
    if (!this.actor) return null;
    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  /**
   * Get the appropriate sheet class for this item
   * @override
   */
  static get sheetClass() {
    console.log("CWN | Getting sheetClass for CWNItem");
    
    // First try to get from CONFIG directly
    if (CONFIG.Item.sheetClasses?.cwn?.CWNItemSheet) {
      console.log("CWN | Found sheet class in CONFIG.Item.sheetClasses.cwn.CWNItemSheet");
      return CONFIG.Item.sheetClasses.cwn.CWNItemSheet;
    }
    
    // Fallback to default ItemSheet
    console.log("CWN | Using default ItemSheet class");
    return ItemSheet;
  }

  /**
   * Get the sheet instance for this item, creating it if it doesn't exist
   * @override
   */
  get sheet() {
    console.log("CWN | Getting sheet for item:", this.name);
    if (!this._sheet) {
      console.log("CWN | No sheet instance exists, creating one");
      // Use a direct reference to CWNItemSheet if available
      const CWNItemSheet = CONFIG.Item.sheetClasses?.cwn?.CWNItemSheet;
      if (CWNItemSheet) {
        console.log("CWN | Creating CWNItemSheet instance");
        this._sheet = new CWNItemSheet(this);
      } else {
        console.log("CWN | Creating default ItemSheet instance");
        this._sheet = new ItemSheet(this);
      }
      console.log("CWN | Created sheet instance:", this._sheet);
    }
    return this._sheet;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll(event) {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get("core", "rollMode");
    const label = `[${item.type}] ${item.name}`;

    // If there's no roll data, send a chat message.
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? ""
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.item.formula, rollData);
      // If you need to store the value first, uncomment the next line.
      // let result = await roll.roll({async: true});
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }

  /**
   * Handle weapon attacks.
   * @param {Event} event   The originating click event
   * @private
   */
  async rollAttack(event) {
    if (this.type !== "weapon") return;

    const item = this;
    const actor = this.actor;

    if (!actor) return;

    // Get the skill to use for the attack
    let skillName = "shoot";
    if (item.system.range === "melee") skillName = "stab";

    // Find the skill
    const skill = actor.items.find(i => i.type === "skill" && i.name.toLowerCase() === skillName.toLowerCase());
    const skillLevel = skill ? skill.system.level : 0;

    // Determine the attribute to use
    let attributeName = "dex";
    if (skillName === "stab") attributeName = "str";

    // Get the attribute modifier
    const attributeMod = actor.system.attributes[attributeName].mod;

    // Calculate the attack bonus
    const attackBonus = skillLevel + attributeMod + (item.system.attackBonus || 0);
    const attackBonusString = attackBonus >= 0 ? `+${attackBonus}` : attackBonus.toString();

    // Create the roll formula
    const formula = `1d20${attackBonusString}`;

    // Roll the attack
    const roll = await new Roll(formula).evaluate({async: true});

    // Prepare chat data
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({actor: actor}),
      flavor: `${item.name} - Attack Roll`,
      sound: CONFIG.sounds.dice
    };

    // Create the chat message
    if (roll) {
      chatData.roll = roll;
      return ChatMessage.create(chatData);
    }
  }

  /**
   * Handle weapon damage rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async rollDamage(event) {
    if (this.type !== "weapon") return;

    const item = this;
    const actor = this.actor;

    if (!actor) return;

    // Get the damage formula
    let damageFormula = item.system.damage || "1d6";

    // Add attribute modifier if applicable
    if (item.system.range === "melee") {
      const strMod = actor.system.attributes.str.mod;
      if (strMod !== 0) {
        damageFormula += strMod > 0 ? `+${strMod}` : strMod;
      }
    }

    // Add skill bonus to damage if enabled
    if (item.system.skillBonus) {
      // Get the skill to use for the attack
      let skillName = "shoot";
      if (item.system.range === "melee") skillName = "stab";

      // Find the skill
      const skill = actor.items.find(i => i.type === "skill" && i.name.toLowerCase() === skillName.toLowerCase());
      const skillLevel = skill ? skill.system.level : 0;

      if (skillLevel > 0) {
        damageFormula += `+${skillLevel}`;
      }
    }

    // Roll the damage
    const roll = await new Roll(damageFormula).evaluate({async: true});

    // Prepare chat data
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({actor: actor}),
      flavor: `${item.name} - Damage Roll`,
      sound: CONFIG.sounds.dice
    };

    // Create the chat message
    if (roll) {
      chatData.roll = roll;
      return ChatMessage.create(chatData);
    }
  }
  
  /**
   * Show the item description in chat
   */
  async showDescription() {
    if (!this.actor) return;
    
    const cardData = {
      item: this,
      description: this.system.description
    };
    
    const template = "systems/cwn-system/templates/chat/item-card.hbs";
    const html = await renderTemplate(template, cardData);
    
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({actor: this.actor}),
      content: html
    };
    
    return ChatMessage.create(chatData);
  }
} 