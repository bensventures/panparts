
import { Component } from 'react';
import cn from 'classnames';

import Handpan from './handpan';

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

    handleDeleteLastTap = lineIndex => {
        const linesCopy = structuredClone(this.state.lines);
        let currentLineIndex = this.state.currentLineIndex;
        const currentLine = linesCopy[lineIndex || this.state.currentLineIndex];

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
                        onClick={() => this.setState({ lines: [[]], currentLineInde: 0 })}
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
                                <li key={`line-${index}`} className="line-item">
                                    <ul className="taps-list">
                                        {line.taps.map((taps, index) => (
                                            <li key={`taps-${index}`}>
                                                <span className="chord">
                                                {taps.map((tap, index) => (
                                                    <span className={cn('tap', tap.hand)} key={`tap-${index}`}>
                                                        <span className="hand-value">
                                                            {tap.hand.substring(0, 1)}
                                                        </span>
                                                            <span className="note-value">
                                                            {tap.note}
                                                        </span>
                                                    </span>
                                                ))}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}
