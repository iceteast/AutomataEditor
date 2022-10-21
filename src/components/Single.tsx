import { checkWord, getStartNodes, nextState } from "../GraphUtils";
import { Graph, Node } from "../Interfaces";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import React from "react";
import createPersistedState from 'use-persisted-state';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ReplayIcon from '@mui/icons-material/Replay';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';

import Grid from '@mui/material/Grid';

import "./Single.css";
import { IconTextField } from "./IconTextField";
import { nodeColor, nodeHighlightColor } from "../Const";

interface SingleProp {
    graph: Graph;
    colorNodes: (nodes: Node[]) => void;
}


function Single({ graph, colorNodes: colorFun }: SingleProp) {

    // const [word, setWord] = React.useState('');
    const [word, setWord] = createPersistedState<string>('word')('');
    const [currentNodes, setCurrentNodes] = React.useState<Node[]>([]);
    const [iterPos, setIterPos] = React.useState(-1);
    const [log, setLog] = React.useState<Node[][]>([]);
    // const [wordTrace, setWordTrace] = React.useState<JSX.Element>();

    const removeColor = () => {
        colorFun([]);
        // nodeArray.forEach((node) => {
        //     node.color = nodeColor;
        // });
    };

    const colorNodes = (nodes: Node[]) => {
        // removeColor();
        // console.log("coloring ", nodes);
        // console.log(" to ", nodeHighlightColor);
        // console.log("coloring " + [...currentNodes]);
        colorFun(nodes);
        // nodeArray.forEach((node) => {
        //     if (nodes.find((cNode) => cNode.id === node.key)) {
        //         node.color = nodeHighlightColor;
        //         console.log("Set color of " + node.key + " label: " + node.text);
        //     }
        // });
        // console.log("nodeArray: ", nodeArray);
    };

    const resetSimulation = () => {
        setCurrentNodes([]);
        setIterPos(-1);
        setLog([]);
        removeColor();
        // setWordTrace(<></>);
    }

    const handleWordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWord(event.target.value);
        resetSimulation();
    };

    const handleReset = (event: React.MouseEvent<HTMLButtonElement>) => {
        resetSimulation();
    };

    // const showWordTrace = () => {
    //     setWordTrace(
    //         <div className="trace">
    //             <span className="done">
    //                 {word.substring(0, iterPos)}
    //             </span>
    //             <span className="proceed">
    //                 {word.substring(iterPos)}
    //             </span>
    //         </div>
    //     );
    // };

    const handleNext = (event: React.MouseEvent<HTMLButtonElement>) => {
        // or log empty
        console.log("graph: ", graph);
        let newNodes;
        if (iterPos < 0) {
            setIterPos(0);
            // const startNode = getStart(graph);
            newNodes = getStartNodes(graph);
            console.log("Start Simulation");
            // console.log("Current Nodes: ", currentNodes);
        } else {
            const symbol = word.charAt(iterPos);
            setIterPos(iterPos + 1);
            setLog([...log, [...currentNodes]]);
            newNodes = nextState(graph, currentNodes, symbol);
        }
        console.log("New Nodes: ", newNodes);
        setCurrentNodes(newNodes);

        colorNodes(newNodes);
        // showWordTrace();
        // console.log("TODO: handleNext");
        // if (currentNodes.length === 0) {
        //     setCurrentNodes(graph.startNodes);
        // } else {
        //     setCurrentNodes(
        //         nextState(graph, currentNodes, word[iterPos])
        //     );
        // }
    };

    const handlePrev = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (log.length > 0) {
            const prevNodes = log[log.length - 1];
            setLog((prevLog) => prevLog.slice(0, -1));
            setIterPos(iterPos - 1);
            setCurrentNodes(prevNodes);
            colorNodes(prevNodes);
            // showWordTrace();
        } else {
            console.log("Prev not possible");
        }
    };


    return (
        <div className="single">
            <div className="wordBox">
                {/* <Box
                component="form"
                sx={{
                    '& > :not(style)': { m: 1, width: '25ch' },
                }}
                noValidate
                autoComplete="off"
            > */}
                <div className="singleWord">
                    <IconTextField id="outlined-basic" label="Input" variant="outlined" size="small"
                        value={word} onChange={handleWordChange}
                        iconEnd={
                            checkWord(graph, word) ?
                                <CheckIcon sx={{ color: "#0089ff", fontSize: 20 }} /> :
                                <CloseIcon sx={{ color: "#0089ff", fontSize: 20 }} />
                        }
                    />
                </div>
                {/* <Button variant="contained">Check</Button> */}
                {/* <Button variant="contained" endIcon={<ReplayIcon />}> </Button> */}
                <Button variant="contained"
                    endIcon={<SkipPreviousIcon />}
                    onClick={handleReset}
                > </Button>
                <Button variant="contained"
                    endIcon={<ArrowBackIosIcon />}
                    onClick={handlePrev}
                    disabled={log.length === 0}
                > </Button>
                <Button variant="contained"
                    endIcon={<ArrowForwardIosIcon />}
                    onClick={handleNext}
                    disabled={iterPos >= word.length}
                > </Button>
                {/* </Box> */}
            </div>
            <div className="wordTrace">
                {
                    iterPos >= 0 ?
                        <div className="trace">
                            <span className="done">
                                {word.substring(0, iterPos)}
                            </span>
                            <span className="proceed">
                                {word.substring(iterPos)}
                            </span>
                        </div> :
                        <></>
                }
            </div>
            {/* <div className="result">
                <Grid container direction="row" alignItems="center" spacing={2} color="#387c44">
                    <Grid item>
                        <TaskAltIcon />
                    </Grid>
                    <Grid item>
                        abc
                    </Grid>
                    <Grid item>
                        <CheckIcon />
                    </Grid>
                </Grid>
                <Grid container direction="row" alignItems="center" spacing={2} color="red">
                    <Grid item>
                        <ErrorOutlineIcon />
                    </Grid>
                    <Grid item>
                        abc
                    </Grid>
                    <Grid item>
                        <CloseIcon />
                    </Grid>
                    <Grid item>
                        <CheckIcon />
                    </Grid>
                </Grid>
            </div> */}
        </div>
    );

    // const [tests, setTests] = React.useState('0|abc');
    // const [result, setResult] = React.useState<JSX.Element>();

    // const [checkBtnColor, setCheckBtnColor] = React.useState<"primary" | "info" | "success" | "error">('primary');

    // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setCheckBtnColor('primary');
    //     setTests(event.target.value);
    // };

    // const check = (event: React.MouseEvent<HTMLButtonElement>) => {
    //     var testCases = tests.split("\n").map(
    //         (testCase) => {
    //             const [expectedStr, input] = testCase.split(/\|(.*)/s);
    //             const result = checkWord(graph, input);
    //             const expected = expectedStr === '1';
    //             return { input, expected, result };
    //         }
    //     );
    //     setCheckBtnColor(
    //         testCases.every((testCase) => testCase.expected === testCase.result) ? 'success' : 'error'
    //     );
    //     const resultOutput = (<div>
    //         {testCases.map((testCase) =>
    //             <div className="testcase">
    //                 {/* {
    //                     testCase.expected === testCase.result ?
    //                         <TaskAltIcon /> :
    //                         <ErrorOutlineIcon />
    //                 } {testCase.input} ({testCase.result ? <CheckIcon /> : <CloseIcon />}
    //                 {testCase.expected != testCase.result && (
    //                     " expected " + testCase.expected ? <CheckIcon /> : <CloseIcon />
    //                 )}
    //                 ) */}
    //                 <Grid container direction="row" alignItems="center" spacing={2} color={
    //                     testCase.expected === testCase.result ?
    //                         '#387c44' :
    //                         'red'
    //                 }>
    //                     <Grid item>
    //                         {
    //                             testCase.expected === testCase.result ?
    //                                 <TaskAltIcon /> :
    //                                 <ErrorOutlineIcon />
    //                         }
    //                     </Grid>
    //                     <Grid item>
    //                         {testCase.input}
    //                     </Grid>
    //                     <Grid item>
    //                         {testCase.result ? <CheckIcon /> : <CloseIcon />}
    //                     </Grid>
    //                     {
    //                         testCase.expected !== testCase.result && (
    //                             <>
    //                                 <Grid item>
    //                                     expected
    //                                 </Grid>
    //                                 <Grid item>
    //                                     {testCase.expected ? <CheckIcon /> : <CloseIcon />}
    //                                 </Grid>
    //                             </>
    //                         )
    //                     }
    //                 </Grid>

    //             </div>
    //         )}
    //     </div>);
    //     setResult(resultOutput);
    // };

    // return (
    //     <div className="multi">
    //         <div className="multiInput">
    //             <TextField
    //                 id="filled-multiline-flexible"
    //                 label="Multiline"
    //                 multiline
    //                 rows={6}
    //                 value={tests}
    //                 onChange={handleChange}
    //                 variant="filled"
    //             />
    //         </div>
    //         <div className="multiInfo">
    //             <Button variant="contained" color={checkBtnColor} onClick={check}>Check</Button>
    //             <div className="multiResult">
    //                 {
    //                     result
    //                 }
    //             </div>
    //         </div>
    //     </div>
    // );
};

export default Single;
