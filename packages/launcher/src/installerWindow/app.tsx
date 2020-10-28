import {createTheme, ThemeProvider} from "@deity/falcon-ui";
import React from "react";
import ReactDOM from "react-dom";
import {WindowUI} from "./WindowUI";

function startApplication() {
    const theme = createTheme({
        colors: {
            primary: "#44E",
            primaryLight: "#99F",
            primaryDark: "#00A",
        },
    });

    ReactDOM.render(
        <ThemeProvider theme={theme} globalCss={{".themed-root": {height: "100%"}}}>
            <WindowUI />
        </ThemeProvider>,
        document.getElementById("root")
    );
}

(window as any).startApplication = startApplication;
