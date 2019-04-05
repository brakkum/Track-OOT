function createOption(value, content = value, style = {}) {
    let opt = document.createElement('div');
    opt.setAttribute('value', value);
    opt.setAttribute('slot', value);
    if (content instanceof HTMLElement) {
        opt.appendChild(content);
    } else {
        opt.innerHTML = content;
    }
    for (let i in style) {
        opt.style[i] = style[i];
    }
    return opt;
}

export {createOption};