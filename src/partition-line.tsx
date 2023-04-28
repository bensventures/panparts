
// @ts-ignore
import cn from 'classnames';

export default function PartitionLine({ line, isSelected, handleLineClicked }) {
    return (
        <li
            className={cn('line-item', { 'is-selected': isSelected })}
            onClick={handleLineClicked}
        >
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
            {line.repetition > 1 &&
            <span className="repetition-counter">
                {line.repetition}
            </span>
            }
        </li>
    )
}
