import React, {Component} from 'react';
// @ts-ignore
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
            groups: [{...defaultGroup}],
            currentGroupIndex: 0,
            currentLineIndex: 0
        }

        this.pressedKeysCodes = [];
    }

    componentWillMount() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        let storage;
        const query = window.location.search;

        if (query.includes('song=')) {
            storage = atob(query.split('song=')[1]);
        } else {
            storage = window.localStorage.getItem(storageKey);
        }

        if (storage) {
            this.setState({
                ...JSON.parse(storage)
            });
        }
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }

    handleKeyUp = () => {
        window.localStorage.setItem(storageKey, JSON.stringify({
            songName: this.state.songName,
            groups: this.state.groups
        }));
        this.pressedKeysCodes = [];
    }

    handleKeyDown = e => {
        if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
            e.preventDefault();

            const direction = e.code === 'ArrowUp';

            if (e.metaKey) {
                this.setState(moveLine(this.state, direction));
            } else if (e.shiftKey) {
                const isGroup = e.target.tagName === 'INPUT';
                this.setState(changeRepetitions(this.state, direction, isGroup));
            } else {
                this.setState(selectedNewLine(this.state, direction));
            }
            return;
        }

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

    handleSaveLink = () => {
        const song = btoa(JSON.stringify({
            songName: this.state.songName,
            groups: this.state.groups
        }));
        const link = `${window.location.origin}?song=${song}`;

        navigator.clipboard.writeText(link);
    }

    handleGroupNameChanged = (groupIndex, e) => {
        // @ts-ignore
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
                <div className="scene">
                    <div className="instrument">
                        <Handpan
                            handleNoteClick={this.handleNoteClick}
                        />
                    </div>

                    <div className="partition">
                        <header>
                            <input
                                type="text"
                                placeholder="Song name"
                                value={this.state.songName}
                                onChange={e => this.setState({songName: e.target.value})}
                            />
                            <button
                                type="button"
                                onClick={() => this.setState({
                                    songName: '',
                                    groups: [defaultGroup],
                                    currentGroupIndex: 0,
                                    currentLineIndex: 0
                                })}
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={this.handleSaveLink}
                            >
                                copy link
                            </button>
                        </header>

                        <ul className="groups-list">
                            {this.state.groups.map((group, gIndex) => (
                                <li
                                    key={`group-${gIndex}`}
                                    className={cn('group-item', {
                                        'is-selected': gIndex === this.state.currentGroupIndex,
                                        'is-sub-group': group.name.length === 0
                                    })}
                                >
                                    <div className="group-header">
                                        <span className="repetition-counter">
                                            {group.repetition > 1 && `x${group.repetition}`}
                                        </span>
                                        <input
                                            className="group-name"
                                            type="text"
                                            placeholder="Group name"
                                            value={group.name}
                                            onChange={e => this.handleGroupNameChanged(gIndex, e)}
                                        />
                                    </div>
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
