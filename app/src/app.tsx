import ReactDOM from "react-dom";
import React from "react";
import {TestComp} from "./TestComp";
import {ThemeProvider} from "./styling/theming/ThemeContext";
import {defaultTheme} from "./styling/theming/defaultTheme";
import {loadTheme, getTheme} from "./styling/theming/loadTheme";

loadTheme(defaultTheme);
ReactDOM.render(
    <ThemeProvider>
        <TestComp />
    </ThemeProvider>,
    document.getElementById("root")
);
