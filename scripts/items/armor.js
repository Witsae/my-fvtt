import { CWNItem } from "../item/item.js";

/**
 * 방어구 아이템 클래스
 * @extends {CWNItem}
 */
export class CWNArmor extends CWNItem {
  /**
   * 대화 상자 인스턴스
   * @type {Dialog}
   */
  popUpDialog;

  /**
   * 파생 데이터를 준비합니다.
   * @override
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    
    const systemData = this.system;
    
    // 설정 데이터 추가
    systemData.settings = {
      useCWNArmor: game.settings.get("cwn-system", "useCWNArmor") ? true : false,
      useTrauma: game.settings.get("cwn-system", "useTrauma") ? true : false
    };
  }
  
  /**
   * 방어구 정보를 채팅에 표시합니다.
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
    
    // 방어구 정보 추가
    content += `<div><strong>${game.i18n.localize("CWN.AC")}:</strong> ${item.system.ac}</div>`;
    
    if (item.system.settings.useCWNArmor && item.system.meleeAc) {
      content += `<div><strong>${game.i18n.localize("CWN.Chat.MeleeAC")}:</strong> ${item.system.meleeAc}</div>`;
    }
    
    if (item.system.settings.useTrauma && item.system.traumaDiePenalty) {
      content += `<div><strong>${game.i18n.localize("CWN.Chat.TraumaDiePenalty")}:</strong> ${item.system.traumaDiePenalty}</div>`;
    }
    
    if (item.system.type) {
      content += `<div><strong>${game.i18n.localize("CWN.Type")}:</strong> ${item.system.type}</div>`;
    }
    
    if (item.system.encumbrance) {
      content += `<div><strong>${game.i18n.localize("CWN.Weight")}:</strong> ${item.system.encumbrance}</div>`;
    }
    
    if (item.system.price) {
      content += `<div><strong>${game.i18n.localize("CWN.Price")}:</strong> ${item.system.price}</div>`;
    }
    
    // 채팅 메시지 생성
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: content
    });
  }
} 