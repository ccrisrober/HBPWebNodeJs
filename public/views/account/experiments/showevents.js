$("#delete").click(function(e) {
	e.preventDefault();
	var accept = confirm("¿Deseas borrar este experimento?");
	console.log(accept);
	if(accept) {
		alert("_csrf=" + $("#_csrf").val() + "&" + "experiment=" + $("#experiment").val());
		$.ajax( {
			url: "/account/experiments/delete",
			data: "_csrf=" + $("#_csrf").val() + "&" + "experiment=" + $("#experiment").val(),
			type: "delete",
			success: function(data) {
				console.log("Success: " + data);
				if(data.ok) {
					alert(data.ok);
					location.href = "/account/experiments/author/" + data.id;
				} else {
					alert(data.error);
				}
			},
			error: function(xhr, status, error) {
				console.log("Error: " + error.message);
				console.log(status);
				console.log(xhr);
			}
		});
	}
});
$("#visiblity").click(function(e) {
	e.preventDefault();
	$.ajax( {
		url: "/account/experiments/update",
		data: "_csrf=" + $("#_csrf").val() + "&" + "experiment=" + $("#experiment").val(),
		type: "post",
		beforeSend: function() {
			$("#visibilityblock").html("");
		},
		success: function(data) {
			if(data.ok) {
				//alert(data.visible);
				var text = "El experimento " + (data.visible ? "": "no") + " se puede visualizar.";
				var color = (data.visible)? "success" : "warning";
				var attent = (!data.visible)? "<strong>Atención!</strong>&nbsp;" : "";

				var block = "<div class=\"alert alert-" + color + " alert-dismissible fade in\" role=\"alert\">" + 
					"<button type=\"button\" class=\"close\" data-dismiss=\"alert\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button>" +
					attent + text +
				"</div>";
				$("#visibilityblock").html(block).fadeIn();//.show(2000);
				$("#visiblity").html(!data.visible ? "Enable" : "Disable");
			} else {

			}
		},
		error: function(xhr, status, error) {
			console.log("Error: " + error.message);
			console.log(status);
			console.log(xhr);
		}
	});
});