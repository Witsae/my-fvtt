/**
 * 모듈 초기화 함수
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
 */
Hooks.once('ready', async function() {
  console.log('My Foundry Module | 준비 완료');
  
  // 모듈 기능 구현
  if (game.settings.get('my-foundry-module', 'enableFeature')) {
    // 여기에 모듈 기능 구현
  }
}); 