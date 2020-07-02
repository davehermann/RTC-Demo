/**
 * UUID v4 utilizing the crypto API for more secure randomness
 *   - See discussion at https://stackoverflow.com/a/2117523, and compare to accepted answer - by the same author - using Math.random()
 */
function v4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}

export {
    v4,
}
