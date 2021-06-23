export = require("regedit") as regedit;
type regedit = {
    /**
     * Puts the given values in the registry
     * @param data The value to put in the registry
     * @param callback The callback to perform, potentially providing an error
     */
    putValue(data: IRegInputValues, callback: (err: any) => void): void;

    /**
     * Retrieves the values for the given keys
     * @param keys The keys to get the values for
     * @param callback The callback that passes the values
     */
    list(keys: string[], callback: (err: any, result: IRegOutputValues) => void): void;
};

type IRegValue =
    | {
          type: "REG_SZ" | "REG_EXPAND_SZ";
          value: string;
      }
    | {
          type: "REG_DWORD" | "REG_QWORD";
          value: number;
      }
    | {
          type: "REG_MULTI_SZ";
          value: string[];
      }
    | {
          type: "REG_BINARY";
          value: number[];
      }
    | {
          type: "REG_DEFAULT";
          value: string;
      };

type IRegInputValues = {
    [location: string]: {
        [key: string]: IRegValue;
    };
};
type IRegOutputValues = {
    [location: string]: {
        key: string[];
        values: {[key: string]: IRegValue};
    };
};
