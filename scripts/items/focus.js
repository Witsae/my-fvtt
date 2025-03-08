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
      ui.notifications?.error("액터가 없는 아이템으로 굴림을 시도했습니다.");
      return;
    }
    
    // 기본 템플릿 데이터 준비
    const item = this;
    let content = `<h3>${item.name}</h3>`;
    
    // 설명 추가
    if (item.system.description) {
      content += `<div class="flavor-text">${item.system.description}</div>`;
    } else {
      content += "<div class='flavor-text'>설명 없음</div>";
    }
    
    // 레벨별 효과 추가
    if (item.system.level1) {
      content += `<div><strong>레벨 1:</strong> ${item.system.level1}</div>`;
    }
    
    if (item.system.level2) {
      content += `<div><strong>레벨 2:</strong> ${item.system.level2}</div>`;
    }
    
    // 채팅 메시지 생성
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: content
    });
  }
} 