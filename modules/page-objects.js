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

const messageReceived = (messageText) => {
    const el = document.createElement("p");
    let txt = document.createTextNode(`${(new Date()).toLocaleString()} - ${messageText}`);
    el.appendChild(txt);
    divRecievedMessages.appendChild(el);
}

export {
    btnConnect,
    btnDisconnect,
    btnSend,
    divRecievedMessages,
    txtMessage,

    messageReceived,
    uiEnable,
    uiDisable,
};
