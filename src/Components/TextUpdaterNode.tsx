import { useCallback } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import './TextUpdaterNode.css';

const handleStyle = { left: 10 };

function TextUpdaterNode({ data, isConnectable, sourcePosition, targetPosition }: any) {
    const onChange = useCallback((evt: any) => {
        console.log(evt.target.value);
    }, []);

    return (
        <>
            <Handle
                type="target"
                position={targetPosition}
                isConnectable={isConnectable}
            />
            {data.label && <div className="label-wrapper">{data.label}</div>}
            <Handle
                type="source"
                position={sourcePosition}
                isConnectable={isConnectable}
            />
        </>

        // <div className='react-flow__node'>
        //     <Handle type="target" position={Position.Left} />
        //     ABC
        //     <Handle type="source" position={Position.Right} id="b" />
        // </div>
        // <div className="text-updater-node">
        //     <Handle type="target" position={Position.Left} />
        //     <input id="text" name="text" onChange={onChange} />
        //     {/* <div>
        //         <label htmlFor="text">Text:</label>
        //         <input id="text" name="text" onChange={onChange} />
        //     </div> */}
        //     {/* <Handle type="source" position={Position.Bottom} id="a" style={handleStyle} /> */}
        //     <Handle type="source" position={Position.Right} id="b" />
        // </div>
    );
}

export default TextUpdaterNode;
