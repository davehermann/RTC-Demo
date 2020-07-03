import { divChat, divNegotiateConnection, txtChatEntry, txtRemoteNegotiation, AttachUI, AddClass, DisplayMessage, RemoveClass, ShowNextHandshake } from "./page-objects.js";
import { Peer } from "../rtc-module/peer.js";

/** @type {Peer} */
let localPeer = null,
    /** @type {Array<Map>} */
    nextHandshake = [],
    handshakeShown = false;

function initialize() {
    console.log("INITIALIZING UI");

    AttachUI({ onBtnGenerateOfferClick: initiateConnection, onBtnConsumeOfferClick: connectionFromOffer, onBtnSendChatClick: sendChatMessage });
}

/**
 * Create a new WebRTC session
 */
function initiateConnection() {
    localPeer = new Peer();
    localPeer.remoteHandshake = sendHandshakeToRemote;

    // Data channels
    localPeer.useDataChannel = true;
    localPeer.dataChannel.outbound_onOpen = outboundChannelStatusChange;
    localPeer.dataChannel.outbound_onClose = outboundChannelStatusChange;
    localPeer.dataChannel.inbound_onMessage = messageFromRemote;

    // Initialize for a new connection, including generating an offer
    localPeer.InitializeConnection();
}

/**
 * Respond to connection handshake negotiation
 */
async function connectionFromOffer() {
    const message = (txtRemoteNegotiation.value || "").trim();

    if (message.length > 0) {
        // Clear the entry field
        txtRemoteNegotiation.value = null;

        // Parse the negotiation
        const negotiation = JSON.parse(message);

        // Create a connection if no connection exists
        if (!localPeer) {
            localPeer = new Peer();
            localPeer.remoteHandshake = sendHandshakeToRemote;

            // Data channels
            localPeer.useDataChannel = true;
            localPeer.dataChannel.outbound_onOpen = outboundChannelStatusChange;
            localPeer.dataChannel.outbound_onClose = outboundChannelStatusChange;
            localPeer.dataChannel.inbound_onMessage = messageFromRemote;

            // Generate the connection, but not an offer
            localPeer.GenerateConnection();
        }

        // Disallow consuming of negotiated connections from itself
        if (negotiation.fromId == localPeer.connectionId) {
            alert("Browser can't process a signal from itself! Make sure to use signals from the opposite browser.");
            return;
        }

        // Process the handshake negotiation
        await localPeer.ConsumeNegotiation(negotiation);

        ShowNextHandshake(nextHandshake);
    }

}

/**
 * React to the open/close of the outbound data channel
 * @param {Event} evt
 */
function outboundChannelStatusChange(evt) {
    console.log("outbound status change", evt);

    /** @type {RTCDataChannel} */
    let channel = evt.target;

    if (channel.readyState == "open") {
        // Hide the negotiating UI
        AddClass(divNegotiateConnection, "inactive");

        // Show the chat UI
        RemoveClass(divChat, "inactive");
    }
}

/**
 * Provide handshake signals for use by remote connection
 * @param {Map} signal
 * @param {Peer} signal.peer - the current peer connection
 * @param {RTCSessionDescription} [signal.description] - the offer or answer generated
 * @param {RTCIceCandidate} [signal.iceCandidate] - the next ICE candidate
 */
function sendHandshakeToRemote({ peer, description, iceCandidate }) {
    // Log the objects passed in
    console.log({ description, iceCandidate });

    let handshake = JSON.stringify({ description, iceCandidate, fromId: peer.connectionId });

    // Push to the handshake list
    nextHandshake.push(handshake);
    // Update the display the first time
    if (!handshakeShown) {
        ShowNextHandshake(nextHandshake);
        handshakeShown = true;
    }


    // Log the JSON string to be copied for use on the other end
    console.log(handshake);
}

/**
 * Send a message via the data channel for the chat UI
 */
function sendChatMessage() {
    let text = (txtChatEntry.value || "").trim();

    if (text.length > 0) {
        // Reset the chat entry
        txtChatEntry.value = "";

        localPeer.dataChannel.Send(text);
        DisplayMessage(text);
    }
}

/**
 * Handle incoming messages
 * @param {MessageEvent} evt
 */
function messageFromRemote(evt) {
    console.log("remote message", evt);

    DisplayMessage(evt.data, true);
}

export {
    initialize as Initialize,
};
