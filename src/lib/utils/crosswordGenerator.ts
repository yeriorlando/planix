export interface CrosswordItem {
    word: string;
    clue: string;
}

export interface PlacedWord {
    word: string;
    clue: string;
    row: number;
    col: number;
    isHorizontal: boolean;
    number: number;
}

export interface CrosswordGrid {
    grid: { letter: string; number?: number }[][];
    placedWords: PlacedWord[];
    width: number;
    height: number;
}

/**
 * Basic heuristic-based crossword generator.
 * Tries to place words intersecting with already placed words.
 */
export function generateCrossword(items: CrosswordItem[], maxAttempts = 50): CrosswordGrid {
    let bestGrid: CrosswordGrid = { grid: [], placedWords: [], width: 0, height: 0 };
    let maxWordsPlaced = 0;

    // Retry the whole generation a few times to get the best layout
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Shuffle items or sort by length to vary layouts
        const shuffledItems = attempt === 0
            ? [...items].sort((a, b) => b.word.length - a.word.length) // 1st try: largest first
            : [...items].sort(() => Math.random() - 0.5); // Next tries: random

        const currentPlacedWords: PlacedWord[] = [];

        // Logical absolute coordinates (can be negative during generation)
        const logicalGrid = new Map<string, { letter: string }>();

        const getCoordKey = (r: number, c: number) => `${r},${c}`;

        // Place first word at 0,0 horizontally
        if (shuffledItems.length > 0) {
            const first = shuffledItems[0];
            let c = 0;
            for (let i = 0; i < first.word.length; i++) {
                logicalGrid.set(getCoordKey(0, c), { letter: first.word[i] });
                c++;
            }
            currentPlacedWords.push({
                word: first.word,
                clue: first.clue,
                row: 0,
                col: 0,
                isHorizontal: true,
                number: 0 // Will assign numbers later
            });
        }

        // Try placing the rest
        for (let i = 1; i < shuffledItems.length; i++) {
            const item = shuffledItems[i];
            const word = item.word;

            let placed = false;
            // Find all possible intersections with currently placed letters
            const possibleIntersections: { r: number, c: number, dx: number, dy: number, letterIndex: number }[] = [];

            for (let wIndex = 0; wIndex < word.length; wIndex++) {
                const char = word[wIndex];
                // Check map for this char
                logicalGrid.forEach((cell, key) => {
                    if (cell.letter === char) {
                        const [rStr, cStr] = key.split(',');
                        const r = parseInt(rStr);
                        const c = parseInt(cStr);

                        // If the existing letter belongs to a horizontal word, we must go vertical
                        const isExistingHorizontal = currentPlacedWords.some(pw =>
                            pw.isHorizontal && r === pw.row && c >= pw.col && c < pw.col + pw.word.length
                        );

                        // We loosely assume: try vertical if horizontal exists there, else horizontal
                        // A more robust check tests both if the intersecting cell isn't bounded
                        if (isExistingHorizontal) {
                            possibleIntersections.push({ r, c, dx: 0, dy: 1, letterIndex: wIndex });
                        } else {
                            possibleIntersections.push({ r, c, dx: 1, dy: 0, letterIndex: wIndex });
                        }
                    }
                });
            }

            // Shuffle intersections to avoid always picking top-left
            possibleIntersections.sort(() => Math.random() - 0.5);

            for (const intersection of possibleIntersections) {
                const startRow = intersection.r - (intersection.letterIndex * intersection.dy);
                const startCol = intersection.c - (intersection.letterIndex * intersection.dx);

                // Check if valid placement (no collisions, no adjacent letters forming unwanted words)
                let isValid = true;

                for (let k = 0; k < word.length; k++) {
                    const checkR = startRow + (k * intersection.dy);
                    const checkC = startCol + (k * intersection.dx);

                    const existingCell = logicalGrid.get(getCoordKey(checkR, checkC));

                    if (existingCell && existingCell.letter !== word[k]) {
                        isValid = false; break; // Direct collision
                    }

                    if (!existingCell) {
                        // Check adjacent cells (top/bot if horizontal, left/right if vertical) to prevent touching
                        const adj1 = logicalGrid.get(getCoordKey(checkR + intersection.dx, checkC + intersection.dy)); // perpendicular
                        const adj2 = logicalGrid.get(getCoordKey(checkR - intersection.dx, checkC - intersection.dy));

                        if (adj1 || adj2) {
                            isValid = false; break;
                        }

                        // Also check start/end caps
                        if (k === 0) {
                            const capBefore = logicalGrid.get(getCoordKey(checkR - intersection.dy, checkC - intersection.dx));
                            if (capBefore) { isValid = false; break; }
                        }
                        if (k === word.length - 1) {
                            const capAfter = logicalGrid.get(getCoordKey(checkR + intersection.dy, checkC + intersection.dx));
                            if (capAfter) { isValid = false; break; }
                        }
                    }
                }

                if (isValid) {
                    // Place it
                    for (let k = 0; k < word.length; k++) {
                        logicalGrid.set(
                            getCoordKey(startRow + (k * intersection.dy), startCol + (k * intersection.dx)),
                            { letter: word[k] }
                        );
                    }
                    currentPlacedWords.push({
                        word: item.word,
                        clue: item.clue,
                        row: startRow,
                        col: startCol,
                        isHorizontal: intersection.dx === 1,
                        number: 0
                    });
                    placed = true;
                    break;
                }
            }

            // If we really want to force placement without intersection (island), we could, but a crossword should be connected.
            // We'll just skip words we can't connect, saving them.
        }

        if (currentPlacedWords.length > maxWordsPlaced) {
            maxWordsPlaced = currentPlacedWords.length;

            // Normalize logical grid to start at 0,0 and create a 2D array
            let minR = Infinity, maxR = -Infinity;
            let minC = Infinity, maxC = -Infinity;

            currentPlacedWords.forEach(pw => {
                if (pw.row < minR) minR = pw.row;
                if (pw.col < minC) minC = pw.col;

                const endR = pw.row + (pw.isHorizontal ? 0 : pw.word.length - 1);
                const endC = pw.col + (pw.isHorizontal ? pw.word.length - 1 : 0);

                if (endR > maxR) maxR = endR;
                if (endC > maxC) maxC = endC;
            });

            // Adjust coordinates to positive relative (0,0)
            const w = maxC - minC + 1;
            const h = maxR - minR + 1;

            // Build visual Grid
            const finalGrid: { letter: string; number?: number }[][] = Array(h).fill(null).map(() => Array(w).fill(null));

            // Assign numbers (Standard crossword numeric ordering: top-to-bottom, left-to-right)
            currentPlacedWords.forEach(pw => {
                pw.row -= minR;
                pw.col -= minC;
            });

            currentPlacedWords.sort((a, b) => {
                if (a.row !== b.row) return a.row - b.row;
                return a.col - b.col;
            });

            let currentNumber = 1;
            currentPlacedWords.forEach(pw => {
                // If there's already a word starting here (e.g. crossing start), share the number
                const existing = currentPlacedWords.find(other => other !== pw && other.row === pw.row && other.col === pw.col && other.number > 0);
                if (existing) {
                    pw.number = existing.number;
                } else {
                    pw.number = currentNumber++;
                }

                // Fill Grid
                for (let i = 0; i < pw.word.length; i++) {
                    const r = pw.row + (pw.isHorizontal ? 0 : i);
                    const c = pw.col + (pw.isHorizontal ? i : 0);

                    if (!finalGrid[r][c]) {
                        finalGrid[r][c] = { letter: pw.word[i] };
                    }
                    if (i === 0) {
                        finalGrid[r][c].number = pw.number;
                    }
                }
            });

            bestGrid = { grid: finalGrid, placedWords: currentPlacedWords, width: w, height: h };
        }

        // If we placed all words, stop trying
        if (maxWordsPlaced === items.length) break;
    }

    return bestGrid;
}
