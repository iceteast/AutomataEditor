export type FormatTypes = "JSON" | "RegEx" | "5-Tuple" | "LaTeX" | "URL" | "Grammar" | "Image" | "SVG";
export type CloudProvider = "Google Drive" | "Dropbox" | "Unlisted Pastebin" | "Public Pastebin" | "File";

// export enum ControlledAccess {
//     Public,
//     Admin,
//     Inaccessible,
// }
export type ControlledAccess = "Public" | "Admin" | "Inaccessible";

export interface Cloud {
    name: CloudProvider;
    load: ControlledAccess;
    save: ControlledAccess;
}

export interface Format {
    name: FormatTypes;
    import: boolean;
    export: boolean;
    adminOnly: boolean;
}


export interface Graph {
    nodes: Node[];
    links: Link[];
}

export interface Node {
    id: number;
    label: string;
    x?: number;
    y?: number;
    isAccepting: boolean;
}

export interface Link {
    from: number;
    to: number;
    label: string;
}

export interface Paste {
    id: string;
    description: string;
}
