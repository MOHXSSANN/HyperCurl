const socket = io('http://' + window.document.location.host);

function setButtonState(buttonId, disabled) {
    const btn = document.getElementById(buttonId);
    btn.disabled = disabled;
    btn.style.backgroundColor = disabled ? "lightgray" : "";
}

function configureButtonListener(buttonId, message) {
    const btn = document.getElementById(buttonId);

    let isButtonDisabled = false;

    
    socket.on('Recieved', function (msg) {
        if (msg === message && !isButtonDisabled) {
            setButtonState(buttonId, true); 
            if (socket.buttonId === buttonId) {
                showPopup(message); 
            }
            isButtonDisabled = true; 
        }
    });

    socket.on('buttonAvailability', function (availability) {
        if (availability[buttonId]) {
            setButtonState(buttonId, false);
        } else {
            setButtonState(buttonId, true); 
        }
    });

    return function () {
        console.log(`handle${buttonId}()`);
        socket.emit('sending', message);

        if (buttonId === 'JoinAsHomeButton' && !isHomePlayerAssigned) {
            isHomePlayerAssigned = true;
            isHomeClient = true;
            showPopup('You are on the Home side.'); 
        } else if (buttonId === 'JoinAsVisitorButton' && !isVisitorPlayerAssigned) {
            isVisitorPlayerAssigned = true;
            isVisitorClient = true;
            socket.emit('buttonAvailability', { [buttonId]: false }); 
            showPopup('You are on the Visitor side.'); 
        } else if (buttonId === 'JoinAsSpectatorButton' && !isSpectatorClient) {
            const btnSpectator = document.getElementById("JoinAsSpectatorButton");
            btnSpectator.disabled = true;
            btnSpectator.style.backgroundColor = "lightgray";
            isSpectatorClient = true;
            showPopup('You are a Spectator.'); 
        }
    };
}


function showPopup(message) {
    alert(message); 
}

const handleJoinAsHomeButton = configureButtonListener('JoinAsHomeButton', 'Disable Home');
const handleJoinAsVisitorButton = configureButtonListener('JoinAsVisitorButton', 'Disable Visitor');
const handleJoinAsSpectatorButton = configureButtonListener('JoinAsSpectatorButton', 'Disable Spectator');
