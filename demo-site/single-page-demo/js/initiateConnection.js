import { AttachUI, MessageReceived, UIDisable, UIEnable } from "./page-objects.js";
import { ConnectPeers, DisconnectPeers } from "./peers.js";

// Module variables (justify need)
// sendChannel is needed to send the message from the UI
let sendChannel = null;

/**
 * Attached a listener to the click event on the connect button
 */
function initialize() {
    console.log("INITIALIZING UI");

    AttachUI({ connectPeers, disconnectPeers, sendMessage });
}

/**
 * Create the peer connections
 */
async function connectPeers() {
    (
        { sendChannel } = await ConnectPeers({
            onSendStatusChange: sendChannelStatusChange,
            onReceiveStatusChange: receiveChannelStatusChange,
            onMessageReceived: messageReceivedHandler,
        })
    );
}

/**
 * Handle status changes for the local side
 * @param {String} channelState - readyState property of the channel
 */
function sendChannelStatusChange(channelState) {
    if (channelState === "open")
        UIEnable();
    else
        UIDisable();
}

/**
 * Handle data messages sent by the remote
 * @param {RTCDataChannelEvent} evt
 */
function messageReceivedHandler(evt) {
    MessageReceived(evt.data);
}

/**
 * Status changes on the receiving channel
 * @param {Event} evt
 * @param {RTCDataChannel} receiveChannel
 */
function receiveChannelStatusChange(evt, receiveChannel) {
    // Ignore if receiveChannel doesn't exist (Can this be triggered without it???)
    if (!!receiveChannel) {
        console.log(`Receive channel's status is now: ${receiveChannel.readyState}`, evt);
    }

    // FUTURE TO DO: Receive channel status has changed
}

/**
 * Send a message to the remote
 * @param {String} messageText - String to send
 */
function sendMessage(messageText) {
    sendChannel.send(messageText);
}

/**
 * Remove and clean up the peer connections, and reset the UI
 */
function disconnectPeers() {
    // Clear the messageRemote for garbage collection
    DisconnectPeers();
    sendChannel = null;

    // Update the UI
    UIDisable();
}

export {
    initialize as Initialize,
};
