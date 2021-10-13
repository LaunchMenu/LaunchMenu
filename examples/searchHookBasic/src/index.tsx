import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    Priority,
} from "@launchmenu/core";
import {Field} from "model-react";

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

const text = new Field("orange");
const item = createStandardMenuItem({name: h => text.get(h)});

export default declare({
    info,
    settings,
    async search(query, hook) {
        // Check if the search exactly matches the text, and indicate a dependency on text using `hook`
        if (query.search == text.get(hook)) {
            // If the  text matched, toggle it to some other text after 2 seconds (such that it no longer matches)
            setTimeout(() => {
                if (text.get() == "orange") text.set("potato");
                else text.set("orange");
            }, 2000);

            // Return some item result
            return {
                item: {
                    priority: Priority.EXTRAHIGH,
                    item,
                },
            };
        }

        // Otherwise return no result
        return {};
    },
});
