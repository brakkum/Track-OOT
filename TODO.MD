
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

---

### TODO BEFORE GRAPH LOGIC RELEASE

- verify all logic of location availability glitched logic (major)
- completed()

- add these skips to options
    - "skip.dc_vines_gs"
    - "skip.dc_scrub_room"
    - "skip.forest_first_gs"
    - "skip.ice_block_gs"
    - "skip.dmt_climb_hovers"
    - "skip.goron_grotto"
    - "skip.domain_gs"
    - "skip.castle_storms_gs"
    - "skip.shadow_umbrella_gs"
    - "skip.spirit_lobby_jump"
    - "skip.water_dragon_adult"
    - "skip.water_dragon_child"
    - "skip.water_central_gs_irons"
    - "skip.water_falling_platform_gs_hookshot"
    - "skip.water_falling_platform_gs_boomerang"

### TODO FOR OVERWORLD ENTRANCES

- create entrance aliases so the association wont break on return paths
    - blocks interior association
    - blocks overworld association(should be fixed with overworld gateways)
    

### TODO

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