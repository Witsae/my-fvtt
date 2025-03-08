# GitHub 저장소 연결 방법

1. GitHub 웹사이트(https://github.com)에 로그인합니다.

2. 오른쪽 상단의 '+' 버튼을 클릭하고 'New repository'를 선택합니다.

3. 저장소 이름을 'my-foundry-module'로 입력합니다 (원하는 다른 이름으로 변경 가능).

4. 설명(선택 사항)을 입력합니다.

5. 저장소를 공개(Public) 또는 비공개(Private)로 설정합니다.

6. README 파일 생성 옵션은 체크하지 마세요 (이미 로컬에 있습니다).

7. 'Create repository' 버튼을 클릭합니다.

8. 저장소가 생성되면 GitHub에서 제공하는 명령어 중 "…or push an existing repository from the command line" 섹션의 명령어를 복사하여 터미널에서 실행합니다:

```
git remote add origin https://github.com/yourusername/my-foundry-module.git
git branch -M main
git push -u origin main
```

9. GitHub 인증 정보를 입력하라는 메시지가 표시되면 입력합니다.

10. 이제 모듈이 GitHub에 업로드되었습니다!

## 모듈 업데이트 방법

1. 파일을 수정한 후 다음 명령어로 변경 사항을 커밋합니다:
```
git add .
git commit -m "변경 내용 설명"
git push
```

2. 새 버전을 릴리스하려면:
   - GitHub 웹사이트에서 저장소로 이동합니다.
   - 'Releases' 탭을 클릭합니다.
   - 'Create a new release' 버튼을 클릭합니다.
   - 태그 버전(예: v1.0.0)을 입력합니다.
   - 릴리스 제목과 설명을 입력합니다.
   - 'Publish release' 버튼을 클릭합니다.

3. module.json 파일의 버전 번호와 download URL을 업데이트하는 것을 잊지 마세요. 