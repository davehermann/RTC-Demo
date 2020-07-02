const btnGenerateOffer = document.querySelector("button.generateOffer");

function attachUi({ onBtnGenerateOfferClick }) {
    btnGenerateOffer.addEventListener("click", onBtnGenerateOfferClick, false);
}

export {
    attachUi as AttachUI,
};
