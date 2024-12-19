<template>
  <div>
    <!-- Navbar con Bootstrap -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <!-- Logo -->
        <a class="navbar-brand" href="#">
          <img src="./assets/logowallet.png" alt="Logo" class="logo">
        </a>
        <!-- Botón para menú colapsable en pantallas pequeñas -->
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <!-- Links del Navbar -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/">Registrarse</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/nuevacompra">Comprar y Vender Criptomonedas</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/historialdemovimientos">Historial de Movimientos</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/estadoactual">Estado Actual</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/usuarios">Usuarios Registrados</router-link>
            </li>
          
          </ul>
        </div>
      </div>
    </nav>

    <!-- Contenido de las rutas -->
    <router-view />
  </div>
</template>

<style>
/* Estilos adicionales */
.logo {
  width: 70px; /* Tamaño del logo */
  height: 70px;
}
.nav-link {
  font-weight: bold;
  text-transform: uppercase;
  color: #ffff!important;
}
.nav-link.router-link-exact-active {
  color: #00ffff !important; /* Color activo */
}

</style>
