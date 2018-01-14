# [caffeine9](https://npmjs.com/package/caffeine9)

Keep your Cloud9 workspaces running without hot workspaces.

## Installation

```
# Through npm
npm install -g caffeine9

# Through Yarn
yarn add global caffeine9
```

## Usage

```
Usage: cf9 [options]

Keep your Cloud9 workspaces running without hot workspaces.


Options:

-V, --version            output the version number
-u, --user [value]       The user the workspace is hosted under
-w, --workspace [value]  The target workspace's name
-h, --help               output usage information
```

### Attempts to wake up workspace `john/hello-world`

```
$ cf9 --user john --workspace hello-world
```

You can run this manually to wake up your workspaces, but I would highly recommend using cron to run it in intervals of at least once an hour. Non-hot workspaces are shut down after two hours of inactivity, so you'll need to send a wakeup signal before then. More information on that here: https://docs.c9.io/docs/inactive-workspaces

## Disclaimer

This project is not endorsed by or affiliated with Cloud9 IDE, Inc. or Amazon Web Services, Inc. in any way.

## License

[MIT](LICENSE.txt)