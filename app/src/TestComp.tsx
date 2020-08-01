import React, {FC} from "react";
import {KeyHandlerTest} from "./componentTests/KeyHandlerTest";
import {StackViewTest} from "./componentTests/StackViewTest";
import {ThemeTest} from "./componentTests/ThemeTest";
import {MenuViewTest} from "./componentTests/MenuViewTest";
import {InputFieldTest} from "./componentTests/InputFieldTest";
import {SyntaxFieldTest} from "./componentTests/SyntaxFieldTest";
import {EditorFieldTest} from "./componentTests/EditorFieldTest";

export const TestComp: FC = () => {
    // return <StackViewTest />;
    // return <KeyHandlerTest />;
    // return <ThemeTest />;
    // return <MenuViewTest />;
    return <InputFieldTest />;
    // return <SyntaxFieldTest />;
    // return <EditorFieldTest />;
};
