/**
 * 모듈 초기화 함수
 * v12 호환성: Foundry VTT v12에 맞게 초기화 코드 구성
 */
Hooks.once('init', async function() {
  console.log('My Foundry Module | 초기화 중');
  
  // 모듈 설정
  game.settings.register('my-foundry-module', 'enableFeature', {
    name: '기능 활성화',
    hint: '이 모듈의 주요 기능을 활성화합니다.',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean
  });
});

/**
 * 모듈이 준비되었을 때 실행되는 함수
 * v12 호환성: 모듈 기능 구현
 */
Hooks.once('ready', async function() {
  console.log('My Foundry Module | 준비 완료');
  
  // 모듈 기능 구현
  if (game.settings.get('my-foundry-module', 'enableFeature')) {
    // 여기에 모듈 기능 구현
  }
});

/**
 * Foundry VTT v12 호환성을 위한 설정
 * v12에서는 일부 API가 변경되었으므로 이를 처리합니다.
 */
Hooks.once('setup', function() {
  // v12 호환성 확인
  const isV12 = game.release?.generation >= 12;
  
  if (isV12) {
    console.log('My Foundry Module | Foundry VTT v12 호환 모드로 실행 중');
    
    // v12 특정 설정 및 조정
    // 1. FogExploration.get 대신 FogExploration.load 사용
    // 2. PlaceablesLayer#gridPrecision 대신 PlaceablesLayer#getSnappedPoint 사용
    // 3. ObjectHUD 및 SynchronizedTransform 대신 새로운 PlaceableObjects 인터페이스 그룹 사용
    // 4. 새로운 Color 클래스 사용
    
    // v12 호환성 패치 적용
    applyV12Compatibility();
  }
});

/**
 * v12 호환성 패치를 적용하는 함수
 * v12에서 변경된 API에 대한 호환성 처리를 수행합니다.
 */
function applyV12Compatibility() {
  // FogExploration.get 대신 FogExploration.load 사용
  if (typeof FogExploration !== 'undefined') {
    if (!FogExploration.load && FogExploration.get) {
      console.log('My Foundry Module | FogExploration.get을 FogExploration.load로 대체');
      FogExploration.load = FogExploration.get;
    }
  }
  
  // 기타 v12 호환성 패치...
} 