type Groups = {
    name: string
    repetition: number,
    lines: Array<Line>
};

type Line = {
    repetition: number,
    taps: Array<Array<Tap>>
};

type Tap = {
    note: string
    hand: string
};
