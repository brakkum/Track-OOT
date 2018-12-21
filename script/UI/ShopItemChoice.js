function ShopItemChoice() {

    let value = "";
    let selected_category = "";
    let items = data.shop_items;
    let cont = document.createElement("div");
    cont.className = "shop-items";

    let cat_btn = document.createElement("div");
    cat_btn.className = "shop-items-buttonlist";
    cont.appendChild(cat_btn);

    let cat_cnt = document.createElement("div");
    cat_cnt.className = "shop-items-container";
    cont.appendChild(cat_cnt);

    let categories = {};
    
    for (let item in items) {
        let values = items[item];

        let cat = categories[values.category];
        if (!cat) {
            cat = document.createElement('div');
            cat.className = "shop-item-category";
            cat.id = "shop-item-category-" + values.category;
            categories[values.category] = cat;
        }

        let itm = document.createElement("div");
        itm.setAttribute("data-value", item);
        itm.id = "shop-item-" + item;
        itm.onclick = clickItem;
        itm.className = "shop-item";
        let img = document.createElement("div");
        img.className = "shop-item-image";
        img.style.backgroundImage = "url('images/" + values.image + "')";
        itm.appendChild(img);
        let iam = document.createElement("div");
        iam.innerHTML = translate(item) + (values.refill ? "" : " " + translate("special_deal"));
        iam.className = "shop-item-title";
        itm.appendChild(iam);

        cat.appendChild(itm);
    }

    for (let category in categories) {
        let el = categories[category];
        if (!selected_category) {
            selected_category = category;
            el.classList.add('active');
        }
        cat_cnt.appendChild(el);

        let btn = document.createElement('div');
        btn.innerHTML = translate(category);
        btn.className = "shop-item-categorybutton";
        btn.setAttribute("data-target", category);
        btn.onclick = clickCategory;
        cat_btn.appendChild(btn);
    }

    function clickCategory(event) {
        if (!!selected_category) {
            cont.querySelector('#shop-item-category-' + selected_category).classList.remove('active');
        }
        let t = event.currentTarget;
        selected_category = t.getAttribute("data-target");
        cont.querySelector('#shop-item-category-' + selected_category).classList.add('active');
        event.stopPropagation();
    }

    function clickItem(event) {
        if (!!value) {
            cont.querySelector('#shop-item-' + value).classList.remove('active');
        }
        let t = event.currentTarget;
        value = t.getAttribute("data-value");
        t.classList.add('active');
        event.stopPropagation();
    }

    cont.getValue = function getValue() {
        return value;
    }

    return cont;

}