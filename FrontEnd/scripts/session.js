let path = ""
let endpoints = []

window.onload = async function () {
    try {
        const response = await fetch('http://localhost:3000/api/countriesJSON');
        if (!response.ok) {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
        countries = await response.json();
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }

    path = localStorage.getItem("session_path");
    await fetchData();
}

async function fetchData() {
    let session;

    session_path = localStorage.getItem("session_path");
    if (session_path != "undefined") {
        try {
            const sessionInfoResponse = await fetch(`http://localhost:3000/api/sessionInfo/${session_path}`);
            const sessionInfoData = await sessionInfoResponse.json();
            session = sessionInfoData;

            const sessionEndpointResponse = await fetch(`http://localhost:3000/api/session/${session_path}`);
            const sessionEndpoint = await sessionEndpointResponse.json();
            endpoints = sessionEndpoint.Feeds;

            create_endpoint_card();

            document.getElementById("session_name").innerHTML = `${session.Meeting.Name} - ${session.Name}`;
        } catch (error) {
            console.error('Error fetching session data:', error);
        }
    } else {
        document.getElementById("endpointCardsContainer").innerHTML = `<p style="text-align:center; font-size: 25px; color:red; font-weight:bold;">Session not found</p>`;
    }
}


function create_endpoint_card() {
    const endpointCardsContainer = document.getElementById('endpointCardsContainer');

    for (const endpointName in endpoints) {
        if (endpoints.hasOwnProperty(endpointName)) {
            if (endpointName == "SessionInfo" || endpointName == "WeatherData" || endpointName == "DriverList" || endpointName == "TyreStintSeries" || endpointName == "LapSeries" || endpointName == "CarData.z" || endpointName == "TopThree") {
                const card = document.createElement('div');
                card.className = 'col-md-4';

                card.innerHTML = `
                    <div class="card session-card">
                    <div class="card-body">
                        <h5 class="card-title">${endpointName}</h5>
                        <button onclick="redirectToEndpoint('${endpointName}')" class="btn btn-session">Go to ${endpointName}</button>
                    </div>
                    </div>
                `;

                endpointCardsContainer.appendChild(card);
            }

        }
    }
}

function redirectToEndpoint(endpointName) {
    window.location.href = `./session/${endpointName}/index.html`;
}