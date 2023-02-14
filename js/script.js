let abrirConsulta = indexedDB.open("objetos", 1);
let baseDatos;

abrirConsulta.onsuccess = function () {
     baseDatos = abrirConsulta.result;
     actualizarDatosTabla();
};

abrirConsulta.onerror = function () {
     alert("Error al acceder a la base de datos");
};

abrirConsulta.onupgradeneeded = function () {
     let baseDatos = abrirConsulta.result;

     if (!baseDatos.objectStoreNames.contains('entradas')) {
          baseDatos.createObjectStore("entradas", { keyPath: 'dni' });
     }
     if (!baseDatos.objectStoreNames.contains('salidas')) {
          baseDatos.createObjectStore("salidas", { keyPath: 'dni' });
     }
};

$('#registrar').click(function () {
     if (!verificarFormulario()) return
     registrarEntrada();
});

$('#reiniciar-registro').click(function () {
     baseDatos.transaction("entradas", "readwrite")
          .objectStore("entradas")
          .clear();
     baseDatos.transaction("salidas", "readwrite")
          .objectStore("salidas")
          .clear();
     limpiarTablas();
});

$('table').on('click', '#ha-salido', function () {
     let dni = $(this).parent().parent().children()[2];
     $(this).parent().parent().children().remove();

     let peticion = baseDatos
          .transaction("entradas", "readwrite")
          .objectStore("entradas")
          .get(dni.innerText);

     peticion.onsuccess = () => {
          salida = peticion.result;
          salida.horaSalida = new Date().toLocaleTimeString('es-ES', { hour: "numeric", minute: "numeric"});
     
          registrarSalida(salida);

          baseDatos
          .transaction("entradas", "readwrite")
          .objectStore("entradas")
          .delete(dni.innerText);
     }
});

function registrarEntrada() {
     let datosRegistroEntrada = {
          dni: $('#dni').val(),
          nombre: $('#nombre').val(),
          apellidos: $('#apellidos').val(),
          contacto: $('#persona-contacto').val(),
          horaEntrada: new Date().toLocaleTimeString('es-ES', { hour: "numeric", minute: "numeric" }),
          horaSalida: '<a id="ha-salido" class="enlace-tabla">Ha salido</a>',
     }

     let insercion = baseDatos
          .transaction("entradas", "readwrite")
          .objectStore("entradas")
          .put(datosRegistroEntrada);

     insercion.onerror = () => alert("Error al insertar los datos en la base de datos");
     insercion.onsuccess = function () { insertarDatosTabla(datosRegistroEntrada, 'entrada') };
}

function registrarSalida(salida) {
     let registroSalida = baseDatos
          .transaction("salidas", "readwrite")
          .objectStore("salidas");

     let insercion = registroSalida.put(salida);

     insercion.onerror = () => alert("Error al insertar los datos en la base de datos");
     insercion.onsuccess = function () { insertarDatosTabla(salida, 'salida') };
}

function insertarDatosTabla(nuevoRegistro, tabla) {
     $(`#tabla-registro-${tabla}`).append(`
          <tr>
               <td>${nuevoRegistro.nombre}</td>
               <td>${nuevoRegistro.apellidos}</td>
               <td>${nuevoRegistro.dni}</td>
               <td>${nuevoRegistro.contacto}</td>
               <td>${nuevoRegistro.horaEntrada}</td>
               <td>${nuevoRegistro.horaSalida}</td>
          </tr>
     `);
}

function actualizarDatosTabla() {
     let peticionRegistroEntrada = baseDatos
          .transaction("entradas")
          .objectStore("entradas")
          .getAll();

     peticionRegistroEntrada.onsuccess = (evento) => {
          for (let registro of evento.target.result) {
               insertarDatosTabla(registro, 'entrada')
          }
     }
     
     let peticionRegistroSalida = baseDatos
          .transaction("salidas")
          .objectStore("salidas")
          .getAll();

     peticionRegistroSalida.onsuccess = (evento) => {
          for (let registro of evento.target.result) {
               insertarDatosTabla(registro, 'salida')
          }
     }
     
}

function limpiarTablas() {
     $('#tabla-registro-entrada').empty();
     $('#tabla-registro-salida').empty();     
}

function verificarFormulario() {
     return $('#nombre').val() != '' &&
          $('#apellidos').val() != '' &&
          $('#dni').val() != '' &&
          $('#persona-contacto').val() != '';
}