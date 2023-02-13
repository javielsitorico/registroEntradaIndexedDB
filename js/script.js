$("#dni-filtro--entrada").on("keyup", function () {
     var value = $(this).val().toLowerCase();
     $("#tabla-registro-entrada tr").filter(function () {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
     });
});
$("#nombre-filtro--entrada").on("keyup", function () {
     var value = $(this).val().toLowerCase();
     $("#tabla-registro-entrada tr").filter(function () {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
     });
});
$("#dni-filtro--salida").on("keyup", function () {
     var value = $(this).val().toLowerCase();
     $("#tabla-registro-salida tr").filter(function () {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
     });
});
$("#nombre-filtro--salida").on("keyup", function () {
     var value = $(this).val().toLowerCase();
     $("#tabla-registro-salida tr").filter(function () {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
     });
});
