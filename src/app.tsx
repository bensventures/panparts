
import { useState } from 'react';
import cn from 'classnames';

import Handpan from './handpan';

export function App() {
    const [tapsList, setTaps] = useState([])

    function handleNoteClick(e) {
        const { target } = e;
        const taps = [ ...tapsList ];

        if (target.tagName === 'path') {
            const note = target.dataset.note;
            const hand = e.buttons === 0 ? 'left' : 'right';
            const newTap = {
                note,
                hand
            };

            if (e.ctrlKey) {
                taps[taps.length-1].push(newTap);
            } else {
                taps.push([newTap]);
            }

            setTaps(taps);
        }
    }

    window.addEventListener('keydown', (e) => {
        if (e.code === 'Backspace') {
            const taps = [ ...tapsList ];
            taps.pop();

            setTaps(taps);
        }
    });

    return (
        <div>
            <header>
                <h1 contentEditable={true}>
                    New song
                </h1>
                <button
                    type="button"
                    onClick={() => setTaps([])}
                >
                    Clear
                </button>
            </header>
            <div className="scene">
                <div className="instrument">
                    <Handpan
                        handleNoteClick={handleNoteClick}
                    />
                </div>

                <ul className="notes-list">
                    {tapsList.map((taps, index) => (
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
            </div>
        </div>
    );
}
