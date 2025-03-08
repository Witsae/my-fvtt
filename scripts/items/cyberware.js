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
      ui.notifications?.error("액터가 없는 아이템으로 굴림을 시도했습니다.");
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
    content += `<div><strong>시스템 스트레인:</strong> ${item.system.systemStrain}</div>`;
    
    if (item.system.location) {
      content += `<div><strong>위치:</strong> ${item.system.location}</div>`;
    }
    
    // 태그 추가
    if (item.system.tags && item.system.tags.length > 0) {
      content += `<div><strong>태그:</strong> ${item.system.tags.join(", ")}</div>`;
    }
    
    // 채팅 메시지 생성
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: content
    });
  }
} 