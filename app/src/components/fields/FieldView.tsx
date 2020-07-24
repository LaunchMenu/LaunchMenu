import React, {FC, useEffect} from "react";

export const FieldView: FC<{
    onTop?: boolean;
    index?: number;
}> = ({onTop}) => {
    useEffect(() => {}, [onTop]);

    return <div></div>;
};
