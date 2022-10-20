
export interface Graph {
    nodes: Node[];
    links: Link[];
}

export interface Node {
    id: number;
    label: string;
    x: number;
    y: number;
    isAccepting: boolean;
}

export interface Link {
    from: number;
    to: number;
    label: string;
}

export function convertToGraph(nodeDataArray: Array<go.ObjectData>, linkDataArray: Array<go.ObjectData>): Graph {
    const nodes: Node[] = [];
    const links: Link[] = [];
    nodeDataArray.forEach((node: go.ObjectData) => {
        var x = parseInt(node.loc.split(" ")[0]);
        var y = parseInt(node.loc.split(" ")[1]);
        nodes.push({
            id: node.key,
            label: node.text,
            x: x,
            y: y,
            isAccepting: node.final,
        });
    });
    linkDataArray.forEach((link: go.ObjectData) => {
        links.push({
            from: link.from,
            to: link.to,
            label: link.text,
        });
    });
    return { nodes, links };
}

// TODO: update model

export function labelAcceptsSymbol(symbol: string, label: string): boolean {
    // if (label === "") {
    //     return true;
    // }
    if (!label) {
        return true;
    }
    if (label.includes(";")) {
        const labels = label.split(";");
        return labels.includes(symbol);
    }
    // return label === symbol;
    // use label as regex
    return new RegExp(label).test(symbol);
}

export function nextState(graph: Graph, currentState: Node[], symbol: string): Node[] {
    const nextStates: Node[] = [];
    // console.log("compute next states", currentState, symbol);
    // currentState.forEach((state: Node) => {
    //     console.log(state.id);
    // });
    graph.links.forEach((link: Link) => {
        // console.log("  check link", link);
        // if (currentState.some((state: Node) => state.id === link.from)) {
        //     console.log("outgoing link", link);
        // }
        if (currentState.some((state: Node) => state.id === link.from)
            && labelAcceptsSymbol(symbol, link.label)) {
            nextStates.push(graph.nodes.find((node: Node) => node.id === link.to)!);
        }
    });
    return nextStates;
}

export function getStart(graph: Graph): Node {
    return graph.nodes.find((node: Node) => node.id === 0)!;
}

export function checkWord(graph: Graph, word: string): boolean {
    var startNode = getStart(graph);
    let currentNodes = [startNode];
    // console.log("checkWord", word);
    // console.log(" start", startNode);
    for (let i = 0; i < word.length; i++) {
        var sym = word[i];
        currentNodes = nextState(graph, currentNodes, sym);
        // console.log(" after ", sym, ":", currentNodes);
    }
    return currentNodes.some((node) => node.isAccepting);
}
