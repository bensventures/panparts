
import React, { Component } from 'react';

import Handpan from './handpan';
import PartitionLine from './partition-line';

/**
 * lines [
 *  { line
 *      repeat: 1,
 *      chords: [ chord
 *        { tap
 *            note,
 *            hand
 *         }
 *      ]
 *  }
 * ]
 * @constructor
 */

const defaultLine = {
    repetition: 1,
    taps: []
}

const storageKey = 'panpart';

interface IState {
    lines: Array<Object>
    currentLineIndex: number
}

export default class App extends Component<IState> {
    state: IState
    setState
    pressedKeysCodes: string[]

    constructor(props: object) {
        super(props);

        this.state = {
            lines: [{
                ...defaultLine
            }],
            currentLineIndex: 0
        }

        this.pressedKeysCodes = [];
    }

    componentWillMount() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        const storage = window.localStorage.getItem(storageKey);
        if (storage) {
            this.setState({
                lines: JSON.parse(storage)
            })
        }
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }

    handleKeyUp = () => {
        window.localStorage.setItem(storageKey, JSON.stringify(this.state.lines));
        this.pressedKeysCodes = [];
    }

    handleKeyDown = (e) => {
        if (e.code === 'Backspace' && e.target) {
            e.preventDefault();
            this.handleDeleteLastTap();
        }

        if (e.code === 'Enter') {
            e.preventDefault();
            this.handleAddLine();
        }

        if (e.code === 'KeyD') {
            e.preventDefault();
            this.handleDuplicateLine();
        }

        if (e.code === 'ArrowUp') {
            e.preventDefault();
            this.handleAddRemoveRepetition(true);
        }

        if (e.code === 'ArrowDown') {
            e.preventDefault();
            this.handleAddRemoveRepetition(false);
        }

        if (e.code === 'ArrowLeft') {
            this.pressedKeysCodes.push(e.code)
        }

        if (e.code.indexOf('Digit') !== -1) {
            e.preventDefault();
            this.handleNumberPressed(e);
        }
    }

    handleNumberPressed = e => {
        if (e.repeat) return;

        const note = e.key;
        const addToPrevious = e.ctrlKey;
        const hand = this.pressedKeysCodes.includes('ArrowLeft') ? 'left' : 'right';
        this.addNote({ note, hand, addToPrevious });
    }

    handleNoteClick = e => {
        const { target } = e;
        const note = target.dataset.note;
        const hand = e.buttons === 0 ? 'left' : 'right';
        const addToPrevious = e.ctrlKey;

        if (target.tagName === 'path') {
            this.addNote({ note, hand, addToPrevious });
        }
    }

    handleDeleteLastTap = () => {
        const linesCopy = structuredClone(this.state.lines);
        let currentLineIndex = this.state.currentLineIndex;
        const currentLine = linesCopy[this.state.currentLineIndex];

        currentLine.taps.pop();

        if (currentLine.taps.length === 0 && linesCopy.length > 1) {
            linesCopy.pop();
            currentLineIndex = currentLineIndex-1;
        }

        this.setState({
            lines: linesCopy,
            currentLineIndex
        });
    }

    handleAddLine = () => {
        const linesCopy = structuredClone(this.state.lines);

        linesCopy.push({
            ...defaultLine
        });

        this.setState({
            lines: linesCopy,
            currentLineIndex: this.state.currentLineIndex + 1
        });
    }

    handleDuplicateLine = () => {
        const linesCopy = structuredClone(this.state.lines);
        const duplicateLine = structuredClone(linesCopy[this.state.currentLineIndex]);

        linesCopy.splice(this.state.currentLineIndex, 0, duplicateLine);

        this.setState({
            lines: linesCopy,
            currentLineIndex: this.state.currentLineIndex + 1
        });
    }

    handleAddRemoveRepetition = add => {
        const linesCopy = structuredClone(this.state.lines);
        const currentLine = linesCopy[this.state.currentLineIndex];

        currentLine.repetition = add ? currentLine.repetition + 1 : currentLine.repetition - 1;

        if (currentLine.repetition < 1) {
            currentLine.repetition = 1;
        }

        this.setState({
            lines: linesCopy,
        });
    }

    handleLineClicked = index => {
        this.setState({
            currentLineIndex: index
        })
    }

    addNote({ note, hand, addToPrevious }) {
        const linesCopy = structuredClone(this.state.lines);
        const currentLine = linesCopy[this.state.currentLineIndex];
        const newTap = {
            note,
            hand
        };

        if (addToPrevious) {
            currentLine.taps[currentLine.taps.length-1].push(newTap);
        } else {
            currentLine.taps.push([newTap]);
        }

        this.setState({
            lines: linesCopy
        });
    }

    render() {
        return (
            <div>
                <header>
                    <h1 contentEditable={true}>
                        New song
                    </h1>
                    <button
                        type="button"
                        onClick={() => this.setState({ lines: [{...defaultLine}], currentLineInde: 0 })}
                    >
                        Clear
                    </button>
                </header>
                <div className="scene">
                    <div className="instrument">
                        <Handpan
                            handleNoteClick={this.handleNoteClick}
                        />
                    </div>

                    <div className="partition">
                        <ul className="lines-list">
                            {this.state.lines.map((line, index) => (
                                <PartitionLine
                                    key={`line-${index}`}
                                    line={line}
                                    handleLineClicked={() => this.handleLineClicked(index)}
                                    isSelected={index === this.state.currentLineIndex}
                                />
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}
