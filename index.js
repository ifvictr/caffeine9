const puppeteer = require("puppeteer");

exports.status = {
    SUCCESS: 0,
    CREDENTIALS_NOT_FOUND: 1,
    CREDENTIALS_INVALID: 2,
    WORKSPACE_NOT_FOUND: 3,
    WORKSPACE_INACCESSIBLE: 4
};

exports.wake = async (user, workspace) => {
    const email = process.env.C9_EMAIL;
    const password = process.env.C9_PASSWORD;
    if(!email || !password) {
        return this.status.CREDENTIALS_NOT_FOUND;
    }

    user = user.toLowerCase();
    workspace = workspace.toLowerCase();
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Will redirect to the login page
    await page.goto(`https://ide.c9.io/${user}/${workspace}`);
    await page.waitForSelector("#signinForm");
    await page.type("#inpUsernameEmail", email);
    await page.type("#inpPassword", password);
    await page.click("#btnSignIn");

    try {
        await page.waitForNavigation({waitUntil: "networkidle0", timeout: 5000});
    }
    catch(e) {
        // Login failed and no navigation took place, will be handled in `hasInvalidCredentials`
    }

    // Check credentials before proceeding
    const hasInvalidCredentials = await page.$(".errorSignin");
    if(hasInvalidCredentials) {
        return this.status.CREDENTIALS_INVALID;
    }

    // Make sure the workspace exists
    const isNonexistentWorkspace = await page.$(".error404");
    if(isNonexistentWorkspace) {
        return this.status.WORKSPACE_NOT_FOUND;
    }

    try {
        // Matches "Unable" in the "Unable to access your workspace" modal heading
        await page.$eval(".bk-window h3", node => node.innerText.match("Unable"));
        return this.status.WORKSPACE_INACCESSIBLE;
    }
    catch(e) {
        // Workspace is accessible
    }

    // If the workspace is in hiberation, wait until the restore overlay is gone.
    try {
        await page.waitForSelector("#c9_ide_restore", {hidden: true, timeout: 60000});
    }
    catch(e) {
        // The restore overlay is still visible, so it's most likely a large project. We'll assume it's ready at this point.
    }

    await browser.close();
    return this.status.SUCCESS;
};