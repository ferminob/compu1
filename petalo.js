class Petalo {
    constructor(id, img) {
        this.id = id;
        this.img = img;
        this.buffer = null; 
        this.rotacion = 0;
        this.velocidadGiro = 0.01;
    }

    crearBuffer() {
        this.buffer = createGraphics(width, height);
    }

    actualizar(mult) {
        if (estado === 2) {
            this.rotacion += (this.velocidadGiro* mult) * (this.id + 1);
        }
    }

    dibujar(indice) {
        if (this.buffer && (estado > 0 || indice < capasVisibles)) {
            this.buffer.clear();
            this.buffer.push();

            if (estado === 2) {
                this.buffer.translate(width / 2, height / 2);
                this.buffer.rotate(this.rotacion);
                this.buffer.translate(-width / 2, -height / 2);
            }

            if (estado === 3) {
                this.buffer.translate(contadorVolar * (this.id - 2.5) * 10, -contadorVolar * 15);
            }

            if (this.img) {
                this.buffer.image(this.img, 0, 0);
            }

            this.buffer.pop();
            image(this.buffer, 0, 0);
        }
    }

    reset() {
        this.rotacion = 0;
    }
}