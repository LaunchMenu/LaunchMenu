import {IAppletInfo} from "@launchmenu/core";
import React from "react";
import {BiCalculator} from "react-icons/bi";

export const info: IAppletInfo = {
    name: "Calculator",
    description: "Perform simple calculations in LaunchMenu",
    version: "0.0.0",
    icon: <BiCalculator />,
    tags: ["launchmenu-applet", "calculator"],
};
