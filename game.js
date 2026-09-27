"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let W = 1280;
let H = 720;

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

/* =========================
   MENU
========================= */

const menu = document.getElementById("menu");
const garage = document.getElementById("garage");
const controllerScreen = document.getElementById("controllerScreen");
const game = document.getElementById("game");

const loading = document.getElementById("loading");
const loadingFill = document.getElementById("loadingFill");

let selectedDriver = 0;

setTimeout(() => {
    loadingFill.style.width = "100%";

    setTimeout(() => {
        loading.classList.add("hidden");
        menu.classList.remove("hidden");
    }, 500);
}, 300);

document.getElementById("garageButton").onclick = () => {
    menu.classList.add("hidden");
    garage.classList.remove("hidden");
};

document.getElementById("garageBack").onclick = () => {
    garage.classList.add("hidden");
    menu.classList.remove("hidden");
};

document.getElementById("controllerButton").onclick = () => {
    menu.classList.add("hidden");
    controllerScreen.classList.remove("hidden");

    document.getElementById("controllerUrl").textContent =
        location.href.replace(/index\.html.*$/i, "") + "controller.html";
};

document.getElementById("controllerBack").onclick = () => {
    controllerScreen.classList.add("hidden");
    menu.classList.remove("hidden");
};

document.querySelectorAll(".driver").forEach(button => {

    button.onclick = () => {

        document.querySelectorAll(".driver")
            .forEach(x => x.classList.remove("active"));

        button.classList.add("active");

        selectedDriver = Number(button.dataset.driver);
    };

});

/* =========================
   AUDIO
========================= */

let audioCtx = null;
let musicTimer = null;

function startAudio() {

    if (audioCtx) return;

    audioCtx = new (
        window.AudioContext ||
        window.webkitAudioContext
    )();

    playMusic();
}

function beep(freq, duration = .1, volume = .05) {

    if (!audioCtx) return;

    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    oscillator.type = "square";
    oscillator.frequency.value = freq;

    gain.gain.value = volume;

    oscillator.connect(gain);
    gain.connect(audioCtx.destination);

    oscillator.start();

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + duration
    );

    oscillator.stop(audioCtx.currentTime + duration);
}

function playMusic() {

    if (!audioCtx) return;

    const notes = [
        261.63,
        329.63,
        392,
        523.25,
        392,
        329.63,
        293.66,
        349.23
    ];

    let i = 0;

    musicTimer = setInterval(() => {

        if (!raceRunning) return;

        beep(notes[i % notes.length], .12, .018);

        i++;

    }, 260);
}

/* =========================
   GAME DATA
========================= */

const drivers = [
    {
        name: "VOLT",
        color: "#ed3158",
        maxSpeed: 9.5,
        acceleration: .17,
        handling: .065,
        drift: 1
    },
    {
        name: "NOVA",
        color: "#2e8cff",
        maxSpeed: 8.8,
        acceleration: .23,
        handling: .065,
        drift: .9
    },
    {
        name: "RUSH",
        color: "#22c56b",
        maxSpeed: 8.6,
        acceleration: .18,
        handling: .085,
        drift: .85
    },
    {
        name: "PIXEL",
        color: "#a44cff",
        maxSpeed: 8.9,
        acceleration: .19,
        handling: .075,
        drift: 1.15
    }
];

const keys = {};

window.addEventListener("keydown", e => {

    keys[e.code] = true;

    if (
        [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "Space"
        ].includes(e.code)
    ) {
        e.preventDefault();
    }

    if (e.code === "KeyE") useItem();

});

window.addEventListener("keyup", e => {
    keys[e.code] = false;
});

/* =========================
   TRACK
========================= */

const track = {
    centerX: 0,
    centerY: 0,
    radiusX: 420,
    radiusY: 235,
    width: 145
};

const totalLaps = 3;

let raceRunning = false;
let raceFinished = false;

let player;
let racers = [];
let particles = [];
let itemBoxes = [];
let trees = [];
let clouds = [];

function createTrackObjects() {

    itemBoxes = [];

    for (let i = 0; i < 12; i++) {

        const a = i / 12 * Math.PI * 2;

        itemBoxes.push({
            x: track.centerX + Math.cos(a) * track.radiusX,
            y: track.centerY + Math.sin(a) * track.radiusY,
            taken: false
        });

    }

    trees = [];

    for (let i = 0; i < 80; i++) {

        const a = Math.random() * Math.PI * 2;
        const rX = track.radiusX + track.width / 2 + 50 + Math.random() * 250;
        const rY = track.radiusY + track.width / 2 + 30 + Math.random() * 150;

        trees.push({
            x: track.centerX + Math.cos(a) * rX,
            y: track.centerY + Math.sin(a) * rY,
            size: 18 + Math.random() * 22
        });

    }

    clouds = [];

    for (let i = 0; i < 12; i++) {

        clouds.push({
            x: Math.random() * W,
            y: 40 + Math.random() * 180,
            size: 30 + Math.random() * 50,
            speed: .1 + Math.random() * .2
        });

    }
}

/* =========================
   RACERS
========================= */

function createRacer(index, isPlayer = false) {

    const angle = -Math.PI / 2 + index * .09;

    return {

        id: index,

        isPlayer,

        name: isPlayer
            ? drivers[selectedDriver].name
            : [
                "BOLT",
                "MAYA",
                "RICO"
            ][index - 1],

        color: isPlayer
            ? drivers[selectedDriver].color
            : [
                "#ff8a22",
                "#00d9ff",
                "#ffdf32"
            ][index - 1],

        x: track.centerX + Math.cos(angle) * track.radiusX,
        y: track.centerY + Math.sin(angle) * track.radiusY,

        angle: angle + Math.PI / 2,

        speed: 0,

        lap: 1,
        progress: 0,

        nitro: 100,

        item: null,

        drifting: false,

        driftCharge: 0,

        boost: 0,

        stun: 0,

        finished: false,

        aiOffset: Math.random() * 2 - 1
    };
}

/* =========================
   PHYSICS
========================= */

function accelerateRacer(r, input) {

    const d = drivers[r.isPlayer ? selectedDriver : 0];

    let maxSpeed = d.maxSpeed;

    if (r.boost > 0) {
        maxSpeed += 4;
    }

    if (r.stun > 0) {
        r.speed *= .92;
        return;
    }

    if (input.up) {

        r.speed += d.acceleration;

    } else {

        r.speed *= .985;

    }

    if (input.down) {

        r.speed -= .15;

    }

    r.speed = Math.max(
        -2.5,
        Math.min(maxSpeed, r.speed)
    );

    let turn = 0;

    if (input.left) turn -= 1;
    if (input.right) turn += 1;

    if (Math.abs(r.speed) > .2) {

        const turnPower =
            d.handling *
            Math.min(1, Math.abs(r.speed) / 5);

        r.angle += turn * turnPower;

    }

    if (input.drift && Math.abs(r.speed) > 3) {

        r.drifting = true;
        r.driftCharge += .7 * d.drift;

        r.angle += turn * .012;

        if (r.driftCharge > 100) {
            r.driftCharge = 100;
        }

    } else {

        if (r.drifting && r.driftCharge > 25) {

            r.boost =
                Math.min(90, r.boost + r.driftCharge * .35);

            spawnBoost(r);

        }

        r.drifting = false;
        r.driftCharge = 0;
    }

    if (r.boost > 0) {

        r.boost--;

        r.speed += .12;

    }

    r.x += Math.cos(r.angle) * r.speed;
    r.y += Math.sin(r.angle) * r.speed;

}

/* =========================
   TRACK POSITION
========================= */

function getTrackProgress(r) {

    const dx = r.x - track.centerX;
    const dy = r.y - track.centerY;

    const normalizedX = dx / track.radiusX;
    const normalizedY = dy / track.radiusY;

    let a = Math.atan2(
        normalizedY,
        normalizedX
    );

    if (a < 0) a += Math.PI * 2;

    return a / (Math.PI * 2);
}

function updateLap(r) {

    const p = getTrackProgress(r);

    if (
        r.progress > .85 &&
        p < .15
    ) {

        r.lap++;

        if (r.lap > totalLaps) {

            r.finished = true;

            if (r.isPlayer) {
                finishRace();
            }

        }

    }

    r.progress = p;
}

/* =========================
   AI
========================= */

function updateAI(r) {

    const p = getTrackProgress(r);

    const targetAngle =
        p * Math.PI * 2 + r.aiOffset * .04;

    const tx =
        track.centerX +
        Math.cos(targetAngle) * track.radiusX;

    const ty =
        track.centerY +
        Math.sin(targetAngle) * track.radiusY;

    const desired =
        Math.atan2(
            ty - r.y,
            tx - r.x
        );

    let difference =
        Math.atan2(
            Math.sin(desired - r.angle),
            Math.cos(desired - r.angle)
        );

    let left = difference < -.04;
    let right = difference > .04;

    accelerateRacer(r, {
        up: true,
        down: false,
        left,
        right,
        drift: Math.abs(difference) > .35
    });

}

/* =========================
   ITEMS
========================= */

const items = [
    {
        name: "BOOST",
        icon: "⚡"
    },
    {
        name: "ROCKET",
        icon: "🚀"
    },
    {
        name: "SHOCK",
        icon: "⚡"
    },
    {
        name: "SHIELD",
        icon: "◆"
    }
];

function giveRandomItem(r) {

    r.item =
        items[
            Math.floor(Math.random() * items.length)
        ];

    if (r.isPlayer) {

        document.getElementById("itemIcon")
            .textContent = r.item.icon;

    }

}

function checkItemBoxes(r) {

    for (const box of itemBoxes) {

        if (box.taken) continue;

        const dx = r.x - box.x;
        const dy = r.y - box.y;

        if (Math.hypot(dx, dy) < 35) {

            box.taken = true;

            giveRandomItem(r);

            setTimeout(() => {
                box.taken = false;
            }, 5000);

            beep(700, .12, .05);
        }

    }

}

function useItem() {

    if (!player || !player.item) return;

    const item = player.item.name;

    if (item === "BOOST") {

        player.boost = 90;
        spawnBoost(player);

    }

    if (item === "ROCKET") {

        for (const r of racers) {

            if (!r.isPlayer) {

                const dx = r.x - player.x;
                const dy = r.y - player.y;

                if (Math.hypot(dx, dy) < 220) {

                    r.stun = 100;

                    spawnExplosion(r.x, r.y);
                }

            }

        }

    }

    if (item === "SHOCK") {

        for (const r of racers) {

            if (!r.isPlayer) {
                r.stun = 70;
            }

        }

    }

    if (item === "SHIELD") {

        player.boost = 30;

    }

    player.item = null;

    document.getElementById("itemIcon").textContent = "?";

}

/* =========================
   PARTICLES
========================= */

function particle(x, y, color, life = 30) {

    particles.push({
        x,
        y,
        vx: (Math.random() - .5) * 4,
        vy: (Math.random() - .5) * 4,
        life,
        maxLife: life,
        color,
        size: 2 + Math.random() * 5
    });

}

function spawnBoost(r) {

    for (let i = 0; i < 5; i++) {

        particle(
            r.x - Math.cos(r.angle) * 25,
            r.y - Math.sin(r.angle) * 25,
            "#00eaff",
            25
        );

    }

}

function spawnExplosion(x, y) {

    for (let i = 0; i < 35; i++) {

        particle(
            x,
            y,
            Math.random() > .5
                ? "#ff3c3c"
                : "#ffd83c",
            50
        );

    }

}

function updateParticles() {

    for (let i = particles.length - 1; i >= 0; i--) {

        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        p.vx *= .97;
        p.vy *= .97;

        p.life--;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }

    }

}

/* =========================
   CAMERA
========================= */

let cameraX = 0;
let cameraY = 0;

function updateCamera() {

    if (!player) return;

    cameraX +=
        (player.x - cameraX - W / 2) * .08;

    cameraY +=
        (player.y - cameraY - H / 2) * .08;

}

/* =========================
   DRAW
========================= */

function drawWorld() {

    ctx.fillStyle = "#79c957";
    ctx.fillRect(0, 0, W, H);

    ctx.save();

    ctx.translate(
        -cameraX,
        -cameraY
    );

    drawClouds();
    drawTrees();

    /* road shadow */

    ctx.beginPath();

    ctx.ellipse(
        track.centerX,
        track.centerY,
        track.radiusX + track.width / 2 + 10,
        track.radiusY + track.width / 2 + 10,
        0,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "rgba(0,0,0,.22)";
    ctx.fill();

    /* road */

    ctx.beginPath();

    ctx.ellipse(
        track.centerX,
        track.centerY,
        track.radiusX + track.width / 2,
        track.radiusY + track.width / 2,
        0,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#292e38";
    ctx.fill();

    /* road border */

    ctx.beginPath();

    ctx.ellipse(
        track.centerX,
        track.centerY,
        track.radiusX + track.width / 2,
        track.radiusY + track.width / 2,
        0,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle = "#f7f7f7";
    ctx.lineWidth = 15;
    ctx.stroke();

    /* inside grass */

    ctx.beginPath();

    ctx.ellipse(
        track.centerX,
        track.centerY,
        track.radiusX - track.width / 2,
        track.radiusY - track.width / 2,
        0,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#65b84d";
    ctx.fill();

    /* center line */

    ctx.beginPath();

    ctx.ellipse(
        track.centerX,
        track.centerY,
        track.radiusX,
        track.radiusY,
        0,
        0,
        Math.PI * 2
    );

    ctx.setLineDash([25, 25]);
    ctx.strokeStyle = "rgba(255,255,255,.25)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.setLineDash([]);

    drawStartLine();
    drawItemBoxes();

    for (const r of racers) {
        drawRacer(r);
    }

    drawParticles();

    ctx.restore();

}

function drawClouds() {

    for (const c of clouds) {

        c.x -= c.speed;

        if (c.x < -100) {
            c.x = W + 100;
        }

        ctx.fillStyle = "rgba(255,255,255,.75)";

        ctx.beginPath();

        ctx.arc(c.x, c.y, c.size * .6, 0, Math.PI * 2);
        ctx.arc(c.x + c.size * .5, c.y + 5, c.size * .5, 0, Math.PI * 2);
        ctx.arc(c.x - c.size * .5, c.y + 7, c.size * .45, 0, Math.PI * 2);

        ctx.fill();

    }

}

function drawTrees() {

    for (const t of trees) {

        ctx.fillStyle = "#65402b";

        ctx.fillRect(
            t.x - 4,
            t.y,
            8,
            t.size
        );

        ctx.fillStyle = "#21723a";

        ctx.beginPath();

        ctx.arc(
            t.x,
            t.y,
            t.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

}

function drawStartLine() {

    const x =
        track.centerX;

    const y =
        track.centerY -
        track.radiusY -
        track.width / 2;

    for (let i = -4; i <= 4; i++) {

        ctx.fillStyle =
            i % 2 === 0
                ? "#fff"
                : "#111";

        ctx.fillRect(
            x + i * 18,
            y - 8,
            18,
            18
        );

    }

}

function drawItemBoxes() {

    for (const box of itemBoxes) {

        if (box.taken) continue;

        ctx.save();

        ctx.translate(box.x, box.y);

        ctx.rotate(performance.now() / 500);

        ctx.fillStyle = "#9b5cff";

        ctx.fillRect(
            -16,
            -16,
            32,
            32
        );

        ctx.fillStyle = "#fff";

        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText("?", 0, 0);

        ctx.restore();

    }

}

function drawRacer(r) {

    ctx.save();

    ctx.translate(r.x, r.y);
    ctx.rotate(r.angle);

    /* shadow */

    ctx.fillStyle = "rgba(0,0,0,.35)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        8,
        24,
        12,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /* wheels */

    ctx.fillStyle = "#090909";

    ctx.fillRect(-15, -19, 10, 14);
    ctx.fillRect(5, -19, 10, 14);
    ctx.fillRect(-15, 5, 10, 14);
    ctx.fillRect(5, 5, 10, 14);

    /* kart */

    ctx.fillStyle = r.color;

    ctx.beginPath();

    ctx.roundRect(
        -25,
        -14,
        50,
        28,
        8
    );

    ctx.fill();

    /* front */

    ctx.fillStyle = "#eaf7ff";

    ctx.beginPath();

    ctx.arc(
        15,
        0,
        6,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /* driver */

    ctx.fillStyle = "#f3c49b";

    ctx.beginPath();

    ctx.arc(
        -2,
        0,
        9,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /* boost */

    if (r.boost > 0 || r.drifting) {

        ctx.fillStyle =
            r.boost > 0
                ? "#00eaff"
                : "#ffb52e";

        ctx.beginPath();

        ctx.moveTo(-25, -7);
        ctx.lineTo(-45, 0);
        ctx.lineTo(-25, 7);

        ctx.fill();

    }

    ctx.restore();

    if (r.isPlayer) {

        ctx.fillStyle = "#fff";
        ctx.font = "bold 13px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            r.name,
            r.x,
            r.y - 32
        );

    }

}

function drawParticles() {

    for (const p of particles) {

        ctx.globalAlpha =
            Math.max(0, p.life / p.maxLife);

        ctx.fillStyle = p.color;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

    ctx.globalAlpha = 1;

}

/* =========================
   POSITION
========================= */

function getRaceScore(r) {

    return (
        (r.lap - 1) * 10000 +
        r.progress * 10000
    );

}

function updatePosition() {

    const sorted =
        [...racers].sort(
            (a, b) =>
                getRaceScore(b) -
                getRaceScore(a)
        );

    const pos =
        sorted.indexOf(player) + 1;

    document.getElementById(
        "positionNumber"
    ).textContent = pos;

}

/* =========================
   HUD
========================= */

function updateHUD() {

    if (!player) return;

    document.getElementById(
        "speedNumber"
    ).textContent =
        Math.round(Math.abs(player.speed) * 18);

    document.getElementById(
        "lapNumber"
    ).textContent =
        Math.min(player.lap, totalLaps) +
        "/" +
        totalLaps;

    document.getElementById(
        "nitroFill"
    ).style.width =
        Math.max(
            0,
            Math.min(100, player.nitro)
        ) + "%";

    updatePosition();

}

/* =========================
   RACE
========================= */

function startRace() {

    startAudio();

    menu.classList.add("hidden");
    garage.classList.add("hidden");
    controllerScreen.classList.add("hidden");

    game.classList.remove("hidden");

    track.centerX = 0;
    track.centerY = 0;

    createTrackObjects();

    racers = [];

    player = createRacer(0, true);

    racers.push(player);

    for (let i = 1; i < 4; i++) {
        racers.push(createRacer(i, false));
    }

    particles = [];

    raceFinished = false;
    raceRunning = false;

    document.getElementById(
        "finish"
    ).classList.add("hidden");

    countdown();

}

document.getElementById("startButton").onclick = startRace;

function countdown() {

    const box =
        document.getElementById("countdown");

    box.classList.remove("hidden");

    let number = 3;

    box.textContent = number;

    const timer =
        setInterval(() => {

            number--;

            if (number > 0) {

                box.textContent = number;
                beep(400, .15, .08);

            } else {

                clearInterval(timer);

                box.textContent = "GO!";

                beep(900, .3, .1);

                raceRunning = true;

                setTimeout(() => {
                    box.classList.add("hidden");
                }, 600);

            }

        }, 1000);

}

/* =========================
   FINISH
========================= */

function finishRace() {

    if (raceFinished) return;

    raceFinished = true;
    raceRunning = false;

    const sorted =
        [...racers].sort(
            (a, b) =>
                getRaceScore(b) -
                getRaceScore(a)
        );

    const position =
        sorted.indexOf(player) + 1;

    document.getElementById(
        "finishPosition"
    ).textContent = position;

    document.getElementById(
        "finish"
    ).classList.remove("hidden");

    for (let i = 0; i < 100; i++) {

        particle(
            player.x,
            player.y,
            [
                "#ff3cac",
                "#00eaff",
                "#ffe14a",
                "#7cff5c"
            ][
                Math.floor(Math.random() * 4)
            ],
            80 + Math.random() * 80
        );

    }

}

document.getElementById("restartButton").onclick =
    () => {

        document.getElementById(
            "finish"
        ).classList.add("hidden");

        startRace();

    };

document.getElementById("finishMenu").onclick =
    () => {

        game.classList.add("hidden");

        document.getElementById(
            "finish"
        ).classList.add("hidden");

        menu.classList.remove("hidden");

    };

/* =========================
   MAIN LOOP
========================= */

function gameLoop() {

    requestAnimationFrame(gameLoop);

    if (!raceRunning) {

        drawWorld();
        return;

    }

    if (!player) return;

    const playerInput = {

        up:
            keys["ArrowUp"] ||
            keys["KeyW"],

        down:
            keys["ArrowDown"] ||
            keys["KeyS"],

        left:
            keys["ArrowLeft"] ||
            keys["KeyA"],

        right:
            keys["ArrowRight"] ||
            keys["KeyD"],

        drift:
            keys["ShiftLeft"] ||
            keys["ShiftRight"]

    };

    accelerateRacer(
        player,
        playerInput
    );

    checkItemBoxes(player);

    updateLap(player);

    for (let i = 1; i < racers.length; i++) {

        const r = racers[i];

        if (!r.finished) {

            updateAI(r);
            updateLap(r);
            checkItemBoxes(r);

        }

    }

    updateParticles();
    updateCamera();
    updateHUD();

    drawWorld();

}

gameLoop();

/* =========================
   PHONE CONTROLLER
   PeerJS host
========================= */

let peer = null;
let controllerConnections = [];

function createRoom() {

    if (!window.Peer) {

        document.getElementById(
            "roomCode"
        ).textContent =
            "KONTROLER: PeerJS niedostępny";

        return;

    }

    peer = new Peer();

    peer.on("open", id => {

        document.getElementById(
            "roomCode"
        ).textContent =
            "KOD: " + id;

    });

    peer.on("connection", connection => {

        controllerConnections.push(connection);

        connection.on("data", data => {

            if (!player) return;

            if (data.type === "control") {

                remoteControls[data.player] = data.controls;

            }

            if (data.type === "item") {

                useItem();

            }

        });

    });

}

const remoteControls = {
    0: {},
    1: {},
    2: {},
    3: {}
};

createRoom();

/* Controller P1 can also control the PC */

function applyRemoteController() {

    if (!player) return;

    const c = remoteControls[0];

    if (!c) return;

    if (c.up) keys["ArrowUp"] = true;
    else keys["ArrowUp"] = false;

    if (c.down) keys["ArrowDown"] = true;
    else keys["ArrowDown"] = false;

    if (c.left) keys["ArrowLeft"] = true;
    else keys["ArrowLeft"] = false;

    if (c.right) keys["ArrowRight"] = true;
    else keys["ArrowRight"] = false;

    if (c.drift) keys["ShiftLeft"] = true;
    else keys["ShiftLeft"] = false;

}

setInterval(applyRemoteController, 20);
