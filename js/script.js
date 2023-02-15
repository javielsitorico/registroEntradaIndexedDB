let abrirConsulta = indexedDB.open("objetos", 1);
let baseDatos;
let tablas = ['entrada', 'salida'];
let filtros = [
     'dni-filtro--entrada',
     'apellidos-filtro--entrada',
     'dni-filtro--salida',
     'apellidos-filtro--salida',
]

abrirConsulta.onsuccess = function () {
     baseDatos = abrirConsulta.result;
     for (let tabla of tablas) {
          actualizarDatosTabla(tabla);
     }
};

abrirConsulta.onerror = function () {
     alert("Error al acceder a la base de datos");
};

abrirConsulta.onupgradeneeded = function () {
     let baseDatos = abrirConsulta.result;

     for (let tabla of tablas) {
          if (!baseDatos.objectStoreNames.contains(tabla)) {
               let registro = baseDatos.createObjectStore(tabla, { keyPath: 'dni' });
               registro.createIndex('indiceDni', 'apellidos', {multiEntry: true, unique: false});
          }
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
     for (let tabla of tablas) {
          baseDatos
               .transaction(tabla, "readwrite")
               .objectStore(tabla)
               .clear();
     }
     for (let tabla of tablas) {
          limpiarTabla(tabla);
     }
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
          registroSalida.horaSalida = new Date().toLocaleTimeString('es-ES', { hour: "numeric", minute: "numeric" });

          registrarEntradaSalida(registroSalida, 'salida');

          baseDatos
               .transaction("entrada", "readwrite")
               .objectStore("entrada")
               .delete(dni.innerText);
     }
});

for (let filtro of filtros) {
     $(`#${filtro}`).on("keyup", function() {
          let tabla = filtro.split('--')[1];
          let busqueda = filtro.split('-')[0];

          let datosTabla = baseDatos
               .transaction(tabla)
               .objectStore(tabla);

          let peticion;

          if(busqueda != 'dni') { peticion = datosTabla.index('indiceDni').openCursor(); }
          else { peticion = datosTabla.openCursor(); }

          limpiarTabla(tabla);

          peticion.onsuccess = function () {
               let cursor = peticion.result;
               if (cursor) {
                    if ((cursor.value[busqueda]).includes($(`#${filtro}`).val())) insertarDatosTabla(cursor.value, tabla);
                    cursor.continue();
               }
          };
     });
}

function registrarEntradaSalida(datos, tabla) {
     let insercion = baseDatos
          .transaction(tabla, "readwrite")
          .objectStore(tabla)
          .put(datos);

     insercion.onerror = () => alert("Error al insertar los datos en la base de datos");
     insercion.onsuccess = function () { insertarDatosTabla(datos, tabla) };
}

function actualizarDatosTabla(tabla) {
     let request = baseDatos
          .transaction(tabla)
          .objectStore(tabla)
          .openCursor();

     request.onsuccess = function () {
          let cursor = request.result;
          if (cursor) {
               insertarDatosTabla(cursor.value, tabla);
               cursor.continue();
          }
     };
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

function limpiarTabla(tabla) {
     $(`#tabla-registro-${tabla}`).empty();
}

function verificarFormulario() {
     return $('#nombre').val() != '' &&
          $('#apellidos').val() != '' &&
          $('#dni').val() != '' &&
          $('#persona-contacto').val() != '';
}