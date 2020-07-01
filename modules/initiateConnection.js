import { AttachUI, MessageReceived, UIDisable, UIEnable } from "./page-objects.js";
import { ConnectPeers, DisconnectPeers } from "./peers.js";

// Module variables (justify need)
// sendChannel is needed to send the message from the UI
let sendChannel = null;

/**
 * Attached a listener to the click event on the connect button
 */
const initialize = () => {
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
 * @param {RTCDataChannelEvent} statusChangeEvent
 */
const sendChannelStatusChange = (statusChangeEvent) => {
    // Ignore if sendChannel doesn't exist (Can this be triggered without it???)
    if (!!sendChannel) {
        const state = sendChannel.readyState;

        if (state === "open")
            UIEnable();
        else
            UIDisable();
    }
}

/**
 * Handle data messages sent by the remote
 * @param {RTCDataChannelEvent} evt
 */
const messageReceivedHandler = (evt) => {
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
const sendMessage = (messageText) => {
    sendChannel.send(messageText);
}

/**
 * Remove and clean up the peer connections, and reset the UI
 */
const disconnectPeers = () => {
    // Clear the sendChannel for garbage collection
    ({ sendChannel } = DisconnectPeers());

    // Update the UI
    UIDisable();
}

export {
    initialize as Initialize,
};
