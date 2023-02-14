import { createInterface } from 'readline';
import Axios from 'axios';
import colors from 'colors';

// I know this is ugly and I dont give a flying shit.

export function Authorization() {
  const ask = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(colors.gray(`This will take you through the process of getting the needed ${colors.green('Spotify')} credentials!`));
  console.log(`  ${colors.gray('1.')} Go to ${colors.blue('https://developer.spotify.com/dashboard/login')} and create a new application.`);
  console.log(`  ${colors.gray('2.')} Inside that application you will be give 2 things ${colors.bold.red('Client ID')} and ${colors.bold.red('Client Secret')}; Note them down somewhere.`);
  console.log(`  ${colors.gray('3.')} Click on ${colors.green('( ⚙ Edit Settings )')} and add a redirect uri like ${colors.cyan('http://127.0.0.1/index.html')}. Note this down somewhere as well.\n`);
  ask.question(colors.italic.grey('press enter when complete...'), () => {
    let client_id: string; let client_secret: string;
    let market: string; let redirect_url: string;
    ask.question(colors.gray(`Enter your ${colors.bold.red('Client ID')} : `), (id) => {
      client_id = id;
      ask.question(colors.gray(`Enter your ${colors.bold.red('Client Secret')} : `), (secret) => {
        client_secret = secret;
        ask.question(colors.gray(`Enter your ${colors.bold.red('Redirect URI')} : `), (red) => {
          redirect_url = red;
          console.log(`\n${colors.italic.gray(`If you would like to know your region code visit : \n${colors.blue('https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements')}`)}`);
          ask.question(colors.gray(`Enter your region code ${colors.italic('2-letter country code')} : `), (mr) => {
            if (mr.length === 2) market = mr;
            else {
              console.log(colors.bold.red('Invalid region code provided, "US" will be selected by default.'));
              market = 'US';
            }
            console.log(`\n${colors.gray(`Now open the URL posted below, press ${colors.green('( Agree )')}, and copy the redirected URL.`)}`);
            console.log(colors.blue(`https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURI(
              redirect_url
            )}\n`));
            ask.question(colors.gray('Enter the redirect URL you just copied : '), (url) => {
              const code = url.split('code=')[1];
              console.log(colors.grey('\nAttempt to authenticate with provided data...'));
              Axios.post<{ refresh_token: string }>(
                'https://accounts.spotify.com/api/token',
                `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURI(redirect_url)}`,
                {
                  headers: {
                    'Authorization': `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                  }
                }
              )
                .then((res) => {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  console.log(colors.gray(`\n\nThese are the credentials you\'ll need for ${colors.green('Spotify')} authentication.`));
                  console.log(colors.italic.gray('Please ensure to store these in an env file for safe keeping!\n'));
                  console.log(colors.gray(`client_id     : ${colors.bold(client_id)}`));
                  console.log(colors.gray(`client_secret : ${colors.bold(client_secret)}`));
                  console.log(colors.gray(`refresh_token : ${colors.bold(res.data.refresh_token)}`));
                  console.log(colors.gray(`market        : ${colors.bold(market.toUpperCase())}\n\n`));
                  ask.close();
                })
                .catch(() => {
                  console.error(colors.bold.red('\nAuth Process failed... Something you entered must have been wrong...'));
                  ask.close();
                });
            });
          });
        });
      });
    });
  });
}

