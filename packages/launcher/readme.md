# Launcher

The launcher is responsible for both installing and launching LaunchMenu when running in production.
During development, the `core` package can simply be ran in order to start LM.

Installation is done using simple node package installation using the JavaScript npm api. Later this package can also contain code for auto updating of core LaunchMenu packages.

## Development

### Building

Both `yarn build` and `yarn watch` can be used to build the launcher, possibly while watching for file changes.

### Testing

`yarn test`
can be used to run the launcher in test mode. When running in test mode, the installation parts of the launcher won't actually be run. The UI and flow can still be tested this way however

### Distributing

After having called `yarn build` one can create a distribution for the platform they are currently on by running `yarn dist`. This will generate the installer and place it in the `dist` folder.

### Issues and Fixes

#### hdiutil exited with code `ERR_ELECTRON_BUILDER_CANNOT_EXECUTE`

Seems like this occurs when Electron-builder tries to overwrite a DMG file which has been opened by another file browser. If you use Finder, make sure the DMG volume is ejected and try again. If this fails, relaunch Finder application (Alt+RightClick on the logo in the dock and select relaunch). If this fails, restart your mac and try again.

Hopefully this will fix the error.

> Note: this can also occur when you try to build 2 separate DMGs to the same path.
