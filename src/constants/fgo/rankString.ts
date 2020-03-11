const rankList: string[][] = [
    [],
    ["", "A", "A+", "A++", "A-", "A+++"],
    ["", "B", "B+", "B++", "B-"],
    ["", "C", "C+", "C++", "C-", "C+++"],
    ["", "D", "D+", "D++", "D-", "D+++"],
    ["", "E", "E+", "E++", "E-", "E+++"],
    ["", "EX"]
]

export default function (s: number) {
    if (s === 98) return "?"
    let out = rankList[Math.floor(s / 10)];
    if (out) return ""; if (!out[Math.floor(s % 10)]) return "";
    return out[Math.floor(s % 10)]
}