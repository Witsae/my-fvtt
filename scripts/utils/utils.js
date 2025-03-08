/**
 * 채팅 메시지에 이벤트 리스너를 추가합니다.
 * @param {ChatMessage} message 채팅 메시지
 * @param {JQuery} html 채팅 메시지의 HTML 요소
 */
export function chatListeners(message, html) {
  html.on("click", ".card-buttons button", _onChatCardAction.bind(this));
  
  const foundDiv = [];
  html.find(".dice-roll").each((_i, _d) => {
    foundDiv.push(_d);
  });
  
  if (foundDiv.length == 1) {
    _addHealthButtons($(foundDiv[0]));
  } else if (foundDiv.length > 1) {
    for (const div of foundDiv) {
      _addRerollButton($(div));
    }
  }
  
  // 체력 버튼
  html.find(".roll-damage").each((_i, div) => {
    _addHealthButtons($(div));
  });
  
  // 설명 토글
  const longDesc = html.find(".longShowDesc");
  if (longDesc.length) {
    const bind = function(event) {
      event.preventDefault();
      const hiddenDesc = html.find(".hiddenLong");
      const shownDesc = html.find(".hiddenShort");
      hiddenDesc.show();
      shownDesc.hide();
    };
    longDesc.on("click", bind);
  }
  
  const shortDesc = html.find(".longHideDesc");
  if (shortDesc.length) {
    const bind = function(event) {
      event.preventDefault();
      const hiddenDesc = html.find(".hiddenLong");
      const shownDesc = html.find(".hiddenShort");
      hiddenDesc.hide();
      shownDesc.show();
    };
    shortDesc.on("click", bind);
  }
}

/**
 * 재굴림 버튼을 생성합니다.
 * @param {string} diceRoll 주사위 굴림 문자열
 * @param {boolean} isAttack 공격 굴림인지 여부
 * @returns {JQuery} 생성된 버튼 요소
 */
function getRerollButton(diceRoll, isAttack) {
  const button = $(`<button class="dice-reroll" data-roll="${diceRoll}" data-attack="${isAttack}"><i class="fas fa-dice"></i> 재굴림</button>`);
  return button;
}

/**
 * 주사위 굴림 요소에 재굴림 버튼을 추가합니다.
 * @param {JQuery} html 주사위 굴림 요소
 */
export function _addRerollButton(html) {
  const formula = html.find(".dice-formula").text();
  if (!formula) return;
  
  const isAttack = formula.includes("1d20");
  const button = getRerollButton(formula, isAttack);
  
  button.on("click", async (event) => {
    event.preventDefault();
    const formula = event.currentTarget.dataset.roll;
    const roll = new Roll(formula);
    await roll.evaluate({async: true});
    
    const messageData = {
      flavor: "재굴림",
      speaker: ChatMessage.getSpeaker(),
      sound: CONFIG.sounds.dice
    };
    
    roll.toMessage(messageData);
  });
  
  html.append(button);
}

/**
 * 주사위 굴림 요소에 체력 변경 버튼을 추가합니다.
 * @param {JQuery} html 주사위 굴림 요소
 */
export function _addHealthButtons(html) {
  const total = html.find(".dice-total").text();
  if (!total || isNaN(parseInt(total))) return;
  
  const damageButton = $(`<button class="apply-damage" data-value="${total}"><i class="fas fa-user-minus"></i> 피해 적용</button>`);
  const healButton = $(`<button class="apply-healing" data-value="${total}"><i class="fas fa-user-plus"></i> 회복 적용</button>`);
  
  damageButton.on("click", async (event) => {
    event.preventDefault();
    const value = parseInt(event.currentTarget.dataset.value);
    await applyHealthChange(-value);
  });
  
  healButton.on("click", async (event) => {
    event.preventDefault();
    const value = parseInt(event.currentTarget.dataset.value);
    await applyHealthChange(value);
  });
  
  const buttonContainer = $('<div class="health-buttons"></div>');
  buttonContainer.append(damageButton);
  buttonContainer.append(healButton);
  
  html.append(buttonContainer);
}

/**
 * 선택된 토큰에 체력 변경을 표시합니다.
 * @param {Token} token 토큰
 * @param {string} fillColor 채우기 색상
 * @param {number} total 변경량
 */
export async function showValueChange(token, fillColor, total) {
  const text = Math.abs(total).toString();
  const textStyle = {
    fill: fillColor,
    fontFamily: "Signika",
    fontSize: 40,
    strokeThickness: 4,
    stroke: "#000000"
  };
  
  const textObj = new PIXI.Text(text, textStyle);
  textObj.anchor.set(0.5, 0.5);
  textObj.position.set(token.w / 2, token.h / 2);
  
  token.addChild(textObj);
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  token.removeChild(textObj);
  textObj.destroy();
}

/**
 * 선택된 토큰에 체력 변경을 적용합니다.
 * @param {number} value 변경량 (양수: 회복, 음수: 피해)
 */
export async function applyHealthChange(value) {
  const tokens = canvas.tokens.controlled;
  if (!tokens.length) {
    ui.notifications.warn("토큰을 선택해주세요.");
    return;
  }
  
  for (const token of tokens) {
    const actor = token.actor;
    if (!actor) continue;
    
    const health = actor.system.health;
    if (!health) continue;
    
    const newValue = Math.clamped(health.value + value, 0, health.max);
    const fillColor = value > 0 ? "#18520b" : "#aa0200";
    
    await showValueChange(token, fillColor, value);
    await actor.update({"system.health.value": newValue});
  }
}

/**
 * 캐릭터 대상을 찾습니다.
 * @returns {Actor[]} 캐릭터 액터 배열
 */
export function _findCharTargets() {
  const targets = [];
  
  // 선택된 토큰의 액터 추가
  const tokens = canvas.tokens.controlled;
  for (const token of tokens) {
    if (token.actor && (token.actor.type === "character" || token.actor.type === "npc")) {
      targets.push(token.actor);
    }
  }
  
  // 선택된 토큰이 없으면 사용자의 캐릭터 추가
  if (!targets.length && game.user.character) {
    targets.push(game.user.character);
  }
  
  return targets;
}

/**
 * 채팅 카드 액션을 처리합니다.
 * @param {Event} event 클릭 이벤트
 */
export async function _onChatCardAction(event) {
  event.preventDefault();
  
  const button = event.currentTarget;
  const card = button.closest(".chat-card");
  const messageId = card.closest(".message").dataset.messageId;
  const message = game.messages.get(messageId);
  
  if (!message) return;
  
  const action = button.dataset.action;
  const targets = _findCharTargets();
  
  if (!targets.length) {
    ui.notifications.warn("대상을 선택해주세요.");
    return;
  }
  
  // 액션 처리
  switch (action) {
    case "damage":
      const damageValue = parseInt(button.dataset.value);
      if (isNaN(damageValue)) return;
      
      for (const target of targets) {
        const health = target.system.health;
        if (!health) continue;
        
        const newValue = Math.max(health.value - damageValue, 0);
        await target.update({"system.health.value": newValue});
      }
      break;
      
    case "heal":
      const healValue = parseInt(button.dataset.value);
      if (isNaN(healValue)) return;
      
      for (const target of targets) {
        const health = target.system.health;
        if (!health) continue;
        
        const newValue = Math.min(health.value + healValue, health.max);
        await target.update({"system.health.value": newValue});
      }
      break;
  }
}

/**
 * 아이템 타입에 따른 기본 이미지를 반환합니다.
 * @param {string} itemType 아이템 타입
 * @returns {string} 이미지 경로
 */
export function getDefaultImage(itemType) {
  const iconMap = {
    skill: "icons/skills/trades/academics-study-reading-book.webp",
    focus: "icons/magic/symbols/runes-star-pentagon-blue.webp",
    weapon: "icons/weapons/swords/sword-guard-steel.webp",
    armor: "icons/equipment/chest/breastplate-layered-leather-steel.webp",
    gear: "icons/containers/bags/pouch-simple-brown.webp",
    cyberware: "icons/commodities/tech/device-transponder-blue.webp",
    asset: "icons/environment/settlement/building-tower-guard.webp"
  };
  
  return iconMap[itemType] || "icons/svg/item-bag.svg";
}

/**
 * 속성 통계를 계산합니다.
 * @param {Object} stats 속성 통계 객체
 */
export function calculateStats(stats) {
  for (const [key, stat] of Object.entries(stats)) {
    stat.mod = Math.floor((stat.value - 10) / 2);
  }
}

/**
 * 함수 호출의 동시성을 제한합니다.
 * @param {Function} fn 제한할 함수
 * @returns {Function} 제한된 함수
 */
export function limitConcurrency(fn) {
  let running = false;
  return async function(...args) {
    if (running) return;
    running = true;
    try {
      return await fn.apply(this, args);
    } finally {
      running = false;
    }
  };
}

/**
 * 컴펜디움에서 스킬을 초기화합니다.
 * @param {Actor} actor 액터
 */
export async function initCompendSkills(actor) {
  const skillPack = game.packs.get("cwn-system.skills");
  if (!skillPack) {
    ui.notifications.warn("스킬 컴펜디움을 찾을 수 없습니다.");
    return;
  }
  
  const skills = await skillPack.getDocuments();
  const existingSkills = actor.items.filter(i => i.type === "skill").map(i => i.name);
  const skillsToAdd = skills.filter(s => !existingSkills.includes(s.name));
  
  if (skillsToAdd.length) {
    await actor.createEmbeddedDocuments("Item", skillsToAdd.map(s => s.toObject()));
    ui.notifications.info(`${skillsToAdd.length}개의 스킬이 추가되었습니다.`);
  } else {
    ui.notifications.info("추가할 새로운 스킬이 없습니다.");
  }
} 