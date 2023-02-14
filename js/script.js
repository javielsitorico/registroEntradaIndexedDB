let abrirConsulta = indexedDB.open("objetos", 1);
let baseDatos;
// Preguntar a Turi si las dos tablas es buena idea meterlas en un array para recorrerclas y hacerlo mas funcional

abrirConsulta.onsuccess = function () {
     baseDatos = abrirConsulta.result;
     actualizarDatosTabla();
};

abrirConsulta.onerror = function () {
     alert("Error al acceder a la base de datos");
};

abrirConsulta.onupgradeneeded = function () {
     let baseDatos = abrirConsulta.result;

     if (!baseDatos.objectStoreNames.contains('entrada')) {
          baseDatos.createObjectStore("entrada", { keyPath: 'dni' });
     }
     if (!baseDatos.objectStoreNames.contains('salida')) {
          baseDatos.createObjectStore("salida", { keyPath: 'dni' });
     }
};

$('#registrar').click(function () {
     if (!verificarFormulario()) return
     registrarEntradaSalida(
          {
               dni: $('#dni').val(),
               nombre: $('#nombre').val(),
               apellidos: $('#apellidos').val(),
               contacto: $('#persona-contacto').val(),
               horaEntrada: new Date().toLocaleTimeString('es-ES', { hour: "numeric", minute: "numeric" }),
               horaSalida: '<a id="ha-salido" class="enlace-tabla">Ha salido</a>',
          },
          'entrada'
     );
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
          .transaction("entrada", "readwrite")
          .objectStore("entrada")
          .get(dni.innerText);

     peticion.onsuccess = () => {
          registroSalida = peticion.result;
          registroSalida.horaSalida = new Date().toLocaleTimeString('es-ES', { hour: "numeric", minute: "numeric"});
     
          registrarEntradaSalida(registroSalida, 'salida');

          baseDatos
               .transaction("entrada", "readwrite")
               .objectStore("entrada")
               .delete(dni.innerText);
     }
});

function registrarEntradaSalida(datos, tabla) {
     let insercion = baseDatos
          .transaction(tabla, "readwrite")
          .objectStore(tabla)
          .put(datos);

     insercion.onerror = () => alert("Error al insertar los datos en la base de datos");
     insercion.onsuccess = function () { insertarDatosTabla(datos, tabla) };
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
          .transaction("entrada")
          .objectStore("entrada")
          .getAll();

     peticionRegistroEntrada.onsuccess = (evento) => {
          for (let registro of evento.target.result) {
               insertarDatosTabla(registro, 'entrada')
          }
     }
     
     let peticionRegistroSalida = baseDatos
          .transaction("salida")
          .objectStore("salida")
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