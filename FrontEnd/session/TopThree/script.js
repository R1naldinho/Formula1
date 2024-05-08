let session_path = ""
let session
let topThree = []
let pilots = []

window.onload = fetchData;

async function fetchData() {
    session_path = localStorage.getItem("session_path")

    const sessionInfoResponse = await fetch(`http://localhost:3000/api/SessionInfo/${session_path}`);
    const sessionInfoData = await sessionInfoResponse.json();
    session = sessionInfoData

    document.getElementById("session_name_nav").innerHTML = `${session.Meeting.Name} - ${session.Name}`

    const topThreeResponse = await fetch(`http://localhost:3000/api/topThree/${session_path}`);
    let topThreeData = await topThreeResponse.json();
    topThree = topThreeData.Lines

    const driverListResponse = await fetch(`http://localhost:3000/api/driverList/${session_path}`);
    const driverListData = await driverListResponse.json();

    for (const pilotId in driverListData) {
        pilots.push(driverListData[pilotId]);
    }

    console.log(topThree)

    getPodium();
}
async function getPodium() {
    let card1 = document.getElementById("card_1");
    let card2 = document.getElementById("card_2");
    let card3 = document.getElementById("card_3");

    const pilot1 = pilots.find(pilot => pilot.RacingNumber === topThree[0].RacingNumber);
    const pilot2 = pilots.find(pilot => pilot.RacingNumber === topThree[1].RacingNumber);
    const pilot3 = pilots.find(pilot => pilot.RacingNumber === topThree[2].RacingNumber);

    card1 = createPilotCard(card1, pilot1)
    card2 = createPilotCard(card2, pilot2)
    card3 = createPilotCard(card3, pilot3)

}

function createPilotCard(card, pilot) {

    let img = document.createElement('img');

    if (pilot.HeadshotUrl) {
        let imageUrl = pilot.HeadshotUrl.replace('1col', '10col');
        img.src = imageUrl;
        img.className = 'card-img-top d-block mx-auto rounded-circle';
        img.alt = pilot.FullName + ' Headshot';
        img.style = 'width: 100px; height: 100px;';
    } else {
        img.src = '../../documents/person.png';
        img.className = 'card-img-top d-block mx-auto rounded-circle';
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
    number.className = 'card-text display-3';
    number.innerText = pilot.RacingNumber;
    number.style = `color: #${pilot.TeamColour}; -webkit-text-stroke: 1px black; font-weight: bold;`;

    cardBody.appendChild(title);
    cardBody.appendChild(team);
    cardBody.appendChild(number);

    card.appendChild(img);
    card.appendChild(cardBody);

    console.log(cardBody)
    return card;
}
