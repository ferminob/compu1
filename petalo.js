class Petalo {
    constructor(id, img, col, tipo) {
        this.id = id;
        this.img = img;
        this.color = col;
        this.tipo = tipo;

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

    actualizar(amplitud, haySonido, yagitSoplo) {
        if (estado === 2) {
            if (yaSoplo) {

                let factorSoplido = haySonido ? map(amplitud, 0.20, 0.30, 1.3, 2) : 1.2;
                factorSoplido = constrain(factorSoplido, 1.3, 2);

                let direccion = (this.id % 2 === 0) ? 1 : -1;

                this.rotacion += (this.velocidadGiro * (this.id + 1) * direccion) * factorSoplido;
            }

            // --- CONTROL DE VIBRACIÓN --- 
            if (haySonido) {
                let x = 50 * noise(0.0010 * frameCount);
                let y = 50 * noise(0.0010 * frameCount + 10000);

                this.offsetX = random(-x, y);
                this.offsetY = random(x, -y);
            } else {
                this.offsetX = 0;
                this.offsetY = 0;
            }
        }

        // ---  CENTRO ---
        if (this.tipo === "centro") {
            if (estado === 1) {
                if (haySonido) {
                    this.offsetX = random(-3, 3);
                    this.offsetY = random(-3, 3);
                } else {
                    this.offsetX = 0;
                    this.offsetY = 0;
                }
            } else if (estado === 2 && !haySonido) {
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
        let impulso = map(fuerzaSoplido, 0.30, 0.35, 1.3, 2.5);
        impulso = constrain(impulso, 1.3, 2.5);
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
