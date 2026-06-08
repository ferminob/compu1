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
let canvasW = 1562;
let canvasH = 1557;

// --- BUFFER INTERNO---
let escena;

//---CONFIGURACION Y UMBRALES DE AUDIO---
let AMP_MIN = 0.08; //umbral MINIMO DE SONIDO QUE SUPERA AL RUIDO DE FONDO
let AMP_MAX = 0.18;
let AMP_VOLAR = 0.80;

let AMORTIGUACION = 0.50; //factor de amortiguacion de la señal

//---MICROFONO---
let mic;

//---AMPLITUD---
let amp; //variable para cargar la amplitud(volumen) de la señal de entrada del mic

//---FLAGS DE CONTROL---
let haySonido = false;//volumen supera umbral de ruido?
let antesHabiaSonido = false; //memoria del estado haySonido un fotograma atras
let yaSoplo = false;//pasa a true con el primer soplido

//---GESTOR---
let gestorAmp;
let volumenAnterior = 0;

function preload() {
    cargarAssets();
}

function setup() {
    pixelDensity(1);

    createCanvas(windowWidth, windowHeight);

    escena = createGraphics(//instancia buffer interno
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

    colorActual = color(180, 40, 20);
    colorObjetivo = color(180, 40, 20);

    generarFlor();

    mic = new p5.AudioIn(); //objeto que se comunica con la entrada de microfono
    mic.start(); //se inicia el flujo de audio

    //---GESTOR---
    gestorAmp = new GestorSenial(0.02, 0.60);//defino los umbrales de señal con los que va a trabajar

    gestorAmp.f = AMORTIGUACION; //el factor por el cual amortigua lo guarda

    //---MOTOR DE AUDIO---
    userStartAudio(); // resuelve bloqueos de microfonos en el navegador
}

function draw() {
    // CAPTURAR VALOR CRUDO Y ACTUALIZAR GESTOR
    let volumenCrudo = mic.getLevel(); 
    gestorAmp.actualizar(volumenCrudo);
    
    amp = gestorAmp.filtrada; // señal limpia normalizada
    
    // CALCULAMOS LA DERIVADA DEL VOLUMEN CRUDO
    let cambioAmplitud = volumenCrudo - volumenAnterior;
    volumenAnterior = volumenCrudo; 

    
    // UMBRALES DE CONTROL INTERACTIVO 
    
    let umbralSilencio = 0.08; 
    let umbralSoplido  = 0.35; 

    // CONDICIÓN BOOLEANA Y EVENTO
    haySonido = amp > umbralSilencio;
    let empezoElSonido = haySonido && !antesHabiaSonido;

    
    // MÁQUINA DE ESTADOS POR AUDIO

    // ESTADO 0 - aparecen las capas una a una 
    if (estado === 0) {
        if (empezoElSonido) {
            capasVisibles++;
            if (capasVisibles >= florActual.length - 1) {
                estado = 1;
            }
        }
    }
    // ESTADO 1 - espera del centro: ante presencia de sonido dibuja el polen y avanza
    else if (estado === 1) {
        if (haySonido) {
            capasVisibles = florActual.length; 
            estado = 2;                        
        }
    }
    // ESTADO 2 
    else if (estado === 2) {
        
        //  1: empezar a girar si se sopla una vez
        if (amp > umbralSoplido) {
            yaSoplo = true;
        }

        //  3: SALIR VOLANDO CUANDO SE SILBE
        // El silbido fino genera saltos bruscos en el hardware crudo, activando la derivada.
        if (haySonido && abs(cambioAmplitud) > 0.08) { 
            contadorVolar += 10; // Carga rápida
            if (contadorVolar > 40) { 
                estado = 3;
                contadorVolar = 0;
                for (let i = 0; i < florActual.length; i++) {
                    florActual[i].iniciarVuelo(amp);
                }
            }
        }
        //  2: girar y vibrar si se sopla despacio y constante
        // Al no tener la oscilación del silbido, entra acá y acumula de a uno (vuelo lento)
        else if (amp > umbralSoplido) {
            contadorVolar += 1; 
            if (contadorVolar > 180) { 
                estado = 3;
                contadorVolar = 0;
                for (let i = 0; i < florActual.length; i++) {
                    florActual[i].iniciarVuelo(amp);
                }
            }
        }
        // Si hay silencio, el acumulador decrementa
        else {
            if (contadorVolar > 0) {
                contadorVolar--;
            }
        }
    }
    // ESTADO 3 animación de vuelo y temporizador de reinicio automático
    else if (estado === 3) {
        contadorVolar++;
        if (contadorVolar > 60) {
            generarFlor(); 
        }
    }

    // LÓGICA DE RENDERIZADO Y ACTUALIZACIÓN

    colorActual = lerpColor(colorActual, colorObjetivo, 0.03);
    escena.background(colorActual);

    let multiplicadorGiro = map(amp, umbralSilencio, umbralSoplido, 0.5, 2.5);

    // actualiza y dibuja las capas visibles en el buffer oculto
    for (let i = 0; i < capasVisibles; i++) {
        let p = florActual[i];
        p.actualizar(multiplicadorGiro, amp, haySonido, yaSoplo);
        p.dibujar(escena);
    }

    // buffer en la pantalla real con escala proporcional
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
        [300, 360],
        [160, 240],
        [20, 80]
    ];

    let rango = random(paletas);

    let hueBase = random(
        rango[0],
        rango[1]
    );

    let hueContraste = (hueBase + 180) % 360;

    colorObjetivo = color(
        hueContraste,
        random(90, 100),
        random(85, 95)
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
    return color(h, random(60, 90), random(70, 100), 230);
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

