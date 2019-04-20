## CHANGELOG

---

Application:    Track-OOT

Version:        1.3.1

---

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