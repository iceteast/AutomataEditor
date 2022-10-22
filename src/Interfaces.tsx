export interface Format {
    name: "JSON" | "RegEx" | "5-Tuple" | "LaTeX" | "URL";
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
