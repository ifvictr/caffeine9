const puppeteer = require("puppeteer");

module.exports.status = {
    SUCCESS: 0,
    CREDENTIALS_NOT_FOUND: 1,
    CREDENTIALS_INVALID: 2,
    WORKSPACE_NOT_FOUND: 3
};

module.exports.wake = async (user, workspace) => {
    const email = process.env.C9_EMAIL;
    const password = process.env.C9_PASSWORD;
    if(!email || !password) {
        return this.status.CREDENTIALS_NOT_FOUND;
    }

    user = user.toLowerCase();
    workspace = workspace.toLowerCase();
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Attempting to access the IDE will redirect to a login page
    await page.goto(`https://ide.c9.io/${user}/${workspace}`);
    await page.waitForSelector("#signinForm");
    await page.type("#inpUsernameEmail", email);
    await page.type("#inpPassword", password);
    await page.click("#btnSignIn");

    try {
        await page.waitForNavigation({waitUntil: "networkidle0"});
    }
    catch(e) {
        // Login failed and no navigation took place, handle in next section
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

    // If workspace is in hiberation, wait until the restore screen is gone
    try {
        await page.waitForSelector("#c9_ide_restore", {hidden: true, timeout: 60000});
    }
    catch(e) {
        // Should be ready after 60 seconds. If it still isn't, then it's probably a large project, which takes awhile.
    }

    await browser.close();
    return this.status.SUCCESS;
};