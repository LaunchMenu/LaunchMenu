import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    IMenuItem,
    ProxiedMenu,
    searchAction,
    UILayer,
} from "@launchmenu/core";
import FS from "fs";
import {Field} from "model-react";
import Path from "path";

const info = {
    name: "Example",
    description: "A minimal example applet",
    version: "0.0.0",
    icon: "applets" as const,
};

const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {},
        }),
});

export default declare({
    info,
    settings,
    init: ({LM}) => {
        const path = Path.join(__dirname, "..", "myJsonDataFile.json");

        // Create some way of mapping the file to menu items
        const items = new Field<IMenuItem[]>([]);
        const updateItems = () =>
            FS.readFile(path, "utf8", (err, data) => {
                if (err) return console.error(err);

                try {
                    const ar = JSON.parse(data) as string[];
                    items.set(
                        ar.map(text =>
                            createStandardMenuItem({
                                name: text,
                                onExecute: () => alert(text),
                            })
                        )
                    );
                } catch (e) {
                    console.error(e);
                }
            });

        // initialize the menu items, and update them on file changes
        const watcher = FS.watch(path, updateItems);
        updateItems();

        return {
            async search(query, hook) {
                return {
                    children: searchAction.get(items.get(hook)),
                };
            },
            open({context, onClose}) {
                context.open(
                    new UILayer(
                        () => ({
                            menu: new ProxiedMenu(context, hook => items.get(hook)),
                            onClose,
                        }),
                        {
                            path: "Example",
                        }
                    )
                );
            },

            // Close the watcher when the applet is stopped
            onDispose: () => watcher.close(),
        };
    },
});
