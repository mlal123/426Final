"use strict";
var url = "http://comp426.cs.unc.edu:3001";
document.addEventListener("DOMContentLoaded", function (event) {
    //var url = "http://comp426.cs.unc.edu:3001";
    $("#login_form").submit(function (e){
		var name = $("#login_form")[0].username.value;
		var pass = $("#login_form")[0].password.value;
		login(name, pass);
		e.preventDefault();
	});
    
    function login(name, pass){
		$.ajax({
			url: url + "/sessions",
			type: "POST",
			data: {"user":{
                    "username": name,
                    "password": pass
                }   
            },
			success: function(response){
				console.log("success");
                makePage();
			},
			error: function(err){
				console.log(err);
                alert("Passowrd or Username is wrong or you are not registered.");
			}
		});
	}
    
    function session(name, pass){
		$.ajax({
			url: url + "/users",
			type: "POST",
            dataType: "json",
			data: '{"user": {"username": "mlal124","password": "Dragon12#"}}',
            contentType: 'application/json',
			success: function(res){
				console.log(res);
			},
			error: function(err){
				console.log(err);
			}
		});
	}
});

function loadAirports(){
	$.ajax({
		url: url + "/airports/",
		type: "GET",
		// dataType: 'json',
		xhrFields: {withCredentials: true},
		// data: {},
		success: function(data, status, xhr){
			populateAirportMap(data);
			console.log(airports);
		},
		error:(XMLHttpRequest,textStatus, errorThrown) => {
			console.log(errorThrown);
		}
	});
	
}

function makePage(){
    $("#login_box").hide();
	$("#main_box").show();
	loadAirports();
}

function populateAirportMap(data){
	data.forEach(element => {
		airports[element.name]= element;
	});
	//$(".dropdown-content").append("<a id =" + element.id +"> " + element.name + "</a>");
	var keys = Object.keys(airports)
	for(var key of keys){
		var airport = airports[key];
		$(".dropdown-content").append("<a id =" + airport.id +"> " + airport.name + "</a><br>");
		//console.log(airport);
	}

}
			
var airports = {};
