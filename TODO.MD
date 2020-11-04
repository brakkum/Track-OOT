
### FIX MAJOR BUGS

- initial sync does not include extra data (?)
    - at least entrances have not been transfered
- check key counts for dungeons
    - seems to always use max of both instead of the correct value

---

### FIX MINOR BUGS

- fix multiplayer sync
    - undo/redo does not sync correctly
        - fix: disable undo/redo in multiplayer, due to possibly unwanted behaviour
    - entrances in multiplayer cast wrong exits
        - maybe ui does not update correctly

- load icon from marker config

- search in contextmenu
    - subset search does not work all times
    - reset search after contextmenu close

---

### TODO BEFORE GRAPH LOGIC RELEASE

- verify all logic of location availability glitched logic (major)
- completed()


### TODO FOR OVERWORLD ENTRANCES

- create entrance aliases so the association wont break on return paths
    - blocks interior association
    - blocks overworld association(should be fixed with overworld gateways)
    

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