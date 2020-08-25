# Pepper
##### just another Discord bot that provide information for some games
###### (as of commit `30977aea6c3cb1750c279a1a1aae3343be562a83`)

Currently, the bot provides data for two games: __Fate/Grand Order__ and __osu!__, through a number of commands.

This README will not cover how to use those commands, they can be obtained by calling the `help` command.

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

You need to get a snapshot of master data (can be found at [Atlas Academy Discord](https://discord.gg/TKJmuCR), possibly refer to me when you ask). You will get a number of JSON files for each locale, containing (possibly empty) arrays.

For each locale, you need to deploy all the files into a database. The collection name for each file is determined by the base file name (removing the `.json` extension).

### Credits
- GamePress for the main database
- Atlas Academy for the master data
- bloodcat.com for the beatmap search feature

### License 
Creative Commons Attribution 4.0 International. See [here](./LICENSE).