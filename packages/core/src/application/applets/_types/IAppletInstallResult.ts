/** The possible applet installation results */
export type IAppletInstallResult =
    | {
          /** The result type, the installation was successful */
          type: "successful";
      }
    | {
          /** The result type, something went wrong while installing the applet */
          type: "networkError";
          /** The actual error */
          error: Error;
      }
    | {
          /** The result type, the current LM version doesn't correspond with the applet's LM version */
          type: "versionError";
          /** The LM version that the package expected to be installed on */
          expectedLMRange: string;
      }
    | {
          /** The result type, the requested package wasn't a valid applet */
          type: "notAnAppletError";
      };
