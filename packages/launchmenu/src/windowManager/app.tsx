import ReactDOM from "react-dom";
import {LaunchMenu} from "../application/LaunchMenu";

const lm = new LaunchMenu();
ReactDOM.render(lm.view, document.getElementById("root"));
