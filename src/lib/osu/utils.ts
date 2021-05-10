import { Mods, AccuracyCount, Gamemode } from '@minhducsun2002/node-osr-parser';
import { parser, diff, ppv2, modbits } from 'ojsama';

export const ModNames = {
    [Mods.None]: '',
    [Mods.NoFail]: 'No-Fail',
    [Mods.Easy]: 'Easy',
    [Mods.TouchDevice]: 'Touch Device',
    [Mods.Hidden]: 'Hidden',
    [Mods.HardRock]: 'Hard Rock',
    [Mods.SuddenDeath]: 'Sudden Death',
    [Mods.DoubleTime]: 'Double Time',
    [Mods.Relax]: 'Relax',
    [Mods.HalfTime]: 'Half Time',
    /** Must be set along with DoubleTime (NC only gives 576) */
    [Mods.Nightcore]: 'Nightcore',
    [Mods.Flashlight]: 'Flashlight',
    [Mods.Autoplay]: 'Auto',
    [Mods.SpunOut]: 'Spun-out',
    [Mods.Autopilot]: 'Autopilot',
    /** Must be set along with SuddenDeath */
    [Mods.Perfect]: 'Perfect',
    [Mods.Key4]: '4 Key',
    [Mods.Key5]: '5 Key',
    [Mods.Key6]: '6 Key',
    [Mods.Key7]: '7 Key',
    [Mods.Key8]: '8 Key',
    [Mods.FadeIn]: 'Fade-In',
    [Mods.Random]: 'Random',
    [Mods.Cinema]: 'Cinema',
    [Mods.Target]: 'Target Practice',
    [Mods.Key9]: '9 Key',
    [Mods.KeyCoop]: 'Key Co-op',
    [Mods.Key1]: '1 Key',
    [Mods.Key3]: '3 Key',
    [Mods.Key2]: '2 Key',
    [Mods.ScoreV2]: 'Score V2',
    [Mods.Mirror]: 'Mirror'
}

export function modToString(m : number) {
    let out = [];
    for (let key in Mods)
        if (m & (+Mods[key])) out.push(ModNames[+Mods[key] as keyof typeof ModNames]);
    return out;
}

export const accuracy = {
    [Gamemode.STANDARD]: ({ countMiss, count50, count100, count300 } : AccuracyCount) => {
        return (count50 / 6 + count100 / 3 + count300) / (countMiss + count50 + count100 + count300)
    },

    [Gamemode.TAIKO]: ({ countMiss, count100, count300 } : AccuracyCount) => {
        return (count100 / 2 + count300) / (count100 + count300 + countMiss)
    },

    [Gamemode.MANIA]: ({ countMiss, count100, count100k, count300, count300k, count50 } : AccuracyCount) => {
        return (count50 / 6 + count100 / 3 + count100k / 2 + 300 * (count300 + count300k))
            / (countMiss + count100 + count100k + count300 + count300k + count50)
    },

    [Gamemode.CATCH]: ({ countMiss, count100, count100k, count300, count300k, count50 } : AccuracyCount) => {
        return (count50 / 6 + count100 / 3 + count100k / 2 + 300 * (count300 + count300k))
            / (countMiss + count100 + count100k + count300 + count300k + count50)
    }
}


export const calculatePP = (map : string, combo : number, accuracy : number, mods : modbits = modbits.nomod) => {
    let _parser = new parser(); _parser.feed(map);
    return ppv2({
        stars: new diff().calc({ map: _parser.map }),
        acc_percent: accuracy, combo, mods
    });
}