
### FIX MAJOR BUGS

- create entrance aliases so the association wont break on return paths
    - blocks interior association
    - blocks overworld association
- initial sync does not include extra data (?)
    - at least entrances have not been transfered

---

### FIX MINOR BUGS

- fix multiplayer sync
    - undo/redo does not sync correctly

---

### TODO BEFORE GRAPH LOGIC RELEASE

- verify all logic of location availability (major)
- completed(kokiri,woods,field,lake,water temple,deku)

- verify all logic of location availability glitched logic (major)
- completed()

- test skips and reorganize skips by area

- add missing options
    - on new game options are written initially by the `StateStorage`
    - on game load missing/changed options should be added by `StateConverters`
    

### TODO

- add warning dialog to download update if needed

- custom layout (aka build yourself a tracker)

- implement settings for dungeon status control

- custom element using 2 list-select
    - add search options (done)
    - 1 list with deactivated elements
    - 1 list with activated elements
    - buttons for (de-)activating elements

- make unified list/map marker abstract class
    - make overwritable update state/aviability function (called on connected callback)
    
- add tooltips to location badges

---

### REQUESTS

- optionally increase skully token count with ticking off skullies

- add tooltips to all the icons
- context menu for areas/entrances
- context menu on map icons

- better color choices
    - add theming to custom-elements

- remove zora letter if not used (fountain open)
    - make invisible

- on network play make location- and mode change (locationlist/map) synchronize optional

- add shops to map / list

- add notes to each location/area