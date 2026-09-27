"use strict";

let peer = null;
let connection = null;

const controls = {
    up: false,
    down: false,
    left: false,
    right: false,
    drift: false
};

const roomInput =
    document.getElementById("roomInput");

const connectButton =
    document.getElementById("connectButton");

const status =
    document.getElementById("status");

const connectPanel =
    document.getElementById("connectPanel");

const controlsPanel =
    document.getElementById("controls");

const playerSelect =
    document.getElementById("playerSelect");

function sendControls() {

    if (!connection || !connection.open) {
        return;
    }

    connection.send({
        type: "control",

        player:
            Number(playerSelect.value),

        controls: {
            ...controls
        }
    });

}

function setControl(key, value) {

    controls[key] = value;

    sendControls();

}

function setupButton(button) {

    const key = button.dataset.key;

    if (!key) return;

    const start = event => {

        event.preventDefault();

        setControl(key, true);

    };

    const end = event => {

        event.preventDefault();

        setControl(key, false);

    };

    button.addEventListener(
        "touchstart",
        start,
        { passive: false }
    );

    button.addEventListener(
        "touchend",
        end,
        { passive: false }
    );

    button.addEventListener(
        "touchcancel",
        end,
        { passive: false }
    );

    button.addEventListener(
        "mousedown",
        start
    );

    button.addEventListener(
        "mouseup",
        end
    );

    button.addEventListener(
        "mouseleave",
        end
    );

}

document
    .querySelectorAll("[data-key]")
    .forEach(setupButton);

document.getElementById(
    "itemButton"
).addEventListener("click", () => {

    if (!connection || !connection.open) {
        return;
    }

    connection.send({
        type: "item"
    });

});

connectButton.onclick = () => {

    const room =
        roomInput.value.trim();

    if (!room) {

        status.textContent =
            "Wpisz kod pokoju.";

        return;

    }

    if (!window.Peer) {

        status.textContent =
            "Nie udało się załadować kontrolera.";

        return;

    }

    status.textContent =
        "Łączenie...";

    peer = new Peer();

    peer.on("open", () => {

        connection =
            peer.connect(room);

        connection.on("open", () => {

            status.textContent =
                "POŁĄCZONO ✓";

            connectPanel.classList.add(
                "hidden"
            );

            controlsPanel.classList.remove(
                "hidden"
            );

            sendControls();

        });

        connection.on("close", () => {

            status.textContent =
                "Połączenie zakończone.";

            connectPanel.classList.remove(
                "hidden"
            );

            controlsPanel.classList.add(
                "hidden"
            );

        });

        connection.on("error", () => {

            status.textContent =
                "Błąd połączenia.";

        });

    });

    peer.on("error", error => {

        console.error(error);

        status.textContent =
            "Nie można połączyć. Sprawdź kod.";

    });

};

playerSelect.onchange = sendControls;

/* Nie pozwalaj telefonowi zasnąć podczas gry,
   jeśli przeglądarka obsługuje Wake Lock. */

let wakeLock = null;

async function keepScreenAwake() {

    try {

        if ("wakeLock" in navigator) {

            wakeLock =
                await navigator.wakeLock.request(
                    "screen"
                );

        }

    } catch {}

}

document.addEventListener(
    "touchstart",
    keepScreenAwake,
    { once: true }
);
