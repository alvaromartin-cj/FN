async function fetchItems() {
    try {
        showLoadingScreen();

        // Esperar 8 segundos (simulando carga)
        await new Promise(resolve => setTimeout(resolve, 8000));

        hideLoadingScreen();

        const response = await fetch('https://fortnite-api.com/v2/shop/br');
        const data = await response.json();
        console.log(data);

        if (data && data.data) {
            const featuredItems = data.data.featured;
            if (featuredItems && featuredItems.entries && Array.isArray(featuredItems.entries)) {
                displayItems(featuredItems.entries);
                startCountdown();
            } else {
                console.error("No se encontraron entradas en los ítems destacados.");
            }
        } else {
            console.error("No se encontraron elementos en la respuesta.");
        }
    } catch (error) {
        console.error("Error fetching items:", error);
    }
}

// Función para mostrar los ítems en pantalla
function displayItems(items) {
    const container = document.getElementById('item-container');
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    // Objeto para almacenar los packs y sus elementos
    const packs = {};

    // Agrupar los ítems por su pack
    items.forEach((itemData) => {
        const item = itemData.items ? itemData.items[0] : null;
        if (!item) return;

        // Obtener el ID del pack o el nombre del item
        const packId = item.packId || item.name;

        if (!packs[packId]) {
            packs[packId] = {
                items: [],
                image: item.images.featured || 'https://via.placeholder.com/150',
                name: item.name,
                description: item.description || 'Sin descripción disponible',
                regularPrice: itemData.regularPrice || 'N/A',
                finalPrice: itemData.finalPrice || 'N/A',
                ids: [] // Arreglo para almacenar las IDs
            };
        }

        // Agregar ID al pack
        packs[packId].ids.push(item.id); // Almacenar ID del ítem
        packs[packId].items.push(item);
    });

    // Ahora, mostrar cada pack
    Object.values(packs).forEach(pack => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';

        itemDiv.innerHTML = `
            <img src="${pack.image}" alt="${pack.name}">
            <h3><strong>${pack.name}</strong></h3>
            <p><em>${pack.description}</em></p>
            <p><strong>Precio regular:</strong> <em>${pack.regularPrice}</em> V-Bucks</p>
            <p><strong>Precio final:</strong> <em>${pack.finalPrice}</em> V-Bucks</p>
            <p><strong>Ítems incluidos:</strong></p>
            <ul>
                ${pack.items.map(item => `<li>${item.name}</li>`).join('')}
            </ul>
            <p><strong>IDs:</strong> <em>${pack.ids.join(', ')}</em></p> <!-- Mostrar las IDs -->
        `;

        // Agregar evento de clic para centrar y agrandar el ítem
        itemDiv.addEventListener('click', () => {
            document.querySelectorAll('.item').forEach(item => item.classList.remove('selected'));
            itemDiv.classList.add('selected'); // Añadir la clase selected
        });

        fragment.appendChild(itemDiv);
    });

    container.appendChild(fragment);
}




let hasReloaded = false; // Variable para evitar múltiples recargas
let showSuccess = false; // Variable para indicar si se debe mostrar el mensaje de éxito

function startCountdown() {
    const countdownElement = document.getElementById('countdown-timer');
    const messageElement = document.getElementById('countdown-message');

    function updateCountdown() {
        const now = new Date();
        // Cambiamos la hora objetivo
        const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 2, 0, 0);

        // Si ya hemos pasado la hora objetivo, agregar un día para la próxima cuenta regresiva
        if (now >= targetTime) {
            targetTime.setDate(targetTime.getDate() + 1);
        }

        const timeDiff = targetTime - now;

        // Si el tiempo es menor o igual a 1000 ms (1 segundo)
        if (timeDiff <= 1000 && !hasReloaded) {
            hasReloaded = true; // Marcar como recargado
            localStorage.setItem('lastReload', Date.now()); // Guardar el tiempo de recarga en localStorage
            location.reload(); // Recargar la página
        } else {
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            // Actualizamos el contenido del contador
            countdownElement.innerHTML = `La tienda cambia en: ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

            // Si quedan 10 segundos o menos, empezar el parpadeo
            if (timeDiff <= 10000) {
                countdownElement.classList.add('countdown-blink');
            } else {
                countdownElement.classList.remove('countdown-blink'); // Asegurarse de que no parpadee si hay más de 10 segundos
            }
        }
    }

    // Iniciar el contador
    updateCountdown();
    setInterval(updateCountdown, 1000); // Actualizamos el contador cada segundo
}




// Función para mostrar el mensaje de éxito por 35 segundos después de la recarga
function showSuccessMessage() {
    const messageElement = document.getElementById('countdown-message');
    const countdownElement = document.getElementById('countdown-timer');
    
    // Mostrar el mensaje y ocultar el contador
    messageElement.style.display = 'block';
    countdownElement.style.display = 'none';

    // Configurar el estilo del mensaje
    messageElement.textContent = "LA TIENDA FUE REINICIADA CON ÉXITO";
    messageElement.style.color = "#00ff00";
    messageElement.style.fontWeight = "bold";
    messageElement.style.fontSize = "24px";

    // Aplicar la animación personalizada que solo afecta la opacidad
    messageElement.classList.add('success-message-blink');

    // Ocultar el mensaje después de 35 segundos y mostrar el contador
    setTimeout(() => {
        messageElement.style.display = 'none';
        countdownElement.style.display = 'block';
        startCountdown(); // Reiniciar el contador
    }, 25000);
}


// Verificar si la página ha sido recargada recientemente
function checkIfPageWasReloaded() {
    const lastReload = localStorage.getItem('lastReload');
    if (lastReload) {
        const reloadTime = parseInt(lastReload, 10);
        const now = Date.now();
        // Si la página fue recargada en los últimos 10 segundos
        if (now - reloadTime < 10000) {
            showSuccess = true;
        }
    }

    if (showSuccess) {
        showSuccessMessage(); // Mostrar el mensaje después de la recarga
    } else {
        startCountdown(); // Si no se ha recargado, iniciar el contador
    }
}

// Iniciar cuando se carga la página
window.onload = async function() {
    showLoadingScreen();
    await fetchItems(); // Simular la carga de los ítems
    setTimeout(hideLoadingScreen, 3000); // Simular el tiempo de carga de 3 segundos
    checkIfPageWasReloaded(); // Verificar si se debe mostrar el mensaje de éxito o iniciar el contador
};




function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const content = document.getElementById('content');
    loadingScreen.style.display = 'flex';
    content.style.opacity = '0';
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const content = document.getElementById('content');
    loadingScreen.style.display = 'none';
    content.style.opacity = '1';
}

// Función para mostrar los ítems en pantalla
function displayItems(items) {
    const container = document.getElementById('item-container');
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    items.forEach((itemData) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';

        const item = itemData.items ? itemData.items[0] : null;
        const image = item ? item.images.featured : 'https://via.placeholder.com/150';
        const itemName = item ? item.name : 'Sin nombre';
        const itemDescription = item ? item.description : 'Sin descripción disponible';
        const regularPrice = itemData.regularPrice || 'N/A';
        const finalPrice = itemData.finalPrice || 'N/A';

        itemDiv.innerHTML = `
        <img src="${image}" alt="${itemName}">
        <h3><strong>${itemName}</strong></h3> <!-- Nombre en negrita -->
        <p><em>${itemDescription}</em></p> <!-- Descripción en cursiva -->
        <p><strong>Precio regular:</strong> <em>${regularPrice}</em> V-Bucks</p> <!-- Precio regular en negrita, valor en cursiva -->
        <p><strong>Precio final:</strong> <em>${finalPrice}</em> V-Bucks</p> <!-- Precio final en negrita, valor en cursiva -->
    `;
        fragment.appendChild(itemDiv);
    });

    container.appendChild(fragment);
}

// Función para filtrar los ítems según el tipo seleccionado
function filterItems(type) {
    fetch('https://fortnite-api.com/v2/shop/br')
        .then(response => response.json())
        .then(data => {
            if (data && data.data) {
                const allItems = data.data.featured.entries;
                let filteredItems;

                if (type === 'todos') {
                    filteredItems = allItems;
                } else {
                    filteredItems = allItems.filter(itemData => {
                        const item = itemData.items ? itemData.items[0] : null;
                        if (!item) return false;

                        // Aquí estamos haciendo la lógica de filtrado por tipo (puedes ajustar esta lógica si es necesario)
                        if (type === 'skin' && item.type.value === 'outfit') return true;
                        if (type === 'pico' && item.type.value === 'pickaxe') return true;
                        if (type === 'mochila' && item.type.value === 'backpack') return true;
                        return false;
                    });
                }

                displayItems(filteredItems); // Mostrar los ítems filtrados
            } else {
                console.error("No se encontraron elementos en la respuesta.");
            }
        })
        .catch(error => {
            console.error("Error fetching items:", error);
        });
}

// Asignar controladores de eventos a los botones de filtro
document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', (event) => {
        const type = event.target.getAttribute('data-type');
        filterItems(type); // Llamamos a la función para filtrar según el tipo
    });
});

// Llamar a fetchItems cuando la página esté lista
document.addEventListener('DOMContentLoaded', fetchItems);

// Funcionalidad del botón "Ir arriba"
const scrollToTopButton = document.getElementById('scroll-to-top');

// Mostrar/ocultar el botón según el desplazamiento
window.onscroll = function () {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        scrollToTopButton.style.display = "block"; // Mostrar botón
    } else {
        scrollToTopButton.style.display = "none"; // Ocultar botón
    }
};

// Al hacer clic en el botón, desplazarse hacia arriba
scrollToTopButton.addEventListener('click', function () {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Desplazamiento suave
    });
});

// Función para generar un color aleatorio en formato hexadecimal
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Función para generar una posición aleatoria dentro de un rango
function getRandomPosition() {
    const maxX = window.innerWidth - 200; // Ajuste para evitar que se salga del contenedor
    const maxY = window.innerHeight - 100; // Ajuste para evitar que se salga del contenedor
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);
    return { x: randomX, y: randomY };
}

// Función para aplicar cambios de color y movimiento aleatorio al texto de carga
// Función para generar una posición aleatoria dentro de un rango debajo del logo
function getRandomPosition() {
    const logoElement = document.getElementById('loading-logo');
    const logoRect = logoElement.getBoundingClientRect(); // Obtener la posición del logo
    const maxX = logoRect.width - 100; // Limitar el movimiento horizontal basado en el tamaño del logo
    const maxY = 50; // Limitar el movimiento vertical a una pequeña área debajo del logo
    const randomX = Math.floor(Math.random() * maxX) - maxX / 2; // Centrarlo y moverlo ligeramente
    const randomY = Math.floor(Math.random() * maxY);
    return { x: randomX, y: randomY };
}

// Función para aplicar cambios de color y movimiento aleatorio al texto de carga
// Función para generar una posición aleatoria dentro de un rango debajo del logo
function getRandomPosition() {
    const logoElement = document.getElementById('loading-logo');
    const logoRect = logoElement.getBoundingClientRect(); // Obtener la posición del logo
    const maxX = 50; // Limitar el movimiento horizontal a una pequeña área
    const maxY = 20; // Limitar el movimiento vertical a una pequeña área debajo del logo
    const randomX = Math.floor(Math.random() * maxX) - maxX / 2; // Centrar y mover un poco horizontalmente
    const randomY = Math.floor(Math.random() * maxY); // Mover hacia abajo un poco
    return { x: randomX, y: randomY };
}

// Función para aplicar cambios de color y movimiento aleatorio al texto de carga
function randomizeLoadingText() {
    const loadingText = document.getElementById('loading-text');
    
    // Cambiar el color del texto a uno aleatorio
    const randomColor = getRandomColor();
    loadingText.style.color = randomColor;
    
    // Mover el texto a una posición aleatoria dentro del área controlada
    const randomPosition = getRandomPosition();
    loadingText.style.transform = `translate(${randomPosition.x}px, ${randomPosition.y}px)`;
}

// Mostrar la pantalla de carga y mover el texto periódicamente
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const content = document.getElementById('content');
    loadingScreen.style.display = 'flex';
    content.style.opacity = '0';

    // Aplicar color y posición aleatoria al texto de carga
    randomizeLoadingText();

    // Actualizar el movimiento del texto cada segundo
    setInterval(randomizeLoadingText, 1000); // Mover el texto cada segundo
}

let progress = 0; // Variable para llevar la cuenta del progreso

// Función para simular el progreso de la barra de carga
function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    
    if (progress < 100) {
        progress += 1.3; // Incrementar el progreso
        progressBar.style.width = progress + '%'; // Actualizar el ancho de la barra
    } else {
        clearInterval(progressInterval); // Detener el incremento cuando llega al 100%
    }
}

// Intervalo para actualizar la barra cada 100 ms (simulación de carga)
const progressInterval = setInterval(updateProgressBar, 80); // Incrementa cada 80ms
