import { AttachUI, MessageReceived, UIDisable, UIEnable } from "./page-objects.js";

// Module variables
let sendChannel = null,
    receiveChannel = null,
    localConnection = null,
    remoteConnection = null;

/**
 * Attached a listener to the click event on the connect button
 */
const initialize = () => {
    console.log("INITIALIZING UI");

    AttachUI({ connectPeers, disconnectPeers, sendMessage });
}

/**
 * Create the local connection, and its event listeners
 * @param {Event} evt - The click event from the button
 */
const connectPeers = async (clickEvent) => {
    localConnection = new RTCPeerConnection();

    // Create a data channel to send data through to the remote
    sendChannel = localConnection.createDataChannel("sendChannel");
    sendChannel.onopen = sendChannelStatusChange;
    sendChannel.onclose = sendChannelStatusChange;

    // Create a data channel to receive data back from the remote
    remoteConnection = new RTCPeerConnection();
    remoteConnection.ondatachannel = receiveChannelEstablished;

    // Set up ICE canditates
    localConnection.onicecandidate = iceEvent => !iceEvent.candidate || remoteConnection.addIceCandidate(iceEvent.candidate).catch(addCandidateErrorHandler);
    remoteConnection.onicecandidate = iceEvent => !iceEvent.candidate || localConnection.addIceCandidate(iceEvent.candidate).catch(addCandidateErrorHandler);

    // Generate an offer, which starts the WebRTC process
    await offerGeneration({ localConnection, remoteConnection });
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
 * A remote channel has been established
 * @param {RTCDataChannelEvent} evt
 */
const receiveChannelEstablished = (evt) => {
    receiveChannel = evt.channel;
    receiveChannel.onmessage = MessageReceivedHandler;
    receiveChannel.onopen = receiveChannelStatusChange;
    receiveChannel.onclose = receiveChannelStatusChange;
}

/**
 * Something went wrong with the ICE candidate process
 * @param {Error} err
 */
const addCandidateErrorHandler = (err) => {
    console.error("addICECandidate has failed", err);
}

/**
 * Handle data messages sent by the remote
 * @param {RTCDataChannelEvent} evt
 */
const MessageReceivedHandler = (evt) => {
    MessageReceived(evt.data);
}

/**
 * Status changes on the receiving channel
 * @param {*} evt
 */
const receiveChannelStatusChange = (evt) => {
    // Ignore if receiveChannel doesn't exist (Can this be triggered without it???)
    if (!!receiveChannel) {
        console.log(`Receive channel's status is now: ${receiveChannel.readyState}`, evt);
    }

    // FUTURE TO DO: Receive channel status has changed
}

/**
 * Generate ICE candidates for use with a remote
 * @param {Object} rtcPeers
 * @param {RTCPeerConnection} rtcPeers.localConnection - the local connection
 * @param {RTCPeerConnection} rtcPeers.remoteConnection - the remote connection
 */
const offerGeneration = async ({ localConnection, remoteConnection }) => {
    try {
        const offer = await localConnection.createOffer();
        await localConnection.setLocalDescription(offer);

        await remoteConnection.setRemoteDescription(localConnection.localDescription);
        const answer = await remoteConnection.createAnswer();

        await remoteConnection.setLocalDescription(answer);
        await localConnection.setRemoteDescription(remoteConnection.localDescription)
    } catch (err) {
        console.error("EXCEPTION: Creating offer to remote", err);
    }
}

/**
 * Send a message to the remote
 * @param {String} messageText - String to send
 */
const sendMessage = (messageText) => {
    sendChannel.send(messageText);
}

const disconnectPeers = () => {
    // Close the channels
    sendChannel.close();
    receiveChannel.close();

    // Close the connections
    localConnection.close();
    remoteConnection.close();

    // Clear the objects for garbage collection
    sendChannel = null;
    receiveChannel = null;
    localConnection = null;
    remoteConnection = null;

    // Update the UI
    UIDisable();
}

export {
    initialize as Initialize,
};
