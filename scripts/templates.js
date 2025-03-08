/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export async function preloadHandlebarsTemplates() {
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
    "systems/cwn-system/templates/item/parts/item-effects.hbs"
  ];

  return loadTemplates(templatePaths);
} 