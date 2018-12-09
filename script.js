"use strict";
var url = "http://comp426.cs.unc.edu:3001";
document.addEventListener("DOMContentLoaded", function (event) {
    
    var map;
    var infowindow;
    var airports = {};
    var url = "http://comp426.cs.unc.edu:3001";
    //login("mlal124", "Dragon12#");
    login("nholroyd2", "tarheels");
    $("#login_form").submit(function (e){
		var name = $("#login_form")[0].username.value;
		var pass = $("#login_form")[0].password.value;
		e.preventDefault();
	});
    
//-------------------------------------------APIs--------------------------------------------//    
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
		  error: function(XMLHttpRequest,textStatus, errorThrown) {
			console.log(errorThrown);
		  }
	   });
    }

//--------------------------------------JS Functions-----------------------------------------//
    
    function makePage(){
        $("#login_box").hide();
        $("#main_box").show();
        loadAirports();
        //initMap();
    }
    function initMap(lat, lon) {
        var myLatLng = new google.maps.LatLng(lat, lon);
        var mapOptions = {
            center: myLatLng,
            zoom: 12
        }
        map = new google.maps.Map(document.getElementById('map'), mapOptions);
        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
           location: myLatLng,
            radius: 4000,
            type: ['restaurant']
        }, callback);
        
        /*var marker = new google.maps.Marker({
           position: myLatLng,
            title: "Hello World",
            //map: map
        });
        marker.setMap(map);*/
    }
    function callback(results, status){
        if (status === google.maps.places.PlacesServiceStatus.OK){
            
            for (var i = 0; i < results.length; i++) {
                createMarker(results[i]);
            }
        }else{
            console.log(status);
        } 
    }   
    function createMarker(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.setContent(place.name);
          infowindow.open(map, this);
        });
    }
    function searchNearby(request){
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, callback);
    }
    function makePage(){
        $("#login_box").hide();
        $("#main_box").show();
        loadAirports();
    }
    function populateAirportMap(data){
	   data.forEach(element => {
       airports[element.id]= element;
	   });
	   //$(".dropdown-content").append("<a id =" + element.id +"> " + element.name + "</a>");
	   var keys = Object.keys(airports)
	   for(var key of keys){
		  var airport = airports[key];
		  $(".dropdown-content").append("<div class='airport' id =" + airport.id +">" + airport.name + "</div>");
	   }
    }  
    function showAirport(airport){
        $(".map_stuff").show();
        $("#main_page").hide();
        initMap(airport.latitude, airport.longitude);
    }

    $(document).on("click", ".airports", function(){
        var airport_div = $(this);
        var id = airport_div[0].id;
        var airport = airports[id];
        showAirport(airport);
    });
    
});//onload
			
