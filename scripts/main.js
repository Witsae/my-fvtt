/**
 * Cities Without Number 시스템의 메인 진입점
 * v12 호환성: 메인 모듈 초기화
 */

// v12 호환성 패치 적용
applyV12Compatibility();

/**
 * v12 호환성 패치 함수
 * Foundry VTT v12에서 변경된 API를 처리합니다.
 */
function applyV12Compatibility() {
  try {
    // FogExploration.get 대신 FogExploration.load 사용
    if (typeof FogExploration !== 'undefined') {
      if (!FogExploration.load && FogExploration.get) {
        FogExploration.load = FogExploration.get;
        console.log('CWN | FogExploration.get → FogExploration.load 패치 적용됨');
      }
    }
    
    // PlaceablesLayer#gridPrecision 대신 PlaceablesLayer#getSnappedPoint 사용
    if (typeof PlaceablesLayer !== 'undefined') {
      if (!PlaceablesLayer.prototype.getSnappedPoint && PlaceablesLayer.prototype.gridPrecision) {
        PlaceablesLayer.prototype.getSnappedPoint = function(point) {
          const gs = canvas.grid.size;
          const gp = this.gridPrecision || 1;
          return {
            x: Math.round(point.x / (gs / gp)) * (gs / gp),
            y: Math.round(point.y / (gs / gp)) * (gs / gp)
          };
        };
        console.log('CWN | PlaceablesLayer#gridPrecision → PlaceablesLayer#getSnappedPoint 패치 적용됨');
      }
    }
    
    // canvas.hud.createScrollingText 대신 canvas.interface.createScrollingText 사용
    if (typeof canvas !== 'undefined' && canvas) {
      if (canvas.interface && !canvas.hud) {
        canvas.hud = {
          createScrollingText: function(target, text, options) {
            return canvas.interface.createScrollingText(target, text, options);
          }
        };
        console.log('CWN | canvas.interface.createScrollingText → canvas.hud.createScrollingText 패치 적용됨');
      }
    }
    
    // Document#data 대신 Document#system 사용 (호환성 유지)
    if (typeof Document !== 'undefined') {
      const documentClasses = [Actor, Item];
      for (const DocClass of documentClasses) {
        if (DocClass && DocClass.prototype) {
          Object.defineProperty(DocClass.prototype, 'data', {
            get: function() {
              console.warn('CWN | Document#data는 더 이상 사용되지 않습니다. Document#system을 사용하세요.');
              return {
                data: this.system
              };
            }
          });
        }
      }
      console.log('CWN | Document#data → Document#system 호환성 패치 적용됨');
    }
    
    // Color 클래스 호환성 패치
    if (typeof Color !== 'undefined') {
      if (!Color.from) {
        Color.from = function(color) {
          return new Color(color);
        };
        console.log('CWN | Color.from 패치 적용됨');
      }
    }
    
    console.log('CWN | v12 호환성 패치가 성공적으로 적용되었습니다.');
  } catch (error) {
    console.error('CWN | v12 호환성 패치 적용 중 오류 발생:', error);
    ui.notifications.error(`v12 호환성 패치 적용 중 오류가 발생했습니다: ${error.message}`);
  }
}

// 모듈 ID 설정
const MODULE_ID = 'cwn-system';

// 모듈 초기화
Hooks.once('init', () => {
  console.log(`${MODULE_ID} | 모듈 초기화 시작`);
  
  // 모듈 설정 등록
  registerModuleSettings();
  
  console.log(`${MODULE_ID} | 모듈 초기화 완료`);
});

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

// 모듈 준비
Hooks.once('ready', () => {
  console.log(`${MODULE_ID} | 모듈 준비 완료`);
  
  // 디버그 모드 확인
  const debugMode = game.settings.get(MODULE_ID, 'debugMode');
  if (debugMode) {
    console.log(`${MODULE_ID} | 디버그 모드 활성화됨`);
  }
}); 