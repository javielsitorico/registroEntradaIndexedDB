// $("#dni-filtro--entrada").on("keyup", function () {
//      var value = $(this).val().toLowerCase();
//      $("#tabla-registro-entrada tr").filter(function () {
//           $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
//      });
// });
// $("#nombre-filtro--entrada").on("keyup", function () {
//      var value = $(this).val().toLowerCase();
//      $("#tabla-registro-entrada tr").filter(function () {
//           $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
//      });
// });
// $("#dni-filtro--salida").on("keyup", function () {
//      var value = $(this).val().toLowerCase();
//      $("#tabla-registro-salida tr").filter(function () {
//           $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
//      });
// });
// $("#nombre-filtro--salida").on("keyup", function () {
//      var value = $(this).val().toLowerCase();
//      $("#tabla-registro-salida tr").filter(function () {
//           $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
//      });
// });
// No se si esto es necesario xddddddddd


let abrirConsulta = indexedDB.open("objetos", 1);

let baseDatos;

abrirConsulta.onsuccess = function () {
     baseDatos = abrirConsulta.result;
};

abrirConsulta.onerror = function () {
     console.log("Error al acceder a la base de datos");
};

abrirConsulta.onupgradeneeded = function () {
     let baseDatos = abrirConsulta.result;

     if (!baseDatos.objectStoreNames.contains('almacenObjetos')) {
          baseDatos.createObjectStore("almacenObjetos", { keyPath: 'id' });
     }
};

$('#registrar').click(function() {
     if(!verificarFormulario()) return
     guardar();
});

function guardar() {
     let transaccion = baseDatos.transaction("almacenObjetos", "readwrite");

     //recuperamos el objectStore
     let almacenValores = transaccion.objectStore("almacenObjetos");

     //Recuperamos el valor del input
     let registroEntrada = {
          dni: $('#dni').val(),
          nombre: $('#nombre').val(),
          apellidos: $('#apellidos').val(),
          contacto: $('#persona-contacto').val(),
          horaEntrada: new Date().toLocaleTimeString('es-ES', { hour: "numeric", minute: "numeric"}),
     }

     //insertamos en la base de datos
     let res = almacenValores.put(miObjeto);

     res.onerror = function () { error() };
     res.onsuccess = function () { exito() };
}

function error() {
     console.log("Error al insertar los datos en la base de datos");
}

function exito() {
     console.log("Datos intertados con éxito");
}

function listar() {
     let transaccion = baseDatos.transaction("almacenObjetos");
     let almacenValores = transaccion.objectStore("almacenObjetos");

     //abrimos un cursor
     let request = almacenValores.openCursor();

     //si el cursor se abre con exito
     request.onsuccess = function () {
          //recuperamos un objeto cursor que apunta a la primera fila
          let cursor = request.result;

          if (cursor) { //el cursor es false si apunta a "nada"
               let clave = cursor.key; //recuperar la clave
               let valor = cursor.value; //recuperar el valor
               let salida = "";
               console.log(valor);
               for (v in valor) {
                    salida += valor[v] + ":";
               }

               $('#datos').append("<tr><td>" + clave + "</td><td>" + salida + "</td></tr>");
               cursor.continue();

          } else {
               console.log("No hay más resultados");
          }
     };
}

function verificarFormulario() {
     return $('#nombre').val() != '' && 
     $('#apellidos').val() != '' && 
     $('#dni').val() != '' && 
     $('#persona-contacto').val() != '';
}