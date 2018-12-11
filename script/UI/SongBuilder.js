function SongBuilder(notes) {

    var cont = document.createElement("div");
    cont.className = "song";
    // stave
    var stave = document.createElement("div");
    stave.className = "stave";
    cont.appendChild(stave);
    // buttons
    var btnList = document.createElement("div");
    btnList.className = "button-container";

    var btn_A = document.createElement("div");
    btn_A.className = "btn btn_A";
    btn_A.setAttribute("data-note", "A");
    btn_A.onclick = addNote;
    btnList.appendChild(btn_A);

    var btn_D = document.createElement("div");
    btn_D.className = "btn btn_D";
    btn_D.setAttribute("data-note", "D");
    btn_D.onclick = addNote;
    btnList.appendChild(btn_D);

    var btn_R = document.createElement("div");
    btn_R.className = "btn btn_R";
    btn_R.setAttribute("data-note", "R");
    btn_R.onclick = addNote;
    btnList.appendChild(btn_R);

    var btn_L = document.createElement("div");
    btn_L.className = "btn btn_L";
    btn_L.setAttribute("data-note", "L");
    btn_L.onclick = addNote;
    btnList.appendChild(btn_L);

    var btn_U = document.createElement("div");
    btn_U.className = "btn btn_U";
    btn_U.setAttribute("data-note", "U");
    btn_U.onclick = addNote;
    btnList.appendChild(btn_U);

    var btn_X = document.createElement("div");
    btn_X.className = "btn btn_X";
    btn_X.onclick = removeNote;
    btnList.appendChild(btn_X);

    cont.appendChild(btnList);

    function addNote(event) {
        notes.push(event.target.getAttribute("data-note"));
        buildSong();
    }

    function removeNote() {
        notes.pop();
        buildSong();
    }

    function buildSong() {
        stave.innerHTML = "";
        for (let j = 0; j < notes.length; ++j) {
            var note = notes[j];
            var nt = document.createElement("div");
            nt.className = "note note_"+note;
            stave.appendChild(nt);
        }
    }

    buildSong();

    cont.getSong = function() {
        return notes;
    }

    return cont;

}