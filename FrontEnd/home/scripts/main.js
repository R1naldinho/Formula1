let session_path = ""
let session
let countries

window.onload = loadCircuitSettings();
window.onresize = createCircuitChart(session_path);

async function fetchData() {
    session_path = localStorage.getItem("session_path")

    const sessionInfoResponse = await fetch(`http://localhost:3000/api/sessionInfo/${session_path}`);
    const sessionInfoData = await sessionInfoResponse.json();
    session = sessionInfoData
    console.log(session)

    const year = localStorage.getItem("selected_year");
    const selected_meeting = localStorage.getItem("selected_meeting");
    let meetings = [];
    try {
        const response = await fetch(`http://localhost:3000/api/races/${year}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
        const data = await response.json();
        meetings = data;
        let race = meetings.Meetings[selected_meeting];
        console.log(race.Sessions)
        let sessionsContainer = document.getElementById("card_session");

        race.Sessions.forEach(function (session) {
            var sessionDiv = document.createElement("div");
            sessionDiv.classList.add("row", "session_row", "align-items-center");
            let startDate = localTime(session.StartDate, session.GmtOffset)

            let date = startDate.split(",")[0];
            let time = startDate.split(",")[1];
            time = time.split(":")[0] + ":" + time.split(":")[1];
            var sessionInfo = `
                <div class="col-md-6 session_col align-items-center">
                    <h3 class="align-items-center">
                        <span class="badge badge_session_name">
                            ${session.Name}
                        </span>
                    </h3>
                </div>
                <div class="col">
                    <div class="row">
                        <div class="col">
                            <div class="row align-items-center">
                                <div class="col">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-calendar2-week" viewBox="0 0 16 16">
                                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"/>
                                    <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5zM11 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z"/>
                                </svg>
                                    ${date}
                                </div>
                            </div>
                        </div>

                        <div class="col">
                            <div class="row align-items-center">
                                <div class="col">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-clock" viewBox="0 0 16 16">
                                    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"/>
                                </svg>
                                    ${time}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            console.log(startDate, oneYearAgo)
            if (startDate > oneYearAgo) {
                // Calculate the remaining time
                var countdownDate = startDate.getTime();


                function updateCountdown() {
                    var now = new Date().getTime();
                    var distance = countdownDate - now;

                    // Calculate days, hours, minutes, and seconds
                    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

                    // Display the countdown
                    sessionInfo += `
                            <div class="countdown col">
                                    ${days}d ${hours}h ${minutes}m ${seconds}s
                            </div>
                    `;

                    // Update the countdown every second
                    setTimeout(updateCountdown, 1000);
                }

                // Initial call to start the countdown
                updateCountdown();
            }

            sessionDiv.innerHTML = sessionInfo;

            sessionsContainer.appendChild(sessionDiv);
            if (race.Sessions.indexOf(session) !== race.Sessions.length - 1) {
                let divider = document.createElement("hr");
                divider.classList.add("rounded_session");
                sessionsContainer.appendChild(divider);
            }

        });
    } catch (error) {
        console.error(error);
    }



    const countryResponse = await fetch(`http://localhost:3000/api/countriesJSON`);
    countries = await countryResponse.json();

    document.getElementById("session_name_nav").innerHTML = `${session.Meeting.Name}`

    document.getElementById("session_name").innerHTML = session.Meeting.Name;
    document.getElementById("flag").innerHTML = `<i class="flag-icon flag-icon-${countries[session.Meeting.Country.Name].toLowerCase()}"></i>`;
}

window.onload = fetchData;


function formatGmtOffset(offsetMinutes) {
    offsetMinutes *= -1
    const hours = Math.floor(Math.abs(offsetMinutes) / 60)
    const minutes = Math.abs(offsetMinutes) % 60

    const formattedOffset = `${offsetMinutes < 0 ? '-' : '+'}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
    return formattedOffset
}

function localTime(startDateString, gmtOffsetString) {
    const startDate = new Date(startDateString)

    const localGmtOffsetMinutes = startDate.getTimezoneOffset()
    const formattedLocalGmtOffset = formatGmtOffset(localGmtOffsetMinutes)
    const [hoursOffset_L, minutesOffset_L, secondsOffset_L] = formattedLocalGmtOffset.split(':')

    const [hoursOffset, minutesOffset, secondsOffset] = gmtOffsetString.split(':')

    startDate.setHours(
        startDate.getHours() - parseInt(hoursOffset) + parseInt(hoursOffset_L)
    )
    startDate.setMinutes(
        startDate.getMinutes() - parseInt(minutesOffset) + parseInt(minutesOffset_L)
    )
    startDate.setSeconds(
        startDate.getSeconds() - parseInt(secondsOffset) + parseInt(secondsOffset_L)
    )

    return startDate.toLocaleString()
}

async function fetchSessionInfo(session_path) {
    try {
        const sessionInfoResponse = await fetch(`http://localhost:3000/api/sessionInfo/${session_path}`);
        const sessionInfoData = await sessionInfoResponse.json();
        return sessionInfoData;
    } catch (error) {
        console.error("Errore durante il recupero delle informazioni sulla sessione:", error);
        return null;
    }
}

var map = null;
async function fetchCircuitInfo(session_path) {
    try {
        const sessionInfoData = await fetchSessionInfo(session_path);
        if (sessionInfoData) {
            const circuitKey = sessionInfoData.Meeting.Circuit.Key;
            const year = new Date(sessionInfoData.StartDate).getFullYear();
            const circuitInfoResponse = await fetch(`http://localhost:3000/api/circuitMap/${year}/${circuitKey}`);
            const circuitInfoData = await circuitInfoResponse.json();

            const circuitInfoDatabase = await fetch(`http://localhost:3000/circuits/circuitKey/${circuitKey}`);
            const circuitInfoDataDB = await circuitInfoDatabase.json();

            let coord = convertCoordinates(circuitInfoDataDB[0].lat, circuitInfoDataDB[0].lng);
            document.getElementById("circuit_name").innerHTML = circuitInfoDataDB[0].name;
            document.getElementById("longitude").innerHTML = coord.lng.degrees + "°" + coord.lng.minutes + "'" + coord.lng.seconds.toFixed(1) + "''" + coord.lng.direction;
            document.getElementById("latitude").innerHTML = coord.lat.degrees + "°" + coord.lat.minutes + "'" + coord.lat.seconds.toFixed(1) + "''" + coord.lat.direction;
            document.getElementById("altitude").innerHTML = circuitInfoDataDB[0].alt + "m";
            console.log(circuitInfoDataDB[0].length && circuitInfoDataDB[0].length != null)
            if (circuitInfoDataDB[0].length != null) {
                document.getElementById("row-lenght").style.display = "flex";
                document.getElementById("length").innerHTML = circuitInfoDataDB[0].length + "m";
            } else {
                document.getElementById("row-lenght").style.display = "none";
            }
            if (circuitInfoDataDB[0].turn != null) {
                document.getElementById("row-turns").style.display = "flex";
                document.getElementById("row-turn-icon").style.display = "flex";
                let corners = JSON.parse(circuitInfoDataDB[0].turn);
                let leftTurns = corners.left_turns;
                let rightTurns = corners.right_turns;
                document.getElementById("right_turns").innerHTML = leftTurns;
                document.getElementById("left_turns").innerHTML = rightTurns;
            }
            else {
                document.getElementById("row-turns").style.display = "none";
                document.getElementById("row-turn-icon").style.display = "none";
            }
            if (circuitInfoDataDB[0].clockwise != null) {
                document.getElementById("row-clockwise").style.display = "flex";
                document.getElementById("clockwise").innerHTML = circuitInfoDataDB[0].clockwise ? `
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
                </svg>
                Clockwise
                `: `
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"/>
                    <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466"/>
                </svg>
                Anti-Clockwise`;
            }
            else {
                document.getElementById("row-clockwise").style.display = "none";
            }
            document.getElementById("location").innerHTML = circuitInfoDataDB[0].location + ", " + circuitInfoDataDB[0].country;

            // Check if map already exists, if so, clear it
            if (map !== null) {
                map.remove();
                map = null;
            }

            const customMarkerIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            map = L.map("map").setView(
                [circuitInfoDataDB[0].lat, circuitInfoDataDB[0].lng],
                14
            );

            L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
                maxZoom: 18,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
            }).addTo(map);

            marker = L.marker([circuitInfoDataDB[0].lat, circuitInfoDataDB[0].lng], { icon: customMarkerIcon }).addTo(map);

            var attributionLink = document.querySelector('.leaflet-control-attribution a');

            attributionLink.addEventListener('click', function (event) {
                event.preventDefault();
                window.open(attributionLink.href, '_blank');
            });


            return { "data": circuitInfoData, "year": year, "circuitKey": circuitKey };
        }
    } catch (error) {
        console.error("Errore durante il recupero delle informazioni sul circuito:", error);
        return null;
    }
}

function convertCoordinates(latitude, longitude) {
    function convertCoordinate(coord) {
        let degrees = Math.floor(coord);
        let minutesDecimal = (coord - degrees) * 60;
        let minutes = Math.floor(minutesDecimal);
        let seconds = (minutesDecimal - minutes) * 60;
        return { degrees, minutes, seconds };
    }

    let latitudeObj = convertCoordinate(Math.abs(latitude));
    let longitudeObj = convertCoordinate(Math.abs(longitude));

    let result = {
        lat: {
            degrees: latitudeObj.degrees,
            minutes: latitudeObj.minutes,
            seconds: latitudeObj.seconds,
            direction: latitude >= 0 ? 'N' : 'S'
        },
        lng: {
            degrees: longitudeObj.degrees,
            minutes: longitudeObj.minutes,
            seconds: longitudeObj.seconds,
            direction: longitude >= 0 ? 'E' : 'W'
        }
    };

    return result;
}

async function createCircuitChart(session_path) {
    d3.select("#circuito").selectAll(".corners").remove();
    d3.select("#circuito").selectAll(".corners-name").remove();
    d3.select("#circuito").selectAll(".marshalLights").remove();
    d3.select("#circuito").selectAll(".marshalSectors").remove();
    d3.select("#circuito").selectAll("path").remove();

    const circuitData = await fetchCircuitInfo(session_path);
    const circuitInfoData = circuitData.data;
    const year = circuitData.year;
    const circuitKey = circuitData.circuitKey;

    let circuit_settings = JSON.parse(localStorage.getItem('circuitSettings'));

    let rotatedNorth_setting = circuit_settings.rotatedNorth
    let corners_setting = circuit_settings.showCorners
    let marshall_setting = circuit_settings.showMarshall
    let marshallLights_setting = circuit_settings.showMarshallLights


    if (circuitInfoData.x && circuitInfoData.x.length > 0 && !(year == 2020 && (circuitKey == 149))) {
        const circuit = {
            x: circuitInfoData.x,
            y: circuitInfoData.y,
            corners: circuitInfoData.corners,
            marshalLights: circuitInfoData.marshalLights,
            marshalSectors: circuitInfoData.marshalSectors,
            rotation: -circuitInfoData.rotation,
        };

        const svgElement = document.getElementById('circuito');
        const margin = { top: 20, right: 20, bottom: 20, left: 20 };
        const width = svgElement.clientWidth - margin.left - margin.right;
        const height = width;

        const svg = d3.select("#circuito")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        const center = { x: width / 2, y: height / 2 };

        const rotatedPoints = circuit.x.map((x, i) => {
            const rotated = rotatePoint({ x: x, y: circuit.y[i] }, circuit.rotation, center);
            return rotated;
        });

        const rotatedXPoints = rotatedPoints.map(point => point.x);
        const rotatedYPoints = rotatedPoints.map(point => point.y);

        const circuitMin = {
            x: Math.min(...rotatedXPoints),
            y: Math.min(...rotatedYPoints)
        };

        const min = Math.min(circuitMin.x, circuitMin.y);

        const circuitMax = {
            x: Math.max(...rotatedXPoints),
            y: Math.max(...rotatedYPoints)
        };

        const max = Math.max(circuitMax.x, circuitMax.y);


        //svg.attr("transform", `rotate(${circuit.rotation})`);

        function customScale(value, domainMin, domainMax, rangeMin, rangeMax, axe) {

            const scaleFactor = Math.abs(domainMax - domainMin) / Math.abs(rangeMax - rangeMin)
            if (axe == "x") {
                for (let d = domainMin; d <= domainMax; d += scaleFactor) {
                    if (value >= d && value <= d + scaleFactor) {
                        return rangeMin + ((d - domainMin) / scaleFactor);
                    }
                }
            } else if (axe == "y") {
                for (let d = domainMin; d <= domainMax; d += scaleFactor) {
                    if (value >= d && value <= d + scaleFactor) {
                        return rangeMin - ((d - domainMin) / scaleFactor);
                    }
                }

            } else {
                return null
            }

        }


        function rotatePoint(point, angle, center) {
            if (rotatedNorth_setting) {
                const compass = document.getElementById('compass');
                compass.style.opacity = 1;
                return { x: point.x, y: point.y }
            }
            const compass = document.getElementById('compass');
            compass.style.opacity = 0;


            const radians = -(Math.PI / 180) * angle,
                cos = Math.cos(radians),
                sin = Math.sin(radians);

            const translatedX = point.x - center.x;
            const translatedY = point.y - center.y;

            const rotatedX = translatedX * cos - translatedY * sin;
            const rotatedY = translatedX * sin + translatedY * cos;

            const finalX = rotatedX + center.x;
            const finalY = rotatedY + center.y;

            return { x: finalX, y: finalY };
        }

        const rotatedScaledPoints = circuit.x.map((x, i) => {
            const rotated = rotatePoint({ x: x, y: circuit.y[i] }, circuit.rotation, center);

            const scaledX = customScale(rotated.x, min, max, margin.left, width - margin.right, "x");
            const scaledY = customScale(rotated.y, min, max, height - margin.top, margin.bottom, "y");

            return { x: scaledX, y: scaledY };
        });

        let rotatedScaledCorners = [];
        if (circuit.corners && circuit.corners.length > 0) {
            rotatedScaledCorners = circuit.corners.map(corner => {
                const rotated = rotatePoint(corner.trackPosition, circuit.rotation, center);
                const scaledX = customScale(rotated.x, min, max, margin.left, width - margin.right, "x");
                const scaledY = customScale(rotated.y, min, max, height - margin.top, margin.bottom, "y");
                return { x: scaledX, y: scaledY };
            });
        }

        let rotatedMarshalLights = [];
        if (circuit.marshalLights && circuit.marshalLights.length > 0) {
            rotatedMarshalLights = circuit.marshalLights.map(light => {
                const rotated = rotatePoint(light.trackPosition, circuit.rotation, center);
                const scaledX = customScale(rotated.x, min, max, margin.left, width - margin.right, "x");
                const scaledY = customScale(rotated.y, min, max, height - margin.top, margin.bottom, "y");
                return { x: scaledX, y: scaledY };
            });
        }

        let rotatedMarshalSectors = [];
        if (circuit.marshalSectors && circuit.marshalSectors.length > 0) {
            rotatedMarshalSectors = circuit.marshalSectors.map(sector => {
                const rotated = rotatePoint(sector.trackPosition, circuit.rotation, center);
                const scaledX = customScale(rotated.x, min, max, margin.left, width - margin.right, "x");
                const scaledY = customScale(rotated.y, min, max, height - margin.top, margin.bottom, "y");
                return { x: scaledX, y: scaledY };
            });
        }

        const line = d3.line()
            .x(d => d.x)
            .y(d => d.y);

        svg.append("path")
            .datum(rotatedScaledPoints)
            .attr("fill", "none")
            .attr("stroke", () => getComputedStyle(document.documentElement).getPropertyValue('--path-stroke'))
            .attr("stroke-width", () => getComputedStyle(document.documentElement).getPropertyValue('--path-stroke-width'))
            .attr("d", line);

        if (marshall_setting && circuit.marshalLights && circuit.marshalLights.length > 0) {
            svg.selectAll("circle.marshalLights")
                .data(rotatedMarshalLights)
                .enter().append("circle")
                .attr("class", "marshalLights")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", 4)
                .style("fill", () => getComputedStyle(document.documentElement).getPropertyValue('--marshalLights-fill'))
                .style("stroke", () => getComputedStyle(document.documentElement).getPropertyValue('--marshalLights-stroke'))
                .style("stroke-width", () => getComputedStyle(document.documentElement).getPropertyValue('--marshalLights-stroke-width'));
        }

        if (marshallLights_setting && circuit.marshalSectors && circuit.marshalSectors.length > 0) {
            svg.selectAll("circle.marshalSectors")
                .data(rotatedMarshalSectors)
                .enter().append("circle")
                .attr("class", "marshalSectors")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", 4)
                .style("fill", () => getComputedStyle(document.documentElement).getPropertyValue('--marshalSectors-fill'))
                .style("stroke", () => getComputedStyle(document.documentElement).getPropertyValue('--marshalSectors-stroke'))
                .style("stroke-width", () => getComputedStyle(document.documentElement).getPropertyValue('--marshalSectors-stroke-width'));
        }

        if (corners_setting && circuit.corners && circuit.corners.length > 0) {
            svg.selectAll("circle.corners")
                .data(rotatedScaledCorners)
                .enter().append("circle")
                .attr("class", "corners")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", 5)
                .style("fill", () => getComputedStyle(document.documentElement).getPropertyValue('--corner-fill'))
                .style("stroke", () => getComputedStyle(document.documentElement).getPropertyValue('--corner-stroke'))
                .style("stroke-width", () => getComputedStyle(document.documentElement).getPropertyValue('--corner-stroke-width'));

            svg.selectAll("text.corners")
                .data(rotatedScaledCorners)
                .enter().append("text")
                .attr("class", "corners-name")
                .attr("x", d => d.x)
                .attr("y", d => d.y)
                .text((d, i) => circuit.corners[i].number)
                .attr("font-size", () => getComputedStyle(document.documentElement).getPropertyValue('--corner-number-font-size'))
                .attr("fill", () => getComputedStyle(document.documentElement).getPropertyValue('--corner-number-fill'))
        }




        // Inizializza svgPanZoom sull'elemento SVG
        const circuitoPanZoom = svgPanZoom(svgElement, {
            zoomEnabled: true,
            controlIconsEnabled: false
        });

        console.log(circuitoPanZoom, svgElement);
        document.getElementById('zoom-in').addEventListener('click', function (ev) {
            ev.preventDefault()

            circuitoPanZoom.zoomIn()
        });

        document.getElementById('zoom-out').addEventListener('click', function (ev) {
            ev.preventDefault()

            circuitoPanZoom.zoomOut()
        });

        document.getElementById('reset').addEventListener('click', function (ev) {
            ev.preventDefault()

            circuitoPanZoom.resetZoom()
        });

    } else {
        // 149 Mugello 2020
        // 148 Sakir Outer 2020
        console.error("Impossibile creare il grafico del circuito: nessun dato disponibile.");

        const circuit = document.getElementById('circuit_error');
        const compass = document.getElementById('compass');
        const settings = document.getElementById('circuit_settings');

        circuit.innerHTML = "<p>Circuit map is not available</p>";
        compass.style.display = "none";
        settings.style.display = "none";
    }
}

function changeCircuitSettings() {
    // Get the current settings from the checkboxes
    let rotatedNorth = document.getElementById('rotatedNorth').checked;
    let showCorners = document.getElementById('checkCorners').checked;
    let showMarshall = document.getElementById('checkMarshall').checked;
    let showMarshallLights = document.getElementById('checkMarshallLights').checked;

    // Create an object with the settings
    let circuitSettings = {
        'rotatedNorth': rotatedNorth,
        'showCorners': showCorners,
        'showMarshall': showMarshall,
        'showMarshallLights': showMarshallLights
    };

    // Save the settings object to localStorage
    localStorage.setItem('circuitSettings', JSON.stringify(circuitSettings));
    var toast = new bootstrap.Toast(document.getElementById('toastSettings'));
    toast.show();
    createCircuitChart(session_path)
}

function loadCircuitSettings() {
    let circuit_settings = JSON.parse(localStorage.getItem('circuitSettings'));
    if (circuit_settings == null) {
        circuit_settings = {
            'rotatedNorth': false,
            'showCorners': true,
            'showMarshall': false,
            'showMarshallLights': false
        }
    }

    localStorage.setItem('circuitSettings', JSON.stringify(circuit_settings));

    let rotatedNorth = circuit_settings.rotatedNorth
    let corners = circuit_settings.showCorners
    let marshall = circuit_settings.showMarshall
    let marshallLights = circuit_settings.showMarshallLights

    if (rotatedNorth !== null) {
        document.getElementById('rotatedNorth').checked = rotatedNorth;
    }
    if (corners !== null) {
        document.getElementById('checkCorners').checked = corners;
    }
    if (marshall !== null) {
        document.getElementById('checkMarshall').checked = marshall;
    }
    if (marshallLights !== null) {
        document.getElementById('checkMarshallLights').checked = marshallLights;
    }
}

function showCollapse(id, btn_id, content) {
    const bsCollapse = new bootstrap.Collapse('#' + id);

    $('#' + id).on('shown.bs.collapse', function () {
        const btn = document.getElementById(btn_id);
        btn.innerHTML = "Hide " + content + `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-up" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/>
        </svg>`;
        if (id === "collapseCircuit") {
            createCircuitChart(session_path);
        }
    });

    $('#' + id).on('hidden.bs.collapse', function () {
        const btn = document.getElementById(btn_id);
        btn.innerHTML = "Show " + content + `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
        </svg>`;
    });


}

