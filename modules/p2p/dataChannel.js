let
    _peerData = new WeakMap(),
    _receiving = new WeakMap(),
    _receiving_onMessage = new WeakMap(),
    _sending = new WeakMap(),
    _sending_onClose = new WeakMap(),
    _sending_onOpen = new WeakMap()
    ;

class DataChannel {
    /**
     * Create a new data channel object
     * @param {Peer} peer - include a reference to the peer
     */
    constructor(peer) {
        _peerData.set(this, peer);

        // Default handlers do nothing
        this.inbound_onMessage = () => { this._pc._writeError(new Error("No onmessage defined for receiving channel")); };
        this.outbound_onClose = () => { this._pc._writeWarning("No remoteHandshake defined"); };
        this.outbound_onOpen = () => { this._pc._writeWarning("No remoteHandshake defined"); };
    }

    /**
     * Internal reference to the peer connection
     * @returns {Peer}
     */
    get _pc() { return _peerData.get(this); }

    /**
     * Data channel for incoming messages
     * @returns {RTCDataChannel}
     */
    get inbound() { return _receiving.get(this); }
    set inbound(val) { _receiving.set(this, val); }

    /**
     * Handler for inbound messages
     * @returns {Function} - with one argument *event*
     */
    get inbound_onMessage() { return _receiving_onMessage.get(this); }
    set inbound_onMessage(val) { _receiving_onMessage.set(this, val); }

    /**
     * Data channel for outgoing messages
     * @returns {RTCDataChannel}
     */
    get outbound() { return _sending.get(this); }
    set outbound(val) { _sending.set(this, val); }

    /**
     * Handler for outbound channel close
     * @returns {Function}
     */
    get outbound_onClose() { return _sending_onClose.get(this); }
    set outbound_onClose(val) { _sending_onClose.set(this, val); }

    /**
     * Handler for outbound channel open
     * @returns {Function}
     */
    get outbound_onOpen() { return _sending_onOpen.get(this); }
    set outbound_onOpen(val) { _sending_onOpen.set(this, val); }

    /**
     * A message from the remote
     * @param {MessageEvent} evt
     */
    _inboundMessageReceived (evt) {
        this._pc._writeLog(evt);

        this.inbound_onMessage(evt);
    }

    /**
     * Handler for inbound data channel creation
     * @param {RTCDataChannelEvent} evt
     */
    _onIncomingDataChannel (evt) {
        this.inbound = evt.channel;
        // Define an anonymous handler to prevent the event from binding the wrong "this"
        this.inbound.onmessage = (evt) => { this._inboundMessageReceived(evt); };

        this._pc._writeLog("remote data channel open", evt);
    }

    /**
     * Handler for outbound data channel closing
     * @param {Event} evt
     */
    _onOutboundChannelClose (evt) {
        this._pc._writeLog("outbound data channel closed", evt);

        this.outbound_onClose(evt);
    }

    /**
     * Handler for outbound data channel opening
     * @param {Event} evt
     */
    _onOutboundChannelOpen (evt) {
        this._pc._writeLog("outbound data channel opened", evt);

        this.outbound_onOpen(evt);
    }

    /**
     * Add send and receive channels to the peer connection
     */
    ConfigurePeer() {
        // Define an anonymous handler to prevent the event from binding the wrong "this"
        this._pc.peerConnection.ondatachannel = (evt) => { this._onIncomingDataChannel(evt); };

        this.outbound = this._pc.peerConnection.createDataChannel("sendingChannel");

        // Define an anonymous handler to prevent the event from binding the wrong "this"
        this.outbound.onopen = (evt) => { this._onOutboundChannelOpen(evt); };
        // Define an anonymous handler to prevent the event from binding the wrong "this"
        this.outbound.onclose = (evt) => { this._onOutboundChannelClose(evt); };
    }

    /**
     * Send a message through the outbound data channel
     * @param {*} messageToSend
     */
    Send(messageToSend) {
        this.outbound.send(messageToSend);
    }
}

export {
    DataChannel,
};
