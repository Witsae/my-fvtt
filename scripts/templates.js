/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export async function preloadHandlebarsTemplates() {
  console.log("CWN | 템플릿 사전 로딩 시작");
  
  const templatePaths = [
    // Actor partials
    "templates/actor/parts/actor-attributes.hbs",
    "templates/actor/parts/actor-skills.hbs",
    "templates/actor/parts/actor-items.hbs",
    "templates/actor/parts/actor-features.hbs",
    "templates/actor/parts/actor-biography.hbs",
    "templates/actor/parts/actor-saves.hbs",
    "templates/actor/parts/actor-effects.hbs",
    
    // Item partials
    "templates/item/parts/item-header.hbs",
    "templates/item/parts/item-description.hbs",
    "templates/item/parts/item-attributes.hbs",
    "templates/item/parts/item-effects.hbs",
    
    // 기본 아이템 시트 템플릿
    "templates/item/item-sheet.hbs",
    
    // 아이템 타입별 시트 템플릿
    "templates/item/item-weapon-sheet.hbs",
    "templates/item/item-armor-sheet.hbs",
    "templates/item/item-skill-sheet.hbs",
    "templates/item/item-focus-sheet.hbs",
    "templates/item/item-gear-sheet.hbs",
    "templates/item/item-cyberware-sheet.hbs",
    "templates/item/item-drug-sheet.hbs",
    "templates/item/item-asset-sheet.hbs",
    "templates/item/item-power-sheet.hbs",
    "templates/item/item-vehicle-sheet.hbs",
    
    // Item type-specific attribute templates
    "templates/item/parts/item-weapon-attributes.hbs",
    "templates/item/parts/item-armor-attributes.hbs",
    "templates/item/parts/item-skill-attributes.hbs",
    "templates/item/parts/item-focus-attributes.hbs",
    "templates/item/parts/item-gear-attributes.hbs",
    "templates/item/parts/item-cyberware-attributes.hbs",
    "templates/item/parts/item-drug-attributes.hbs",
    "templates/item/parts/item-asset-attributes.hbs",
    "templates/item/parts/item-power-attributes.hbs",
    "templates/item/parts/item-vehicle-attributes.hbs"
  ];

  console.log("CWN | 로딩할 템플릿 경로:", templatePaths);
  const result = await loadTemplates(templatePaths);
  console.log("CWN | 템플릿 사전 로딩 완료");
  return result;
} 