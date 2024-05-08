let session_path = ""
let session
let tyres
let tyresColors
let pilots = []

window.onload = fetchData;

async function fetchData() {
    session_path = localStorage.getItem("session_path")

    const sessionInfoResponse = await fetch(`http://localhost:3000/api/SessionInfo/${session_path}`);
    const sessionInfoData = await sessionInfoResponse.json();
    session = sessionInfoData

    document.getElementById("session_name_nav").innerHTML = `${session.Meeting.Name} - ${session.Name}`


    const tyresColorResponse = await fetch(`http://localhost:3000/api/tyresJSON`);
    tyresColors = await tyresColorResponse.json();

    const tyresResponse = await fetch(`http://localhost:3000/api/tyreStintSeries/${session_path}`);
    const tyresData = await tyresResponse.json();
    tyres = tyresData

    const driverListResponse = await fetch(`http://localhost:3000/api/driverList/${session_path}`);
    const driverListData = await driverListResponse.json();

    for (const pilotId in driverListData) {
        pilots.push(driverListData[pilotId]);
    }

    console.log(pilots)

    createBarChart();
}

async function createBarChart() {
    const stints = tyres.Stints;
    console.log(tyres)

    const totalLapsByPilot = {};

    for (const [pilotNumber, stintData] of Object.entries(stints)) {
        let totalLaps = 0;
        for (const item of stintData) {
            totalLaps += item.TotalLaps;
        }
        totalLapsByPilot[pilotNumber] = totalLaps;
    }

    const stintBarsContainer = document.getElementById("stintBars");

    for (const [pilotNumber, stintData] of Object.entries(stints)) {
        const pilotTotalLaps = totalLapsByPilot[pilotNumber];

        // Trova il pilota corrispondente nell'array dei piloti e salvalo nella variabile driver
        const driver = pilots.find(pilot => pilot.RacingNumber === pilotNumber);

        // Crea una card per il pilota
        const pilotCardDiv = document.createElement("div");
        pilotCardDiv.classList.add("card", "mb-3", "stint-card");

        // Crea il corpo della card
        const cardBodyDiv = document.createElement("div");
        cardBodyDiv.classList.add("card-body");

        // Crea il titolo della card con il nome del pilota e il numero
        const cardTitle = document.createElement("h5");
        cardTitle.classList.add("card-title");
        cardTitle.textContent = `${driver.FullName} #${driver.RacingNumber}`;
        cardBodyDiv.appendChild(cardTitle);

        // Aggiungi il nome del team
        const teamName = document.createElement("p");
        teamName.classList.add("card-text");
        teamName.textContent = `Team: ${driver.TeamName}`;
        cardBodyDiv.appendChild(teamName);

        // Aggiungi il numero totale di giri del pilota
        const totalLapsLabel = document.createElement("p");
        totalLapsLabel.classList.add("card-text");
        totalLapsLabel.textContent = `Total Laps: ${pilotTotalLaps}`;
        cardBodyDiv.appendChild(totalLapsLabel);

        // Crea una progress bar per il pilota
        const pilotProgressBarDiv = document.createElement("div");
        pilotProgressBarDiv.classList.add("progress-stacked", "mb-3");

        for (const [index, item] of stintData.entries()) {
            const percentage = (item.TotalLaps / pilotTotalLaps) * 100;

            // Crea la progress bar per lo stint
            const progressBarDiv = document.createElement("div");
            progressBarDiv.classList.add("progress-bar");
            progressBarDiv.setAttribute("role", "progressbar");
            progressBarDiv.setAttribute("aria-valuenow", percentage);
            progressBarDiv.setAttribute("aria-valuemin", "0");
            progressBarDiv.setAttribute("aria-valuemax", "100");
            progressBarDiv.style.width = `${percentage}%`;
            progressBarDiv.style.backgroundColor = tyresColors[item.Compound];
            progressBarDiv.style.color = "black";
            progressBarDiv.textContent = `${item.TotalLaps} laps`;

            // Aggiungi la progress bar dello stint come figlio della progress bar del pilota
            pilotProgressBarDiv.appendChild(progressBarDiv);
        }

        // Aggiungi la progress bar del pilota al corpo della card
        cardBodyDiv.appendChild(pilotProgressBarDiv);

        // Aggiungi il corpo della card alla card
        pilotCardDiv.appendChild(cardBodyDiv);

        // Aggiungi la card al container
        stintBarsContainer.appendChild(pilotCardDiv);
    }
}






