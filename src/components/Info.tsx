import Collapsible from 'react-collapsible';
import { separator } from '../Const';
import './Info.css';

function Info() {
    return (
        <div className="info">
            <Collapsible trigger="Usage">
                <p>
                    <ul>
                        <li>Double click to create a new state</li>
                        <li>Drag and drop in the middle to move a node</li>
                        <li>Double click a label to edit it</li>
                        <li>Drag from an edge to create a link</li>
                        <li>Right click to mark a state as accepting</li>
                        <li>Double click or use F2 to give a label to a link</li>
                        <li>Either use multiple links or '{separator}' (e.g. "2{separator}3")</li>
                    </ul>
                </p>
            </Collapsible>
            {/* Undo,
            Groups,
            Zoom */}
        </div>
    );
};

export default Info;
