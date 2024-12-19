<template>
  <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
    <div class="container" style="max-width: 600px;">
      <!-- Tarjeta de inicio de sesión -->
      <div class="card shadow-sm my-4 p-4">
        <h1 class="text-center mb-3">Ingrese su ID alfanumérico</h1>
        <p class="text-center text-muted">Inicie sesión para realizar transacciones.</p>
        <div class="form-group">
          <input v-model="idDeUsuario" type="text" placeholder="ID de usuario (10 dígitos)" @input="verificarId"
            class="form-control text-center">
          <p v-if="debeMostrarError" class="alert alert-danger mt-3 text-center">
            ID no válido. No se puede iniciar sesión.
          </p>
        </div>
      </div>

      <!-- Sección de bienvenida -->
      <div v-if="sesionIniciada" class="card shadow-sm my-4 p-4">
        <h2 class="text-center mb-3">Bienvenido, {{ obtenerNombreApellido() }}</h2>
        <p class="text-center text-muted">¿Qué operación desea realizar?</p>

        <!-- Tipo de operación -->
        <div class="form-group">
          <label for="tipoDeOperacion" class="form-label">Tipo de operación:</label>
          <select v-model="tipoDeOperacion" class="form-select" id="tipoDeOperacion">
            <option value="comprar">Comprar</option>
            <option value="vender">Vender</option>
          </select>
        </div>

        <!-- Selección de criptomoneda -->
        <div class="form-group mt-3">
          <label for="criptomonedaSeleccionada" class="form-label">Criptomoneda:</label>
          <select v-model="criptomonedaSeleccionada" class="form-select" id="criptomonedaSeleccionada">
            <option v-for="criptomoneda in criptomonedas" :key="criptomoneda.id" :value="criptomoneda.id">
              {{ criptomoneda.name }}
            </option>
          </select>
        </div>

        <!-- Cantidad -->
        <div class="form-group mt-3">
          <label for="cantidad" class="form-label">Cantidad:</label>
          <input v-model="cantidad" type="number" step="0.1" min="0.000001" @change="calcularMonto" class="form-control"
            id="cantidad">
        </div>

        <!-- Monto a pagar -->
        <div class="form-group mt-3">
          <label for="monto" class="form-label">Monto a pagar:</label>
          <input type="number" readonly :value="montoActualizado" class="form-control bg-light" id="monto">
        </div>

        <!-- Botón de guardar transacción -->
        <div class="text-center mt-4">
          <button @click="guardarTransaccion"
            :disabled="!datosValidos || (tipoDeOperacion === 'vender' && !puedeVender) || bloquearBoton"
            class="btn btn-primary w-100">
            Guardar Transacción
          </button>
        </div>
      </div>

      <!-- Sección de compra/venta realizada -->
      <div class="card shadow-sm my-4 p-4" v-if="compraRealizada || ventaRealizada">
        <div v-if="compraRealizada" class="alert alert-success">
          <h3 class="text-center">Compra Realizada</h3>
          <p>Fecha y Hora: {{ compraActual.fechaHora }}</p>
          <p>Criptomoneda: {{ compraActual.criptomoneda }}</p>
          <p>Cantidad: {{ compraActual.cantidad }}</p>
          <p>Monto: ${{ compraActual.monto }}</p>
        </div>
        <div v-if="ventaRealizada" class="alert alert-danger">
          <h3 class="text-center">Venta Realizada</h3>
          <p>Fecha y Hora: {{ ventaActual.fechaHora }}</p>
          <p>Criptomoneda: {{ ventaActual.criptomoneda }}</p>
          <p>Cantidad: {{ ventaActual.cantidad }}</p>
          <p>Monto: ${{ ventaActual.monto }}</p>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import { mapState } from 'vuex';

export default {
  data() {
    return {
      idDeUsuario: '',
      debeMostrarError: false,
      criptomonedaSeleccionada: '',
      cantidad: 0,
      fechaHora: '',
      monto: 0,
      precios: {},

      compraRealizada: false,
      ventaRealizada: false,
      tipoDeOperacion: 'comprar',
      compraActual: {
        fechaHora: '',
        criptomoneda: '',
        cantidad: '',
        monto: '',
        tipoDeOperacion: 'comprar',
      },
      ventaActual: {
        fechaHora: '',
        criptomoneda: '',
        cantidad: '',
        monto: '',
        tipoDeOperacion: 'vender',
      },
      puedeVender: false,
      bloquearBoton: false,
      contadorCriptomonedas: {},
    };
  },

  methods: {
    mounted() {
      // Cargar el contador desde localStorage
      if (localStorage.getItem('contadorCriptomonedas')) {
        this.contadorCriptomonedas = JSON.parse(localStorage.getItem('contadorCriptomonedas'));
      }
    },

    ApiClient() {
      return axios.create({
        baseURL: 'https://laboratorio3-f36a.restdb.io/rest/',
        headers: {
          'x-apikey': '60eb09146661365596af552f',
        },
      });
    },

    obtenerNombreApellido() {
      const usuario = this.usuarios.find((usuario) => usuario.idDeUsuario === this.idDeUsuario);
      return usuario ? `${usuario.Nombre} ${usuario.Apellido}` : '';
    },

    calcularMonto() {
      const criptomoneda = this.criptomonedas.find((c) => c.id === this.criptomonedaSeleccionada);
      if (criptomoneda) {
        const url = `https://criptoya.com/api/argenbtc/${criptomoneda.id}/ars/${this.cantidad}`;
        const action = this.tipoDeOperacion === 'comprar' ? 'ask' : 'bid';

        axios
          .get(url)
          .then((response) => {
            const precioARS = response.data[action];
            this.precios[criptomoneda.id] = precioARS;
            this.monto = (this.cantidad * precioARS).toFixed(2);
          })
          .catch((error) => {
            console.error('Error al obtener el monto en pesos (ARG): ', error);
          });
      }
    },

    verificarId() {
      const idValida = this.usuarios.some((usuario) => usuario.idDeUsuario === this.idDeUsuario);
      const tieneDiezDigitos = this.idDeUsuario.length === 10;
      this.debeMostrarError = !idValida && tieneDiezDigitos;
      if (this.sesionIniciada) {
        this.verificarCantidadCriptomonedas();
      }
    },

    guardarTransaccion() {
      const nuevaTransaccion = {
        user_id: this.idDeUsuario,
        action: this.tipoDeOperacion === 'comprar' ? 'purchase' : 'sale',
        crypto_code: this.criptomonedaSeleccionada,
        crypto_amount: this.cantidad.toString(),
        money: this.monto.toString(),
        datetime: this.fechaHoraActual(),
      };

      axios
        .post('https://laboratorio3-f36a.restdb.io/rest/transactions', nuevaTransaccion, {
          headers: {
            'x-apikey': '60eb09146661365596af552f',
          },
        })
        .then((response) => {
          console.log('Operación exitosa:', response.data);


          if (nuevaTransaccion.action === 'purchase') {
            // Operación de compra
            this.compraActual.fechaHora = this.fechaHoraActual();
            this.compraActual.criptomoneda = this.obtenerNombreCriptomoneda();
            this.compraActual.cantidad = this.cantidad;
            this.compraActual.monto = this.monto;
            this.compraRealizada = true;
            if (!this.contadorCriptomonedas[this.criptomonedaSeleccionada]) {
              this.contadorCriptomonedas[this.criptomonedaSeleccionada] = 0;
            }
            this.contadorCriptomonedas[this.criptomonedaSeleccionada] += this.cantidad;
          } else if (nuevaTransaccion.action === 'sale') {
            // Operación de venta
            this.ventaActual.fechaHora = this.fechaHoraActual();
            this.ventaActual.criptomoneda = this.obtenerNombreCriptomoneda();
            this.ventaActual.cantidad = this.cantidad;
            this.ventaActual.monto = this.monto;
            this.ventaRealizada = true;

            //Restar la cantidad vendida de la cantidad comprada para reflejar la venta
            this.contadorCriptomonedas[this.criptomonedaSeleccionada] -= this.cantidad;
          }
          this.bloquearBoton = true;
          this.verificarCantidadCriptomonedas();
          this.resetearFormulario();
        })
        .catch((error) => {
          console.error('Error al guardar la transacción:', error);
        });
    },


    resetearFormulario() {
      this.criptomonedaSeleccionada = '';
      this.cantidad = 0;
      this.fechaHora = this.fechaHoraActual();
      this.monto = 0;
    },

    obtenerNombreCriptomoneda() {
      const criptomoneda = this.criptomonedas.find((c) => c.id === this.criptomonedaSeleccionada);
      return criptomoneda ? criptomoneda.name : '';
    },

    fechaHoraActual() {
      const now = new Date();
      const year = now.getFullYear();
      const month = `${now.getMonth() + 1}`.padStart(2, '0');
      const day = `${now.getDate()}`.padStart(2, '0');
      const hour = `${now.getHours()}`.padStart(2, '0');
      const minute = `${now.getMinutes()}`.padStart(2, '0');
      return `${year}-${month}-${day}  ${hour}:${minute}`;
    },

    verificarCantidadCriptomonedas() {
      const idDeUsuario = this.idDeUsuario;
      const codigoCriptomoneda = this.criptomonedaSeleccionada;

      const url = `https://laboratorio3-f36a.restdb.io/rest/transactions?q={"user_id":"${idDeUsuario}","crypto_code":"${codigoCriptomoneda}"}`;
      const apiClient = this.ApiClient();

      apiClient
        .get(url)
        .then((response) => {
          const movimientosCriptomoneda = response.data;
          let cantidadComprada = 0;
          let cantidadVendida = 0;
          let cantidadDisponible = 0;

          for (const movimiento of movimientosCriptomoneda) {
            if (movimiento.action === 'purchase') {
              cantidadComprada += parseFloat(movimiento.crypto_amount);
            } else if (movimiento.action === 'sale') {
              cantidadVendida += parseFloat(movimiento.crypto_amount);
            }
          }

          const contadorCriptomonedas = this.contadorCriptomonedas[this.criptomonedaSeleccionada] || 0;
          cantidadComprada += contadorCriptomonedas;
          cantidadDisponible = cantidadComprada - cantidadVendida;

          this.puedeVender = cantidadDisponible >= 0 && this.cantidad > 0 && this.cantidad <= cantidadDisponible;
          if (this.tipoDeOperacion === 'comprar') {
            // Para comprar, no hay restricciones, siempre se puede comprar.
            this.puedeVender = true;
          } else if (this.tipoDeOperacion === 'vender' && this.cantidad > this.contadorCriptomonedas[this.criptomonedaSeleccionada]) {
            this.puedeVender = this.cantidad <= cantidadDisponible;
            this.puedeVender ? null : console.log("No puede realizar la venta. No tiene las criptomonedas")
          }

          localStorage.setItem('contadorCriptomonedas', JSON.stringify(this.contadorCriptomonedas));
          this.bloquearBoton = false; // Desbloquear el botón después de la validación
        })
        .catch((error) => {
          console.error('Error al obtener la cantidad de criptomonedas:', error);
        });
    },
  },


  computed: {
    ...mapState(['usuarios']),
    sesionIniciada() {
      return this.idDeUsuario !== '' && this.esIdValida;
    },

    esIdValida() {
      return this.usuarios.some((usuario) => usuario.idDeUsuario === this.idDeUsuario);
    },

    criptomonedas() {
      return [
        { id: 'btc', name: 'Bitcoin' },
        { id: 'eth', name: 'Ethereum' },
        { id: 'usdt', name: 'USDT' },

      ];
    },

    datosValidos() {
      return (
        this.criptomonedaSeleccionada !== '' &&
        this.cantidad > 0 &&
        this.monto >= 0
      );
    },

    montoActualizado() {
      const criptomoneda = this.criptomonedas.find((c) => c.id === this.criptomonedaSeleccionada);
      if (criptomoneda) {
        const precioARS = this.precios[criptomoneda.id];
        return (this.cantidad * precioARS).toFixed(2);
      } else {
        return 0;
      }
    },
  },

  watch: {
    cantidad: {
      handler() {
        this.calcularMonto();
        this.verificarCantidadCriptomonedas();
      },
      immediate: true,
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
}
</style>
