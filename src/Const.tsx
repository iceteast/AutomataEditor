import { Format } from "./Interfaces";

// TODO: choose longer password
export const pwd_hash = "129b24f5e1bfadab7b38f1e4c0dd73ec0ea9c0bd2015cf66c6fee4658c3af204c4c3f98de2f70f99d60f11e1d975a1d67c48f0bcb6b02c319eddaaea3d94099f";
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
