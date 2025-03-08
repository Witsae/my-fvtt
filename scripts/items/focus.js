import { CWNItem } from "../item/item.js";

/**
 * 포커스 아이템 클래스
 * @extends {CWNItem}
 */
export class CWNFocus extends CWNItem {
  /**
   * 포커스 정보를 채팅에 표시합니다.
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
      content += `<div class='flavor-text'>${game.i18n.localize("CWN.Chat.NoDescription")}</div>`;
    }
    
    // 레벨별 효과 추가
    if (item.system.level1) {
      content += `<div><strong>${game.i18n.localize("CWN.Chat.Level1")}:</strong> ${item.system.level1}</div>`;
    }
    
    if (item.system.level2) {
      content += `<div><strong>${game.i18n.localize("CWN.Chat.Level2")}:</strong> ${item.system.level2}</div>`;
    }
    
    // 채팅 메시지 생성
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: content
    });
  }
} 