const btnGenerateOffer = document.querySelector("button.generate_offer"),
    txtRemoteNegotiation = document.querySelector("textarea.remote_negotiation"),
    btnConsumeOffer = document.querySelector("button.consume_offer");

function attachUi({ onBtnGenerateOfferClick, onBtnConsumeOfferClick }) {
    btnGenerateOffer.addEventListener("click", onBtnGenerateOfferClick, false);
    btnConsumeOffer.addEventListener("click", onBtnConsumeOfferClick, false);
}

export {
    txtRemoteNegotiation,

    attachUi as AttachUI,
};
