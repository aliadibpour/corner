const http = require('http');
const express = require('express');
const { Server } = require("socket.io");
const { default: puppeteer } = require('puppeteer');
require("dotenv").config()

const app = express();
const server = http.createServer(app);
console.log("adib")
app.get("/", (req, res) => {
  res.send("hello server in production")
})
const io = new Server(server ,{
  cors: "*"
})
io.on('connection', async (socket) => {  
  io.emit("a", "ali adib")
  // const browser = await puppeteer.launch({
  //   headless: true,
  //   //executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable',
  //   executablePath: '/opt/render/dist/chromium/',
  //   //args: ['--no-sandbox', '--disable-setuid-sandbox']
  //   // executablePath: "C:\Users\Ali\.cache\puppeteer\chrome\win64-129.0.6668.89\chrome-win64/chrome"
  // }); 

  const browser = await puppeteer.launch({
    // args: [
    //   "--disable-setuid-sandbox",
    //   "--no-sandbox",
    //   "--single-process",
    //   "--no-zygote",
    // ],
    executablePath:
        process.env.PUPPETEER_EXECUTABLE_PATH
        || puppeteer.executablePath(),
  });
  try {
    const url = `https://football360.ir/results`;
    
    const page = await browser.newPage();
    await page.setViewport({width: 1080, height: 1024});
    page.setDefaultNavigationTimeout( 90000 );
    await page.goto(url);
    await page.waitForSelector('.Sections_container__03lu8')
  
    console.log('A user connected');
    socket.emit("load", "load complete")
    
    const matchList = await getMatchList(page)
    socket.emit("message", matchList)
  
    socket.on("click", async function(data, callback) {
      const date = new Date();
      const today = date.toISOString().split('T')[0];
  
      try {
        if (data === today) {
          await page.click(`div > a[href="/results"]`);
        } else {
          await page.click(`a[href="/results?day=${data}"]`);
          //await page.goto(`${url}?day=${data}`)
        }
      } catch (error) {
        callback(false)
      }
    })
  
    socket.on("message",async function(data, callback) {
      console.log(`Received message from client: ${data}`);
      try {
        const matchList = await getMatchList(page)
        callback(matchList)
      } catch (error) {
        callback(false)
      }
    })

    socket.on("disconnect", async () => {
      await browser.close()
    })
  } catch (error) {
    socket.emit("message", false)
  }
});

const getMatchList = async (page) => {
  return await page.evaluate(async() => {
    const matches = Array.from(document.querySelectorAll('.Sections_container__03lu8'))        
    return matches.map((product)=> {
        const league = product.querySelector('h2').innerHTML;
        const leagueImage = product.querySelectorAll('img')[0].src
        const matchList = Array.from(product.querySelectorAll('li'))
            .map((match) => {
                const score = match.querySelector('.style_match__Fiqcg');
                const homeTeam = match.querySelectorAll('.style_title__VxtR3')[0];
                const awayTeam = match.querySelectorAll('.style_title__VxtR3')[1];
                const teamImage = match.querySelectorAll('img');
                const homeTeamImage = teamImage[0].src
                const awayTeamImage = teamImage[1].src
                const matchFinish = match.querySelector('.style_date__t6_B6')
                const matchMinutes = match.querySelector('.style_live__7m2Y6 span')
                const matchMinutesAfter90 = match.querySelector('.style_live__7m2Y6')
                const matchCancel = match.querySelector('.style_canceled__RcO8s')
                const matchAdjournment = match.querySelector('.style_date__t6_B6')
                return {
                    // score: matchCancel ? matchCancel.innerHTML :
                    // matchAdjournment ? matchAdjournment.innerHTML :
                    // score.innerHTML.split(':').reverse().join(':'),
                    score: score.innerHTML.split(':').reverse().join(':') || false,
                    homeTeam: homeTeam.innerHTML,
                    awayTeam: awayTeam.innerHTML,
                    homeTeamImage,
                    awayTeamImage,
                    matchFinish: matchFinish ? matchFinish.innerHTML : false,
                    matchMinutes: matchMinutes ? matchMinutes.innerHTML : false,
                    matchAdjournment: matchAdjournment?.innerHTML || false,
                    matchCancel: matchCancel?.innerHTML || false,
                    matchMinutesAfter90: matchMinutesAfter90?.innerHTML || false
                }
            })                  
        return {league, leagueImage, matchList}
    }) 
  })
}

server.listen(3000, ()=> {
  console.log('Server is running on http://localhost:3000');
});