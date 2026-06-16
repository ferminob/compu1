class Petalo {
    constructor(id, img, col, tipo) {
        this.id = id;
        this.img = img;
        this.color = col;
        this.tipo = tipo;

        this.pos = createVector(0, 0);
        this.rotacion = random(TWO_PI);

        this.velocidadGiro = random(0.003, 0.006);

        this.offsetX = 0;
        this.offsetY = 0;

        let anguloVuelo = random(TWO_PI);
        let fuerzaBase = random(3, 10);
        this.velX = cos(anguloVuelo) * fuerzaBase;
        this.velY = sin(anguloVuelo) * fuerzaBase;
        this.rotacionVuelo = 0;
        this.velRotacionVuelo = random(-0.05, 0.05);
    }

    actualizar(mult, amplitud, sonando, yaSoplo) {
        if (estado === 2) {
            if (yaSoplo) {

                let factorSoplido = sonando ? map(amplitud, 0.25, 1.0, 1.2, 2) : 1.2;
                factorSoplido = constrain(factorSoplido, 1.2, 2);

                let direccion = (this.id % 2 === 0) ? 1 : -1;

                this.rotacion += (this.velocidadGiro * (this.id + 1) * direccion) * factorSoplido;
            }

            // --- CONTROL DE VIBRACIÓN --- 
            if (sonando) {
                let intensidad = map(amplitud, 0.10, 1.0, 2.0, 12.0);
                intensidad = constrain(intensidad, 2.0, 12.0);

                this.offsetX = random(-intensidad, intensidad);
                this.offsetY = random(-intensidad, intensidad);
            } else {
                this.offsetX = 0;
                this.offsetY = 0;
            }
        }

        // ---  CENTRO ---
        if (this.tipo === "centro") {
            if (estado === 1) {
                if (!sonando) {
                    this.offsetX = random(-3, 3);
                    this.offsetY = random(-3, 3);
                } else {
                    this.offsetX = 0;
                    this.offsetY = 0;
                }
            } else if (estado === 2 && !sonando) {
                this.offsetX = 0;
                this.offsetY = 0;
            }
        }

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
        let impulso = map(fuerzaSoplido, 0, 1, 1, 2.5);
        this.velX *= impulso;
        this.velY *= impulso;
    }

    dibujar(buffer) {




        buffer.push();

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
