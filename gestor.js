class GestorSenial {
    constructor(minimo_, maximo_) {
        this.minimo = minimo_;
        this.maximo = maximo_;

        this.mapeada = 0;
        this.filtrada = 0; 
        this.anterior = 0;
        this.f = 0.50; 
    }

    actualizar(entrada_) {
        this.mapeada = map(entrada_, this.minimo, this.maximo, 0.0, 1.0);
        this.mapeada = constrain(this.mapeada, 0.0, 1.0);

        this.filtrada = this.filtrada * this.f + this.mapeada * (1 - this.f);
        this.anterior = this.filtrada;
    }
}
