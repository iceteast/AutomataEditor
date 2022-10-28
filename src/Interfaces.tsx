export type FormatTypes = "JSON" | "RegEx" | "5-Tuple" | "LaTeX" | "URL" | "Grammar";
export type CloudProvider = "Google Drive" | "Dropbox" | "Unlisted Pastebin" | "Public Pastebin" | "File";

export interface Cloud {
    name: CloudProvider;
    load: boolean;
    save: boolean;
    adminOnly: boolean;
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
