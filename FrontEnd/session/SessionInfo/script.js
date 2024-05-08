let session_path = ""
let session
let countries

window.onload = loadCircuitSettings();

window.onresize = function () {
    location.reload();
};

async function fetchData() {
    session_path = localStorage.getItem("session_path")

    const sessionInfoResponse = await fetch(`http://localhost:3000/api/sessionInfo/${session_path}`);
    const sessionInfoData = await sessionInfoResponse.json();
    session = sessionInfoData


    createCircuitChart(session_path)

    const countryResponse = await fetch(`http://localhost:3000/api/countriesJSON`);
    countries = await countryResponse.json();

    document.getElementById("session_name_nav").innerHTML = `${session.Meeting.Name} - ${session.Name}`

    document.getElementById("session_name").innerHTML = session.Name;
    document.getElementById("session_type").innerHTML = session.Type;
    document.getElementById("location").innerHTML = session.Meeting.Location;
    document.getElementById("country").innerHTML = session.Meeting.Country.Name;
    document.getElementById("flag").innerHTML = `<i class="flag-icon flag-icon-${countries[session.Meeting.Country.Name].toLowerCase()}"></i>`;
    document.getElementById("start_date").innerHTML = localTime(session.StartDate, session.GmtOffset);
    document.getElementById("end_date").innerHTML = localTime(session.EndDate, session.GmtOffset);
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
            console.log(circuitInfoDataDB);
            return { "data": circuitInfoData, "year": year, "circuitKey": circuitKey };
        }
    } catch (error) {
        console.error("Errore durante il recupero delle informazioni sul circuito:", error);
        return null;
    }
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

        const circuitMax = {
            x: Math.max(...rotatedXPoints),
            y: Math.max(...rotatedYPoints)
        };


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

            const scaledX = customScale(rotated.x, circuitMin.x, circuitMax.x, margin.left, width - margin.right, "x");
            const scaledY = customScale(rotated.y, circuitMin.y, circuitMax.y, height - margin.top, margin.bottom, "y");

            return { x: scaledX, y: scaledY };
        });

        if (circuit.corners && circuit.corners.length > 0) {
            const rotatedScaledCorners = circuit.corners.map(corner => {
                const rotated = rotatePoint(corner.trackPosition, circuit.rotation, center);
                const scaledX = customScale(rotated.x, circuitMin.x, circuitMax.x, margin.left, width - margin.right, "x");
                const scaledY = customScale(rotated.y, circuitMin.y, circuitMax.y, height - margin.top, margin.bottom, "y");
                return { x: scaledX, y: scaledY };
            });
        }

        if (circuit.marshalLights && circuit.marshalLights.length > 0) {
            const rotatedMarshalLights = circuit.marshalLights.map(light => {
                const rotated = rotatePoint(light.trackPosition, circuit.rotation, center);
                const scaledX = customScale(rotated.x, circuitMin.x, circuitMax.x, margin.left, width - margin.right, "x");
                const scaledY = customScale(rotated.y, circuitMin.y, circuitMax.y, height - margin.top, margin.bottom, "y");
                return { x: scaledX, y: scaledY };
            });
        }

        if (circuit.marshalSectors && circuit.marshalSectors.length > 0) {
            const rotatedMarshalSectors = circuit.marshalSectors.map(sector => {
                const rotated = rotatePoint(sector.trackPosition, circuit.rotation, center);
                const scaledX = customScale(rotated.x, circuitMin.x, circuitMax.x, margin.left, width - margin.right, "x");
                const scaledY = customScale(rotated.y, circuitMin.y, circuitMax.y, height - margin.top, margin.bottom, "y");
                return { x: scaledX, y: scaledY };
            });
        }

        const line = d3.line()
            .x(d => d.x)
            .y(d => d.y);

        svg.append("path")
            .datum(rotatedScaledPoints) // Usa scaledRotatedPoints
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 5)
            .attr("d", line);

        if (marshall_setting && circuit.marshalLights && circuit.marshalLights.length > 0) {
            svg.selectAll("circle.marshalLights")
                .data(rotatedMarshalLights)
                .enter().append("circle")
                .attr("class", "marshalLights")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", 4)
                .style("fill", "blue")
                .style("stroke", "black")
                .style("stroke-width", 1);
        }

        if (marshallLights_setting && circuit.marshalSectors && circuit.marshalSectors.length > 0) {
            svg.selectAll("circle.marshalSectors")
                .data(rotatedMarshalSectors)
                .enter().append("circle")
                .attr("class", "marshalSectors")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", 4)
                .style("fill", "green")
                .style("stroke", "black")
                .style("stroke-width", 1);
        }

        if (corners_setting && circuit.corners && circuit.corners.length > 0) {
            svg.selectAll("circle.corners")
                .data(rotatedScaledCorners) // Usa scaledRotatedCorners
                .enter().append("circle")
                .attr("class", "corners")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", 5)
                .style("fill", "white")
                .style("stroke", "black")
                .style("stroke-width", 1);

            svg.selectAll("text.corners")
                .data(rotatedScaledCorners) // Usa scaledRotatedCorners
                .enter().append("text")
                .attr("class", "corners")
                .attr("class", "corners-name")
                .attr("x", d => d.x)
                .attr("y", d => d.y)
                .text((d, i) => circuit.corners[i].number)
                .attr("font-size", "20px")
                .attr("fill", "white")
        }

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