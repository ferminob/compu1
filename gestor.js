class GestorSenial {
    constructor(minimo_, maximo_) {
        this.minimo = minimo_;
        this.maximo = maximo_;

        //procesar volumen
        this.mapeada = 0; 
        this.filtrada = 0; 
        this.anterior = 0;
        this.f = 0.80; //control de velocidad de reaccion del filtro
    }

    actualizar(entrada_) {
        //transforma los valores del microfono a una escala limpia
        this.mapeada = map(entrada_, this.minimo, this.maximo, 0, 1);
        //limita valores
        this.mapeada = constrain(this.mapeada, 0, 1);

        // Filtro de amortiguación 
        this.filtrada = this.filtrada * this.f + this.mapeada * (1 - this.f);
        this.anterior = this.filtrada;
    }
}
