const min_year = 2018

let year
let countries
let races = []
let Meetings_info = {
    current_value: 0,
    min_value: 0,
    max_value: 0,
}
window.onload = async function () {
    if (localStorage.getItem("selected_year")) {
        year = parseInt(localStorage.getItem("selected_year"))
    } else {
        year = new Date().getFullYear()
        localStorage.setItem("selected_year", year)
    }
    document.getElementById("display_selected_year").innerHTML = year

    if (localStorage.getItem("selected_meeting")) {
        Meetings_info.current_value = parseInt(localStorage.getItem("selected_meeting"))
    } else {
        localStorage.setItem("selected_meeting", Meetings_info.current_value)
    }

    try {
        const response = await fetch(`http://localhost:3000/api/countriesJSON`);
        if (!response.ok) {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
        countries = await response.json();
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }

    await getRaces();
}

// Controls

function changeYear(increment) {
    if (year + increment < min_year) {
        document.getElementById("decrease_year").classList.add('disabled')
    } else if (year + increment > new Date().getFullYear()) {
        document.getElementById("increase_year").classList.add('disabled')
    } else {
        document.getElementById("decrease_year").classList.remove('disabled')
        document.getElementById("increase_year").classList.remove('disabled')
        year += increment
        document.getElementById("display_selected_year").innerHTML = year
        localStorage.setItem("selected_year", year)
        Meetings_info.current_value = 0
        localStorage.setItem("selected_meeting", Meetings_info.current_value)
        getRaces()
    }
}

function changeMeeting(increment) {
    if (Meetings_info.current_value + increment < Meetings_info.min_value) {
        document.getElementById("decrease_meeting").classList.add('disabled')
    } else if (Meetings_info.current_value + increment > Meetings_info.max_value) {
        document.getElementById("increase_meeting").classList.add('disabled')
    } else {
        document.getElementById("decrease_meeting").classList.remove('disabled')
        document.getElementById("increase_meeting").classList.remove('disabled')

        Meetings_info.current_value += increment
        document.getElementById("display_meeting_name").innerHTML = races.Meetings[Meetings_info.current_value].Name

        localStorage.setItem("selected_meeting", Meetings_info.current_value)

        showRaces(races.Meetings[Meetings_info.current_value])
    }
}



async function getRaces() {
    try {
        const response = await fetch(`http://localhost:3000/api/races/${year}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        races = data;
        Meetings_info.max_value = races.Meetings.length - 1;
        changeMeeting(0);
    } catch (error) {
        console.error(error);
    }
}

function showRaces(event) {
    document.getElementById('eventContainer').innerHTML = ""
    const eventContainer = document.getElementById('eventContainer')

    // Creazione di un elemento di tipo div con le classi di Bootstrap
    const card = document.createElement('div')
    card.classList.add('card', 'my-3')

    // Creazione di un elemento di tipo div con la classe di Bootstrap per l'header della card
    const cardHeader = document.createElement('div')
    cardHeader.classList.add('card-header')

    // Creazione di un elemento h5 per il titolo dell'evento
    const title = document.createElement('h5')
    title.classList.add('card-title')
    title.textContent = event.OfficialName

    // Creazione di un elemento h6 per il sottotitolo dell'evento
    const subtitle = document.createElement('h6')
    subtitle.classList.add('card-subtitle', 'mb-2', 'text-muted')
    subtitle.textContent = event.Name + ' '


    // Aggiunta di titolo e sottotitolo all'header
    cardHeader.appendChild(title)
    cardHeader.appendChild(subtitle)

    // Aggiunta dell'header alla card
    card.appendChild(cardHeader)

    // Creazione di un elemento di tipo div per il corpo della card
    const cardBody = document.createElement('div')
    cardBody.classList.add('card-body')

    // Creazione di paragrafi per le informazioni dell'evento
    const eventInfo = document.createElement('p')
    eventInfo.classList.add('card-text')
    eventInfo.textContent = `${event.Location} - ${event.Country.Name} `

    // Flag 
    const flag = document.createElement('i')
    flag.classList.add('flag-icon', `flag-icon-${countries[event.Country.Name].toLowerCase()}`)
    eventInfo.appendChild(flag)

    cardBody.appendChild(eventInfo)

    // Aggiunta del corpo alla card
    card.appendChild(cardBody)

    // Creazione di un elemento di tipo ul con la classe di Bootstrap per la lista
    const sessionList = document.createElement('ul')
    sessionList.classList.add('list-group', 'list-group-flush')

    // Loop through the event sessions
    event.Sessions.forEach(session => {
        if (session.Key != -1) {
            // Create a li element with Bootstrap class for each session
            const sessionItem = document.createElement('li')
            sessionItem.classList.add('list-group-item')
            sessionItem.textContent = `${session.Name}\n${localTime(session.StartDate, session.GmtOffset)}`

            // Get the current time
            const currentTime = new Date();

            // Convert the session start time to a Date object
            const sessionStartTime = parseDate(localTime(session.StartDate, session.GmtOffset));
            // Check if the session start time is greater than the current time
            if (sessionStartTime > currentTime) {
                // Calcola la differenza di tempo tra l'ora corrente e l'ora di inizio della sessione
                const timeDiff = sessionStartTime - currentTime;
            
                // Calcola i giorni, le ore, i minuti e i secondi rimanenti
                const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
                // Crea un elemento per il countdown
                const countdown = document.createElement('p');
                countdown.classList.add('countdown');
                countdown.innerHTML = `Countdown: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
            
                // Aggiungi l'elemento del countdown alla sessionItem
                sessionItem.appendChild(countdown);
            
                // Aggiorna il countdown ogni secondo
                const countdownInterval = setInterval(updateCountdown, 1000);
            
                function updateCountdown() {
                    // Calcola nuovamente la differenza di tempo
                    const newTimeDiff = sessionStartTime - new Date();
            
                    // Se il countdown è terminato, ferma l'intervallo e rimuovi il countdown
                    if (newTimeDiff <= 0) {
                        clearInterval(countdownInterval);
                        sessionItem.removeChild(countdown);
                    } else {
                        // Altrimenti, aggiorna il testo del countdown con il nuovo tempo rimanente
                        const newDays = Math.floor(newTimeDiff / (1000 * 60 * 60 * 24));
                        const newHours = Math.floor((newTimeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const newMinutes = Math.floor((newTimeDiff % (1000 * 60 * 60)) / (1000 * 60));
                        const newSeconds = Math.floor((newTimeDiff % (1000 * 60)) / 1000);
                        countdown.innerHTML = `Countdown: ${newDays} days, ${newHours} hours, ${newMinutes} minutes, ${newSeconds} seconds`;
                    }
                }
            }
             else {
                // If the session start time is in the past, add a click event listener to the session item
                sessionItem.addEventListener('click', function () {
                    localStorage.setItem('session_path', session.Path)
                    window.location.href = 'session.html';
                });
            }

            // Add the session item to the list
            sessionList.appendChild(sessionItem)
        }
    });

    // Aggiunta della lista alla card
    card.appendChild(sessionList)

    // Aggiunta della card al contenitore
    eventContainer.appendChild(card)
}

function parseDate(dateString) {
    const parts = dateString.split(/[\s:-]+/);
    const [date, hours, minutes, seconds] = parts;
    const [day, month, year] = date.split('/');
    
    const cleanYear = parseInt(year.slice(0, -1));

    const paddedDay = day.padStart(2, '0');
    const paddedMonth = month.padStart(2, '0');
    
    return new Date(`${cleanYear}-${paddedMonth}-${paddedDay}T${hours}:${minutes}:${seconds}`);
}



// Format Time

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