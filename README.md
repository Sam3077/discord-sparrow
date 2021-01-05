# discord-sparrow

## Purpose
- This is a Discord bot that automates the retrieval of media and content for my Raspberry Pi media server.
- It allows me and my roomates to search for content and initiate the download process.
- It also hides its requests behind a VPN, which is disabled after the download is finished to improve stream speeds.

## Usage
- The `Sparrow` bot is live on Discord and can be added to servers via https://discord.com/oauth2/authorize?client_id=795211051745804348&scope=bot
  - However, this is useless for the average person here since only a few select Discord users are authorized to use the bot.
- `Sparrow` only responds to DMs of a specific format:
  - [show | movie] [search query...]
  - The search query can be any number of words long and is used to search on thepiratebay.
  
## Running your own instance
- If you want to do some testing or make your own version, you'll need to make your own instance.

### Prerequesites
- Node.js and NPM, available [here](https://nodejs.org/en/)
- A Typescript IDE. I suggest [VSCode](https://code.visualstudio.com/)

### Steps
- Clone the repo with `git clone https://github.com/Sam3077/discord-sparrow.git`
- Move into the project directory `cd discord-sparrow`
- Download all the dependencies with `npm i`
- Make a new file `src/private-config.json`
  - This file is automatically ignored by `.git` so it won't be exposed to anyone.
    - Moreover, any file that starts with `private` is ignored.
  - This file requires three entries:
    - "token": which comes from registering an application and bot with Discord. 
      - Create a new application on https://discord.com/developers/applications.
      - Select the `bot` tab and add a bot to the application.
      - Copy the value in the `token` field.
    - "authorizedUsers": This is an array of the Discord tags of the users who can use your version of the bot.
      - Each entry should be in the format "name#1234"
    - "sudoPassword": This is used for activating a VPN on linux. This process requires the sudo password for your user. 
- Once that file is created you're good to go!
- `npm start` compiles and runs the bot
- `npm compile` just compiles it.
- Compiled javascript is output to `distr/`.
- If you want to run without compiling, you can do `node distr/index.js`
- I suggest doing `node distr/index.js > output.log 2>&1 &` when running.
  - This runs the server as a background process and outputs both stdout and stderr to `output.log`.
  - If you only want to redirect stderr to the file, you could do `node distr/index.js 2> output.log &`.
  - But for testing `node distr/index.js` works fine and everything will be visible in the terminal!

## Planned Improvements
- Update dependencies to use my fork of `thepiratebay`
  - Currently the package needs to be manually updated to fix issues on Linux.
  - My fork should fix that but it needs some testing.
- Use a `constants` file with things that can be updated with command line arguments or environment variables.
  - Things like the download location, delay time for the VPN, etc.
  - Maybe just put these in the config file, that'd be pretty easy.
- Do HTTP requests rather than web-scraping to search for content.
  - Scraping is the slowest part of the process since it requires a chromium instance and uses pupetteer.
- Seed for a set period of time after finishing the download.
  - First of all it's like the "good thing to do".
  - Also seeder credit will improve future download speeds.
- Save stats reports.
  - A stat reporter that periodically logs information like speeds, the heat of the unit, torrent information, etc would be useful
- Better user authentication.
  - I just have a private list of authorized Discord users. That works, but it's not the best.
- More fun things.
  - Why not send a gif while stuff is loading?
  - IDK, it's all very clinical right now and that's boring. 
- Automatically categorize things.
  - If a download has multiple files, it's probably a TV Show.
  - Maybe the search data will have info on the type.
- Allow multiple download locations for content types.
  - If the movie drive is full, move to a secondary drive, for instance. 
