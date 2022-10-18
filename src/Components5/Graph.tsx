import React from 'react';
import {
    Graph,
    GraphState,
} from 'react-graph-editor';

function Editor() {
    const [state, setState] = React.useState<any>(
        GraphState.createEmpty()
    );

    return (
        <Graph
            value={state}
            onChange={setState}
        />
    );
}
// const state = {
//     graph: GraphState.createEmpty()
// };

// class Editor extends React.Component {
//     constructor(props: any) {
//         super(props);
//         this.state = { graph: GraphState.createEmpty() };
//         this.onChange = (graph: any) => this.setState({ graph });
//     }

//     render() {
//         const { graph } = this.state;
//         return <Graph value={graph} onChange={this.onChange} />;
//     }
// }

export default Editor;