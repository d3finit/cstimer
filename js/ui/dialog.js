export function dialog(title, content, okCb = undefined, noCb = undefined, gray = undefined) {
    let div = $('<div/>');
    div.html(content);
    kernel.showDialog([div, okCb, noCb, gray], 'plus', title);
}