import React, {Component} from 'react';
import cn from 'classnames';

import {
    storageKey,
    defaultGroup,
    addNewLine,
    addNoteToSelectedLine,
    deleteLastNoteFromSelectedLine,
    addNewGroup,
    selectedNewLine,
    moveLine,
    duplicateSelectedLine,
    changeRepetitions
} from './data-helpers';

import Handpan from './handpan';
import PartitionLine from './partition-line';

/**
 * groups[
 *  {
 *      name: '',
 *      repeat: 1,
 *      lines: [
 *          {
 *              repeat: 1,
 *              taps: [
 *                  {
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

interface IState {
    groups: Array<Group>
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
            this.setState(deleteLastNoteFromSelectedLine(this.state));
            return;
        }

        if (e.code === 'Enter') {
            e.preventDefault();
            this.setState(addNewLine(this.state));
            return;
        }

        if (e.code === 'Space') {
            e.preventDefault();
            this.setState(addNewGroup(this.state));
            return;
        }

        if (e.code === 'KeyD') {
            e.preventDefault();
            this.setState(duplicateSelectedLine(this.state));
            return;
        }

        if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
            e.preventDefault();

            const direction = e.code === 'ArrowUp';
            if (e.metaKey) {
                this.setState(moveLine(this.state, direction));
            } else if (e.shiftKey) {
                this.setState(changeRepetitions(this.state, direction));
            } else {
                this.setState(selectedNewLine(this.state, direction));
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
        this.setState(addNoteToSelectedLine(this.state, newNote));
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
