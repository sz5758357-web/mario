"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       ELEMENTY
    ========================================= */

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const menu = document.getElementById("menu");
    const garage = document.getElementById("garage");
    const controllerScreen =
        document.getElementById("controllerScreen");
    const game = document.getElementById("game");

    const finish =
        document.getElementById("finish");

    const countdown =
        document.getElementById("countdown");

    const startButton =
        document.getElementById("startButton");

    const garageButton =
        document.getElementById("garageButton");

    const garageBack =
        document.getElementById("garageBack");

    const controllerButton =
        document.getElementById("controllerButton");

    const controllerBack =
        document.getElementById("controllerBack");

    const restartButton =
        document.getElementById("restartButton");

    const finishMenu =
        document.getElementById("finishMenu");

    /* =========================================
       ROZMIAR
    ========================================= */

    let W = window.innerWidth;
    let H = window.innerHeight;

    function resize() {

        W = window.innerWidth;
        H = window.innerHeight;

        canvas.width = W;
        canvas.height = H;
    }

    window.addEventListener("resize", resize);
    resize();

    /* =========================================
       MENU
    ========================================= */

    let selectedDriver = 0;

    function show(element) {
        element.classList.remove("hidden");
    }

    function hide(element) {
        element.classList.add("hidden");
    }

    startButton.addEventListener("click", () => {
        startRace();
    });

    garageButton.addEventListener("click", () => {
        hide(menu);
        show(garage);
    });

    garageBack.addEventListener("click", () => {
        hide(garage);
        show(menu);
    });

    controllerButton.addEventListener("click", () => {

        hide(menu);
        show(controllerScreen);

        const url =
            location.href.replace(
                /index\.html.*$/i,
                ""
            ) + "controller.html";

        document.getElementById(
            "controllerUrl"
        ).textContent = url;
    });

    controllerBack.addEventListener("click", () => {

        hide(controllerScreen);
        show(menu);
    });

    document.querySelectorAll(".driver")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(".driver")
                        .forEach(b =>
                            b.classList.remove("active")
                        );

                    button.classList.add("active");

                    selectedDriver =
                        Number(
                            button.dataset.driver
                        );
                }
            );

        });

    restartButton.addEventListener(
        "click",
        () => {

            hide(finish);
            startRace();

        }
    );

    finishMenu.addEventListener(
        "click",
        () => {

            hide(finish);
            hide(game);
            show(menu);

        }
    );

    /* =========================================
       KLAWIATURA
    ========================================= */

    const keys = {};

    window.addEventListener(
        "keydown",
        event => {

            keys[event.code] = true;

            if (
                event.code === "ArrowUp" ||
                event.code === "ArrowDown" ||
                event.code === "ArrowLeft" ||
                event.code === "ArrowRight" ||
                event.code === "Space"
            ) {
                event.preventDefault();
            }

            if (event.code === "KeyE") {
                useItem();
            }
        }
    );

    window.addEventListener(
        "keyup",
        event => {
            keys[event.code] = false;
        }
    );

    /* =========================================
       KIEROWCY
    ========================================= */

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

    /* =========================================
       TOR
    ========================================= */

    const track = {
        radiusX: 430,
        radiusY: 245,
        width: 145
    };

    const TOTAL_LAPS = 3;

    let player = null;
    let racers = [];
    let particles = [];
    let itemBoxes = [];
    let trees = [];

    let raceRunning = false;
    let raceFinished = false;

    let cameraX = 0;
    let cameraY = 0;

    function createTrack() {

        itemBoxes = [];
        trees = [];

        for (let i = 0; i < 16; i++) {

            const a =
                i / 16 *
                Math.PI * 2;

            itemBoxes.push({

                x:
                    Math.cos(a) *
                    track.radiusX,

                y:
                    Math.sin(a) *
                    track.radiusY,

                taken: false
            });
        }

        for (let i = 0; i < 100; i++) {

            const a =
                Math.random() *
                Math.PI * 2;

            trees.push({

                x:
                    Math.cos(a) *
                    (
                        track.radiusX +
                        track.width +
                        80 +
                        Math.random() * 220
                    ),

                y:
                    Math.sin(a) *
                    (
                        track.radiusY +
                        track.width +
                        80 +
                        Math.random() * 150
                    ),

                size:
                    12 +
                    Math.random() * 20
            });
        }
    }

    /* =========================================
       KART
    ========================================= */

    function createRacer(
        index,
        isPlayer
    ) {

        const startAngle =
            -Math.PI / 2 +
            index * .11;

        return {

            name:
                isPlayer
                    ? drivers[selectedDriver].name
                    : ["", "BOLT", "MAYA", "RICO"][index],

            color:
                isPlayer
                    ? drivers[selectedDriver].color
                    : ["", "#ff8b28", "#00d9ff", "#ffe03b"][index],

            isPlayer,

            x:
                Math.cos(startAngle) *
                track.radiusX,

            y:
                Math.sin(startAngle) *
                track.radiusY,

            angle:
                startAngle +
                Math.PI / 2,

            speed: 0,

            lap: 1,

            progress: 0,

            boost: 0,

            item: null,

            drifting: false,

            driftCharge: 0,

            stun: 0,

            finished: false
        };
    }

    /* =========================================
       RUCH
    ========================================= */

    function moveRacer(r, input) {

        const stats =
            drivers[
                r.isPlayer
                    ? selectedDriver
                    : 0
            ];

        if (r.stun > 0) {

            r.stun--;
            r.speed *= .94;

        } else {

            if (input.up) {
                r.speed += stats.acceleration;
            } else {
                r.speed *= .985;
            }

            if (input.down) {
                r.speed -= .14;
            }

            let maxSpeed =
                stats.maxSpeed;

            if (r.boost > 0) {
                maxSpeed += 4;
                r.boost--;
            }

            r.speed =
                Math.max(
                    -2,
                    Math.min(
                        maxSpeed,
                        r.speed
                    )
                );

            let turn = 0;

            if (input.left) turn--;
            if (input.right) turn++;

            if (Math.abs(r.speed) > .2) {

                r.angle +=
                    turn *
                    stats.handling *
                    Math.min(
                        1,
                        Math.abs(r.speed) / 5
                    );
            }

            if (
                input.drift &&
                Math.abs(r.speed) > 3
            ) {

                r.drifting = true;

                r.driftCharge +=
                    .7 * stats.drift;

                r.driftCharge =
                    Math.min(
                        100,
                        r.driftCharge
                    );

                r.angle +=
                    turn * .012;

            } else {

                if (
                    r.drifting &&
                    r.driftCharge > 25
                ) {

                    r.boost =
                        r.driftCharge * .55;

                    createBoost(r);
                }

                r.drifting = false;
                r.driftCharge = 0;
            }
        }

        r.x +=
            Math.cos(r.angle) *
            r.speed;

        r.y +=
            Math.sin(r.angle) *
            r.speed;
    }

    /* =========================================
       AI
    ========================================= */

    function updateAI(r) {

        const progress =
            getProgress(r);

        const targetAngle =
            progress *
            Math.PI * 2;

        const targetX =
            Math.cos(targetAngle) *
            track.radiusX;

        const targetY =
            Math.sin(targetAngle) *
            track.radiusY;

        const desired =
            Math.atan2(
                targetY - r.y,
                targetX - r.x
            );

        const diff =
            Math.atan2(
                Math.sin(
                    desired - r.angle
                ),
                Math.cos(
                    desired - r.angle
                )
            );

        moveRacer(r, {

            up: true,

            down: false,

            left: diff < -.04,

            right: diff > .04,

            drift: Math.abs(diff) > .4

        });
    }

    /* =========================================
       OKRĄŻENIA
    ========================================= */

    function getProgress(r) {

        let angle =
            Math.atan2(
                r.y / track.radiusY,
                r.x / track.radiusX
            );

        if (angle < 0) {
            angle += Math.PI * 2;
        }

        return angle /
            (Math.PI * 2);
    }

    function updateLap(r) {

        const p =
            getProgress(r);

        if (
            r.progress > .85 &&
            p < .15
        ) {

            r.lap++;

            if (
                r.lap >
                TOTAL_LAPS
            ) {

                r.finished = true;

                if (r.isPlayer) {
                    finishRace();
                }
            }
        }

        r.progress = p;
    }

    /* =========================================
       ITEMY
    ========================================= */

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

    function checkItems(r) {

        for (
            const box of itemBoxes
        ) {

            if (box.taken) continue;

            const distance =
                Math.hypot(
                    r.x - box.x,
                    r.y - box.y
                );

            if (distance < 32) {

                box.taken = true;

                r.item =
                    items[
                        Math.floor(
                            Math.random() *
                            items.length
                        )
                    ];

                if (r.isPlayer) {

                    document.getElementById(
                        "itemIcon"
                    ).textContent =
                        r.item.icon;
                }

                setTimeout(
                    () => {
                        box.taken = false;
                    },
                    4000
                );
            }
        }
    }

    function useItem() {

        if (
            !player ||
            !player.item
        ) {
            return;
        }

        if (
            player.item.name ===
            "BOOST"
        ) {

            player.boost = 100;
        }

        if (
            player.item.name ===
            "ROCKET"
        ) {

            racers.forEach(r => {

                if (!r.isPlayer) {

                    const d =
                        Math.hypot(
                            r.x - player.x,
                            r.y - player.y
                        );

                    if (d < 250) {

                        r.stun = 100;

                        explosion(
                            r.x,
                            r.y
                        );
                    }
                }
            });
        }

        if (
            player.item.name ===
            "SHOCK"
        ) {

            racers.forEach(r => {

                if (!r.isPlayer) {
                    r.stun = 80;
                }
            });
        }

        if (
            player.item.name ===
            "SHIELD"
        ) {

            player.boost = 40;
        }

        player.item = null;

        document.getElementById(
            "itemIcon"
        ).textContent = "?";
    }

    /* =========================================
       CZĄSTECZKI
    ========================================= */

    function addParticle(
        x,
        y,
        color
    ) {

        particles.push({

            x,
            y,

            vx:
                (Math.random() - .5) * 5,

            vy:
                (Math.random() - .5) * 5,

            life:
                20 +
                Math.random() * 30,

            color,

            size:
                2 +
                Math.random() * 4
        });
    }

    function createBoost(r) {

        for (
            let i = 0;
            i < 8;
            i++
        ) {

            addParticle(
                r.x -
                    Math.cos(r.angle) * 25,

                r.y -
                    Math.sin(r.angle) * 25,

                "#00eaff"
            );
        }
    }

    function explosion(x, y) {

        for (
            let i = 0;
            i < 30;
            i++
        ) {

            addParticle(
                x,
                y,
                Math.random() > .5
                    ? "#ff3838"
                    : "#ffd632"
            );
        }
    }

    function updateParticles() {

        for (
            let i = particles.length - 1;
            i >= 0;
            i--
        ) {

            const p =
                particles[i];

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

    /* =========================================
       RYSOWANIE
    ========================================= */

    function draw() {

        ctx.clearRect(
            0,
            0,
            W,
            H
        );

        ctx.fillStyle =
            "#70c951";

        ctx.fillRect(
            0,
            0,
            W,
            H
        );

        ctx.save();

        ctx.translate(
            W / 2 - cameraX,
            H / 2 - cameraY
        );

        drawTrees();
        drawTrack();
        drawItems();

        racers.forEach(
            drawRacer
        );

        drawParticles();

        ctx.restore();
    }

    function drawTrees() {

        trees.forEach(t => {

            ctx.fillStyle =
                "#62412d";

            ctx.fillRect(
                t.x - 4,
                t.y,
                8,
                t.size
            );

            ctx.fillStyle =
                "#21743b";

            ctx.beginPath();

            ctx.arc(
                t.x,
                t.y,
                t.size,
                0,
                Math.PI * 2
            );

            ctx.fill();
        });
    }

    function drawTrack() {

        ctx.beginPath();

        ctx.ellipse(
            0,
            0,
            track.radiusX +
                track.width / 2 +
                12,

            track.radiusY +
                track.width / 2 +
                12,

            0,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "rgba(0,0,0,.25)";

        ctx.fill();

        ctx.beginPath();

        ctx.ellipse(
            0,
            0,
            track.radiusX +
                track.width / 2,

            track.radiusY +
                track.width / 2,

            0,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#2b3038";

        ctx.fill();

        ctx.strokeStyle =
            "#ffffff";

        ctx.lineWidth = 14;

        ctx.stroke();

        ctx.beginPath();

        ctx.ellipse(
            0,
            0,
            track.radiusX -
                track.width / 2,

            track.radiusY -
                track.width / 2,

            0,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#63b94e";

        ctx.fill();

        ctx.beginPath();

        ctx.ellipse(
            0,
            0,
            track.radiusX,
            track.radiusY,
            0,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "rgba(255,255,255,.18)";

        ctx.lineWidth = 3;

        ctx.setLineDash([
            25,
            25
        ]);

        ctx.stroke();

        ctx.setLineDash([]);

        /* META */

        for (
            let i = -5;
            i < 5;
            i++
        ) {

            ctx.fillStyle =
                i % 2 === 0
                    ? "#ffffff"
                    : "#111111";

            ctx.fillRect(
                i * 22,
                -track.radiusY - 8,
                22,
                18
            );
        }
    }

    function drawItems() {

        itemBoxes.forEach(box => {

            if (box.taken) return;

            ctx.save();

            ctx.translate(
                box.x,
                box.y
            );

            ctx.rotate(
                performance.now() / 500
            );

            ctx.fillStyle =
                "#9855ff";

            ctx.fillRect(
                -16,
                -16,
                32,
                32
            );

            ctx.fillStyle =
                "#ffffff";

            ctx.font =
                "bold 22px Arial";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";

            ctx.fillText(
                "?",
                0,
                0
            );

            ctx.restore();
        });
    }

    function drawRacer(r) {

        ctx.save();

        ctx.translate(
            r.x,
            r.y
        );

        ctx.rotate(
            r.angle
        );

        /* cień */

        ctx.fillStyle =
            "rgba(0,0,0,.35)";

        ctx.beginPath();

        ctx.ellipse(
            0,
            10,
            28,
            12,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /* koła */

        ctx.fillStyle =
            "#080808";

        ctx.fillRect(
            -17,
            -20,
            11,
            15
        );

        ctx.fillRect(
            6,
            -20,
            11,
            15
        );

        ctx.fillRect(
            -17,
            5,
            11,
            15
        );

        ctx.fillRect(
            6,
            5,
            11,
            15
        );

        /* kart */

        ctx.fillStyle =
            r.color;

        ctx.beginPath();

        ctx.roundRect(
            -27,
            -15,
            54,
            30,
            8
        );

        ctx.fill();

        /* kierowca */

        ctx.fillStyle =
            "#efc19c";

        ctx.beginPath();

        ctx.arc(
            -3,
            0,
            9,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /* światło */

        ctx.fillStyle =
            "#ffffff";

        ctx.beginPath();

        ctx.arc(
            19,
            0,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();

        if (
            r.boost > 0 ||
            r.drifting
        ) {

            ctx.fillStyle =
                r.boost > 0
                    ? "#00eaff"
                    : "#ffb52e";

            ctx.beginPath();

            ctx.moveTo(
                -27,
                -7
            );

            ctx.lineTo(
                -50,
                0
            );

            ctx.lineTo(
                -27,
                7
            );

            ctx.fill();
        }

        ctx.restore();

        if (r.isPlayer) {

            ctx.fillStyle =
                "#ffffff";

            ctx.font =
                "bold 13px Arial";

            ctx.textAlign =
                "center";

            ctx.fillText(
                r.name,
                r.x,
                r.y - 32
            );
        }
    }

    function drawParticles() {

        particles.forEach(p => {

            ctx.globalAlpha =
                Math.max(
                    0,
                    p.life / 40
                );

            ctx.fillStyle =
                p.color;

            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                p.size,
                0,
                Math.PI * 2
            );

            ctx.fill();
        });

        ctx.globalAlpha = 1;
    }

    /* =========================================
       HUD
    ========================================= */

    function updateHUD() {

        if (!player) return;

        document.getElementById(
            "speedNumber"
        ).textContent =
            Math.round(
                Math.abs(
                    player.speed
                ) * 18
            );

        document.getElementById(
            "lapNumber"
        ).textContent =
            Math.min(
                player.lap,
                TOTAL_LAPS
            ) +
            "/" +
            TOTAL_LAPS;

        document.getElementById(
            "nitroFill"
        ).style.width =
            "100%";

        const sorted =
            [...racers].sort(
                (a, b) => {

                    const A =
                        (a.lap - 1) *
                        100 +
                        a.progress;

                    const B =
                        (b.lap - 1) *
                        100 +
                        b.progress;

                    return B - A;
                }
            );

        document.getElementById(
            "positionNumber"
        ).textContent =
            sorted.indexOf(player) + 1;
    }

    /* =========================================
       START WYŚCIGU
    ========================================= */

    function startRace() {

        hide(menu);
        hide(garage);
        hide(controllerScreen);

        show(game);

        createTrack();

        racers = [];

        player =
            createRacer(
                0,
                true
            );

        racers.push(player);

        for (
            let i = 1;
            i < 4;
            i++
        ) {

            racers.push(
                createRacer(
                    i,
                    false
                )
            );
        }

        particles = [];

        raceFinished = false;
        raceRunning = false;

        hide(finish);

        startCountdown();
    }

    /* =========================================
       ODLICZANIE
    ========================================= */

    function startCountdown() {

        show(countdown);

        let number = 3;

        countdown.textContent =
            number;

        const timer =
            setInterval(() => {

                number--;

                if (number > 0) {

                    countdown.textContent =
                        number;

                } else {

                    clearInterval(timer);

                    countdown.textContent =
                        "GO!";

                    raceRunning = true;

                    setTimeout(
                        () => {
                            hide(countdown);
                        },
                        600
                    );
                }

            }, 800);
    }

    /* =========================================
       META
    ========================================= */

    function finishRace() {

        if (raceFinished) return;

        raceFinished = true;
        raceRunning = false;

        const sorted =
            [...racers].sort(
                (a, b) => {

                    const A =
                        (a.lap - 1) *
                        100 +
                        a.progress;

                    const B =
                        (b.lap - 1) *
                        100 +
                        b.progress;

                    return B - A;
                }
            );

        document.getElementById(
            "finishPosition"
        ).textContent =
            sorted.indexOf(player) + 1;

        show(finish);

        for (
            let i = 0;
            i < 80;
            i++
        ) {

            addParticle(
                player.x,
                player.y,
                [
                    "#00eaff",
                    "#ff3cac",
                    "#ffe03b",
                    "#7cff55"
                ][
                    Math.floor(
                        Math.random() * 4
                    )
                ]
            );
        }
    }

    /* =========================================
       GŁÓWNA PĘTLA
    ========================================= */

    function loop() {

        requestAnimationFrame(loop);

        if (
            raceRunning &&
            player
        ) {

            moveRacer(
                player,
                {
                    up:
                        keys["KeyW"] ||
                        keys["ArrowUp"],

                    down:
                        keys["KeyS"] ||
                        keys["ArrowDown"],

                    left:
                        keys["KeyA"] ||
                        keys["ArrowLeft"],

                    right:
                        keys["KeyD"] ||
                        keys["ArrowRight"],

                    drift:
                        keys["ShiftLeft"] ||
                        keys["ShiftRight"]
                }
            );

            checkItems(player);
            updateLap(player);

            for (
                let i = 1;
                i < racers.length;
                i++
            ) {

                if (
                    !racers[i].finished
                ) {

                    updateAI(
                        racers[i]
                    );

                    updateLap(
                        racers[i]
                    );

                    checkItems(
                        racers[i]
                    );
                }
            }

            updateParticles();

            cameraX +=
                (
                    player.x -
                    cameraX
                ) * .08;

            cameraY +=
                (
                    player.y -
                    cameraY
                ) * .08;

            updateHUD();
        }

        draw();
    }

    /* =========================================
       START SILNIKA
    ========================================= */

    loop();

});
