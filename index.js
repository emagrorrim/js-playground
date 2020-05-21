const connection = new RTCMultiConnection();
const roomId = "predefinedRoomId";
let constraints = {
  audio: true,
  video: {
    width: {
      min: 1280,
      ideal: 1920,
      max: 2560,
    },
    height: {
      min: 720,
      ideal: 1080,
      max: 1440,
    },
  },
};

let devices = []

const setupSwitchBtn = async () => {
  devices = (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind === 'videoinput');
  console.log(devices);
  const switchBtn = document.getElementById("switch");
  switchBtn.onclick = () => {
    // if (constraints.video.deviceId && constraints.video.deviceId.exact === devices[0].deviceId) {
    //   constraints.video = {
    //     ...constraints.video,
    //     deviceId: {
    //       exact: devices[1].deviceId,
    //     },
    //   };
    // } else {
    //   constraints.video = {
    //     ...constraints.video,
    //     deviceId: {
    //       exact: devices[0].deviceId,
    //     },
    //   };
    // }
    connection.openOrJoin(roomId);
  };
};

window.onload = async () => {
  connection.socketURL = "https://rtcmulticonnection.herokuapp.com:443/";
  connection.session = {
    audio: true,
    video: true,
  };
  connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true,
  };
  connection.videosContainer = document.getElementById("videoContainer");
  connection.mediaConstraints = constraints
  connection.onstream = async (event) => {
    setupSwitchBtn();
    let existing = document.getElementById(event.streamId);
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    let video = document.createElement("video");
    try {
      video.setAttributeNode(document.createAttribute("autoplay"));
      video.setAttributeNode(document.createAttribute("playsinline"));
    } catch (e) {
      video.setAttribute("autoplay", true);
      video.setAttribute("playsinline", true);
    }

    if (event.type === "local") {
      video.volume = 0;
      try {
        video.setAttributeNode(document.createAttribute("muted"));
      } catch (e) {
        video.setAttribute("muted", true);
      }
    }
    video.srcObject = event.stream;
    connection.videosContainer.appendChild(video);
    video.id = event.streamid;
  };
  connection.openOrJoin(roomId);
};
