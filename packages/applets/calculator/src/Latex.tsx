import React, {Fragment} from "react";
import {LFC, ReactMarkdown} from "@launchmenu/core";

export const Latex: LFC<{latex: string}> = ({latex}) => (
    <ReactMarkdown
        source={`$$${latex}$$`}
        renderers={{paragraph: ({children}) => <Fragment>{children}</Fragment>}}
    />
);
