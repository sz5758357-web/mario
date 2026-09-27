* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    user-select: none;
}

html,
body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #050509;
    font-family: Arial, Helvetica, sans-serif;
}

body {
    color: white;
}

.hidden {
    display: none !important;
}

/* =========================
   LOADING
========================= */

#loading {
    position: fixed;
    inset: 0;
    z-index: 9999;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    background:
        radial-gradient(circle at center, #20206a 0%, #080814 55%, #030305 100%);

    font-weight: bold;
}

.loading-logo {
    font-size: clamp(30px, 6vw, 80px);
    font-weight: 1000;
    letter-spacing: 5px;

    text-shadow:
        0 5px 0 #171717,
        0 0 25px rgba(0, 220, 255, .7);

    margin-bottom: 35px;
}

.loading-bar {
    width: min(500px, 75vw);
    height: 10px;
    background: rgba(255,255,255,.15);
    border-radius: 20px;
    overflow: hidden;
}

#loading-progress {
    width: 0%;
    height: 100%;
    background: linear-gradient(90deg, #00d4ff, #7b2cff, #ff247f);
    transition: width .2s;
}

/* =========================
   MENU
========================= */

#menu {
    position: fixed;
    inset: 0;
    z-index: 100;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    overflow: hidden;
}

.menu-background {
    position: absolute;
    inset: 0;

    background:
        radial-gradient(circle at 50% 35%, rgba(30, 120, 255, .5), transparent 30%),
        linear-gradient(145deg, #07152e, #21105c 50%, #08030f);

    z-index: -2;
}

.menu-background::before,
.menu-background::after {
    content: "";
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    filter: blur(100px);
    opacity: .25;
}

.menu-background::before {
    background: #00d9ff;
    top: -300px;
    left: -200px;
    animation: floatOne 7s ease-in-out infinite alternate;
}

.menu-background::after {
    background: #ff006a;
    bottom: -300px;
    right: -200px;
    animation: floatTwo 9s ease-in-out infinite alternate;
}

@keyframes floatOne {
    to {
        transform: translate(250px, 180px);
    }
}

@keyframes floatTwo {
    to {
        transform: translate(-250px, -150px);
    }
}

.logo {
    text-align: center;
    transform: skew(-5deg);
    margin-bottom: 20px;
}

.logo span {
    display: block;
    font-size: clamp(25px, 4vw, 50px);
    letter-spacing: 10px;
    color: #fff;
}

.logo strong {
    display: block;
    font-size: clamp(55px, 9vw, 130px);
    line-height: .8;
    font-weight: 1000;

    background: linear-gradient(
        180deg,
        #fff 0%,
        #55e8ff 35%,
        #377cff 65%,
        #7c27ff 100%
    );

    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;

    text-shadow: 0 20px 35px rgba(0,0,0,.35);
}

.menu-kart {
    position: relative;
    width: 250px;
    height: 110px;
    margin: 10px 0 30px;

    animation: kartFloat 2s ease-in-out infinite alternate;
}

@keyframes kartFloat {
    to {
        transform: translateY(-12px) rotate(-1deg);
    }
}

.kart-body {
    position: absolute;
    width: 210px;
    height: 65px;
    left: 20px;
    top: 20px;

    background: linear-gradient(150deg, #ff304f, #b40034);
    border-radius: 45% 20% 25% 30%;

    box-shadow:
        inset 0 -12px 0 rgba(0,0,0,.25),
        0 15px 35px rgba(0,0,0,.4);
}

.kart-body::after {
    content: "";
    position: absolute;
    width: 75px;
    height: 40px;
    left: 70px;
    top: -18px;
    background: #222;
    border-radius: 50% 50% 20% 20%;
}

.kart-wheel {
    position: absolute;
    width: 42px;
    height: 42px;
    bottom: 0;

    background: #090909;
    border: 7px solid #303030;
    border-radius: 50%;

    box-shadow: inset 0 0 0 5px #111;
}

.wheel-left {
    left: 35px;
}

.wheel-right {
    right: 35px;
}

.menu-buttons {
    display: flex;
    flex-direction: column;
    width: min(400px, 80vw);
    gap: 12px;
}

.menu-buttons button,
.pause-box button,
.finish-box button {
    border: 0;
    border-radius: 14px;

    min-height: 58px;

    color: white;
    background: rgba(255,255,255,.1);

    border: 1px solid rgba(255,255,255,.18);

    font-size: 16px;
    font-weight: 900;
    letter-spacing: 1px;

    cursor: pointer;

    transition:
        transform .15s,
        background .15s,
        box-shadow .15s;
}

.menu-buttons button:hover,
.pause-box button:hover,
.finish-box button:hover {
    transform: scale(1.03);
    background: rgba(255,255,255,.18);
}

.menu-buttons .main-button {
    min-height: 70px;

    background:
        linear-gradient(
            100deg,
            #00c6ff,
            #6366f1,
            #a020f0
        );

    box-shadow:
        0 10px 35px rgba(70,100,255,.35);
}

.main-button span {
    margin-right: 10px;
}

.version {
    position: absolute;
    bottom: 20px;
    opacity: .45;
    font-size: 11px;
    letter-spacing: 2px;
}

/* =========================
   GAME
========================= */

#game {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    background: #74cfff;
}

#game canvas {
    display: block;
    width: 100%;
    height: 100%;
}

/* =========================
   HUD
========================= */

#hud {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 10;
}

.hud-top {
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;

    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.position-box {
    min-width: 100px;
    padding: 10px 18px;

    background: rgba(0,0,0,.45);
    border-radius: 14px;
    backdrop-filter: blur(10px);
}

.position-box span {
    display: block;
    font-size: 42px;
    font-weight: 1000;
    line-height: .9;
}

.position-box small {
    font-size: 10px;
    opacity: .7;
}

.lap-box {
    text-align: center;
    padding: 10px 20px;

    background: rgba(0,0,0,.45);
    border-radius: 14px;

    font-size: 11px;
    letter-spacing: 2px;
}

.lap-box strong {
    display: block;
    font-size: 23px;
    letter-spacing: 0;
}

.item-box {
    width: 64px;
    height: 64px;

    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: 15px;

    background: rgba(255,255,255,.15);
    border: 2px solid rgba(255,255,255,.35);

    font-size: 30px;
}

.speed-box {
    position: absolute;
    right: 25px;
    bottom: 28px;

    text-align: right;

    text-shadow: 0 4px 10px #000;
}

.speed-box strong {
    font-size: clamp(45px, 7vw, 90px);
    font-weight: 1000;
}

.speed-box small {
    display: block;
    font-weight: bold;
    letter-spacing: 3px;
}

.nitro-container {
    position: absolute;
    left: 25px;
    bottom: 30px;

    width: min(300px, 35vw);

    font-size: 11px;
    font-weight: 900;
    letter-spacing: 3px;
}

.nitro-bar {
    width: 100%;
    height: 12px;

    margin-top: 7px;

    border-radius: 20px;
    overflow: hidden;

    background: rgba(0,0,0,.5);
}

#nitro {
    width: 100%;
    height: 100%;

    background: linear-gradient(90deg, #00eaff, #1976ff, #a855f7);

    box-shadow: 0 0 15px #00d9ff;

    transition: width .1s;
}

#countdown {
    position: fixed;
    inset: 0;

    display: flex;
    justify-content: center;
    align-items: center;

    z-index: 30;
    pointer-events: none;
}

#countdownText {
    font-size: clamp(100px, 20vw, 260px);
    font-weight: 1000;

    color: white;

    text-shadow:
        0 8px 0 #222,
        0 0 50px #00d9ff;

    animation: countdownPulse .8s ease;
}

@keyframes countdownPulse {
    0% {
        transform: scale(2);
        opacity: 0;
    }

    50% {
        transform: scale(1);
        opacity: 1;
    }

    100% {
        transform: scale(.8);
        opacity: 0;
    }
}

#driftIndicator {
    position: fixed;
    left: 50%;
    bottom: 100px;

    transform: translateX(-50%) scale(.7);

    opacity: 0;

    font-size: 22px;
    font-weight: 1000;
    letter-spacing: 5px;

    color: #00eaff;
    text-shadow: 0 0 20px #00eaff;

    transition: .15s;

    pointer-events: none;
}

#driftIndicator.active {
    opacity: 1;
    transform: translateX(-50%) scale(1);
}

/* =========================
   PANELS
========================= */

.panel,
#pauseScreen,
#finishScreen {
    position: fixed;
    inset: 0;

    z-index: 200;

    display: flex;
    justify-content: center;
    align-items: center;

    background: rgba(0,0,0,.7);
    backdrop-filter: blur(12px);
}

.panel-box,
.pause-box,
.finish-box {
    width: min(600px, 90vw);

    padding: 35px;

    border-radius: 25px;

    background:
        linear-gradient(
            145deg,
            rgba(35,35,70,.97),
            rgba(10,10,25,.97)
        );

    border: 1px solid rgba(255,255,255,.15);

    box-shadow: 0 30px 80px rgba(0,0,0,.6);

    text-align: center;

    position: relative;
}

.panel-box h2 {
    font-size: 35px;
    margin-bottom: 25px;
}

.close-panel {
    position: absolute;
    right: 15px;
    top: 15px;

    width: 40px;
    height: 40px;

    border: 0;
    border-radius: 50%;

    background: rgba(255,255,255,.1);
    color: white;

    font-size: 25px;
    cursor: pointer;
}

.control-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.control-grid div {
    display: flex;
    align-items: center;
    gap: 12px;

    text-align: left;
}

.key {
    min-width: 65px;
    padding: 9px;

    text-align: center;

    background: rgba(255,255,255,.12);
    border-radius: 8px;

    font-weight: 900;
    font-size: 12px;
}

.pause-box h1 {
    font-size: 60px;
    margin-bottom: 30px;
}

.pause-box button,
.finish-box button {
    width: 100%;
    margin-top: 12px;
}

.finish-title {
    font-size: 30px;
    font-weight: 1000;
}

.trophy {
    font-size: 90px;
    margin: 20px;
}

#finishPosition {
    font-size: 35px;
    font-weight: 1000;
}

/* =========================
   MOBILE
========================= */

@media (max-width: 700px) {

    .logo strong {
        font-size: 55px;
    }

    .menu-kart {
        transform: scale(.75);
        margin-top: 0;
        margin-bottom: 5px;
    }

    .control-grid {
        grid-template-columns: 1fr;
    }

    .nitro-container {
        width: 45vw;
    }

    .speed-box strong {
        font-size: 50px;
    }

}
