import { ascii, epsilon, separator } from "./Const";
import { Graph, Link, Node } from "./Interfaces";


export function labelAcceptsSymbol(symbol: string, label: string | undefined): boolean {
    // if (label === "") {
    //     return true;
    // }
    if (label === undefined) {
        return false;
    }
    // if (label === undefined) {
    //     return true;
    // }
    // now the separator is valid regex
    // if (label.includes(separator) && label !== separator) {
    //     const labels = label.split(separator);
    //     return labels.includes(symbol);
    // }

    // return label === symbol;
    // use label as regex
    return new RegExp(label).test(symbol);
}

export function closeStateEpsilon(graph: Graph, state: Node[]): Node[] {
    const newStates: Node[] = [];
    state.forEach((node: Node) => {
        const links = graph.links.filter((link: Link) => link.from === node.id);
        links.forEach((link: Link) => {
            // console.log("link", link);
            if (isEpsilon(link.label)) {
                const target = graph.nodes.find((n: Node) => n.id === link.to);
                if (target) {
                    newStates.push(target);
                }
            }
        });
    });
    return unique(state.concat(newStates));
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
    return closeStateEpsilon(graph, nextStates);
    // return nextStates;
}

export function getStart(graph: Graph): Node {
    return graph.nodes.find((node: Node) => node.id === 0)!;
}

export function getStartNodes(graph: Graph): Node[] {
    return closeStateEpsilon(graph, [getStart(graph)]);
}

export function checkWord(graph: Graph, word: string): boolean {
    try {
        let currentNodes = getStartNodes(graph);
        // console.log("checkWord", word);
        // console.log(" start", startNode);
        for (let i = 0; i < word.length; i++) {
            var sym = word[i];
            currentNodes = nextState(graph, currentNodes, sym);
            // console.log(" after ", sym, ":", currentNodes);
        }
        return currentNodes.some((node) => node.isAccepting);
    } catch (e) {
        console.log(e);
        return false;
    }
}

export function getReachableGraph(graph: Graph) {
    const reachableNodeIds = new Set<Number>();
    // does not matter if getStart or getStartNodes
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




function isEpsilon(label: string | undefined) {
    return label === undefined || label === "" || label === "ε" || label === "epsilon";
}




export function getAlphabet(graph: Graph) {
    const alphabet = new Set<string>();
    // TODO: make regex links atomic (or all links)
    graph.links.forEach((link: Link) => {
        if (!isEpsilon(link.label)) {
            // alphabet.add(link.label);


            // if (link.label === ";") {
            //     alphabet.add(";");
            // } else {
            //     link.label.split(";").forEach((symbol: string) => {
            //         if (symbol.length > 0) {
            //             alphabet.add(symbol);
            //         }
            //     });
            // }

            const matches = ascii.match(new RegExp(link.label, "g"));
            if (matches) {
                matches.forEach((symbol: string) => {
                    for (let i = 0; i < symbol.length; i++) {
                        alphabet.add(symbol[i]);
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

function unique(array: any[]) {
    return array.filter((item, index, arr) => arr.indexOf(item) === index);
}

export function getPowerGraph(graph: Graph) {
    const powerName = (nodes: Node[]) => {
        return "{" + nodes.map((node: Node) => node.label).sort().join(", ") + "}";
    }

    const nodeSetIdx = (nodes: Node[]) => {
        return unique(nodes.map((node: Node) => node.id)).sort().join(" ");
    }

    const startNode = getStart(graph);

    const setToId = (subset: Node[], i: number) => (subset.length === 1 && subset[0].id === startNode.id ? 0 : i + 1);

    const alphabet = getAlphabet(graph);

    const keymap = new Map<string, number>();

    const subsets = getAllSubsets(graph.nodes);
    const powerNodes: Node[] =
        subsets.map((subset: Node[], i: number) => {
            const key = setToId(subset, i);
            keymap.set(nodeSetIdx(subset), key);
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
        const from = keymap.get(nodeSetIdx(subset))!;
        alphabet.forEach((symbol: string) => {
            const nextStates = nextState(graph, subset, symbol);
            const to = keymap.get(nodeSetIdx(nextStates))!;
            if (keymap.get(nodeSetIdx(nextStates)) === undefined) {
                console.log("nextStates", nextStates);
                console.log("to", to);
            }
            powerLinks.push({ from: from, to: to, label: symbol });
        });
    });

    console.log("powerlinks", powerLinks);

    return { nodes: powerNodes, links: powerLinks };
}


export function toLatex(graph: Graph) {

    const quoteLabel = (label: string) => {
        return label.replace(/_/g, "\\_").replace(/#/g, "\\#").replace("{", "\\{").replace("}", "\\}");
    }

    let str = `\\documentclass {article}

\\usepackage {tikz}
\\usetikzlibrary{automata,arrows}
\\usetikzlibrary {positioning}
\\begin {document}
\\begin {center}
\\begin {tikzpicture}[>=stealth',shorten >=1pt,auto,node distance=5 cm, scale = 1, transform shape, initial text={}]
`;
    // [-latex ,auto ,node distance =4 cm and 5cm ,on grid, semithick]
    str +=
        graph.nodes.map((node: Node) => {
            const pos = node.x && node.y ? `at (${(node.x / 50).toFixed(2)}, ${(node.y / 50).toFixed(2)})` : "";
            return `\\node[${node.id === 0 ? "initial, " : ""}state${node.isAccepting ? ", accepting" : ""}] ${pos} (${node.id}) {${quoteLabel(node.label)}};`;
        }
        ).join("\n");
    str += "\n";

    str +=
        graph.links.map((link: Link) =>
        // link.from + " -> " + link.to + " [label=\"" + link.label + "\"]"
        {
            const label = link.label ? `node {${quoteLabel(link.label)}}` : "";
            return `\\path (${link.from}) edge [${link.to === link.from ? "loop" : ""}] ${label} (${link.to});`;
        }
        ).join("\n");
    str += "\n";

    str += `\\end{tikzpicture}
\\end{center}
\\end{document}`;

    return str;
}

export function fiveTuple(graph: Graph) {
    const alphabet = Array.from(getAlphabet(graph));
    const start = getStart(graph);
    const accept = graph.nodes.filter((node: Node) => node.isAccepting);
    const states = graph.nodes;
    const transitions = graph.links;

    const labelById = (id: number) => {
        return states.find((node: Node) => node.id === id)!.label;
    }

    return `M=(Q,Σ,δ,q₀,F)
Q = {${states.map((node: Node) => node.label).join(", ")}}
Σ = {${alphabet.join(", ")}}
δ = {${transitions.map((link: Link) => `(${labelById(link.from)}, ${isEpsilon(link.label) ? epsilon : link.label}) -> ${labelById(link.to)}`).join(", ")}}
q₀ = ${start.label}
F = {${accept.map((node: Node) => node.label).join(", ")}}`;
}


// TODO: make atomic links

// TODO: login via cms (Discourse SSO) or github/google (OAuth)




