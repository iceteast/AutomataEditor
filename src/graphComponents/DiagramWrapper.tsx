import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import * as React from 'react';
import { nodeColor, nodeHighlightColor, nodeShape } from '../Const';

import './Diagram.css';

interface DiagramProps {
  nodeDataArray: Array<go.ObjectData>;
  linkDataArray: Array<go.ObjectData>;
  modelData: go.ObjectData;
  skipsDiagramUpdate: boolean;
  onDiagramEvent: (e: go.DiagramEvent) => void;
  onModelChange: (e: go.IncrementalData) => void;
  // highlightedNodes: Set<number>
}


// var GeneratorEllipseSpot1 = new go.Spot(0.156, 0.156);
// var GeneratorEllipseSpot2 = new go.Spot(0.844, 0.844);
var KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);

// HalfEllipse, Cylinder1
// https://github.com/NorthwoodsSoftware/GoJS/blob/master/extensionsTS/Figures.ts


function addEllipse(geo: go.Geometry, w: number, h: number, ew: number, eh: number) {
  const ox = (ew - w) / 2;
  const oy = (eh - h) / 2;
  return geo
    .add(new go.PathFigure(-ox, h / 2, true)
      .add(new go.PathSegment(go.PathSegment.Bezier, w + ox, h / 2, -ox, -oy, w + ox, -oy))
      .add(new go.PathSegment(go.PathSegment.Bezier, -ox, h / 2, w + ox, h + oy, -ox, h + oy))
    );
}

go.Shape.defineFigureGenerator("StartNodeCircle", function (shape, w, h) {
  const eW = w * 3 / 2;
  const eH = h * 4 / 2;
  const oX = (eW - w) / 2;
  const oY = (eH - h) / 2;
  var geo = new go.Geometry();
  geo = addEllipse(geo, w, h, eW, eH);
  geo = geo
    .add(new go.PathFigure(-oX, h / 2, true)
      .add(new go.PathSegment(go.PathSegment.Line, -oX - h / 3, h / 3))
      .add(new go.PathSegment(go.PathSegment.Line, -oX, h / 2))
      .add(new go.PathSegment(go.PathSegment.Line, -oX - h / 3, 2 * h / 3))
      .add(new go.PathSegment(go.PathSegment.Line, -oX, h / 2))
      .add(new go.PathSegment(go.PathSegment.Line, -oX - h / 2, h / 2))
    );
  return geo;
});

go.Shape.defineFigureGenerator("Ellipse_final", function (shape, w, h) {
  var geo = new go.Geometry();
  geo = addEllipse(geo, w, h, w * 3 / 2, h * 2);
  geo = addEllipse(geo, w, h, w, h * 3 / 2);
  return geo;
});

go.Shape.defineFigureGenerator("Ellipse", function (shape, w, h) {
  var geo = new go.Geometry();
  geo = addEllipse(geo, w, h, w * 3 / 2, h * 2);
  return geo;
});


go.Shape.defineFigureGenerator("StartNodeCircle_final", function (shape, w, h) {
  const eW = w * 3 / 2;
  const eH = h * 4 / 2;
  const oX = (eW - w) / 2;
  const oY = (eH - h) / 2;

  // const w2 = w;
  // const h2 = h;
  // const eW2 = w2;
  // const eH2 = h2;
  // const oX2 = (eW2 - w) / 2;
  // const oY2 = (eH2 - h) / 2;
  var geo = new go.Geometry();
  // .add(new go.PathFigure(-oX, h / 2, true)
  //   .add(new go.PathSegment(go.PathSegment.Bezier, w + oX, h / 2, -oX, -oY, w + oX, -oY))
  //   .add(new go.PathSegment(go.PathSegment.Bezier, -oX, h / 2, w + oX, h + oY, -oX, h + oY))
  // )
  // .add(new go.PathFigure(-oX2, h2 / 2, true)
  //   .add(new go.PathSegment(go.PathSegment.Bezier, w2 + oX2, h2 / 2, -oX2, -oY2, w2 + oX2, -oY2))
  //   .add(new go.PathSegment(go.PathSegment.Bezier, -oX2, h2 / 2, w2 + oX2, h2 + oY2, -oX2, h2 + oY2))
  // )
  geo = addEllipse(geo, w, h, eW, eH);
  geo = addEllipse(geo, w, h, w, h * 3 / 2);
  geo = geo
    .add(new go.PathFigure(-oX, h / 2, true)
      .add(new go.PathSegment(go.PathSegment.Line, -oX - h / 3, h / 3))
      .add(new go.PathSegment(go.PathSegment.Line, -oX, h / 2))
      .add(new go.PathSegment(go.PathSegment.Line, -oX - h / 3, 2 * h / 3))
      .add(new go.PathSegment(go.PathSegment.Line, -oX, h / 2))
      .add(new go.PathSegment(go.PathSegment.Line, -oX - h / 2, h / 2))
    );
  return geo;
});
go.Shape.defineFigureGenerator("StartNodeRectangle", function (shape, w, h) {
  var param1 = shape ? shape.parameter1 : NaN;
  if (isNaN(param1) || param1 < 0) param1 = 5;  // default corner
  param1 = Math.min(param1, w / 3);
  param1 = Math.min(param1, h / 3);

  var cpOffset = param1 * KAPPA;
  // var geo = new go.Geometry(go.Geometry.Ellipse)
  var geo = new go.Geometry()
    // Rounded rectangle
    .add(new go.PathFigure(param1, 0, true)
      .add(new go.PathSegment(go.PathSegment.Line, w - param1, 0))
      .add(new go.PathSegment(go.PathSegment.Bezier, w, param1, w - cpOffset, 0, w, cpOffset))
      .add(new go.PathSegment(go.PathSegment.Line, w, h - param1))
      .add(new go.PathSegment(go.PathSegment.Bezier, w - param1, h, w, h - cpOffset, w - cpOffset, h))
      .add(new go.PathSegment(go.PathSegment.Line, param1, h))
      .add(new go.PathSegment(go.PathSegment.Bezier, 0, h - param1, cpOffset, h, 0, h - cpOffset))
      .add(new go.PathSegment(go.PathSegment.Line, 0, param1))
      .add(new go.PathSegment(go.PathSegment.Bezier, param1, 0, 0, cpOffset, cpOffset, 0).close()))
    .add(new go.PathFigure(0, h / 2, true)
      .add(new go.PathSegment(go.PathSegment.Line, -w / 3, 0))
      .add(new go.PathSegment(go.PathSegment.Line, -w / 3, h))
      .add(new go.PathSegment(go.PathSegment.Line, 0, h / 2))
    );
  if (cpOffset > 1) {
    geo.spot1 = new go.Spot(0, 0, cpOffset, cpOffset);
    geo.spot2 = new go.Spot(1, 1, -cpOffset, -cpOffset);
  }
  return geo;
});

const doubleStrokePattern = new go.Shape({
  geometryString: `M 0 0 L 1 0 
        M 0 11 L 1 11
  `,
  fill: "transparent",
  stroke: "green",
  strokeCap: "square",
});


export class DiagramWrapper extends React.Component<DiagramProps, {}> {
  /**
   * Ref to keep a reference to the Diagram component, which provides access to the GoJS diagram via getDiagram().
   */
  private diagramRef: React.RefObject<ReactDiagram>;

  /** @internal */
  constructor(props: DiagramProps) {
    super(props);
    this.diagramRef = React.createRef();
  }

  /**
   * Get the diagram reference and add any desired diagram listeners.
   * Typically the same function will be used for each listener, with the function using a switch statement to handle the events.
   */
  public componentDidMount() {
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (diagram instanceof go.Diagram) {
      diagram.addDiagramListener('ChangedSelection', this.props.onDiagramEvent);
    }
  }

  /**
   * Get the diagram reference and remove listeners that were added during mounting.
   */
  public componentWillUnmount() {
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (diagram instanceof go.Diagram) {
      diagram.removeDiagramListener('ChangedSelection', this.props.onDiagramEvent);
    }
  }

  // private checkNode(key: number) {
  //   return this.props.highlightedNodes.has(key) ? nodeHighlightColor : nodeColor;
  // }

  /**
   * Diagram initialization method, which is passed to the ReactDiagram component.
   * This method is responsible for making the diagram and initializing the model, any templates,
   * and maybe doing other initialization tasks like customizing tools.
   * The model's data should not be set here, as the ReactDiagram component handles that.
   */
  private initDiagram(): go.Diagram {
    const $ = go.GraphObject.make;
    // set your license key here before creating the diagram: go.Diagram.licenseKey = "...";


    const diagram =
      $(go.Diagram,
        {
          'undoManager.isEnabled': true,  // must be set to allow for model change listening
          'clickCreatingTool.archetypeNodeData': { text: 'new node', color: nodeColor, final: false },
          layout: $(go.ForceDirectedLayout),
          model: $(go.GraphLinksModel,
            {
              linkKeyProperty: 'key',  // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
              // positive keys for nodes
              makeUniqueKeyFunction: (m: go.Model, data: any) => {
                let k = data.key || 1;
                while (m.findNodeDataForKey(k)) k++;
                data.key = k;
                return k;
              },
              // negative keys for links
              makeUniqueLinkKeyFunction: (m: go.GraphLinksModel, data: any) => {
                let k = data.key || -1;
                while (m.findLinkDataForKey(k)) k--;
                data.key = k;
                return k;
              }
            })
        });

    // define a simple Node template
    diagram.nodeTemplate =
      $(go.Node, 'Auto',  // the Shape will go around the TextBlock
        {
          contextClick: (e, obj) => {
            if (obj.part) {
              var data = obj.part.data;
              diagram.model.commit((m) => {
                m.set(data, 'final', !data.final);
              }, "toggle final");
            }
          },
        },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        new go.Binding('deletable').makeTwoWay(),
        // Alternative for double shape (instead of outline)
        // $(go.Shape, 'RoundedRectangle',
        //   {
        //     name: 'SHAPE2', fill: 'white', strokeWidth: 2,
        //     portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
        //     toLinkableSelfNode: true, fromLinkableSelfNode: true,
        //     toLinkableDuplicates: true, fromLinkableDuplicates: true
        //   },
        // ),
        // new go.Binding('fill', 'color')),

        $(go.Shape,
          {
            // figure: 'RoundedRectangle',
            figure: nodeShape,

            //           geometryString: `F M 0 0 L 1 0 
            //       L 0 5 L 1 5
            // `,

            name: 'SHAPE', fill: 'white', strokeWidth: 2,
            portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
            toLinkableSelfNode: true, fromLinkableSelfNode: true,
            toLinkableDuplicates: true, fromLinkableDuplicates: true
          },
          new go.Binding('fill', 'color'),
          // new go.Binding('fill', 'key', (key) => { return this.props.highlightedNodes.has(key) ? nodeHighlightColor : nodeColor; }),
          // new go.Binding('fill', 'key', this.checkNode),
          // new go.Binding('figure').makeTwoWay(),
          new go.Binding('figure', '', (node: any) =>
            (node.figure ? node.figure : nodeShape)
            + (node.final ? '_final' : '')
          )),
        // new go.Binding('pathPattern', 'final', (final: boolean) => final ? doubleStrokePattern : null)),
        $(go.TextBlock,
          { margin: 8, editable: true, font: '400 .875rem Roboto, sans-serif' },  // some room around the text
          new go.Binding('text').makeTwoWay()
        )
      );

    // relinking depends on modelData
    diagram.linkTemplate =
      $(go.Link,
        {
          doubleClick: (e, obj) => {
            var tb = obj.part?.findObject("TEXT");
            if (tb) {
              e.diagram.commandHandler.editTextBlock(tb as go.TextBlock);
            }
          },
          // routing: go.Link.Normal,
          curve: go.Link.Bezier
          // curve: go.Link.JumpOver
        },
        new go.Binding('relinkableFrom', 'canRelink').ofModel(),
        new go.Binding('relinkableTo', 'canRelink').ofModel(),
        $(go.Shape),
        $(go.Shape, { toArrow: 'Standard' }),
        $(go.TextBlock,
          {
            name: "TEXT",
            // alignmentFocus: new go.Spot(0, 1, -1, 0),
            alignmentFocus: new go.Spot(0, 1, -4, 0),
            editable: true,
            // stroke: "black"
          },
          new go.Binding("text").makeTwoWay(),  // TwoWay due to user editing with TextEditingTool
          new go.Binding("stroke", "color")),
      );

    return diagram;
  }

  public render() {
    return (
      <ReactDiagram
        ref={this.diagramRef}
        divClassName='diagram-component'
        style={{ backgroundColor: '#eee' }}
        initDiagram={this.initDiagram}
        nodeDataArray={this.props.nodeDataArray}
        linkDataArray={this.props.linkDataArray}
        modelData={this.props.modelData}
        onModelChange={this.props.onModelChange}
        skipsDiagramUpdate={this.props.skipsDiagramUpdate}
      />
    );
  }
}
