import React, { useCallback, useRef } from 'react';
import ReactFlow, {
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
    ReactFlowProvider,
    Connection,
    Position,
    updateEdge,
    MarkerType,
} from 'react-flow-renderer';
import FloatingConnectionLine from './FloatingConnectionLine';
import FloatingEdge from './FloatingEdge';

import './graph.css';
import TextUpdaterNode from './TextUpdaterNode';

const initialNodes = [
    {
        id: '0',
        type: 'input',
        data: { label: 'Node' },
        position: { x: 0, y: 50 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
    },
];

let id = 1;
const getId = () => `${id++}`;

const fitViewOptions = {
    padding: 3,
};

const edgeTypes = {
    floating: FloatingEdge,
};
const nodeTypes = { textUpdater: TextUpdaterNode };

const AddNodeOnEdgeDrop = () => {
    const reactFlowWrapper = useRef<any>(null);
    const connectingNodeId = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { project } = useReactFlow();
    // const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), []);
    const onConnect = useCallback(
        (params: any) =>
            setEdges((eds) =>
                addEdge({ ...params, type: 'floating', markerEnd: { type: MarkerType.Arrow } }, eds)
            ),
        [setEdges]
    );

    // gets called after end of edge gets dragged to another source or target
    const onEdgeUpdate = useCallback(
        (oldEdge: any, newConnection: any) => setEdges((els) => updateEdge(oldEdge, newConnection, els)),
        []
    );

    const onConnectStart = useCallback((_: any, { nodeId }: any) => {
        connectingNodeId.current = nodeId;
    }, []);

    const onConnectStop = useCallback(
        (event: any) => {
            const targetIsPane = event.target.classList.contains('react-flow__pane');

            if (targetIsPane) {
                // we need to remove the wrapper bounds, in order to get the correct position
                let wrapper = reactFlowWrapper.current;
                const { top, left } = wrapper.getBoundingClientRect();
                const id = getId();
                const newNode = {
                    id,
                    // we are removing the half of the node width (75) to center the new node
                    position: project({ x: event.clientX - left - 75, y: event.clientY - top }),
                    data: { label: `Node ${id}` },
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                    type: "textUpdater",
                };

                setNodes((nds) => nds.concat(newNode));
                setEdges((eds) =>
                    eds.concat({ id, source: connectingNodeId.current!, target: id })
                );
            }
        },
        [project]
    );

    return (
        <div className="wrapper" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onEdgeUpdate={onEdgeUpdate}
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectStop={onConnectStop}
                fitView
                fitViewOptions={fitViewOptions}

                nodeTypes={nodeTypes}
            // edgeTypes={edgeTypes}
            // connectionLineComponent={FloatingConnectionLine}
            />
        </div>
    );
};

export default () => (
    <ReactFlowProvider>
        <AddNodeOnEdgeDrop />
    </ReactFlowProvider>
);
