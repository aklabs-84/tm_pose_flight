# TM Pose Flight

포즈(Teachable Machine)로 조종하는 3D 비행기 게임 데모

## 개요
이 프로젝트는 Teachable Machine의 포즈 분류 모델을 사용해 화면 우상단 카메라로 실시간 포즈를 인식하고, 인식된 라벨로 3D 비행기를 조종하는 브라우저 게임입니다. three.js 기반의 단일 페이지 앱(`index.html`)으로 동작합니다.

## 모델 요구사항 (중요)
- 모델은 Teachable Machine (Pose) 형식으로 export 되어야 합니다.
- 반드시 4개의 클래스만 있어야 하며, 클래스 이름은 정확히 다음과 같아야 합니다:
  - `up`
  - `down`
  - `left`
  - `right`
- 클래스 이름은 대소문자 구분 없이 동일한 문자열을 사용해야 합니다(권장: 소문자).
- Teachable Machine에서 모델을 export 한 후 생성되는 `model.json` URL을 `index.html`의 모델 입력란 또는 UI에서 입력하여 로드합니다.

> 모델을 훈련할 때 (예) `up`은 팔을 위로, `down`은 팔을 아래로 등으로 레이블링하고 충분한 샘플을 수집해 주세요. 모델의 안정성을 위해 각 클래스에 다양한 자세와 조명/거리에서의 샘플을 포함하면 좋습니다.

## 포함된 파일(주요)
- `index.html` — 게임 및 UI, 포즈 파이프라인, three.js 씬이 포함된 메인 파일
- `tm_core_services_pose.js` — Teachable Machine / 카메라 / 결과 처리 헬퍼
- `assets/` — 사운드 파일(`start.mp3`, `bgm.mp3`, `coin.mp3`, `game-over.mp3`) 등을 넣어 사용

## 실행 방법
1. 로컬에서 테스트하려면 간단한 정적 서버를 사용하세요(권장: `python3 -m http.server`) 또는 브라우저에서 `index.html`을 열어도 동작하지만 카메라/모델 로딩이 CORS/HTTPS 요구사항으로 제한될 수 있습니다.

```bash
cd "path/to/TM Pose Flight"
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000/index.html 접속
```

2. 페이지에서:
- 모델 URL 입력란에 Teachable Machine으로 export한 모델의 `model.json` 전체 URL(예: `https://teachablemachine.withgoogle.com/models/XXXX/model.json`)을 넣고 `모델 로드` 클릭
- 카메라 권한을 허용한 뒤 `게임 시작` 클릭

## 게임 방법
- 화면 우상단에 카메라 미리보기가 표시됩니다. 모델이 안정적으로 특정 포즈를 인식하면 미니캠 아래에 라벨이 표시됩니다.
- 인식 라벨로 비행기를 조종합니다:
  - `up` — 위로
  - `down` — 아래로
  - `left` — 왼쪽으로
  - `right` — 오른쪽으로
- 보조로 키보드의 WASD 또는 방향키 사용 가능.
- 규칙 요약:
  - 초기 시간은 60초, 장애물에 닿으면 점수 +1, 시간 +1초 보상
  - 시간이 20초 이하가 되면 난이도(속도)가 증가하고 시간에서 5초가 차감(게임 규칙에 따라 변경 가능)
  - 바닥에 충돌하면 시간 -1초, 게임 일시정지 및 재시작 필요
  - 시간이 0이 되면 게임오버, 최종 점수가 표시됩니다

## 오디오
- `assets/` 폴더에 다음 파일들을 위치시키면 자동으로 재생합니다:
  - `start.mp3` — 게임 시작 버튼 클릭 시 재생
  - `bgm.mp3` — 게임 시작 시 루프 재생
  - `coin.mp3` — 장애물 충돌 시 재생
  - `game-over.mp3` — 게임오버 시 재생
- 파일이 없을 경우 내장된 WebAudio 합성음으로 폴백합니다.
- HUD에서 BGM 볼륨을 조절할 수 있으며 기본값은 최대(100%)입니다.

## 포즈 모델 URL 예
Teachable Machine에서 모델을 export하면 다음과 같은 구조의 URL을 얻습니다:

```
https://teachablemachine.withgoogle.com/models/XXXX/model.json
```

`XXXX`는 모델 ID입니다. 위 전체 주소를 `modelUrl` 입력란에 붙여넣고 `모델 로드`를 클릭하세요.

## 성능 및 디버깅 팁
- 카메라/모델 인식 루프는 브라우저의 연속 프레임을 사용하므로 장시간 플레이 시 성능 저하가 느껴진다면 `assets`의 BGM을 낮추거나 HUD의 `성능 모드`를 추가로 구현해 오브젝트 수(나무/장애물)를 줄이세요.
- 브라우저 콘솔(F12)에서 에러 메시지(모델 404, CORS, AudioContext 에러 등)를 확인하면 문제 원인 파악에 도움이 됩니다.

## 기여 및 변경
원하는 개선 사항(예: 볼륨 저장, 미러 토글, 성능 모드 추가, 외부 사운드 편집)을 알려주시면 기능을 추가해 드리겠습니다.

---
간단한 README로 시작했습니다. 추가로 포함할 내용(스크린샷, 데모 GIF, 라이선스 등)을 알려주시면 업데이트하겠습니다.
