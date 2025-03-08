import { CWNWeapon } from "./weapon.js";
import { CWNSkill } from "./skill.js";
import { CWNFocus } from "./focus.js";
import { CWNArmor } from "./armor.js";
import { CWNAsset } from "./asset.js";
import { CWNCyberware } from "./cyberware.js";
import { CWNGear } from "./gear.js";
import { CWNDrug } from "./drug.js";
import { CWNPower } from "./power.js";
import { CWNVehicle } from "./vehicle.js";

/**
 * 아이템 타입별 클래스 매핑
 * @type {Object}
 */
export const ItemClassMap = {
  weapon: CWNWeapon,
  skill: CWNSkill,
  focus: CWNFocus,
  armor: CWNArmor,
  asset: CWNAsset,
  cyberware: CWNCyberware,
  gear: CWNGear,
  drug: CWNDrug,
  power: CWNPower,
  vehicle: CWNVehicle
};

/**
 * 아이템 타입에 따른 클래스를 반환합니다.
 * @param {string} type 아이템 타입
 * @returns {Class} 아이템 클래스
 */
export function getItemClass(type) {
  return ItemClassMap[type] || null;
}

export {
  CWNWeapon,
  CWNSkill,
  CWNFocus,
  CWNArmor,
  CWNAsset,
  CWNCyberware,
  CWNGear,
  CWNDrug,
  CWNPower,
  CWNVehicle
}; 