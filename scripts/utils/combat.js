/**
 * Extend the base Combatant class for CWN.
 * @extends {Combatant}
 */
export class CWNCombatant extends Combatant {
  /**
   * 이니셔티브 공식을 계산합니다.
   * @override
   * @returns {string} 이니셔티브 공식
   * @protected
   */
  _getInitiativeFormula() {
    const actor = this.actor;
    
    if (!actor) {
      ui.notifications?.info("액터를 찾을 수 없습니다. 기본값 1d8을 사용합니다.");
      return "1d8";
    }
    
    // 캐릭터 이니셔티브
    if (actor.type === "character") {
      // 이니셔티브 어드밴티지 설정이 있는 경우
      if (actor.system.tweak?.advInit) {
        return "{1d8,1d8}kh";
      }
      
      // 기본 이니셔티브: 1d8 + 민첩 수정치
      const dexMod = actor.system.attributes.dex.mod;
      return `1d8+${dexMod}`;
    }
    
    // NPC 이니셔티브
    if (actor.type === "npc") {
      return "1d8";
    }
    
    // 기본 이니셔티브
    return "1d8";
  }
}

/**
 * 전투 관련 유틸리티 함수들
 */
export const CombatUtils = {
  /**
   * 전투 시작 시 이니셔티브를 자동으로 굴립니다.
   * @param {Combat} combat 전투 인스턴스
   */
  async rollInitiative(combat) {
    const combatants = combat.combatants.filter(c => !c.initiative);
    if (!combatants.length) return;
    
    await combat.rollInitiative(
      combatants.map(c => c.id),
      {
        formula: "1d8 + @attributes.dex.mod",
        messageOptions: {
          flavor: "이니셔티브 굴림"
        }
      }
    );
  },
  
  /**
   * 전투 라운드가 변경될 때 호출됩니다.
   * @param {Combat} combat 전투 인스턴스
   * @param {Object} updateData 업데이트 데이터
   * @param {Object} options 옵션
   */
  async onRoundChange(combat, updateData, options) {
    if (!updateData.round) return;
    
    // 라운드 시작 시 효과 처리
    if (updateData.round > 0) {
      for (const combatant of combat.combatants) {
        const actor = combatant.actor;
        if (!actor) continue;
        
        // 액티브 이펙트 처리
        const effects = actor.effects.filter(e => !e.disabled);
        for (const effect of effects) {
          const duration = effect.duration;
          if (!duration || !duration.rounds) continue;
          
          // 라운드 기반 효과 업데이트
          if (duration.rounds > 0) {
            await effect.update({
              "duration.rounds": duration.rounds - 1
            });
            
            // 효과 만료 처리
            if (duration.rounds - 1 <= 0) {
              await effect.delete();
              ChatMessage.create({
                speaker: ChatMessage.getSpeaker({actor}),
                content: `${actor.name}의 ${effect.label} 효과가 만료되었습니다.`
              });
            }
          }
        }
      }
    }
  }
}; 