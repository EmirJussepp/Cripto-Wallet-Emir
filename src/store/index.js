import { createStore } from "vuex";

export default createStore({
  state: {
    usuarios: [] //Guardamos los usuarios registrados
  },
  getters: {},
  mutations: {
    agregarUsuario(state, usuarios) {
      state.usuarios.push(usuarios); //Añadimos los usuarios creados mediante pusheo
  },
},

  actions: {},
  modules: {},
});
