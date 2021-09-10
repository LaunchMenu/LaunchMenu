# Exports namespace

Export paths through [package exports](https://nodejs.org/api/esm.html#esm_package_entry_points) such that we can import like so:

```ts
import {something} from "@lauchmenu/launchmenu/category";
```

Also export category structures in the main exported value:

```ts
import LM from "@lauchmenu/launchmenu";
const {something} = LM.category;
```

## Categories

@launchmenu/launchmenu/menus/menus/menu

```
LaunchMenu
|- Types
|  |- Menus
|  |  |- IMenuItem
|  |- <MIRROR ROOT (except for Types)>
|
|- Menus
|  |- Menu
|  |- PrioritizedMenu
|  |- SearchMenu
|  |- createStandardMenuItem()
|  |- createStandardCategory()
|  |- Helpers
|  |  |- Highlight
|  |  |- MenuItemFrame
|  |  |- MenuItemIcon
|  |- interaction
|  |  |- createMenuKeyHandler()
|
|- Content
|  |- Notifications
|  |  |- ErrorMessage
|  |  |- ContentErrorMessage
|  |  |- createContentError
|  |- "ScrollManager"
|  |- Layouts
|  |- UIComponents
|  |  |- Button
|  |  |- Image
|  |  |- Potatoes
|
|- Field
|  |- TextField
|  |- SearchField
|  |- InputField
|
|- Settings
|  |- createSettings()
|  |- createSettingsCategory()
|  |- createNumberSettings()
|
|- FileManagement
|  |- JSONFile
|  |- FieldFile
|
|- Actions
|  |- Action
|  |- searchAction
|  |- executeAction
|
|- Commands
|  |- SetFieldCommand
|  |- CompoundCommand
|
|- Theming
|  |- useTheme
|  |- Box
|  |- FillBox
|
|- Core
|  |- LaunchMenu
|  |- LMSession
|  |- SessionManager
|  |- SettingsManager
|  |- AppletManager
|  |- Stacks
|  |  |- ViewStack
|  |- Context
|  |  |- IOContext
|  |- Theming
|  |  |- createTheme
|  |- WindowManager
|  |  |- windowManager
|
|- Utils
|  |-  quickSort
|  |-  SortedList
|
|- Declare

```

## Generation of export files

We will add a dedicated `build/exports` folder, containing the structure as indicated above,
where every file purely reexports the relevant files from the main build directory structure.

```
build
|- exports
|  |- Types
|  |  |- Menus
|  |  |  |- index.d.ts
|  |  ...
|  |
|  |- Menus
|  |  |- index.d.ts
|  |  |- index.js
|  ...
| <mirror of src contents>
|  ...
...
```

To automate the creation of these extensive reexport files we add some build-tools script that can perform this post-processing.
This script will analyze the source code and look for files called 'export.to' which indicate the file that this directory (and all it's descendants) should map to as a whole.

```
src
|- application
|- menus
|  |- export.to    (containing ./Menus)
|  |- actions
|  |- categories
|  |- contextMenu
|  |- items
|  |- menu
```

Specific Typescript file exports may also specify a export location themselves that takes precedence.

```js
/** @exportTo ./Menus */
export const shit = 5;
```

TODO: rename internal styling directory to theming for more consistency
