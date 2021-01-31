import React from "react";
import {IThemeInput} from "./_types/IThemeInput";
import {ITheme} from "./_types/ITheme";
import {IHighlightThemeInput} from "./highlighting/_types/IHighlightThemeInput";
import {IHighlightTheme} from "./highlighting/_types/IHighlightTheme";
import {createHighlightTheme} from "./highlighting/createHighlightTheme";
import {IBaseTheme} from "./_types/IBaseTheme";
import {GoSearch} from "react-icons/go";
import Path from "path";
import {mergeStyles} from "../../utils/mergeStyles";

import {FaCog} from "react-icons/fa";
import {
    BiWindow,
    BiSelectMultiple,
    BiMove,
    BiMoveVertical,
    BiMoveHorizontal,
    BiShow,
    BiHide,
    BiComment,
    BiListUl,
    BiWindows,
    BiCopy,
} from "react-icons/bi";
import {
    IoMdCube,
    IoMdExit,
    IoMdPlay,
    IoMdPause,
    IoMdOpen,
    IoMdReturnLeft,
    IoMdHelp,
} from "react-icons/io";
import {FaFolderOpen, FaFolder} from "react-icons/fa";
import {
    FiMenu,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiChevronUp,
    FiDownload,
    FiUpload,
    FiFile,
    FiWifi,
    FiTerminal,
} from "react-icons/fi";
import {
    MdLaunch,
    MdModeEdit,
    MdDelete,
    MdRefresh,
    MdHome,
    MdStar,
    MdCode,
    MdSend,
    MdUndo,
    MdRedo,
} from "react-icons/md";

/**
 * Creates a new theme from the given input
 * @param themeInput The theme input data
 * @param highlightTheme The highlighting styling
 * @returns The theme
 */
export function createTheme(
    themeInput: IThemeInput,
    highlightTheme: IHighlightThemeInput | IHighlightTheme
): ITheme {
    const accentFont = themeInput.colors.font.accent;
    const bgFont = themeInput.colors.font.background;

    // Manage font assets and styling
    const fonts = {} as {[key: string]: {name: string; path: string}};
    const getFont = (font?: string) => {
        if (!font)
            font = `url("${Path.join(__dirname, "..", "fonts", "Lato-Light.ttf")}")`;

        font = font.replace(/\\/g, "/");
        if (!fonts[font]) {
            let nameMatch = font.match(/([\w-_]+)([^\w]*|\..*)$/); // Try to extract a name from file path
            let name = (nameMatch && nameMatch[1]) || "font";
            while (Object.values(fonts).find(({name: n}) => n == name)) name += "N";
            fonts[font] = {
                name,
                path: font,
            };
        }
        return fonts[font].name;
    };

    // The overall theme
    const theme: IBaseTheme = {
        ...themeInput,
        color: {
            primary: themeInput.colors.accent.primary,
            secondary: themeInput.colors.accent.secondary,
            tertiary: themeInput.colors.accent.tertiary,
            bgPrimary: themeInput.colors.background.primary,
            bgSecondary: themeInput.colors.background.secondary,
            bgTertiary: themeInput.colors.background.tertiary,

            fontPrimary: accentFont instanceof Object ? accentFont.primary : accentFont,
            fontSecondary:
                accentFont instanceof Object ? accentFont.secondary : accentFont,
            fontTertiary: accentFont instanceof Object ? accentFont.tertiary : accentFont,
            fontBgPrimary: bgFont instanceof Object ? bgFont.primary : bgFont,
            fontBgSecondary: bgFont instanceof Object ? bgFont.secondary : bgFont,
            fontBgTertiary: bgFont instanceof Object ? bgFont.tertiary : bgFont,
        },
        elevation: {
            extraSmall:
                themeInput.elevations?.extraSmall || "0 2px 4px -1px rgba(0,0,0,0.10)",
            small: themeInput.elevations?.small || "0 3px 6px -2px rgba(0,0,0,0.10)",
            medium: themeInput.elevations?.medium || "0 10px 20px -5px rgba(0,0,0,0.10)",
            large: themeInput.elevations?.large || " 0 14px 28px -7px rgba(0,0,0,0.10)",
            extraLarge:
                themeInput.elevations?.extraLarge || "0 19px 38px -10px rgba(0,0,0,0.10)",
        },
        font: {
            textField: {
                fontFamily: getFont(themeInput.fonts?.textField?.fontFamily),
                fontSize: themeInput.fonts?.textField?.fontSize || 24,
                fontStyle: themeInput.fonts?.textField?.fontStyle || "normal",
                fontWeight: themeInput.fonts?.textField?.fontWeight || 200,
                textTransform: themeInput.fonts?.textField?.textTransform || "none",
            },
            header: {
                fontFamily: getFont(themeInput.fonts?.header?.fontFamily),
                fontSize: themeInput.fonts?.header?.fontSize || 18,
                fontStyle: themeInput.fonts?.header?.fontStyle || "normal",
                fontWeight: themeInput.fonts?.header?.fontWeight || 200,
                textTransform: themeInput.fonts?.header?.textTransform || "none",
            },
            headerLarge: {
                fontFamily: getFont(themeInput.fonts?.headerLarge?.fontFamily),
                fontSize: themeInput.fonts?.headerLarge?.fontSize || 24,
                fontStyle: themeInput.fonts?.headerLarge?.fontStyle || "normal",
                fontWeight: themeInput.fonts?.headerLarge?.fontWeight || 200,
                textTransform: themeInput.fonts?.headerLarge?.textTransform || "none",
            },
            paragraph: {
                fontFamily: getFont(themeInput.fonts?.paragraph?.fontFamily),
                fontSize: themeInput.fonts?.paragraph?.fontSize || 14,
                fontStyle: themeInput.fonts?.paragraph?.fontStyle || "normal",
                fontWeight: themeInput.fonts?.paragraph?.fontWeight || 200,
                textTransform: themeInput.fonts?.paragraph?.textTransform || "none",
            },
            bold: {
                fontFamily: getFont(themeInput.fonts?.paragraph?.fontFamily),
                fontSize: themeInput.fonts?.paragraph?.fontSize || 14,
                fontStyle: themeInput.fonts?.paragraph?.fontStyle || "normal",
                fontWeight: themeInput.fonts?.paragraph?.fontWeight || 900,
                textTransform: themeInput.fonts?.paragraph?.textTransform || "none",
            },
        },
        radius: {
            small: themeInput.radius?.small || 4,
            medium: themeInput.radius?.normal || 8,
            large: themeInput.radius?.large || 16,
            round: themeInput.radius?.round || 100000,
        },
        border: {
            normal: themeInput.border?.normal || {
                borderStyle: "solid",
                borderWidth: 1,
            },
            thick: themeInput.border?.thick || {
                borderStyle: "solid",
                borderWidth: 3,
            },
        },
        spacing: {
            none: 0,
            extraSmall: themeInput.spacing?.extraSmall || 2,
            small: themeInput.spacing?.small || 4,
            medium: themeInput.spacing?.medium || 8,
            large: themeInput.spacing?.large || 16,
            extraLarge: themeInput.spacing?.extraLarge || 32,
        },
        icon: {
            search: themeInput.icons?.search || <GoSearch />,
            settings: themeInput.icons?.settings || <FaCog />,
            contextMenu: themeInput.icons?.contextMenu || <FiMenu />,
            arrowDown: themeInput.icons?.arrowDown || <FiChevronDown />,
            arrowUp: themeInput.icons?.arrowUp || <FiChevronUp />,
            arrowLeft: themeInput.icons?.arrowLeft || <FiChevronLeft />,
            arrowRight: themeInput.icons?.arrowRight || <FiChevronRight />,
            window: themeInput.icons?.window || <BiWindow />,
            applets: themeInput.icons?.applets || <IoMdCube />,
            comment: themeInput.icons?.comment || <BiComment />,
            hide: themeInput.icons?.hide || <BiHide />,
            show: themeInput.icons?.show || <BiShow />,
            select: themeInput.icons?.select || <BiSelectMultiple />,
            move: themeInput.icons?.move || <BiMove />,
            moveVertical: themeInput.icons?.moveVertical || <BiMoveVertical />,
            moveHorizontal: themeInput.icons?.moveHorizontal || <BiMoveHorizontal />,
            exit: themeInput.icons?.exit || <IoMdExit />,
            download: themeInput.icons?.download || <FiDownload />,
            upload: themeInput.icons?.upload || <FiUpload />,
            file: themeInput.icons?.file || <FiFile />,
            wifi: themeInput.icons?.wifi || <FiWifi />,
            launch: themeInput.icons?.launch || <MdLaunch />,
            edit: themeInput.icons?.edit || <MdModeEdit />,
            delete: themeInput.icons?.delete || <MdDelete />,
            refresh: themeInput.icons?.refresh || <MdRefresh />,
            home: themeInput.icons?.home || <MdHome />,
            favorite: themeInput.icons?.favorite || <MdStar />,
            code: themeInput.icons?.code || <MdCode />,
            terminal: themeInput.icons?.terminal || <FiTerminal />,
            send: themeInput.icons?.send || <MdSend />,
            undo: themeInput.icons?.undo || <MdUndo />,
            redo: themeInput.icons?.redo || <MdRedo />,
            play: themeInput.icons?.play || <IoMdPlay />,
            pause: themeInput.icons?.pause || <IoMdPause />,
            open: themeInput.icons?.open || <IoMdOpen />,
            menu: themeInput.icons?.menu || <BiListUl />,
            folder: themeInput.icons?.folder || <FaFolder />,
            folderOpen: themeInput.icons?.folderOpen || <FaFolderOpen />,
            session: themeInput.icons?.session || <BiWindows />,
            return: themeInput.icons?.return || <IoMdReturnLeft />,
            help: themeInput.icons?.help || <IoMdHelp />,
            copy: themeInput.icons?.help || <BiCopy />,
            paste: themeInput.icons?.help || <BiCopy />,
        },
        globalCss: mergeStyles(
            {
                "@font-face": Object.values(fonts).map(({name, path}) => ({
                    fontFamily: name,
                    src: path,
                })),
            },
            themeInput.globalCss || undefined
        ),
    };

    return {
        ...theme,
        highlighting: createHighlightTheme(highlightTheme, theme),
    };
}
