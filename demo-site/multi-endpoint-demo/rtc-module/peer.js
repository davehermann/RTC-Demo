import { DataChannel } from "./dataChannel.js";
import { v4 as uuid } from "./uuid.js";
import { defaultServers } from "./defaultSTUN.js";

const
    _connectionId = new WeakMap(),
    _dataChannel = new WeakMap(),
    _iceServers = new WeakMap(),
    _logToConsole = new WeakMap(),
    _peerConnection = new WeakMap(),
    _peerConnection_onStateChanged = new WeakMap(),
    _remoteHandshake = new WeakMap()
    ;

/**
 * Manages a WebRTC peer connection
 */
class Peer {
    /**
     * Initialize the connection object
     * @param {Map} options
     * @param {Boolean} [options.logToConsole] - *optional*
     *   - write console logging
     *   - *(default: **true**)*
     */
    constructor ({ logToConsole } = {}) {
        if (logToConsole === undefined) logToConsole = true;

        // Configure instance
        _connectionId.set(this, uuid());
        _logToConsole.set(this, logToConsole);

        // Set defaults
        this.iceServers = Peer.defaultIceServers;
        this.remoteHandshake = () => { this._writeError(new Error("No remoteHandshake defined")); };
        this.peerConnection_onStateChanged = () => { this._writeWarning("No connection state change event defined"); }
    }

    /**
     * The default STUN/TURN server list
     */
    static get defaultIceServers() {
        return defaultServers;
    }

    /**
     * ID of this connection
     * @returns {String}
     */
    get connectionId() { return _connectionId.get(this); }

    /**
     * The data channel object for text/binary communication between peers
     * @returns {DataChannel}
     */
    get dataChannel() { return _dataChannel.get(this); }
    set dataChannel(val) { _dataChannel.set(this, val); }

    /**
     * Array of ICE server identifies
     *   - Uses a default of the static Peer.defaultIceServers
     *   - Set as **undefined** to not use any ICE servers
     * @returns {Array<Map>}
     */
    get iceServers() { return _iceServers.get(this); }
    set iceServers(val) { _iceServers.set(this, val); }

    /**
     * Get the connection
     * @return {RTCPeerConnection}
     */
    get peerConnection() { return _peerConnection.get(this); }
    set peerConnection(val) { _peerConnection.set(this, val); }

    /**
     * The connection state has been updated
     * @return {Function}
     */
    get peerConnection_onStateChanged() { return _peerConnection_onStateChanged.get(this); }
    set peerConnection_onStateChanged(val) { _peerConnection_onStateChanged.set(this, val); }

    /**
     * Function that receives a **Map**
     * @property {Peer} peer - this
     * @property {RTCSessionDescription} [description] - offer or answer
     * @property {RTCIceCandidate} [iceCandidate] - ICE candidate
     * @returns {Function}
     */
    get remoteHandshake() { return _remoteHandshake.get(this); }
    set remoteHandshake(val) { _remoteHandshake.set(this, val); }

    /**
     * Include a data channel in connection
     * @return {Boolean}
     */
    get useDataChannel() { return !!this.dataChannel; }
    set useDataChannel(val) { this.dataChannel = val ? new DataChannel(this) : null; }

    /**
     * Write exceptions to the console
     * @param {Error} err
     * @param {String} note
     */
    _writeError (err, note) {
        let tag = "EXCEPTION";
        if (!!note)
            tag = `${tag} - ${note}`;

        console.error(tag, err);
    }

    /**
     * Write any parameters as a warning to the console
     */
    _writeWarning () {
        console.warn(...arguments);
    }

    /**
     * Log any parameters to to the console, if logToConsole == true
     */
    _writeLog () {
        if (_logToConsole.get(this))
            console.log(...arguments);
    }

    /**
     * Fired on the connection state change
     * @param {Event} connectionStateEvent
     */
    _connectionStateChanged (connectionStateEvent) {
        this._writeLog("connection state changed", connectionStateEvent);

        this.peerConnection_onStateChanged(connectionStateEvent);
    }

    /**
     * Handler for ICE events
     * @param {RTCPeerConnectionIceEvent} iceEvent
     */
    _newIceCandidate (iceEvent) {
        this._writeLog("ICE Candidate", iceEvent);

        // Always send, and let the handler deal with end of candidates being null
        this.remoteHandshake({ peer: this, iceCandidate: !!iceEvent ? iceEvent.candidate : null });
    }

    /**
     * Process the signal sent as part of connection negotiation
     * @param {Map} signal
     * @param {Peer} signal.peer - should be this object
     * @param {RTCSessionDescription} [signal.description] - the offer or answer generated
     * @param {RTCIceCandidate} [signal.iceCandidate] - the next ICE candidate
     */
    async ConsumeNegotiation (signal) {
        let pNegotiate = Promise.resolve();

        if (!!signal.description)
            pNegotiate = this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.description))
                .then(() => {
                    // Create an answer in response to an offer
                    if (signal.description.type == "offer")
                        return this.GenerateAnswer();
                })
        else if (!!signal.iceCandidate)
                pNegotiate = this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.iceCandidate));

        pNegotiate = pNegotiate
                .catch(err => this._writeError(err, "adding negotiation response"));

        return pNegotiate;
    }

    /**
     * Generate an answer to a WebRTC offer
     */
    async GenerateAnswer () {
        try {
            const answer = await this.peerConnection.createAnswer();
            this._writeLog("local answer", answer);

            await this.GenerateDescription(answer);
        } catch (err) {
            this._writeError(err, "creating answer");
        }
    }

    /**
     * Initialize the peer connection
     */
    GenerateConnection () {
        let configuration = null;
        if (!!this.iceServers)
            configuration = { iceServers: this.iceServers };

        this.peerConnection = new RTCPeerConnection(configuration);

        // Define an anonymous handler to prevent the event from binding the wrong "this"
        this.peerConnection.onicecandidate = (iceEvent) => { this._newIceCandidate(iceEvent); };

        // Define an anonymous handler to prevent the event from binding the wrong "this"
        this.peerConnection.onconnectionstatechange = (connectionStateChangeEvent) => { this._connectionStateChanged(connectionStateChangeEvent); }

        if (this.useDataChannel)
            this.dataChannel.ConfigurePeer();
    }

    /**
     * Generate am RTCSessionDescription for the RTCPeerConnection, and send to remote
     * @param {String} description
     */
    async GenerateDescription (description) {
        try {
            await this.peerConnection.setLocalDescription(description);
            this._writeLog("local description", this.peerConnection.localDescription);

            this.remoteHandshake({ peer: this, description });
        } catch (err) {
            this._writeError(err, "setting local description");
        }
    }

    /**
     * Generate an offer for a new connection
     */
    async GenerateOffer () {
        try {
            const offer = await this.peerConnection.createOffer();
            this._writeLog("local offer", offer);
            await this.GenerateDescription(offer);
        } catch (err) {
            this._writeError(err, "creating offer");
        }
    }

    /**
     * Create a new RTCPeerConnection, and generate an offer
     */
    async InitializeConnection () {
        this.GenerateConnection();

        await this.GenerateOffer();
    }
}

export {
    Peer,
}
