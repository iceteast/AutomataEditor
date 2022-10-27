import { ascii, epsilon, separator } from "./Const";
import { Graph, Link, Node } from "./Interfaces";
import { toRegex } from "./RegEx/regex";
import { State } from "./RegEx/state";
// import { DFA } from "./RegEx2/DFS";
import regParser from "automata.js";

// import DFA from "regex-to-dfa";

export function labelAcceptsSymbol(symbol: string, label: string | undefined): boolean {
    // if (label === "") {
    //     return true;
    // }
    if (label === undefined) {
        return false;
    }
    if (label.trim() === separator) {
        return symbol === separator;
    }
    const labels = label.split(separator).map(s => s.trim());
    return labels.includes(symbol);
    // use label as regex
    // return new RegExp(label).test(symbol);
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

            // TODO: or allow combined symbols (need adaptation of simulation)
            Array.from(ascii).filter(c => labelAcceptsSymbol(c, link.label)).forEach((c) => alphabet.add(c));

            // if (link.label === ";") {
            //     alphabet.add(";");
            // } else {
            //     link.label.split(";").forEach((symbol: string) => {
            //         if (symbol.length > 0) {
            //             alphabet.add(symbol);
            //         }
            //     });
            // }

            // const matches = ascii.match(new RegExp(link.label, "g"));
            // if (matches) {
            //     matches.forEach((symbol: string) => {
            //         for (let i = 0; i < symbol.length; i++) {
            //             alphabet.add(symbol[i]);
            //         }
            //     });
            // }
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

    const newStart = closeStateEpsilon(graph, [startNode]);

    const isNewStart = (nodes: Node[]) => {
        return nodeSetIdx(nodes) === nodeSetIdx(newStart);
    };

    const setToId = (subset: Node[], i: number) => (isNewStart(subset) ? 0 : i + 1);

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
        return label.replace(/_/g, "\\_").replace(/#/g, "\\#").replaceAll("{", "\\{").replaceAll("}", "\\}");
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
            const label = link.label ? `node {${quoteLabel(isEpsilon(link.label) ? "$\\varepsilon$" : link.label)}}` : "";
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



export function toRegEx(graph: Graph) {
    // we use javascript regex notation
    // conversion algorithmus: Arden's rule (not the one from the script)
    // both algorithms are equivalent and quite similar (you can even transform one into the other by reordering (commutativity + associativity) of the proof steps)
    // Reference: https://cs.stackexchange.com/a/2392

    // used library: https://github.com/devongovett/regexgen


    // expects DFA

    const stateMap = new Map<Number, State>();
    const start = getStart(graph);

    const labelToRegex = (label: string) => {
        if (isEpsilon(label)) {
            return epsilon;
        }
        if (label.trim() !== separator) {
            return label.replaceAll(separator, "|");
        }
    }

    graph.nodes.forEach((node: Node) => {
        const state = new State();
        state.accepting = node.isAccepting;
        stateMap.set(node.id, state);
    });

    graph.links.forEach((link: Link) => {
        const from = stateMap.get(link.from)!;
        const to = stateMap.get(link.to)!;
        from.transitions.set(labelToRegex(link.label), to);
    });

    console.log("stateMap", stateMap.get(start.id)!);

    const regex = toRegex(stateMap.get(start.id)!, "");
    return regex;
    // return "";
}


export function ofRegEx(regex: string) {
    // used library: https://github.com/hokein/Automata.js

    var parser = new regParser.RegParser(regex);
    var fsm = parser.parseToDFA();

    console.log("dfa", fsm);

    const numToId = new Map();

    const nodes = [];
    for (let i = 0; i < fsm.numOfStates; i++) {
        const i_str = i.toString();
        const id =
            fsm.initialState === i_str ? 0 :
                i + 1;
        numToId.set(i_str, id);
        const label = i_str;
        const isAccepting = fsm.acceptStates.includes(i_str);
        nodes.push({ id: id, label: label, isAccepting: isAccepting });
    }

    const links = [];

    for (var from_id in fsm.transitions) {
        for (var to_id in fsm.transitions[from_id]) {
            const from = numToId.get(from_id)!;
            const to = numToId.get(to_id)!;
            const label = fsm.transitions[from_id][to_id];
            links.push({ from: from, to: to, label: label });
            // transitionDotScript += '  ' + [from_id] + '->' + to_id + ' [label="' +
            //     escapeCharacter(fsm.transitions[from_id][to_id]) + '"];\n';
        }
    }

    console.log("nodes", nodes);
    console.log("links", links);

    // used library: https://github.com/Thijsvanede/dfa#readme

    // const dfa = new DFA(new RegExp(regex), "I");

    // console.log(dfa);
    // console.log(dfa.initial);
    // return undefined;

    return { nodes: nodes, links: links };
}

function nameFromId(graph: Graph, id: number) {
    return graph.nodes.find((node: Node) => node.id === id)!.label;
}

function fullDFA(graph: Graph) {
    return getReachableGraph(getPowerGraph(graph));
}


// TODO: debug
export function minimize(graph: Graph) {
    // Hopcroft's algorithm

    graph = fullDFA(graph);
    graph.nodes = graph.nodes.map((node: Node) => { return { ...node, label: node.label.substring(1, node.label.length - 1) } });

    const alphabet = Array.from(getAlphabet(graph));
    const start = getStart(graph);

    const T: Set<string> = new Set();
    const L: [number, number][] = [];
    graph.nodes.forEach((node: Node) => {
        graph.nodes.forEach((node2: Node) => {
            if (node.id === start.id) return;
            if (node.id < node2.id) {
                return;
            }
            if (node.isAccepting !== node2.isAccepting) {
                L.push([node.id, node2.id]);
            } else {
                T.add(node.id.toString() + ", " + node2.id.toString());
            }
        });
    });

    while (L.length > 0) {
        const [a, b] = L.pop()!;
        console.log("look at distinguished pair", nameFromId(graph, a), nameFromId(graph, b));
        for (const c of alphabet) {
            const prev_a = graph.links.filter((link: Link) => link.to === a && link.label === c).map((link: Link) => link.from);
            const prev_b = graph.links.filter((link: Link) => link.to === b && link.label === c).map((link: Link) => link.from);
            for (const x of prev_a) {
                for (const y of prev_b) {
                    console.log("  found prev", nameFromId(graph, x), nameFromId(graph, y));
                    const pair = x.toString() + ", " + y.toString();
                    if (T.has(pair)) {
                        console.log("  found distinguished", nameFromId(graph, x), nameFromId(graph, y));
                        T.delete(pair);
                        L.push([x, y]);
                    }
                }
            }
        }
    }


    graph.nodes.forEach((node: Node) => {
        const pair = node.id.toString() + ", " + node.id.toString();
        if (T.has(pair)) {
            T.delete(pair);
        }
    });

    console.log("T", T);

    const nodes = graph.nodes.filter((node: Node) => {
        for (const s of Array.from(T)) {
            if (s.startsWith(node.id.toString() + ", ")) {
                return false;
            }
        }
        return true;
    });

    const links = graph.links.filter((link: Link) => {
        for (const s of Array.from(T)) {
            if (s.startsWith(link.from.toString() + ", ")) {
                return false;
            }
        }
        return true;
    }
    ).map((link: Link) => {
        for (const s of Array.from(T)) {
            if (s.startsWith(link.to.toString() + ", ")) {
                const b = parseInt(s.split(", ")[1]);
                return {
                    ...link,
                    to: b
                } as Link;
            }
        }
        return link;
    });

    return { nodes: nodes, links: links };
    // console.log("nodes", nodes);
    // console.log("links", links);

    // return undefined;

    // const (a, b) = L.pop()!;
    // for(const c of alphabet) {
    //     const x = graph.links.find((link: Link) => link.from === a && link.label === c);
    //     const y = graph.links.find((link: Link) => link.from === b && link.label === c);
    //     if(x && y) {
    //         const x_id = x.to;
    //         const y_id = y.to;
    //         if(!T.has([x_id, y_id])) {
    //             T.add([x_id, y_id]);
    //             L.push([x_id, y_id]);
    //         }
    //     }
    // }
}

function freshId(graph: Graph) {
    let id = 0;
    while (graph.nodes.find((node: Node) => node.id === id)) {
        id++;
    }
    return id;
}

export function reverseGraph(graph: Graph) {
    // Brzozowski's algorithm
    const start = getStart(graph);

    const oldStart = {
        ...start,
        id: freshId(graph),
        isAccepting: true
    };

    const newStart = {
        id: 0,
        label: "start",
        isAccepting: false
    };

    const nodes = [
        ...graph.nodes.filter((node: Node) => node.id !== start.id).map(
            (node: Node) => {
                return {
                    ...node,
                    isAccepting: false
                };
            }
        )
        , oldStart, newStart];

    const links = graph.links.map(
        (link: Link) => {
            const new_to = link.to === start.id ? oldStart.id : link.to;
            const new_from = link.from === start.id ? oldStart.id : link.from;
            return {
                ...link,
                to: new_to,
                from: new_from
            } as Link;
        })
        .map((link: Link) => {
            return {
                ...link,
                from: link.to,
                to: link.from
            } as Link;
        }).concat(
            graph.nodes.filter(node => node.isAccepting).map((node: Node) => {
                return {
                    from: newStart.id,
                    to: node.id === start.id ? oldStart.id : node.id,
                    label: epsilon
                } as Link;
            })
        );

    return { nodes: nodes, links: links };
}

function labelStr(link: Link) {
    return isEpsilon(link.label) ? epsilon : link.label;
}


export function graphToGrammar(graph: Graph) {
    // V non-terminals
    // Sigma terminals
    // P production 
    // S start symbol

    const V = "{" + graph.nodes.map((node: Node) => node.label).join(", ") + "}";
    const Sigma = "{" + Array.from(getAlphabet(graph)).join(", ") + "}";
    const start = getStart(graph);
    const S = start.label;
    const P =
        graph.nodes.map((node: Node) => {
            const links = graph.links.filter((link: Link) => link.from === node.id);
            const productions = links.map((link: Link) => {
                return labelStr(link) + " " + nameFromId(graph, link.to);
            }).concat(
                links.filter((link: Link) => graph.nodes.find((node: Node) => node.id === link.to && node.isAccepting)).map(labelStr)
            );
            return node.label + " -> " + productions.join(" | ") + (
                node.isAccepting && node.id === start.id ? " | " + epsilon : ""
            );
        }).join("\n");

    return ` L = (V, ${Sigma}, S, P) 
V = ${V}
Sigma = ${Sigma}
S = ${S}
P =
${P}
`

}




// TODO: make atomic links

// TODO: login via cms (Discourse SSO) or github/google (OAuth)


// TODO: make explicit where DFA is required (e.g. regex generation)
//   make DFA (temporary)
