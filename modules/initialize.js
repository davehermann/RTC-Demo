import { Initialize as InitializeConnect } from "./initiateConnection.js";

/**
 * Initialize any application functionality
 */
const init = async () => {
    // Check for WebRTC support before proceeding
    if (!!window.RTCPeerConnection) {
        console.log("APP LOADED");

        // Initiating a connection
        InitializeConnect();
    } else
        console.error("No WebRTC Support Detected");
}

export {
    init as Initialize,
};
