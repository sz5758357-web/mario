"use strict";

let THREE = null;

let scene = null;
let camera = null;
let renderer = null;
let clock = null;

let player = null;
let racers = [];

let trackGroup = null;

let gameRunning = false;

let boost = 0;
let lap = 1;

let selectedDriver = 0;

const keys = {};

const drivers = [
    {
        name: "BLAZE",
        color: 0xff3b30,
        speed: 1.0,
        acceleration: 1.0,
        handling: 1.0
    },
    {
        name: "VOLT",
        color: 0xffd60a,
        speed: .95,
        acceleration: 1.3,
        handling: .95
    },
    {
        name: "STORM",
        color: 0x00d9ff,
        speed: .96,
        acceleration: 1.0,
        handling: 1.3
    },
    {
        name: "TITAN",
        color: 0x8888ff,
        speed: .9,
        acceleration: .85,
        handling: 1.4
    }
];


/* =========================================================
   DOM
========================================================= */

const loading =
    document.getElementById("loading");

const loadingProgress =
    document.getElementById("loadingProgress");

const loadingText =
    document.getElementById("loadingText");

const menu =
    document.getElementById("menu");

const garage =
    document.getElementById("garage");

const controllerScreen =
    document.getElementById("controllerScreen");

const gameScreen =
    document.getElementById("game");

const finish =
    document.getElementById("finish");

const countdown =
    document.getElementById("countdown");


/* =========================================================
   LOADING
========================================================= */

function loadingStatus(percent, text) {

    if (loadingProgress) {
        loadingProgress.style.width =
            percent + "%";
    }

    if (loadingText) {
        loadingText.textContent = text;
    }
}


/* =========================================================
   LOAD THREE.JS
========================================================= */

function loadScript(url) {

    return new Promise((resolve, reject) => {

        const script =
            document.createElement("script");

        script.src = url;

        script.onload = () => {

            resolve();

        };

        script.onerror = () => {

            reject(
                new Error(
                    "Nie można pobrać Three.js: " +
                    url
                )
            );

        };

        document.head.appendChild(script);

    });

}


async function loadThreeJS() {

    loadingStatus(
        10,
        "Ładowanie silnika 3D..."
    );


    try {

        await loadScript(
            "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.min.js"
        );

        if (window.THREE) {

            THREE = window.THREE;

            loadingStatus(
                30,
                "Silnik 3D załadowany..."
            );

            return true;

        }

    }
    catch (error) {

        console.warn(
            "Pierwszy CDN nie działa.",
            error
        );

    }


    loadingStatus(
        20,
        "Próba zapasowego serwera 3D..."
    );


    try {

        await loadScript(
            "https://unpkg.com/three@0.180.0/build/three.min.js"
        );

        if (window.THREE) {

            THREE = window.THREE;

            loadingStatus(
                30,
                "Silnik 3D załadowany..."
            );

            return true;

        }

    }
    catch (error) {

        console.warn(
            "Drugi CDN również nie działa.",
            error
        );

    }


    loadingStatus(
        100,
        "Nie udało się załadować silnika 3D."
    );


    showFatalError(
        "Nie udało się pobrać Three.js.\n\n" +
        "Przeglądarka lub sieć blokuje zewnętrzny silnik 3D.\n\n" +
        "Odśwież stronę Ctrl+F5."
    );


    return false;

}


/* =========================================================
   ERROR SCREEN
========================================================= */

function showFatalError(message) {

    loading.innerHTML = "";

    const box =
        document.createElement("div");

    box.style.cssText = `
        width:min(700px,90vw);
        padding:40px;
        border-radius:25px;
        background:#111827;
        border:1px solid rgba(255,255,255,.15);
        color:white;
        text-align:center;
        font-family:Arial;
    `;


    box.innerHTML = `
        <h1 style="
            color:#ff3b30;
            margin-bottom:20px;
        ">
            ❌ BŁĄD SILNIKA 3D
        </h1>

        <p style="
            white-space:pre-line;
            color:#aab3ca;
            line-height:1.7;
        ">
            ${message}
        </p>

        <button
            onclick="location.reload()"
            style="
                margin-top:20px;
                padding:15px 30px;
                border:0;
                border-radius:12px;
                background:#00bfff;
                color:white;
                font-weight:bold;
                cursor:pointer;
            "
        >
            🔄 SPRÓBUJ PONOWNIE
        </button>
    `;


    loading.appendChild(box);

}


/* =========================================================
   BUTTONS
========================================================= */

document
    .getElementById("startButton")
    .addEventListener(
        "click",
        startRace
    );


document
    .getElementById("garageButton")
    .addEventListener(
        "click",
        () => {

            menu.classList.add("hidden");

            garage.classList.remove(
                "hidden"
            );

        }
    );


document
    .getElementById("controllerButton")
    .addEventListener(
        "click",
        openController
    );


document
    .getElementById("garageBack")
    .addEventListener(
        "click",
        () => {

            garage.classList.add(
                "hidden"
            );

            menu.classList.remove(
                "hidden"
            );

        }
    );


document
    .getElementById("controllerBack")
    .addEventListener(
        "click",
        () => {

            controllerScreen.classList.add(
                "hidden"
            );

            menu.classList.remove(
                "hidden"
            );

        }
    );


document
    .getElementById("restartButton")
    .addEventListener(
        "click",
        () => {

            finish.classList.add(
                "hidden"
            );

            startRace();

        }
    );


document
    .getElementById("finishMenu")
    .addEventListener(
        "click",
        () => {

            finish.classList.add(
                "hidden"
            );

            gameScreen.classList.add(
                "hidden"
            );

            menu.classList.remove(
                "hidden"
            );

        }
    );


/* =========================================================
   DRIVER SELECTION
========================================================= */

document
    .querySelectorAll(".driver-card")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                selectedDriver =
                    Number(
                        button.dataset.driver
                    );


                document
                    .querySelectorAll(
                        ".driver-card"
                    )
                    .forEach(
                        b =>
                            b.classList.remove(
                                "selected"
                            )
                    );


                button.classList.add(
                    "selected"
                );


                document.getElementById(
                    "selectedName"
                ).textContent =
                    drivers[
                        selectedDriver
                    ].name;

            }
        );

    });


/* =========================================================
   KEYBOARD
========================================================= */

window.addEventListener(
    "keydown",
    event => {

        keys[event.code] = true;

        if (
            [
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight",
                "Space"
            ].includes(event.code)
        ) {

            event.preventDefault();

        }

        if (
            event.code === "KeyE" &&
            gameRunning
        ) {

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


/* =========================================================
   INIT
========================================================= */

async function init() {

    const success =
        await loadThreeJS();

    if (!success) {
        return;
    }


    await wait(200);

    loadingStatus(
        40,
        "Tworzenie sceny 3D..."
    );


    createRenderer();

    createScene();


    await wait(200);


    loadingStatus(
        60,
        "Budowanie toru 3D..."
    );


    createTrack();


    await wait(200);


    loadingStatus(
        80,
        "Tworzenie świata..."
    );


    createEnvironment();


    await wait(200);


    loadingStatus(
        100,
        "Gotowe!"
    );


    await wait(500);


    loading.style.display =
        "none";


    clock =
        new THREE.Clock();


    animate();

}


function wait(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


/* =========================================================
   RENDERER
========================================================= */

function createRenderer() {

    const canvas =
        document.getElementById(
            "gameCanvas"
        );


    renderer =
        new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            powerPreference:
                "high-performance"
        });


    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );


    renderer.shadowMap.enabled =
        true;


    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;


    renderer.outputColorSpace =
        THREE.SRGBColorSpace;

}


/* =========================================================
   SCENE
========================================================= */

function createScene() {

    scene =
        new THREE.Scene();


    scene.background =
        new THREE.Color(
            0x74c9ff
        );


    scene.fog =
        new THREE.Fog(
            0x74c9ff,
            80,
            500
        );


    camera =
        new THREE.PerspectiveCamera(
            65,
            window.innerWidth /
                window.innerHeight,
            .1,
            1000
        );


    camera.position.set(
        0,
        8,
        15
    );


    const ambient =
        new THREE.HemisphereLight(
            0xffffff,
            0x38552b,
            2
        );


    scene.add(
        ambient
    );


    const sun =
        new THREE.DirectionalLight(
            0xffffff,
            3
        );


    sun.position.set(
        -50,
        100,
        30
    );


    sun.castShadow = true;


    scene.add(
        sun
    );


    const ground =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                1000,
                1000
            ),

            new THREE.MeshStandardMaterial({
                color: 0x4e963f
            })

        );


    ground.rotation.x =
        -Math.PI / 2;


    ground.receiveShadow =
        true;


    scene.add(
        ground
    );

}


/* =========================================================
   TRACK
========================================================= */

function createTrack() {

    trackGroup =
        new THREE.Group();


    scene.add(
        trackGroup
    );


    const radiusX = 55;
    const radiusZ = 35;

    const width = 12;

    const segments = 128;


    for (
        let i = 0;
        i < segments;
        i++
    ) {

        const a =
            i /
            segments *
            Math.PI *
            2;


        const b =
            (i + 1) /
            segments *
            Math.PI *
            2;


        const x1 =
            Math.cos(a) *
            radiusX;


        const z1 =
            Math.sin(a) *
            radiusZ;


        const x2 =
            Math.cos(b) *
            radiusX;


        const z2 =
            Math.sin(b) *
            radiusZ;


        const dx =
            x2 - x1;


        const dz =
            z2 - z1;


        const length =
            Math.sqrt(
                dx * dx +
                dz * dz
            );


        const road =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    length + 1,
                    .35,
                    width
                ),

                new THREE.MeshStandardMaterial({
                    color: 0x30343b
                })

            );


        road.position.set(
            (x1 + x2) / 2,
            .18,
            (z1 + z2) / 2
        );


        road.rotation.y =
            -Math.atan2(
                dz,
                dx
            );


        road.receiveShadow =
            true;


        trackGroup.add(
            road
        );

    }


    createStartLine();

}


/* =========================================================
   START LINE
========================================================= */

function createStartLine() {

    const line =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                12,
                .08,
                2
            ),

            new THREE.MeshStandardMaterial({
                color: 0xffffff
            })

        );


    line.position.set(
        55,
        .4,
        0
    );


    line.rotation.y =
        Math.PI / 2;


    trackGroup.add(
        line
    );

}


/* =========================================================
   ENVIRONMENT
========================================================= */

function createEnvironment() {

    for (
        let i = 0;
        i < 70;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI *
            2;


        const radius =
            75 +
            Math.random() *
            100;


        const x =
            Math.cos(angle) *
            radius;


        const z =
            Math.sin(angle) *
            radius *
            .7;


        createTree(
            x,
            z
        );

    }


    for (
        let i = 0;
        i < 12;
        i++
    ) {

        const cloud =
            createCloud();


        cloud.position.set(
            (Math.random() - .5) *
                250,

            30 +
                Math.random() *
                30,

            (Math.random() - .5) *
                200
        );


        scene.add(
            cloud
        );

    }

}


/* =========================================================
   TREE
========================================================= */

function createTree(
    x,
    z
) {

    const tree =
        new THREE.Group();


    const trunk =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                .6,
                .9,
                5,
                8
            ),

            new THREE.MeshStandardMaterial({
                color: 0x70452b
            })

        );


    trunk.position.y =
        2.5;


    trunk.castShadow =
        true;


    tree.add(
        trunk
    );


    const leaves =
        new THREE.Mesh(

            new THREE.ConeGeometry(
                4,
                8,
                10
            ),

            new THREE.MeshStandardMaterial({
                color: 0x16833d
            })

        );


    leaves.position.y =
        7;


    leaves.castShadow =
        true;


    tree.add(
        leaves
    );


    tree.position.set(
        x,
        0,
        z
    );


    scene.add(
        tree
    );

}


/* =========================================================
   CLOUD
========================================================= */

function createCloud() {

    const group =
        new THREE.Group();


    const material =
        new THREE.MeshStandardMaterial({
            color: 0xffffff
        });


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const part =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    3 +
                    Math.random() *
                    2,
                    16,
                    16
                ),

                material

            );


        part.position.x =
            (i - 2) *
            4;


        group.add(
            part
        );

    }


    return group;

}


/* =========================================================
   KART
========================================================= */

function createKart(
    color
) {

    const kart =
        new THREE.Group();


    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.5,
                .7,
                3.5
            ),

            new THREE.MeshStandardMaterial({
                color: color
            })

        );


    body.position.y =
        1;


    body.castShadow =
        true;


    kart.add(
        body
    );


    const seat =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                1.5,
                .8,
                1.2
            ),

            new THREE.MeshStandardMaterial({
                color: 0x111318
            })

        );


    seat.position.set(
        0,
        1.55,
        .35
    );


    kart.add(
        seat
    );


    const head =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                .55,
                20,
                20
            ),

            new THREE.MeshStandardMaterial({
                color: 0xffc7a0
            })

        );


    head.position.set(
        0,
        2.25,
        .2
    );


    head.castShadow =
        true;


    kart.add(
        head
    );


    const helmet =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                .62,
                20,
                20
            ),

            new THREE.MeshStandardMaterial({
                color: color
            })

        );


    helmet.position.set(
        0,
        2.5,
        .2
    );


    helmet.scale.y =
        .65;


    kart.add(
        helmet
    );


    const wheelGeometry =
        new THREE.CylinderGeometry(
            .5,
            .5,
            .4,
            16
        );


    const wheelMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x101114
        });


    [
        [-1.25,.55,-1.1],
        [1.25,.55,-1.1],
        [-1.25,.55,1.1],
        [1.25,.55,1.1]
    ]
    .forEach(
        position => {

            const wheel =
                new THREE.Mesh(
                    wheelGeometry,
                    wheelMaterial
                );


            wheel.rotation.z =
                Math.PI / 2;


            wheel.position.set(
                position[0],
                position[1],
                position[2]
            );


            wheel.castShadow =
                true;


            kart.add(
                wheel
            );

        }
    );


    return kart;

}


/* =========================================================
   RACERS
========================================================= */

function createRacer(
    index,
    isPlayer
) {

    const driver =
        drivers[
            isPlayer
                ? selectedDriver
                : index %
                    drivers.length
        ];


    const kart =
        createKart(
            driver.color
        );


    kart.position.set(
        52,
        0,
        (index - 1.5) * 3
    );


    scene.add(
        kart
    );


    return {

        mesh: kart,

        isPlayer,

        speed: 0,

        maxSpeed:
            22 *
            driver.speed,

        acceleration:
            12 *
            driver.acceleration,

        handling:
            driver.handling,

        angle: 0,

        lap: 1

    };

}


/* =========================================================
   START RACE
========================================================= */

function startRace() {

    menu.classList.add(
        "hidden"
    );

    garage.classList.add(
        "hidden"
    );

    controllerScreen.classList.add(
        "hidden"
    );

    finish.classList.add(
        "hidden"
    );

    gameScreen.classList.remove(
        "hidden"
    );


    racers.forEach(
        racer => {

            scene.remove(
                racer.mesh
            );

        }
    );


    racers = [];


    player =
        createRacer(
            0,
            true
        );


    racers.push(
        player
    );


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


    boost = 0;
    lap = 1;

    gameRunning = false;


    startCountdown();

}


/* =========================================================
   COUNTDOWN
========================================================= */

function startCountdown() {

    countdown.classList.remove(
        "hidden"
    );


    let n = 3;


    countdown.textContent =
        n;


    const timer =
        setInterval(
            () => {

                n--;


                if (n > 0) {

                    countdown.textContent =
                        n;

                }
                else {

                    countdown.textContent =
                        "GO!";


                    gameRunning =
                        true;


                    setTimeout(
                        () => {

                            countdown.classList.add(
                                "hidden"
                            );

                        },
                        600
                    );


                    clearInterval(
                        timer
                    );

                }

            },
            900
        );

}


/* =========================================================
   PLAYER
========================================================= */

function updatePlayer(
    delta
) {

    if (
        !player ||
        !gameRunning
    ) {
        return;
    }


    const gas =
        keys["ArrowUp"] ||
        keys["KeyW"];


    const brake =
        keys["ArrowDown"] ||
        keys["KeyS"];


    const left =
        keys["ArrowLeft"] ||
        keys["KeyA"];


    const right =
        keys["ArrowRight"] ||
        keys["KeyD"];


    const drift =
        keys["ShiftLeft"] ||
        keys["ShiftRight"];


    if (gas) {

        player.speed +=
            player.acceleration *
            delta;

    }
    else {

        player.speed -=
            6 *
            delta;

    }


    if (brake) {

        player.speed -=
            12 *
            delta;

    }


    if (
        keys["Space"] &&
        boost > 0
    ) {

        player.speed +=
            20 *
            delta;


        boost -=
            35 *
            delta;

    }


    player.speed =
        THREE.MathUtils.clamp(
            player.speed,
            0,
            player.maxSpeed +
                12
        );


    let steer = 0;


    if (left)
        steer--;


    if (right)
        steer++;


    if (
        Math.abs(steer) > 0 &&
        player.speed > 2
    ) {

        player.mesh.rotation.y +=
            steer *
            player.handling *
            delta *
            (
                drift
                    ? 2.5
                    : 1.4
            );

    }


    const direction =
        new THREE.Vector3(
            Math.sin(
                player.mesh.rotation.y
            ),
            0,
            Math.cos(
                player.mesh.rotation.y
            )
        );


    player.mesh.position.addScaledVector(
        direction,
        player.speed *
            delta
    );


    if (
        drift &&
        Math.abs(steer) > 0 &&
        player.speed > 7
    ) {

        boost +=
            15 *
            delta;

    }


    boost =
        THREE.MathUtils.clamp(
            boost,
            0,
            100
        );


    updateHUD();

}


/* =========================================================
   AI
========================================================= */

function updateAI(
    delta
) {

    racers.forEach(
        (racer, index) => {

            if (
                racer.isPlayer
            )
                return;


            racer.angle +=
                (
                    14 +
                    index * 2
                ) *
                delta /
                55;


            const x =
                Math.cos(
                    racer.angle
                ) *
                55;


            const z =
                Math.sin(
                    racer.angle
                ) *
                35;


            racer.mesh.position.x =
                x;


            racer.mesh.position.z =
                z;


            racer.mesh.rotation.y =
                -racer.angle -
                Math.PI / 2;

        }
    );

}


/* =========================================================
   CAMERA
========================================================= */

function updateCamera(
    delta
) {

    if (!player)
        return;


    const offset =
        new THREE.Vector3(
            0,
            6,
            11
        );


    offset.applyAxisAngle(
        new THREE.Vector3(
            0,
            1,
            0
        ),
        player.mesh.rotation.y
    );


    const target =
        player.mesh.position
            .clone()
            .add(offset);


    camera.position.lerp(
        target,
        1 -
        Math.pow(
            .001,
            delta
        )
    );


    const look =
        player.mesh.position
            .clone();


    look.y += 1;


    camera.lookAt(
        look
    );

}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    if (!player)
        return;


    document.getElementById(
        "speed"
    ).textContent =
        Math.round(
            player.speed * 5
        );


    document.getElementById(
        "lap"
    ).textContent =
        Math.min(
            lap,
            3
        );


    document.getElementById(
        "position"
    ).textContent =
        "1";


    document.getElementById(
        "boostFill"
    ).style.width =
        boost + "%";

}


/* =========================================================
   ITEM
========================================================= */

function useItem() {

    if (!gameRunning)
        return;


    racers
        .filter(
            r =>
                !r.isPlayer
        )
        .forEach(
            r => {

                r.speed *= .5;

            }
        );


    document.getElementById(
        "itemIcon"
    ).textContent =
        "🚀";


    setTimeout(
        () => {

            document.getElementById(
                "itemIcon"
            ).textContent =
                "?";

        },
        1000
    );

}


/* =========================================================
   CONTROLLER
========================================================= */

function openController() {

    menu.classList.add(
        "hidden"
    );

    controllerScreen.classList.remove(
        "hidden"
    );


    const url =
        window.location.origin +
        window.location.pathname
            .replace(
                /index\.html$/,
                ""
            ) +
        "controller.html";


    document.getElementById(
        "controllerUrl"
    ).textContent =
        url;

}


/* =========================================================
   ANIMATION
========================================================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    const delta =
        Math.min(
            clock.getDelta(),
            .05
        );


    if (gameRunning) {

        updatePlayer(
            delta
        );

        updateAI(
            delta
        );

    }


    updateCamera(
        delta
    );


    renderer.render(
        scene,
        camera
    );

}


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            !camera ||
            !renderer
        )
            return;


        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


/* =========================================================
   START
========================================================= */

init();
