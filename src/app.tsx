
import { Component } from 'react';
import cn from 'classnames';

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

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            lines: [{
                ...defaultLine
            }],
            currentLineIndex: 0
        }
    }

    componentWillMount() {
        window.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown);
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
    }

    handleNoteClick = e => {
        const { target } = e;
        const linesCopy = structuredClone(this.state.lines);
        const currentLine = linesCopy[this.state.currentLineIndex];

        if (target.tagName === 'path') {
            const note = target.dataset.note;
            const hand = e.buttons === 0 ? 'left' : 'right';
            const newTap = {
                note,
                hand
            };

            if (e.ctrlKey) {
                currentLine.taps[currentLine.taps.length-1].push(newTap);
            } else {
                currentLine.taps.push([newTap]);
            }

            this.setState({
                lines: linesCopy
            });
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
                                />
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}
