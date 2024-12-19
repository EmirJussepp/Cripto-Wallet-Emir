<template>
  <div class="container d-flex flex-column justify-content-center align-items-center min-vh-100">
    <div class="MostrarUsuariosRegistrados text-center w-100">
      <h2 class="mb-4">Usuarios Registrados:</h2>
      <ul class="list-group w-100">
        <li v-for="usuario in usuarios" :key="usuario.idDeUsuario" class="list-group-item">
          {{ usuario.Nombre }} {{ usuario.Apellido }} (ID: {{ usuario.idDeUsuario }})
        </li>
      </ul>
    </div>
  </div>
</template>


<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(["usuarios"]),
  },
};
</script>