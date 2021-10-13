import React, {
    FC,
    createContext,
    useRef,
    useEffect,
    useContext,
    isValidElement,
    cloneElement,
} from "react";
import {
    Box,
    Content,
    ContentFrame,
    createKeyPatternSetting,
    createSettings,
    createSettingsFolder,
    createStandardContentKeyHandler,
    declare,
    FillBox,
    IContent,
    IIOContext,
    IKeyEventListener,
    KeyEvent,
    KeyPattern,
    LFC,
    UILayer,
} from "@launchmenu/core";
import {Field, IDataHook} from "model-react";
import {useMemo} from "react";
import {useResizeDetector} from "react-resize-detector";
import {v4 as uuid} from "uuid";

const info = {
    name: "Example",
    description: "A minimal example applet",
    version: "0.0.0",
    icon: "applets" as const,
};

const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {
                nextSection: createKeyPatternSetting({
                    name: "Next section",
                    init: new KeyPattern("ctrl+pageDown"),
                }),
                prevSection: createKeyPatternSetting({
                    name: "Previous section",
                    init: new KeyPattern("ctrl+pageUp"),
                }),
            },
        }),
});

// Data model
type ISectionedContent = IContent & {
    /**
     * Sets the pixel offsets of the sections
     * @param offsets The pixel offsets
     */
    setSections(offsets: number[]): void;

    /**
     * Retrieves the sections of this content
     * @param hook The hook to subscribe to changes
     * @returns The section offsets in sorted order
     */
    getSections(hook?: IDataHook): number[];
};

class SectionedContent extends Content implements ISectionedContent {
    protected sections = new Field([] as number[]);

    /** @override */
    public setSections(sections: number[]): void {
        this.sections.set(sections.sort());
    }

    /** @override */
    public getSections(hook?: IDataHook): number[] {
        return this.sections.get(hook);
    }
}

// Controller
/**
 * Handles content section change (ctrl + page down/up)
 * @param event The event to test
 * @param content The content to be scrolled
 * @param patterns The key patterns to detect
 * @returns Whether the event was caught
 */
export function handleContentSectionInput(
    event: KeyEvent,
    content: ISectionedContent,
    patterns: {prevSection: KeyPattern; nextSection: KeyPattern}
): void | boolean {
    const matchesPrev = patterns.prevSection.matches(event);
    const matchesNext = patterns.nextSection.matches(event);
    if (matchesPrev || matchesNext) {
        const curOffset = content.getScrollOffset();
        const sections = content.getSections();
        const nextIndex = sections.findIndex(val => val > curOffset);
        const curIndex = (nextIndex == -1 ? sections.length : nextIndex) - 1;
        const direction = matchesPrev ? (sections[curIndex] == curOffset ? -1 : 0) : 1;
        const newIndex = Math.max(0, Math.min(curIndex + direction, sections.length - 1));
        const newOffset = sections[newIndex];
        const percentage = newOffset / content.getScrollHeight();
        content.setScrollPercentage(percentage);
        return true;
    }
}

/**
 * Creates a standard content key handler
 * @param content The content to be handled
 * @param context The context that the handler is used in
 * @param config Additional configuration
 * @returns The key handler tha can be added to the UILayer
 */
export function createSectionedContentKeyHandler(
    content: ISectionedContent,
    context: IIOContext,
    config?: {
        /** The code to execute when trying to exit the field */
        onExit?: () => void;
    }
): IKeyEventListener {
    const sectionControlSettings = context.settings.get(settings);
    // This needs to be a function, since we need to get the latest settings on every key event
    const getSectionControls = () => ({
        nextSection: sectionControlSettings.nextSection.get(),
        prevSection: sectionControlSettings.prevSection.get(),
    });
    const standardContentHandler = createStandardContentKeyHandler(
        content,
        context,
        config
    );

    return e => {
        if (handleContentSectionInput(e, content, getSectionControls())) return true;
        return standardContentHandler(e);
    };
}

// View
const SectionContext = createContext({
    setOffset: (id: string, pageOffset: number) => {},
    destroy: (id: string) => {},
});
const SectionContextProvider: FC<{content: ISectionedContent}> = ({
    content,
    children,
}) => {
    const poses = useRef<Record<string, number>>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const functions = useMemo(() => {
        const updateSections = () => content.setSections(Object.values(poses.current));
        return {
            setOffset: (id: string, pageOffset: number) => {
                const el = containerRef.current;
                if (el) {
                    const oldOffset = poses.current[id];
                    const offset = pageOffset - el.getBoundingClientRect().top;
                    poses.current[id] = offset;
                    if (oldOffset != offset) updateSections();
                }
            },
            destroy: (id: string) => {
                delete poses.current[id];
                updateSections();
            },
        };
    }, []);

    // Force rerender on size change
    const {ref: resizeRef} = useResizeDetector();

    return (
        <Box elRef={[containerRef, resizeRef]}>
            <SectionContext.Provider value={functions}>
                {children}
            </SectionContext.Provider>
        </Box>
    );
};
const Section: FC = ({children}) => {
    const elRef = useRef<HTMLDivElement>(null);
    const {width, height, ref} = useResizeDetector();

    const {destroy, setOffset} = useContext(SectionContext);

    const IDRef = useRef<string | undefined>();
    if (!IDRef.current) IDRef.current = uuid();

    useEffect(() => {
        const el = elRef.current;
        const ID = IDRef.current;
        if (el && ID) setOffset(ID, el.getBoundingClientRect().top);
    }, [setOffset, width, height]);
    useEffect(() => () => destroy(IDRef.current!), []);

    return <Box elRef={[elRef, ref]}>{children}</Box>;
};

const SectionedContentView: LFC<{content: ISectionedContent}> = ({content, ...rest}) => {
    const View = content.view as any;
    const element = isValidElement(View) ? cloneElement(View, rest) : <View {...rest} />;
    const {height, ref} = useResizeDetector();

    return (
        <FillBox elRef={ref}>
            <ContentFrame content={content}>
                {
                    <SectionContextProvider content={content}>
                        {element}
                        {/* Add a spacer such that we can reach the bottom content no matter how big it is */}
                        <Box height={height} />
                    </SectionContextProvider>
                }
            </ContentFrame>
        </FillBox>
    );
};

export default declare({
    info,
    settings,
    open({context, onClose}) {
        context.open(
            new UILayer(
                (context, close) => {
                    const content = new SectionedContent(
                        (
                            <div>
                                {texts.map((text, i) => (
                                    <Section key={i}>
                                        <Box marginBottom="medium">{text}</Box>
                                    </Section>
                                ))}
                            </div>
                        )
                    );
                    const contentHandler = createSectionedContentKeyHandler(
                        content,
                        context,
                        {onExit: close}
                    );
                    const contentView = <SectionedContentView content={content} />;

                    return {
                        content,
                        contentHandler,
                        contentView,
                        handleClose: true,
                        onClose,
                    };
                },
                {
                    path: "Example",
                }
            )
        );
    },
});
const texts = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tellus justo, suscipit ut felis a, porttitor tempor metus. Etiam odio urna, vulputate sed massa vitae, tristique semper ipsum. Maecenas tempus justo lectus, in mollis lacus iaculis eget. Vivamus ut varius turpis, a blandit nisi. Donec aliquet mi leo. Mauris convallis orci vel tempus faucibus. Aenean ligula sapien, laoreet et dictum eu, ultrices in dolor. Quisque porttitor lacus a lectus malesuada, vel tempor lorem semper. Morbi mollis finibus quam, sed ultricies ex posuere ultricies. Integer quis massa eget erat convallis tempor. Proin eleifend sodales erat et efficitur. Quisque eget nibh ut magna condimentum posuere. In egestas, nisi id cursus viverra, ante justo pulvinar turpis, sed rhoncus mauris dui eget turpis. Nam turpis enim, convallis suscipit lectus nec, venenatis gravida neque. Mauris in elementum nisl. Pellentesque in augue non nisl varius rutrum eu quis diam.",
    "Maecenas eu gravida justo. Aliquam erat volutpat. Proin vitae ante malesuada, sollicitudin ex a, facilisis leo. Quisque ac risus scelerisque, finibus neque pulvinar, luctus sem. Duis suscipit auctor metus, sed dictum sem condimentum vel. Aliquam quis commodo dui. Ut sit amet nisl eleifend, lobortis risus sit amet, tempus leo.",
    "In mollis felis massa, sed vestibulum quam vestibulum nec. Quisque vitae dui ut felis lobortis venenatis. Nulla dapibus sem vitae nulla tempus rhoncus. Integer bibendum tortor vulputate justo placerat, a congue eros tempor. Integer volutpat, augue congue euismod aliquet, lectus ante vestibulum mi, a feugiat tellus dolor ac erat. Mauris fermentum nisl vel urna tincidunt eleifend. Quisque tellus ligula, tempor quis lacus quis, rutrum aliquam mi. Mauris varius massa non diam auctor, a semper justo venenatis. Cras sit amet enim felis. Nullam finibus, dui id auctor dignissim, elit metus vehicula lorem, vel vehicula libero nisi quis nisi.",
    "Vivamus a suscipit nunc. Sed mollis nunc sed orci fringilla condimentum. Nunc accumsan tristique sem vitae maximus. Quisque vulputate nisi metus, sed faucibus neque fringilla eu. Praesent quis elit ac sapien imperdiet malesuada. Aliquam nunc dolor, sagittis vitae purus vel, cursus vehicula risus. Vestibulum convallis nec quam ut finibus. Fusce bibendum sapien non cursus eleifend. Sed fringilla porta auctor. Etiam dignissim semper nunc non venenatis. Aenean tempor lectus sed tellus porttitor, vitae tincidunt ex scelerisque. Morbi vitae orci massa. Sed et posuere elit. Proin ac pretium nibh, nec facilisis augue. Suspendisse sed enim felis.",
    "Sed ac mi vel est convallis fermentum. Nulla nulla tellus, ullamcorper quis dignissim a, dictum ultricies metus. Pellentesque at nunc consectetur, suscipit lacus et, mollis metus. Sed aliquam quis quam eget fermentum. Nunc a orci et dolor condimentum imperdiet id at est. In vel orci finibus, aliquet turpis non, porttitor sapien. Mauris pharetra eros vel tortor sollicitudin fermentum. Morbi in justo eget risus congue viverra vel eget sem. Sed semper tortor a tellus ultrices ullamcorper. Mauris porttitor orci id luctus dictum. In ante tellus, sagittis et tincidunt quis, convallis vel orci. Phasellus malesuada, lacus id finibus viverra, arcu turpis sagittis sapien, non sodales sapien erat vitae mi. Donec pellentesque dolor vitae maximus porttitor. Ut hendrerit sed turpis nec bibendum.",
];
