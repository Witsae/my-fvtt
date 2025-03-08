# EC2에서 Foundry VTT 자동 시작 설정 방법

EC2 인스턴스에 SSH로 접속한 후 다음 단계를 수행하세요:

## 1. 시작 스크립트 생성

```bash
# 시작 스크립트 생성
cat > ~/start-foundry.sh << 'EOL'
#!/bin/bash
node /home/ec2-user/foundry/resources/app/main.js --dataPath=/home/ec2-user/foundryuserdata
EOL

# 실행 권한 부여
chmod +x ~/start-foundry.sh
```

## 2. PM2로 Foundry 시작 및 저장

```bash
# PM2로 Foundry 시작
pm2 start ~/start-foundry.sh --name foundry

# 현재 PM2 설정 저장
pm2 save
```

## 3. PM2 시작 스크립트 생성 및 시스템 서비스 등록

```bash
# PM2 시작 스크립트 생성
pm2 startup

# 위 명령어 실행 후 출력되는 명령어를 복사하여 실행하세요.
# 일반적으로 다음과 같은 형태입니다:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user
```

## 4. 설정 확인

```bash
# PM2 상태 확인
pm2 status

# 시스템 서비스 상태 확인
systemctl status pm2-ec2-user
```

## 추가 정보

- 시스템이 재부팅된 후에도 PM2는 자동으로 시작되고, 저장된 프로세스(Foundry VTT)를 실행합니다.
- 설정을 변경하려면 `pm2 stop foundry`, `pm2 start foundry` 명령어를 사용하고 `pm2 save`로 변경 사항을 저장하세요.
- 로그를 확인하려면 `pm2 logs foundry` 명령어를 사용하세요. 