"use strict";


/* =========================================================
   CONTROLLER STATE
========================================================= */

const state = {

    left: false,
    right: false,

    gas: false,
    brake: false,

    drift: false,
    boost: false,

    item: false

};


/* =========================================================
   STATUS
========================================================= */

const statusElement =
    document.getElementById(
        "status"
    );


function setStatus(text, connected = false) {

    statusElement.textContent =
        text;

    statusElement.style.color =
        connected
            ? "#20e070"
            : "#ffb000";

}


/* =========================================================
   SEND COMMAND
========================================================= */

function sendCommand(
    button,
    pressed
) {

    const command = {

        type: "controller",

        button,

        pressed,

        timestamp:
            Date.now()

    };


    /*
       Na razie zapisujemy ostatnią
       komendę lokalnie.

       W następnym etapie można podłączyć
       WebRTC / WebSocket bez zmiany
       wyglądu kontrolera.
    */

    try {

        localStorage.setItem(
            "turboControllerCommand",
            JSON.stringify(command)
        );

    }
    catch (error) {

        console.warn(
            "Nie można zapisać komendy",
            error
        );

    }


    window.dispatchEvent(
        new CustomEvent(
            "turbo-controller",
            {
                detail: command
            }
        )
    );

}


/* =========================================================
   BUTTON HELPER
========================================================= */

function setupHoldButton(
    id,
    key
) {

    const button =
        document.getElementById(id);


    if (!button) {

        console.error(
            "Brak przycisku:",
            id
        );

        return;

    }


    const press = event => {

        event.preventDefault();

        if (state[key])
            return;

        state[key] = true;

        button.classList.add(
            "pressed"
        );

        sendCommand(
            key,
            true
        );

    };


    const release = event => {

        event.preventDefault();

        if (!state[key])
            return;

        state[key] = false;

        button.classList.remove(
            "pressed"
        );

        sendCommand(
            key,
            false
        );

    };


    button.addEventListener(
        "touchstart",
        press,
        {
            passive: false
        }
    );

    button.addEventListener(
        "touchend",
        release,
        {
            passive: false
        }
    );

    button.addEventListener(
        "touchcancel",
        release,
        {
            passive: false
        }
    );


    button.addEventListener(
        "mousedown",
        press
    );

    button.addEventListener(
        "mouseup",
        release
    );

    button.addEventListener(
        "mouseleave",
        release
    );

}


/* =========================================================
   CONTROLS
========================================================= */

setupHoldButton(
    "left",
    "left"
);

setupHoldButton(
    "right",
    "right"
);

setupHoldButton(
    "gas",
    "gas"
);

setupHoldButton(
    "brake",
    "brake"
);

setupHoldButton(
    "drift",
    "drift"
);

setupHoldButton(
    "boost",
    "boost"
);


/* =========================================================
   ITEM
========================================================= */

const itemButton =
    document.getElementById(
        "item"
    );


itemButton.addEventListener(
    "touchstart",
    event => {

        event.preventDefault();

        sendCommand(
            "item",
            true
        );

    },
    {
        passive: false
    }
);


itemButton.addEventListener(
    "click",
    event => {

        event.preventDefault();

        sendCommand(
            "item",
            true
        );

    }
);


/* =========================================================
   CONNECTION UI
========================================================= */

setStatus(
    "KONTROLER GOTOWY",
    true
);


/* =========================================================
   PREVENT PHONE GESTURES
========================================================= */

document.addEventListener(
    "gesturestart",
    event => {

        event.preventDefault();

    }
);


document.addEventListener(
    "contextmenu",
    event => {

        event.preventDefault();

    }
);


/* =========================================================
   ORIENTATION
========================================================= */

window.addEventListener(
    "orientationchange",
    () => {

        setTimeout(
            () => {

                window.scrollTo(
                    0,
                    0
                );

            },
            100
        );

    }
);
