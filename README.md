# Pepper
##### just another Discord bot that provide information for some games
###### (as of commit `30977aea6c3cb1750c279a1a1aae3343be562a83`)

Currently, the bot provides data for two games: __Fate/Grand Order__ and __osu!__, through a number of commands.

This README will not cover how to use them - call the `help` command.

### Prerequisites
- Node.js v14.8.0. I don't test with anything after 14.8.0 yet, feel free to try.
- Anything that my dependencies require. For reference, I developed my bot on a `x86_64` Linux system.
- Data source for F/GO. I'll explain this later.

### Configuration
The bot reads configuration from a JSON file in the `config` folder of the current working directory.

The JSON file name is determined by concatenating the value of `NODE_ENV` environment variable with `.json`. If the variable is not set, it defaults to `development`.

The JSON file must follow the example below:
```json
{
    "prefix": {
        "fgo": ["b!"],
        // an array of strings as prefix for F/GO-related commands
        "osu": ["o!"]
        // an array of strings as prefix for osu!-related commands
    },
    "database": {
        "fgo": {
            "main": "Connection URI for main F/GO DB",
            "masterData": {
                "NA": "Connection URI for F/GO NA master data DB",
                "JP": "Connection URI for F/GO NA master data DB"
            }
        }
    }
}
```
Additionally :
- `repository` & `version` fields must be set up properly in `package.json`
- Bot token must be set in `DISCORD_TOKEN` environment variable
- osu! API key (for APIv1) must be set in `OSU_API_KEY` environment variable

The bot owner will be determined automatically (if the bot belongs to an user, that user will become the only owner; in case of teams, all team members are owners).
###### (Don't like this? Edit the client instantiation logic in [`src/index.ts`](src/index.ts))

### Data source for F/GO
The "main" database follows the schema defined in [`src/db/fgo/main.ts`](src/db/fgo/main.ts). Save it into a collection named `servants`.

The `masterData` (either `NA` or `JP`) databases are more complicated.

You need to get a snapshot of master data, which should be a number of JSON files for each locale, containing (possibly empty) arrays.

For each locale, you need to deploy all the files into a MongoDB database. The collection name for each file is determined by the base file name (removing the `.json` extension).

### License
Copyright (C) 2019 minhducsun2002

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

> Changes in commits up to and including `967e9d32766aa9c2c94d4f1a9e3da13481d13f77` are also licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). (I used CC-BY 4.0 previously, but that license is not really recommended for software.)