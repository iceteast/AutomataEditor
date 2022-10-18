/*
*  Copyright (C) 1998-2022 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import * as React from 'react';

// import { GuidedDraggingTool } from '../GuidedDraggingTool';

import './Diagram.css';

interface DiagramProps {
  nodeDataArray: Array<go.ObjectData>;
  linkDataArray: Array<go.ObjectData>;
  modelData: go.ObjectData;
  skipsDiagramUpdate: boolean;
  onDiagramEvent: (e: go.DiagramEvent) => void;
  onModelChange: (e: go.IncrementalData) => void;
}


var KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
// go.Shape.setFigureParameter("RoundedRectangle", 0, new FigureParameter("CornerRounding", 5));
go.Shape.defineFigureGenerator("StartNode", function (shape, w, h) {  // predefined in 2.0
  var param1 = shape ? shape.parameter1 : NaN;
  if (isNaN(param1) || param1 < 0) param1 = 5;  // default corner
  param1 = Math.min(param1, w / 3);
  param1 = Math.min(param1, h / 3);

  var cpOffset = param1 * KAPPA;
  var geo = new go.Geometry()
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

function makePattern() {
  var patternCanvas = document.createElement('canvas');
  patternCanvas.width = 40;
  patternCanvas.height = 40;
  var pctx = patternCanvas.getContext('2d')!;

  // This creates a shape similar to a diamond leaf
  pctx.beginPath();
  pctx.moveTo(0.0, 40.0);
  pctx.lineTo(26.9, 36.0);
  pctx.bezierCurveTo(31.7, 36.0, 36.0, 32.1, 36.0, 27.3);
  pctx.lineTo(40.0, 0.0);
  pctx.lineTo(11.8, 3.0);
  pctx.bezierCurveTo(7.0, 3.0, 3.0, 6.9, 3.0, 11.7);
  pctx.lineTo(0.0, 40.0);
  pctx.closePath();
  pctx.fillStyle = "rgb(188, 222, 178)";
  pctx.fill();
  pctx.lineWidth = 0.8;
  pctx.strokeStyle = "rgb(0, 156, 86)";
  pctx.lineJoin = "miter";
  pctx.miterLimit = 4.0;
  pctx.stroke();

  return patternCanvas;
}
// go.Shape.defineFigureGenerator("Border", "RoundedRectangle");  // predefined in 2.0

const doubleStrokePattern = new go.Shape({
  geometryString: "M0 0 L1 0 M0 5 L1 5",
  fill: "transparent",
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
          // 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
          'clickCreatingTool.archetypeNodeData': { text: 'new node', color: 'lightblue', final: false },
          // draggingTool: (),  // defined in GuidedDraggingTool.ts
          // draggingTool: new go.DraggingTool(),  // defined in GuidedDraggingTool.ts
          // 'draggingTool.horizontalGuidelineColor': 'blue',
          // 'draggingTool.verticalGuidelineColor': 'blue',
          // 'draggingTool.centerGuidelineColor': 'green',
          // 'draggingTool.guidelineWidth': 1,
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
        // negate obj.part?.data.final
        {
          contextClick: (e, obj) => {
            if (obj.part) {
              // obj.part.data.final = !obj.part.data.final;
              var data = obj.part.data;
              diagram.model.commit((m) => {
                // var data = m.nodeDataArray.find((n) => n.key === obj.part!.data.key)
                m.set(data, 'final', !data.final);
              }, "toggle final");
              // console.log("Toggle final");
              // console.log(obj.part.data);
            }
          },
        },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        new go.Binding('deletable').makeTwoWay(),
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
          // $(go.Shape, 'Border',
          {
            figure: 'RoundedRectangle',
            name: 'SHAPE', fill: 'white', strokeWidth: 2,
            // stroke: 'white',
            // stroke: $(go.Brush, 'Pattern', { pattern: $(go.Shape, {geometryString:"M0 0 L1 0 M0 3 L1 3", fill:"transparent", color:"black", strokeWidth:2 })}),
            // stroke: $(go.Brush, 'Pattern', { pattern: makePattern() }),
            // pathPattern: doubleStrokePattern,
            // stroke: $(go.Brush, "Radial", { 0.0: "white", 1.0: "gray" }),
            // set the port properties:
            portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
            toLinkableSelfNode: true, fromLinkableSelfNode: true,
            toLinkableDuplicates: true, fromLinkableDuplicates: true
          },
          // Shape.fill is bound to Node.data.color
          new go.Binding('fill', 'color'),
          new go.Binding('figure').makeTwoWay(),
          new go.Binding('pathPattern', 'final', (final: boolean) => final ? doubleStrokePattern : null)),
        // new go.Binding('stro', 'color')),
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
            // console.log("double click");
            // console.log(obj.part);
            // console.log(obj.part?.findObject("TEXT"));
            // obj.
            // obj.part?.findObject("TEXT")?
            var tb = obj.part?.findObject("TEXT");
            if (tb) {
              e.diagram.commandHandler.editTextBlock(tb as go.TextBlock);
            }
          }
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
