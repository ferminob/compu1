//---ALMACENA IMAGENES DE CAPAS---
let petalosGrandes = [];
let petalosChicos = [];
let centros = [];

//---GUARDA OBJETO PETALO ---
let florActual = [];

//--- COLOR PARA INTERPOLACIÓN HSB---
let colorActual;
let colorObjetivo;
let coloresFondo = [];

//---MAQUINA DE ESTADOS---
let estado = 0;

//---ANIMACION---
let capasVisibles = 0;
let contadorVolar = 0;

//---DIMENSIONES---
let canvasW = 1562;
let canvasH = 1557;

// --- BUFFER INTERNO---
let escena;

//---MICROFONO---
let mic;
<<<<<<< HEAD
//---GESTOR---
=======

//---GESTORES AMPLITUD---
>>>>>>> 2ff0b77217ed3e62500e82c894c1532c4f0f344f
let gestorAmp;
//---AMPLITUD---
let amp; //variable para cargar la amplitud(volumen) de la señal de entrada del mic

//Toda señal siempre es ruidosa, hay que amortiguarla para poder controlarla y que vaya de manera mas suave
//---CONFIGURACION Y UMBRALES DE AUDIO---
let AMP_MIN = 0.02; //umbral MINIMO DE SONIDO QUE SUPERA AL RUIDO DE FONDO
let AMP_MAX = 0.60; // tope de volumen (intensidad de sonido)
let AMORTIGUACION = 0.50; //factor de amortiguacion de la señal

//---FLAGS DE CONTROL---
let haySonido = false;//volumen supera umbral de ruido?
let antesHabiaSonido = false; //memoria del estado haySonido un fotograma atras
let yaSoplo = false;//pasa a true con el primer soplido

let volumenAnterior = 0;

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


    colorActual = color(260, 40, 90);
    colorObjetivo = color(313, 40, 90);

    generarFlor();

    mic = new p5.AudioIn(); //objeto que se comunica con la entrada de microfono
    mic.start(); //se inicia el flujo de audio

    //---GESTOR---
    gestorAmp = new GestorSenial(AMP_MIN, AMP_MAX);//defino los umbrales de señal con los que va a trabajar

    gestorAmp.f = AMORTIGUACION; //el factor por el cual amortigua lo guarda

    //---MOTOR DE AUDIO---
    userStartAudio(); // resuelve bloqueos de microfonos en el navegador
}

function draw() {
    // CAPTURA VALOR CRUDO Y ACTUALIZAR GESTOR
    let volumenCrudo = mic.getLevel();
    gestorAmp.actualizar(volumenCrudo);

    amp = gestorAmp.filtrada; // señal limpia normalizada
<<<<<<< HEAD
=======
  
>>>>>>> 2ff0b77217ed3e62500e82c894c1532c4f0f344f

    // CALCULA LA DERIVADA DEL VOLUMEN CRUDO
    //que tan rapido cambia el volumen de un fotograma a otro
    let cambioAmplitud = volumenCrudo - volumenAnterior;
    volumenAnterior = volumenCrudo;



    // UMBRALES DE CONTROL INTERACTIVO 
    let umbralSilencio = 0.08;
    let umbralSoplido = 0.35;

    // CONDICION BOOLEANA Y EVENTO
    haySonido = amp > umbralSilencio;
    let empezoElSonido = haySonido && !antesHabiaSonido;


    // MÁQUINA DE ESTADOS POR AUDIO

    if (estado === 0) {
        if (empezoElSonido) {
            capasVisibles++;
            if (capasVisibles >= florActual.length - 1) {
                estado = 1;
            }
        }
    }

    else if (estado === 1) {
        if (haySonido) {
            capasVisibles = florActual.length;
            estado = 2;
        }
    }

    else if (estado === 2) {
        if (amp > umbralSoplido) {
            yaSoplo = true;
        }

        if (haySonido && abs(cambioAmplitud) > umbralSoplido) {
            contadorVolar += 5;
            if (contadorVolar > 60) {
                estado = 3;
                contadorVolar = 0;
                for (let i = 0; i < florActual.length; i++) {
                    florActual[i].iniciarVuelo(amp);
                }
            }
        }
        else if (amp > umbralSoplido) {
            contadorVolar += 1;
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

    let multiplicadorGiro = map(amp, umbralSilencio, umbralSoplido, 0.5, 2.5);

    for (let i = 0; i < capasVisibles; i++) {
        let p = florActual[i];
        p.actualizar(multiplicadorGiro, amp, haySonido, yaSoplo);
        p.dibujar(escena);
    }

    background(0);
    let escala = min(width / canvasW, height / canvasH);
    let finalW = canvasW * escala;
    let finalH = canvasH * escala;
    image(escena, width / 2, height / 2, finalW, finalH);

    // GUARDA LA MEMORIA DEL FOTOGRAMA ANTERIOR
    antesHabiaSonido = haySonido;
}

function cargarAssets() {
    let cantidadGrandes = 3;
    let cantidadChicos = 3;
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
        [320, 330],
        [265, 290],
        [186, 200]
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

    let cantidadGrandes = floor(random(3, 6));

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

    let cantidadChicos = floor(random(2, 5));

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
    return color(h, random(50, 70), random(85, 95), 250);
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

