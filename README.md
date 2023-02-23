nothing fancy here yet

when installed run this in terminal to get Spotify API credentials
```bash
node -e "require('fine-tuned').Authorization()"
```

# Roadmap

- [ ] - Ditch youtube-sr for play-dl when possible.
- [ ] - Clean up stream functions, very messy very bad rn.
- [ ] - Add a method on track to see if the streaming url is expired.
- [ ] - Add a method on track to refresh the streaming url.
- [ ] - Look into hls streams randomly ending.
- [ ] - Add support for filters finally
- [ ] - Add support for using YouTube cookie so request blocking doesn't occur
- [ ] - Add support for using multiple YouTube cookies to make activity look less bot
- [ ] - Add support for registering custom extractors
- [ ] - Add support for doing piped streams to FFmpeg again for local files
- [ ] - Go through comment anchors and clean up broken shit
