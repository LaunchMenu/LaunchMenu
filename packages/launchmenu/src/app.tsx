import ReactDOM from "react-dom";
import {LaunchMenu} from "./application/LaunchMenu";
import React from "react";
import {TestComp} from "./TestComp";
import {ThemeProvider} from "./styling/theming/ThemeContext";
import {defaultTheme} from "./styling/theming/defaultTheme";
import {loadTheme, getTheme} from "./styling/theming/loadTheme";

const lm = new LaunchMenu();
ReactDOM.render(lm.view, document.getElementById("root"));

// loadTheme(defaultTheme);
// ReactDOM.render(
//     <ThemeProvider>
//         <TestComp />
//     </ThemeProvider>,
//     document.getElementById("root")
// );
