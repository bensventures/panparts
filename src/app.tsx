import React, {Component} from 'react';
import cn from 'classnames';

import {
    addNoteToSelectedLine
} from './data-helpers';

import Handpan from './handpan';
import PartitionLine from './partition-line';

/**
 * groups[
 *  {
 *      name: '',
 *      repeat: 1,
 *      lines: [
 *          { line
 *              repeat: 1,
 *              chords: [ chord
 *                  {
 *                      tap
 *                      note,
 *                      hand
 *                  }
 *              ]
 *          }
 *      ]
 *  }
 * ]
 * @constructor
 */

const defaultLine = {
    repetition: 1,
    taps: []
}

const defaultGroup = {
    name: '',
    repeat: 1,
    lines: [{
        ...defaultLine
    }],
}

const storageKey = 'panpart';

interface IState {
    groups: Array<Object>
    songName: string
    currentGroupIndex: number
    currentLineIndex: number
}

export default class App extends Component<IState> {
    state: IState
    setState
    pressedKeysCodes: string[]

    constructor(props: object) {
        super(props);

        this.state = {
            songName: 'new song',
            groups: [defaultGroup],
            currentGroupIndex: 0,
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
                groups: JSON.parse(storage)
            })
        }
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }

    handleKeyUp = () => {
        window.localStorage.setItem(storageKey, JSON.stringify(this.state.groups));
        this.pressedKeysCodes = [];
    }

    handleKeyDown = (e) => {
        if (e.target.tagName === 'INPUT') {
            return;
        }

        if (e.code === 'Backspace' && e.target) {
            e.preventDefault();
            this.handleDeleteLastTap();
            return;
        }

        if (e.code === 'Enter') {
            e.preventDefault();
            this.handleAddLine();
            return;
        }

        if (e.code === 'Space') {
            e.preventDefault();
            this.handleAddGroup();
            return;
        }

        if (e.code === 'KeyD') {
            e.preventDefault();
            this.handleDuplicateLine();
            return;
        }

        if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
            e.preventDefault();

            const direction = e.code === 'ArrowUp';
            if (e.metaKey) {
                this.handleMove(direction);
            } else if (e.shiftKey) {
                this.handleAddRemoveRepetition(direction);
            } else {
                this.handleChangeLine(direction);
            }
            return;
        }

        if (e.code === 'ArrowLeft') {
            this.pressedKeysCodes.push(e.code);
            return;
        }

        if (e.code.indexOf('Digit') !== -1) {
            e.preventDefault();
            this.handleNumberPressed(e);
            return;
        }
    }

    handleNumberPressed = e => {
        if (e.repeat) return;

        const note = e.key;
        const addToPrevious = e.ctrlKey;
        const hand = this.pressedKeysCodes.includes('ArrowLeft') ? 'left' : 'right';
        this.addNote({note, hand, addToPrevious});
    }

    handleNoteClick = e => {
        const {target} = e;
        const note = target.dataset.note;
        const hand = e.metaKey ? 'right' : 'left';
        const addToPrevious = e.ctrlKey;

        if (target.tagName === 'path') {
            this.addNote({note, hand, addToPrevious});
        }
    }

    handleDeleteLastTap = () => {
        const groupsCopy = structuredClone(this.state.groups);
        const currentGroup = groupsCopy[this.state.currentGroupIndex];
        const linesCopy = currentGroup.lines;
        let currentGroupIndex = this.state.currentGroupIndex;
        let currentLineIndex = this.state.currentLineIndex;
        const currentLine = linesCopy[this.state.currentLineIndex];

        currentLine.taps.pop();

        if (currentLine.taps.length === 0) {
            if (linesCopy.length > 1 || groupsCopy.length > 1) {
                linesCopy.splice(this.state.currentLineIndex, 1);
                currentLineIndex = currentLineIndex - 1;
            }

            if (currentGroup.lines.length === 0 && groupsCopy.length > 1) {
                const prevGroup = this.state.groups[this.state.currentGroupIndex - 1];
                groupsCopy.splice(this.state.currentGroupIndex, 1);
                currentGroupIndex = currentGroupIndex - 1;
                currentLineIndex = prevGroup.lines.length - 1;
            }
        }

        this.setState({
            groups: groupsCopy,
            currentLineIndex,
            currentGroupIndex
        });
    }

    handleAddLine = () => {
        const groupsCopy = structuredClone(this.state.groups);
        const currentGroup = groupsCopy[this.state.currentGroupIndex];
        const linesCopy = currentGroup.lines;

        linesCopy.splice(this.state.currentLineIndex + 1, 0, {...defaultLine});

        this.setState({
            groups: groupsCopy,
            currentLineIndex: this.state.currentLineIndex + 1
        });
    }

    handleAddGroup = () => {
        const groupsCopy = structuredClone(this.state.groups);

        groupsCopy.splice(this.state.currentGroupIndex + 1, 0, {...defaultGroup});

        this.setState({
            groups: groupsCopy,
            currentGroupIndex: this.state.currentGroupIndex + 1,
            currentLineIndex: 0
        });
    }

    handleChangeLine = up => {
        let newGroupIndex = this.state.currentGroupIndex;
        let newLineIndex = this.state.currentLineIndex;
        const currentGroup = this.state.groups[newGroupIndex];

        if (up) {
            newLineIndex -= 1;

            if (newLineIndex < 0) {
                const prevGroup = this.state.groups[this.state.currentGroupIndex - 1];

                if (prevGroup) {
                    newGroupIndex = this.state.currentGroupIndex - 1;
                    newLineIndex = prevGroup.lines.length - 1;
                } else {
                    newLineIndex = 0;
                }
            }
        } else {
            newLineIndex += 1;

            if (newLineIndex >= currentGroup.lines.length) {
                const nextGroup = this.state.groups[this.state.currentGroupIndex + 1];

                if (nextGroup) {
                    newGroupIndex = this.state.currentGroupIndex + 1;
                    newLineIndex = 0;
                } else {
                    newLineIndex = this.state.currentLineIndex;
                }
            }
        }

        this.setState({
            currentGroupIndex: newGroupIndex,
            currentLineIndex: newLineIndex
        });
    }

    handleDuplicateLine = () => {
        const groupsCopy = structuredClone(this.state.groups);
        const currentGroup = groupsCopy[this.state.currentGroupIndex];
        const linesCopy = currentGroup.lines;
        const duplicateLine = structuredClone(linesCopy[this.state.currentLineIndex]);

        linesCopy.splice(this.state.currentLineIndex, 0, duplicateLine);

        this.setState({
            groups: groupsCopy,
            currentLineIndex: this.state.currentLineIndex + 1
        });
    }

    handleAddRemoveRepetition = add => {
        const groupsCopy = structuredClone(this.state.groups);
        const currentGroup = groupsCopy[this.state.currentGroupIndex];
        const linesCopy = currentGroup.lines;
        const currentLine = linesCopy[this.state.currentLineIndex];

        currentLine.repetition = add ? currentLine.repetition + 1 : currentLine.repetition - 1;

        if (currentLine.repetition < 1) {
            currentLine.repetition = 1;
        }

        this.setState({
            groups: groupsCopy,
        });
    }

    handleMove = up => {
        const groupsCopy = structuredClone(this.state.groups);
        let currentGroup = groupsCopy[this.state.currentGroupIndex];
        const currentLine = currentGroup.lines[this.state.currentLineIndex];
        let toGroup = currentGroup;
        let toGroupIndex = this.state.currentGroupIndex;
        let toIndex = this.state.currentLineIndex + (up ? -1 : 1);

        if (up) {
            if (toIndex < 0) {
                toGroup = groupsCopy[this.state.currentGroupIndex - 1];

                if (toGroup) {
                    toGroupIndex = toGroupIndex - 1;
                    toIndex = toGroup.lines.length;
                } else {
                    return;
                }
            }
        } else {
            if (toIndex > currentGroup.lines.length - 1) {
                toGroup = groupsCopy[this.state.currentGroupIndex + 1];

                if (toGroup) {
                    toGroupIndex = toGroupIndex + 1;
                    toIndex = 0;
                } else {
                    return;
                }
            }
        }

        // Remove current line from where it is
        currentGroup.lines.splice(this.state.currentLineIndex, 1);
        // Append line at the position we want and selected it
        toGroup.lines.splice(toIndex, 0, currentLine);

        this.setState({
            groups: groupsCopy,
            currentGroupIndex: toGroupIndex,
            currentLineIndex: toIndex
        });
    }

    handleLineClicked = (groupIndex, lineIndex) => {
        this.setState({
            currentGroupIndex: groupIndex,
            currentLineIndex: lineIndex
        })
    }

    handleGroupNameChanged = (groupIndex, e) => {
        const groupsCopy = structuredClone(this.state.groups);
        const currentGroup = groupsCopy[groupIndex];

        currentGroup.name = e.target.value;

        this.setState({
            groups: groupsCopy
        })
    }

    addNote(newNote) {
        const newGroups = addNoteToSelectedLine(this.state, newNote)

        this.setState({
            groups: newGroups
        });
    }

    render() {
        return (
            <div>
                <header>
                    <input
                        type="text"
                        value={this.state.songName}
                        onChange={e => this.setState({songName: e.target.value})}
                    />
                    <button
                        type="button"
                        onClick={() => this.setState({
                            groups: [defaultGroup],
                            currentGroupIndex: 0,
                            currentLineIndex: 0
                        })}
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
                        <ul className="groups-list">
                            {this.state.groups.map((group, gIndex) => (
                                <li
                                    key={`group-${gIndex}`}
                                    className={cn('group-item', {
                                        'is-selected': gIndex === this.state.currentGroupIndex
                                    })}
                                >
                                    <input
                                        type="text"
                                        value={group.name}
                                        onChange={e => this.handleGroupNameChanged(gIndex, e)}
                                    />
                                    <ul className="lines-list">
                                        {group.lines.map((line, index) => (
                                            <PartitionLine
                                                key={`line-${index}`}
                                                line={line}
                                                handleLineClicked={() => this.handleLineClicked(gIndex, index)}
                                                isSelected={index === this.state.currentLineIndex}
                                            />
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
