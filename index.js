const dotenv = require('dotenv');
const program = require('commander');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const JiraClient = require("jira-connector");
const progress = require('cli-progress');

dotenv.config();

const jira = new JiraClient({
    host: process.env.JIRA_URL,
    basic_auth: {
        email: process.env.JIRA_USERNAME,
        api_token: process.env.JIRA_KEY
    }
});

program
    .version('1.0.0')
    .description('generate release notes from git and jira')
    .option('-b, --base <baseBranch>', 'base branch to diff logs', 'origin/master')
    .option('-c, --compare <compareBranch>', 'compare branch to diff logs')
    .option('-f, --format <format>', 'output format of release notes', 'markdown')
    .usage('--compare origin/release/2020-01-012')
    .action(() => {
        if (!program.compare) {
            program.help();
        }
        async function doIt() {
            try {
                // parse git logs
                const { stdout } = await exec(`git log ${program.base}..${program.compare} --format="%s"`);
                const matches = stdout.match(/(?<=)[A-Z]+-[0-9]+/ig).map(a => a.toUpperCase()).sort();
                const keys = [...new Set(matches)];

                // request jira details
                const bar = new progress.SingleBar({}, progress.Presets.shades_classic);
                const data = [];
                bar.start(keys.length + 1, 0);
                for (let i = 0; i < keys.length; i++) {
                    const issueKey = keys[i];
                    bar.update(i + 1);
                    try {
                        let issue = await jira.issue.getIssue({ issueKey: issueKey });
                        data.push({
                            'key': issueKey,
                            'link': `https://${process.env.JIRA_URL}/browse/${issueKey}`,
                            'summary': issue.fields.summary,
                            'type': issue.fields.issuetype.name
                        });
                    } catch(err) {
                        data.push({
                           'key': issueKey,
                           'error': 'error retrieving summary'
                        });
                    }
                }
                bar.update(keys.length + 1);
                bar.stop();

                // get jira projects
                let allProjects = await jira.project.getAllProjects();
                let usedProjects = allProjects.filter(p => {
                    return data.filter(issue => issue.key.toUpperCase().startsWith(p.key)).length;
                });

                // format output
                switch (program.format) {
                    case 'json': {
                        console.log(JSON.stringify(data, null, 4));
                        break;
                    }
                    case 'markdown': {
                        formatMarkdown(usedProjects, data);
                        break;
                    }
                    default: {
                        console.log('unsupported format '+program.format);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }
        doIt();
    });

program
    .command('request <issueKey>')
    .description('make http request for issue key')
    .action((issueKey) => {
        jira.issue.getIssue({ issueKey: issueKey }).then((res=> {
            console.log(JSON.stringify(res, null, 4));
        }));
    });

program
    .command('projects')
    .description('make http request for projects')
    .action(async (issueKey) => {
        let projects = await jira.project.getAllProjects();
        console.log(p);
    });

function formatMarkdown(projects, issues) {
    let markdown = '';
    projects.forEach((project) => {
        markdown = markdown.concat(`**${project.name}**`).concat('\n');

        issues.filter(issue => {
            return issue.key.toUpperCase().startsWith(project.key) && !issue.error;
        }).forEach(issue => {
            markdown = markdown
                .concat('[').concat(issue.key).concat(']')
                .concat('(').concat(issue.link).concat(')')
                .concat(' ').concat(issue.summary).concat('\n');
        });

        markdown = markdown.concat('\n');
    });

    markdown = markdown.concat(`**Unknown**`).concat('\n');
    issues.filter(issue => {
        return !!issue.error;
    }).forEach(issue => {
        markdown = markdown.concat(issue.key).concat('\n');
    });

    console.log(markdown);
}

program.parse(process.argv);
