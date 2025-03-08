/**
 * 입력 필드의 유효성을 검사하는 대화 상자
 * @extends {Dialog}
 */
export class ValidatedDialog extends Dialog {
  /**
   * @param {Dialog.Data} dialogData 대화 상자 데이터
   * @param {Object} options 대화 상자 옵션
   * @param {Function} options.failCallback 유효성 검사 실패 시 호출되는 콜백 함수
   */
  constructor(dialogData, options) {
    super(dialogData, options);
    this.options.failCallback = options.failCallback || (() => {});
  }

  /**
   * 입력 필드의 유효성을 검사합니다.
   * @returns {boolean} 모든 필드가 유효하면 true, 그렇지 않으면 false
   */
  validate() {
    const innerHTML = this.element.find(".window-content").children();
    const elementsToCheck = Array.from(innerHTML.find("select,input,textarea"));
    
    const good = elementsToCheck
      .map(e => {
        const markedRequired = e.getAttribute("required") == null;
        const checkValid = e.checkValidity();
        const blankValue = e.value !== "";
        const elementGood = markedRequired || (checkValid && blankValue);
        
        // 유효성 검사 결과에 따라 시각적 피드백 제공
        if (elementGood) {
          e.parentElement?.classList.remove("failed-validation");
        } else {
          e.parentElement?.classList.add("failed-validation");
        }
        
        return elementGood;
      })
      .reduce((e, n) => e && n, true);

    return good;
  }

  /**
   * 대화 상자를 제출합니다. 유효성 검사를 통과해야 제출됩니다.
   * @param {Object} button 클릭된 버튼 데이터
   * @override
   */
  submit(button) {
    if (this.validate()) {
      return super.submit(button);
    } else {
      this.options.failCallback?.(button);
    }
  }
} 