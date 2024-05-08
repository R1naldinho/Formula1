let session_path = ""
let pilotsData = []
let countries

async function fetchData() {
    session_path = localStorage.getItem("session_path");

    const driverListResponse = await fetch(`http://localhost:3000/api/driverList/${session_path}`);
    const driverListData = await driverListResponse.json();

    for (const pilotId in driverListData) {
        pilotsData.push(driverListData[pilotId]);
    }

    pilotsData.sort((a, b) => a.TeamName.localeCompare(b.TeamName));
    console.log(pilotsData)

    const countryResponse = await fetch(`http://localhost:3000/api/countriesJSON`);
    countries = await countryResponse.json();

    initializePilotCards();
}

window.onload = fetchData;

function createPilotCard(pilot) {
    let card = document.createElement('div');
    card.className = 'card m-3 d-flex flex-row flex-wrap align-items-center'; 
    card.style = 'border: solid 0px; box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);';

    let img = document.createElement('img');

    if (pilot.HeadshotUrl) {
        let imageUrl = pilot.HeadshotUrl.replace('1col', '10col');
        img.src = imageUrl;
        img.className = 'card-img-left rounded-circle';
        img.alt = pilot.FullName + ' Headshot';
        img.style = 'width: 100px; height: 100px;';
    } else {
        img.src = '../../documents/person.png';
        img.className = 'card-img-left rounded-circle';
        img.alt = 'Immagine non disponibile';
        img.style = 'width: 100px; height: 100px;';
    }

    let cardBody = document.createElement('div');
    cardBody.className = 'card-body flex-grow-1';

    let title = document.createElement('h5');
    title.className = 'card-title';
    title.innerText = pilot.FullName;

    let team = document.createElement('p');
    team.className = 'card-text';
    team.innerText = pilot.TeamName;

    let number = document.createElement('p');
    number.className = 'card-text display-3 text-end'; 
    number.innerText = pilot.RacingNumber;
    number.style = `color: #${pilot.TeamColour}; -webkit-text-stroke: 1px black; font-weight: bold;`;

    cardBody.appendChild(title);
    cardBody.appendChild(team);
    cardBody.appendChild(number);

    card.appendChild(img);
    card.appendChild(cardBody);

    return card;
}


function initializePilotCards() {
    let container = document.querySelector('#pilotsContainer .row');
    container.className += ' justify-content-center'; 

    for (let i = 0; i < pilotsData.length; i++) {
        let pilot = pilotsData[i];
        let card = createPilotCard(pilot);
        container.appendChild(card);
    }
}