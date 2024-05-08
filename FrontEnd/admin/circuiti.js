let edit = false; // Variabile per determinare se si sta modificando un circuito
let edit_circuitID = null; // Variabile per memorizzare l'ID del circuito in fase di modifica

var map = null;

const isAuthenticated = () => {
    const accessToken = localStorage.getItem('accessToken'); // Leggi il token di accesso dal localStorage
    return accessToken !== null; // Restituisce true se il token è presente, altrimenti false
};

// Reindirizza l'utente al login se non è autenticato
if (!isAuthenticated()) {
    window.location.href = '../admin.html';
}

// on modal show
function loadMap() {
    const mapContainer = document.getElementById('mapContainer');
    console.log(mapContainer);
    mapContainer.innerHTML = ''; // Cancella il contenuto del contenitore della mappa
    mapContainer.innerHTML = '<div id="map"></div>'; // Aggiungi nuovamente il contenuto del contenitore della map


    const circuitForm = document.getElementById('circuitForm');
    const latitude = circuitForm.querySelector('[name="lat"]');
    const longitude = circuitForm.querySelector('[name="lng"]');

    if (latitude.value && longitude.value) {

        var map = L.map('map').setView([latitude.value, longitude.value], 12); // Imposta la vista iniziale della mappa
    } else {
        var map = L.map('map').setView([0, 0], 2); // Imposta la vista iniziale della mappa

    }


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Aggiungi un gestore di eventi per ottenere le coordinate quando l'utente clicca sulla mappa
    map.on('click', function (e) {
        document.getElementById('lat').value = e.latlng.lat;
        document.getElementById('lng').value = e.latlng.lng;

        addMarker(e.latlng.lat, e.latlng.lng);
    });

    var markersLayer = new L.LayerGroup().addTo(map);

    // Funzione per aggiungere un marker alla mappa
    function addMarker(lat, lng) {
        markersLayer.clearLayers(); // Rimuovi tutti i marker esistenti
        var marker = L.marker([lat, lng]).addTo(markersLayer); // Aggiungi un nuovo marker
    }

    // Funzione per cercare e centrare la mappa sull'indirizzo specificato
    document.getElementById('searchLocationButton').addEventListener('click', function () {
        var address = document.getElementById('searchLocation').value;
        console.log(address);
        if (address.trim() !== '') {
            searchAddress(address);
        }
    });

    function searchAddress(address) {
        fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + address)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    var result = data[0];
                    var lat = parseFloat(result.lat);
                    var lon = parseFloat(result.lon);
                    map.setView([lat, lon], 13); // Imposta la vista sulla posizione trovata
                    addMarker(lat, lon); // Aggiungi un marker alla posizione trovata
                } else {
                    alert("Indirizzo non trovato");
                }
            })
            .catch(error => {
                console.error('Errore durante la ricerca dell\'indirizzo:', error);
                alert("Si è verificato un errore durante la ricerca dell'indirizzo");
            });
    }



    if (latitude.value && longitude.value) {
        addMarker(parseFloat(latitude.value), parseFloat(longitude.value));
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Aggiungi un evento al form per gestire l'invio dei dati
    document.getElementById('circuitForm').addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita il comportamento predefinito del form

        const modal = bootstrap.Modal.getInstance(document.getElementById('circuitModal'));
        modal.hide();

        const formData = new FormData(event.target); // Ottieni i dati del form
        const formObject = Object.fromEntries(formData.entries()); // Converti i dati in un oggetto JavaScript

        // Costruisci l'oggetto JSON per il campo 'turn' nel formato corretto
        const turns = parseInt(formObject.turns);
        const leftTurns = parseInt(formObject.leftTurns);
        const rightTurns = parseInt(formObject.rightTurns);
        const turnsObject = { turns, left_turns: leftTurns, right_turns: rightTurns };
        const checkbox = document.getElementById('clockwise');
        const clockwise = checkbox.checked;
        const circuitKey = formObject.circuitKey ? formObject.circuitKey : null; // Imposta il campo 'circuitKey' a null se è vuoto

        // Rimuovi i campi 'turns', 'leftTurns' e 'rightTurns' dall'oggetto principale
        delete formObject.turns;
        delete formObject.leftTurns;
        delete formObject.rightTurns;
        delete formObject.clockwise;
        delete formObject.circuitKey;


        formObject.turn = JSON.stringify(turnsObject); // Converte l'oggetto in una stringa JSON
        formObject.clockwise = clockwise; // Aggiunge il campo 'clockwise' all'oggetto principale
        formObject.circuitKey = circuitKey; // Aggiunge il campo 'circuitKey' all'oggetto principale
        formObject.lat = parseFloat(document.getElementById('lat').value);
        formObject.lng = parseFloat(document.getElementById('lng').value);

        console.log('Dati del form:', formObject);

        // Determina se è una nuova aggiunta o una modifica
        const url = edit ? `http://localhost:3000/admin/api/circuits/${edit_circuitID}` : 'http://localhost:3000/admin/api/circuits';

        // Determina il metodo HTTP corretto in base alla presenza dell'ID del circuito
        const method = edit ? 'PUT' : 'POST';

        console.log('URL:', url);
        console.log('Metodo:', method);


        edit = false; // Resetta la variabile di modifica dopo l'invio del form
        edit_circuitID = null; // Resetta l'ID del circuito in fase di modifica


        // Invia i dati al server per l'aggiunta o la modifica del circuito
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    circuitRef: formObject.circuitRef,
                    name: formObject.name,
                    location: formObject.location,
                    country: formObject.country,
                    lat: formObject.lat,
                    lng: formObject.lng,
                    alt: formObject.alt,
                    url: formObject.url,
                    clockwise: formObject.clockwise,
                    length: formObject.length,
                    turn: formObject.turn,
                    circuitKey: formObject.circuitKey
                })
            });

            if (response.ok) {
                console.log('Circuito aggiunto/modificato con successo');
                loadCircuits(); // Ricarica la pagina per visualizzare i cambiamenti

            } else {
                console.error('Errore durante l\'aggiunta/modifica del circuito:', response.statusText);

            }
        } catch (error) {
            console.error('Errore durante la richiesta di aggiunta/modifica del circuito:', error);

        }
    });

    const searchInput = document.getElementById('searchInput');
    const circuitTableBody = document.querySelector('#circuitTable tbody');

    // Aggiungi un listener per l'evento di input sul campo di ricerca
    searchInput.addEventListener('input', function () {
        const searchQuery = searchInput.value.trim().toLowerCase();

        // Cicla attraverso tutte le righe della tabella
        circuitTableBody.querySelectorAll('tr').forEach(row => {
            let matchFound = false;

            // Cicla attraverso tutti i campi della riga
            row.querySelectorAll('td').forEach(cell => {
                const cellContent = cell.textContent.toLowerCase();

                // Controlla se il contenuto del campo corrisponde alla query di ricerca
                if (cellContent.includes(searchQuery)) {
                    matchFound = true;
                }
            });

            // Mostra o nascondi la riga in base alla presenza di corrispondenze
            if (matchFound) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    searchInput.addEventListener('click', function (event) {
        searchInput.value = '';
    });


    // Carica i dati dei circuiti al caricamento della pagina
    loadCircuits();
});


// Funzione per caricare i dati dei circuiti esistenti e visualizzarli nella tabella
async function loadCircuits() {
    const circuitTableBody = document.querySelector('#circuitTable tbody');

    try {
        const response = await fetch('http://localhost:3000/admin/api/circuits');
        const circuits = await response.json();

        circuitTableBody.innerHTML = ''; // Cancella eventuali dati precedenti nella tabella

        circuits.forEach(circuit => {
            let turns = JSON.parse(circuit.turn);
            if (turns == null) {
                turns = {
                    turns: null,
                    left_turns: null,
                    right_turns: null
                }
            }
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <button onclick="editCircuit(${circuit.circuitId})" class="btn btn-sm btn-light"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                  </svg></button>
                    <button style="margin-top: 10px !important" onclick="deleteCircuit(${circuit.circuitId})" class="btn btn-sm btn-light"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                  </svg></button>
                </td>
                <td>${circuit.circuitId}</td>
                <td>${circuit.circuitRef}</td>
                <td>${circuit.name}</td>
                <td>${circuit.location}</td>
                <td>${circuit.country}</td>
                <td>${circuit.lat}</td>
                <td>${circuit.lng}</td>
                <td>${circuit.alt}</td>
                <td>${circuit.clockwise ? 'Sì' : 'No'}</td>
                <td>${circuit.length}</td>
                <td>${turns.turns}</td>
                <td>${turns.left_turns}</td>
                <td>${turns.right_turns}</td>
                <td>${circuit.circuitKey}</td>
                <td style="max-width: 200px;">
                    <div class="overflow-x-auto" style="overflow-x: auto;">
                        <a href="${circuit.url}" target="_blank">${circuit.url}</a>
                    </div>
                </td>
            `;
            circuitTableBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Errore durante il recupero dei circuiti:', error);
    }
}


// Funzione per avviare la modifica di un circuito
async function editCircuit(circuitId) {
    try {
        const response = await fetch(`http://localhost:3000/admin/api/circuits/${circuitId}`);
        const circuit = await response.json();

        // Popola il form con i dati del circuito da modificare
        const circuitForm = document.getElementById('circuitForm');
        for (const key in circuit) {
            if (Object.hasOwnProperty.call(circuit, key)) {
                const element = circuitForm.querySelector(`[name="${key}"]`);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = circuit[key];
                    } else if (key === 'turn') {

                    } else {
                        element.value = circuit[key];
                    }
                }
            }
        }
        const turns = JSON.parse(circuit['turn']);
        if (turns) {
            circuitForm.querySelector('[name="turns"]').value = turns.turns;
            circuitForm.querySelector('[name="leftTurns"]').value = turns.left_turns;
            circuitForm.querySelector('[name="rightTurns"]').value = turns.right_turns;
        }
        const modal = new bootstrap.Modal(document.getElementById('circuitModal'));
        modal.show();
        loadMap();

        edit = true; // Imposta la variabile di modifica su true
        edit_circuitID = circuitId; // Memorizza l'ID del circuito in fase di modifica
        console.log('Circuito in fase di modifica:', circuit, 'ID:', circuitId, 'Edit:', edit, 'Edit ID:', edit_circuitID);
    } catch (error) {
        console.error('Errore durante il recupero del circuito per la modifica:', error);
    }
}

// Funzione per eliminare un circuito
async function deleteCircuit(circuitId) {
    if (confirm('Do you want to delete this circuit?')) {
        try {
            const response = await fetch(`http://localhost:3000/admin/api/circuits/${circuitId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadCircuits(); // Ricarica i dati dei circuiti dopo l'eliminazione
            } else {
                console.error('Errore durante l\'eliminazione del circuito:', response.statusText);
            }
        } catch (error) {
            console.error('Errore durante la richiesta di eliminazione del circuito:', error);
        }
    }
}

function clearModal() {
    const circuitForm = document.getElementById('circuitForm');
    circuitForm.reset();
    edit = false;
    edit_circuitID = null;
}