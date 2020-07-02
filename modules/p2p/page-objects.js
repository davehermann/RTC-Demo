const
    btnConsumeOffer = document.querySelector("button.consume_offer"),
    btnGenerateOffer = document.querySelector("button.generate_offer"),
    divNegotiateConnection = document.querySelector("div.page_container.negotiator"),
    divChat = document.querySelector("div.page_container.chat"),
    txtRemoteNegotiation = document.querySelector("textarea.remote_negotiation")
    ;

function attachUi({ onBtnGenerateOfferClick, onBtnConsumeOfferClick }) {
    btnGenerateOffer.addEventListener("click", onBtnGenerateOfferClick, false);
    btnConsumeOffer.addEventListener("click", onBtnConsumeOfferClick, false);
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

export {
    divChat,
    divNegotiateConnection,
    txtRemoteNegotiation,

    attachUi as AttachUI,
    addClass as AddClass,
    removeClass as RemoveClass,
};
