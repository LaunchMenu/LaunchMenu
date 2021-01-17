import React from "react";
import {ShortAboutLM} from "@launchmenu/core";
import {createHelpItem} from "../createHelpItem";

// TODO: add more custom content
export const aboutItem = createHelpItem({
    name: "About",
    content: <ShortAboutLM padding="medium" />,
});
