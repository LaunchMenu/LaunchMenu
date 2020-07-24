import React, {FC} from "react";
import {KeyHandlerTest} from "./componentTests/KeyHandlerTest";
import {StackViewTest} from "./componentTests/StackViewTest";
import {ThemeTest} from "./componentTests/ThemeTest";
import {MenuViewTest} from "./componentTests/MenuViewTest";
import {InputFieldTest} from "./componentTests/InputFieldTest";

export const TestComp: FC = () => {
    // return <StackViewTest />;
    // return <KeyHandlerTest />;
    // return <ThemeTest />;
    // return <MenuViewTest />;
    return <InputFieldTest />;
};
