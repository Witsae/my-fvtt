/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export async function preloadHandlebarsTemplates() {
  const templatePaths = [
    // Actor partials
    "systems/my-fvtt-cwn/templates/actor/parts/actor-attributes.hbs",
    "systems/my-fvtt-cwn/templates/actor/parts/actor-skills.hbs",
    "systems/my-fvtt-cwn/templates/actor/parts/actor-items.hbs",
    "systems/my-fvtt-cwn/templates/actor/parts/actor-features.hbs",
    "systems/my-fvtt-cwn/templates/actor/parts/actor-biography.hbs",
    "systems/my-fvtt-cwn/templates/actor/parts/actor-saves.hbs",
    "systems/my-fvtt-cwn/templates/actor/parts/actor-effects.hbs",
    
    // Item partials
    "systems/my-fvtt-cwn/templates/item/parts/item-header.hbs",
    "systems/my-fvtt-cwn/templates/item/parts/item-description.hbs",
    "systems/my-fvtt-cwn/templates/item/parts/item-attributes.hbs",
    "systems/my-fvtt-cwn/templates/item/parts/item-effects.hbs"
  ];

  return loadTemplates(templatePaths);
} 