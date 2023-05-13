
export const defaultLine: Line = {
    repetition: 1,
    taps: []
}

export const defaultGroup: Groups = {
    name: '',
    repetition: 1,
    lines: [{
        ...defaultLine
    }],
}

export const storageKey = 'panpart';

export function saveToStorage({ groups }) {
    window.localStorage.setItem(storageKey, JSON.stringify(groups));
}

export function addNewLine({groups, currentLineIndex, currentGroupIndex}) {
    const newGroups = structuredClone(groups);
    const currentGroup = newGroups[currentGroupIndex];
    const linesCopy = currentGroup.lines;

    linesCopy.splice(currentLineIndex + 1, 0, {...defaultLine});

    return {
        groups: newGroups,
        currentLineIndex: currentLineIndex + 1
    }
}

export function addNoteToSelectedLine(
    {groups, currentGroupIndex, currentLineIndex},
    {note, hand, addToPrevious}
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

    return {
        groups: groupsCopy
    };
}

export function deleteLastNoteFromSelectedLine({groups, currentGroupIndex, currentLineIndex}) {
    const newGroups = structuredClone(groups);
    const currentGroup = newGroups[currentGroupIndex];
    const linesCopy = currentGroup.lines;
    const currentLine = linesCopy[currentLineIndex];
    let newCurrentGroupIndex = currentGroupIndex;
    let newCurrentLineIndex = currentLineIndex;

    currentLine.taps.pop();

    if (currentLine.taps.length === 0) {
        if (linesCopy.length > 1 || newGroups.length > 1) {
            linesCopy.splice(newCurrentLineIndex, 1);
            newCurrentLineIndex = newCurrentLineIndex - 1;
        }

        if (currentGroup.lines.length === 0 && newGroups.length > 1) {
            const prevGroup = groups[currentGroupIndex - 1];
            newGroups.splice(currentGroupIndex, 1);
            newCurrentGroupIndex = newCurrentGroupIndex - 1;
            newCurrentLineIndex = prevGroup.lines.length - 1;
        }
    }

    return {
        groups: newGroups,
        currentGroupIndex: newCurrentGroupIndex,
        currentLineIndex: newCurrentLineIndex
    };
}

export function addNewGroup({groups, currentGroupIndex}) {
    const newGroups = structuredClone(groups);

    newGroups.splice(currentGroupIndex + 1, 0, {...defaultGroup});

    return {
        groups: newGroups,
        currentGroupIndex: currentGroupIndex + 1,
        currentLineIndex: 0
    };
}

export function selectedNewLine({ groups, currentGroupIndex, currentLineIndex }, up) {
    let newGroupIndex = currentGroupIndex;
    let newLineIndex = currentLineIndex;
    const currentGroup = groups[newGroupIndex];

    if (up) {
        newLineIndex -= 1;

        if (newLineIndex < 0) {
            const prevGroup = groups[currentGroupIndex - 1];

            if (prevGroup) {
                newGroupIndex = currentGroupIndex - 1;
                newLineIndex = prevGroup.lines.length - 1;
            } else {
                newLineIndex = 0;
            }
        }
    } else {
        newLineIndex += 1;

        if (newLineIndex >= currentGroup.lines.length) {
            const nextGroup = groups[currentGroupIndex + 1];

            if (nextGroup) {
                newGroupIndex = currentGroupIndex + 1;
                newLineIndex = 0;
            } else {
                newLineIndex = currentLineIndex;
            }
        }
    }

    return {
        currentGroupIndex: newGroupIndex,
        currentLineIndex: newLineIndex
    };
}

export function moveLine({ groups, currentGroupIndex, currentLineIndex }, up) {
    const groupsCopy = structuredClone(groups);
    let currentGroup = groupsCopy[currentGroupIndex];
    const currentLine = currentGroup.lines[currentLineIndex];
    let toGroup = currentGroup;
    let toGroupIndex = currentGroupIndex;
    let toIndex = currentLineIndex + (up ? -1 : 1);

    if (up) {
        if (toIndex < 0) {
            toGroup = groupsCopy[currentGroupIndex - 1];

            if (toGroup) {
                toGroupIndex = toGroupIndex - 1;
                toIndex = toGroup.lines.length;
            } else {
                return;
            }
        }
    } else {
        if (toIndex > currentGroup.lines.length - 1) {
            toGroup = groupsCopy[currentGroupIndex + 1];

            if (toGroup) {
                toGroupIndex = toGroupIndex + 1;
                toIndex = 0;
            } else {
                return;
            }
        }
    }

    // Remove current line from where it is
    currentGroup.lines.splice(currentLineIndex, 1);
    // Append line at the position we want and selected it
    toGroup.lines.splice(toIndex, 0, currentLine);

    return {
        groups: groupsCopy,
        currentGroupIndex: toGroupIndex,
        currentLineIndex: toIndex
    }
}

export function duplicateSelectedLine({ groups, currentGroupIndex, currentLineIndex }) {
    const groupsCopy = structuredClone(groups);
    const currentGroup = groupsCopy[currentGroupIndex];
    const linesCopy = currentGroup.lines;
    const duplicateLine = structuredClone(linesCopy[currentLineIndex]);

    linesCopy.splice(currentLineIndex, 0, duplicateLine);

    return {
        groups: groupsCopy,
        currentLineIndex: currentLineIndex + 1
    };
}

export function changeRepetitions({ groups, currentGroupIndex, currentLineIndex }, add, isGroup) {
    const groupsCopy = structuredClone(groups);
    const currentGroup = groupsCopy[currentGroupIndex];
    const linesCopy = currentGroup.lines;
    const selectedElement = isGroup ? currentGroup : linesCopy[currentLineIndex];

    selectedElement.repetition = add ? selectedElement.repetition + 1 : selectedElement.repetition - 1;

    if (selectedElement.repetition < 1) {
        selectedElement.repetition = 1;
    }

    return {
        groups: groupsCopy,
    };
}
