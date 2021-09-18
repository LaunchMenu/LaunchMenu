import React from "react";
import {
    Box,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    getContentAction,
    Menu,
    scrollableContentHandler,
    UILayer,
} from "@launchmenu/core";

const info = {
    name: "Example",
    description: "A minimal example applet",
    version: "0.0.0",
    icon: "applets" as const,
};

const settings = createSettings({
    version: "0.0.0",
    settings: () => createSettingsFolder({...info, children: {}}),
});

const text =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tellus justo, suscipit ut felis a, porttitor tempor metus. Etiam odio urna, vulputate sed massa vitae, tristique semper ipsum. Maecenas tempus justo lectus, in mollis lacus iaculis eget. Vivamus ut varius turpis, a blandit nisi. Donec aliquet mi leo. Mauris convallis orci vel tempus faucibus. Aenean ligula sapien, laoreet et dictum eu, ultrices in dolor. Quisque porttitor lacus a lectus malesuada, vel tempor lorem semper. Morbi mollis finibus quam, sed ultricies ex posuere ultricies. Integer quis massa eget erat convallis tempor. Proin eleifend sodales erat et efficitur. Quisque eget nibh ut magna condimentum posuere. In egestas, nisi id cursus viverra, ante justo pulvinar turpis, sed rhoncus mauris dui eget turpis. Nam turpis enim, convallis suscipit lectus nec, venenatis gravida neque. Mauris in elementum nisl. Pellentesque in augue non nisl varius rutrum eu quis diam.    Maecenas eu gravida justo. Aliquam erat volutpat. Proin vitae ante malesuada, sollicitudin ex a, facilisis leo. Quisque ac risus scelerisque, finibus neque pulvinar, luctus sem. Duis suscipit auctor metus, sed dictum sem condimentum vel. Aliquam quis commodo dui. Ut sit amet nisl eleifend, lobortis risus sit amet, tempus leo.    In mollis felis massa, sed vestibulum quam vestibulum nec. Quisque vitae dui ut felis lobortis venenatis. Nulla dapibus sem vitae nulla tempus rhoncus. Integer bibendum tortor vulputate justo placerat, a congue eros tempor. Integer volutpat, augue congue euismod aliquet, lectus ante vestibulum mi, a feugiat tellus dolor ac erat. Mauris fermentum nisl vel urna tincidunt eleifend. Quisque tellus ligula, tempor quis lacus quis, rutrum aliquam mi. Mauris varius massa non diam auctor, a semper justo venenatis. Cras sit amet enim felis. Nullam finibus, dui id auctor dignissim, elit metus vehicula lorem, vel vehicula libero nisi quis nisi.    Vivamus a suscipit nunc. Sed mollis nunc sed orci fringilla condimentum. Nunc accumsan tristique sem vitae maximus. Quisque vulputate nisi metus, sed faucibus neque fringilla eu. Praesent quis elit ac sapien imperdiet malesuada. Aliquam nunc dolor, sagittis vitae purus vel, cursus vehicula risus. Vestibulum convallis nec quam ut finibus. Fusce bibendum sapien non cursus eleifend. Sed fringilla porta auctor. Etiam dignissim semper nunc non venenatis. Aenean tempor lectus sed tellus porttitor, vitae tincidunt ex scelerisque. Morbi vitae orci massa. Sed et posuere elit. Proin ac pretium nibh, nec facilisis augue. Suspendisse sed enim felis.    Sed ac mi vel est convallis fermentum. Nulla nulla tellus, ullamcorper quis dignissim a, dictum ultricies metus. Pellentesque at nunc consectetur, suscipit lacus et, mollis metus. Sed aliquam quis quam eget fermentum. Nunc a orci et dolor condimentum imperdiet id at est. In vel orci finibus, aliquet turpis non, porttitor sapien. Mauris pharetra eros vel tortor sollicitudin fermentum. Morbi in justo eget risus congue viverra vel eget sem. Sed semper tortor a tellus ultrices ullamcorper. Mauris porttitor orci id luctus dictum. In ante tellus, sagittis et tincidunt quis, convallis vel orci. Phasellus malesuada, lacus id finibus viverra, arcu turpis sagittis sapien, non sodales sapien erat vitae mi. Donec pellentesque dolor vitae maximus porttitor. Ut hendrerit sed turpis nec bibendum.";

const items = [
    createStandardMenuItem({
        name: "Hello world",
        onExecute: () => alert("Hello"),
        actionBindings: [scrollableContentHandler.createBinding(<Box>{text}</Box>)],
    }),
    createStandardMenuItem({
        name: "Bye world",
        onExecute: () => alert("Bye"),
        actionBindings: [
            getContentAction.createBinding({
                contentView: <Box>{text}</Box>,
            }),
        ],
    }),
];

export default declare({
    info,
    settings,
    open({context, onClose}) {
        context.open(
            new UILayer(() => ({menu: new Menu(context, items), onClose}), {
                path: "Example",
            })
        );
    },
});
