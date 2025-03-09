/**
 * 효과 관리 유틸리티 함수
 */

/**
 * 효과 관리 핸들러
 * @param {Event} event 이벤트 객체
 * @param {Actor|Item} owner 효과 소유자
 */
export function onManageActiveEffect(event, owner) {
  console.log("CWN | 효과 관리 핸들러 호출");
  event.preventDefault();
  const a = event.currentTarget;
  const li = a.closest("li");
  const effect = li ? owner.effects.get(li.dataset.effectId) : null;
  
  switch (a.dataset.action) {
    case "create":
      console.log("CWN | 새 효과 생성");
      return owner.createEmbeddedDocuments("ActiveEffect", [{
        label: "새 효과",
        icon: "icons/svg/aura.svg",
        origin: owner.uuid,
        "duration.rounds": 1,
        disabled: true
      }]);
    case "edit":
      console.log("CWN | 효과 편집:", effect);
      return effect.sheet.render(true);
    case "delete":
      console.log("CWN | 효과 삭제:", effect);
      return effect.delete();
    case "toggle":
      console.log("CWN | 효과 토글:", effect);
      return effect.update({disabled: !effect.disabled});
  }
}

/**
 * 효과 카테고리 준비
 * @param {Collection} effects 효과 컬렉션
 * @returns {Object} 카테고리별 효과 목록
 */
export function prepareActiveEffectCategories(effects) {
  console.log("CWN | 효과 카테고리 준비");
  
  // 효과 카테고리 정의
  const categories = {
    temporary: {
      type: "temporary",
      label: "CWN.EffectTemporary",
      effects: [],
      hidden: false
    },
    passive: {
      type: "passive",
      label: "CWN.EffectPassive",
      effects: [],
      hidden: false
    },
    inactive: {
      type: "inactive",
      label: "CWN.EffectInactive",
      effects: [],
      hidden: false
    },
    suppressed: {
      type: "suppressed",
      label: "CWN.EffectSuppressed",
      effects: [],
      hidden: true
    }
  };
  
  // 효과 분류
  for (let e of effects) {
    e.sourceName = e.sourceName || e.origin;
    e.isTemporary = e.duration.rounds || e.duration.seconds;
    
    if (e.isSuppressed) categories.suppressed.effects.push(e);
    else if (e.disabled) categories.inactive.effects.push(e);
    else if (e.isTemporary) categories.temporary.effects.push(e);
    else categories.passive.effects.push(e);
  }
  
  // 빈 카테고리 숨기기
  for (let [k, v] of Object.entries(categories)) {
    if (v.effects.length === 0) v.hidden = true;
  }
  
  console.log("CWN | 준비된 효과 카테고리:", categories);
  return categories;
} 