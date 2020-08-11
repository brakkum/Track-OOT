import FileData from "/emcJS/storage/FileData.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import Dialog from "/emcJS/ui/Dialog.js";
import FileSystem from "/emcJS/util/FileSystem.js";

import "/editors/modules/properties/Editor.js";

import LocationListsCreator from "../locations/LocationListsCreator.js";

export default async function(editorChoice) {
    let DataStorage = new IDBStorage("locations");
    let locationEditor = document.createElement("ted-properties-editor");

    let filter = FileData.get("filter");
    let logic = FileData.get("logic/edges");

    let locations = new Set();

    for (let region in logic) {
        for (let ch in logic[region]) {
            if (ch.startsWith("logic.location.")) {
                locations.add(ch);
            }
        }
    }

    let detailConfig = {
        "category": {
            "title": "Category",
            "type": "choice",
            "values": ["","entrance","area","location"]
        },
        "type": {
            "title": "Type",
            "type": "choice",
            "values": ["","area","chest","skulltula","scrub","gossipstone","cow","bean"]
        },
        "access": {
            "title": "Logic reference",
            "type": "select",
            "values": Array.from(locations)
        },
        "visible": {
            "title": "Visibility logic",
            "type": "logic",
            "operators": await LocationListsCreator.createOperators()
        }
    };

    for (let name in filter) {
        detailConfig[`filter/${name}`] = {
            "title": `Filter [${name}]`,
            "type": "list",
            "values": filter[name].values
        };
    }

    locationEditor.setDetailConfig(detailConfig);

    // refresh
    async function refreshLocationEditor() {
        let lists = await LocationListsCreator.createLists();
        locationEditor.loadList(lists);
        let intData = {};
        let data = FileData.get("world", {});
        for (let name in data) {
            intData[name] = {};
            for (let key in data[name]) {
                if (key != "filter") {
                    intData[name][key] = data[name][key];
                }
            }
            for (let key in filter) {
                if (data[name].filter[key] == null) {
                    intData[name][`filter/${key}`] = filter[key].values;
                } else {
                    let vals = data[name].filter[key];
                    intData[name][`filter/${key}`] = filter[key].values.filter(i => vals[i] == null || !!vals[i]);
                }
            }
        }
        locationEditor.setData(intData);
        let patch = await DataStorage.getAll();
        locationEditor.setPatch(patch);
    }
    await refreshLocationEditor();
    // register
    locationEditor.addEventListener("save", async event => {
        await DataStorage.set(event.key, event.data);
    });
    locationEditor.addEventListener("clear", async event => {
        await DataStorage.delete(event.key);
    });
    const NAV = [{
        "content": "FILE",
        "submenu": [{
            "content": "SAVE DATA",
            "handler": async () => {
                let data = FileData.get("world", {});
                let patch = await DataStorage.getAll();
                for (let name in patch) {
                    if (data[name] == null) {
                        data[name] = {
                            "category": "",
                            "type": "",
                            "access": "",
                            "visible": null,
                            "filter": {}
                        };
                    }
                    for (let key in patch[name]) {
                        if (key.startsWith("filter/")) {
                            let fKey = key.slice(7);
                            data[name].filter[fKey] = {};
                            for (let i of filter[fKey].values) {
                                data[name].filter[fKey][i] = patch[name][key].indexOf(i) >= 0;
                            }
                        } else {
                            data[name][key] = patch[name][key];
                        }
                    }
                }
                FileSystem.save(JSON.stringify(data, " ", 4), "world.json");
            }
        },{
            "content": "LOAD PATCH",
            "handler": async () => {
                let res = await FileSystem.load(".json");
                if (!!res && !!res.data) {
                    let data = res.data;
                    let intData = {};
                    for (let name in data) {
                        intData[name] = {};
                        for (let key in data[name]) {
                            if (key != "filter") {
                                intData[name][key] = data[name][key];
                            }
                        }
                        for (let key in filter) {
                            if (data[name].filter[key] == null) {
                                intData[name][`filter/${key}`] = filter[key].values;
                            } else {
                                let vals = data[name].filter[key];
                                intData[name][`filter/${key}`] = filter[key].values.filter(i => vals[i] == null || !!vals[i]);
                            }
                        }
                    }
                    await DataStorage.setAll(intData);
                    // refresh
                    await refreshLocationEditor();
                    //logicEditor.resetWorkingarea();
                }
            }
        },{
            "content": "SAVE PATCH",
            "handler": async () => {
                let data = {};
                let patch = await DataStorage.getAll();
                for (let name in patch) {
                    if (data[name] == null) {
                        data[name] = {
                            "category": "",
                            "type": "",
                            "access": "",
                            "visible": null,
                            "filter": {}
                        };
                    }
                    for (let key in patch[name]) {
                        if (key.startsWith("filter/")) {
                            let fKey = key.slice(7);
                            data[name].filter[fKey] = {};
                            for (let i of filter[fKey].values) {
                                data[name].filter[fKey][i] = patch[name][key].indexOf(i) >= 0;
                            }
                        } else {
                            data[name][key] = patch[name][key];
                        }
                    }
                }
                FileSystem.save(JSON.stringify(data, " ", 4), `world.${(new Date).valueOf()}.json`);
            }
        },{
            "content": "REMOVE PATCH",
            "handler": async () => {
                await DataStorage.clear();
                await refreshLocationEditor();
                //logicEditor.resetWorkingarea();
            }
        },{
            "content": "EXIT EDITOR",
            "handler": () => {
                locationEditor.resetWorkingarea();
                editorChoice.closeCurrent();
            }
        }]
    }];
    // register
    editorChoice.register(locationEditor, "Locations", NAV, refreshLocationEditor);
};