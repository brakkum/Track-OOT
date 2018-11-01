function LayoutManager(cont) {

    var children = {}; // better use map; mapvalue should be unique

    this.addChild = function addChild(name, el) {
        // check for html element
        if (!!children[name]) {
            throw new Error("name is already occupied");
        }
        if (Object.values(children).indexOf(el) >= 0) {
            throw new Error("element already in list");
        }
        children[name] = el;
    }

    this.removeChild = function removeChild(name) {
        delete children[name];
    }

    // TODO layouting; loading layouts

}