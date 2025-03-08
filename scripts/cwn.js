// Cities Without Number System for Foundry VTT v12
import { CWNActor } from "./actor/actor.js";
import { CWNItem } from "./item/item.js";
import { CWNActorSheet } from "./actor/actor-sheet.js";
import { CWNItemSheet } from "./item/item-sheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { CWN } from "./config.js";
import { ValidatedDialog } from "./utils/ValidatedDialog.js";
import { chatListeners, calculateStats, limitConcurrency, getDefaultImage } from "./utils/utils.js";
import { CWNCombatant, CombatUtils } from "./utils/combat.js";
import { ItemClassMap } from "./items/index.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
  console.log("CWN | Initializing Cities Without Number System");

  // Define custom Document classes
  CONFIG.Actor.documentClass = CWNActor;
  CONFIG.Item.documentClass = CWNItem;
  CONFIG.Combatant.documentClass = CWNCombatant;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("cwn", CWNActorSheet, { makeDefault: true });
  
  console.log("CWN | Registering item sheet");
  Items.unregisterSheet("core", ItemSheet);
  
  // Register the item sheet directly to CONFIG
  CONFIG.Item.sheetClasses = CONFIG.Item.sheetClasses || {};
  CONFIG.Item.sheetClasses.cwn = CONFIG.Item.sheetClasses.cwn || {};
  CONFIG.Item.sheetClasses.cwn.CWNItemSheet = CWNItemSheet;
  
  // Then register it normally
  Items.registerSheet("cwn", CWNItemSheet, { 
    makeDefault: true, 
    types: ["skill", "focus", "weapon", "armor", "gear", "cyberware", "drug", "asset"] 
  });
  
  console.log("CWN | Item sheet classes after registration:", CONFIG.Item.sheetClasses);

  // Add CWN config to CONFIG
  CONFIG.CWN = CWN;

  // Register Handlebars helpers
  registerHandlebarsHelpers();

  // Register system settings
  registerSystemSettings();

  // Preload Handlebars templates
  await preloadHandlebarsTemplates();
  
  // Register custom enrichers for inline rolls and links
  registerCustomEnrichers();
});

/* -------------------------------------------- */
/*  System Settings                             */
/* -------------------------------------------- */

function registerSystemSettings() {
  console.log("CWN | Registering system settings");
  
  game.settings.register("cwn-system", "useModernCurrency", {
    name: "Use Modern Currency",
    hint: "Use modern currency (dollars) instead of traditional credits.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register("cwn-system", "enableSanity", {
    name: "Enable Sanity",
    hint: "Enable the Sanity mechanic for characters.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
  
  // Add additional settings for v12 compatibility
  game.settings.register("cwn-system", "useCustomRollFormula", {
    name: "Use Custom Roll Formula",
    hint: "Use a custom formula for skill checks instead of the default 2d6.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
  
  game.settings.register("cwn-system", "customRollFormula", {
    name: "Custom Roll Formula",
    hint: "The custom formula to use for skill checks (e.g., '3d6kh2' for 3d6 keep highest 2).",
    scope: "world",
    config: true,
    type: String,
    default: "2d6"
  });
  
  // 이니셔티브 설정
  game.settings.register("cwn-system", "initiativeFormula", {
    name: "Initiative Formula",
    hint: "The formula to use for initiative rolls.",
    scope: "world",
    config: true,
    type: String,
    default: "1d8 + @attributes.dex.mod"
  });
  
  // 자동 이니셔티브 굴림 설정
  game.settings.register("cwn-system", "autoRollInitiative", {
    name: "Auto Roll Initiative",
    hint: "Automatically roll initiative when combat starts.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
  
  // CWN 방어구 사용 설정
  game.settings.register("cwn-system", "useCWNArmor", {
    name: "Use CWN Armor",
    hint: "Use CWN armor rules with separate melee AC.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
  
  // 트라우마 사용 설정
  game.settings.register("cwn-system", "useTrauma", {
    name: "Use Trauma",
    hint: "Use trauma rules for armor.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
  
  console.log("CWN | System settings registered");
}

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

function registerHandlebarsHelpers() {
  console.log("CWN | Registering Handlebars helpers");
  
  // Add a helper to format numbers with commas
  Handlebars.registerHelper("numberFormat", function(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  });

  // Add a helper to get attribute modifiers
  Handlebars.registerHelper("getModifier", function(value) {
    const mod = Math.floor((value - 10) / 2);
    return mod >= 0 ? `+${mod}` : mod.toString();
  });
  
  // Add capitalize helper
  Handlebars.registerHelper("capitalize", function(value) {
    if (typeof value !== 'string') return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  });
  
  // Add a helper to check if a value equals another value
  Handlebars.registerHelper("eq", function(a, b) {
    return a === b;
  });
  
  // Add a helper to check if a value is greater than another value
  Handlebars.registerHelper("gt", function(a, b) {
    return a > b;
  });
  
  // Add a helper to check if a value is less than another value
  Handlebars.registerHelper("lt", function(a, b) {
    return a < b;
  });
  
  // Add a helper to check if a value is greater than or equal to another value
  Handlebars.registerHelper("gte", function(a, b) {
    return a >= b;
  });
  
  // Add a helper to check if a value is less than or equal to another value
  Handlebars.registerHelper("lte", function(a, b) {
    return a <= b;
  });
  
  // Add a helper to check if a value is not equal to another value
  Handlebars.registerHelper("neq", function(a, b) {
    return a !== b;
  });
  
  // Add a helper to check if a value is in an array
  Handlebars.registerHelper("includes", function(array, value) {
    return Array.isArray(array) && array.includes(value);
  });
  
  console.log("CWN | Handlebars helpers registered");
}

/* -------------------------------------------- */
/*  Custom Enrichers                            */
/* -------------------------------------------- */

function registerCustomEnrichers() {
  console.log("CWN | Registering custom enrichers");
  
  // Register custom inline roll enricher
  CONFIG.TextEditor.enrichers.push({
    pattern: /\[\[(\/r|\/roll|\/gmroll|\/blindroll)?\s*([^\]]+)\]\]/gi,
    enricher: (match, options) => {
      const [command, formula] = match.slice(1, 3);
      const rollData = options.rollData || {};
      
      const a = document.createElement("a");
      a.classList.add("inline-roll");
      a.dataset.formula = formula;
      if (command) a.dataset.mode = command.replace(/^\//, "");
      a.title = formula;
      a.innerHTML = `<i class="fas fa-dice-d20"></i> ${formula}`;
      
      return a;
    }
  });
  
  // Register custom item link enricher
  CONFIG.TextEditor.enrichers.push({
    pattern: /@Item\[([^\]]+)\]/gi,
    enricher: (match, options) => {
      const itemName = match[1];
      
      const a = document.createElement("a");
      a.classList.add("content-link");
      a.dataset.type = "Item";
      a.dataset.name = itemName;
      a.innerHTML = `<i class="fas fa-suitcase"></i> ${itemName}`;
      
      return a;
    }
  });
  
  console.log("CWN | Custom enrichers registered");
}

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  console.log("CWN | Cities Without Number System Ready");
  console.log("CWN | Item sheet classes at ready:", CONFIG.Item.sheetClasses);
  
  // Verify settings are registered
  try {
    const enableSanity = game.settings.get("cwn-system", "enableSanity");
    console.log("CWN | enableSanity setting:", enableSanity);
  } catch (error) {
    console.error("CWN | Error accessing settings:", error);
  }
  
  // Add global chat command for rolling skills
  game.cwn = {
    rollSkill: (skillName, actorId) => {
      const actor = game.actors.get(actorId);
      if (!actor) {
        ui.notifications.error("Actor not found");
        return;
      }
      return actor.rollSkill(skillName);
    },
    rollSave: (saveId, actorId) => {
      const actor = game.actors.get(actorId);
      if (!actor) {
        ui.notifications.error("Actor not found");
        return;
      }
      return actor.rollSave(saveId);
    },
    ValidatedDialog,
    ItemClassMap
  };
});

/* -------------------------------------------- */
/*  Canvas Initialization                       */
/* -------------------------------------------- */

Hooks.on("canvasInit", function() {
  // Add custom canvas initialization if needed
});

/* -------------------------------------------- */
/*  Chat Message Hooks                          */
/* -------------------------------------------- */

Hooks.on("renderChatMessage", (message, html, data) => {
  // 채팅 메시지 리스너 추가
  chatListeners(message, html);
  
  // Add event listener for inline rolls
  html.find(".inline-roll").click(event => {
    event.preventDefault();
    const formula = event.currentTarget.dataset.formula;
    const rollMode = event.currentTarget.dataset.mode || game.settings.get("core", "rollMode");
    
    const roll = new Roll(formula);
    roll.toMessage({
      flavor: `Rolling ${formula}`,
      rollMode: rollMode
    });
  });
  
  // Add event listener for item links
  html.find(".content-link[data-type='Item']").click(event => {
    event.preventDefault();
    const itemName = event.currentTarget.dataset.name;
    const items = game.items.filter(i => i.name === itemName);
    
    if (items.length === 0) {
      ui.notifications.warn(`No item found with name "${itemName}"`);
      return;
    }
    
    if (items.length === 1) {
      items[0].sheet.render(true);
    } else {
      // If multiple items with the same name, show a dialog to choose
      const content = `<p>Multiple items found with name "${itemName}". Choose one:</p>
        <div class="form-group">
          <select id="item-select">
            ${items.map(i => `<option value="${i.id}">${i.name} (${i.type})</option>`).join("")}
          </select>
        </div>`;
      
      new Dialog({
        title: "Choose Item",
        content: content,
        buttons: {
          select: {
            icon: '<i class="fas fa-check"></i>',
            label: "Select",
            callback: html => {
              const itemId = html.find("#item-select").val();
              const item = game.items.get(itemId);
              if (item) item.sheet.render(true);
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel"
          }
        },
        default: "select"
      }).render(true);
    }
  });
});

/* -------------------------------------------- */
/*  Combat Hooks                                */
/* -------------------------------------------- */

Hooks.on("createCombat", async (combat, options, userId) => {
  // 자동 이니셔티브 굴림
  if (game.settings.get("cwn-system", "autoRollInitiative") && game.user.id === userId) {
    await CombatUtils.rollInitiative(combat);
  }
});

Hooks.on("updateCombat", async (combat, updateData, options, userId) => {
  // 라운드 변경 시 효과 처리
  if (updateData.round && game.user.id === userId) {
    await CombatUtils.onRoundChange(combat, updateData, options);
  }
});

/* -------------------------------------------- */
/*  Item Hooks                                  */
/* -------------------------------------------- */

Hooks.on("createItem", (item, options, userId) => {
  console.log("CWN | Item created:", item);
});

Hooks.on("getItemSheetClass", (item, sheetClass) => {
  console.log("CWN | Getting item sheet class for:", item);
  console.log("CWN | Sheet class:", sheetClass);
  return sheetClass;
});

/* -------------------------------------------- */
/*  Export as Default Module                    */
/* -------------------------------------------- */

export default {
  CWNActor,
  CWNItem,
  CWNActorSheet,
  CWNItemSheet,
  ValidatedDialog,
  CWNCombatant,
  CombatUtils,
  ItemClassMap
}; 