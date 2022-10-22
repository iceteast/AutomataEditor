import { Format } from "./Interfaces";

export const nodeColor = "lightblue";
export const nodeHighlightColor = "lightgreen";
export const nodeShape = "Ellipse";
export const startNodeShape = "StartNodeRectangle";
export const separator = "|"; // ";"
export const epsilon = "ε";
export const ascii = Array.from(Array(128).keys()).map((i) => String.fromCharCode(i)).join("");
export const formats: Format[] = [
    {
        name: "JSON",
        import: true,
        export: true,
        adminOnly: false,
    },
    {
        name: "URL",
        import: true,
        export: true,
        adminOnly: false,
    },
    {
        name: "RegEx",
        import: true,
        export: true,
        adminOnly: true,
    },
    {
        name: "5-Tuple",
        import: false, // TODO: for now
        export: true, // TODO:
        adminOnly: false,
    },
    {
        name: "LaTeX",
        import: false,
        export: true, // TODO:
        adminOnly: false,
    },
]
