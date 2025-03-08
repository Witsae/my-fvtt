import { CWNItem } from "../item/item.js";
import { ValidatedDialog } from "../utils/ValidatedDialog.js";

/**
 * 기술 아이템 클래스
 * @extends {CWNItem}
 */
export class CWNSkill extends CWNItem {
  /**
   * 대화 상자 인스턴스
   * @type {Dialog}
   */
  popUpDialog;

  /**
   * 기술 굴림을 수행합니다.
   * @param {string} skillName 기술 이름
   * @param {string} statShortName 능력치 약자
   * @param {number} statMod 능력치 수정치
   * @param {string} dice 주사위 공식
   * @param {number} skillRank 기술 등급
   * @param {number|string} modifier 추가 수정치
   * @returns {Promise<void>}
   */
  async rollSkill(skillName, statShortName, statMod, dice, skillRank, modifier) {
    const rollMode = game.settings.get("core", "rollMode");
    
    // 주사위 공식 생성
    const formula = `${dice} + @stat + @skill + @modifier`;
    
    // 굴림 수행
    const roll = new Roll(formula, {
      skill: skillRank,
      modifier: modifier,
      stat: statMod
    });
    await roll.evaluate({async: true});
    
    // 제목 생성
    const title = `기술 판정: ${statShortName}/${skillName}`;
    
    // 채팅 메시지 생성
    roll.toMessage({
      speaker: ChatMessage.getSpeaker(),
      flavor: title
    }, { rollMode });
  }

  /**
   * 기술 굴림 대화 상자를 표시합니다.
   * @param {boolean} shiftKey Shift 키 누름 여부
   * @returns {Promise<void>}
   * @override
   */
  async roll(shiftKey = false) {
    const skillData = this.system;
    const template = "systems/cwn-system/templates/dialogs/skill-roll.hbs";
    
    if (!this.actor) {
      ui.notifications?.error("액터가 없는 아이템으로 굴림을 시도했습니다.");
      return;
    } else if (this.actor.type != "character") {
      ui.notifications?.error("캐릭터가 아닌 액터로 기술 굴림을 시도했습니다.");
      return;
    }
    
    const skillName = this.name;
    const actorData = this.actor.system;
    
    // 기본 능력치 결정
    const defaultStat = skillData.attribute || "int";
    const defaultStatMod = actorData.attributes[defaultStat].mod;
    
    // 기본 주사위 공식 결정
    let defaultDice = "2d6";
    if (skillData.level >= 3) defaultDice = "3d6kh2"; // 3d6, 높은 2개 유지
    if (skillData.level >= 5) defaultDice = "4d6kh2"; // 4d6, 높은 2개 유지
    
    // 커스텀 주사위 공식 사용 여부
    const useCustomDice = game.settings.get("cwn-system", "useCustomRollFormula");
    if (useCustomDice) {
      defaultDice = game.settings.get("cwn-system", "customRollFormula");
    }
    
    // 템플릿 데이터 준비
    const templateData = {
      actor: this.actor,
      item: this,
      defaultStat: defaultStat,
      defaultStatMod: defaultStatMod,
      defaultDice: defaultDice,
      skillRank: skillData.level
    };
    
    // 대화 상자 렌더링
    const html = await renderTemplate(template, templateData);
    
    // 이전 대화 상자 닫기
    if (this.popUpDialog) this.popUpDialog.close();
    
    // 굴림 함수
    const _doRoll = async (html) => {
      const form = html.find("form")[0];
      
      // 폼 데이터 가져오기
      const stat = form.stat.value;
      const statMod = parseInt(form.statMod.value) || 0;
      const dice = form.dice.value;
      const skillRank = parseInt(form.skillRank.value) || 0;
      const modifier = parseInt(form.modifier.value) || 0;
      
      // 기술 굴림 수행
      await this.rollSkill(skillName, stat, statMod, dice, skillRank, modifier);
    };
    
    // 대화 상자 생성
    this.popUpDialog = new ValidatedDialog({
      title: `${skillName} 기술 판정`,
      content: html,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice-d20"></i>',
          label: "굴림",
          callback: _doRoll
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "취소"
        }
      },
      default: "roll"
    }, {
      classes: ["dialog", "cwn", "skill-roll"],
      width: 400,
      height: "auto",
      failCallback: () => {}
    });
    
    this.popUpDialog.render(true);
  }
} 