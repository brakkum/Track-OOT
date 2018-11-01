// @koala-prepend "Item.js"
// @koala-prepend "ToggleMQ.js"
// @koala-prepend "ToggleReward.js"

function DungeonStatus(ddata, cont) {

    var title, small_key, boss_key, map, compass, reward, mq;
    var el = document.createElement('DIV');
    el.classList.add("item-row");
    cont.appendChild(el);

    //////////////////////////////////
    // title
    title = createItemText(ddata.title);
    el.appendChild(title);
    //////////////////////////////////
    // small key
    if (!!ddata.keys) {
        small_key = new Item(ddata.keys, el);
    } else {
        el.appendChild(createItemText(""));
    }
    //////////////////////////////////
    // boss key
    if (!!ddata.bosskey) {
        boss_key = new Item(ddata.bosskey, el);
    } else {
        el.appendChild(createItemText(""));
    }
    //////////////////////////////////
    // map
    if (!!ddata.map) {
        map = new Item(ddata.map, el);
    } else {
        el.appendChild(createItemText(""));
    }
    //////////////////////////////////
    // compass
    if (!!ddata.compass) {
        compass = new Item(ddata.compass, el);
    } else {
        el.appendChild(createItemText(""));
    }
    //////////////////////////////////
    // reward
    if (!!ddata.boss_reward) {
        reward = new ToggleReward(ddata.ref, el);
    } else {
        el.appendChild(createItemText(""));
    }
    //////////////////////////////////
    // mode (v|mq)
    if (!!ddata.hasmq) {
        mq = new ToggleMQ(ddata.ref, el);
    } else {
        el.appendChild(createItemText(""));
    }
    

    this.update = function() {
        if (!!small_key) small_key.update();
        if (!!boss_key) boss_key.update();
        if (!!map) map.update();
        if (!!compass) compass.update();
        if (!!reward) reward.update();
        if (!!mq) mq.update();
    }

    function createItemText(text) {
        var el = document.createElement('DIV');
        el.classList.add("text");
        el.innerHTML = text;
        return el;
    }


}