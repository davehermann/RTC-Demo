# RTC Data Connection

## Getting started

1. Clone the repo
1. `npm install` to add [Live Server](https://github.com/tapio/live-server)
    + This can be skipped you have a simple HTTP server available locally
1. `npm run test` to start
1. See [Simple Single-page](#simple-single-page) below for a window communicating with itself
1. See [Two windows, one computer](#two-windows-one-computer) below for using two separate browser tabs and passing negotiating signals using the clipboard


## Included examples

### Simple Single-page

*This is a pointless usecase, but a good example of setting up the basic communication channels*

This initial example is based on [A simple RTCDataChannel sample](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Simple_RTCDataChannel_sample) at MDN, and it's [Javascript code on Github](https://github.com/mdn/samples-server/blob/master/s/webrtc-simple-datachannel/main.js).

The browser window hosts two peer connections: a *local*, which would normally occur, and a *remote* which would normally not be in the same application.
The local connection initiates the RTC session, and then allows sending of messages once connected via a text input.
The remote connection receives the strings, and posts them onto the page.
The session negotiation is logged to the console, and simplified as it's all local.

### Two Windows, One Computer

This is a much more real-world example that's built for two browser windows on one computer, but can be run on multiple if you have a way to transfer copied text.

Additionally, [peer.js](./modules/p2p/peer.js) (with it's dependencies, see the file), is build as a first-draft useable module for implementing WebRTC.

1. Open two browser windows/tabs
1. Click **Generate Offer** button on one of them
    + This will generate an offer JSON string, and copy it to your clipboard
1. Switch to the other window, and paste into the *Consume Offer* box
    + This will generate an answer JSON string, and copy it to your clipboard
1. Switch to the first window, and paste the answer into the *Consume Offer* box
    + This will provide the first ICE candidate string
1. Switch to the second window, and paste into the *Consume Offer* box

At this point, you should see the UI switch to showing the chat boxes on both windows. If you run this with a friend over the internet, keep going back-and-forth between windows until the connection has been successfully negotiated.

In building this example, https://github.com/shanet/WebRTC-Example/blob/master/client/webrtc.js proved useful.
While it's diverged, that original source will still have value.
