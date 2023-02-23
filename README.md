# Fine Tuned
Fine Tuned is a Discord.js audio streaming package based off of [discord-player](https://github.com/Androz2091/discord-player) by [Androz2091](https://github.com/Androz2091). It is meant to deliver similar functionality just executed differently to fit my use case.

## Current State
Fine Tuned is currently in a half functional state. It will indeed play music, but
it will only play the first song in the queue, when a track finishes it is not removed
from the queue, there are only play and seek methods exposed, timestamps are broken and
not tested, and there are multiple memory leaks as transport pipelines are not destroyed.

In its current state I would only install it if you are planning on taking whats already made and modifying it for your own use.

## Installation
```bash
npm i fine-tuned 
```

Required peer dependencies

```bash
npm i @discordjs/opus@0.8.0 @discordjs/voice@0.14.0 ffmpeg-static@5.1.0
```

Developed on `discord.js@14.7.0` later versions cannot guarantee functionality.

## Authorization
In order to utilize Spotify you will need to register a Spotify developer app.
> Other packages achieve Spotify support by scraping data from the embed Iframes.
This does not guarantee the data will be there though and ultimately is missing data.
Through the Spotify API we are able to ensure we get the data we need.

Not to worry though, there is a guided CLI tool for getting these credentials! Just run:
```bash
node -e "require('fine-tuned').Authorization()"
```

## Getting Started
This is just a very half effort example of how to use it in its current state. Once again
I reiterate this package is still in early development and is missing like everything.

```js
const { Client } = require('discord.js')
const { FineTuned } = require('fine-tuned')
import { joinVoiceChannel } from '@discordjs/voice'

const client = new Client(...)
const fineTuned = new FineTuned(client, {
  // This is optional, but without it spotify extractor won't function.
  spotify: {
    client_id:     "SPOTIFY_CLIENT_ID",
    client_secret: "SPOTIFY_CLIENT_SECRET",
    refresh_token: "SPOTIFY_REFRESH_TOKEN",
    market:        "SPOTIFY_MARKET_CODE",
  }
})

client.once('ready', async () => {
  if (fineTuned.options.spotify)
    await fineTuned.authSpotify()
})

client.on('messageCreate', async (m) => {
  // Ignore DMs.
  if (!m.guild) return;
  // Ignore bots.
  if (m.author.bot) return;

  // Check if member is in a voice channel.
  const vc = m.member?.voice.channelId;
  if (!vc) return m.reply('You are not in a voice channel!');

  // Use the message content as the query
  const query = m.content;

  // Gets a queue for the guild.
  const queue = client.fineTuned.queue.getElseCreate(m.guild.id);

  // Attempts to get a search result from query.
  const result = await queue.search(query);

  if (!result.playlist && !result.tracks[0])
    return m.reply(`Could not find a song for the query "${query}"!`);

  // Adds the result to the queue.
  queue.add(result.playlist ?? result.tracks)

  // If no queue connection.
  if (!queue.connection) {
    // Create a new voice connection.
    const connection = await joinVoiceChannel({
      guildId: m.guild.id,
      channelId: vc,
      adapterCreator: m.guild.voiceAdapterCreator,
    })

    // Link the queue to that connection.
    queue.linkConnection(connection)
  }

  // Play the queue.
  await queue.play();

  // As stated package is still a WIP. Whatever is currently playing
  // is not exposed.
  return m.reply('Playing!')
})

client.login("BOT_TOKEN")
```

## Roadmap
Most of this is random stuff that I need to do. Not a definite layout.

- [ ] Switch to play-dl fully for scraping.
- [ ] Clean up stream functions, very messy very bad rn.
- [ ] Redo Track and Playlist structures to contain better data. 
- [ ] Add a method on track to see if the streaming url is expired.
- [ ] Add a method on track to refresh the streaming url.
- [ ] Expose the rest of the needed api.
- [ ] Make the queue actually do what its supposed to.
- [ ] Take time to ensure all pipelines are cleansed and there are no mem leaks.
- [ ] Add event emitters in.
- [ ] Look into hls streams randomly ending.
- [ ] Add more extractor types.
- [ ] Add support for filters finally.
- [ ] Add support for using YouTube cookie so request blocking doesn't occur.
- [ ] Add support for using multiple YouTube cookies to make activity look less bot.
- [ ] Add support for registering custom extractors.
- [ ] Add support for doing piped streams to FFmpeg again for local files.
- [ ] Go through comment anchors and clean up broken stuff.

## License
[MIT](https://choosealicense.com/licenses/mit/)
