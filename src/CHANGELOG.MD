## CHANGELOG

---

Application:    Track-OOT

Version:        1.5.0

---

### GENERAL FIXES
- visuals
- logic
- state loading
- event handling

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
- add more operato

### UI
- redesigned popover
- redesign dungeon state panel
- all panels now have a minimum size
- fix location list styling
- fix custom context menus
