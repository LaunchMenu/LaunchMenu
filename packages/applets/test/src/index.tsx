import {declare} from "@launchmenu/launchmenu/build/application/applets/declare";

// export const settings = create

export default declare({
    info: {
        name: "test",
        description: "A applet purely used for testing",
        version: "0.0.0",
        icon: "search",
    },
    settings: null as any,
});
