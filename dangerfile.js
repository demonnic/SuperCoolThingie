// TODO: https://github.com/Mudlet/Mudlet/issues/5486
const {danger, fail, message, warn} = require('danger');
const util = require('util');
const ISSUE_REGEX = /https?:\/\/(?:www\.)?github\.com\/Mudlet\/Mudlet\/issues\/(\d+)/i
const ISSUE_URL = "https://github.com/Mudlet/Mudlet/issues/"
const SOURCE_REGEX = /.*\.(cpp|c|h|lua|js)$/i
const TITLE_REGEX = /^(fix|improve|add|infra)/i
const touched_files = [...danger.git.created_files, ...danger.git.modified_files]
const sourcefiles = touched_files.filter(item => item.match(SOURCE_REGEX))
const pr_title = danger.github.pr.title

// Checks the title to make sure it matches expectations
if (pr_title.match(TITLE_REGEX)) {
  title_type = pr_title.match(TITLE_REGEX)
  const type_to_readable = {
    add: "Addition",
    fix: "Fix",
    improve: "Improvement"
  }
  message(`PR type: \`${type_to_readable[title_type[0].toLowerCase()]}\``)
} else if(pr_title.match(/^\[?WIP\]?/i)) {
  fail("PR is still a WIP, do not merge")
} else {
  fail("PR title must start with `fix, `improve`, `add` or `infra` for release notes purposes.")
}

var added_todos = {}
var bad_todos = []

sourcefiles.forEach(function(item, index, array) {
  let additions = danger.git.diffForFile(item)
  additions.then(diff => {
    diff.added.split("\n").forEach(function(item, index, array) {
      if (item.includes("TODO")) {
        message("There is a TODO")
        let has_issue = item.match(ISSUE_REGEX)
        if (has_issue) {
          added_todos[filename] = (added_todos[filename] === undefined) ? [] : added_todos[filename]
          added_todos[filename].push(item)
        }
      }
    })
  })
})
message(util.inspect(added_todos))