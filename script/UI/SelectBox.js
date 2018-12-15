function SelectBox() {

    var select = document.createElement('select');

    select.addOption = function(name, value) {
        let option = document.createElement("option");
        option.innerHTML = name;
        option.setAttribute("value", value || name);
        select.appendChild(option);
    }

    return select;
}