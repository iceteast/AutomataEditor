import { nodeColor, startNodeShape } from "./Const";
import { Graph, Node, Link } from "./GraphUtils";

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
