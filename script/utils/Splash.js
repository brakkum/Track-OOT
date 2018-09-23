Splash = (new function(){
    var spl = document.getElementById("splash");
    var ldn = spl.querySelector('.loading');

    this.update = function(max, val) {
        ldn.innerHTML = "Loading... " + val + "/" + max;
    }

    this.hide = function() {
        spl.className = "inactive";
    }

}());