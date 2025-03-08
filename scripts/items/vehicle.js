import { CWNItem } from "../item/item.js";

/**
 * 차량 아이템 클래스
 * @extends {CWNItem}
 */
export class CWNVehicle extends CWNItem {
  /**
   * 차량 정보를 채팅에 표시합니다.
   * @param {boolean} shiftKey Shift 키 누름 여부
   * @returns {Promise<void>}
   * @override
   */
  async roll(shiftKey = false) {
    if (!this.actor) {
      ui.notifications?.error(game.i18n.localize("CWN.Errors.NoActor"));
      return;
    }
    
    // 기본 템플릿 데이터 준비
    const item = this;
    let content = `<h3>${item.name}</h3>`;
    
    // 설명 추가
    if (item.system.description) {
      content += `<div class="flavor-text">${item.system.description}</div>`;
    } else {
      content += `<div class="flavor-text">${game.i18n.localize("CWN.Chat.NoDescription")}</div>`;
    }
    
    // 차량 정보 추가
    if (item.system.type) {
      content += `<div><strong>${game.i18n.localize("CWN.Type")}:</strong> ${item.system.type}</div>`;
    }
    
    if (item.system.armor) {
      content += `<div><strong>${game.i18n.localize("CWN.Armor")}:</strong> ${item.system.armor}</div>`;
    }
    
    if (item.system.hp) {
      content += `<div><strong>${game.i18n.localize("CWN.HP")}:</strong> ${item.system.hp}</div>`;
    }
    
    if (item.system.speed) {
      content += `<div><strong>${game.i18n.localize("CWN.Speed")}:</strong> ${item.system.speed}</div>`;
    }
    
    if (item.system.crew) {
      content += `<div><strong>${game.i18n.localize("CWN.Crew")}:</strong> ${item.system.crew}</div>`;
    }
    
    if (item.system.price) {
      content += `<div><strong>${game.i18n.localize("CWN.Price")}:</strong> ${item.system.price}</div>`;
    }
    
    // 태그 추가
    if (item.system.tags && item.system.tags.length > 0) {
      content += `<div><strong>${game.i18n.localize("CWN.Tags")}:</strong> ${item.system.tags.join(", ")}</div>`;
    }
    
    // 채팅 메시지 생성
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: content
    });
  }
} 