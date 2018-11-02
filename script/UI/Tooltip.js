function Tooltip(target, content) {

    var el = document.createElement('div');
    el.className = "tooltip";
    el.innerHTML = content;

    target.addEventListener("mouseover", function(ev) {
        document.body.appendChild(el);
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;
        var x = ev.pageX;
        var y = ev.pageY;

        var ew = el.clientWidth + 40;
        var eh = el.clientHeight + 20;

        if (y + 20 + eh >= h) {
            y -= eh;
        } else {
            y += 20;
        }

        if (x + 20 + ew >= w) {
            x = w - ew;
        } else {
            x += 20;
        }

        el.style.left = x + "px";
        el.style.top = y + "px";
    });

    target.addEventListener("mouseout", function(ev) {
        document.body.removeChild(el);
    });

}