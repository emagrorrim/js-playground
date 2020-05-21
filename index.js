const connection = new RTCMultiConnection();
const roomId = "predefinedRoomId";

let constraints = {
  audio: true,
  video: {
    width: {
      ideal: 1920,
    },
    height: {
      ideal: 1080,
    },
    frameRate: 30,
  },
};

const setupCameraSelector = async () => {
  const devices = (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind === 'videoinput');
  const selector = document.getElementById("devices");
  selector.innerText = "";
  devices.forEach(device => {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.innerText = device.label;
    selector.appendChild(option);
  });
  selector.onchange = () => {
    constraints.video = {
      ...constraints.video,
      deviceId: {
        exact: selector.selectedOptions[0].value,
      },
    };
    connection.mediaConstraints = constraints;
    if (window.stream) {
      window.stream.getTracks().forEach((track) => {
        track.stop();
      });
      const video = document.getElementById(window.stream.id);
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        window.stream = stream;
        video.srcObject = stream;
        video.id = stream.id;
      });
    }
  };
};

const setupConnection = () => {
  connection.socketURL = "https://rtcmulticonnection.herokuapp.com/";
  connection.session = {
    audio: true,
    video: true,
  };
  connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true,
  };
  connection.videosContainer = document.getElementById("videoContainer");
  connection.mediaConstraints = constraints;

  const CodecsHandler = connection.CodecsHandler;
  connection.processSdp = (sdp) => {
    const codecs = "vp8";
    const bitrates = 512;

    if (codecs.length) {
      sdp = CodecsHandler.preferCodec(sdp, codecs.toLowerCase());
    }

    sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, {
      audio: 128,
      video: bitrates,
      screen: bitrates,
    });

    sdp = CodecsHandler.setVideoBitrates(sdp, {
      min: bitrates * 8 * 1024,
      max: bitrates * 8 * 1024,
    });

    return sdp;
  };

  connection.iceServers = [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun.l.google.com:19302?transport=udp",
      ],
    },
  ];

  connection.onstream = async (event) => {
    setupCameraSelector();
    let video = document.getElementById(event.streamid);
    if (video && video.parentNode) {
      video.parentNode.removeChild(video);
    }
    video = event.mediaElement;
    try {
      video.setAttributeNode(document.createAttribute("autoplay"));
      video.setAttributeNode(document.createAttribute("playsinline"));
    } catch (e) {
      video.setAttribute("autoplay", true);
      video.setAttribute("playsinline", true);
    }

    if (event.type === "local") {
      window.stream = event.stream;
      video.volume = 0;
      try {
        video.setAttributeNode(document.createAttribute("muted"));
      } catch (e) {
        video.setAttribute("muted", true);
      }
    }
    video.srcObject = event.stream;
    connection.videosContainer.appendChild(video);

    setTimeout(function () {
      video.play();
    }, 5000);
  };

  connection.onstreamended = (event) => {
    const mediaElement = document.getElementById(event.streamid);
    if (mediaElement) {
      mediaElement.parentNode.removeChild(mediaElement);
    }
  };
}

window.onload = async () => {
  setupConnection()
  connection.openOrJoin(roomId);
};
