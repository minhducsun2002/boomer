import { GenderType, Trait as _Trait } from './';

export const Gender = {
    [GenderType.Male]: ['Male'],
    [GenderType.Female]: ['Female'],
    [GenderType.Male | GenderType.Female]: ['Male', 'Female']
}

export const Trait = {
    [_Trait.attributeStar]: 'Star',
    [_Trait.attributeBeast]: 'Beast',
    [_Trait.attributeEarth]: 'Earth',
    [_Trait.attributeHuman]: 'Human',
    [_Trait.attributeSky]: 'Heaven',
    [_Trait.automata]: 'Automata',
    [_Trait.brynhildsBeloved]: `Brynhildr's Beloved`
}