/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export async function preloadHandlebarsTemplates() {
  console.log("CWN | 템플릿 사전 로딩 시작");
  
  const templatePaths = [
    // Actor partials
    "systems/cwn-system/templates/actor/parts/actor-attributes.hbs",
    "systems/cwn-system/templates/actor/parts/actor-skills.hbs",
    "systems/cwn-system/templates/actor/parts/actor-items.hbs",
    "systems/cwn-system/templates/actor/parts/actor-features.hbs",
    "systems/cwn-system/templates/actor/parts/actor-biography.hbs",
    "systems/cwn-system/templates/actor/parts/actor-saves.hbs",
    "systems/cwn-system/templates/actor/parts/actor-effects.hbs",
    
    // Item partials
    "systems/cwn-system/templates/item/parts/item-header.hbs",
    "systems/cwn-system/templates/item/parts/item-description.hbs",
    "systems/cwn-system/templates/item/parts/item-attributes.hbs",
    "systems/cwn-system/templates/item/parts/item-effects.hbs",
    
    // 기본 아이템 시트 템플릿
    "systems/cwn-system/templates/item/item-sheet.hbs",
    
    // 아이템 타입별 시트 템플릿
    "systems/cwn-system/templates/item/item-weapon-sheet.hbs",
    "systems/cwn-system/templates/item/item-armor-sheet.hbs",
    "systems/cwn-system/templates/item/item-skill-sheet.hbs",
    "systems/cwn-system/templates/item/item-focus-sheet.hbs",
    "systems/cwn-system/templates/item/item-gear-sheet.hbs",
    "systems/cwn-system/templates/item/item-cyberware-sheet.hbs",
    "systems/cwn-system/templates/item/item-drug-sheet.hbs",
    "systems/cwn-system/templates/item/item-asset-sheet.hbs",
    "systems/cwn-system/templates/item/item-power-sheet.hbs",
    "systems/cwn-system/templates/item/item-vehicle-sheet.hbs",
    
    // Item type-specific attribute templates
    "systems/cwn-system/templates/item/parts/item-weapon-attributes.hbs",
    "systems/cwn-system/templates/item/parts/item-armor-attributes.hbs",
    "systems/cwn-system/templates/item/parts/item-skill-attributes.hbs",
    "systems/cwn-system/templates/item/parts/item-focus-attributes.hbs",
    "systems/cwn-system/templates/item/parts/item-gear-attributes.hbs",
    "systems/cwn-system/templates/item/parts/item-cyberware-attributes.hbs",
    "systems/cwn-system/templates/item/parts/item-drug-attributes.hbs",
    "systems/cwn-system/templates/item/parts/item-asset-attributes.hbs",
    "systems/cwn-system/templates/item/parts/item-power-attributes.hbs",
    "systems/cwn-system/templates/item/parts/item-vehicle-attributes.hbs"
  ];

  console.log("CWN | 로딩할 템플릿 경로:", templatePaths);
  const result = await loadTemplates(templatePaths);
  console.log("CWN | 템플릿 사전 로딩 완료");
  return result;
} 