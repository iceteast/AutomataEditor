import { Cloud, Format } from "./Interfaces";

// TODO: choose longer password
export const pwd_hash = "129b24f5e1bfadab7b38f1e4c0dd73ec0ea9c0bd2015cf66c6fee4658c3af204c4c3f98de2f70f99d60f11e1d975a1d67c48f0bcb6b02c319eddaaea3d94099f";
export const nodeColor = "lightblue";
export const nodeHighlightColor = "lightgreen";
export const nodeShape = "Ellipse";
export const startNodeShape = "StartNodeCircle";
export const separator = ","; // ";"
export const epsilon = "ε";
export const Sigma = "Σ";
export const pasteeeApiToken = "adTwyfWKVqOyTPvQz0LsOOD1scKBRdD6gKj32dVKS";
export const pasteeePublicApiToken = "uAjDAj2ZlEYV3CkKaWfcjWufwHPgQOwkM1wsRGvTm";
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
        import: false, // TODO: 
        export: true,
        adminOnly: false,
    },
    {
        name: "LaTeX",
        import: false,
        export: true,
        adminOnly: false,
    },
    {
        name: "Grammar",
        import: false, // TODO:
        export: true, // TODO:
        adminOnly: true,
    },
    // TODO: dot / graphviz
];
export const clouds: Cloud[] = [
    {
        name: "File",
        load: true,
        save: true,
        adminOnly: false,
    },
    {
        name: "Pastebin",
        load: true, // TODO:
        save: true, // TODO:
        adminOnly: false,
    },
    {
        name: "Public Pastebin",
        load: true, // TODO:
        save: true, // TODO:
        adminOnly: false,
    },
    {
        name: "Google Drive",
        load: false, // TODO
        save: false, // TODO
        adminOnly: false,
    },
    {
        name: "Dropbox",
        load: false, // TODO
        save: false, // TODO
        adminOnly: false,
    },
];
