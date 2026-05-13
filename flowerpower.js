let petalos = [];
let totalCapas = 6;
let estado = 0;
let capasVisibles = 0;
let contadorVolar = 0;

function preload() {
    for (let i = 0; i < totalCapas; i++) {
        let img = loadImage('png/capa' + i + '.png');
        petalos.push(new Petalo(i, img));
    }
}

function setup() {
    createCanvas(1562, 1557);

    for (let p of petalos) {
        p.crearBuffer();
    }
}

function draw() {
    background(21, 145, 106);

    let multiplicador = keyIsDown(71) ? 2 : 1;

    for (let i = 0; i < petalos.length; i++) {
        petalos[i].actualizar(multiplicador);
        petalos[i].dibujar(i);
    }

    if (estado === 3) {
        contadorVolar++;
        if (contadorVolar > 120) reiniciarObra();
    }
}

function reiniciarObra() {
    estado = 0;
    capasVisibles = 0;
    contadorVolar = 0;
    for (let p of petalos) p.reset();
}

function keyPressed() {
    if (key === 'r' || key === 'R') reiniciarObra();
    if (key === ' ' && estado === 0) {
        capasVisibles++;
        if (capasVisibles >= totalCapas) estado = 1;
    }
    if (key === 'g' || key === 'G') {
        estado = 2;
    }
    if (key === 'v' || key === 'V') {

        estado = 3;
    }
}