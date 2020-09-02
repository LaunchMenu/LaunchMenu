```tsx
// Create settings that aren't associated with any file yet, defaults to the given values in case the settings are never registered
export const someAppSettings = createSettings({
    version: 1,
    settings: () =>
        createSettingsCategory({
            name: "Shit",
            children: {
                someNumberSetting: createNumberSetting({name: "potatoes", init: 3}),
                someStringSetting: createStringSetting({name: "oranges", init: "yes"}),
                someColorSetting: createColorSetting({name: "color", init: "orange"}),
                someBooleanSetting: createBooleanSetting({name: "yes", init: true}),
                someSubCategory: createSettingsCategory({
                    name: "keyboard",
                    children: {
                        somePattern: createKeyPatternSetting({
                            name: "pattern",
                            init: new KeyPattern("ctrl+m"),
                        }),
                    },
                }),
            },
        }),
    updater: (currentVersion, data) => data,
});

// IOcontext.settings.add(someAppSettings);
// IOcontext.settings.add(someAppSettings, {someNumberSetting: createNumberSetting({name: "potatoes", init: 5})});
IOContext.settings.get(someAppSettings);

export default declare({
    settings: someAppSettings,
    dependencies: [someOtherAppDefaultExport],
    matchesAppPattern: (query: IQuery)=>true,
    appletInfo: {
        name: "shit",
        description: "poop",
        version: "shit",
        icon: "shit"
    },
    getQueryItems: async (query: IQuery, context: IOContext, push: IMenuItemCallback)=>{},
    open: (context: IOContext, onClose: ()=>void)=>{}
});
//export default declare(Applet)

```
