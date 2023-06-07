import { log } from '../src/env';
import { Roll, RollResult } from '../src';

const NOTATIONS: string[] = [
    'd%',
    'd% + 1',
    'd6',
    'd6!',
    '3d6 + 1',
    '2d6 + 2d6',
    '2d6',
    '2d6!',
    '2d6 + d8 + 2',
    'd20',
    '2de8',
    'd6! + 67 + 2de8',
];

(() => {
    log('\n*** testing started ***\n');

    NOTATIONS.forEach((notation: string) => {
        const result: RollResult = Roll(notation);
        log('result:', `'${result.notation}': ${result.breakdown} = ${result.total}`);
    });

    // for (let i = 0; i < 20; i++) {
    //     const roll = Roll('2d6!');
    //     // log('d6! =', roll);
    // }

    log('\n*** testing done ***\n');
})();