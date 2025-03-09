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
  
  // 아이템 시트 클래스 등록 - v12 호환성 개선
  Items.registerSheet("cwn", CWNItemSheet, { 
    makeDefault: true, 
    label: "CWN.SheetClassItem",
    types: ["weapon", "armor", "skill", "focus", "gear", "cyberware", "drug", "asset", "power", "vehicle"]
  });
  
  // 아이템 시트 클래스 설정
  CONFIG.Item.sheetClasses.cwn = CONFIG.Item.sheetClasses.cwn || {};
  CONFIG.Item.sheetClasses.cwn.base = {
    id: "cwn",
    label: "CWN.SheetClassItem",
    cls: CWNItemSheet
  };
  
  // 아이템 타입별 시트 클래스 설정
  const itemTypes = ["weapon", "armor", "skill", "focus", "gear", "cyberware", "drug", "asset", "power", "vehicle"];
  itemTypes.forEach(type => {
    CONFIG.Item.sheetClasses.cwn[type] = {
      id: `cwn.${type}`,
      label: `CWN.SheetClassItem.${type}`,
      cls: CWNItemSheet
    };
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
  
  // Foundry v12 호환성을 위한 매크로 등록
  registerMacros();
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
/*  Macros Registration                         */
/* -------------------------------------------- */

function registerMacros() {
  console.log("CWN | Registering macros");
  
  // 능력치 굴림 매크로
  game.macros = game.macros || {};
  
  // 능력치 굴림 매크로
  game.macros.rollAttribute = (attributeName, actorId) => {
    const actor = actorId ? game.actors.get(actorId) : _getSelectedActor();
    if (!actor) {
      ui.notifications.warn(game.i18n.localize("CWN.Errors.NoActor"));
      return null;
    }
    
    const attrData = actor.system.attributes[attributeName];
    if (!attrData) {
      ui.notifications.warn(game.i18n.format("CWN.Errors.NoAttribute", {name: attributeName}));
      return null;
    }
    
    const formula = `1d20 + ${attrData.mod}`;
    const label = game.i18n.format("CWN.AttributeCheck", {
      attribute: game.i18n.localize(CONFIG.CWN.attributes[attributeName])
    });
    
    const roll = new Roll(formula, actor.getRollData());
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: label,
      rollMode: game.settings.get('core', 'rollMode'),
    });
    
    return roll;
  };
  
  // 내성 굴림 매크로
  game.macros.rollSave = (saveId, actorId) => {
    const actor = actorId ? game.actors.get(actorId) : _getSelectedActor();
    if (!actor) {
      ui.notifications.warn(game.i18n.localize("CWN.Errors.NoActor"));
      return null;
    }
    
    return actor.rollSave(saveId);
  };
  
  // 기술 굴림 매크로
  game.macros.rollSkill = (skillName, actorId) => {
    const actor = actorId ? game.actors.get(actorId) : _getSelectedActor();
    if (!actor) {
      ui.notifications.warn(game.i18n.localize("CWN.Errors.NoActor"));
      return null;
    }
    
    return actor.rollSkill(skillName);
  };
  
  // 무기 공격 매크로
  game.macros.rollWeaponAttack = (weaponName, actorId) => {
    const actor = actorId ? game.actors.get(actorId) : _getSelectedActor();
    if (!actor) {
      ui.notifications.warn(game.i18n.localize("CWN.Errors.NoActor"));
      return null;
    }
    
    const weapon = actor.items.find(i => i.type === "weapon" && i.name === weaponName);
    if (!weapon) {
      ui.notifications.warn(game.i18n.format("CWN.Errors.NoWeapon", {name: weaponName}));
      return null;
    }
    
    return weapon.roll();
  };
  
  // 선택된 액터 가져오기 헬퍼 함수
  function _getSelectedActor() {
    // 선택된 토큰의 액터 반환
    const controlled = canvas.tokens?.controlled;
    if (controlled && controlled.length === 1) {
      return controlled[0].actor;
    }
    
    // 선택된 토큰이 없으면 사용자의 캐릭터 반환
    return game.user.character;
  }
  
  console.log("CWN | Macros registered successfully");
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
    rollAttribute: (attributeName, actorId) => {
      return game.macros.rollAttribute(attributeName, actorId);
    },
    rollWeaponAttack: (weaponName, actorId) => {
      return game.macros.rollWeaponAttack(weaponName, actorId);
    },
    ValidatedDialog,
    ItemClassMap
  };
  
  // 매크로 바로가기 등록
  if (game.user.isGM) {
    createMacroShortcuts();
  }
});

/**
 * 자주 사용하는 매크로 바로가기를 생성합니다.
 */
async function createMacroShortcuts() {
  // 이미 매크로가 있는지 확인
  const existingMacros = game.macros.filter(m => m.name.startsWith("CWN:"));
  if (existingMacros.length > 0) {
    console.log("CWN | Macro shortcuts already exist");
    return;
  }
  
  console.log("CWN | Creating macro shortcuts");
  
  // 능력치 굴림 매크로 생성
  const attributes = ["str", "dex", "con", "int", "wis", "cha"];
  for (const attr of attributes) {
    const name = CONFIG.CWN.attributes[attr];
    await Macro.create({
      name: `CWN: ${name} 판정`,
      type: "script",
      img: `icons/svg/d20-grey.svg`,
      command: `game.cwn.rollAttribute("${attr}");`,
      flags: { "cwn-system": { type: "attribute", attribute: attr } }
    });
  }
  
  // 내성 굴림 매크로 생성
  const saves = ["physical", "evasion", "mental", "luck"];
  for (const save of saves) {
    const name = game.i18n.localize(`CWN.Save${save.capitalize()}`);
    await Macro.create({
      name: `CWN: ${name} 내성`,
      type: "script",
      img: `icons/svg/shield.svg`,
      command: `game.cwn.rollSave("${save}");`,
      flags: { "cwn-system": { type: "save", save: save } }
    });
  }
  
  console.log("CWN | Macro shortcuts created successfully");
}

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
    console.log("CWN | 아이템 생성 대화상자 수정 시작");
    console.log("CWN | 대화상자 데이터:", dialog.data);
    console.log("CWN | HTML 요소:", html);
    
    // 기존 타입 필드 제거
    const existingTypeField = html.find("select[name='type']").first().closest(".form-group");
    if (existingTypeField.length) {
      console.log("CWN | 기존 타입 필드 제거");
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
            <option value="weapon">Weapon</option>
            <option value="armor">Armor</option>
            <option value="skill">Skill</option>
            <option value="focus">Focus</option>
            <option value="gear">Gear</option>
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
    console.log("CWN | 타입 선택 드롭다운 추가 완료");
    
    // 폼 제출 이벤트 수정
    form.off("submit");
    form.on("submit", async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const name = form.name.value;
      const type = form.type.value;
      console.log(`CWN | 폼 제출됨 - 이름: "${name}", 타입: "${type}"`);
      
      // 아이템 생성 데이터 준비
      const itemData = {
        name: name,
        type: type,
        system: {}
      };
      
      // 아이템 타입별 기본 데이터 설정
      if (type === "weapon") {
        itemData.system = {
          damage: "1d6",
          range: "melee",
          attackBonus: 0,
          attribute: "str",
          ammo: { value: 0, max: 0 },
          tags: [],
          price: 0,
          weight: 1,
          location: "readied",
          equipped: false
        };
      } else if (type === "armor") {
        itemData.system = {
          ac: 10,
          meleeAC: 10,
          type: "light",
          traumaDiePenalty: 0,
          tags: [],
          price: 0,
          weight: 1,
          location: "readied"
        };
      } else if (type === "skill") {
        itemData.system = {
          level: 0,
          attribute: "int",
          category: "standard",
          specialty: "",
          source: ""
        };
      } else if (type === "focus") {
        itemData.system = {
          level: 1,
          prerequisites: "",
          levelEffects: {
            level1: "",
            level2: ""
          },
          source: ""
        };
      } else if (type === "gear") {
        itemData.system = {
          type: "general",
          quantity: 1,
          price: 0,
          weight: 0.1,
          location: "stowed",
          tags: []
        };
      } else if (type === "cyberware") {
        itemData.system = {
          systemStrain: 1,
          location: "body",
          type: "implant",
          price: 0,
          tags: []
        };
      } else if (type === "drug") {
        itemData.system = {
          duration: "1 hour",
          type: "medical",
          price: 0,
          quantity: 1,
          effect: "",
          sideEffect: "",
          overdose: "",
          tags: []
        };
      } else if (type === "asset") {
        itemData.system = {
          rating: 1,
          type: "military",
          cost: 1,
          maintenance: 0,
          force: 0,
          cunning: 0,
          wealth: 0,
          hp: { value: 1, max: 1 },
          tags: []
        };
      } else if (type === "power") {
        itemData.system = {
          level: 1,
          type: "psychic",
          cost: 0,
          range: "self",
          duration: "instant",
          tags: []
        };
      } else if (type === "vehicle") {
        itemData.system = {
          type: "ground",
          speed: 0,
          armor: 0,
          hp: { value: 10, max: 10 },
          crew: 1,
          price: 0,
          tags: []
        };
      }
      
      console.log("CWN | 아이템 생성 데이터:", itemData);
      console.log("CWN | Item.create 메서드 호출 전");
      
      try {
        // Foundry VTT v12에서 Item.create 메서드 사용
        console.log("CWN | Item.create 메서드 호출 시도");
        
        // 아이템 생성 시도
        const item = await Item.create(itemData);
        console.log("CWN | 아이템 생성 성공:", item);
        
        // 아이템 시트 열기
        if (item) {
          console.log("CWN | 아이템 시트 열기 시도");
          item.sheet.render(true);
        } else {
          console.error("CWN | 아이템이 생성되었지만 null 또는 undefined입니다.");
          ui.notifications.error("아이템이 생성되었지만 시트를 열 수 없습니다.");
        }
      } catch (error) {
        console.error("CWN | 아이템 생성 중 오류 발생:", error);
        
        // 오류 세부 정보 로깅
        console.error("CWN | 오류 이름:", error.name);
        console.error("CWN | 오류 메시지:", error.message);
        console.error("CWN | 오류 스택:", error.stack);
        
        ui.notifications.error(`아이템 생성 중 오류 발생: ${error.message}`);
      }
      
      dialog.close();
    });
    
    console.log("CWN | 아이템 생성 대화상자 수정 완료");
  }
});

// 아이템 시트 렌더링 훅 추가
Hooks.on("renderItemSheet", (app, html, data) => {
  console.log("CWN | renderItemSheet hook called for:", app.item?.name, app.item?.type);
  console.log("CWN | Item sheet app:", app);
  console.log("CWN | Item sheet html:", html);
  console.log("CWN | Item sheet data:", data);
  
  try {
    // 시트 내용이 비어있는지 확인
    if (html.find('.sheet-body').length === 0) {
      console.warn("CWN | 아이템 시트 내용이 비어있습니다. 템플릿이 제대로 로드되지 않았을 수 있습니다.");
      
      // 기본 시트 구조 추가
      const sheetContent = html.find('form');
      if (sheetContent.length > 0 && sheetContent.children().length <= 1) {
        console.log("CWN | 기본 시트 구조 추가 시도");
        
        // 기본 시트 구조 생성
        const sheetStructure = $(`
          <nav class="sheet-tabs tabs" data-group="primary">
            <a class="item active" data-tab="description">설명</a>
            <a class="item" data-tab="attributes">속성</a>
            <a class="item" data-tab="effects">효과</a>
          </nav>
          <section class="sheet-body">
            <div class="tab description active" data-group="primary" data-tab="description">
              <div class="editor-content">
                <textarea name="system.description">${data.system?.description || ""}</textarea>
              </div>
            </div>
            <div class="tab attributes" data-group="primary" data-tab="attributes">
              <p>아이템 타입: ${data.type || "알 수 없음"}</p>
              <p>아이템 속성을 표시하는 부분입니다.</p>
            </div>
            <div class="tab effects" data-group="primary" data-tab="effects">
              <p>아이템 효과를 표시하는 부분입니다.</p>
            </div>
          </section>
        `);
        
        sheetContent.append(sheetStructure);
        console.log("CWN | 기본 시트 구조 추가 완료");
      }
    }
    
    // 탭 초기화 로직 개선
    const tabs = html.find('.tabs');
    const tabsContent = html.find('.tab');
    
    // 이미 탭 핸들러가 있는지 확인
    if (tabs.length > 0 && !tabs.hasClass('initialized')) {
      console.log("CWN | Initializing tabs for item sheet");
      
      // 첫 번째 탭에 active 클래스 추가
      tabs.find('.item').first().addClass('active');
      tabsContent.first().addClass('active');
      
      // 탭 클릭 이벤트 핸들러 추가
      tabs.on('click', '.item', function() {
        const tab = $(this).data('tab');
        tabs.find('.item').removeClass('active');
        tabsContent.removeClass('active');
        $(this).addClass('active');
        html.find(`.tab[data-tab="${tab}"]`).addClass('active');
      });
      
      tabs.addClass('initialized');
      console.log("CWN | Tabs initialized successfully");
    } else {
      console.log("CWN | Tabs already initialized or not found");
    }
  } catch (error) {
    console.error("CWN | Error initializing item sheet tabs:", error);
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