# Git 전역 설정 변경 방법

모든 Git 저장소에 사용자 이름과 이메일을 'Witsae'로 설정하려면 다음 명령어를 실행하세요:

```bash
git config --global user.name "Witsae"
git config --global user.email "witsae@example.com"
```

## 설정 확인하기

전역 설정이 올바르게 적용되었는지 확인하려면 다음 명령어를 실행하세요:

```bash
git config --global user.name
git config --global user.email
```

## 이전 커밋 작성자 변경하기

이미 커밋된 메시지의 작성자 정보를 변경하려면 Git 히스토리를 수정해야 합니다. 이는 위험할 수 있으므로 주의해서 진행하세요.

1. 저장소의 모든 커밋 작성자 정보 변경하기:

```bash
git filter-branch --env-filter '
OLD_EMAIL="your-old-email@example.com"
CORRECT_NAME="Witsae"
CORRECT_EMAIL="witsae@example.com"

if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags
```

2. 변경 사항을 강제로 푸시하기:

```bash
git push --force --tags origin 'refs/heads/*'
```

**주의**: 이 작업은 저장소의 히스토리를 변경하므로, 다른 사람과 공유하는 저장소에서는 문제가 발생할 수 있습니다. 개인 프로젝트에서만 사용하세요. 