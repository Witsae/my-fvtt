import { CWNItem } from "../item/item.js";
import { ValidatedDialog } from "../utils/ValidatedDialog.js";

/**
 * 무기 아이템 클래스
 * @extends {CWNItem}
 */
export class CWNWeapon extends CWNItem {
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
      useTrauma: game.settings.get("cwn-system", "useTrauma") ? true : false
    };
  }

  /**
   * 탄약 데이터를 가져옵니다.
   * @returns {Object} 탄약 데이터
   */
  get ammo() {
    return this.system.ammo;
  }

  /**
   * 연사 가능 여부를 확인합니다.
   * @returns {boolean} 연사 가능 여부
   */
  get canBurstFire() {
    return (
      this.ammo.burst &&
      (this.ammo.type === "infinite" ||
        (this.ammo.type !== "none" && this.ammo.value >= 3))
    );
  }

  /**
   * 탄약이 있는지 확인합니다.
   * @returns {boolean} 탄약 유무
   */
  get hasAmmo() {
    return (
      this.ammo.type === "none" ||
      this.ammo.type === "infinite" ||
      this.ammo.value > 0
    );
  }

  /**
   * 공격 굴림을 수행합니다.
   * @param {number} damageBonus 데미지 보너스
   * @param {number} stat 능력치 수정치
   * @param {number} skillMod 기술 수정치
   * @param {number} modifier 추가 수정치
   * @param {boolean} useBurst 연사 사용 여부
   * @returns {Promise<void>}
   */
  async rollAttack(damageBonus = 0, stat = 0, skillMod = 0, modifier = 0, useBurst = false) {
    if (!this.actor) {
      ui.notifications?.error("액터가 없는 아이템으로 공격 굴림을 시도했습니다.");
      return;
    }
    
    if (!this.hasAmmo) {
      ui.notifications?.error(`${this.name}의 탄약이 부족합니다!`);
      return;
    }
    
    // 탄약 소모
    if (this.ammo.type !== "none" && this.ammo.type !== "infinite") {
      const ammoUsed = useBurst ? 3 : 1;
      await this.update({
        "system.ammo.value": Math.max(0, this.ammo.value - ammoUsed)
      });
    }
    
    // 공격 굴림 수식
    let formula = "1d20";
    
    // 수정치 적용
    const totalMod = stat + skillMod + modifier + (this.system.attackBonus || 0);
    if (totalMod !== 0) {
      formula += totalMod > 0 ? ` + ${totalMod}` : ` - ${Math.abs(totalMod)}`;
    }
    
    // 연사 보너스 적용
    if (useBurst) {
      formula += " + 2";
    }
    
    // 굴림 수행
    const roll = await new Roll(formula).evaluate({async: true});
    
    // 데미지 굴림 준비
    let damageFormula = this.system.damage || "1d6";
    
    // 데미지 보너스 적용
    if (damageBonus !== 0) {
      damageFormula += damageBonus > 0 ? ` + ${damageBonus}` : ` - ${Math.abs(damageBonus)}`;
    }
    
    // 연사 데미지 보너스 적용
    if (useBurst) {
      damageFormula += " + 2";
    }
    
    // 데미지 굴림 수행
    const damageRoll = await new Roll(damageFormula).evaluate({async: true});
    
    // 채팅 메시지 생성
    const weaponType = this.system.range === "melee" ? "근접" : "원거리";
    const burstText = useBurst ? " (연사)" : "";
    const flavor = `${this.name} - ${weaponType} 공격${burstText}`;
    
    // 템플릿 데이터 준비
    const templateData = {
      actor: this.actor,
      item: this,
      roll: roll,
      damageRoll: damageRoll,
      flavor: flavor,
      weaponType: weaponType,
      useBurst: useBurst
    };
    
    // 템플릿 렌더링
    const template = "systems/cwn-system/templates/chat/weapon-attack.hbs";
    const content = await renderTemplate(template, templateData);
    
    // 채팅 메시지 생성
    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({actor: this.actor}),
      flavor: flavor,
      content: content,
      sound: CONFIG.sounds.dice,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      rolls: [roll, damageRoll]
    });
  }

  /**
   * 무기 굴림 대화 상자를 표시합니다.
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
    const template = "systems/cwn-system/templates/dialogs/weapon-roll.hbs";
    
    // 템플릿 데이터 준비
    const actorData = this.actor.system;
    const weaponData = this.system;
    
    // 기본 능력치 결정
    const defaultStat = weaponData.range === "melee" ? "str" : "dex";
    const defaultStatMod = actorData.attributes[defaultStat].mod;
    
    // 기본 기술 결정
    const defaultSkill = weaponData.range === "melee" ? "stab" : "shoot";
    const skill = this.actor.getSkill(defaultSkill);
    const skillMod = skill ? skill.system.level : 0;
    
    // 템플릿 데이터
    const templateData = {
      actor: this.actor,
      item: this,
      defaultStat: defaultStat,
      defaultStatMod: defaultStatMod,
      defaultSkill: defaultSkill,
      skillMod: skillMod,
      canBurstFire: this.canBurstFire,
      hasAmmo: this.hasAmmo
    };
    
    // 대화 상자 렌더링
    const html = await renderTemplate(template, templateData);
    
    // 이전 대화 상자 닫기
    if (this.popUpDialog) this.popUpDialog.close();
    
    // 굴림 함수
    const _rollWeapon = async (html) => {
      const form = html.find("form")[0];
      
      // 폼 데이터 가져오기
      const stat = form.stat.value;
      const statMod = parseInt(form.statMod.value) || 0;
      const skillName = form.skill.value;
      const skillMod = parseInt(form.skillMod.value) || 0;
      const modifier = parseInt(form.modifier.value) || 0;
      const damageBonus = parseInt(form.damageBonus.value) || 0;
      const useBurst = form.burst?.checked || false;
      
      // 공격 굴림 수행
      await this.rollAttack(damageBonus, statMod, skillMod, modifier, useBurst);
    };
    
    // 대화 상자 생성
    this.popUpDialog = new ValidatedDialog({
      title: `${this.name} 공격`,
      content: html,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice-d20"></i>',
          label: "굴림",
          callback: _rollWeapon
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "취소"
        }
      },
      default: "roll"
    }, {
      classes: ["dialog", "cwn", "weapon-roll"],
      width: 400,
      height: "auto",
      failCallback: () => {}
    });
    
    this.popUpDialog.render(true);
  }
} 