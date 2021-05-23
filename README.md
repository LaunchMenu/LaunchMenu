![Logo](https://github.com/LaunchMenu/LaunchMenu/raw/master/docs/images/LaunchMenu-Logo.png)

### Goal

LaunchMenu is an free, open source, cross-platform utility application which brings utilities (applets) to your fingertips. It intends to increase your productivity through it's keyboard-centric design, meanwhile also being extremely customisable with advanced theming and applet settings. The application is styled similar to that of Spotlight for Mac, however it allows for 3rd party applets to be built and installed, further increasing your productivity in any aspect of life.

LaunchMenu runs in the background, and launches when the user presses the "open LaunchMenu" hotkey (`⌘ + space`/`⊞ + space` by default).

![img](https://launchmenu.github.io/applets/dictionary/search.png)

https://user-images.githubusercontent.com/7938900/119280109-c0d71680-bc27-11eb-93f9-b969751b639a.mp4

introduction.webm)

Contact us if you want to contribute to the project.

For an extensive list of features please see the [LaunchMenu website](https://launchmenu.github.io/). For an extensive list of built-in applets see the [applets section of the website](https://launchmenu.github.io/#utility-applets).

### 3rd party Applets / LaunchMenu API

LaunchMenu offers a free and flexible API, which allows 3rd party developers to extend the application's functionality to any experience they desire. The API primarily targets extensibility via [TypeScript](https://www.typescriptlang.org/) and [React](https://reactjs.org/).

```ts
export const info = {
    name: "HelloWorld",
    description: "A minimal example applet",
    version: "0.0.0",
    icon: <img width={30} src={Path.join(__dirname, "..", "images", "icon.png")} />,
};

export const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {
                username: createStringSetting({name: "Username", init: "Bob"}),
            },
        }),
});

const items = [
    createStandardMenuItem({
        name: "Hello world",
        onExecute: ({context}) =>
            alert(`Hello ${context.settings.get(settings).username.get()}!`),
    }),
];

export default declare({
    info,
    settings,
    search: async (query, hook) => ({children: searchAction.get(items)}),
});
```

For more information about development of applets in LaunchMenu please see the [LaunchMenu development website](https://launchmenu.github.io/developers).

### Contribution

As mentioned several times already, LaunchMenu is fully open-source! We welcome any contributions to the project, especially third party applets. In case you want to contribute to our official repository, we do recommend discussing your ideas with us first. This prevents you from investing a lot of time into something that doesn't line up with our long term vision. That said, we're open to most ideas, and welcome all discussions! So don't hesitate to join the community, both as developer or as user, at one of the following links:

### Community links

-   [Github](https://github.com/LaunchMenu/LaunchMenu/discussions)
-   [Element](https://app.element.io/#/group/+launchmenu:matrix.org)
