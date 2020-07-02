// Module variables (justify)
// The peers and channels are needed to support both connecting and disconnecting
// Assignment should only happen in the connectPeers and disconnectPeers methods
let localConnection = null,
    remoteConnection = null,
    sendChannel = null,
    receiveChannel = null;

/**
 * Set up a local connection
 */
function createLocalConnection(onSendStatusChange) {
    let localConnection = new RTCPeerConnection();

    // Create a data channel to send data through to the remote
    let sendChannel = localConnection.createDataChannel("sendChannel");
    sendChannel.onopen = (evt) => { sendChannelStatusChange(evt, onSendStatusChange); };
    sendChannel.onclose = (evt) => { sendChannelStatusChange(evt, onSendStatusChange); };

    return { localConnection, sendChannel };
}

/**
 * Handler for the change in status of the sending channel
 * @param {Event} statusChangeEvent - Event data
 * @param {Function} onChangeHandler - Handler for the readyState
 */
function sendChannelStatusChange(statusChangeEvent, onChangeHandler) {
    // Ignore if sendChannel doesn't exist (Can this be triggered without it???)
    if (!!sendChannel)
        onChangeHandler(sendChannel.readyState);
}

/**
 * Set up a remote connection
 */
function createRemoteConnection() {
    let remoteConnection = new RTCPeerConnection();

    return { remoteConnection };
}

/**
 * Handle new ICE candidate offers
 * @param {Object} peers
 * @param {RTCPeerConnection} peers.peerA - the connection with the event to handle
 * @param {RTCPeerConnection} peers.peerB - the other side of the connection
 */
function configureICECandidateHandler ({ peerA, peerB }) {
    peerA.onicecandidate = (iceEvent) => !iceEvent.candidate || peerB.addIceCandidate(iceEvent.candidate).catch(addCandidateErrorHandler);
}

/**
 * Something went wrong with the ICE candidate process
 * @param {Error} err
 */
function addCandidateErrorHandler(err) {
    console.error("addICECandidate has failed", err);
}

/**
 * Generate ICE candidates for use with a remote
 * @param {Object} rtcPeers
 * @param {RTCPeerConnection} rtcPeers.localConnection - the local connection
 * @param {RTCPeerConnection} rtcPeers.remoteConnection - the remote connection
 */
async function offerGeneration({ localConnection, remoteConnection }) {
    try {
        const offer = await localConnection.createOffer();
        await localConnection.setLocalDescription(offer);
        console.log("localDescription", localConnection.localDescription);

        await remoteConnection.setRemoteDescription(localConnection.localDescription);
        const answer = await remoteConnection.createAnswer();

        console.log("remoteDescription", remoteConnection.remoteDescription);
        console.log("remoteAnswer", answer);

        await remoteConnection.setLocalDescription(answer);
        await localConnection.setRemoteDescription(remoteConnection.localDescription)
    } catch (err) {
        console.error("EXCEPTION: Creating offer to remote", err);
    }
}

/**
 * A remote channel has been established
 * @param {RTCDataChannelEvent} evt
 */
function remoteConnectionEstablished(evt, onMessageReceived, onReceiveStatusChange) {
    let receiveChannel = evt.channel;

    receiveChannel.onmessage = onMessageReceived;
    receiveChannel.onopen = (evt) => { onReceiveStatusChange(evt, receiveChannel); };
    receiveChannel.onclose = (evt) => { onReceiveStatusChange(evt, receiveChannel); };

    return receiveChannel;
}

/**
 * Create the peer connections, and attach event listeners
 * @param {Object} handlers
 * @param {Function} handlers.onSendStatusChange - handles a change in status for the local sendChannel
 * @param {Function} handlers.onReceiveStatusChange - handles a change in status for the local receiveChannel
 * @param {Function} handlers.onMessageReceived - handles incoming messages on the receiveChannel
 * @returns {Object} {sendChannel}
 */
async function connectPeers({ onSendStatusChange, onReceiveStatusChange, onMessageReceived }) {
    // The WebRTC connection from the remote to the local
    ({ remoteConnection } = createRemoteConnection());
    remoteConnection.ondatachannel = (evt) => {
        receiveChannel = remoteConnectionEstablished(evt, onMessageReceived, onReceiveStatusChange);
    }

    // The WebRTC connection and communication channel from the local to the remote
    ({ localConnection, sendChannel } = createLocalConnection(onSendStatusChange));

    // Set up ICE canditates
    configureICECandidateHandler({ peerA: localConnection, peerB: remoteConnection });
    configureICECandidateHandler({ peerA: remoteConnection, peerB: localConnection });

    // Generate an offer, which starts the WebRTC process
    await offerGeneration({ localConnection, remoteConnection });

    // Return the sendChannel to provide access to the .send() method to the UI
    return { sendChannel };
}

/**
 * Disconnect the channels and connections, and clean up
 */
function disconnectPeers() {
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
}

export {
    connectPeers as ConnectPeers,
    disconnectPeers as DisconnectPeers,
};
