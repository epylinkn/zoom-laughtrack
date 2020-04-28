// Open and connect output socket
let socket = io('/input');

// Listen for confirmation of connection
socket.on('connect', function() {
  console.log("Connected");
});

let users = {}; // track users
let gameState = 'waiting';

let usernameInput;
let playButton;

function setup() {
  // create canvas
  createCanvas(windowWidth, windowHeight);

  // bind to form elements
  usernameInput = select("#username");
  playButton = select("#start");
  playButton.mousePressed(enterPlayMode);

  socket.on("new_user", function(userAttributes) {
    console.log("new_user event");
    let id = userAttributes.id;

    if (!(id in users)) {
      createNewUser(userAttributes);
    }
  });
}

// create new user
function createNewUser(attributes) {
  users[attributes.id] = {
    id: attributes.id,
    username: attributes.username,
  }
}

function draw() {
  if (gameState == "waiting") {
    background('cyan');
  }

  if (gameState == "playing") {
    background('magenta');
    fill('yellow');

    // show only my user details
    let me = users[socket.id];
    if (me) {
      fill('black');
      textSize(120);
      textAlign(CENTER);
      text(me.username.toUpperCase(), 0, 0, windowWidth, 120);
    }
  }

  deviceFlipped();
}

function enterPlayMode() {
  console.log("playMode()");
  gameState = "playing";

  socket.emit('username', usernameInput.value());

  select(".username-form").hide();
  select("#clap").show();
}

let lastShakeTime = 0;
function deviceShaken() {
  let currentTime = millis();

  if (currentTime - lastShakeTime < 2000) {
    return;
  }

  socket.emit('shook', true);
  lastShakeTime = currentTime;
}

let lastFlippedTime = 0;
function deviceFlipped() {
  let currentTime = millis();

  if (currentTime - lastFlippedTime < 2000) {
    return;
  }

  // phone is face down
  if (abs(rotationX) > 170) {
    socket.emit("flipped", true);
    lastFlippedTime = currentTime;
  }
}
