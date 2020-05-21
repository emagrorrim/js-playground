const connection = new RTCMultiConnection();
const roomId = "predefinedRoomId";
let constraints = {
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
  connection.mediaConstraints = constraints
  connection.onstream = async (event) => {
    setupSwitchBtn();
    let video = document.getElementById(event.streamId)
    console.log(video);
    if (!video) {
      video = event.mediaElement;
      document.getElementById("videoContainer").appendChild(video);
    }
    event.mediaElement.srcObject = event.stream;
  };
  connection.openOrJoin(roomId);
};
