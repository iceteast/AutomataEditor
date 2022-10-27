import { checkWord } from "../GraphUtils";
import { Graph } from "../Interfaces";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import React, { useEffect } from "react";

import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import Grid from '@mui/material/Grid';

import "./Multi.css";
import createPersistedState from "use-persisted-state";

interface MultiProp {
    graph: Graph;
}


function Multi({ graph }: MultiProp) {
    // const [tests, setTests] = React.useState('0|abc');
    const [tests, setTests] = createPersistedState<string>('testCases')('0|abc');
    const [result, setResult] = React.useState<JSX.Element>();

    const [checkBtnColor, setCheckBtnColor] = React.useState<"primary" | "info" | "success" | "error">('primary');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCheckBtnColor('primary');
        setTests(event.target.value);
    };


    const check = () => {
        var testCases = tests.split("\n").map(
            (testCase) => {
                const [expectedStr, input] = testCase.split(/\|(.*)/s);
                const result = checkWord(graph, input);
                const expected = expectedStr === '1';
                return { input, expected, result };
            }
        );
        setCheckBtnColor(
            testCases.every((testCase) => testCase.expected === testCase.result) ? 'success' : 'error'
        );
        const resultOutput = (<div>
            {testCases.map((testCase) =>
                <div className="testcase">
                    {/* {
                        testCase.expected === testCase.result ?
                            <TaskAltIcon /> :
                            <ErrorOutlineIcon />
                    } {testCase.input} ({testCase.result ? <CheckIcon /> : <CloseIcon />}
                    {testCase.expected != testCase.result && (
                        " expected " + testCase.expected ? <CheckIcon /> : <CloseIcon />
                    )}
                    ) */}
                    <Grid container direction="row" alignItems="center" spacing={2} color={
                        testCase.expected === testCase.result ?
                            '#387c44' :
                            'red'
                    }>
                        <Grid item>
                            {
                                testCase.expected === testCase.result ?
                                    <TaskAltIcon /> :
                                    <ErrorOutlineIcon />
                            }
                        </Grid>
                        <Grid item>
                            {testCase.input}
                        </Grid>
                        <Grid item>
                            {testCase.result ? <CheckIcon /> : <CloseIcon />}
                        </Grid>
                        {
                            testCase.expected !== testCase.result && (
                                <>
                                    <Grid item>
                                        expected
                                    </Grid>
                                    <Grid item>
                                        {testCase.expected ? <CheckIcon /> : <CloseIcon />}
                                    </Grid>
                                </>
                            )
                        }
                    </Grid>

                </div>
            )}
        </div>);
        setResult(resultOutput);
    };

    useEffect(check, [tests]);

    return (
        <div className="multi">
            <div className="multiInput">
                <TextField
                    id="filled-multiline-flexible"
                    label="Multiline"
                    multiline
                    fullWidth
                    rows={12}
                    value={tests}
                    onChange={handleChange}
                    variant="filled"
                />
            </div>
            <div className="multiInfo">
                {/* <Button variant="contained" color={checkBtnColor} onClick={check}>Check</Button> */}
                <div className="multiResult">
                    {
                        result
                    }
                </div>
            </div>
        </div>
    );
};

export default Multi;
