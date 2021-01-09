# Code of Contribution
##### for Track-OOT

---

## master - hotfix

### used for

- fixes for configurations in `/database/*.json`
- fixes for translations in `/i18n/*.lang`
- fixes for unwanted behaviour
- minor improvements

### creating a hotfix - forked

1. fork the repo
2. if possible, check your changes locally before committing
3. change the changelog file
    - increase sub-version-number (e.g. `1.2.9` -> `1.2.10`)
    - add a caption named hotfix `### HOTFIX`
    - describe your changes in bullet points
4. commit your changes
    - describe what you did
    - for commitmessage mark linebreaks with a semicolon `;`
5. create pull request, target `master`

### creating a hotfix - branched

1. always pull first `!`
2. create a branch using the pattern `hotfix/[short description]`
    - all changes will be commited to the new branch
3. if possible, check your changes locally before committing
4. change the changelog file
    - increase sub-version-number (e.g. `1.2.9` -> `1.2.10`)
    - add a caption named hotfix `### HOTFIX`
    - describe your changes in bullet points
5. commit your changes
    - describe what you did
    - for commitmessage mark linebreaks with a semicolon `;`
6. create pull request, target `master`
    - mark your hotfix branch as remove after merge
        - each hotfix gets its own branch

### merging

1. review the changes affected by merging
    - if anything seems weird, ask someone to review
        - reject if you can not resolve it
    - if a mergeconflict occures...
        - ask the repo master to merge, or
        - merge using the guide bitbucket provides
2. merge the changes
3. pull the master branch to your local repository
4. create a tag using `git tag -a $version -m "hotfix $version"`
5. push the tag using `git push --tags origin`
6. check for the update to be build and released (can take a few minutes)
7. if everything works, post the changelog in the discord channel `news`

---

## dev - features

### used for

- large changes in tracker behavior
- major improvements

### creating a patch - forked

1. fork the repo
2. if possible, check your changes locally before committing
3. change the changelog file
    - if not existing, add `dev` version
    - add a captions starting with `###`
    - describe your changes in bullet points
4. commit your changes
    - describe what you did
    - for commitmessage mark linebreaks with a semicolon `;`
5. create pull request, target `dev`
    - if you are using a branch mark your feature branch as remove after merge
        - each major feature gets its own branch

### creating a patch - branched

1. always pull first `!`
2. create a branch using the pattern `feature/[short description]`
    - all changes will be commited to the new branch
3. if possible, check your changes locally before committing
4. change the changelog file
    - if not existing, add `dev` version
    - add a captions starting with `###`
    - describe your changes in bullet points
5. commit your changes
    - describe what you did
    - for commitmessage mark linebreaks with a semicolon `;`
6. create pull request, target `dev`
    - if you are using a branch mark your feature branch as remove after merge
        - each major feature gets its own branch

---

## pr merge conflicts - manual merging

1. `git remote add $name $pr_repo_url`
2. `git fetch $name`
3. `git checkout $target_branch`
4. `git merge $name/$pr_branch`
5. resolve conflicts in files
6. commit changes
7. `git push`
8. `git remote remove $name` (optional)

---

## mirror all to github

1. always pull first!
2. clean branch-chache with `git remote update --prune`
3. mirror the repository to github `git push --mirror git@github.com:ZidArgs/Track-OOT.git`