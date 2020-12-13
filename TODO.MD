
### FIX MAJOR BUGS

- app is unresponsive sometimes
    - lots of stuff getting calculated on changes
    - cache data, only calculate minimum
    - see if logic execution can get outsourced into webworker thread
        - maybe even calculate list logic there
    - see if we can only update where needed
    - do less filedata calls

- multiplayer bugs
    - item count can get desynced if two peers click at the same time
        - increase + increase (?)
        - decrease + decrease (?)
        - increase + decrease (?)
    - shop bought marker not synced (?)

---

### FIX MINOR BUGS

- load icon from marker config

- search in contextmenu
    - subset search does not work all times

---

### TODO FOR OVERWORLD ENTRANCES

- create entrance aliases so the association wont break on return paths
    - blocks interior association
    - blocks overworld association(should be fixed with overworld gateways)
    
---

### DUNGEONSTATE

change:

```json
{
    "type": "panel",
    "name": "dungeon-status",
    "options": {
        "itemsize": 40,
        "orientation": "column",
        "active": [
            "reward",
            "key"
        ]
    }
}
```

to:

```json
{
    "type": "panel",
    "name": "dungeon-status",
    "options": {
        "itemsize": 40,
        "orientation": "column",
        "dungeons": {
            "whitelist": false,
            "values": [
                "area/well",
                "area/ice_cavern",
                "area/gerudo_fortress",
                "area/training_grounds"
            ]
        },
        "states": {
            "whitelist": true,
            "values": [
                "reward",
                "key"
            ]
        },
    }
}
```

---

### TODO

- add rom options
    - disabled locations
        - remove them from lists if deactivated
        - alternative "ghost" locations to be activated in option
            - do not count ghost locations for totals
        - needs side-by-side input element
    - starting items
        - modify item elements to allow min values
        - needs side-by-side input element

- add warning dialog to download update if needed

- custom layout (aka build yourself a tracker)

- implement settings for dungeon status control

- custom element using 2 list-select
    - add search options (done)
    - 1 list with deactivated elements
    - 1 list with activated elements
    - buttons for (de-)activating elements

- make unified listitems/mapmarkers abstract class
    - make overwritable update state/aviability function (called on connected callback)
    - removes the need to explicitly have all functions present on all listitems/mapmarkers
    
- add tooltips to location badges

- after import state ask to load the state or not
    - dialog "state imported --- do you want to load the imported state? --- Yes - No"

- message to deactivate the following for detached window
    - chrome://flags/#web-contents-occlusion
    - chrome://flags/#calculate-native-win-occlusion

---

### REQUESTS

- optionally increase skully token count with ticking off skullies

- better color choices
    - add theming to custom-elements

- remove zora letter if not used (fountain open)
    - make invisible

- on network play make location- and mode change (locationlist/map) synchronize optional

- add shops to map / list

- add notes to each location/area