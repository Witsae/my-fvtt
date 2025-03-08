# GitHub 설정 방법

GitHub 저장소 'my-fvtt'에 연결하기 위해 다음 단계를 따르세요:

1. GitHub에서 'my-fvtt' 저장소의 URL을 확인합니다.
   - GitHub에 로그인하고 'my-fvtt' 저장소로 이동합니다.
   - 녹색 'Code' 버튼을 클릭합니다.
   - HTTPS 탭에서 URL을 복사합니다 (예: `https://github.com/Witsae/my-fvtt.git`).

2. 터미널에서 다음 명령을 실행합니다:
   ```
   git remote add origin https://github.com/Witsae/my-fvtt.git
   git push -u origin main
   ```

3. GitHub 인증 정보를 입력하라는 메시지가 표시되면 입력합니다.

4. 모듈 파일의 URL도 업데이트해야 합니다:
   - module.json 파일에서 "url", "manifest", "download" 필드의 사용자 이름을 'Witsae'로 변경합니다.
   - README.md 파일에서 매니페스트 URL의 사용자 이름을 'Witsae'로 변경합니다.
   
   변경 후 다시 커밋하고 푸시합니다:
   ```
   git add .
   git commit -m "Update URLs with correct username"
   git push
   ```

5. GitHub에서 릴리스를 만들려면:
   - GitHub 웹사이트에서 저장소로 이동합니다.
   - 'Releases' 탭을 클릭합니다.
   - 'Create a new release' 버튼을 클릭합니다.
   - 태그 버전(예: v1.0.0) 입력합니다.
   - 릴리스 제목과 설명을 입력합니다.
   - 'Publish release' 버튼을 클릭합니다. 