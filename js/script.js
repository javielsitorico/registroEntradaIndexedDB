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

     if (!baseDatos.objectStoreNames.contains('entradas')) {
          baseDatos.createObjectStore("entradas", { keyPath: 'id' });
     }
     if (!baseDatos.objectStoreNames.contains('salidas')) {
          baseDatos.createObjectStore("salidas", { keyPath: 'id' });
     }
};

$('#registrar').click(function() {
     if(!verificarFormulario()) return
     registrar();
});

$('#reiniciar-registro').click(function() {
     let transaccion = baseDatos.transaction("entradas", "readwrite");
     let registroEntrada = transaccion.objectStore("entradas");
     registroEntrada.clear();
});

function registrar() {
     let transaccion = baseDatos.transaction("almacenObjetos", "readwrite");
     let registroEntrada = transaccion.objectStore("almacenObjetos");

     let nuevoRegistro = {
          id: $('#dni').val(),
          nombre: $('#nombre').val(),
          apellidos: $('#apellidos').val(),
          contacto: $('#persona-contacto').val(),
          horaEntrada: new Date().toLocaleTimeString('es-ES', { hour: "numeric", minute: "numeric"}),
     }

     let insercion = registroEntrada.put(nuevoRegistro);

     insercion.onerror = function () { error() };
     insercion.onsuccess = function () { exito() };
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

     let request = almacenValores.openCursor();

     request.onsuccess = function () {
          let cursor = request.result;

          if (cursor) {
               let clave = cursor.key;
               let valor = cursor.value;
               
               console.log(valor);
          }
     };
}

function verificarFormulario() {
     return $('#nombre').val() != '' && 
     $('#apellidos').val() != '' && 
     $('#dni').val() != '' && 
     $('#persona-contacto').val() != '';
}