#!/usr/bin/env node

const program = require("commander");
const ora = require("ora");
const caffeine9 = require("./");

program
    .version("1.0.0")
    .description("Keep your Cloud9 workspaces running without hot workspaces.")
    .option("-u, --user [value]", "The user the workspace is hosted under")
    .option("-w, --workspace [value]", "The target workspace's name")
    .parse(process.argv);

const {user, workspace} = program;
if(!user || !workspace) {
    console.log("Both a user and workspace name need to be specified.");
    process.exit(1);
}

const spinner = ora({
    spinner: "dots12",
    text: "Connecting to workspace..."
}).start();

(async () => {
    const result = await caffeine9.wake(user, workspace);
    const status = caffeine9.status;

    switch(result) {
        case status.SUCCESS:
            spinner.succeed(`Successfully woke up workspace ${user}/${workspace}!`);
            break;
        case status.CREDENTIALS_NOT_FOUND:
            spinner.fail("Couldn't find Cloud9 credentials. Did you set up the `C9_EMAIL` and `C9_PASSWORD` environment variables yet?");
            break;
        case status.CREDENTIALS_INVALID:
            spinner.fail("Supplied credentials were invalid.");
            break;
        case status.WORKSPACE_NOT_FOUND:
            spinner.fail("Couldn't seem to find that workspace.");
            break;
    }
    process.exit(result);
})();