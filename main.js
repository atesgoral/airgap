let i = 0;
let signal = {};

function emit() {
  output.width = output.clientWidth;
  output.height = output.clientHeight;

  const outputCtx = output.getContext('2d');

  function drawFrame(t) {
    requestAnimationFrame(drawFrame);

    const s = t / 1000;
    const cF = 5;
    const mF = 0.5;

    if (i < 60) {
      signal = 0.5;
    } else {
      const carrier = Math.sin(Math.PI * 2 * cF * s);
      const modulation = Math.sin(Math.PI * 2 * mF * s);
      signal = (carrier * (1 + modulation) / 2 + 1) / 2;
    }

    i++;

    if (i >= 600) {
      i = 0;
    }

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

  function grabFrame() {
    requestAnimationFrame(grabFrame);

    previewCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, preview.width, preview.height);
    pixelCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, 1, 1);

    const capture = pixelCtx.getImageData(0, 0, 1, 1).data[0] / 255;

    graphCtx.drawImage(graph, -1, 0);

    graphCtx.fillStyle = '#111';
    graphCtx.fillRect(graph.width - 1, 0, 1, graph.height);

    graphCtx.fillStyle = '#eee';
    graphCtx.fillRect(graph.width - 1, signal * graph.height / 2, 1, 2);
    graphCtx.fillRect(graph.width - 1, (capture + 1) * graph.height / 2, 1, 2);
  }

  requestAnimationFrame(grabFrame);
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
