import { nodeColor, startNodeShape } from "./Const";

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

export function convertToGraph(nodeDataArray: Array<go.ObjectData>, linkDataArray: Array<go.ObjectData>): Graph {
    const nodes: Node[] = [];
    const links: Link[] = [];
    nodeDataArray.forEach((node: go.ObjectData) => {
        let x = undefined;
        let y = undefined;
        if (node.loc) {
            x = parseInt(node.loc.split(" ")[0]);
            y = parseInt(node.loc.split(" ")[1]);
        }
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
    console.log("compute next states", currentState, symbol);
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

export function updateModelWithGraph(
    graph: Graph,
    setNodeDataArray: React.Dispatch<React.SetStateAction<go.ObjectData[]>>,
    setLinkDataArray: React.Dispatch<React.SetStateAction<go.ObjectData[]>>
) {
    console.log("updateModelWithGraph", graph);
    setNodeDataArray(
        graph.nodes.map((node: Node) => {
            return {
                key: node.id,
                text: node.label,
                final: node.isAccepting,
                color: nodeColor,
                ...(node.id === 0 && { figure: startNodeShape, deleteable: false }),
                // ...(node.x !== undefined && node.y !== undefined && { loc: node.x + " " + node.y })
            };
        })
    );
    setLinkDataArray(
        graph.links.map((link: Link, i: number) => {
            return {
                key: -i - 1,
                from: link.from,
                to: link.to,
                text: link.label,
            };
        })
    );
}

export function getReachableGraph(graph: Graph) {
    const reachableNodeIds = new Set<Number>();
    reachableNodeIds.add(getStart(graph).id);
    const newReachableNodeIds = new Set<Number>();
    do {
        newReachableNodeIds.clear();
        graph.links.forEach((link: Link) => {
            if (reachableNodeIds.has(link.from)) {
                newReachableNodeIds.add(link.to);
            }
        });
        reachableNodeIds.forEach((node: Number) => {
            newReachableNodeIds.delete(node);
        });
        newReachableNodeIds.forEach((node: Number) => {
            reachableNodeIds.add(node);
        });
    } while (newReachableNodeIds.size > 0);

    const reachableNodes = graph.nodes.filter((node: Node) => reachableNodeIds.has(node.id));
    const reachableLinks = graph.links.filter((link: Link) => reachableNodeIds.has(link.from) && reachableNodeIds.has(link.to));
    return { nodes: reachableNodes, links: reachableLinks };
}












export function getAlphabet(graph: Graph) {
    const alphabet = new Set<string>();
    // TODO: make regex links atomic (or all links)
    graph.links.forEach((link: Link) => {
        if (link.label && link.label !== "ε") {
            if (link.label === ";") {
                alphabet.add(";");
            } else {
                link.label.split(";").forEach((symbol: string) => {
                    if (symbol.length > 0) {
                        alphabet.add(symbol);
                    }
                });
            }
        }
    });
    return alphabet;
}
function getAllSubsets(array: any[]) {
    return array.reduce(
        (subsets, value) => subsets.concat(
            subsets.map((set: any[]) => [value, ...set])
        ),
        [[]]
    );
}

export function getPowerGraph(graph: Graph) {
    const powerName = (nodes: Node[]) => {
        return "{" + nodes.map((node: Node) => node.label).sort().join(", ") + "}";
    }

    const startNode = getStart(graph);

    const setToId = (subset: Node[], i: number) => (subset.length === 1 && subset[0].id === startNode.id ? 0 : i + 1);

    const alphabet = getAlphabet(graph);

    const keymap = new Map<string, number>();

    const subsets = getAllSubsets(graph.nodes);
    const powerNodes: Node[] =
        subsets.map((subset: Node[], i: number) => {
            const key = setToId(subset, i);
            keymap.set(subset.map((node: Node) => node.id).sort().join(" "), key);
            return {
                id: key,
                label: powerName(subset),
                isAccepting: subset.some((node: Node) => node.isAccepting),
            };
        });

    console.log("powerNodes", powerNodes);
    console.log("alphabet", alphabet);

    const powerLinks: Link[] = [];
    subsets.forEach((subset: Node[]) => {
        const from = keymap.get(subset.map((node: Node) => node.id).sort().join(" "))!;
        alphabet.forEach((symbol: string) => {
            const nextStates = nextState(graph, subset, symbol);
            const to = keymap.get(nextStates.map((node: Node) => node.id).sort().join(" "))!;
            // if (keymap.get(nextStates.map((node: Node) => node.id).sort().join(" ")) == undefined) {
            //     console.log("nextStates", nextStates);
            //     console.log("to", to);
            // }
            powerLinks.push({ from: from, to: to, label: symbol });
        });
    });

    console.log("powerlinks", powerLinks);

    return { nodes: powerNodes, links: powerLinks };
}


// TODO: make atomic links
// TODO: handle epsilon transitions
// TODO: split technical functions from this file
