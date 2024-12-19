<template>
  <div class="container d-flex flex-column justify-content-center align-items-center min-vh-100">
    <h1 class="text-center mb-4">Análisis de Inversiones</h1>

    <div v-if="resumenCriptomonedas.length === 0" class="text-center">
      <p>No tienes criptomonedas.</p>
    </div>

    <div v-else class="w-100">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Criptomoneda</th>
            <th>Compra</th>
            <th>Cantidad comprada</th>
            <th>Venta</th>
            <th>Cantidad vendida</th>
            <th>Resultado</th>
            <th>Criptomonedas Disponibles</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="resumen in resumenCriptomonedas" :key="resumen.idCriptomoneda">
            <td>{{ obtenerNombre(resumen.idCriptomoneda) }}</td>
            <td>{{ formatearNumero(resumen.comprado) }}</td>
            <td>{{ resumen.cantidadComprada }}</td>
            <td>{{ formatearNumero(resumen.vendido) }}</td>
            <td>{{ resumen.cantidadVendida }}</td>
            <td>{{ formatearNumero(resumen.resultado) }}</td>
            <td>{{ resumen.cantidadDisponible }}</td>
            <td>
              <button class="btn btn-primary" @click="editarTransaccion(resumen.idCriptomoneda)">Editar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <h3 class="text-center mt-4">Resultado total de sus inversiones</h3>
      <p class="text-center">{{ formatearNumero(resumenTotal) }}</p>
    </div>

    <!-- Modal o sección para editar -->
    <div v-if="transaccionAEditar" class="modal fade show" tabindex="-1" style="display: block;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Editar Transacción</h5>
            <button type="button" class="btn-close" @click="cancelarEdicion"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="guardarEdicion">
              <div class="mb-3">
                <label for="crypto" class="form-label">Criptomoneda</label>
                <select v-model="transaccionAEditar.idCriptomoneda" class="form-select">
                  <option v-for="crypto in listaCriptomonedas()" :key="crypto.id" :value="crypto.id">
                    {{ crypto.name }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label for="cantidad" class="form-label">Cantidad comprada</label>
                <input type="number" v-model="transaccionAEditar.cantidadComprada" class="form-control" required />
              </div>

              <div class="mb-3">
                <label for="vendido" class="form-label">Cantidad vendida</label>
                <input type="number" v-model="transaccionAEditar.cantidadVendida" class="form-control" required />
              </div>

              <div class="mb-3">
                <label for="monto" class="form-label">Monto</label>
                <input type="number" v-model="transaccionAEditar.monto" class="form-control" required />
              </div>

              <div class="d-flex justify-content-between">
                <button type="submit" class="btn btn-success">Guardar cambios</button>
                <button type="button" @click="cancelarEdicion" class="btn btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>




<script>
import axios from 'axios';

export default {
  data() {
    return {
      resumenCriptomonedas: [],
      resumenTotal: 0,
      criptomonedas: {},
    };
  },

  created() {
    this.obtenerEstadoActual();
  },

  methods: {
    listaCriptomonedas() {
      return [
        { id: 'btc', name: 'Bitcoin' },
        { id: 'eth', name: 'Ethereum' },
        { id: 'usdt', name: 'USDT' },
        { id: 'dai', name: 'DAI' },
      ];
    },

    formatearNumero(num) {
      return Number(num).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
    },

    obtenerNombre(id) {
      const crypto = this.listaCriptomonedas().find(c => c.id === id);
      return crypto ? crypto.name : id;
    },

    obtenerEstadoActual() {
      const idDeUsuario = localStorage.getItem('idDeUsuario');
      const url = `https://laboratorio3-f36a.restdb.io/rest/transactions?q={"user_id":"${idDeUsuario}"}`;
  
      axios.get(url, {
        headers: {
          'x-apikey': '60eb09146661365596af552f',
        },
      }).then((response) => {
        const transacciones = response.data;
        this.criptomonedas = {};

        for (const transaccion of transacciones) {
          const idCriptomoneda = transaccion.crypto_code;

          if (!this.criptomonedas[idCriptomoneda]) {
            this.criptomonedas[idCriptomoneda] = {
              idCriptomoneda: idCriptomoneda,
              comprado: 0,
              vendido: 0,
              cantidadComprada: 0,
              cantidadVendida: 0,
              
            };
          }
          
          if (transaccion.action === "purchase") {
            this.criptomonedas[idCriptomoneda].comprado += parseFloat(transaccion.money);
            this.criptomonedas[idCriptomoneda].cantidadComprada += transaccion.action === "purchase" ? parseFloat(transaccion.crypto_amount) : 0;
            this.criptomonedas[idCriptomoneda].cantidadDisponible = this.criptomonedas[idCriptomoneda].cantidadComprada - this.criptomonedas[idCriptomoneda].cantidadVendida;
          } else if (transaccion.action === "sale") {
            this.criptomonedas[idCriptomoneda].vendido += parseFloat(transaccion.money);
            this.criptomonedas[idCriptomoneda].cantidadVendida += transaccion.action === "sale" ? parseFloat(transaccion.crypto_amount) : 0;
            this.criptomonedas[idCriptomoneda].cantidadDisponible = this.criptomonedas[idCriptomoneda].cantidadComprada - this.criptomonedas[idCriptomoneda].cantidadVendida;
          }
        }

        this.resumenCriptomonedas = Object.values(this.criptomonedas).map(crip => {
          crip.resultado = crip.vendido - crip.comprado;
          this.resumenTotal += crip.resultado;
          return crip;
        });
      });
    },
  },
};
</script>
