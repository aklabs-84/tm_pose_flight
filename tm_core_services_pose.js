// tm_core_services_pose.js
// TMCore v1.0 (Pose 전용) — ModelService / CameraService / ResultService
// UI와 완전 분리. window.TMCorePose로 export.
// 필요 스크립트(HTML에서 로드):
// <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/pose@0.8/dist/teachablemachine-pose.min.js"></script>

(function (global) {
  // ===== 공통 =====
  const _normUrl = (u='') => {
    let s = (u || '').trim();
    if (!s) return '';
    // 대략적 검증 + 슬래시 보정
    const ok = /^https?:\/\/teachablemachine\.withgoogle\.com\/models\/[A-Za-z0-9_-]+\/?$/.test(s);
    if (!ok) console.warn('[TMCorePose] 모델 URL 형식이 다를 수 있습니다.');
    return s.endsWith('/') ? s : s + '/';
  };
  const _assert = (cond, msg) => { if (!cond) throw new Error(msg); };

  // ===== ModelService (Pose) =====
  const ModelService = (() => {
    let model = null;
    let labels = [];
    let lastPose = null;

    async function load(baseUrl) {
      const base = _normUrl(baseUrl);
      _assert(!!base, '모델 URL이 비어있습니다.');
      const metaURL  = base + 'metadata.json';
      const modelURL = base + 'model.json';
      const bust = '?v=' + Date.now();
      try {
        // CORS/404 빠른 확인
        const metaResp = await fetch(metaURL, { cache:'no-store', mode:'cors' });
        if (!metaResp.ok) {
          throw new Error('메타데이터 응답 오류: ' + metaResp.status + ' - ' + metaURL);
        }
        const meta = await metaResp.json();
        labels = Array.isArray(meta.labels) ? meta.labels : [];

        // TM Pose 모델 로드
        model = await tmPose.load(modelURL + bust, metaURL + bust);
        if (!labels.length && model.getClassLabels) labels = model.getClassLabels();
        if (!labels || !labels.length) throw new Error('클래스 라벨을 찾을 수 없습니다. metadata.json 확인 필요');
        return { labels: labels.slice() };
      } catch (err) {
        console.error('[TMCorePose] 모델 로드 실패:', err);
        // 재발을 쉽게 하기 위해 원래 에러를 상위로 전달
        throw err;
      }
    }

    function _ensure(){ _assert(!!model, 'Model not loaded'); }

    async function estimate(videoEl) {
      _ensure();
      _assert(videoEl && videoEl.videoWidth > 0, '유효한 비디오/프레임 필요');
      const { pose, posenetOutput } = await model.estimatePose(videoEl);
      lastPose = pose;
      return { pose, posenetOutput };
    }

    async function classify(posenetOutput) {
      _ensure(); _assert(!!posenetOutput, 'posenet 출력이 필요합니다.');
      const predictions = await model.predict(posenetOutput); // [{className, probability}]
      return predictions;
    }

    async function predictFromVideo(videoEl) {
      const { pose, posenetOutput } = await estimate(videoEl);
      const preds = await classify(posenetOutput);
      return { pose, preds };
    }

    const getLabels = () => labels.slice();
    const getLastPose = () => lastPose;
    const isLoaded = () => !!model;

    return { load, estimate, classify, predictFromVideo, getLabels, getLastPose, isLoaded };
  })();

  // ===== CameraService =====
  const CameraService = (() => {
    let stream = null;

    async function start(videoEl, opts = { facingMode:'user' }) {
      _assert(!!videoEl, 'video 엘리먼트가 필요합니다.');
      stream = await navigator.mediaDevices.getUserMedia({ video: opts, audio: false });
      videoEl.srcObject = stream;
      await videoEl.play();
      return stream;
    }
    function stop(){ if (stream){ stream.getTracks().forEach(t=>t.stop()); stream = null; } }
    const hasStream = () => !!stream;

    function capture(videoEl, canvasEl){
      _assert(videoEl && videoEl.videoWidth>0, '활성 비디오 필요');
      const c = canvasEl || document.createElement('canvas');
      c.width = videoEl.videoWidth; c.height = videoEl.videoHeight;
      c.getContext('2d').drawImage(videoEl,0,0);
      return c;
    }

    return { start, stop, hasStream, capture };
  })();

  // ===== ResultService =====
  const ResultService = (() => {
    const defaultEmojiMap = {
      'squat':'🏋️','pose':'🧘','left':'⬅️','right':'➡️','up':'⬆️','down':'⬇️','jump':'🦘','arm':'💪','leg':'🦵','plank':'📏'
    };

    const sort = (preds)=>preds.slice().sort((a,b)=>b.probability - a.probability);
    const topK  = (preds,k=3)=>sort(preds).slice(0,k);
    const mapEmoji = (label, map=defaultEmojiMap)=>{
      const low=(label||'').toLowerCase();
      const key=Object.keys(map).find(k=>low.includes(k));
      return key? map[key] : '✨';
    };

    return { sort, topK, mapEmoji, defaultEmojiMap };
  })();

  // ===== Export =====
  global.TMCorePose = { ModelService, CameraService, ResultService };
})(window);
