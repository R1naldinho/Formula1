let session_path = "";
let session;
let key;
let pilots = [];
let driverNumber;
let lapsData = [];
let lap;
let telemetryData = [];

window.onload = fetchData;

async function fetchData() {
    document.getElementById('graphics_container').style.display = 'none';
    document.getElementById('pilotDropdown').style.display = 'none';
    document.getElementById('lapsDropdown').style.display = 'none';
    document.getElementById('colorPicker').style.display = 'none';
    session_path = localStorage.getItem("session_path");

    const sessionInfoResponse = await fetch(`http://localhost:3000/api/SessionInfo/${session_path}`);
    const sessionInfoData = await sessionInfoResponse.json();
    session = sessionInfoData;
    key = session.Key;

    document.getElementById("session_name_nav").innerHTML = `${session.Meeting.Name} - ${session.Name}`;

    const driverListResponse = await fetch(`http://localhost:3000/api/driverList/${session_path}`);
    const driverListData = await driverListResponse.json();

    for (const pilotId in driverListData) {
        pilots.push(driverListData[pilotId]);
    }
    pilots.sort((a, b) => a.Tla.localeCompare(b.Tla));

    let dropdown = document.getElementById("pilotDropdown");

    for (let i = 0; i < pilots.length; i++) {
        let option = document.createElement("option");
        option.value = pilots[i].RacingNumber;
        option.text = pilots[i].BroadcastName;
        dropdown.add(option);
    }
    document.getElementById('pilotDropdown').style.display = 'block';
}

document.getElementById("pilotDropdown").addEventListener("change", async function () {
    document.getElementById('graphics_container').style.display = 'none';
    document.getElementById('lapsDropdown').style.display = 'none';
    document.getElementById('colorPicker').style.display = 'none';
    driverNumber = this.value;

    const lapsResponse = await fetch(`https://api.openf1.org/v1/laps?session_key=${key}&driver_number=${driverNumber}`);
    lapsData = await lapsResponse.json();
    console.log(lapsData);

    let lapsDropdown = document.getElementById("lapsDropdown");
    lapsDropdown.innerHTML = "";

    let optionDefault = document.createElement("option");
    optionDefault.value = -1;
    optionDefault.text = "Select Lap";
    optionDefault.selected = true;
    optionDefault.disabled = true;
    lapsDropdown.add(optionDefault);

    for (let i = 0; i < lapsData.length; i++) {
        let option = document.createElement("option");
        option.value = lapsData[i].lap_number;
        option.text = `Lap ${lapsData[i].lap_number}`;
        lapsDropdown.add(option);
    }
    document.getElementById('lapsDropdown').style.display = 'block';
});

document.getElementById("lapsDropdown").addEventListener("change", async function () {
    lap = this.value;
    document.getElementById('graphics_container').style.display = 'none';
    document.getElementById('colorPicker').style.display = 'none';
    telemetry();
});

const colors = {
    0: { bg: "#ffffff", color: "#000000" },
    2048: { bg: "#ffff00", color: "#000000" },
    2049: { bg: "#00ff00", color: "#000000" },
    2050: { bg: "#ffffff", color: "#000000" },
    2051: { bg: "#800080", color: "#ffffff" },
    2052: { bg: "#ffffff", color: "#000000" },
    2064: { bg: "#ffffff", color: "#000000" },
    2068: { bg: "#ffffff", color: "#000000" },
    null: { bg: "#ffffff", color: "#000000" }
};

async function telemetry() {
    const lapsResponse = await fetch(`https://api.openf1.org/v1/car_data?driver_number=${driverNumber}&session_key=${key}`);
    let allLapsData = await lapsResponse.json();
    telemetryData = [];

    const lapDuration = lapsData[lap - 1].lap_duration;
    const milliseconds = lapDuration.toFixed(3).split('.')[1].padEnd(3, '0');
    const minutes = Math.floor(lapDuration / 60);
    const seconds = (lapDuration - parseFloat(milliseconds) / 1000) % 60;
    const formattedSeconds = seconds.toFixed(0).padStart(2, '0');

    if (lapDuration == 0) {
        document.getElementById('lapDuration').innerHTML = `Lap Time: <span class="txt-duration">-</span>`;
    } else {
        document.getElementById('lapDuration').innerHTML = `Lap Time: <span class="txt-duration">${minutes}:${formattedSeconds}.${milliseconds}</span>`;
    }

    // Create a container for the sector and microsector durations
    const sectorContainer = document.createElement('div');
    sectorContainer.classList.add('row', 'row-sectors');

    // Create a column for sector 1
    const sector1Column = document.createElement('div');
    sector1Column.classList.add('col');
    sector1Column.innerHTML = `
        <div class="sector_time"><span class="badge text-bg-primary">Sector 1: <span class="sector-time">${lapsData[lap - 1].duration_sector_1}</span></span></div>
        <table>
            <tr>
                ${lapsData[lap - 1].segments_sector_1.map((segment, index) => `<td style="background-color: ${colors[segment].bg} !important; color: ${colors[segment].color} !important; width: ${100 / lapsData[lap - 1].segments_sector_1.length}%">MS${index + 1}</td>`).join('')}
            </tr>
        </table>
    `;

    // Create a column for sector 2
    const sector2Column = document.createElement('div');
    sector2Column.classList.add('col');
    sector2Column.innerHTML = `
        <div class="sector_time"><span class="badge text-bg-warning">Sector 2: <span class="sector-time">${lapsData[lap - 1].duration_sector_2}</span></span></div>
        <table>
            <tr>
                ${lapsData[lap - 1].segments_sector_2.map((segment, index) => `<td style="background-color: ${colors[segment].bg} !important; color: ${colors[segment].color} !important; width: ${100 / lapsData[lap - 1].segments_sector_2.length}%">MS${index + 1}</td>`).join('')}
            </tr>
        </table>
    `;

    // Create a column for sector 3
    const sector3Column = document.createElement('div');
    sector3Column.classList.add('col');
    sector3Column.innerHTML = `
        <div class="sector_time"><span class="badge text-bg-danger">Sector 3: <span class="sector-time">${lapsData[lap - 1].duration_sector_3}</span></span></div>
        <table>
            <tr>
                ${lapsData[lap - 1].segments_sector_3.map((segment, index) => `<td style="background-color: ${colors[segment].bg} !important; color: ${colors[segment].color} !important; width: ${100 / lapsData[lap - 1].segments_sector_3.length}%">MS${index + 1}</td>`).join('')}
            </tr>
        </table>
    `;

    // Append the columns to the sector container
    sectorContainer.appendChild(sector1Column);
    sectorContainer.appendChild(sector2Column);
    sectorContainer.appendChild(sector3Column);

    // Get the parent element for the lap data
    const lapDataContainer = document.getElementById('sectors');

    // Clear any existing lap data
    lapDataContainer.innerHTML = '';

    // Append the sector and microsector containers to the lap data container
    lapDataContainer.appendChild(sectorContainer);

    if (lap != 1) {
        let startDate = new Date(lapsData[lap - 1].date_start);
        let endDate = new Date(lapsData[lap - 1].date_start);
        endDate.setSeconds(endDate.getSeconds() + lapsData[lap - 1].lap_duration);

        for (let i = 0; i < allLapsData.length; i++) {
            let lapDate = new Date(allLapsData[i].date);
            if (lapDate >= startDate && lapDate <= endDate) {
                telemetryData.push(allLapsData[i]);
            }
            if (lapDate > endDate) {
                break;
            }
        }
    } else if (lap == 1) {
        if (lapsData.length == 1) {
            telemetryData = allLapsData;
        } else {
            let startDate = new Date(session.StartDate);
            let gmtOffset = session.GmtOffset;

            let [hours, minutes, seconds] = gmtOffset.split(':').map(Number);

            let totalOffset = (hours * 60 * 60 + minutes * 60 + seconds) * 1000;

            startDate.setTime(startDate.getTime() - totalOffset);
            let endDate = new Date(lapsData[1].date_start);

            for (let i = 0; i < allLapsData.length; i++) {
                let lapDate = new Date(allLapsData[i].date);
                if (lapDate >= startDate && lapDate <= endDate) {
                    telemetryData.push(allLapsData[i]);
                }
                if (lapDate > endDate) {
                    break;
                }
            }
        }
    } else {
        return;
    }

    document.getElementById('graphics_container').style.display = 'block';


    const existingCards = document.querySelectorAll('.card');
    existingCards.forEach(card => card.remove());
    createChart('speedChart', 'Speed', telemetryData.map(entry => entry.speed));
    createChart('throttleChart', 'Throttle', telemetryData.map(entry => entry.throttle));
    createChart('brakeChart', 'Brake', telemetryData.map(entry => entry.brake));
    createChart('gearChart', 'Gear', telemetryData.map(entry => entry.n_gear));
    createChart('rpmChart', 'RPM', telemetryData.map(entry => entry.rpm));

}


function createChart(canvasId, label, data) {

    const existingChart = Chart.getChart(canvasId);

    if (existingChart) {
        existingChart.destroy();

        const resetButtonContainer = document.querySelector(`#${canvasId}_reset_button`);
        if (resetButtonContainer) {
            resetButtonContainer.parentNode.removeChild(resetButtonContainer);
        }
    }

    // Create a card container
    const cardContainer = document.createElement('div');
    cardContainer.classList.add('card');

    // Create a card body
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    // Create a title for the chart and center it
    const chartTitle = document.createElement('h2');
    chartTitle.textContent = label;
    chartTitle.style.textAlign = 'center';

    // Create the canvas
    const canvas = document.createElement('canvas');
    canvas.id = canvasId;

    // Insert the title and the canvas into the card body
    cardBody.appendChild(chartTitle);
    cardBody.appendChild(canvas);

    // Create a reset button
    const resetButton = document.createElement('button');
    resetButton.innerHTML = 'Reset Zoom';
    resetButton.classList.add('reset-zoom-btn');

    resetButton.addEventListener('click', () => {
        myChart.resetZoom();
    });

    // Create a container for the reset button
    const resetButtonContainer = document.createElement('div');
    resetButtonContainer.id = `${canvasId}_reset_button`;
    resetButtonContainer.classList.add('reset_button');
    resetButtonContainer.appendChild(resetButton);

    // Insert the reset button into the card body
    cardBody.appendChild(resetButtonContainer);

    // Insert the card body into the card container
    cardContainer.appendChild(cardBody);

    // Get the parent element of the canvas
    const parentElement = document.getElementById('graphics_container');

    // Insert the card container into the parent element
    parentElement.appendChild(cardContainer);

    const chartData = {
        labels: data.map((value, index) => index + 1),
        datasets: [{
            borderColor: document.getElementById('colorPicker').value,
            label: label,
            data: data,
            fill: false,
            pointRadius: 0,
        }]
    };

    const chartOptions = {
        plugins: {
            legend: {
                display: false
            },
            zoom: {
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true
                    },
                    mode: 'xy',
                },
                pan: {
                    enabled: true,
                    mode: 'xy',
                },
                limits: {
                    x: { min: 'original', max: 'original' },
                    y: { min: 'original', max: 'original' },
                },
                reset: {
                    enabled: true,
                }
            }
        },
        scales: {
            x: {
                display: false,
            },
        },
        interaction: {
            mode: 'index',
            intersect: false,
        }, legend: {
            display: false
        },
        tooltips: {
            enabled: true,
            mode: 'index',
            intersect: false,
        },
    };

    const chartConfig = {
        type: 'line',
        data: chartData,
        options: chartOptions
    };

    const ctx = canvas.getContext('2d');
    const myChart = new Chart(ctx, chartConfig);
    document.getElementById('colorPicker').style.display = 'block';
}

document.getElementById("colorPicker").addEventListener("change", updateChartColor);

function updateChartColor() {
    const color = document.getElementById("colorPicker").value;
    const chart = Chart.getChart("speedChart");
    if (chart) {
        chart.data.datasets[0].borderColor = color;
        chart.update();
    }
    const chart2 = Chart.getChart("throttleChart");
    if (chart2) {
        chart2.data.datasets[0].borderColor = color;
        chart2.update();
    }
    const chart3 = Chart.getChart("brakeChart");
    if (chart3) {
        chart3.data.datasets[0].borderColor = color;
        chart3.update();
    }
    const chart4 = Chart.getChart("gearChart");
    if (chart4) {
        chart4.data.datasets[0].borderColor = color;
        chart4.update();
    }
    const chart5 = Chart.getChart("rpmChart");
    if (chart5) {
        chart5.data.datasets[0].borderColor = color;
        chart5.update();
    }

}