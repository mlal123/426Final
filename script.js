"use strict";
var url = "http://comp426.cs.unc.edu:3001";
document.addEventListener("DOMContentLoaded", function (event) {
    var map;
    var infoWindow;
    var airports = {};
    var restaurantPlaces = [];
    var clicked = false;
    var url = "http://comp426.cs.unc.edu:3001";
    
    login("mlal124", "Dragon12#");

    //login("nholroyd2", "tarheels");

    $("#login_form").submit(function (e){
		var name = $("#login_form")[0].username.value;
		var pass = $("#login_form")[0].password.value;
        login(name, pass);
		e.preventDefault();
	});
    
    $("#myInput").on('keyup', function(){
        filterFunction(); 
    });
    
   /* $(".airport").click(function(){
        console.log("clicked");
        //$("#myInput").focus();
        var airport_div = $(this);
        var id = airport_div[0].id;
        var airport = airports[id];
        showAirport(airport);
    });*/
    
    $(document).on("click", ".airport", function(){
        var airport_div = $(this);
        var id = airport_div[0].innerHTML;
        var airport = airports[id];
        showAirport(airport);
    });
    
    $("#myInput").focusin(function(){
       $(".dropdown-content").show(); 
    });
    /*
    $("#myInput").focusout(function(){
        $(".dropdown-content").hide();
    });
   
    $("#logout").click(function (e){
        logout();
    });*/
    
    $("#myairport").click(function (e){
        $(".map_stuff").show();
        $("#main_page").hide();
        emptyMap();
        //defaultMapToUS(); 
        getCurrentLocation();
    });
    
    $("#home").click(function (e){
        emptyMap();
        $(".map_stuff").hide();
        $("#main_page").show();
        
    });
    /*
    $(document).on("click", ".airport", function(){
        var airport_div = $(this);
        var id = airport_div[0].id;
        var airport = airports[id];
        showAirport(airport);
    });*/
    
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
    
    function logout(){
        $.ajax({
			url: url + "/sessions",
			type: "DELETE",
            xhrFields: {withCredentials: true},
			success: function(response){
				console.log("logged out");
                $("#login_box").show();
                $(".content").hide();
			},
			error: function(err){
				console.log(err);
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
    function initMap(lat, lon, type) {
        var myLatLng = new google.maps.LatLng(lat, lon);
        var mapOptions = {
            center: myLatLng,
            zoom: 12
        }
        map = new google.maps.Map(document.getElementById('map'), mapOptions);
        infoWindow = new google.maps.InfoWindow();
        searchNearby(map, myLatLng, type);
        
        /*var marker = new google.maps.Marker({
           position: myLatLng,
            title: "Hello World",
            //map: map
        });
        marker.setMap(map);*/
    }

    function searchNearby(map, myLatLng, type){
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
           location: myLatLng,
            radius: 4000,
            types: [type]
        }, callback);
    }
    function mapUS(lat, lon){
        var latlng = new google.maps.LatLng(lat, lon);
        var mapOptions = {
            center: latlng,
            zoom: 10
        }
        map = new google.maps.Map(document.getElementById('map'), mapOptions);
    }
    
    function getCurrentLocation(){
        defaultMapToUS();
        infoWindow = new google.maps.InfoWindow;
        
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
                };

                infoWindow.setPosition(pos);
                infoWindow.setContent('Location found.');
                infoWindow.open(map);
                map.setCenter(pos);
                searchNearby(map, pos, "restaurant");
            }, function() {
                handleLocationError(true, infoWindow, map.getCenter());
            });
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }
        
    }
    
    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
    }

    function callback(results, status){
        if (status === google.maps.places.PlacesServiceStatus.OK){
            for (var i = 0; i < results.length; i++) {
                restaurantPlaces[i]= results[i];
                var place = results[i];
                createMarker(place);
                addPlaceToPlacesDiv(place);
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
          infoWindow.setContent(place.name);
          infoWindow.open(map, this);
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
         Object.keys(airports).sort().forEach(function(key, i) {
             var airport = airports[key];
		      $(".dropdown-content").append("<a class='airport' data-price = " + airport.price_level + " data-rating = " + airport.rating + " data-open = " + airport.opening_hours + " id =" + airport.id +">" + airport.name + "</a>");
         });
    }  
    
    function defaultMapToUS(){
        $(".map_stuff").show();
        $("#main_page").hide();
        mapUS(38.889931, -77.009003);
    }
    
    function filterFunction(){
        var input, filter, ul, li, a, i;
        input = document.getElementById("myInput");
        filter = input.value.toUpperCase();
        var div = document.getElementById("dropdown_box");
        a = div.getElementsByTagName("a");
        for (i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                a[i].style.display = "";
            } else {
                a[i].style.display = "none";
            }
        }
    }
    function showAirport(airport){
        $(".map_stuff").show();
        $("#main_page").hide();
        initMap(airport.latitude, airport.longitude, 'restaurant');
    }
    function emptyMap(){
        $("#map").empty();
        $("#places_item").empty();
    }
    function addPlaceToPlacesDiv(place){    
        var open, rate, price;
        if(place.opening_hours == null){
            open = "NA";
        } else {
            if(place.opening_hours["open_now"]){
            open = "Yes";
            } else {
                open = "No";
            }
        }
        if(place.rating == null){
            rate = "NA";
        } else {
            rate = place.rating;
        }
        if(place.price_level == null){
            price = "NA";
        } else {
            price = place.price_level;
        }
       $("#places_item").append("<div class = 'restaurantObject' data-price =" + price + " data-rate = " + rate + " data-open = " + open + " data-name = " + place.name + " > <div class = 'name placeObject'>" + place.name + " </div> <div class = 'price placeObject' >  " + price + " </div> <div class = 'rate placeObject'>" + rate+ " </div><div class = 'open placeObject'>" + open + " </div> </div");
       // $("#places_item").append("<div data-price =" + place.price_level + " data-rate = " + place.rating + " data-open = " + open + " class='place'>" + place.name + "</div>");
    }

//sort restaurants
    // $(".pheader").click(function(){
    //     $(this).style
    // });

    var restaurants = document.getElementsByClassName("restaurantObject");
    //var names = restaurants.children("name");
    function sortByName(){
        var array = Array.prototype.slice.call(restaurants, 0);
        array.sort(function(a,b){
            var c = $(a).attr("data-name");
            var d = $(b).attr("data-name");
            if(c < d){
                return -1;
            }
            if(c > d){
                return 1;
            }
            return 0;
        });
        $(array).detach().appendTo("#places_item");
    }
    function sortByPrice(){
        var array = Array.prototype.slice.call(restaurants, 0);
        array.sort(function(a,b){
            var c = $(a).attr("data-price");
            var d = $(b).attr("data-price");
            if(c < d){
                return -1;
            }
            if(c > d){
                return 1;
            }
            return 0;
        });
        $(array).detach().appendTo("#places_item");
    }
    function sortByRating(){
        var array = Array.prototype.slice.call(restaurants, 0);
        array.sort(function(a,b){
            var c = $(a).attr("data-rate");
            var d = $(b).attr("data-rate");
            if(c > d){
                return -1;
            }
            if(c < d){
                return 1;
            }
            return 0;
        });
        $(array).detach().appendTo("#places_item");
    }
    function sortByOpen(){
        var array = Array.prototype.slice.call(restaurants, 0);
        array.sort(function(a,b){
            var c = $(a).attr("data-open");
            var d = $(b).attr("data-open");
            if(c > d){
                return -1;
            }
            if(c < d){
                return 1;
            }
            return 0;
        });
        $(array).detach().appendTo("#places_item");
    }


    $("#p1").click(function(){
       sortByName();
    });
    $("#p2").click(function(){
        sortByPrice();
     });
    $("#p3").click(function(){
         sortByRating();
    });
    $("#p4").click(function(){
        sortByOpen();
    });
    
});//onload
			
