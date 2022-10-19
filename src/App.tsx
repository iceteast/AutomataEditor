import * as go from 'gojs';
import * as React from 'react';

import MenuIcon from '@mui/icons-material/Menu';
import RemoveIcon from '@mui/icons-material/Remove';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { DiagramWrapper } from './graphComponents/DiagramWrapper';
import { SelectionInspector } from './graphComponents/SelectionInspector';

import './App.css';
import { nodeColor } from './Const';
import Info from './components/Info';


function App() {

  const [nodeDataArray, setNodeDataArray] = React.useState<Array<go.ObjectData>>(
    [
      { key: 0, text: 'Start', color: nodeColor, loc: '0 0', deletable: false, figure: "StartNodeRectangle" },
    ]
  );
  const [linkDataArray, setLinkDataArray] = React.useState<Array<go.ObjectData>>(
    []
  );
  const [modelData, setModelData] = React.useState<go.ObjectData>(
    { canRelink: true }
  );
  const [selectedData, setSelectedData] = React.useState<go.ObjectData | null>(
    null
  );
  const [skipsDiagramUpdate, setSkipsDiagramUpdate] = React.useState<boolean>(
    false
  );

  var mapNodeKeyIdx: Map<go.Key, number> = new Map<go.Key, number>();
  var mapLinkKeyIdx: Map<go.Key, number> = new Map<go.Key, number>();

  const refreshNodeIndex = (nodeArr: Array<go.ObjectData>) => {
    mapNodeKeyIdx.clear();
    nodeArr.forEach((n: go.ObjectData, idx: number) => {
      mapNodeKeyIdx.set(n.key, idx);
    });
  }

  const refreshLinkIndex = (linkArr: Array<go.ObjectData>) => {
    mapLinkKeyIdx.clear();
    linkArr.forEach((l: go.ObjectData, idx: number) => {
      mapLinkKeyIdx.set(l.key, idx);
    });
  }

  // only once?
  refreshNodeIndex(nodeDataArray);
  refreshLinkIndex(linkDataArray);

  const handleDiagramEvent = (e: go.DiagramEvent) => {
    const name = e.name;
    switch (name) {
      case 'ChangedSelection': {
        const sel = e.subject.first();
        if (sel) {
          if (sel instanceof go.Node) {
            const idx = mapNodeKeyIdx.get(sel.key);
            if (idx !== undefined && idx >= 0) {
              setSelectedData(nodeDataArray[idx]);
            }
          } else if (sel instanceof go.Link) {
            const idx = mapLinkKeyIdx.get(sel.key);
            if (idx !== undefined && idx >= 0) {
              setSelectedData(linkDataArray[idx]);
            }
          }
        } else {
          setSelectedData(null);
        }
        break;
      }
      default: break;
    }
  }


  const handleModelChange = (obj: go.IncrementalData) => {
    const insertedNodeKeys = obj.insertedNodeKeys;
    const modifiedNodeData = obj.modifiedNodeData;
    const removedNodeKeys = obj.removedNodeKeys;
    const insertedLinkKeys = obj.insertedLinkKeys;
    const modifiedLinkData = obj.modifiedLinkData;
    const removedLinkKeys = obj.removedLinkKeys;
    const modifiedModelData = obj.modelData;

    // maintain maps of modified data so insertions don't need slow lookups
    const modifiedNodeMap = new Map<go.Key, go.ObjectData>();
    const modifiedLinkMap = new Map<go.Key, go.ObjectData>();
    let narr = nodeDataArray;
    if (modifiedNodeData) {
      modifiedNodeData.forEach((nd: go.ObjectData) => {
        modifiedNodeMap.set(nd.key, nd);
        const idx = mapNodeKeyIdx.get(nd.key);
        if (idx !== undefined && idx >= 0) {
          narr[idx] = nd;
          if (selectedData && selectedData.key === nd.key) {
            setSelectedData(nd);
          }
        }
      });
    }
    if (insertedNodeKeys) {
      insertedNodeKeys.forEach((key: go.Key) => {
        const nd = modifiedNodeMap.get(key);
        const idx = mapNodeKeyIdx.get(key);
        if (nd && idx === undefined) {  // nodes won't be added if they already exist
          mapNodeKeyIdx.set(nd.key, narr.length);
          narr.push(nd);
        }
      });
    }
    if (removedNodeKeys) {
      narr = narr.filter((nd: go.ObjectData) => {
        if (removedNodeKeys.includes(nd.key)) {
          return false;
        }
        return true;
      });
      setNodeDataArray(narr);
      refreshNodeIndex(narr);
    }

    let larr = linkDataArray;
    if (modifiedLinkData) {
      modifiedLinkData.forEach((ld: go.ObjectData) => {
        modifiedLinkMap.set(ld.key, ld);
        const idx = mapLinkKeyIdx.get(ld.key);
        if (idx !== undefined && idx >= 0) {
          larr[idx] = ld;
          if (selectedData && selectedData.key === ld.key) {
            setSelectedData(ld);
          }
        }
      });
    }
    if (insertedLinkKeys) {
      insertedLinkKeys.forEach((key: go.Key) => {
        const ld = modifiedLinkMap.get(key);
        const idx = mapLinkKeyIdx.get(key);
        if (ld && idx === undefined) {  // links won't be added if they already exist
          mapLinkKeyIdx.set(ld.key, larr.length);
          larr.push(ld);
        }
      });
    }
    if (removedLinkKeys) {
      larr = larr.filter((ld: go.ObjectData) => {
        if (removedLinkKeys.includes(ld.key)) {
          return false;
        }
        return true;
      });
      setLinkDataArray(larr);
      refreshLinkIndex(larr);
    }
    // handle model data changes, for now just replacing with the supplied object
    if (modifiedModelData) {
      setModelData(modifiedModelData);
    }
    setSkipsDiagramUpdate(true); // the GoJS model already knows about these updates
  }


  const handleInputChange = (path: string, value: string, isBlur: boolean) => {
    const data = selectedData as go.ObjectData;  // only reached if selectedData isn't null
    data[path] = value;
    if (isBlur) {
      const key = data.key;
      if (key < 0) {  // negative keys are links
        const idx = mapLinkKeyIdx.get(key);
        if (idx !== undefined && idx >= 0) {
          linkDataArray[idx] = data;
          setSkipsDiagramUpdate(false);
        }
      } else {
        const idx = mapNodeKeyIdx.get(key);
        if (idx !== undefined && idx >= 0) {
          nodeDataArray[idx] = data;
          setSkipsDiagramUpdate(false);
        }
      }
    }
  }


  // TODO: handleRelinkChange for insepector

  let inspector;
  if (selectedData !== null) {
    inspector = <SelectionInspector
      selectedData={selectedData}
      onInputChange={handleInputChange}
    />;
  }

  const [singleMulti, setSingleMulti] = React.useState<string>('single');

  const handleSingleMultiChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string | null,
  ) => {
    if (newValue && newValue !== singleMulti)
      setSingleMulti(newValue);
  };

  return (
    <div className='app'>
      <DiagramWrapper
        nodeDataArray={nodeDataArray}
        linkDataArray={linkDataArray}
        modelData={modelData}
        skipsDiagramUpdate={skipsDiagramUpdate}
        onDiagramEvent={handleDiagramEvent}
        onModelChange={handleModelChange}
      />
      <Info />
      <div className='mainButtonBar'>
        <ToggleButtonGroup
          value={singleMulti}
          exclusive
          onChange={handleSingleMultiChange}
          aria-label="text alignment"
        >
          <ToggleButton value="single" aria-label="left aligned">
            <RemoveIcon />
          </ToggleButton>
          <ToggleButton value="multi" aria-label="centered">
            <MenuIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      {/* {inspector} */}
    </div>
  );

}

export default App;
