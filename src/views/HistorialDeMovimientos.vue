<template>
  <div class="d-flex flex-column justify-content-center align-items-center vh-100 bg-light p-4">
    <!-- Historial de movimientos -->
    <div class="container" style="max-width: 800px;">
      <h2 class="text-center mb-4">Historial de Movimientos</h2>

      <!-- Mensaje cuando no hay movimientos -->
      <div v-if="movimientos.length === 0" class="alert alert-warning text-center">
        <p>No se encontraron movimientos.</p>
      </div>

      <!-- Tabla de movimientos -->
      <div v-else>
        <table class="table table-hover table-striped text-center shadow-sm">
          <thead class="table-dark">
            <tr>
              <th>Fecha y Hora</th>
              <th>Criptomoneda</th>
              <th>Cantidad</th>
              <th>Monto</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="movimiento in movimientos" :key="movimiento._id">
              <td>{{ movimiento.datetime }}</td>
              <td>{{ movimiento.crypto_code }}</td>
              <td>{{ movimiento.crypto_amount }}</td>
              <td>${{ movimiento.money }}</td>
              <td>{{ movimiento.action === 'purchase' ? 'Compra' : 'Venta' }}</td>
              <td>
                <button 
                  @click="abrirFormularioEdicion(movimiento)" 
                  class="btn btn-sm btn-warning me-2">
                  Editar
                </button>
                <button 
                  @click="borrarMovimiento(movimiento._id)" 
                  class="btn btn-sm btn-danger">
                  Borrar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Formulario flotante para editar movimientos -->
    <div v-if="mostrandoEdicionDeFormulario" class="modal fade show d-block">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Editar Movimiento</h5>
            <button @click="cancelarEdicionMovimiento" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Criptomoneda:</label>
              <select 
                v-model="edicionDelMovimiento.crypto_code" 
                @change="actualizarMontoEnPesos" 
                class="form-control"
              >
                <option v-for="crypto in listaCriptomonedas" :value="crypto" :key="crypto">
                  {{ crypto }}
                </option>
              </select>
            </div>
            <div class="form-group mt-3">
              <label>Cantidad de Criptomoneda:</label>
              <input 
                v-model="edicionDelMovimiento.crypto_amount" 
                @input="actualizarMontoEnPesos" 
                type="number" 
                step="0.0001" 
                class="form-control"
              >
            </div>
            <div class="form-group mt-3">
              <label>Monto (en pesos):</label>
              <input 
                v-model="edicionDelMovimiento.money" 
                type="text" 
                class="form-control"
                disabled
              >
            </div>
          </div>
          <div class="modal-footer">
            <button @click="guardarEdicionMovimiento" class="btn btn-success">
              Guardar
            </button>
            <button @click="cancelarEdicionMovimiento" class="btn btn-secondary">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      movimientos: [],
      listaCriptomonedas: [], // Lista de criptomonedas disponibles
      mostrandoEdicionDeFormulario: false,
      edicionDelMovimiento: null,
    };
  },
  created() {
    this.verificarMovimientosRegistrados();
    this.cargarListaDeCriptomonedas();
  },
  methods: {
    ApiClient() {
      return axios.create({
        baseURL: "https://laboratorio3-f36a.restdb.io/rest/",
        headers: {
          "x-apikey": "60eb09146661365596af552f",
        },
      });
    },

    verificarMovimientosRegistrados() {
      const idDeUsuario = localStorage.getItem("idDeUsuario");
      const url = `https://laboratorio3-f36a.restdb.io/rest/transactions?q={"user_id":"${idDeUsuario}"}`;
      const apiClient = this.ApiClient();

      apiClient
        .get(url)
        .then((response) => {
          this.movimientos = response.data;
        })
        .catch((error) => {
          console.error("Error al obtener los movimientos:", error);
        });
    },

    cargarListaDeCriptomonedas() {
      // Lista fija o dinámica desde CriptoYa
      axios
        .get("https://criptoya.com/api/argenbtc/cryptos")
        .then((response) => {
          this.listaCriptomonedas = Object.keys(response.data); // Obtener todas las claves de criptomonedas
        })
        .catch((error) => {
          console.error("Error al cargar la lista de criptomonedas:", error);
          // Fallback a una lista fija si hay un error
          this.listaCriptomonedas = ["BTC", "ETH", "USDT"];
        });
    },

    abrirFormularioEdicion(movimiento) {
      this.mostrandoEdicionDeFormulario = true;
      this.edicionDelMovimiento = { ...movimiento };
    },

    async actualizarMontoEnPesos() {
      const { crypto_code, crypto_amount } = this.edicionDelMovimiento;
      if (!crypto_code || !crypto_amount) return;

      try {
        const response = await axios.get(
          `https://criptoya.com/api/argenbtc/${crypto_code}/ars`
        );
        const precioPorUnidad = response.data.totalBid; // Precio en ARS
        this.edicionDelMovimiento.money = (crypto_amount * precioPorUnidad).toFixed(2);
      } catch (error) {
        console.error("Error al actualizar el monto en pesos:", error);
      }
    },

    async guardarEdicionMovimiento() {
      const apiClient = this.ApiClient();
      try {
        await apiClient.patch(`/transactions/${this.edicionDelMovimiento._id}`, this.edicionDelMovimiento);
        this.verificarMovimientosRegistrados();
        this.cancelarEdicionMovimiento();
      } catch (error) {
        console.error("Error al guardar la edición del movimiento:", error);
      }
    },

    cancelarEdicionMovimiento() {
      this.mostrandoEdicionDeFormulario = false;
      this.edicionDelMovimiento = null;
    },

    async borrarMovimiento(id) {
      const apiClient = this.ApiClient();
      try {
        await apiClient.delete(`/transactions/${id}`);
        this.movimientos = this.movimientos.filter((mov) => mov._id !== id);
      } catch (error) {
        console.error("Error al borrar el movimiento:", error);
      }
    },
  },
};
</script>




<style scoped>
.alerta {
  color: red;
  font-weight: bold;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 8px;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
}

.formularioFlotante {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #1f0052;
  padding: 20px;
  border: 1px solid #00ccff;
  border-radius: 4px;
  color: white;
}

.otrousuario input {
  outline: none;
  width: 100%; 
  height: 15%;
  margin-bottom: 15px;
  border-radius: 15px;
  appearance: none;
  border-style: none;
  font-family: "Montserrat", sans-serif;
  font-size: 15px;
  padding: 1%;
  border: 2px solid transparent; /* Agrega un borde transparente */
  box-shadow: 0 0 0 2px rgb(255, 123, 0); /* Inicialmente, establece un borde negro */
  animation: borderAnimation 2.8s linear infinite; /* Agrega la animación al borde */
}

@keyframes borderAnimation {
  0%, 100% {
    box-shadow: 0 0 0 3px rgb(255, 235, 57); /* Borde negro */
  }
  50% {
    box-shadow: 0 0 0 3px transparent, 0 0 0 6px rgb(255, 123, 0); /* Borde negro más grande */
  }
}

.otrousuario button {
  width: 80%; 
  height: 60%;
  border-radius: 5%;
  margin-top: 10px;
  font-size: 14px;
  line-height: 1; 
  cursor: pointer; /* Cambia el cursor al pasar sobre el botón */
  transition: transform 0.3s ease;
  color: black;
}

.otrousuario button:active,
.otrousuario button:hover {
  transform: scale(1.1);
}
</style>

