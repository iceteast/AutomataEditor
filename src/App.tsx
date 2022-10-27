import * as go from 'gojs';
import * as React from 'react';
// import { produce } from 'immer';
// import bcrypt from 'bcrypt';
import pbkdf2 from 'pbkdf2';
import axios from 'axios';

import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import TextField from '@mui/material/TextField';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import MenuIcon from '@mui/icons-material/Menu';
import SaveIcon from '@mui/icons-material/Save';
import BoltIcon from '@mui/icons-material/Bolt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import BackupIcon from '@mui/icons-material/Backup';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import RemoveIcon from '@mui/icons-material/Remove';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Icon } from '@iconify/react';

// import { CopyToClipboard } from 'react-copy-to-clipboard';
// import Copy from 'react-copy';
import CodeBlock from 'react-copy-code';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import Highlight from 'react-highlight';

import lzbase62 from 'lzbase62';
// import AmauiLZ77 from '@amaui/lz77';

import { DiagramWrapper } from './graphComponents/DiagramWrapper';
import { SelectionInspector } from './graphComponents/SelectionInspector';

import './App.css';
import { clouds, formats, nodeColor, nodeHighlightColor, pasteeeApiToken, pasteeePublicApiToken, pwd_hash, startNodeShape } from './Const';
import Info from './components/Info';
import { fiveTuple, getPowerGraph, getReachableGraph, graphToGrammar, minimize, ofRegEx, reverseGraph, toLatex, toRegEx } from './GraphUtils';
import { Cloud, CloudProvider, Format, Graph, Node as GraphNode } from "./Interfaces";
import Multi from './components/Multi';
import Single from './components/Single';
import createPersistedState from 'use-persisted-state';
import Button from '@mui/material/Button';
import { convertToGraph, updateModelWithGraph } from './GraphConversion';
import { ChangeEvent } from 'react';


function App() {

  const clearCacheData = () => {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
    localStorage.clear();
    // reload to take effect
    window.location.reload();
  };

  const [selectedNodes, setSelectedNodes] = React.useState<Set<number>>(new Set());

  const [nodeDataArray, setNodeDataArray] = createPersistedState<Array<go.ObjectData>>('nodeArray')(
    [
      // { key: 0, text: 'Start', color: nodeColor, deletable: false, figure: startNodeShape },
      { key: 0, text: 'Start', color: nodeColor, loc: '0 0', deletable: false, figure: startNodeShape },
    ]
  );
  const [linkDataArray, setLinkDataArray] = createPersistedState<Array<go.ObjectData>>('linkArray')(
    []
  );

  const [modelData, setModelData] = createPersistedState<go.ObjectData>('modelData')(
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
  // React.useEffect(() => {
  refreshNodeIndex(nodeDataArray);
  refreshLinkIndex(linkDataArray);
  // }, []);

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
    // let narr = [...nodeDataArray];
    // let narr = nodeDataArray.slice();
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
    // let larr = [...linkDataArray];
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


    setNodeDataArray(narr);
    refreshNodeIndex(narr);

    setLinkDataArray(larr);
    refreshLinkIndex(larr);


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
          // setSkipsDiagramUpdate(produce((_) => false));
        }
      } else {
        // const idx = mapNodeKeyIdx.get(key);
        const idx = nodeDataArray.findIndex((n: go.ObjectData) => n.key === key);
        if (idx !== undefined && idx >= 0) {
          nodeDataArray[idx] = data;
          setSkipsDiagramUpdate(false);
          // setSkipsDiagramUpdate(produce((_) => false));
        }
      }
    }
  }


  // const colorNodes = (nodes: GraphNode[]) => {
  //   // console.log("colorNodes", nodes, color);
  //   let changed = false;
  //   const narr = nodeDataArray.map((nd: go.ObjectData) => {
  //     const color = nodes.some((n: GraphNode) => n.id === nd.key) ? nodeHighlightColor : nodeColor;
  //     if (nd.color !== color) {
  //       changed = true;
  //       return { ...nd, color: color };
  //     }
  //     return nd;
  //   });
  //   // for (let i = 0; i < nodes.length; i++) {
  //   //   const idx = mapLinkKeyIdx.get(nodes[i].id);
  //   //   if (idx !== undefined && idx >= 0) {
  //   //     if (nodeDataArray[idx].color !== color) {
  //   //       nodeDataArray[idx].color = color;
  //   //       changed = true;
  //   //     }
  //   //   } else {
  //   //     console.log("colorNodes: node not found", nodes[i]);
  //   //   }
  //   //   // let node = nodes[i];
  //   //   // node.color = color;
  //   //   // if(node.children){
  //   //   //   colorNodes(node.children, color);
  //   //   // }
  //   // }
  //   if (changed) {
  //     console.log("colorNodes", nodes);
  //     // console.log("Changed");
  //     // console.log("old nodes array: ", nodeDataArray);
  //     // console.log("node array: ", narr);
  //     setNodeDataArray(narr);
  //     setSkipsDiagramUpdate(false);
  //   }
  // }


  // TODO: handleRelinkChange for insepector

  let inspector;
  if (selectedData !== null) {
    inspector = <SelectionInspector
      selectedData={selectedData}
      onInputChange={handleInputChange}
    />;
  }

  const [singleMulti, setSingleMulti] = createPersistedState<"single" | "multi">('singleMulti')('single');

  const handleSingleMultiChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: "single" | "multi",
  ) => {
    if (newValue && newValue !== singleMulti)
      setSingleMulti(newValue);
  };

  var graph = convertToGraph(nodeDataArray, linkDataArray);


  const cutUnreachableNodes = () => {
    if (!admin) {
      return;
    }
    const newGraph = getReachableGraph(graph);
    updateModelWithGraph(newGraph, setNodeDataArray, setLinkDataArray);
  };

  const powerAutomaton = () => {
    if (!admin) {
      return;
    }
    const newGraph = getPowerGraph(graph);
    updateModelWithGraph(newGraph, setNodeDataArray, setLinkDataArray);
  };

  const minimizeAutomaton = () => {
    if (!admin) {
      return;
    }
    const newGraph = minimize(graph);
    if (newGraph) {
      updateModelWithGraph(newGraph, setNodeDataArray, setLinkDataArray);
    }
  }

  const reverseAutomaton = () => {
    if (!admin) {
      return;
    }
    const newGraph = reverseGraph(graph);
    if (newGraph) {
      updateModelWithGraph(newGraph, setNodeDataArray, setLinkDataArray);
    }
  };

  // React.useEffect(() => {
  //   updateModelWithGraph(
  //     {
  //       nodes: [
  //         { id: 0, label: "Start", isAccepting: false },
  //         { id: 1, label: "A", isAccepting: true },
  //       ],
  //       links: [
  //         { from: 0, to: 1, label: "a" },
  //         { from: 1, to: 1, label: "b" },
  //       ],
  //     },
  //     setNodeDataArray,
  //     setLinkDataArray
  //   );
  // }, []);

  // const [formatStr, setFormatStr] = React.useState('');
  const [formatStr, setFormatStr] = createPersistedState<string>("format")('');
  const handleFormatChange = (event: SelectChangeEvent) => {
    setFormatStr(event.target.value as string);
  };
  const format = formats.find((f) => f.name === formatStr);

  const [cloudStr, setCloudStr] = createPersistedState<string>("cloud")('');
  const handleCloudChange = (event: SelectChangeEvent) => {
    setCloudStr(event.target.value as string);
  };
  const cloud = clouds.find((c) => c.name === cloudStr);

  const [copyText, setCopyText] = React.useState('');
  const [showCopyPopup, setShowCopyPopup] = React.useState(false);
  const [importText, setImportText] = React.useState('');
  const [showImportPopup, setShowImportPopup] = React.useState(false);
  const [exportLanguage, setExportLanguage] = React.useState('javascript');

  const [admin, setAdmin] = React.useState(false);

  const hash = (str: string, callback: (err: Error, derivedKey: Buffer) => void) => {
    pbkdf2.pbkdf2(
      str,
      'aZN00cGoN1XgYcArVhIz',
      10000,
      64,
      'sha512',
      callback
      // (err: any, derivedKey: any) => {
      //   if (err) {
      //     setStatusText(err);
      //     setLoading(false);
      //     return;
      //   }
      //   const hash = derivedKey.toString('hex');
      //   console.log("hash", hash);
      //   // setStatusText('Hash generated!');
      //   handleHash(hash);
      //   setLoading(false);
      // }
    );
  };

  React.useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const pwd = queryParams.get('pwd');
    const toHash = queryParams.get('hash');
    if (toHash) {
      hash(
        toHash,
        (err: Error, derivedKey: Buffer) => {
          if (err) return;
          const hash = derivedKey.toString('hex');
          console.log("hash", hash);
        }
      );
    }

    if (pwd) {
      hash(
        pwd,
        (err: Error, derivedKey: Buffer) => {
          if (err) return;
          const hash = derivedKey.toString('hex');
          if (hash === pwd_hash)
            setAdmin(true);
        }
      );
    }
  }, []);


  const graphFromStr = (str: string) => {
    const graph = JSON.parse(str) as Graph;
    if (graph) {
      updateModelWithGraph(graph, setNodeDataArray, setLinkDataArray);
      return true;
    }
    return false;
  };

  const importFromUrl = (searchParams: string) => {
    const queryParams = new URLSearchParams(searchParams);
    const enc = queryParams.get('graph');
    if (enc) {
      const json = lzbase62.decompress(enc);
      graphFromStr(json);
    }
  };


  React.useEffect(() => {
    importFromUrl(window.location.search);
  }, []);

  const [ownPastes, setOwnPastes] = createPersistedState<Array<[string, string]>>("ownPastes")([]);

  const uploadPaste = (filename: string, paste: string, token: string) => {
    console.log("uploadPaste", filename, token);
    axios.post('https://api.paste.ee/v1/pastes',
      {
        'description': 'Automaton ' + filename,
        'sections': [
          {
            'name': 'Automaton ' + filename,
            'syntax': 'json',
            'contents': paste,
          },
        ]
      },
      {
        headers: {
          'content-type': 'application/json',
          'X-Auth-Token': token,
        }
      }).then((res) => {
        // console.log("res", res);
        const id = res.data.id;
        const link = res.data.link
        setOwnPastes((prev) => [...prev, [id, filename]]);
        popupMessage("Uploaded with id " + id + "\n" + link);
      }).catch((err) => {
        console.log("err", err);
        popupMessage("Error uploading paste");
      });
  };

  const readPaste = (id: string, token: string, cont: (s: string) => void) => {
    console.log("readPaste", id, token);
    axios.get('https://api.paste.ee/v1/pastes/' + id,
      {
        headers: {
          'X-Auth-Token': token,
        }
      }).then((res) => {
        // console.log("res", res);
        // const paste = res.data.sections[0].contents;
        const paste = res.data.paste.sections[0].contents;
        // graphFromStr(paste);
        cont(paste);
      }).catch((err) => {
        console.log("err", err);
        popupMessage("Error reading paste");
      });
  };

  const [showLoadPopup, setShowLoadPopup] = React.useState(false);
  // const [loadContent, setLoadContent] = React.useState(<></>);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    setShowLoadPopup(false);
    if (!e.target.files) {
      return;
    }
    const file = e.target.files[0];
    // const { name } = file;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (!evt?.target?.result) {
        return;
      }
      const { result } = evt.target;
      // console.log("result", result);
      graphFromStr(result as string);
    };
    // reader.readAsBinaryString(file);
    reader.readAsText(file, 'utf-8');
  };

  const [loadText, setLoadText] = React.useState('');

  const loadGraphFromPasteID = (id: string, token: string) => {
    setPublicPastes(undefined);
    setShowLoadPopup(false);
    readPaste(id, token, (paste) => {
      const success = graphFromStr(paste);
      if (!success)
        popupMessage("Error loading paste");
    });
  };

  const listPastes = async (token: string) => {
    console.log("listPastes", token);
    const res = await axios.get('https://api.paste.ee/v1/pastes',
      {
        headers: {
          'X-Auth-Token': token,
        }
      });
    // console.log("res", res);
    const pastes = res.data.data;
    // console.log("pastes", pastes);
    return pastes;
  };

  const [publicPastes, setPublicPastes] = React.useState<undefined | any[]>(undefined);

  const renderLoadPopup = () => {
    if (!cloud)
      return <> </>;
    if (cloud.adminOnly && !admin) {
      return <>Admin only</>;
    }

    switch (cloud?.name) {
      case 'File':
        return (
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileIcon />}
            fullWidth
            sx={{ marginRight: "1rem" }}
          >
            Upload Automaton
            <input type="file" hidden onChange={handleFileUpload} />
          </Button>
        );
      case 'Pastebin':
        return (
          <Grid container direction="column" alignItems="center" spacing={1}>
            <Grid item style={{ width: "100%" }}>
              <TextField
                id="loadtext-filled-multiline-flexible"
                label="ID"
                fullWidth
                value={loadText}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setLoadText(event.target.value) }}
                variant="outlined"
              />
            </Grid>
            <Grid item style={{ width: "100%" }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<FileOpenIcon />}
                onClick={() => loadGraphFromPasteID(loadText, pasteeeApiToken)}
              >
                Load
              </Button>
            </Grid>
            {
              ownPastes.map(paste => {
                const [id, filename] = paste;
                return (
                  <Grid item style={{ width: "100%" }}>
                    <Button
                      key={id}
                      variant="contained"
                      color="info"
                      fullWidth
                      startIcon={<FileOpenIcon />}
                      onClick={() => loadGraphFromPasteID(id, pasteeeApiToken)}
                    >
                      {`${filename} (${id})`}
                    </Button>
                  </Grid>
                );
              })
            }
          </Grid>
        );
      case "Public Pastebin":
        if (publicPastes === undefined) {
          setPublicPastes([]);
          console.log("Loading public pastes");
          listPastes(pasteeePublicApiToken).then((pastes) => {
            console.log("pastes", pastes);
            setPublicPastes(pastes);
          });
        }
        return (
          <Grid container direction="column" alignItems="center" spacing={1}>
            {
              (publicPastes === undefined || publicPastes.length === 0) ?
                "Loading..." :
                publicPastes.map((paste) => {
                  return (
                    <Grid item style={{ width: "100%" }}>
                      <Button
                        key={paste.id}
                        variant="contained"
                        color="primary"
                        fullWidth
                        startIcon={<FileOpenIcon />}
                        onClick={() => loadGraphFromPasteID(paste.id, pasteeePublicApiToken)}
                      >
                        {paste.description}
                      </Button>
                    </Grid>
                  );
                })
            }
          </Grid>
        );
      default:
        break;
    }
    return <> </>
  };

  const popupMessage = (message: string) => {
    setExportLanguage("text")
    setCopyText(message);
    setShowCopyPopup(true);
  };

  // React.useEffect(() => {
  //   readPaste("eYgWG", pasteeeApiToken, (s) => console.log(s));
  // }, []);

  const saveGraph = () => {
    if (!cloud)
      return;
    if (cloud.adminOnly && !admin) {
      setCopyText("Admin only");
      setShowCopyPopup(true);
      return;
    }
    const graphStr = JSON.stringify(graph, null, 2);
    switch (cloud.name) {
      case 'File':
        var data = new Blob([graphStr], { type: 'application/json;charset=utf8' });
        var csvURL = window.URL.createObjectURL(data);
        const tempLink = document.createElement('a');
        tempLink.href = csvURL;
        tempLink.setAttribute('download', saveText + '.json');
        tempLink.click();
        break;
      case 'Google Drive':
        break;
      case 'Dropbox':
        break;
      case 'Pastebin':
        uploadPaste(saveText, graphStr, pasteeeApiToken);
        break;
      case 'Public Pastebin':
        uploadPaste(saveText, graphStr, pasteeePublicApiToken);
        break;
      default:
        return;
    }
    setShowSavePopup(false);
  };

  const importGraph = () => {
    setShowImportPopup(false);

    if (format?.adminOnly && !admin) {
      setCopyText("Admin only");
      setShowCopyPopup(true);
      return;
    }

    let new_graph = undefined;
    switch (format?.name) {
      case 'JSON':
        new_graph = JSON.parse(importText) as Graph;
        break;
      case 'URL':
        // const enc = importText.split('?graph=')[1];
        new_graph = importFromUrl("?" + importText.split('?')[1]);
        // const queryParams = new URLSearchParams("?" + importText.split('?')[1]);
        // const enc = queryParams.get('graph');
        // if (enc) {
        //   const json = lzbase62.decompress(enc);
        //   new_graph = JSON.parse(json) as Graph;
        // }
        break;
      case 'RegEx':
        new_graph = ofRegEx(importText);
        break;
      default:
        console.log("Not handled export format");
        return;
    }
    if (new_graph) {
      updateModelWithGraph(new_graph, setNodeDataArray, setLinkDataArray);
    }
    // setShowImportPopup(true);
  };

  const exportGraph = () => {
    let output = "";
    if (format?.adminOnly && !admin) {
      output = "Admin only";
    } else {
      switch (format?.name) {
        case 'JSON':
          output = JSON.stringify(graph, null, 2);
          setExportLanguage("javascript");
          break;
        case 'URL':
          const json = JSON.stringify(graph);
          const enc = lzbase62.compress(json);
          output = window.location.origin + window.location.pathname + "?graph=" + enc;
          setExportLanguage("html");
          // const enc = new AmauiLZ77(json).encode().value;
          // console.log(enc);
          // const b64 = compress(json, { level: 9 });
          break;
        case 'LaTeX':
          output = toLatex(graph);
          setExportLanguage("latex");
          break;
        case '5-Tuple':
          output = fiveTuple(graph);
          setExportLanguage("text");
          break;
        case 'RegEx':
          output = toRegEx(graph);
          setExportLanguage("regex");
          break;
        case 'Grammar':
          output = graphToGrammar(graph);
          setExportLanguage("text");
          break;
        default:
          console.log("Not handled export format");
          return;
      }
    }
    setCopyText(output);
    setShowCopyPopup(true);
  };

  const coloredNodeDataArray =
    nodeDataArray.map((node) => {
      const color = selectedNodes.has(node.key) ? nodeHighlightColor : nodeColor;
      return { ...node, color: color };
    });

  const [showSavePopup, setShowSavePopup] = React.useState(false);
  const [saveText, setSaveText] = React.useState('');

  return (
    <div className='app'>
      <p>
        Old version of the automaton editor: <a href="https://neuralcoder3.github.io/automaton/">https://neuralcoder3.github.io/automaton/</a>
      </p>
      <div className='topButtonBar'>
        <Grid container direction="row" alignItems="center" spacing={2} >
          <Grid item>
            <FormControl fullWidth style={{ minWidth: 120 }} >
              <InputLabel id="cloud-select-label">Cloud</InputLabel>
              <Select
                labelId="cloud-select-label"
                id="cloud-select"
                value={cloudStr}
                label="Cloud"
                onChange={handleCloudChange}
              >
                {
                  clouds.filter(
                    (c) => admin || !c.adminOnly
                  ).map((cloud: Cloud) => {
                    return <MenuItem value={cloud.name}>{cloud.name}</MenuItem>
                  })
                }
              </Select>
            </FormControl>
          </Grid>

          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={!cloud || !cloud.save}
              onClick={() => setShowSavePopup(true)}
            >
              Save
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FileOpenIcon />}
              disabled={!cloud || !cloud.load}
              // onClick={openLoadPopup}
              onClick={() => setShowLoadPopup(true)}
            >
              Load
            </Button>
          </Grid>


          <Grid item>
            <FormControl fullWidth style={{ minWidth: 120 }} >
              <InputLabel id="format-select-label">Format</InputLabel>
              <Select
                labelId="format-select-label"
                id="format-select"
                value={formatStr}
                label="Format"
                onChange={handleFormatChange}
              >
                {/* <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem> */}
                {
                  formats.filter(
                    (f) => admin || !f.adminOnly
                  ).map((format: Format) => {
                    return <MenuItem value={format.name}>{format.name}</MenuItem>
                  })
                }
              </Select>
            </FormControl>
          </Grid>

          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<BackupIcon />}
              disabled={format ? !format.import : true}
              onClick={() => setShowImportPopup(true)}
            >
              Import
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudDownloadIcon />}
              disabled={format ? !format.export : true}
              onClick={exportGraph}
            >
              Export
            </Button>
          </Grid>
        </Grid>
      </div>
      <DiagramWrapper
        nodeDataArray={coloredNodeDataArray}
        // nodeDataArray={nodeDataArray}
        // highlightedNodes={selectedNodes}
        linkDataArray={linkDataArray}
        modelData={modelData}
        skipsDiagramUpdate={skipsDiagramUpdate}
        onDiagramEvent={handleDiagramEvent}
        onModelChange={handleModelChange}
      />
      <Info />
      <div className='mainButtonBar'>
        <Grid container direction="row" alignItems="center" spacing={2} >
          <Grid item>
            <ToggleButtonGroup
              value={singleMulti}
              exclusive
              onChange={handleSingleMultiChange}
              aria-label="text alignment"
              size='small'
            >
              <ToggleButton value="single" aria-label="left aligned">
                <RemoveIcon />
              </ToggleButton>
              <ToggleButton value="multi" aria-label="centered">
                <MenuIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          {admin &&
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ContentCutIcon />}
                onClick={cutUnreachableNodes}
              >
                Cut unreachable
              </Button>
            </Grid>
          }
          {admin &&
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<BoltIcon />}
                onClick={powerAutomaton}
              >
                Power Automaton
              </Button>
            </Grid>
          }
          {admin &&
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CloseFullscreenIcon />}
                onClick={minimizeAutomaton}
              >
                Minimize
              </Button>
            </Grid>
          }
          {admin &&
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SettingsBackupRestoreIcon />}
                onClick={reverseAutomaton}
              >
                Reverse
              </Button>
            </Grid>
          }
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              disabled={true}
            >
              Make atomic
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DeleteOutlineIcon />}
              onClick={clearCacheData}
            >
              Clear Cache
            </Button>
          </Grid>
        </Grid>
      </div>
      <div style={{ "width": "100%" }}>
        {singleMulti === 'single' ? <Single graph={graph} colorNodes={setSelectedNodes} /> : <Multi graph={graph} />}
      </div>


      {/* <Popup trigger={<button> Trigger</button>} modal> */}
      <Popup open={showCopyPopup} onClose={() => setShowCopyPopup(false)} modal>
        <div style={{ "overflowY": "auto", "maxHeight": "100vh" }}>
          <CodeBlock highlight={true} >
            <pre>
              {/* <Highlight className="language-javascript"> */}
              <Highlight className={"language-" + exportLanguage}>
                {copyText}
              </Highlight>
            </pre>
          </CodeBlock>

          <form className="center" action="https://www.overleaf.com/docs" method="post" target="_blank">
            <textarea id="output" name="snip" style={{ "display": "none" }} >
              {copyText}
            </textarea>
            {/* <input type="submit" value="Open in Overleaf" id="overleafExport" className="btn-success btn btn-sm" /> */}
            <Button
              variant="contained"
              type='submit'
              color="primary"
              fullWidth
              startIcon={<Icon icon="mdi:leaf" />}
            >
              Open in Overleaf
            </Button>
          </form>
        </div>
      </Popup>

      <Popup open={showImportPopup} onClose={() => setShowImportPopup(false)} modal>
        <div>

          <Grid container direction="column" alignItems="center" spacing={2}>
            <Grid item style={{ width: "100%" }}>
              <TextField
                id="import-filled-multiline-flexible"
                label="Import String"
                fullWidth
                multiline
                rows={6}
                // style={{ width: "100%" }}
                value={importText}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setImportText(event.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<BackupIcon />}
                onClick={importGraph}
              >
                Import
              </Button>
            </Grid>
          </Grid>
        </div>
      </Popup>

      <Popup open={showSavePopup} onClose={() => setShowSavePopup(false)} modal>
        <div>

          <Grid container direction="column" alignItems="center" spacing={2}>
            <Grid item style={{ width: "100%" }}>
              <TextField
                id="save-filled-multiline-flexible"
                label="Filename"
                fullWidth
                value={saveText}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSaveText(event.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item style={{ width: "100%" }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<SaveIcon />}
                onClick={saveGraph}
              >
                Save
              </Button>
            </Grid>
          </Grid>
        </div>
      </Popup>


      <Popup open={showLoadPopup} onClose={() => { setShowLoadPopup(false); setPublicPastes(undefined); }} modal>
        <div style={{ "overflowY": "auto", "maxHeight": "100vh" }}>
          {renderLoadPopup()}
        </div>
      </Popup>


      {/* {inspector} */}
    </div>
  );

}

export default App;
