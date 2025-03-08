import { CWNItem } from "../item/item.js";
import { ValidatedDialog } from "../utils/ValidatedDialog.js";

/**
 * 팩션 자산 아이템 클래스
 * @extends {CWNItem}
 */
export class CWNAsset extends CWNItem {
  /**
   * 대화 상자 인스턴스
   * @type {Dialog}
   */
  popUpDialog;

  /**
   * 공격 굴림을 수행합니다.
   * @param {boolean} isOffense 공격인지 방어인지 여부
   * @returns {Promise<[Roll, Roll] | null>} 명중 굴림과 데미지 굴림
   */
  async getAttackRolls(isOffense = true) {
    const systemData = this.system;
    let hitBonus = 0;
    const damage = isOffense ? systemData.attackDamage : systemData.counter;
    
    if (!damage && isOffense) {
      ui.notifications?.info("자산에 대한 데미지 굴림이 없습니다.");
      return null;
    }
    
    const attackType = isOffense ? systemData.attackSource : systemData.assetType;
    
    if (!this.actor) {
      ui.notifications?.error("자산은 팩션과 연결되어야 합니다.");
      return null;
    }
    
    if (this.actor.type != "faction") {
      ui.notifications?.error("자산은 팩션과 연결되어야 합니다.");
      return null;
    }
    
    const actor = this.actor;
    
    // 공격 유형에 따른 보너스 계산
    if (attackType) {
      if (attackType === "cunning") {
        hitBonus = actor.system.cunningRating;
      } else if (attackType === "force") {
        hitBonus = actor.system.forceRating;
      } else if (attackType === "wealth") {
        hitBonus = actor.system.wealthRating;
      }
    }
    
    // 굴림 데이터 준비
    const rollData = {
      hitBonus
    };
    
    // 명중 굴림
    const hitRollStr = "1d10 + @hitBonus";
    const hitRoll = await new Roll(hitRollStr, rollData).evaluate({async: true});
    
    // 데미지 굴림
    let damageDice = isOffense ? systemData.attackDamage : systemData.counter;
    if (!damageDice) {
      damageDice = "0";
    }
    
    const damageRoll = await new Roll(damageDice, rollData).evaluate({async: true});
    
    return [hitRoll, damageRoll];
  }

  /**
   * 공격 또는 방어 굴림을 수행합니다.
   * @param {boolean} isOffense 공격인지 방어인지 여부
   * @returns {Promise<void>}
   */
  async _attack(isOffense = true) {
    if (!this.actor) {
      ui.notifications?.error("액터가 없는 아이템으로 굴림을 시도했습니다.");
      return;
    }
    
    // 굴림 수행
    const rolls = await this.getAttackRolls(isOffense);
    if (!rolls) return;
    
    const [hitRoll, damageRoll] = rolls;
    
    // 제목 생성
    const actionType = isOffense ? "공격" : "방어";
    const title = `${this.name} - ${actionType}`;
    
    // 템플릿 데이터 준비
    const templateData = {
      actor: this.actor,
      item: this,
      hitRoll: hitRoll,
      damageRoll: damageRoll,
      isOffense: isOffense,
      title: title
    };
    
    // 템플릿 렌더링
    const template = "systems/cwn-system/templates/chat/asset-attack.hbs";
    const content = await renderTemplate(template, templateData);
    
    // 채팅 메시지 생성
    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({actor: this.actor}),
      flavor: title,
      content: content,
      sound: CONFIG.sounds.dice,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      rolls: [hitRoll, damageRoll]
    });
  }

  /**
   * 자산 정보를 채팅에 표시합니다.
   * @param {boolean} shiftKey Shift 키 누름 여부
   * @returns {Promise<void>}
   * @override
   */
  async roll(shiftKey = false) {
    if (!this.actor) {
      ui.notifications?.error("액터가 없는 아이템으로 굴림을 시도했습니다.");
      return;
    }
    
    // 대화 상자 템플릿
    const template = "systems/cwn-system/templates/dialogs/asset-roll.hbs";
    
    // 템플릿 데이터 준비
    const templateData = {
      actor: this.actor,
      item: this,
      hasAttack: !!this.system.attackDamage,
      hasCounter: !!this.system.counter
    };
    
    // 대화 상자 렌더링
    const html = await renderTemplate(template, templateData);
    
    // 이전 대화 상자 닫기
    if (this.popUpDialog) this.popUpDialog.close();
    
    // 대화 상자 생성
    this.popUpDialog = new ValidatedDialog({
      title: `${this.name} 자산 액션`,
      content: html,
      buttons: {
        attack: {
          icon: '<i class="fas fa-fist-raised"></i>',
          label: "공격",
          callback: () => this._attack(true),
          condition: !!this.system.attackDamage
        },
        counter: {
          icon: '<i class="fas fa-shield-alt"></i>',
          label: "방어",
          callback: () => this._attack(false),
          condition: !!this.system.counter
        },
        info: {
          icon: '<i class="fas fa-info-circle"></i>',
          label: "정보",
          callback: () => this._showInfo()
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "취소"
        }
      },
      default: this.system.attackDamage ? "attack" : "info"
    }, {
      classes: ["dialog", "cwn", "asset-roll"],
      width: 400,
      height: "auto",
      failCallback: () => {}
    });
    
    this.popUpDialog.render(true);
  }
  
  /**
   * 자산 정보를 채팅에 표시합니다.
   * @returns {Promise<void>}
   */
  async _showInfo() {
    // 기본 템플릿 데이터 준비
    const item = this;
    let content = `<h3>${item.name}</h3>`;
    
    // 설명 추가
    if (item.system.description) {
      content += `<div class="flavor-text">${item.system.description}</div>`;
    }
    
    // 자산 정보 추가
    content += `<div><strong>유형:</strong> ${item.system.assetType}</div>`;
    content += `<div><strong>등급:</strong> ${item.system.rating}</div>`;
    
    if (item.system.cost) {
      content += `<div><strong>비용:</strong> ${item.system.cost}</div>`;
    }
    
    if (item.system.upkeep) {
      content += `<div><strong>유지비:</strong> ${item.system.upkeep}</div>`;
    }
    
    if (item.system.hp?.max) {
      content += `<div><strong>HP:</strong> ${item.system.hp.value}/${item.system.hp.max}</div>`;
    }
    
    if (item.system.attackDamage) {
      content += `<div><strong>공격 데미지:</strong> ${item.system.attackDamage}</div>`;
    }
    
    if (item.system.counter) {
      content += `<div><strong>방어 데미지:</strong> ${item.system.counter}</div>`;
    }
    
    // 채팅 메시지 생성
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: content
    });
  }
} 