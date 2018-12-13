"use strict";
var url = "http://comp426.cs.unc.edu:3001";
document.addEventListener("DOMContentLoaded", function (event) {
    var map;
    var infoWindow;
    var airports = {};
    var flightInstances = [];
    var toggle = false;
    var restaurantPlaces = [];
    var clicked = false;
    var gettingCurrentLocation = false;
    var url = "http://comp426.cs.unc.edu:3001";

    login("nholroyd2", "tarheels");
    getAllInstances();

    //getUpComingFlights(6);
    //getTickets();
    //getDepartureFlights();

    $("#login_form").submit(function (e){
		var name = $("#login_form")[0].username.value;
		var pass = $("#login_form")[0].password.value;
        login(name, pass);
		e.preventDefault();
	});
    
    $("#departureInput").on('keyup', function(){
        filterFunction2();
    });
    $("#arrivalInput").on('keyup', function(){
        filterFunction3();
    });
    $("#myInput").on('keyup', function(){
        filterFunction(); 
    });

//----------------------------- Click Functions -------------------------------------
    
    $(document).on("click", ".departureAirport", function(){
        var airport_div = $(this);
        var id = airport_div[0].innerHTML;
        var airport = airports[id];
        showAirport(airport);

    });
    $(document).on("click", ".arrivalAirport", function(){
        var airport_div = $(this);
        var id = airport_div[0].innerHTML;
        var airport = airports[id];
        showAirport(airport);
    });
    
    $(document).on("click", ".airport", function(){
        var airport_div = $(this);
        var id = airport_div[0].innerHTML;
        var airport = airports[id];
        showAirport(airport);
        $(".dropdown-content").hide();
    });
    
    $(document).on("click", ".airport2", function(){
        var airport_div = $(this);
        var name = airport_div[0].innerHTML;
        $("#arrivalInput").val(name);
        $(".dropArrivals").hide();
    });
    
    $(document).on("click", ".airport1", function(){
        var airport_div = $(this);
        var name = airport_div[0].innerHTML;
        $("#departureInput").val(name);
        $(".dropDepartures").hide();
    });
    
    $(document).on('click', "#findFlightButton", function(){
        var departAirport = $("#departureInput").val();
        var arriveAiport = $("#arrivalInput").val();
        var arrivalPort = airports[arriveAiport];
        var departPort = airports[departAirport];
        getExistingFlights(departPort, arrivalPort);
        removeAvailableFlights();
        removeNoFlights();
    });
    
    $(document).on('click', "#departure", function(){
        $(".dropDepartures").show();
    });
    
    $("#departureInput").focusin(function(e){
       $(".dropDepartures").show();
        e.stopPropagation();
    });
    
    $("#departureInput").click(function(e){
        e.stopPropagation();
    });
    
    $("#arrivalInput").focusin(function(e){
       $(".dropArrivals").show();
        e.stopPropagation();
    });
    
    $("#arrivalInput").click(function(e){
        e.stopPropagation();
    });
    
    $(".searchbar").focusin(function(e){
       $(".dropdown-content").show();
        e.stopPropagation();
    });
    
    $(".searchbar").click(function(e){
        e.stopPropagation();
    });
    
    $(document).click(function(){
        $(".dropdown-content").hide();
        $(".dropArrivals").hide();
        $(".dropDepartures").hide();
    });
    
    $(document).on('click', ".flightInstance", function(){
        var flight = $(this);
        postToTickets(parseInt(flight[0].id));
    });
    
    $("#myairport").click(function (e){
        $(".map_stuff").show();
        $("#main_page").hide();
        $("#tickets").hide();
        $("#mapheader").html("Airports Near Me");
        emptyMap();
        tearDownMyLocationPage();
        tearDownMyTicketsPage();
        tearDownAirportsPage();
        getCurrentLocation();
    });
    
    $("#mytickets").click(function(){
        $(".map_stuff").hide();
        $("#main_page").hide();
        $("#tickets").show();
        tearDownMyLocationPage();
        tearDownMyTicketsPage();
        tearDownAirportsPage();
        getTickets();
    });
    
    $("#home").click(function (e){
        emptyMap();
        $(".map_stuff").hide();
        $("#main_page").show();
        $("#tickets").hide();
        tearDownMyLocationPage();
        tearDownMyTicketsPage();
        tearDownAirportsPage();
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
    
    function getDepartures(currentTime, time){
        $.ajax({
		  url: url + "/flights?filter[departs_at_lt]="+time+"&filter[departs_at_gt]="+currentTime,
		  type: "GET",
		  xhrFields: {withCredentials: true},
		  success: function(data, status, xhr){
              //populateDepartures(data);
		  },
		  error: function(XMLHttpRequest,textStatus, errorThrown) {
			console.log(errorThrown);
		  }
	   });
    }

    function getTickets(){
        var i = 1;
        $.ajax({
            url: url + "/tickets?filter[first_name_like]= nholroyd & filter[last_name_like] = Holroyd",
            type: "GET",
		  xhrFields: {withCredentials: true},
		  success: function(data, status, xhr){
            data.forEach(element => {
                $("#myCurrentFlights").append("<div id = " + i + " class = 'tix'></div>")
                var thisTicket = $("#myCurrentFlights").children("#" + i);
                getInstance(element.instance_id, thisTicket);
                i++;
            });
              //getInstance(data[0].instance_id);
              // for each element create div, class = ticket dissplay flex, row

              //populateDepartures(data);
		  },
		  error: function(XMLHttpRequest,textStatus, errorThrown) {
			console.log(errorThrown);
		  }
	   });
    }

    function getInstance(id, ticket){
        $.ajax({
            url: url + "/instances/" + id,
            type: "GET",
		  xhrFields: {withCredentials: true},
		  success: function(data, status, xhr){
              getFlight(data.flight_id,ticket);
              var d = new Date(data.date);
              ticket.append("<div class = 'date'>" + data.date + "</div>");
		  },
		  error: function(XMLHttpRequest,textStatus, errorThrown) {
			console.log(errorThrown);
		  }
        });
    }
    
    function getInstanceOfFlight(flight, departPort, arrivalPort){
        $.ajax({
            url: url + "/instances/?filter[flight_id]=" + flight.id,
            type: "GET",
		  xhrFields: {withCredentials: true},
		  success: function(data, status, xhr){
              data.forEach(instance => {
                  addtoAvailableFlights(flight, instance, departPort, arrivalPort);
              });
		  },
		  error: function(XMLHttpRequest,textStatus, errorThrown) {
			console.log(errorThrown);
		  }
        });
    }

    function getFlight(id, ticket){
        $.ajax({
            url: url + "/flights/" + id,
            type: "GET",
		  xhrFields: {withCredentials: true},
		  success: function(data, status, xhr){
              //.ticket append arrivalid and departure id
              //make em divs or a 
              
              getAirport(data.arrival_id, ticket, "departure");
              getAirport(data.departure_id, ticket, "arrival");
              var t = new Date(data.departs_at);
              var mins = t.getMinutes();
              if(t.getMinutes() < 10){
                  mins = "0"+t.getMinutes();
              }
              ticket.append("<div class = 'time'>" + t.getHours() + ":" + mins + " </div>");
		  },
		  error: function(XMLHttpRequest,textStatus, errorThrown) {
			console.log(errorThrown);
		  }
        });
    }

    function getAirport(id, ticket, state){
        $.ajax({
            url: url + "/airports/" + id,
            type: "GET",
		  xhrFields: {withCredentials: true},
		  success: function(data, status, xhr){
                //append another a or div to .ticket with airport name
                if(state == "arrival"){
                    ticket.append("<div class = 'arrivalAirport arrival'>" + data.name + "</div>");
                }
                if(state == "departure"){
                    ticket.append("<div class = 'departureAirport departure'>" + data.name + "</div>");
                }
		  },
		  error: function(XMLHttpRequest,textStatus, errorThrown) {
			console.log(errorThrown);
		  }
        });
    }
    
    function getAllInstances(){
        $.ajax({
            url: url + "/instances",
            type: "GET",
		  xhrFields: {withCredentials: true},
		  success: function(data, status, xhr){
              flightInstances = data.slice(0, 100);
              setInterval(cancelRandomFlight, 1800000);
		  },
		  error: function(XMLHttpRequest,textStatus, errorThrown) {
			console.log(errorThrown);
		  }
        });
    }
    function cancelFlight(id){
        $.ajax({
            url: url + "/instances/"+id,
            type: "PUT",
            xhrFields: {withCredentials: true},
            data: {
                "instance": {
                    "is_cancelled": true
                }
            },
            success: function(data, status, xhr){
                console.log("Flight " + id + "has been cancelled");
		  },
		  error: function(XMLHttpRequest,textStatus, errorThrown) {
			console.log(errorThrown);
            console.log(XMLHttpRequest);
		  }
        });
    }
    function addNewAirport(airport){

        $.ajax({
            url: url + "/airports",
            type: "POST",
            xhrFields: {withCredentials: true},
            data: {
                "airport": {
                    "name": airport.name,
                    "code": "manual",
                    "latitude": airport.geometry.location.lat(),
                    "longitude": airport.geometry.location.lng()
                }
            },
            success: function(data, status, xhr){
                console.log("airport added");
                emptyDropArrivals();
                emptyDropDepartures();
                emptyDropDownContent();
                resetAirports();
                loadAirports();
            },
            error: function(XMHttpRequest, textStatus, errorThrown){
                console.log(errorThrown);
                console.log(XMLHttpRequest);
            }
        });
    }
    function postToTickets(id){
        $.ajax({
            url: url + "/tickets",
            type: "POST",
            xhrFields: {withCredentials: true},
            data:{ 
                "ticket": {
                    "first_name": "nholroyd2",
                    "last_name":    "Holroyd",
                    "age":          21,
                    "gender":       "female",
                    "is_purchased": true,
                    "instance_id":  id
                }
            },
            success: function(data, status, xhr){
                console.log("ticket");
                emptyCurrentFlights();
                getTickets();
            },
            error: function(XMLHttpRequest,textStatus, errorThrown){
                console.log(errorThrown);
            }
        });
    }
    
    function getExistingFlights(d, a){
        var i = 1;
        $.ajax({
            url: url + "/flights?filter[departure_id]=" + d.id + "&filter[arrival_id]=" + a.id,
            type: "GET",
            xhrFields: {withCredentials: true},
            success: function(data, status, xhr){
                if (data.length > 0){
                    console.log("flight exists!");
                    data.forEach(flight => {
                        getInstanceOfFlight(flight, d, a);
                    });
                }else{
                    $("#availableFlights").append("<div class = 'noflights'>No Flights Found</div>"); 
                }
            },
            error: function(XMLHttpRequest,textStatus, errorThrown) {
                console.log(errorThrown);
		    }
        });
    }
    

//--------------------------------------JS Functions-----------------------------------------//
    function cancelRandomFlight(){
        console.log(flightInstances);
        var index = Math.floor(Math.random()*flightInstances.length + 1);
        var flightInstance = flightInstances[index];
        cancelFlight(flightInstance.id, flightInstance);
    }
    function getUpComingFlights(hour){
        var time = getNextHour(hour);
        getDepartures(getCurrentTime(), time);
    }
    function getCurrentTime(){
        var d = new Date();
        var hour = d.getHours();
        var min = d.getMinutes();
        return hour + ":" + min;
    }
    function getNextHour(hour){
        var d = new Date();
        //add  hours
        d.addHours(hour);
        var hour = d.getHours();
        var min = d.getMinutes();
        var time = hour + ":" + min;
        return time;
    }
    function makePage(){
        $("#login_box").hide();
        $("#main_box").show();
        loadAirports();
        //initMap();
    }
    function initMap(lat, lon, type) {
        var myLatLng = new google.maps.LatLng(lat, lon);
        gettingCurrentLocation = false;
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
    
    function searchClosest(map, myLatLng, type){
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
            location: myLatLng,
            rankBy: google.maps.places.RankBy.DISTANCE,
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
        gettingCurrentLocation = true;
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
                searchClosest(map, pos, "airport");
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
            //if ()
            for (var i = 0; i < results.length; i++) {
                restaurantPlaces[i]= results[i];
                var place = results[i];
                if (gettingCurrentLocation && airports[place.name] == null){
                    addNewAirport(place);
                }
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
             //console.log(airport);
        
             $(".dropDepartures").append("<a class='airport1'>" + airport.name + "</a>");
             $(".dropArrivals").append("<a class='airport2'>" + airport.name + "</a>");
             $(".dropdown-content").append("<a class='airport'>" + airport.name + "</a>");
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
    function filterFunction2(){
        var input, filter, ul, li, a, i;
        input = document.getElementById("departureInput");
        filter = input.value.toUpperCase();
        var div = document.getElementById("dropdown_box2");
        a = div.getElementsByTagName("a");
        for (i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                a[i].style.display = "";
            } else {
                a[i].style.display = "none";
            }
        }
    }
    function filterFunction3(){
        var input, filter, ul, li, a, i;
        input = document.getElementById("arrivalInput");
        filter = input.value.toUpperCase();
        var div = document.getElementById("dropdown_box3");
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
        tearDownMyTicketsPage();
        $("#mapheader").html(airport.name);
        initMap(airport.latitude, airport.longitude, 'restaurant');
    }
    function resetAirports(){
        airports = {};
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
    }

    function addtoAvailableFlights(flight, instance, departPort, arrivalPort){
        $("#availableFlights").append("<div id = '" + instance.id + "' class = 'flightInstance'></div>");
        var instanceDiv = $("#"+instance.id)[0];
    
        $("#"+instance.id).append("<div class='tix_date'>" + instance.date + "</div>");
        $("#"+instance.id).append("<div class='tix_dt'>" + flight.departs_at.substring(11,16) + "</div>");
        $("#"+instance.id).append("<div class='tix_df'>" + departPort.name + "</div>");
        $("#"+instance.id).append("<div class='tix_at'>" + flight.arrives_at.substring(11,16) + "</div>");
        $("#"+instance.id).append("<div class='tix_ato'>" + arrivalPort.name + "</div>");
    }   

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


    $("#name").click(function(){
       sortByName();
    });
    $("#price").click(function(){
        sortByPrice();
     });
    $("#rate").click(function(){
         sortByRating();
    });
    $("#open").click(function(){
        sortByOpen();
    });

//------------------------breaking apart doms and rebuilding ---------------------------//
    function emptyDropDepartures(){
        $(".dropDepartures").empty();
    }
    
    function emptyDropArrivals(){
        $(".dropArrivals").empty();
    }
    function emptyDropDownContent(){
        $(".dropdown-content").empty();
    }
    
    function removeAvailableFlights(){
        $(".flightInstance").remove();
    }
    
    function resetInputFields(){
        $("#departureInput").val('');
        $("#arrivalInput").val('');
    }
    
    function resetMainSearchInput(){
        $(".searchbar").val('');
    }
    
    function emptyCurrentFlights(){
        $("#myCurrentFlights").empty();
    }
    
    function removeNoFlights(){
        $(".noflights").remove();
    }
    
    function tearDownMyLocationPage(){
        
    }
    
    function tearDownMyTicketsPage(){
        removeAvailableFlights();
        emptyCurrentFlights();
        resetInputFields();
        removeNoFlights();
    }
    
    function tearDownAirportsPage(){
         
    }
    
});//onload
			
