## CHANGELOG

Application:    Track-OOT

***

## VERSION 2.0.19

### BUGFIXES

- fixed keys incorrectly shown in dungeonstate if they should be actually invisible
- added new layout `Essential Items with Map (key/reward)`

---

## VERSION 2.0.18

### BUGFIXES

- fixed issues with `adult era filter` and `Closed Forest`

---

## VERSION 2.0.17

### BUGFIXES

- fixed keys not wanting to load states

---

## VERSION 2.0.16

### BUGFIXES

- fixed spoiler parsers not binding exits properly
- fixed logic caller not using dungeonstate reference correctly

---

## VERSION 2.0.15

### BUGFIXES

- fixed blue fire in logic
- fixed consider buyables

### IMPROVEMENTS

- make dungeon reward choice an itempicker

---

## VERSION 2.0.14

### FEATURES

- Updated OOTR Logic to 6.0
- Added Shuffle Song Warps option (Currently only affects Biggoron Bolero Skip)
- Added missing options for 6.0 spoilers in Spoiler Parser
- Removed Malon and Zelda's Lullaby checks if Skip Child Zelda is active
- add filter for era apply mode
    - changes how region access logic rules work with era filters

### BUGFIXES

- fix key max counts not applied on dungeon type change
- fix longpress issue on iOS>14 browser
    - think different

---

## VERSION 2.0.13

### BUGFIXES

- fixed adult trading sequence starting value option was missing cojiro
- fixed adult trading sequence item could not be deactivated
- fixed adult trading sequence item loading starting item option incorrectly

---

## VERSION 2.0.12

### BUGFIXES

- fixed gossipstone dialog translations
- fixed gossipstone location/item translations
- fixed gossipstone not showing hint data on load

---

## VERSION 2.0.11

### BUGFIXES

- fixed debounced state timer not resetting properly
- fixed tabview initialization issue
- make hints read data from item and world files
- make searches trigger live instead of after entering value

---

## VERSION 2.0.10

### BUGFIXES

- fixed error in item states
- fixed debounced state multiplayer sync bug

---

## VERSION 2.0.9

### BUGFIXES

- fixed filter menu not opening

---

## VERSION 2.0.8

### BUGFIXES

- fixed tabview not building view correctly

---

## VERSION 2.0.7

### BUGFIXES

- fixed FREE reward item reference on load
- changed bomb bag icon to have more visible bomb
- fixed visual bug in navbar for FF
- add in some global styles for increased peformance
    - currently only affects chrome (experimental feature)
    - fallback for browsers not supporting this
- fixed additive calculation for items in multiplayer

### IMPROVEMENTS

- add background state for item elements
    - items are a little bit more responsive
- make first bunch of ui elements use global styles
    - faster style calculations on blink browsers

### FEATURES

- reactivated the logic viewer for now
    - allows us to have at least some feedback on the logic
    - visual logic interpretation removed
        - graph logic can not be visualized by such primitive means
        - could lead to missinterpretation of access results otherwise

---

## VERSION 2.0.6

### BUGFIXES

- fixed state export for really old states
- fixed older stateconverter
- fixed initial read of state to use converted data instead of stored
- fixed key counting issue for V/MQ dungeons
- fixed pocket reward marker in item grid

---

## VERSION 2.0.5

### BUGFIXES

- fixed well entrance filter

---

## VERSION 2.0.4

### HOTFIX

- updated logic to OOTR dev build 5.2.119
- removed `at` logic from a few grottos in hyrule field allowing grottos to be checked as child if you have hammer and can become adult
- fixed spoiler parser parsing shops with no data

---

## VERSION 2.0.3

### BUGFIXES

- fixed detached window

---

## VERSION 2.0.2

### BUGFIXES

- fix gerudo card was not tracked if bosskey tracking was deactivated
- fix multiplayer to sync items additive instead of overwriting

---

## VERSION 2.0.1

### BUGFIXES

- fix multiplayer sync
- add better icons for wallets
- use bomb bag icon in item association

---

## VERSION 2.0.0

### LOGIC

- use logic graph instead of static logic
    - graph traversial uses first hit for determining reachability
    - mixins get executed on demand
        - slower mixins, but region dependency safe
- added glitched logic
    - add glitched custom logic
    - add glitched logic editor

### ENTRANCE SHUFFLE

- added translation matrix for entrance shuffle
- added exit types configuration
- add new exit->entrance configuration to savestate
- add view for configuring exit->entrances
    - dungeons
    - interior
    - grottos
    - graves
- added subareas
- temporarily deactivate the map view containing overworld locations
    - does conflict with current interior/grotto entrance rando
- entrances that are unbound open binding contextmenu on click
- added marker for areas to show unbound entrances reachable

### UX ENHANCEMENTS

- make locations be toggled instead of set
    - click / touch will be used for toggle checked / unchecked
    - right click / long press is now for contextmenu only
        - context menu added for map locations
- add presets to randomizer options
- add item association to location
- add contextmenus to areas
    - add check/uncheck all
    - add woth/barren markers
- add contextmenus to exits
    - add check/uncheck all
    - set entrance as 2nd level contextmenu
    - add woth/barren markers
- added spoilerlog parser for presetting
    - randomizer options
    - starting items
    - item-location-binding
    - woth/barren
    - dungeon type
    - shops

### CREDITS

- added credits section
    - auto generate supporter list
    - supporter list is cached locally

### DEBOUNCED STATE EVENTS

- state events are now debounced
    - reduces ui lag
    - reduces network messages

### BUGFIXES

- fix logger breaking out of the viewport
- deactivate undo (ctrl+z) / redo (ctrl+y) as it messes with multiplayer

---

## VERSION 1.7.21

### BUGFIXES

- fix collossus scrubs missing can_become_adult

## VERSION 1.7.20

### BUGFIXES

- fix shops not syncing for multiplayer

---

## VERSION 1.7.19

### BUGFIXES

- fix loading custom logic for view even if custom logic is off

---

## VERSION 1.7.18

### BUGFIXES

- fix loading wrong dependency version for editors

---

## VERSION 1.7.17

### FEATURES

- merge in pull request by Elagatua
    - add reward string to medallions/stones in item panel
- make dungeon rewards save as string values instead of indexes
- add item value alignment to configuration
- add a different default font size for items
- add unexpected disconnect from host alert to network play
- added fullscreen toggle button

### BUGFIXES

- fix location list header not updating after location check/uncheck
- fix some styling regarding item element hover

### REMOVED

- ancient hylian font was removed due to bad leading

---

## VERSION 1.7.16

### BUGFIXES

- fixed logging on connection established for host

---

## VERSION 1.7.15

### BUGFIXES

- fixed message buffer on connection not called correctly

---

## VERSION 1.7.14

### BUGFIXES

- fixed signalling connection issue

---

## 1.7.13

### BUGFIXES

- added some more checks for errors to room closing in multiplayer
- adjusted names for era filters in logic to represent actual existing values
- make filters in logic editor expand to specific values
- make logic editor expansion modules be used by the tracker (remove redundancy)
- allow special characters in multiplayer rooms

---

## VERSION 1.7.12

### FEATURES

- added logger to multiplayer
- added join/leave "toasts" to multiplayer

---

## VERSION 1.7.11

### FEATURES

- added more layout configurations

### BUGFIXES

- fixed some bugs concerning multiplayer

---

## VERSION 1.7.10

### FEATURES

- added only in dungeons to skulltulas filter

### BUGFIXES

- fixed right clicking on filtermenu closed the filter context menu

---

## VERSION 1.7.9

### BUGFIXES

- fixed wasteland checks missing gerudo access

---

## VERSION 1.7.8

### BUGFIXES

- fix spirit temple access logic missing gerudo fortress access
- fix logic editor not reloading data if "load patch" or "remove patch" has been pressed
- fix state import failing for unnamed states
    - autosave import was not possible

---

## VERSION 1.7.7

### FEATURES

- added skulltulas filter for list and map
- added gossipstones filter for list and map
    - remove gossipstones disable option

### BUGFIXES

- fixed font size being to small
- fixed some styling bugs occuring while making the font size bigger
- fixed filters misbehaving if not strictly defined
- faster import resources by using async loading instead of sequential

---

## VERSION 1.7.6

### FEATURES

- added hidden grotto logic

### BUGFIXES

- fixed some checks in water temple requireing lullaby although they should not

---

## VERSION 1.7.5

### BUGFIXES

- fix hidden areas not updating correctly

### FEATURES

- add support for multiple list filters
    - this allows filtering skulltulas/gossipstones directly from list in the future
- add support for storing selected filters to savestate
- added theme support to context menu

---

## VERSION 1.7.4

### BUGFIXES

- fix areas in list not updating
- fix items not resetting on load/new state

---

## VERSION 1.7.3

### BUGFIXES

- fix rtc server configuration

---

## VERSION 1.7.2

### BUGFIXES

- fix items getting reset on rom options change
- fix areas not updating counts on filter change

---

## VERSION 1.7.1

### BUGFIXES

- fix logic for fountain and ice cavern access
- fix detached window not loading

### FEATURES

- add open zora adult

---

## VERSION 1.7.0

### USABILITY ENHANCEMENTS
- added filters and bulk select to lists in settngs
- show actual savestate name in state load/save/management instead of id
- added undo (ctrl+z) / redo (ctrl+y)
- split rom-settings and tracker-settings into seperate dialogs
- better navbar (finally)
- show savestate version on state windows
- add state version to state windows
- move date and version to right in state windows
- make state windows select current state on show if possible

### IMPROVED LOGIC
- logic is now way faster than before
    - use jit optimizations to achieve minimum execution time
- additionally limit the logic executions somewhat (prevent ace)
- make everything usable in logic

### REWORKED DATA STRUCTURE
- almost everything inside the data structure has changed
- allows for some ui improvements like mixed lists

### MAP/LOCATIONLIST CHANGES
- moved map options to the left
- temporary added map mode button
- increase default map zoom
- gossipstones are now hidden by default
    - gossipstones can be enabled by randomizer option

### UI CHANGES
- added area icons
- added more location icons

### SYSTEM STABILITY
- reworked global event system and removed crappy mechanics
- use self contained event subsystems to reduce memory leaks and unwanted behaviour

### BUGFIXES
- fixed typo for malon's egg translations

### EDITOR CHANGES
- moved the editors to their own repository
- added standalone editor (for developement only)
- logic editor now supports filter by search value

---

## VERSION 1.6.11

### BUGFIXES

- fix logic for ganon boss door
- reconfigure triforce pieces to be "infinite" items
- fix navbar in logic editor
- fix logic editor save/clear/patch operations

---

## VERSION 1.6.10

### BUGFIXES

- fixed missing explosives and key at beamos intersection in shadow temple

---

## VERSION 1.6.9

### BUGFIXES

- fix stun server configuration

---

## VERSION 1.6.8

### NETWORK

- added turn server configuration

### NAVBAR

- make submenu toggle on click

---

## VERSION 1.6.7

### BUGFIXES

- fixed wrong lens check for like like skulltula in well

---

## VERSION 1.6.6

### BUGFIXES

- fixed gerudo archery skull missing gerudo_access
- fixed dmc salesmen missing dmc access

---

## VERSION 1.6.5

### BUGFIXES

- fix logic editor not importing SettingsStorage

---

## VERSION 1.6.4

### BUGFIXES
- fixed wording for open gerudo setting

---

## VERSION 1.6.3

### BUGFIXES
- fix how states get overwritten by RATController

---

## VERSION 1.6.2

### BUGFIXES
- fixed state recieve from RATController to adapt new state structure

---

## VERSION 1.6.1

### BUGFIXES
- added getAll function back to StateStorage
- changed RATController to adapt new state structure

---

## VERSION 1.6.0

### QOL - SAVESTATES
- moved all savestate related nav options to "file" submenu
- added windows for saving/loading/management
- replaced export to string with export to file
- added import from file
    - import from string still possible
- moved savestates to indexedDB
- changed structure of savestates for future improvements
- added state converter class for iterative savestate conversion
- change all interface elements to adapt to new state structure

### LANGUAGE
- language file is now in java properties file format instead of ini format
- rename trial setting and options

### BUGFIXES
- fixed adult Shooting Gallery to show correct time of day in badge

### UI IMPROVEMENTS
- improvements to selection lists for better visualization of selected elements
- switched the old version of the map with an hd version

---

## VERSION 1.5.10

### HOTFIX
- fixed biggoron logic for pre gerudo pass and pre king zora

---

## VERSION 1.5.9

### HOTFIX
- added missing "or ignore keylogic" blocks around keys in Spirit Temple Bomb For Light Room Skulltula

---

## VERSION 1.5.8

### HOTFIX
- reduced multiple events for era filter to single event
- fixed multiplayer RemoteAccessTool to ignore filter event

---

## VERSION 1.5.7

### HOTFIX
- changed gerudo training access to new gerudo behaviour
- changed DCMQ Dodongo requiring bombs for access
- made setting for open kakariko gate invisible

---

## VERSION 1.5.6

### HOTFIX
- redid most of the vanilla spirit logic
- fixed old bean check on desert hill skulltula
- changed gerudo archery and skull, wasteland and desert access to new gerudo behaviour(membership card instead of carpenter rescue)

---

## VERSION 1.5.5

### HOTFIX
- fix styling issues for webkit
- fix ice cavern skulltulas at Compass and Ice Block regions missing a bottle

---

## VERSION 1.5.4

### HOTFIX
- fix splashscreen reload for chrome

---

## VERSION 1.5.3

### FEATURE
- added refresh button to splashscreen
- added done counter to check states

---

## VERSION 1.5.2

### HOTFIX
- fixed layout issue with webkit browsers
    - this fix is temporary and should be reworked with the next layout updates
- fixed dragging map will not do anything

---

## VERSION 1.5.1

### HOTFIX
- fixed keysanity artefact for adult fishing

---

## VERSION 1.5.0

### GENERAL FIXES
- visuals
- logic
- state loading
- event handling
- adding past updates restored from older changelogs to have one compiled changelog

### LAYOUT
- reworked layout loading process
- layouts now folow a configurable structure
- added detachable panels
    - currently only one layout is available
    - hidden behind hotkey [ctrl + alt + i]
- add busy animation to settings apply
- make map area marker counter bold

### EVENTS
- eventsystem now using plugin model
    - networking attached through plugin
    - shared worker for detached panel attached through plugin

### LOGIC CHANGES
- keylogic (without keysanity) added
- split small keys and boss keys to seperate settings
- added beansanity option
- generate images from logic
- add more logic operators

### UI
- redesigned popover
- redesign dungeon state panel
- all panels now have a minimum size
- fix location list styling
- fix custom context menus

---

## VERSION  1.4.23

### HOTFIX
- fixed adult fishing

---

## VERSION  1.4.22

### HOTFIX
- added can_stun_deku to deku salesmen
- fixed deku basement chest which was missing can_child_attack or nuts

---

## VERSION  1.4.21

### HOTFIX
- added beansanity toggle
- removed beanseller when beansanity is off

---

## VERSION  1.4.20

### HOTFIX
- fixed mountain bombable chest not checking for can_enter_mountain when strength skip is active
- fixed crater bean patch checking for can_child_attack and removed can_enter_mountain
- fixed several issues in GCMQ where items were in wrong blocks, missing tricks and a wrong keycount on lullaby chest

---

## VERSION  1.4.19

### FEATURE
- translated everything in the language file into german
- mostly used official sources to translate items/enemies etc

---

## VERSION  1.4.18

### HOTFIX
- added beans to the shop

---

## VERSION  1.4.17

### HOTFIX
- huge refactor of Spirit MQ, everything that was broken should be fixed now
- fixed WT Serpent River Skulltula, was missing an "or keysanity" block around lullaby

---

## VERSION  1.4.16

### HOTFIX
- fix notes not allowing context menu
- fix notes in FF not allowing up/down button
- fix notes not allowing text selection

---

## VERSION  1.4.15

### HOTFIX
- fix locationlist not triggering filter update for logic

---

## VERSION  1.4.14

### HOTFIX
- fixed logic for chest near boss
- fixed logic for east tower top GS
- added hammer rusted switches skip

---

## VERSION  1.4.13

### HOTFIX
- add triforce piece item
- add bridge condition for triforce hunt
- add triforce item to itemgrid

---

## VERSION  1.4.12

### HOTFIX
- fixed logic for top of gerudo fortress skulltula

---

## VERSION  1.4.11

### HOTFIX
- added sheik check back to ice cavern mq
    - sheik in vanilla ice cavern was added back some time ago

---

## VERSION  1.4.10

### HOTFIX
- fix gossipstones on map not updated on item update

---

## VERSION  1.4.9

### HOTFIX
- fixed ice trap counter value display bugged
- added domain changing dialog at startup for old domain

---

## VERSION  1.4.8

### HOTFIX
- moved morpha_with_gold_scale skip to morpha instead of water_temple_access

---

## VERSION  1.4.7

### HOTFIX
- fix infinite item cant count higher than 9999 (it would break the layout to count higher)
- added links pocket to dungeon state

---

## VERSION  1.4.6

### HOTFIX
- fix infinite items should not count less than 0

---

## VERSION  1.4.5

### HOTFIX
- shift clicking on items without alternate counting now jump to max/min value

### FEATURE
- added ice traps (FOOL) as countable item
    - this is just for fun
    - counts infinite
    - shift + right-click to reset
- changed the fool image

---

## VERSION  1.4.4

### HOTFIX
- changed bean logic to require beans to be clicked instead of the bean merchant being accessible to support randomizing the bean merchant
- fixed logic for the HF skull near Gerudo Valley which was assuming can_blast_or_smash when adult and now requires a Hammer. child logic there is unchanged

---

## VERSION  1.4.3

### HOTFIX
- fixed wrong lens requirement for GTG Hidden Ceiling Chest

---

## VERSION  1.4.2

### HOTFIX
- added fire temple basement key door back in for keysanity

---

## VERSION  1.4.1

### HOTFIX
- removed one key from water temple logic

---

## VERSION  1.4.0

### MULTIPLAYER
- added net-play for filling out the tracker in multiplayer session
- net messages tranfered over p2p
- multiplayer room does show connected instances
    - host is always on top and marked differently
    - possibility to kick peers from the room

### REWORK EVENTS
- events got generalised

### ITEM MARKER FOR READABILITY
- hookshot marker [H/L]
- gloves marker [S/G]
- scale marker [S/G]
- 2nd magic marker [+]

### PREFORMANCE
- location elements will now be cached, increasing overall performance

---

## VERSION  1.3.8

### HOTFIX
- fixed accicentally swapped Logic between ICMQ Under Ice Block and Heart Piece Room skulls

---

## VERSION  1.3.7

### HOTFIX
- fixed GCMQ Ganon Fight missing entrance and trial checks
- fixed IC Scarecrow Skulltula missing hookshot check
- fixed a typo in normal language file
- made a description more clear in descriptive language file: "Freestanding Key" -> "Freestanding Item"

---

## VERSION  1.3.6

### HOTFIX
- fixed crater wall HP missing adult checks for Link the goron crater entry
- fixed some child skulltulas not requireing child_can_attack in lon lon ranch and kakariko

---

## VERSION  1.3.5

### HOTFIX
- fixed missing adult check for LW Bomb Grotto

---

## VERSION  1.3.4

### HOTFIX
- fixed missing trial checks for ganon fight

---

## VERSION  1.3.3

### HOTFIX
- make logic editor save again

---

## VERSION  1.3.2

### HOTFIX
- right click for selections removed choice in firefox

---

## VERSION  1.3.1

### LOGIC REWORK
- logic is now based on events, instead of refreshing everything
    - logic calculation speed is now dependant to the scale of the action
    - logic is now interpreted beforehand
- logic editor is now on the same page as the tracker (seamless transition)
- logic editor is now a little more refined
- new context menu on location list
    - check/uncheck option in context menu
    - show logic in context menu (logic activation status of the current check)
- quick uncheck locations now ctrl+rightclick

### UI
- better "colors" for listselection
- add option to lock the map in place

### SESSION PERSIST
- the current session will now be copied into session storage
- simply reloading will not remove any changes (even without saving)
- loading another save will overwrite existing session (obviously)

### SAFARI
- added compatibility for safari
    - safari may be missing serviceworker
- fixed bugs ignored by firefox and chrome

### KNOWN BUGS ON IOS
- safari, chrome and firefox are currently not taking longclicks on iOS
    - can check things, but dont uncheck
    - context menu will not be shown

### FIX BUILD ERROR
- version 1.3.0 had a build error, preventing the go-live

---

## VERSION  1.3.0

### FAILED BUILD

---

## VERSION  1.2.4

### Hotfixes
- made gossipstones save value again

---

## VERSION  1.2.3

### Hotfixes
- added missing bottle to ice cavern checks if zora fountain is open
- changed default value of open zora fountain to false

---

## VERSION  1.2.2

### Hotfixes
- fixed missing can_become_adult check for bow usage in DC

---

## VERSION  1.2.1

### Hotfixes
- fixed mountain bomb alcove skulltula
- fixed various checks in DC MQ which were missing a check for the first mud wall
- fixed Dodongo's Cavern Gohma Larva Room; it was checking for more than needed

---

## VERSION  1.2.0

### NEW LOCATIONS (HOWDY FELLA)
- added cow checks
- added cow translations
- added cow logic

---

## VERSION  1.1.11

### HOTFIX
- fixed missing check for warp song on some child chests in spirit temple

---

## VERSION  1.1.10

### HOTFIX
- fixed various logic issues in FoTMQ including #85 and some oversights when new skips where added

---

## VERSION  1.1.9

### FAILED BUILD

---

## VERSION  1.1.8

### HOTFIX
- fixed missing check for keysanity setting in Ganons Castle
- added need for stick/kokiri sword to beat bosses in child dungeons

---

## VERSION  1.1.7

### HOTFIX
- fixed wring reference to language files
- FoTMQ NE outdoors lower can be reached with 1 key from NE outdoors with longshot
- Different paths to NE outdoors added
- bigger font for footer on desktop
- MQ items now updates on dungeon state change
- remove unused function in dungeon state
- item max value applied again

---

## VERSION  1.1.6

### FAILED BUILD

---

## VERSION  1.1.5

### FAILED BUILD

---

## VERSION  1.1.4

### FAILED BUILD

---

## VERSION  1.1.3

### FAILED BUILD

---

## VERSION  1.1.2

### FAILED BUILD

---

## VERSION  1.1.1

### HOTFIX
- fixed some logic issues
- gossipstone logic now applied on initialization
- changed translation of multiple checks
    - switch out names that contain item-names or sizes
    - fixed some wrong translations on the way
- add back old language file
- add language selection
- fixed reference to future update changelog
- addeed ctrl key to jump too next marker in items supporting it (currently skulltula only)
    - firefox bypasses event catching of right click menu on shift press, it is recommended to use ctrl on firefox

---

## VERSION  1.1.0

### GENERAL
- dont check for updates periodical, only on startup or button press
- dont reload custom logic if nothing changed

### TRANSLATION
- changed map/compass/item chest names to discriptive ones (vanilla)

### LOGIC EDITOR
- add filters to editor
- add true/false operator
- hide elements if a flag [logic_editor_visible] is set for them

### LOGIC
- added can_child_attack to various child skulltulas
- added can_become_adult to various adult skulltulas and situations where adult items are needed
- added GF kitchen skip (gerudo guard 4 & gerudo fortress clear)
- added DM bombable chest with strength skip
- added BOTW basement chest with strength and sticks skip
- added GTGMQ silver rupees with hookshot skip
- fixed DC east corridor salesman; it can be reached with strength
- added DC staircase skip
- added FoT east vines with hookshot skip
- added FoTMQ skip block puzzle with bombchu skip
- added swim through FoTMQ well with hookshot skip
- fixed FoTMQ near boss chest and phantom ganon; requires bow, din's is useless here
- added FiT hammer rusted switches (FiT highest goron & FiTMQ maze upper)
- added WaT boss key chest with no additional items skip
- added SpT child side with bombchus skip
- fixed missing logic for SpT child left and child right; attack/defense options for left, stick or din's to light torch in right
- added SpTMQ frozen eye switch without fire skip
- added kokiri twins skulltula with hover skip
- added DT basement skulltula with jumpslash skip
- added filters to logic

---

## VERSION  1.0.0

### GENERAL
- switching to es6-modules, classes & custom-elements with shadow-dom (drop support for edge & safari)
- the server now builds using gulp with sass transpiler, that way im taking full advantage of es6 modules
- added logging to trace bugs more effectively
- better handling of savestate loading through global events
- skulltula counter now counting in 10's again, as the rom now tells the count on collect
- gossipstones are now added to map and locationlist
- generic gossip stones are listed seperately, but checked together
- trade sequence starting point added to settings
- added switch for mq/vanilla to location list title
- added target player to shop slots
- added ganon castle options 3 spiritual stones and 100 skulltulas

### DATA
- changed language file to .ini but with the .lang extension (better readability & supporting comments)
- also relocated language file to the i18n folder
- merged dungeons.json, chests.json and skulltulas.json into one data file locations.json

### UI
- added custom elements for items
- added custom elements for dungeon state
    - dungeon state can now show and hide all categories
    - dungeon state will not show empty dungeons, so it grows and shrinks respectively
    - dungeon state can now change its orientation by itself
- added custom elements for locations (list)
- change menu to hamburger-format on smaller screens
- change map-overlays to become feature-panels instead
    - add tab-buttons to choose active feature-panel
- added custom element for map
    - map is now zoomable through mouse wheel
    - map can now be dragged around
    - a map overview was implemented to ease the use on smaller screens
- added custom elements for poi's
    - poi's now have different looks
    - improved tooltips for map
- added improved settings system
- added custom elements for song view and editor
- added custom elements for shop view and editor
- added custom elements for gossipstones
- switch for child/adult/both era added
- added setting to decide, if an unknown dungeon type means both types are required, or just one of them
- remaining chests / skulltulas now count min and max values if a dungeon is not defined

### UTILS
- added event bus for communication between modules
- added module for global data storage (all tracker data goes here)
- added module for savestates (well, save away)
- added language handler
- rewrite logic system to compensate for unknown states of dungeons (v/mq)
- new serviceworker added

***

__START OF CHANGELOG__
