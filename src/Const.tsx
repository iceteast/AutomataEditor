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
        import: true, // TODO:
        export: true // TODO:
    },
    {
        name: "RegEx",
        import: false, // for now
        export: false // for now
    },
    {
        name: "5-Tuple",
        import: false, // for now
        export: true // TODO:
    },
    {
        name: "Tex",
        import: false,
        export: true // TODO:
    }
]
