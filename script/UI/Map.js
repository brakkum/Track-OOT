function Map(cont, image, width, height) {

    var el = document.createElement('div');
    el.id = "map";
    el.style.backgroundImage = 'url("'+image+'")';
    el.style.width = 'calc('+width+'px * var(--map-scale))';
    el.style.height = 'calc('+height+'px * var(--map-scale))';
    cont.appendChild(el);

}