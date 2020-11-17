# jira-release-notes
generate release notes from git commits and jira

## Example
git commit -m 'ABC-123 went to end of universe'

node index.js --compare=<branch> --base=main

outputs following row for each unique jira issue number in commitb
------------------------------------------------------------------
[ABC-123](https://yourcompany.atlassian.net/browse/ABC-123)

## Usage

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


## ToDo
* make this a library, currently requires copying index.js and dependencies into a node project