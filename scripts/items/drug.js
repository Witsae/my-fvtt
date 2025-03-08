import { CWNItem } from "../item/item.js";

/**
 * 약물 아이템 클래스
 * @extends {CWNItem}
 */
export class CWNDrug extends CWNItem {
  /**
   * 약물 정보를 채팅에 표시합니다.
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
    
    // 약물 정보 추가
    if (item.system.duration) {
      content += `<div><strong>${game.i18n.localize("CWN.Duration")}:</strong> ${item.system.duration}</div>`;
    }
    
    if (item.system.effect) {
      content += `<div><strong>${game.i18n.localize("CWN.Effect")}:</strong> ${item.system.effect}</div>`;
    }
    
    if (item.system.sideEffect) {
      content += `<div><strong>${game.i18n.localize("CWN.SideEffect")}:</strong> ${item.system.sideEffect}</div>`;
    }
    
    if (item.system.overdose) {
      content += `<div><strong>${game.i18n.localize("CWN.Overdose")}:</strong> ${item.system.overdose}</div>`;
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