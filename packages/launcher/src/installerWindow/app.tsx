import {createMuiTheme, ThemeProvider} from "@material-ui/core";
import React from "react";
import ReactDOM from "react-dom";
import {WindowUI} from "./WindowUI";

function startApplication() {
    const theme = createMuiTheme({
        palette: {
            primary: {
                main: "#44E",
                light: "#99F",
                dark: "#00A",
            }
        },
    });

    ReactDOM.render(
        <ThemeProvider theme={theme}>
            <WindowUI />
        </ThemeProvider>,
        document.getElementById("root")
    );
}

(window as any).startApplication = startApplication;
