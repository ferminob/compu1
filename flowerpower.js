//---ALMACENA IMAGENES DE CAPAS---
let petalosGrandes = [];
let petalosChicos = [];
let centros = [];

//---GUARDA OBJETO PETALO ---
let florActual = [];

//--- COLOR PARA INTERPOLACIÓN HSB---
let colorActual;
let colorObjetivo;

//---MAQUINA DE ESTADOS---
let estado = 0;

//---ANIMACION---
let capasVisibles = 0;
let contadorVolar = 0;

//---DIMENSIONES---
let canvasW = 702;
let canvasH = 701;

// --- BUFFER INTERNO---
let escena;

//---MICROFONO---
let mic;

//---GESTORES AMPLITUD---
let gestorAmp;
//---AMPLITUD---
let amp;

//---CONFIGURACION Y UMBRALES DE AUDIO---
let AMP_MIN = 0.02; 
let AMP_MAX = 0.60; 
let AMORTIGUACION = 0.50; 

let haySonido = false;
let antesHabiaSonido = false; 
let yaSoplo = false;
let ampAnterior = 0;

function preload() {
    cargarAssets();
}

function setup() {
    pixelDensity(1);

    createCanvas(windowWidth, windowHeight);

    escena = createGraphics(
        canvasW,
        canvasH
    );
    escena.imageMode(CENTER);

    escena.colorMode(
        HSB,
        360,
        100,
        100,
        255
    );

    imageMode(CENTER);

    colorMode(
        HSB,
        360,
        100,
        100,
        255
    );

    let todosLosAssets = [...petalosGrandes, ...petalosChicos, ...centros];
    for (let img of todosLosAssets) {
        img.loadPixels();
        for (let i = 0; i < img.pixels.length; i += 5) {
            let r = img.pixels[i];
            let g = img.pixels[i + 1];
            let b = img.pixels[i + 2];

            let brillo = (r + g + b) / 3;

            if (brillo > 120) {
                img.pixels[i] = 255;
                img.pixels[i + 1] = 255;
                img.pixels[i + 2] = 255;
            }
        }
        img.updatePixels();
    }

    colorActual = color(204, 84, 90);
    colorObjetivo = color(313, 64, 90);

    generarFlor();

    mic = new p5.AudioIn(); //objeto que se comunica con la entrada de microfono
    mic.start(); //se inicia el flujo de audio

    //---GESTOR---
    gestorAmp = new GestorSenial(AMP_MIN, AMP_MAX);

    gestorAmp.f = AMORTIGUACION; 

    //---MOTOR DE AUDIO---
    userStartAudio(); // resuelve bloqueos de microfonos en el navegador
}

function draw() {

    // ---CAPTURA DE SEÑAL---
    let volumenCrudo = mic.getLevel();
    gestorAmp.actualizar(volumenCrudo);

    amp = gestorAmp.filtrada;


    // UMBRALES DE CONTROL  
    let umbralMinSoplido = 0.20;
    let umbralMaxSoplido = 0.30;

    haySonido = amp > AMP_MIN;
    let empezoElSonido = haySonido && !antesHabiaSonido;
    let terminoElSonido = !haySonido && antesHabiaSonido;


    if (estado === 0) {
        if (empezoElSonido) {
            capasVisibles++;
            if (capasVisibles >= florActual.length - 1) {
                estado = 1;
            }
        }
    }

    else if (estado === 1) {
        if (terminoElSonido) {
            capasVisibles = florActual.length;
            estado = 2;
        }
    }
    else if (estado === 2) {
        if (haySonido && amp > umbralMinSoplido) {
            yaSoplo = true;
        }


        if (haySonido && amp > umbralMaxSoplido) {
            contadorVolar += 5;
            if (contadorVolar > 60) {
                estado = 3;
                contadorVolar = 0;
                for (let i = 0; i < florActual.length; i++) {
                    florActual[i].iniciarVuelo(amp);
                }
            }
        }
        else {
            if (contadorVolar > 0) {
                contadorVolar--;
            }
        }
    }

    else if (estado === 3) {
        contadorVolar++;
        if (contadorVolar > 80) {
            generarFlor();
        }
    }

    colorActual = lerpColor(colorActual, colorObjetivo, 0.03);
    escena.background(colorActual);



    for (let i = 0; i < capasVisibles; i++) {
        let p = florActual[i];
        p.actualizar(amp, haySonido, yaSoplo);
        p.dibujar(escena);
    }

    background(255);
    let escala = min(width / canvasW, height / canvasH);
    let finalW = canvasW * escala;
    let finalH = canvasH * escala;
    image(escena, width / 2, height / 2, finalW, finalH);

    // GUARDA LA MEMORIA DEL FOTOGRAMA ANTERIOR
    antesHabiaSonido = haySonido;
}

function cargarAssets() {
    let cantidadGrandes = 13;
    let cantidadChicos = 5;
    let cantidadCentros = 3;

    // GRANDES
    for (let i = 0; i < cantidadGrandes; i++) {
        let ruta = `petalos_grandes/${i}.png`;
        petalosGrandes.push(loadImage(ruta));
    }

    // CHICOS
    for (let i = 0; i < cantidadChicos; i++) {
        let ruta = `petalos_chicos/${i}.png`;
        petalosChicos.push(loadImage(ruta));
    }

    // CENTROS
    for (let i = 0; i < cantidadCentros; i++) {
        let ruta = `centros/${i}.png`;
        centros.push(loadImage(ruta));
    }
}

function generarFlor() {
    florActual = [];
    estado = 0;
    capasVisibles = 0;
    contadorVolar = 0;
    yaSoplo = false;

    let paletas = [
        [300, 360],
        [160, 240],
        [20, 80]
    ];



    let rango = random(paletas);

    let hueBase = random(
        rango[0],
        rango[1]
    );


    colorObjetivo = color(
        hueBase,
        50,
        100
    );

    let cantidadGrandes = 4;

    for (let i = 0; i < cantidadGrandes; i++) {
        florActual.push(
            new Petalo(
                florActual.length,
                random(petalosGrandes),
                generarColor(hueBase),
                "grande"
            )
        );
    }

    let cantidadChicos = 4;

    for (let i = 0; i < cantidadChicos; i++) {
        florActual.push(
            new Petalo(
                florActual.length,
                random(petalosChicos),
                generarColor(hueBase),
                "chico"
            )
        );
    }

    florActual.push(
        new Petalo(
            florActual.length,
            random(centros),
            generarColor(hueBase),
            "centro"
        )
    );
}

function generarColor(baseHue) {
    let h = (baseHue + random(-30, 30) + 360) % 360;
    return color(h, random(50, 80), random(60, 120));
}

function keyPressed() {
    // RESET
    if (key === 'r' || key === 'R') {
        generarFlor();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

