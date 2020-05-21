const _logPanelId = 'log'

const _setup = () => {
  const body = document.body;
  if (body) {
    const logPanel = document.createElement('div');
    logPanel.id = _logPanelId;
    body.appendChild(logPanel);
  } else {
    throw new Error('body not loaded, pls call after window loaded!')
  }
};

const logger = {
  info: info => {
    let logPanel = document.getElementById(_logPanelId);
    if (!logPanel) {
      _setup();
      logPanel = document.getElementById(_logPanelId);
    }
    const log = document.createElement("div");
    log.appendChild(document.createTextNode(info));
    logPanel.appendChild(log);
    console.info(info);
  },
  error: error => {
    let logPanel = document.getElementById(_logPanelId);
    if (!logPanel) {
      _setup();
      logPanel = document.getElementById(_logPanelId);
    }
    const log = document.createElement("div");
    log.appendChild(document.createTextNode(error));
    logPanel.appendChild(log);
    console.error(error);
  }
}
