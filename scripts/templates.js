/**
 * 핸들바 템플릿 사전 로딩
 * @return {Promise}
 */
export async function preloadHandlebarsTemplates() {
  console.log("CWN | 핸들바 템플릿 사전 로드 시작");
  
  // 시스템 ID 가져오기
  const systemId = game.system.id;
  console.log(`CWN | 현재 시스템 ID: "${systemId}"`);
  
  // 템플릿 경로 정의
  const templatePaths = [
    // 액터 템플릿
    `systems/${systemId}/templates/actor/actor-character-sheet.hbs`,
    `systems/${systemId}/templates/actor/actor-npc-sheet.hbs`,
    
    // 아이템 템플릿
    `systems/${systemId}/templates/item/item-sheet.hbs`,
    `systems/${systemId}/templates/item/item-armor-sheet.hbs`,
    `systems/${systemId}/templates/item/item-weapon-sheet.hbs`,
    `systems/${systemId}/templates/item/item-gear-sheet.hbs`,
    `systems/${systemId}/templates/item/item-cyberware-sheet.hbs`,
    `systems/${systemId}/templates/item/item-focus-sheet.hbs`,
    
    // 부분 템플릿
    `systems/${systemId}/templates/actor/parts/actor-features.hbs`,
    `systems/${systemId}/templates/actor/parts/actor-items.hbs`,
    `systems/${systemId}/templates/actor/parts/actor-spells.hbs`,
    `systems/${systemId}/templates/actor/parts/actor-effects.hbs`,
    `systems/${systemId}/templates/item/parts/item-attributes.hbs`
  ];
  
  // 각 템플릿 경로 확인
  for (const path of templatePaths) {
    console.log(`CWN | 템플릿 확인: ${path}`);
    try {
      const response = await fetch(path);
      console.log(`CWN | 템플릿 존재 여부: ${path} - ${response.ok ? '존재함' : '존재하지 않음'}`);
      if (!response.ok) {
        console.error(`CWN | 템플릿을 찾을 수 없음: ${path}`);
      }
    } catch (error) {
      console.error(`CWN | 템플릿 확인 중 오류 발생: ${path}`, error);
    }
  }
  
  // 템플릿 등록
  return loadTemplates(templatePaths).then(() => {
    console.log("CWN | 핸들바 템플릿 사전 로드 완료");
  }).catch(error => {
    console.error("CWN | 핸들바 템플릿 사전 로드 실패:", error);
  });
} 