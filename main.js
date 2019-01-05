let signal = {};

function emit() {
  output.width = output.clientWidth;
  output.height = output.clientHeight;

  const outputCtx = output.getContext('2d');

  function drawFrame(t) {
    requestAnimationFrame(drawFrame);

    signal = {
      r: (Math.sin(t / 99 / 2) + 1) / 2,
      g: (Math.sin(t / 99 / 3) + 1) / 2,
      b: (Math.sin(t / 99 / 5) + 1) / 2
    };

    outputCtx.fillStyle = `rgb(${signal.r * 256}, ${signal.g * 256}, ${signal.b * 256})`;
    outputCtx.fillRect(0, 0, output.width, output.height);
  }

  requestAnimationFrame(drawFrame);
}

function process(video) {
  preview.width = preview.clientWidth;
  preview.height = preview.clientHeight;

  const previewCtx = preview.getContext('2d');

  const pixel = document.createElement('canvas');
  pixel.width = 1;
  pixel.height = 1;

  const pixelCtx = pixel.getContext('2d');

  graph.width = graph.clientWidth;
  graph.height = graph.clientHeight;

  const graphCtx = graph.getContext('2d');
  graphCtx.fillRect(0, 0, graph.width, graph.height);

  function grabFrame() {
    requestAnimationFrame(grabFrame);

    previewCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, preview.width, preview.height);
    pixelCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, 1, 1);

    const [r, g, b] = pixelCtx.getImageData(0, 0, 1, 1).data;
    const capture = {
      r: r / 255,
      g: g / 255,
      b: b / 255
    };

    graphCtx.drawImage(graph, -1, 0);

    graphCtx.fillStyle = '#000';
    graphCtx.fillRect(graph.width - 1, 0, 1, graph.height);

    graphCtx.fillStyle = '#f00';
    graphCtx.fillRect(graph.width - 1, signal.r * graph.height / 2, 1, 1);
    graphCtx.fillStyle = '#0f0';
    graphCtx.fillRect(graph.width - 1, signal.g * graph.height / 2, 1, 1);
    graphCtx.fillStyle = '#00f';
    graphCtx.fillRect(graph.width - 1, signal.b * graph.height / 2, 1, 1);

    graphCtx.fillStyle = '#f00';
    graphCtx.fillRect(graph.width - 1, (capture.r + 1) * graph.height / 2, 1, 1);
    graphCtx.fillStyle = '#0f0';
    graphCtx.fillRect(graph.width - 1, (capture.g + 1) * graph.height / 2, 1, 1);
    graphCtx.fillStyle = '#00f';
    graphCtx.fillRect(graph.width - 1, (capture.b + 1) * graph.height / 2, 1, 1);
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
