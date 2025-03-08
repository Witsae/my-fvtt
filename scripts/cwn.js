// Cities Without Number System for Foundry VTT v12
import { CWNActor } from "./actor/actor.js";
import { CWNItem } from "./item/item.js";
import { CWNActorSheet } from "./actor/actor-sheet.js";
import { CWNItemSheet } from "./item/item-sheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { CWN } from "./config.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
  console.log("CWN | Initializing Cities Without Number System");

  // Define custom Document classes
  CONFIG.Actor.documentClass = CWNActor;
  CONFIG.Item.documentClass = CWNItem;

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
    types: ["skill", "focus", "weapon", "armor", "gear", "cyberware", "asset"] 
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
  
  console.log("CWN | Handlebars helpers registered");
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
  // Handle chat message rendering
});

/* -------------------------------------------- */
/*  Item Sheet Hooks                            */
/* -------------------------------------------- */

Hooks.on("renderItemSheet", (app, html, data) => {
  // Add any custom rendering for item sheets
  console.log("CWN | Rendering Item Sheet:", app, data);
});

/* -------------------------------------------- */
/*  Debug Hooks                                 */
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
  CWNItemSheet
}; 