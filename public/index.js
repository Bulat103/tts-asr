let audioContext;
let mediaStream;
let recognizer;
let resultsContainer;
let partialContainer;

async function init() {
  resultsContainer = document.getElementById("recognition-result");
  resultsContainer.innerHTML = "";
  partialContainer = document.createElement("span");
  partialContainer.setAttribute("id", "partial");
  resultsContainer.append(partialContainer);

  partialContainer.textContent = "Loading...";

  const channel = new MessageChannel();
  const model = await Vosk.createModel("model.zip");
  model.registerPort(channel.port1);

  const sampleRate = 48000;

  recognizer = new model.KaldiRecognizer(sampleRate);
  recognizer.setWords(true);

  recognizer.on("result", (message) => {
    const result = message.result;
    const newSpan = document.createElement("span");
    newSpan.textContent = `${result.text} `;
    resultsContainer.insertBefore(newSpan, partialContainer);
  });

  recognizer.on("partialresult", (message) => {
    const partial = message.result.partial;
    partialContainer.textContent = partial;
  });

  partialContainer.textContent = "Ready";

  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: false,
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      channelCount: 1,
      sampleRate,
    },
  });

  audioContext = new AudioContext();
  await audioContext.audioWorklet.addModule("recognizer-processor.js");
  const recognizerProcessor = new AudioWorkletNode(
    audioContext,
    "recognizer-processor",
    { channelCount: 1, numberOfInputs: 1, numberOfOutputs: 1 }
  );
  recognizerProcessor.port.postMessage(
    { action: "init", recognizerId: recognizer.id },
    [channel.port2]
  );
  recognizerProcessor.connect(audioContext.destination);

  const source = audioContext.createMediaStreamSource(mediaStream);
  source.connect(recognizerProcessor);
}

function stopRecognition() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
  }
  if (audioContext) {
    audioContext.close();
  }
  if (recognizer) {
    recognizer.remove();
  }

  document.getElementById("trigger").disabled = false;
  partialContainer.textContent = ".......................Recognition stopped.";
}

window.onload = () => {
  const trigger = document.getElementById("trigger");
  trigger.onmouseup = () => {
    trigger.disabled = true;
    init();
  };

  const stopButton = document.getElementById("stop");
  stopButton.onclick = () => {
    stopRecognition();
  };
};
