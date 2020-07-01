const btnConnect = document.getElementById("btnConnect"),
    btnDisconnect = document.getElementById("btnDisconnect"),
    btnSend = document.getElementById("btnSend"),
    divRecievedMessages = document.getElementById("receivedMessages"),
    txtMessage = document.getElementById("txtMessage");

/**
 * Update the UI based on ability to send
 * @param {Object} status
 * @param {Boolean} status.sendingAvailable - Can the user send a message to a remote
 */
const updateUI = ({ sendingAvailable }) => {
    btnSend.disabled = !sendingAvailable;
    btnDisconnect.disabled = !sendingAvailable;
    btnConnect.disabled = sendingAvailable;
    txtMessage.disabled = !sendingAvailable;

    if (sendingAvailable)
        txtMessage.focus();
    else
        txtMessage.value = "";
}

/**
 * Update the UI to allow sending to a remote
 */
const uiEnable = () => {
    updateUI({ sendingAvailable: true });
}

/**
 * Update the UI to prevent sending to a remote
 */
const uiDisable = () => {
    updateUI({ sendingAvailable: false });
}

/**
 * Display received messages
 * @param {String} messageText - Text string send from the remote
 */
const messageReceived = (messageText) => {
    const el = document.createElement("p");
    let txt = document.createTextNode(`${(new Date()).toLocaleString()} - ${messageText}`);
    el.appendChild(txt);
    divRecievedMessages.appendChild(el);
}

/**
 * Attach methods to the UI
 * @param {Object} actions
 * @param {Function} actions.connectPeers - Handler for initiating connection
 * @param {Function} actions.disconnectPeers - Handler for ending connection
 * @param {Function} actions.sendMessage - Handler for sending a message to the remote
 */
const attachUi = ({ connectPeers, disconnectPeers, sendMessage }) => {
    btnConnect.addEventListener("click", connectPeers, false);
    btnDisconnect.addEventListener("click", disconnectPeers, false);

    // Send button, and enter key on input, both send the message
    const sendToRemote = () => {
        let message = getMessageToSend();
        sendMessage(message);
    }
    btnSend.addEventListener("click", sendToRemote, false);
    txtMessage.addEventListener("keyup", (evt) => {
        if (evt.keyCode == 13)
            sendToRemote();
    }, false);
}

const getMessageToSend = () => {
    const message = txtMessage.value;

    txtMessage.value = "";
    txtMessage.focus();

    return message;
}

export {
    btnConnect,
    btnDisconnect,
    btnSend,
    divRecievedMessages,
    txtMessage,

    attachUi as AttachUI,
    messageReceived as MessageReceived,
    uiEnable as UIEnable,
    uiDisable as UIDisable,
};
