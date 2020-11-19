# jira-release-notes
generate release notes from git commits and jira api

## Example
**Commit**
```bash
git commit -m 'ABC-123 went to end of universe'
```
**Use**
```
# optionally use .env file
JIRA_URL=https://yourcompany.atlassian.net
JIRA_USERNAME=yourusername
JIRA_KEY=key_generated_using_atlassian_site

# run script
node index.js --compare=somebranch --base=main

# output
*Project ABC Name from Jira*
[ABC-123](https://yourcompany.atlassian.net/browse/ABC-123) jira description for ABC-123 
[ABC-115](https://yourcompany.atlassian.net/browse/ABC-115) jira description for ABC-115
```

## Usage
```bash
node index.js

Usage: release-notes --compare origin/release/2020-01-012

generate release notes from git and jira

Options:
  -V, --version                  output the version number
  -b, --base <baseBranch>        base branch to diff logs (default: "origin/master")
  -c, --compare <compareBranch>  compare branch to diff logs
  -f, --format <format>          output format of release notes (default: "markdown")
  -h, --help                     display help for command

Commands:
  request <issueKey>             make http request for issue key
  projects                       make http request for projects
```

## ToDo
* make this a library, currently requires copying index.js and dependencies into a node project
