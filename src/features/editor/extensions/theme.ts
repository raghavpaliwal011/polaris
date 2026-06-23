import { EditorView } from "codemirror";
export const customTheme = EditorView.theme({
    "&":{
        outline:"none !important",
        height:"100%"
    },
    ".cm-content":{
        fontFamily:"vart(--font-plex-mono), monospace",
        fontSize:"14px"
    },
    ".cm-scroller":{
        scrollbarWidth: "thin",
        scrollBarColor:"#3f3f46 transparent"
    }
})