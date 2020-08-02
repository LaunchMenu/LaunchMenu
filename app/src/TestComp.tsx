import React, {FC} from "react";
import {KeyHandlerTest} from "./componentTests/KeyHandlerTest";
import {StackViewTest} from "./componentTests/StackViewTest";
import {ThemeTest} from "./componentTests/ThemeTest";
import {MenuViewTest} from "./componentTests/MenuViewTest";
import {InputFieldTest} from "./componentTests/InputFieldTest";
import {SyntaxFieldTest} from "./componentTests/SyntaxFieldTest";
import {EditorFieldTest} from "./componentTests/EditorFieldTest";
import {useHorizontalScroll} from "./utils/hooks/useHorizontalScroll";
import {Box} from "./styling/box/Box";
import {FillBox} from "./components/FillBox";

export const TestComp: FC = () => {
    // const scrollRef = useHorizontalScroll();
    // return (
    //     <FillBox background="bgPrimary">
    //         <div ref={scrollRef} style={{width: 300, overflow: "auto"}}>
    //             <div style={{whiteSpace: "nowrap"}}>
    //                 I will definitely overflow due to the small width of my parent
    //                 container and even more so this should overflow very var in theory
    //             </div>
    //         </div>
    //         <Box
    //             width={200}
    //             height={200}
    //             background="bgTertiary"
    //             css={{WebkitAppRegion: "drag"}}></Box>
    //     </FillBox>
    // );

    // return <StackViewTest />;
    // return <KeyHandlerTest />;
    // return <ThemeTest />;
    // return <MenuViewTest />;
    return <InputFieldTest />;
    // return <SyntaxFieldTest />;
    // return <EditorFieldTest />;
};
