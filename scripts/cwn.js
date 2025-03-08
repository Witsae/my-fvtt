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

  // CWNItemSheet를 전역 변수로 등록
  globalThis.CWNItemSheet = CWNItemSheet;

  // Define custom Document classes
  CONFIG.Actor.documentClass = CWNActor;
  CONFIG.Item.documentClass = CWNItem;
  CONFIG.Combatant.documentClass = CWNCombatant;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("cwn", CWNActorSheet, { makeDefault: true });
  
  // 아이템 시트 등록
  console.log("CWN | Registering item sheet");
  Items.unregisterSheet("core", ItemSheet);
  
  // 직접 CONFIG에 아이템 시트 클래스 등록
  CONFIG.Item.sheetClasses = CONFIG.Item.sheetClasses || {};
  CONFIG.Item.sheetClasses.cwn = CONFIG.Item.sheetClasses.cwn || {};
  
  // 기본 아이템 시트 등록
  CONFIG.Item.sheetClasses.cwn.base = {
    id: "cwn",
    label: "CWN.SheetClassItem",
    cls: CWNItemSheet
  };
  
  // 각 아이템 타입별로 시트 클래스 등록
  const itemTypes = ["weapon", "armor", "skill", "focus", "gear", "cyberware", "drug", "asset", "power", "vehicle"];
  itemTypes.forEach(type => {
    CONFIG.Item.sheetClasses.cwn[type] = {
      id: `cwn.${type}`,
      label: `CWN.SheetClassItem.${type}`,
      cls: CWNItemSheet
    };
  });
  
  // 일반적인 방식으로도 등록
  Items.registerSheet("cwn", CWNItemSheet, { 
    makeDefault: true, 
    label: "CWN.SheetClassItem",
    types: itemTypes
  });
  
  // 아이템 시트 클래스 확인
  console.log("CWN | Item sheet classes after registration:", CONFIG.Item.sheetClasses);

  // 아이템 클래스 맵 설정
  CONFIG.CWN = CWN;
  CONFIG.CWN.ItemClassMap = ItemClassMap;

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

Hooks.on("createItem", async (item, options, userId) => {
  console.log("CWN | Item created:", item);
  console.log("CWN | Item creation options:", options);
  console.log("CWN | Item creation userId:", userId);
  
  // 타입이 없는 경우 기본 타입을 'gear'로 설정
  if (!item.type) {
    console.log("CWN | Item has no type, setting to gear");
    await item.update({ type: "gear" });
    console.log("CWN | Updated item type to gear:", item);
  }
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

// 아이템 생성 대화상자 수정
Hooks.on("renderDialog", (dialog, html, data) => {
  // 아이템 생성 대화상자인지 확인
  if (dialog.data.title === "Create New Item") {
    console.log("CWN | Modifying item creation dialog");
    console.log("CWN | Dialog data:", dialog.data);
    console.log("CWN | Dialog html:", html);
    
    // 기존 타입 필드 제거
    const existingTypeField = html.find("select[name='type']").first().closest(".form-group");
    if (existingTypeField.length) {
      console.log("CWN | Removing existing type field");
      existingTypeField.remove();
    }
    
    // 타입 선택 드롭다운 추가
    const form = html.find("form");
    const nameInput = form.find("input[name='name']");
    const typeSelect = $(`
      <div class="form-group">
        <label>Type</label>
        <div class="form-fields">
          <select name="type">
            <option value="gear">Gear</option>
            <option value="weapon">Weapon</option>
            <option value="armor">Armor</option>
            <option value="skill">Skill</option>
            <option value="focus">Focus</option>
            <option value="cyberware">Cyberware</option>
            <option value="drug">Drug</option>
            <option value="asset">Asset</option>
            <option value="power">Power</option>
            <option value="vehicle">Vehicle</option>
          </select>
        </div>
      </div>
    `);
    
    // 타입 선택 드롭다운을 이름 입력 필드 다음에 추가
    nameInput.parent().parent().after(typeSelect);
    console.log("CWN | Added type select dropdown to dialog");
    
    // 폼 제출 이벤트 수정
    form.off("submit");
    form.on("submit", event => {
      event.preventDefault();
      const form = event.currentTarget;
      const name = form.name.value;
      const type = form.type.value;
      console.log("CWN | Form submitted with name:", name, "and type:", type);
      dialog.data.resolve({ name, type });
      dialog.close();
    });
  }
});

// 아이템 시트 렌더링 훅 추가
Hooks.on("renderItemSheet", (app, html, data) => {
  console.log("CWN | renderItemSheet hook called");
  console.log("CWN | Item sheet app:", app);
  console.log("CWN | Item sheet html:", html);
  console.log("CWN | Item sheet data:", data);
  
  // 디버그 로그 추가
  console.log("CWN | Item sheet data details:");
  console.log("CWN | - Item name:", data.document?.name);
  console.log("CWN | - Item type:", data.document?.type);
  console.log("CWN | - Item system data:", data.document?.system);
  console.log("CWN | - Context system data:", data.system);
  console.log("CWN | - Template path:", app.template);
  
  // 템플릿 경로 확인
  const templatePath = app.template;
  console.log("CWN | Using template path:", templatePath);
  
  // 아이템 타입별 속성 템플릿 경로 확인
  if (data.document?.type) {
    const attributesPath = `systems/cwn-system/templates/item/parts/item-${data.document.type}-attributes.hbs`;
    console.log("CWN | Expected attributes template path:", attributesPath);
  }
  
  // 아이템 시트가 비어있는 경우 수동으로 내용 추가
  if (html.find('.sheet-body').length === 0 || html.find('.sheet-body').is(':empty')) {
    console.log("CWN | Sheet body is empty, manually adding content");
    
    // 기본 탭 구조 추가
    const tabsHtml = `
      <nav class="sheet-tabs tabs" data-group="primary">
        <a class="item" data-tab="description">설명</a>
        <a class="item" data-tab="attributes">속성</a>
      </nav>
      <section class="sheet-body">
        <div class="tab description" data-group="primary" data-tab="description">
          <div class="editor-content">
            <textarea name="system.description">${data.document?.system?.description || ''}</textarea>
          </div>
        </div>
        <div class="tab attributes" data-group="primary" data-tab="attributes">
          <div class="form-group">
            <label>아이템 타입</label>
            <div class="form-fields">
              <span>${data.document?.type || '알 수 없음'}</span>
            </div>
          </div>
        </div>
      </section>
    `;
    
    html.find('form').append(tabsHtml);
    
    // 탭 초기화
    app._tabs = app._createTabHandlers();
    app._tabs[0].activate("description");
  }
});

// 아이템 시트 준비 디버깅
Hooks.on("preRenderItemSheet", (app, data) => {
  console.log("CWN | preRenderItemSheet hook called");
  console.log("CWN | Item sheet app:", app);
  console.log("CWN | Item sheet data:", data);
});

// 아이템 업데이트 디버깅
Hooks.on("updateItem", (item, changes, options, userId) => {
  console.log("CWN | updateItem hook called");
  console.log("CWN | Updated item:", item);
  console.log("CWN | Changes:", changes);
  console.log("CWN | Options:", options);
  console.log("CWN | User ID:", userId);
}); 