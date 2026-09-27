const waiting = document.getElementById("waiting");
const controller = document.getElementById("controller");

const connectButton =
    document.getElementById("connectButton");

const joystick =
    document.getElementById("joystick");

const joystickKnob =
    document.getElementById("joystickKnob");

const gasButton =
    document.getElementById("gasButton");

const brakeButton =
    document.getElementById("brakeButton");

const driftButton =
    document.getElementById("driftButton");

const boostButton =
    document.getElementById("boostButton");

const itemButton =
    document.getElementById("itemButton");


let connected = false;

let joystickX = 0;
let joystickY = 0;

let controls = {

    left: false,
    right: false,

    gas: false,
    brake: false,

    drift: false,
    boost: false,

    item: false

};


// =====================================================
// CONNECT
// =====================================================

connectButton.addEventListener(
    "click",
    () => {

        connected = true;

        waiting.style.display =
            "none";

        controller.style.display =
            "flex";

        if (navigator.vibrate) {

            navigator.vibrate(50);

        }

    }
);


// =====================================================
// JOYSTICK
// =====================================================

let joystickActive = false;


function updateJoystick(
    clientX,
    clientY
) {

    const rect =
        joystick.getBoundingClientRect();

    const centerX =
        rect.left +
        rect.width / 2;

    const centerY =
        rect.top +
        rect.height / 2;

    let x =
        clientX -
        centerX;

    let y =
        clientY -
        centerY;

    const radius =
        rect.width / 2;

    const distance =
        Math.sqrt(
            x * x +
            y * y
        );


    if (distance > radius) {

        x =
            x / distance *
            radius;

        y =
            y / distance *
            radius;

    }


    joystickX =
        x / radius;

    joystickY =
        y / radius;


    joystickKnob.style.transform =
        `translate(
            calc(-50% + ${x}px),
            calc(-50% + ${y}px)
        )`;


    controls.left =
        joystickX < -.25;

    controls.right =
        joystickX > .25;


    sendControls();

}


function resetJoystick() {

    joystickX = 0;
    joystickY = 0;

    controls.left = false;
    controls.right = false;

    joystickKnob.style.transform =
        "translate(-50%, -50%)";

    sendControls();

}


joystick.addEventListener(
    "pointerdown",
    event => {

        joystickActive = true;

        joystick.setPointerCapture(
            event.pointerId
        );

        updateJoystick(
            event.clientX,
            event.clientY
        );

    }
);


joystick.addEventListener(
    "pointermove",
    event => {

        if (!joystickActive) return;

        updateJoystick(
            event.clientX,
            event.clientY
        );

    }
);


joystick.addEventListener(
    "pointerup",
    () => {

        joystickActive = false;

        resetJoystick();

    }
);


joystick.addEventListener(
    "pointercancel",
    () => {

        joystickActive = false;

        resetJoystick();

    }
);


// =====================================================
// BUTTON HELPER
// =====================================================

function bindButton(
    element,
    property
) {

    element.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            controls[property] = true;

            if (navigator.vibrate) {

                navigator.vibrate(20);

            }

            sendControls();

        }
    );


    const release = () => {

        controls[property] = false;

        sendControls();

    };


    element.addEventListener(
        "pointerup",
        release
    );

    element.addEventListener(
        "pointercancel",
        release
    );

    element.addEventListener(
        "pointerleave",
        release
    );

}


bindButton(
    gasButton,
    "gas"
);

bindButton(
    brakeButton,
    "brake"
);

bindButton(
    driftButton,
    "drift"
);

bindButton(
    boostButton,
    "boost"
);

bindButton(
    itemButton,
    "item"
);


// =====================================================
// CONTROLLER DATA
// =====================================================

function sendControls() {

    /*
        W tej wersji kontroler jest gotowy
        wizualnie i funkcjonalnie.

        W kolejnym etapie podłączymy tutaj
        WebRTC/WebSocket, aby dane trafiały
        do gry na komputerze.
    */

    const data = {

        ...controls,

        joystickX,
        joystickY,

        timestamp:
            Date.now()

    };


    window.dispatchEvent(
        new CustomEvent(
            "controllerInput",
            {
                detail: data
            }
        )
    );

}
