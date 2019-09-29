# Context

* This lambda is behind the idea of https://staticman.net/ for publising comments into static sites.
* Is compatible with github.com and gitlab.com APIs.
* It expects an "user" in the event.requestContext.authorizer.user (in my PoCs request are authorized with JWT/AWS API GW Custom Authorizer)

## Environment variables

* PROJECTID: required
* OWNER: required, for github repos only
* TOKEN: required
* TYPE: "gitlab" or "github", default to gitlab
* AUTHOR: for commit info, optional
* COMMIT_MESSAGE: optional

## Filepath

The new file will be named like this:

https://[repo api endpoint]/data/comments/[body.item]/[user from authorizer]-[timestamp].json

You have to send in the POST message a field named "item" with the item that is being commented (url encoded).
