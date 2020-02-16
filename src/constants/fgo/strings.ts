import { Attribute as _Attribute, GenderType } from './';

// export const Class = {
//     [ClassType.AlterEgo]: 'Alter Ego',
//     [ClassType.Archer]: 'Archer',
//     [ClassType.Assassin]: 'Assassin',
//     [ClassType.Avenger]: 'Avenger',
//     [ClassType.Berserker]: 'Berserker',
//     [ClassType.Caster]: 'Caster',
//     [ClassType.Foreigner]: 'Foreigner',
//     [ClassType.Lancer]: 'Lancer',
//     [ClassType.MoonCancer]: 'Moon Cancer',
//     [ClassType.Rider]: 'Rider',
//     [ClassType.Ruler]: 'Ruler',
//     [ClassType.Saber]: 'Saber',
//     [ClassType.Shielder]: 'Shielder'
// }

export const Attribute = {
    [_Attribute.BEAST]: 'Beast',
    [_Attribute.EARTH]: 'Earth',
    [_Attribute.HUMAN]: 'Human',
    [_Attribute.HEAVEN]: 'Heaven',
    [_Attribute.STAR]: 'Star'
}

export const Gender = {
    [GenderType.Male]: ['Male'],
    [GenderType.Female]: ['Female'],
    [GenderType.Male | GenderType.Female]: ['Male', 'Female']
}