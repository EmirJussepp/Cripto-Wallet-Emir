<template>
  <div class="container-fluid d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <div class="row w-75 p-4 bg-white rounded shadow-sm">
      <div class="col-12 text-center mb-4">
        <h1 class="h2 text-dark">Para continuar, debe registrarse en Corn.</h1>
        <h2 class="text-muted">Completando el siguiente formulario se generará una ID única, la cual utilizará para realizar las transacciones.</h2>
      </div>

      <div class="col-12">
        <form @submit.prevent="generarIdDeUsuario">
          <div class="mb-3">
            <input
              v-model="Nombre"
              type="text"
              class="form-control"
              placeholder="Nombre"
              @input="validarCampoPorLetras('Nombre')"
              :class="{ 'is-invalid': !esCampoValido('Nombre') }"
            />
            <div v-if="!esCampoValido('Nombre')" class="invalid-feedback">Solo debe contener letras.</div>
          </div>

          <div class="mb-3">
            <input
              v-model="Apellido"
              type="text"
              class="form-control"
              placeholder="Apellido"
              @input="validarCampoPorLetras('Apellido')"
              :class="{ 'is-invalid': !esCampoValido('Apellido') }"
            />
            <div v-if="!esCampoValido('Apellido')" class="invalid-feedback">Solo debe contener letras.</div>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-100"
            :disabled="idCopiada || !ValidacionNombre"
          >
            {{ idCopiada ? '✔ ID Copiada' : 'Generar ID de usuario' }}
          </button>

          <p v-if="idDeUsuario" class="mt-3 text-center">
            ID de usuario generado: <strong>{{ idDeUsuario }}</strong>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  data() {
    return {
      Nombre: "",
      Apellido: "",
      idDeUsuario: "",
      idCopiada: false,
      idsGeneradas: new Set(),
      camposValidos: {
        Nombre: true,
        Apellido: true,
      },
    };
  },

  methods: {
    validarCampoPorLetras(campoAValidar) {
      const texto = this[campoAValidar].trim();
      const valoresValidos = /^[A-Za-z]+$/;
      this.camposValidos[campoAValidar] = texto !== '' && valoresValidos.test(texto);
    },

    esCampoValido(campo) {
      return this.camposValidos[campo];
    },

    generarIdRandom() {
      const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789¡?!¿";
      let idGenerada = "";
      for (let i = 0; i < 10; i++) {
        idGenerada += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }
      return idGenerada;
    },

    generarIdUnica() {
      let idNueva = this.generarIdRandom();
      while (this.idsGeneradas.has(idNueva)) {
        idNueva = this.generarIdRandom();
      }
      return idNueva;
    },

    generarIdDeUsuario() {
      const idNueva = this.generarIdUnica();
      localStorage.setItem('idDeUsuario', idNueva);
      this.idsGeneradas.add(idNueva);
      this.idDeUsuario = idNueva;
      const nuevoUsuario = {
        Nombre: this.Nombre,
        Apellido: this.Apellido,
        idDeUsuario: this.idDeUsuario,
      };
      this.copiarId();
      this.idCopiada = true;
      this.agregarUsuario(nuevoUsuario);
    },

    copiarId() {
      const idACopiar = this.idDeUsuario;
      navigator.clipboard.writeText(idACopiar)
        .catch((error) => {
          console.error('Error al copiar el ID:', error);
        });
    },

    ...mapMutations(['agregarUsuario']),
  },

  computed: {
    ...mapState(["usuarios"]),
    ValidacionNombre() {
      return this.esCampoValido('Nombre') && this.esCampoValido('Apellido') && this.Nombre.trim() !== '' && this.Apellido.trim() !== '';
    },
  },
};
</script>

<style scoped>
/* Styles for the layout */
.container-fluid {
  background-color: #f8f9fa;
}

.row {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1, h2 {
  color: #343a40;
}

h1 {
  font-size: 2rem;
}

h2 {
  font-size: 1.25rem;
}

button:disabled {
  opacity: 0.7;
}

button {
  transition: background-color 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}
</style>
