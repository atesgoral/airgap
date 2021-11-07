function emit() {
  output.width = output.clientWidth;
  output.height = output.clientHeight;

  const outputCtx = output.getContext('2d');

  function drawFrame(t) {
    requestAnimationFrame(drawFrame);

    const s = t / 1000;

    signal = Math.abs((s % 1) * 2 - 1);

    outputCtx.fillStyle = `hsl(0, 0%, ${signal * 100}%)`;
    outputCtx.fillRect(0, 0, output.width, output.height);
  }

  requestAnimationFrame(drawFrame);
}

function process(video) {
  preview.width = preview.clientWidth;
  preview.height = preview.clientHeight;

  const previewCtx = preview.getContext('2d');
  previewCtx.filter = 'grayscale(100%)';

  const pixel = document.createElement('canvas');
  pixel.width = 1;
  pixel.height = 1;

  const pixelCtx = pixel.getContext('2d');
  pixelCtx.filter = 'grayscale(100%)';

  graph.width = graph.clientWidth;
  graph.height = graph.clientHeight;

  const graphCtx = graph.getContext('2d');
  graphCtx.fillRect(0, 0, graph.width, graph.height);

  let min = Infinity;
  let max = 0;

  function grabFrame(t) {
    requestAnimationFrame(grabFrame);

    previewCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, preview.width, preview.height);
    pixelCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, 1, 1);

    const capture = pixelCtx.getImageData(0, 0, 1, 1).data[0] / 255;

    min = Math.min(min, capture);
    max = Math.max(max, capture);

    graphCtx.drawImage(graph, -1, 0);

    graphCtx.fillStyle = '#111';
    graphCtx.fillRect(graph.width - 1, 0, 1, graph.height);

    graphCtx.fillStyle = '#f00';
    graphCtx.fillRect(graph.width - 1, (2 - max) * graph.height / 2, 1, 2);
    graphCtx.fillStyle = '#08f';
    graphCtx.fillRect(graph.width - 1, (2 - min) * graph.height / 2, 1, 2);


    graphCtx.fillStyle = '#888';
    graphCtx.fillRect(graph.width - 1, (1 - signal) * graph.height / 2, 1, 2);
    graphCtx.fillRect(graph.width - 1, (2 - capture) * graph.height / 2, 1, 2);

    const range = max - min;
    const normalized = (capture - min) / range + min;

    graphCtx.fillStyle = '#eee';
    graphCtx.fillRect(graph.width - 1, (2 - normalized) * graph.height / 2, 1, 2);
  }

  requestAnimationFrame(grabFrame);

  setInterval(() => {
    min = Infinity;
    max = 0;
  }, 5 * 1000);
}

async function init() {
  const constraints = {
    video: true
  };

  const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

  const video = document.createElement('video');
  video.autoplay = true;
  video.srcObject = mediaStream;

  emit();
  process(video);
}

window.addEventListener('load', init);
