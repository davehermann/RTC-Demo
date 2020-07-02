// This code background relies on https://github.com/shanet/WebRTC-Example/blob/master/client/webrtc.js

import { divChat, divNegotiateConnection, txtChatEntry, txtRemoteNegotiation, AttachUI, AddClass, DisplayMessage, RemoveClass } from "./page-objects.js";
import { v4 as uuid } from "./uuid.js";

const _instanceId = uuid();
const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
];

let peerConnection = null,
    sendChannel = null,
    receiveChannel = null;

function initialize() {
    console.log("INITIALIZING UI", _instanceId);

    AttachUI({ onBtnGenerateOfferClick: initializeLocalConnection, onBtnConsumeOfferClick: consumePeerOffer, onBtnSendChatClick: sendChat });
}

function sendChat() {
    let text = (txtChatEntry.value || "").trim();

    if (text.length > 0) {
        txtChatEntry.value = "";

        if (!!sendChannel) {
            sendChannel.send(text);
            DisplayMessage(text);
        } else
            alert("No channel open to peer");
    }
}

function remoteMessageReceived(evt) {
    console.log("remote message", evt);

    let messageText = evt.data;
    DisplayMessage(messageText, true);
}

function generateConnection(onSendStatusChange) {
    let newPeer = new RTCPeerConnection({ iceServers });
    newPeer.onicecandidate = newIceCandidate;
    newPeer.ondatachannel = (evt) => {
        receiveChannel = evt.channel;
        receiveChannel.onmessage = remoteMessageReceived;
        console.log("remote data channel open", evt);
    }

    let sendChannel = newPeer.createDataChannel("sendChannel");
    sendChannel.onopen = (evt) => { sendChannelStatusChange(evt, onSendStatusChange); };
    sendChannel.onclose = (evt) => { sendChannelStatusChange(evt, onSendStatusChange); };

    return { peerConnection: newPeer, dataChannel: sendChannel };
}

/**
 * Handler for the change in status of the sending channel
 * @param {Event} statusChangeEvent - Event data
 * @param {Function} onChangeHandler - Handler for the readyState
 */
function sendChannelStatusChange(statusChangeEvent, onChangeHandler) {
    let sendChannel = statusChangeEvent.target;
    onChangeHandler(sendChannel.readyState);
}

function newIceCandidate(iceEvent) {
    // iceEvent.candidate === null means no more ICE candidates
    if (!!iceEvent.candidate) {
        signalRemote({ ice: iceEvent.candidate });
    }
}

function signalRemote({ description, ice }) {
    console.log({ description, ice });
    console.log(JSON.stringify({ description, ice, fromId: _instanceId }));
}

async function generateOffer(connectionToPeer) {
    try {
        const offer = await connectionToPeer.createOffer();
        console.log("local offer", offer);
        await generateDescription(connectionToPeer, offer);
    } catch (err) {
        reportError(err, "creating offer");
    }
}

async function generateAnswer(connectionToPeer) {
    try {
        const answer = await connectionToPeer.createAnswer();
        console.log("local answer", answer);
        await generateDescription(connectionToPeer, answer);
    } catch (err) {
        reportError(err, "creating answer");
    }
}

async function generateDescription(connectionToPeer, description) {
    try {
        await connectionToPeer.setLocalDescription(description);
        console.log("local description", connectionToPeer.localDescription);

        signalRemote({ description: connectionToPeer.localDescription });
    } catch (err) {
        reportError(err, "setting local description");
    }
}

function reportError(err, note) {
    console.error(`EXCEPTION: ${note}`, err);
}

/**
 * Handle status changes for the local side
 * @param {String} channelState - readyState property of the channel
 */
function dataChannelStatusChange(channelState) {
    console.log("sendChannel state", channelState);

    if (channelState == "open") {
        // Hide the negotiating UI
        AddClass(divNegotiateConnection, "inactive");

        // Show the chat UI
        RemoveClass(divChat, "inactive");
    }
}

async function initializeLocalConnection() {
    // Create a peer connection, with stun servers defined
    // On ice candidates, we have to provide each candidate to the remote peer
    // Add a data channel to the local connection
    // If this is the initiator, create an offer, and set as the connection description, then provide the description to the peer

    let { peerConnection: newConnection, dataChannel } = generateConnection(dataChannelStatusChange);

    peerConnection = newConnection;
    sendChannel = dataChannel;

    // This is the initiator, so generate an initial offer
    await generateOffer(peerConnection);
}

async function consumePeerOffer() {
    const message = txtRemoteNegotiation.value;

    if (!!message && (message.length > 0)) {
        txtRemoteNegotiation.value = null;

        const offer = JSON.parse(message);

        if (offer.fromId == _instanceId) {
            alert("Browser can't process message from itself! Make sure to use message from the other browser.");
            return;
        }

        // Create a connection if none exists
        if (!peerConnection) {
            let { peerConnection: newConnection, dataChannel } = generateConnection(dataChannelStatusChange);
            peerConnection = newConnection;
            sendChannel = dataChannel;
        }

        if (!!offer.description) {
            try {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(offer.description));

                // Create an answer if the type is "offer"
                if (offer.description.type == "offer")
                    await generateAnswer(peerConnection);
            } catch (err) {
                reportError(err, "setting remote description");
            }
        } else if (!!offer.ice) {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(offer.ice));
            } catch (err) {
                reportError(err, "adding ice candidate");
            }
        }
    }
}

export {
    initialize as Initialize,
};
