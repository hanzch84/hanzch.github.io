// 오실로스코프를 그릴 캔버스와 컨텍스트를 가져옵니다.
const canvas = document.getElementById('oscilloscope');
const canvasCtx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = 400;

// AudioContext 및 필요한 요소들을 초기화합니다.
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;

navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    draw();
}).catch(err => {
    console.error('Error accessing microphone:', err);
});

function draw() {
    requestAnimationFrame(draw);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'black';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'lime';

    canvasCtx.beginPath();
    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();

    // 주파수 데이터를 얻어 FFT 분석 결과를 그립니다.
    const freqData = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(freqData);

    canvasCtx.fillStyle = 'red';
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    x = 0;

    for (let i = 0; i < bufferLength; i++) {
        barHeight = freqData[i];

        canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
    }
}
