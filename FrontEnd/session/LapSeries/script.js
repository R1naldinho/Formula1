let session_path = ""
let session
let lapSeries = []
let pilots = []

window.onload = fetchData;

window.onresize = function() {
    location.reload();
};

async function fetchData() {
    session_path = localStorage.getItem("session_path")

    const sessionInfoResponse = await fetch(`http://localhost:3000/api/SessionInfo/${session_path}`);
    const sessionInfoData = await sessionInfoResponse.json();
    session = sessionInfoData

    document.getElementById("session_name_nav").innerHTML = `${session.Meeting.Name} - ${session.Name}`

    const lapSeriesResponse = await fetch(`http://localhost:3000/api/lapSeries/${session_path}`);
    lapSeries = await lapSeriesResponse.json();
    lapSeries = Object.values(lapSeries);

    //lapSeries.sort((a, b) => parseInt(a.LapPosition[0]) - parseInt(b.LapPosition[0]));

    const driverListResponse = await fetch(`http://localhost:3000/api/driverList/${session_path}`);
    const driverListData = await driverListResponse.json();

    for (const pilotId in driverListData) {
        pilots.push(driverListData[pilotId]);
    }

    console.log(lapSeries)

    getLapsChart();
}

async function getLapsChart() {
    const lapSeriesData = lapSeries

    const pilotNumbers = Object.values(lapSeriesData).map(pilot => pilot.RacingNumber);
    const maxLaps = Math.max(...Object.values(lapSeriesData).map(pilot => pilot.LapPosition.length));

    const lapPositions = Object.values(lapSeriesData).map(pilot => {
        const positions = pilot.LapPosition
        return positions;
    });

    const lapLabels = [];
    for (let i = 0; i < maxLaps; i++) {
        lapLabels.push(`Lap ${i}`);
    }

    const datasets = [];
    pilotNumbers.forEach((pilotNumber, index) => {
        const driver = pilots.find(pilot => pilot.RacingNumber === pilotNumber);
        datasets.push({
            label: `${driver.Tla} #${driver.RacingNumber}`,
            data: lapPositions[index],
            borderColor: `#${driver.TeamColour}`,
            fill: false
        });
    });

    const chartData = {
        labels: lapLabels,
        datasets: datasets
    };

    const chartOptions = {
        responsive: true,
        scaleShowValues: true,
        plugins: {
            title: {
                display: true,
                text: 'Drivers Positions Over Laps',
                color: 'aliceblue',
                font: {
                    weight: 'bold',
                    size: 24
                }
            },
            legend: {
                display: false 
            }
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Lap',
                    color: 'aliceblue',
                    font: {
                        weight: 'bold',
                        size: 18
                    }
                },
                ticks: {
                    color: 'aliceblue',
                    font: {
                        weight: 'bold',
                        size: 13
                    }
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Position',
                    color: 'aliceblue',
                    font: {
                        weight: 'bold',
                        size: 18
                    }
                },
                ticks: {
                    color: 'aliceblue',
                    font: {
                        weight: 'bold',
                        size: 13
                    },
                    autoSkip: false,
                    stepSize: 1, 
                    min: 1,
                },
                beginAtZero: false,
                reverse: true
            }
        }
    };
    
    





    const ctx = document.getElementById('lapsChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: chartOptions
    });
}