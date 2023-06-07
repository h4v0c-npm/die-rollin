import * as stringMath from 'string-math';
import { randomRange } from '@h4v0c/rng';
import { log } from './env';

declare type Tokens = RegExpMatchArray | null;

const REGEX_NUMBER = /^\d+$/;
const REGEX_OPERATOR = /^[+-/*]$/;
const REGEX_PERCENTILE = /^d%$/;
const REGEX_EXPLODING = /^(\d+)?d(\d+)!$/;
const REGEX_VALID_CHARACTERS = /[^0-9d%!+-/*\s]+/g;
const REGEX_TOKENIZE = /(d%)|((\d+)?d(\d+)[!%]?)|([+-/*])|(\d+)/g;

enum ResultType { CONSTANT, OPERATOR, ROLL };

export interface RollResult {
    notation: string,
    breakdown: string,
    total: number,
};

interface Result {
    type: ResultType,
    token: string,
    rolls: number[],
    total: number,
};

const _calculate = (str: string): number => {
    try {
        return stringMath(str);
    } catch (err) {
        console.error('ERR: _calculate: invalid math string:', str);
        console.error(err.message);
        return 0;
    }
};

const _rollPercentiles = (): Result => {
    const rolls: number[] = [
        0,//randomRange(10),
        0,//randomRange(10),
    ];

    const total = (rolls[0] === 0 && rolls[1] === 0) ? 100 : _calculate(rolls.join(' + '));

    return {
        type: ResultType.ROLL,
        token: 'd%',
        rolls,
        total,
    };
};

const _roll = (token: string): Result => {
    if (token.match(REGEX_PERCENTILE)) {
        return _rollPercentiles();
    } else {
        const exploding: boolean = (token.match(REGEX_EXPLODING) != null);

        let str: string = `${token}`;

        if (exploding) str = str.replace('!', '');

        let [count, sides] = str.split('d').map((s: string) => {
            const n: number = parseInt(s);
            return isNaN(n) ? 1 : n;
        });

        const rolls: number[] = [];

        while (count--) {
            const die: number = randomRange(1, sides + 1);

            if (exploding && die === sides) count++;

            rolls.push(die);
        }

        const total = _calculate(rolls.join(' + '));

        return {
            type: ResultType.ROLL,
            token,
            rolls,
            total,
        };
    }
};

export function Roll(notation: string): RollResult {
    const tokens: Tokens = (`${notation}`)
        .toLowerCase()
        .trim()
        .replace(REGEX_VALID_CHARACTERS, '')
        .match(REGEX_TOKENIZE);

    // log('tokens:', tokens);

    const results: Result[] = [];

    tokens?.forEach((token: string) => {
        if (token.match(REGEX_NUMBER)) {
            results.push({
                type: ResultType.CONSTANT,
                token,
                rolls: [],
                total: parseInt(token),
            });
        } else if (token.match(REGEX_OPERATOR)) {
            results.push({
                type: ResultType.OPERATOR,
                token,
                rolls: [],
                total: 0,
            });
        } else {
            results.push(_roll(token));
        }
    });

    // log(`'${notation}':`, results);

    const rolls: string[] = [];
    let total: number = 0;

    results.forEach((result: Result) => {
        switch (result.type) {
            case ResultType.CONSTANT: {
                rolls.push(result.token);
                total += result.total;
                break;
            }

            case ResultType.OPERATOR: {
                rolls.push(result.token);
                break;
            }

            case ResultType.ROLL: {
                if (result.token.match(REGEX_PERCENTILE)) {
                    const rollsTotal: number = result.total;
                    rolls.push(`(${result.token}: [${result.rolls.join(', ')}] = ${rollsTotal})`);
                    total += result.total;
                } else {
                    const rollsTotal: number = _calculate(result.rolls.join('+'));
                    rolls.push(`(${result.token}: [${result.rolls.join(' + ')}] = ${rollsTotal})`);
                    total += result.total;
                }

                break;
            }

            default: break;
        }
    });

    const result = {
        notation,
        breakdown: rolls.join(' '),
        total,
    };

    // log('result:', result);

    return result;
}