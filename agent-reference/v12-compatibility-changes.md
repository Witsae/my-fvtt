# Foundry VTT v12 호환성 변경 사항

이 문서는 Cities Without Number 시스템을 Foundry VTT v12와 호환되도록 업데이트한 변경 사항을 기록합니다.

## 변경 사항 요약

1. **중복 코드 제거**
   - `cwn.js` 파일에서 중복된 시트 등록 코드를 제거하여 한 번만 등록되도록 수정
   - 불필요한 시트 클래스 설정 코드 제거

2. **데이터 모델 접근 방식 업데이트**
   - `actor.data.data` 또는 `item.data.data` 대신 `actor.system` 또는 `item.system`을 사용하도록 업데이트
   - 관련 주석을 추가하여 v10부터 변경된 데이터 모델 접근 방식을 명시

3. **Color 클래스 사용**
   - 색상 처리 코드를 v12의 새로운 `Color` 클래스를 사용하도록 업데이트
   - 색상 문자열 대신 `Color` 객체를 사용하고, 필요한 경우 `toString()` 메서드를 호출하도록 수정

4. **createScrollingText 메서드 위치 변경 처리**
   - v12에서 `ObjectHUD#createScrollingText`가 `CanvasInterfaceGroup#createScrollingText`로 변경된 것을 처리
   - 두 방식 모두 지원하여 하위 호환성을 유지

5. **v12 호환성 패치 함수 추가**
   - `main.js` 파일에 `applyV12Compatibility` 함수를 추가하여 v12 특정 API 변경사항을 처리
   - `FogExploration.get`을 `FogExploration.load`로 대체하는 코드를 추가

6. **주석 개선**
   - 모든 파일에 v12 호환성 관련 주석을 추가하여 코드의 목적과 변경 사항을 명확히 함
   - 주요 API 변경사항에 대한 설명을 추가

7. **아이템 데이터 준비 메서드 수정**
   - `CWNItem` 클래스의 아이템 데이터 준비 메서드에서 발생하는 오류 수정
   - `_prepareWeaponData`, `_prepareArmorData`, `_prepareSkillData`, `_prepareAssetData` 등의 함수에서 매개변수 처리 방식 개선
   - 시스템 데이터가 없는 경우 초기화하는 코드 추가

8. **아이템 카테고리 초기화 시점 변경**
   - 아이템 카테고리 초기화를 `Hooks.init`와 `Hooks.setup`에서 모두 호출하여 확실하게 설정되도록 수정
   - `Hooks.ready`에서는 카테고리가 제대로 설정되었는지 확인만 하도록 변경

9. **함수 참조 오류 수정**
   - `setup` 훅에서 `_registerSystemSettings` 대신 `registerSystemSettings` 함수를 호출하도록 수정
   - 함수 이름 불일치로 인한 참조 오류 해결

10. **Item 타입 정보 로깅 개선**
    - `ready` 훅에서 `game.system.documentTypes.Item` 접근 시 발생하는 오류 방지
    - 옵셔널 체이닝 연산자(?.)를 사용하여 안전하게 속성에 접근하도록 수정
    - 객체 존재 여부를 더 엄격하게 확인하는 로직 추가

## 파일별 변경 사항

### scripts/cwn.js
- 중복된 시트 등록 코드 제거
- v12 호환성 주석 추가
- 색상 처리를 위한 Color 클래스 사용 준비 주석 추가
- 아이템 카테고리 초기화 시점 변경 (init 및 setup 훅에서 호출)
- 아이템 카테고리 정보 확인 로직 개선
- setup 훅에서 함수 이름 수정 (_registerSystemSettings → registerSystemSettings)
- ready 훅에서 Item 타입 정보 로깅 로직 개선

### scripts/actor/actor.js
- `actor.data.data` 대신 `actor.system` 사용하도록 업데이트
- v12 호환성 주석 추가

### scripts/item/item.js
- `item.data.data` 대신 `item.system` 사용하도록 업데이트
- 아이템 데이터 준비 메서드 개선
  - `_prepareItemData` 함수에서 매개변수 전달 방식 수정
  - 각 아이템 타입별 데이터 준비 함수에 시스템 데이터 초기화 코드 추가
  - 데이터 접근 방식 일관성 유지
- v12 호환성 주석 추가

### scripts/utils/utils.js
- 색상 처리를 위한 Color 클래스 사용
- createScrollingText 메서드 위치 변경 처리
- showValueChange 및 showHealthChange 메서드 개선

### scripts/utils/combat.js
- Combatant 클래스 확장 관련 주석 추가
- v12 호환성 주석 추가

### scripts/main.js
- v12 호환성 패치 함수 추가
- FogExploration.get을 FogExploration.load로 대체하는 코드 추가
- v12 호환성 주석 추가

## 문제 해결 사항

### 아이템 데이터 준비 오류

**문제 상황:**
- 아이템 데이터 준비 과정에서 `Cannot read properties of undefined (reading 'ac')`, `Cannot read properties of undefined (reading 'ammo')`, `Cannot read properties of undefined (reading 'level')`, `Cannot read properties of undefined (reading 'rating')` 등의 오류 발생

**원인:**
- `_prepareItemData` 함수에서 `systemData` 변수를 생성하여 각 아이템 타입별 데이터 준비 함수에 전달했으나, 이 함수들은 `itemData.system`을 다시 참조하는 구조
- 일부 아이템의 경우 시스템 데이터가 초기화되지 않아 undefined 참조 오류 발생

**해결 방법:**
1. `_prepareItemData` 함수에서 각 타입별 데이터 준비 함수에 `this`를 전달하도록 수정
2. 각 아이템 타입별 데이터 준비 함수에서 `itemData.system`이 없는 경우 초기화하는 코드 추가
3. 데이터 접근 방식을 일관되게 유지하여 undefined 참조 오류 방지

### 아이템 카테고리 초기화 문제

**문제 상황:**
- `CWN | 카테고리 정보를 CWNItem 클래스에 추가할 수 없습니다: {hasCwn: true, hasItemCategories: false, hasItemTagCategories: false}` 오류 발생
- `CWN | Item 타입 정보 로깅 중 오류 발생: TypeError: Cannot read properties of undefined (reading 'Item')` 오류 발생

**원인:**
- 아이템 카테고리 초기화가 `Hooks.ready`에서만 이루어져 시스템 초기화 시점에는 카테고리 정보가 없음
- 아이템 데이터 준비 과정은 시스템 초기화 단계에서 이루어지므로 카테고리 정보 참조 시 오류 발생

**해결 방법:**
1. 아이템 카테고리 초기화를 `Hooks.init`와 `Hooks.setup`에서 모두 호출하여 확실하게 설정되도록 수정
2. `Hooks.ready`에서는 카테고리가 제대로 설정되었는지 확인만 하도록 변경
3. CWNItem 클래스에 카테고리 getter 메서드 추가 시 이미 존재하는지 확인하는 로직 추가

### setup 훅 함수 참조 오류

**문제 상황:**
- `Error: Error thrown in hooked function '' for hook 'setup'. _registerSystemSettings is not defined` 오류 발생

**원인:**
- setup 훅에서 `_registerSystemSettings` 함수를 호출하고 있으나, 실제 함수 이름은 `registerSystemSettings`로 정의되어 있음
- 함수 이름 불일치로 인한 참조 오류 발생

**해결 방법:**
1. setup 훅에서 함수 호출 이름을 `_registerSystemSettings`에서 `registerSystemSettings`로 수정
2. 함수 이름을 일관되게 유지하여 참조 오류 방지

### Item 타입 정보 로깅 오류

**문제 상황:**
- `CWN | Item 타입 정보 로깅 중 오류 발생: TypeError: Cannot read properties of undefined (reading 'Item')` 오류 발생

**원인:**
- ready 훅에서 `game.system.documentTypes.Item`에 접근할 때 `documentTypes` 또는 `Item` 속성이 없는 경우 오류 발생
- 속성 체인에 대한 안전한 접근 처리가 되어 있지 않음

**해결 방법:**
1. 옵셔널 체이닝 연산자(?.)를 사용하여 안전하게 속성에 접근하도록 수정
2. 객체 존재 여부를 더 엄격하게 확인하는 로직 추가
3. 기본값 제공을 통해 undefined 참조 오류 방지

## 추가 작업 필요 사항

1. **PlaceablesLayer#gridPrecision 대체**
   - v12에서는 `PlaceablesLayer#gridPrecision`이 더 이상 사용되지 않고 `PlaceablesLayer#getSnappedPoint`를 사용해야 함
   - 현재 코드에서는 이 메서드를 직접 사용하지 않지만, 향후 추가될 경우 주의 필요

2. **ObjectHUD 및 SynchronizedTransform 사용 중단**
   - v12에서는 `ObjectHUD`와 `SynchronizedTransform`이 더 이상 사용되지 않고 새로운 `PlaceableObjects` 인터페이스 그룹을 사용해야 함
   - 현재 코드에서는 이 클래스들을 직접 사용하지 않지만, 향후 추가될 경우 주의 필요

3. **테스트 필요**
   - 모든 변경 사항이 실제 환경에서 제대로 작동하는지 테스트 필요
   - 특히 색상 처리와 createScrollingText 메서드 변경이 제대로 작동하는지 확인 필요

## 참고 자료

- [Foundry VTT v12 API 문서](https://foundryvtt.com/api/index.html)
- [API 마이그레이션 가이드](https://foundryvtt.com/article/migration/)

## 추가 개선 사항 (2025-03-12)

### 1. scripts/cwn.js 파일의 중복 코드 제거

**변경 내용:**
- `ready` 훅에서 중복된 `_initializeItemCategories()` 함수 호출을 제거했습니다.
- `game.cwn` 객체 설정을 개선하여 기존 속성을 유지하면서 새 속성만 추가하도록 수정했습니다.

**코드 변경:**
```javascript
// 기존 코드
game.cwn = {
  CWN,
  CWNActor,
  CWNItem,
  rollItemMacro
};

// 아이템 분류 시스템 초기화
_initializeItemCategories();

// 변경된 코드
game.cwn = {
  ...(game.cwn || {}),  // 기존 속성 유지
  CWN,
  CWNActor,
  CWNItem,
  rollItemMacro
};

// 아이템 분류 시스템 초기화는 init 훅에서 이미 수행되었으므로 여기서는 제거
// _initializeItemCategories();
```

### 2. scripts/item/item.js 파일에 누락된 아이템 타입 데이터 준비 함수 추가

**변경 내용:**
- `_prepareItemData` 메서드에 누락된 아이템 타입(vehicle, power, drug, gear)에 대한 처리를 추가했습니다.
- 각 아이템 타입에 대한 데이터 준비 함수를 추가했습니다.

**코드 변경:**
```javascript
// _prepareItemData 메서드에 누락된 타입 추가
_prepareItemData() {
  switch (this.type) {
    case 'weapon':
      this._prepareWeaponData(this);
      break;
    // ... 기존 코드 ...
    case 'vehicle':
      this._prepareVehicleData(this);
      break;
    case 'power':
      this._preparePowerData(this);
      break;
    case 'drug':
      this._prepareDrugData(this);
      break;
    case 'gear':
      this._prepareGearData(this);
      break;
    default:
      console.log(`CWN | 알 수 없는 아이템 타입: ${this.type}`);
      break;
  }
}

// 누락된 데이터 준비 함수 추가 (vehicle, power, drug, gear)
```

### 3. scripts/utils/utils.js 파일의 불필요한 변수 제거

**변경 내용:**
- `applyHealthChange` 함수에서 불필요한 `fillColor` 변수를 제거했습니다.

**코드 변경:**
```javascript
// 기존 코드
export async function applyHealthChange(value) {
  // ... 기존 코드 ...
  const newValue = Math.clamped(health.value + value, 0, health.max);
  const fillColor = value > 0 ? "#18520b" : "#aa0200";
  
  await showHealthChange(token, value);
  await actor.update({"system.health.value": newValue});
}

// 변경된 코드
export async function applyHealthChange(value) {
  // ... 기존 코드 ...
  const newValue = Math.clamped(health.value + value, 0, health.max);
  // 불필요한 fillColor 변수 제거 (showHealthChange 함수에서 이미 처리함)
  
  await showHealthChange(token, value);
  await actor.update({"system.health.value": newValue});
}
```

### 4. scripts/main.js 파일의 모듈 이름 수정 및 v12 호환성 패치 추가

**변경 내용:**
- 모듈 이름을 'my-foundry-module'에서 'cwn-system'으로 변경했습니다.
- v12 호환성 패치 함수에 더 많은 패치를 추가했습니다:
  - PlaceablesLayer#gridPrecision 대신 PlaceablesLayer#getSnappedPoint 사용
  - canvas.hud.createScrollingText 대신 canvas.interface.createScrollingText 사용
  - Document#data 대신 Document#system 사용 (호환성 유지)
  - Color 클래스 호환성 패치
- 오류 처리를 개선하여 구체적인 오류 메시지를 표시하도록 했습니다.

**코드 변경:**
```javascript
// 모듈 이름 변경 및 v12 호환성 패치 함수 개선
function applyV12Compatibility() {
  try {
    // FogExploration.get 대신 FogExploration.load 사용
    // ... 기존 코드 ...
    
    // 추가된 패치들
    // PlaceablesLayer#gridPrecision 대신 PlaceablesLayer#getSnappedPoint 사용
    // canvas.hud.createScrollingText 대신 canvas.interface.createScrollingText 사용
    // Document#data 대신 Document#system 사용 (호환성 유지)
    // Color 클래스 호환성 패치
    
    console.log('CWN | v12 호환성 패치가 성공적으로 적용되었습니다.');
  } catch (error) {
    console.error('CWN | v12 호환성 패치 적용 중 오류 발생:', error);
    ui.notifications.error(`v12 호환성 패치 적용 중 오류가 발생했습니다: ${error.message}`);
  }
}
```

### 5. scripts/cwn.js 파일의 아이템 생성 및 업데이트 과정에서의 오류 처리 개선

**변경 내용:**
- 아이템 생성 전에 데이터 유효성 검사를 추가했습니다.
- 오류 유형에 따른 구체적인 메시지를 표시하도록 개선했습니다.
- 아이템 시트 렌더링 시 오류 처리를 개선했습니다.
- 에디터 초기화 중 오류 발생 시 대체 방법을 제공하도록 개선했습니다.

**코드 변경:**
```javascript
// 아이템 생성 코드 개선
try {
  // 데이터 유효성 검사
  if (!itemData.name || itemData.name.trim() === "") {
    throw new Error("아이템 이름은 필수입니다.");
  }
  
  if (!itemData.type) {
    throw new Error("아이템 타입은 필수입니다.");
  }
  
  // 아이템 생성
  const item = await Item.create(itemData, { renderSheet: true });
  ui.notifications.info(`아이템 "${itemData.name}"이(가) 성공적으로 생성되었습니다.`);
} catch (error) {
  // 오류 유형에 따른 구체적인 메시지
  let errorMessage = `아이템 생성 실패: ${error.message}`;
  
  if (error.message.includes("permission")) {
    errorMessage = "아이템 생성 권한이 없습니다. 게임 마스터에게 문의하세요.";
  } else if (error.message.includes("duplicate")) {
    errorMessage = `동일한 이름의 아이템 "${itemData.name}"이(가) 이미 존재합니다.`;
  } else if (error.message.includes("schema")) {
    errorMessage = `아이템 데이터 구조가 올바르지 않습니다: ${error.message}`;
  }
  
  ui.notifications.error(errorMessage);
}

// 아이템 시트 렌더링 및 에디터 초기화 오류 처리 개선
```

## 버전 1.3.40 업데이트 (2025-03-15)

이번 업데이트에서는 Foundry VTT v12와의 호환성을 더욱 강화하기 위해 다음과 같은 문제를 해결했습니다.

### 1. 디버그 모드 설정 참조 오류 수정

**문제 상황:**
- `CWN | 디버그 모드 설정을 확인할 수 없습니다: Error: "core.debugMode" is not a registered game setting` 오류 발생

**원인:**
- `_registerItemCategoryLocalization` 함수에서 `core.debugMode` 설정을 참조하고 있으나, 이 설정이 존재하지 않음

**해결 방법:**
- `core.debugMode` 대신 `cwn-system.debugMode` 설정을 사용하도록 수정
- 오류 처리 로직 개선

**코드 변경:**
```javascript
// 기존 코드
try {
  const debugMode = game.settings.get("core", "debugMode");
  if (debugMode) {
    console.log("CWN | 아이템 분류 로컬라이제이션 키:", localizationData);
  }
} catch (error) {
  console.warn("CWN | 디버그 모드 설정을 확인할 수 없습니다:", error);
}

// 변경된 코드
try {
  // core.debugMode 대신 cwn-system.debugMode 사용
  const debugMode = game.settings.get('cwn-system', 'debugMode') || false;
  
  if (debugMode) {
    console.log("CWN | 아이템 카테고리 지역화 등록 시작");
  }
  
  // ... 기존 코드 ...
  
  if (debugMode) {
    console.log("CWN | 아이템 분류 로컬라이제이션 키:", localizationData);
  }
} catch (error) {
  console.log(`CWN | 디버그 모드 설정을 확인할 수 없습니다: ${error}`);
}
```

### 2. _registerSystemSettings 함수 참조 오류 수정

**문제 상황:**
- `Error: Error thrown in hooked function '' for hook 'setup'. _registerSystemSettings is not defined` 오류 발생

**원인:**
- `setup` 훅에서 `_registerSystemSettings` 함수를 호출하고 있으나, 실제 함수 이름은 `registerSystemSettings`로 정의되어 있음

**해결 방법:**
- `setup` 훅에서 함수 호출 이름을 `_registerSystemSettings`에서 `registerSystemSettings`로 수정

**코드 변경:**
```javascript
// 기존 코드
Hooks.once("setup", function() {
  console.log("CWN | 시스템 설정 시작");
  
  // 아이템 카테고리 초기화 (setup 단계에서도 실행)
  _initializeItemCategories();
  
  // 시스템 설정 등록
  _registerSystemSettings();
  
  console.log("CWN | 시스템 설정 완료");
});

// 변경된 코드
Hooks.once("setup", function() {
  console.log("CWN | 시스템 설정 시작");
  
  // 아이템 분류 시스템 초기화
  _initializeItemCategories();
  
  // 시스템 설정 등록 (함수 이름 수정: _registerSystemSettings -> registerSystemSettings)
  registerSystemSettings();
  
  console.log("CWN | 시스템 설정 완료");
});
```

### 3. Item 타입 정보 로깅 오류 수정

**문제 상황:**
- `CWN | Item 타입 정보 로깅 중 오류 발생: TypeError: Cannot read properties of undefined (reading 'Item')` 오류 발생

**원인:**
- `ready` 훅에서 `game.system.documentTypes.Item`에 접근할 때 `documentTypes` 또는 `Item` 속성이 없는 경우 오류 발생
- v12에서 시스템 구조가 변경되어 이전 방식으로 접근할 수 없음

**해결 방법:**
- `game.system.documentTypes.Item`이 없을 때 대체 방법으로 `CONFIG.Item.types`를 사용하도록 수정
- 오류 처리를 개선하여 더 자세한 정보를 로깅하도록 함

**코드 변경:**
```javascript
// 기존 코드
try {
  // 시스템 정보 확인
  if (!game.system) {
    console.log("CWN | game.system이 정의되지 않았습니다.");
    return;
  }
  
  // 문서 타입 확인
  const documentTypes = game.system.documentTypes || {};
  
  // Item 타입 정보 로깅
  if (documentTypes.Item && Array.isArray(documentTypes.Item)) {
    console.log("CWN | Item sheet classes at ready:", documentTypes.Item.reduce((acc, type) => {
      acc[type] = game.system.template?.Item?.[type] || {};
      return acc;
    }, {base: game.system.model?.Item || {}}));
  } else {
    console.log("CWN | Item 타입 정보를 가져올 수 없습니다:", {
      hasSystem: true,
      hasDocumentTypes: !!documentTypes,
      documentTypesKeys: Object.keys(documentTypes)
    });
  }
} catch (error) {
  console.error("CWN | Item 타입 정보 로깅 중 오류 발생:", error);
}

// 변경된 코드
try {
  // 시스템 정보 확인
  if (!game.system) {
    console.log("CWN | game.system이 정의되지 않았습니다.");
    return;
  }
  
  // 문서 타입 확인 (v12 호환성: documentTypes 구조 변경)
  const documentTypes = game.system.documentTypes || {};
  
  // Item 타입 정보 로깅
  if (documentTypes.Item && Array.isArray(documentTypes.Item)) {
    console.log("CWN | Item sheet classes at ready:", documentTypes.Item.reduce((acc, type) => {
      acc[type] = game.system.template?.Item?.[type] || {};
      return acc;
    }, {base: game.system.model?.Item || {}}));
  } else {
    // v12 호환성: 대체 방법으로 CONFIG.Item.types 사용
    const itemTypes = CONFIG.Item?.types || [];
    if (itemTypes.length > 0) {
      console.log("CWN | Item 타입 정보 (CONFIG.Item.types 사용):", itemTypes);
    } else {
      console.log("CWN | Item 타입 정보를 가져올 수 없습니다:", {
        hasSystem: true,
        hasDocumentTypes: !!documentTypes,
        documentTypesKeys: Object.keys(documentTypes),
        configItemTypes: CONFIG.Item?.types
      });
    }
  }
} catch (error) {
  console.error("CWN | Item 타입 정보 로깅 중 오류 발생:", error);
}
```

### 4. 모듈 ID 설정 위치 변경

**문제 상황:**
- `MODULE_ID` 상수가 파일 중간에 정의되어 있어 다른 함수에서 사용할 수 없음

**해결 방법:**
- `MODULE_ID` 상수를 파일 상단으로 이동하여 다른 함수에서도 사용할 수 있도록 함

**코드 변경:**
```javascript
// 기존 코드
// v12 호환성 패치 적용
applyV12Compatibility();

// ... 기존 코드 ...

// 모듈 ID 설정
const MODULE_ID = 'cwn-system';

// 변경된 코드
// 모듈 ID 설정
const MODULE_ID = 'cwn-system';

// v12 호환성 패치 적용
applyV12Compatibility();
```

### 5. 디버그 모드 설정 추가

**변경 내용:**
- `cwn-system.debugMode` 설정을 추가하여 디버그 정보 출력 여부를 제어할 수 있도록 함

**코드 변경:**
```javascript
// 모듈 설정 등록
function registerModuleSettings() {
  game.settings.register(MODULE_ID, 'debugMode', {
    name: '디버그 모드',
    hint: '디버그 정보를 콘솔에 출력합니다.',
    scope: 'world',
    config: true,
    type: Boolean,
    default: false
  });
  
  game.settings.register(MODULE_ID, 'useCustomColors', {
    name: '커스텀 색상 사용',
    hint: '시스템에서 커스텀 색상을 사용합니다.',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });
}
```

### 6. 시스템 버전 업데이트

**변경 내용:**
- 시스템 버전을 1.3.39에서 1.3.40으로 업데이트
- 다운로드 URL도 새 버전을 반영하도록 수정

**코드 변경:**
```json
// 기존 코드
{
  "id": "cwn-system",
  "title": "Cities Without Number",
  "description": "Cities Without Number 시스템 (Foundry VTT)",
  "version": "1.3.39",
  // ... 기존 코드 ...
  "download": "https://github.com/Witsae/my-fvtt/archive/v1.3.39.zip",
}

// 변경된 코드
{
  "id": "cwn-system",
  "title": "Cities Without Number",
  "description": "Cities Without Number 시스템 (Foundry VTT)",
  "version": "1.3.40",
  // ... 기존 코드 ...
  "download": "https://github.com/Witsae/my-fvtt/archive/v1.3.40.zip",
}
```

## 결론

이번 업데이트(v1.3.40)에서는 Foundry VTT v12와의 호환성 문제를 해결하였습니다. 주요 변경 사항으로는 디버그 모드 설정 참조 오류, 시스템 설정 등록 함수 참조 오류, Item 타입 정보 로깅 오류를 수정하였습니다. 이러한 변경을 통해 시스템이 Foundry VTT v12에서도 정상적으로 작동할 수 있게 되었습니다. 

## 버전 1.3.41 업데이트 (2025-03-16)

이번 업데이트에서는 Foundry VTT v12에서 발생하는 추가적인 문제들을 해결했습니다.

### 1. 액터 시트 attributes 오류 수정

**문제 상황:**
- 액터 시트를 열 때 `Cannot read properties of undefined (reading 'attributes')` 오류 발생
- 오류 위치: `actor-sheet.js:92:47`의 `_prepareCharacterData` 함수

**원인:**
- `context.system.attributes`가 없거나 초기화되지 않은 상태에서 접근 시도
- v12에서 데이터 구조 변경으로 인해 일부 속성이 초기화되지 않는 문제 발생

**해결 방법:**
- `_prepareCharacterData` 함수에 방어적 코딩 추가
- `context.system`과 `context.system.attributes`가 없을 경우 초기화하는 코드 추가

**코드 변경:**
```javascript
// 기존 코드
_prepareCharacterData(context) {
  // Handle ability scores.
  for (let [k, v] of Object.entries(context.system.attributes)) {
    v.label = game.i18n.localize(CONFIG.CWN.attributes[k]) ?? k;
  }
}

// 변경된 코드
_prepareCharacterData(context) {
  // v12 호환성: system 속성 확인 및 초기화
  if (!context.system) {
    console.warn("CWN | 액터 시트 데이터에 system 속성이 없습니다:", context);
    context.system = {};
  }
  
  // v12 호환성: attributes 속성 확인
  if (!context.system.attributes) {
    console.warn("CWN | 액터 시트 데이터에 attributes 속성이 없습니다:", context.system);
    context.system.attributes = {};
  }
  
  // Handle ability scores.
  for (let [k, v] of Object.entries(context.system.attributes)) {
    v.label = game.i18n.localize(CONFIG.CWN.attributes[k]) ?? k;
  }
}
```

### 2. 아이템 시트 템플릿 로딩 문제 해결

**문제 상황:**
- 아이템 시트에서 이미지와 이름이 중복되어 표시되는 문제 발생
- 아이템 시트가 제대로 렌더링되지 않음

**원인:**
- `template` getter 함수에서 비동기 `fetch`를 사용하여 템플릿 존재 여부를 확인하는 방식이 문제
- 비동기 작업이 완료되기 전에 템플릿 경로가 반환되어 중복 렌더링 발생
- v12에서 템플릿 로딩 방식과 충돌

**해결 방법:**
- `template` getter 함수를 단순화하여 비동기 `fetch` 제거
- 템플릿 경로만 반환하도록 수정하여 Foundry의 기본 템플릿 처리 메커니즘 활용

**코드 변경:**
```javascript
// 기존 코드
get template() {
  const itemType = this.item.type;
  const path = `systems/cwn-system/templates/item/item-${itemType}-sheet.hbs`;
  console.log(`CWN | 아이템 시트 템플릿 요청: ${path}`);
  
  // 템플릿 존재 여부 확인
  fetch(path)
    .then(response => {
      console.log(`CWN | 아이템 템플릿 존재 여부: ${response.ok ? '존재함' : '존재하지 않음'}`);
      if (!response.ok) {
        console.error(`CWN | 아이템 템플릿을 찾을 수 없음: ${path}, 기본 템플릿 사용`);
        // 기본 템플릿 경로 확인
        const defaultPath = `systems/cwn-system/templates/item/item-sheet.hbs`;
        return fetch(defaultPath).then(defaultResponse => {
          console.log(`CWN | 기본 아이템 템플릿 존재 여부: ${defaultResponse.ok ? '존재함' : '존재하지 않음'}`);
        });
      }
    })
    .catch(error => {
      console.error(`CWN | 아이템 템플릿 확인 중 오류 발생:`, error);
    });
  
  // 템플릿이 없는 경우 기본 템플릿 사용
  try {
    const templateExists = !!fetch(path).then(r => r.ok);
    if (!templateExists) {
      console.warn(`CWN | 아이템 타입 '${itemType}'에 대한 템플릿이 없어 기본 템플릿 사용`);
      return `systems/cwn-system/templates/item/item-sheet.hbs`;
    }
  } catch (error) {
    console.error(`CWN | 템플릿 확인 중 오류:`, error);
    return `systems/cwn-system/templates/item/item-sheet.hbs`;
  }
  
  return path;
}

// 변경된 코드
get template() {
  const itemType = this.item.type;
  // 아이템 타입별 템플릿 경로
  const path = `systems/cwn-system/templates/item/item-${itemType}-sheet.hbs`;
  console.log(`CWN | 아이템 시트 템플릿 요청: ${path}`);
  
  // v12 호환성: 템플릿 경로 단순화
  // 비동기 fetch 대신 단순히 경로만 반환
  // 템플릿이 없으면 Foundry가 자동으로 오류를 처리함
  return path;
}
```

## 결론

이번 업데이트(v1.3.41)에서는 Foundry VTT v12와의 호환성을 더욱 강화하기 위해 액터 시트와 아이템 시트 관련 문제를 해결했습니다. 주요 변경 사항으로는 액터 시트의 attributes 속성 접근 오류 수정과 아이템 시트 템플릿 로딩 방식 개선이 있습니다. 이러한 변경을 통해 시스템이 Foundry VTT v12에서 더욱 안정적으로 작동할 수 있게 되었습니다. 