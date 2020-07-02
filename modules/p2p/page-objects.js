const
    btnConsumeOffer = document.querySelector("button.consume_offer"),
    btnGenerateOffer = document.querySelector("button.generate_offer"),
    btnSendChat = document.querySelector("button.send_chat"),
    divNegotiateConnection = document.querySelector("div.page_container.negotiator"),
    divChat = document.querySelector("div.page_container.chat"),
    divChatHistory = document.querySelector(".chat div.history"),
    txtChatEntry = document.querySelector("textarea.chat_entry"),
    txtRemoteNegotiation = document.querySelector("textarea.remote_negotiation")
    ;

function attachUi({ onBtnGenerateOfferClick, onBtnConsumeOfferClick, onBtnSendChatClick }) {
    btnGenerateOffer.addEventListener("click", onBtnGenerateOfferClick, false);

    // Consume offer on enter key
    txtRemoteNegotiation.addEventListener("keydown", (evt) => { if (evt.keyCode == 13) onBtnSendChatClick(); }, false);
    btnConsumeOffer.addEventListener("click", onBtnConsumeOfferClick, false);

    // Send a chat on enter key
    txtChatEntry.addEventListener("keydown", (evt) => { if (evt.keyCode == 13) onBtnSendChatClick(); }, false);
    btnSendChat.addEventListener("click", onBtnSendChatClick, false);
}

function addClass(element, className) {
    let existingClasses = !!element.className ? element.className.split(" ") : [];

    if (existingClasses.indexOf(className) < 0)
        existingClasses.push(className);

    element.className = existingClasses.join(" ");
}

function removeClass(element, className) {
    let existingClasses = !!element.className ? element.className.split(" ") : [],
        idxRemove = existingClasses.indexOf(className);

    if (idxRemove >= 0)
        existingClasses.splice(idxRemove, 1);

    element.className = existingClasses.join(" ");
}

/**
 * Display received messages
 * @param {String} messageText - Text string send from the remote
 */
function displayMessage(messageText, fromRemote = false) {
    // create a row
    const elRow = document.createElement("div");
    elRow.className = `row ${fromRemote ? "remote" : "local"}`;

    // create a message
    const el = document.createElement("div");
    let txt = document.createTextNode(`${(new Date()).toLocaleString()} - ${messageText}`);
    el.appendChild(txt);
    elRow.appendChild(el);

    divChatHistory.appendChild(elRow);
}

export {
    divChat,
    divNegotiateConnection,
    txtChatEntry,
    txtRemoteNegotiation,

    attachUi as AttachUI,
    addClass as AddClass,
    displayMessage as DisplayMessage,
    removeClass as RemoveClass,
};
