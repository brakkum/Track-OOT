// @koala-prepend "../UI/ShopItemChoice.js"

function ShopBuilder(shop) {

    var cont = document.createElement("div");
    cont.className = "shop";

    function clickShopItem() {
        let t = event.currentTarget;
        let slot = t.getAttribute("data-slot");
        let shop_item = new ShopItemChoice;
        let d = new Dialog(function(result) {
            if (!!result) {
                let res = shop_item.getValue();
                let itm = data.shop_items[res];
                if (!!itm.price) {
                    shop[slot] = {item: res, price: itm.price};
                    buildShop();
                } else {
                    let shop_price = document.createElement('input');
                    shop_price.setAttribute("type", "number");
                    shop_price.setAttribute("min-value", 1);
                    shop_price.setAttribute("max-value", 999);
                    shop_price.value = shop[slot].price;
                    let d = new Dialog(function(result) {
                        if (!!result) {
                            shop[slot] = {item: res, price: shop_price.value};
                            buildShop();
                        }
                    });
                    d.setTitle("Slot " + (slot + 1) + " Price");
                    d.setSubmitText("SUBMIT");
                    d.setAbortText("CANCEL");
                    d.addElement(shop_price);
                }
            }
        });
        d.setTitle("Slot " + (slot + 1) + " Item");
        d.setSubmitText("SUBMIT");
        d.setAbortText("CANCEL");
        d.addElement(shop_item);
    }

    function buildShop() {
        cont.innerHTML = "";
        for (let j = 0; j < shop.length; ++j) {
            let item = shop[j];
            let shop_item = data.shop_items[item.item];
            let itm = document.createElement("div");
            itm.setAttribute("data-slot", j);
            itm.onclick = clickShopItem;
            itm.className = "shop-item";
            let img = document.createElement("div");
            img.className = "shop-item-image";
            img.style.backgroundImage = "url('images/" + shop_item.image + "')";
            itm.appendChild(img);
            let iam = document.createElement("div");
            iam.innerHTML = translate(item.item) + (shop_item.refill ? "" : " " + translate("special_deal"));
            iam.className = "shop-item-title";
            itm.appendChild(iam);
            let ipr = document.createElement("div");
            ipr.innerHTML = item.price;
            ipr.className = "shop-item-price";
            itm.appendChild(ipr);
            cont.appendChild(itm);
        }
    }

    buildShop();

    cont.getShop = function() {
        return shop;
    }

    return cont;

}