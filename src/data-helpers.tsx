
export function addNoteToSelectedLine(
    { groups, currentGroupIndex, currentLineIndex },
    { note, hand, addToPrevious }
) {
    const groupsCopy = structuredClone(groups);
    const currentGroup = groupsCopy[currentGroupIndex];
    const linesCopy = currentGroup.lines;
    const currentLine = linesCopy[currentLineIndex];
    const newTap = {
        note,
        hand
    };

    if (addToPrevious) {
        currentLine.taps[currentLine.taps.length - 1].push(newTap);
    } else {
        currentLine.taps.push([newTap]);
    }

    return groupsCopy;
}
