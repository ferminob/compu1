class Petalo {
    constructor(id_, img_, col_, tipo_) {
        this.id = id_;
        this.img = img_;
        this.color = col_;
        this.tipo = tipo_; // "grande", "chico" o "centro"

        // Posición inicial: centro de la pantalla del buffer
        this.pos = createVector(0, 0);
        this.rotacion = random(TWO_PI);

        this.velocidadGiro = random(0.003, 0.006); 

        // offsets para la vibracion por soplido
        this.offsetX = 0;
        this.offsetY = 0;

        // Físicas para estado 3 (vuelo) 
        let anguloVuelo = random(TWO_PI);
        let fuerzaBase = random(3, 10);
        this.velX = cos(anguloVuelo) * fuerzaBase;
        this.velY = sin(anguloVuelo) * fuerzaBase;
        this.rotacionVuelo = 0;
        this.velRotacionVuelo = random(-0.05, 0.05);
    }

    actualizar(mult, amplitud, sonando, yaSoplo) {
        // --- ESTADO 2:  GIRO Y VIBRACION ---
        if (estado === 2) {
            if (yaSoplo) {
                //control de velocidad
                let factorSoplido = sonando ? map(amplitud, 0.10, 1.0, 1.5, 2.5) : 1.2;
                factorSoplido = constrain(factorSoplido, 1.2, 2.8);

                // alternacion del sentido del giro
                let direccion = (this.id % 2 === 0) ? 1 : -1;

                // giro y aceleracion por soplido
                this.rotacion += (this.velocidadGiro * (this.id + 1) * direccion) * factorSoplido;

                // --- CONTROL DE VIBRACIÓN--- 
                if (sonando) {
                    let intensidad = map(amplitud, 0.10, 1.0, 2.0, 12.0);
                    intensidad = constrain(intensidad, 2.0, 14.0);

                    this.offsetX = random(-intensidad, intensidad);
                    this.offsetY = random(-intensidad, intensidad);
                }
                // si hay silencio, los pétalos vuelven a su eje
                else {
                    this.offsetX = 0;
                    this.offsetY = 0;
                }
            }
        }

        // --- VIBRRACIÓN DEL CENTRO ---
        if (this.tipo === "centro") {
            if (estado === 1) {
                if (!sonando) {
                    this.offsetX = random(-3, 3);
                    this.offsetY = random(-3, 3);
                } else {
                    this.offsetX = 0;
                    this.offsetY = 0;
                }
            }
            else if (estado === 2 && !sonando) {
                this.offsetX = 0;
                this.offsetY = 0;
            }
        }

        // --- ESTADO 3: VUELO ---
        if (estado === 3) {
            this.offsetX += this.velX;
            this.offsetY += this.velY;
            this.rotacionVuelo += this.velRotacionVuelo;

            this.velX *= 1.05;
            this.velY *= 1.05;

            this.velY -= 0.5;
        }
    }

    iniciarVuelo(fuerzaSoplido) {
        // Multiplica la física de escape por la energía con la que el usuario hizo estallar la flor
        let impulso = map(fuerzaSoplido, 0, 1, 1, 2.5);
        this.velX *= impulso;
        this.velY *= impulso;
    }

    dibujar(buffer) {
        buffer.push();

        // traslación base al centro + los offsets dinámicos de sacudida o vuelo
        buffer.translate(canvasW / 2 + this.offsetX, canvasH / 2 + this.offsetY);

        //  ---ROTACIÓN--- 
        if (estado === 3) {
            buffer.rotate(this.rotacion + this.rotacionVuelo);
        } else {
            buffer.rotate(this.rotacion);
        }

        buffer.tint(this.color);

        buffer.image(this.img, 0, 0);

        buffer.pop();
    }
}