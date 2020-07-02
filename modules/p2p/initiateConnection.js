import { AttachUI } from "./page-objects.js";

function initialize() {
    console.log("INITIALIZING UI");

    AttachUI({ onBtnGenerateOfferClick: initializeLocalConnection });
}

/**
 * Set up a local connection
 */
function createLocalConnection(onSendStatusChange) {
    let localConnection = new RTCPeerConnection();

    localConnection.onicecandidate = (iceEvent) => {
        console.log("localConnection iceCandidate", !iceEvent.candidate, iceEvent.candidate);
    }

    // Create a data channel to send data through to the remote
    let sendChannel = localConnection.createDataChannel("sendChannel");
    sendChannel.onopen = (evt) => { sendChannelStatusChange(evt, onSendStatusChange); };
    sendChannel.onclose = (evt) => { sendChannelStatusChange(evt, onSendStatusChange); };

    return { localConnection, sendChannel };
}

async function generateOffer(localConnection) {
    try {
        const offer = await localConnection.createOffer();
        console.log("local offer", offer);
        await localConnection.setLocalDescription(offer);
        console.log("local description", localConnection.localDescription);
    } catch (err) {
        console.error("EXCEPTION: Creating offer to remote", err);
    }
}

async function initializeLocalConnection() {
    let { localConnection, sendChannel } = createLocalConnection(sendChannelStatusChange);

    await generateOffer(localConnection);
}

/**
 * Handle status changes for the local side
 * @param {String} channelState - readyState property of the channel
 */
function sendChannelStatusChange(channelState) {
    console.log("sendChannel state", channelState);
}

export {
    initialize as Initialize,
};
