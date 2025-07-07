# FleshandBloodDiscordBot
Discord Flesh and Blood bot

Current functionalities:
- Fantasy League
  - Users can buy players based on ELO.
  - Users can chose a hero as thier "champion". A guess for who to win the given tournament
  - Admin funcionalities:
    - Get results from event coverage page
    - Leaderboard of the collective perticipants in the fantasy league
    - Lock / Unlock users from editing fantasy league teams. For preventing editing while the event is running.

If you want to give this a try, you'll need to setup a .env file with the following:
- TOKEN
- GUILD_ID
- CLIENT_ID
- ADMIN_ID

The data is saved locally, as I didn't saw the need for an external database. If you want, MONGODb would be an easy replacement of the json files.

There are two seperate scripts, you currently must run in your favorite IDE.
- data/gatherplayerdata.js (get players from the global ELO Ranking system)
- data/gatherherodata.js (get heroes of Classic Constructed that are legal to play)
