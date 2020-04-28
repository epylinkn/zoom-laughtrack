// Open and connect output socket
let socket = io('/output');

// Listen for confirmation of connection
socket.on('connect', function() {
  console.log("Connected");
});

let users = {}; // track users
let images = []; // array of URLs pointing to all images except burger

let gameState = "waiting";

let canvasWidth;
let canvasHeight;

// DEBUG
// createNewUser("foo", "FOO");
// createNewUser("bar", "BAR");
// createNewUser("qux", "QUX");
// createNewUser("wtf", "WTF");

function setup() {
  canvasWidth = windowWidth * 0.73;
  canvasHeight = windowHeight;
  createCanvas(canvasWidth, canvasHeight);

  // define game images
  const burgerIMG = loadImage("burger.png");
  const friesIMG = loadImage("fries.jpg");
  const milkshakeIMG = loadImage("milkshake.jpg");
  const hotdogIMG = loadImage("hotdog.jpg");
  const chipsIMG = loadImage("chips.jpg");

  // add new users
  socket.on('new_user', function (message) {
    let id = message.id;
    let username = message.username;

    // username doesn't already exist, creat them as a new user
    if (!(id in users)) {
      createNewUser(id, username);
    }
  });

  // add image URLs
  // images.push(burgerIMG, friesIMG, milkshakeIMG, hotdogIMG, chipsIMG);

  // SHAKE EVENT
  socket.on('user_shook', function(user) {
    let id = user.id;
    console.log(id, " shook");
  });

  // FLIP EVENT
  socket.on('user_flipped', function(user) {
    let id = user.id;
    console.log(id, " flipped");
  });

  // remove disconnected users
  socket.on('disconnected', function(id) {
    delete users[id];
  });
}

// create new user
function createNewUser(id, user) {
  users[id] = {
    id: id,
    username: user,
    shook: true,
    flipped: false,
  }
}

function draw() {
  background(255);
  textFont("Consolas");

  scoreboard();

  // [DONE] WAIT FOR PLAYERS
  if (Object.keys(users).length < 2) {
    titleText("Waiting for players... ");
    return;

  }

  // [DONE] START GAME
  if (gameState == "waiting") {
    if (second() % 2 == 0) return;

    titleText("PRESS [SPACE] TO START");
    return;
  }

  gameArea();
}

// Helper to display something in the middle...
function titleText(title) {
  push();
  fill('black');
  textAlign(CENTER, CENTER);
  let fontSize = canvasWidth / title.length;
  textSize(floor(fontSize));
  text(title, 0, 0, canvasWidth, canvasHeight);
  pop();
}

function gameArea() { // random user, random image, countdown in canvas
  // TODO: show some random bubbles
}

function scoreboard() { // generate the scoreboard in right column div with ID 'scoreboard'
  // scoreboard div
  scoreboardDiv = select('#scoreboard');

  // add game name & scoreboard text
  scoreHeaderDiv = select('#scoreHeader');
  scoreHeaderDiv.html('<h1>AUDIENCE</h1>');

  if(Object.keys(users).length > 0) {
    // dynamically generate user area
    userDiv = select('#users');
    userDiv.html(addUsers());
  }
}

// NOTE TO SELF: This is getting re-rendered in the draw loops. Not good, right?
function addUsers() {
  let output = '';

  for (let id in users) {
    if (users[id].username == undefined) continue; // why doesn't this work?
    let user = users[id];

    // create a div for each user
    let playerDiv = '<div class="user" id="player-' + id + '">';
    playerDiv += user.username + '&nbsp;&nbsp';
    playerDiv += '</div>'

    output += playerDiv;
  }

  return(output);
}

function keyPressed() {
  console.log(key)
  if (key === ' ' && gameState == 'waiting') {
    gameState = 'starting';
  }

  // DEBUG controls
  if (key === 'F') {
    socket.emit('flipped', 'foo');
  }

  if (key === 'S') {
    socket.emit('shook', 'foo');
  }
}
