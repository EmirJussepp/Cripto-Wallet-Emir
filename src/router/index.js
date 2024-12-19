import { createRouter, createWebHistory } from "vue-router";
import PaginaRegistrarse from "../views/PaginaRegistrarse.vue";
import UsuariosRegistrados from "../views/UsuariosRegistrados.vue";
import NuevaCompra from "../views/NuevaCompra.vue";
import HistorialDeMovimientos from "../views/HistorialDeMovimientos.vue";
import EstadoActual from "../views/EstadoActual.vue";
const routes = [
  {
    path: "/",
    name: "Pagina de Registro",
    component: PaginaRegistrarse,
  },
  {
    path: "/usuarios",
    name: "Usuarios Registrados",
    component: UsuariosRegistrados
  },
  {
    path: '/nuevacompra',
    name: 'NuevaCompra',
    component: NuevaCompra
  },
  {
    path: "/historialdemovimientos",
    name: "HistorialDeMovimientos",
    component: HistorialDeMovimientos,
  },
  {
    path: "/estadoactual",
    name: "Estado Actual",
    component: EstadoActual,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
