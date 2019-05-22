## Code of Contribution
##### for Track-OOT

---

### master - hotfix

- fixes for configurations in `/database/*.json`
- fixes for translations in `/i18n/*.lang`

#### howto:

1. always pull first!
2. create a branch using the pattern `hotfix/[short description]`
    - all changes will be commited to the new branch
3. if possible, check your changes locally before committing
4. change the changelog file
    - increase version-number (e.g. 1.2.9 -> 1.2.10)
    - remove old changes from changelog
    - add a caption named hotfix `### HOTFIX`
    - describe your changes in bullet points
5. commit your changes
    - describe what you did
    - for commitmessage mark linebreaks with a semicolon (;)
6. create pull request, target master
    - mark your hotfix branch as remove after merge
        - each hotfix gets its own branch
7. review the changes affected by merging
    - if anything seems weird, ask someone to review
        - reject if you can not resolve it
    - if a mergeconflict occures...
        - ask the repo master to merge, or
        - merge using the guide bitbucket provides
8. merge the changes
9. pull the master branch to your local repository
10. create a tag using `git tag -a $version -m "hotfix $version"`
11. push the tag using `git push --tags origin`
12. check for the update to be build and released (can take a few minutes)
13. if everything works, post the changelog in the discord channel `news`

