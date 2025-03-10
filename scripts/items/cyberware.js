import { CWNItem } from "../item/item.js";

/**
 * 사이버웨어 아이템 클래스
 * @extends {CWNItem}
 */
export class CWNCyberware extends CWNItem {
  /**
   * 사이버웨어 정보를 채팅에 표시합니다.
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
    }
    
    // 사이버웨어 정보 추가
    content += `<div><strong>${game.i18n.localize("CWN.Chat.SystemStrain")}:</strong> ${item.system.systemStrain}</div>`;
    
    if (item.system.location) {
      content += `<div><strong>${game.i18n.localize("CWN.Location")}:</strong> ${item.system.location}</div>`;
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