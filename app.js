(function() {
    var morphSearch = document.getElementById( 'morphsearch' ),
        input = morphSearch.querySelector( 'input.morphsearch-input' ),
        ctrlClose = morphSearch.querySelector( 'span.morphsearch-close' ),
        isOpen = isAnimating = false,
        // show/hide search area
        toggleSearch = function(evt) {
            // return if open and the input gets focused
            if( evt.type.toLowerCase() === 'focus' && isOpen ) return false;

            var offsets = morphsearch.getBoundingClientRect();
            if( isOpen ) {
                classie.remove( morphSearch, 'open' );

                // trick to hide input text once the search overlay closes 
                // todo: hardcoded times, should be done after transition ends
                if( input.value !== '' ) {
                    setTimeout(function() {
                        classie.add( morphSearch, 'hideInput' );
                        setTimeout(function() {
                            classie.remove( morphSearch, 'hideInput' );
                            input.value = '';
                        }, 300 );
                    }, 500);
                }

                input.blur();
            }
            else {
                classie.add( morphSearch, 'open' );
            }
            isOpen = !isOpen;
        };

    // events
    input.addEventListener( 'focus', toggleSearch );
    ctrlClose.addEventListener( 'click', toggleSearch );
    // esc key closes search overlay
    // keyboard navigation events
    document.addEventListener( 'keydown', function( ev ) {
        var keyCode = ev.keyCode || ev.which;
        if( keyCode === 27 && isOpen ) {
            toggleSearch(ev);
        }
    } );
    
    //AngularJS Stuff
    var app = angular.module('movieApp',['ngSanitize']);
    
    app.controller('SearchController',['$http',function($http){
        var that = this;
        that.resultFound = true;
        that.imdbrating = false;
        that.wonOscar = false;
        this.search = function(){
            $http.get('http://www.omdbapi.com/?t='+this.query).success(function(data){
                //alert(JSON.stringify(data));
                if(!data.Title){
                    that.wonOscar = false;
                    that.imdbrating = false;
                    that.resultFound = false;
                }else{
                    that.resultFound = true;
                    var myrating = 0;
                    that.myawards = 0;
                    that.mycrtics = 0;
                    
                    that.title = data.Title;
                    
                    //1 - Is the title a sequel? >>> Not really reliant, not every sequel has '2', or '3', etc.
                    if(data.Title.indexOf(" 2 ") > -1 || data.Title.indexOf(" 3 ") > -1){
                        myrating += 20;
                        //alert("Sequel Points - "+myrating);
                    }
                    
                    if(data.Year!="N/A"){
                        that.year = "(" + data.Year + ")";
                    }else{
                        that.year = "";
                    }
                    
                    
                    //2 - How many years have passed since the movie has been released?
                    var d = new Date();
                    var n = d.getFullYear();
                    myrating -= ((n - parseInt(data.Year))*0.2);
                    //alert("Years - "+myrating);
                    //alert(myrating);
                    
                    if(data.Rated!="N/A"){
                        that.rated = data.Rated;
                        
                        /*
                        //Set Colors
                        if(data.Rated=="R"){
                            $('#rated').css('color','orange');
                        }else if(data.Rated=="PG-13"){
                            $('#rated').css('color','green');
                        }else if(data.Rated=="PG"){
                            $('#rated').css('color','yellow'); 
                        }else if(data.Rated=="G"){
                            $('#rated').css('color','green');
                        }else if(data.Rated=="NC-17"){
                            $('#rated').css('color','red');
                        }
                        */
                        
                    }else{
                        that.rated = "Not Rated";
                    }
                    
                    if(data.Runtime!="N/A"){
                        that.runtime = data.Runtime;
                    }else{
                        that.runtime = "No Runtime";
                    }
                    
                    if(data.Released!="N/A"){
                        that.released = data.Released;
                    }else{
                        that.released = "No Released Date";
                    }
                    
                    if(data.Genre!="N/A"){
                        that.genre = data.Genre;
                    }else{
                        that.genre = "No Genre";
                    }
                    
                    if(data.Director!="N/A"){
                        that.director = data.Director;
                    }else{
                        that.director= "No Director";
                    }
                    
                    if(data.Writer!="N/A"){
                        that.writer = data.Writer;
                    }else{
                        that.writer= "No Writer";
                    }
                    
                    if(data.Plot!="N/A"){
                        that.plot = data.Plot;
                    }else{
                        that.plot= "No Plot";
                    }
                    
                    if(data.Awards!="N/A"){
                        
                        //Algorithm to  boldify every number in the text.
                        var temp = "";
                        var count,start,j,k = 0;
                        var numberFound = false;
                        var awards = [];
                        for(var i = 0; i < data.Awards.length; i++){
                            if(isNaN(data.Awards.charAt(i)) || data.Awards.charAt(i)===" "){   //Is NOT a number
                                if(numberFound){
                                    temp += "</b>";
                                    numberFound = false;
                                    start = i;
                                    k = i;
                                    //alert(awards[count]);
                                    awards[awards.length] = parseInt(data.Awards.substring(j,k));
                                    //alert(awards[count]);
                                    //alert(parseInt(data.Awards.substring(j,k)));
                                    //count++
                                    //alert(awards);
                                }else{
                                    if(i == data.Awards.length-1){
                                        temp += data.Awards.substring(start,i+1);    
                                    }
                                }
                            }else{
                                if(numberFound){
                                    temp += data.Awards.charAt(i);
                                }else{
                                    temp += (data.Awards.substring(start, i) + "<b>" + data.Awards.charAt(i));
                                    numberFound = true;
                                    j = i;
                                }         
                            }
                        }
                        
                        that.awards = temp;
                        //alert(that.awards);
                        if(data.Awards.indexOf("Oscar") > -1){
                            //alert("Won Oscar");
                            that.wonOscar = true;
                            $('#awards').css('top','15px');
                            myrating += (50 * awards[0]);
                            //alert(50 * awards[0]);
                            //alert("Oscar Points - "+myrating);
                        }else{
                            //alert("Didn't Win Oscar");
                            that.wonOscar = false;
                            $('#awards').css('top','0px');
                        }
                        
                        //3 - How many awards? Oscars are worth significantly more.
                        if(awards.length==3){   //Has won bafta, golden globe, oscar
                            if(data.Awards.indexOf("BAFTA") > -1){
                                myrating += (40 * awards[0]);
                            }else if(data.Awards.indexOf("Golden Globe") > -1){
                                myrating += (40 * awards[0]);
                            }
                            myrating += ((awards[1]+awards[2])*0.5);
                            that.myawards = (50 * awards[0])+((awards[1]+awards[2])*0.5);
                            //alert((awards[1]+awards[2])*10);
                        }else if(awards.length==2){  //has gotten wins for noms only
                            if(data.Awards.indexOf("BAFTA") > -1){
                                myrating += (40 * awards[0]);
                            }else if(data.Awards.indexOf("Golden Globe") > -1){
                                myrating += (40 * awards[0]);
                            }
                            
                            myrating += ((awards[0]+awards[1])*0.5);
                            that.myawards = ((awards[0]+awards[1])*0.5);
                        }else{
                            
                            if(data.Awards.indexOf("BAFTA") > -1){
                                myrating += (40 * awards[0]);
                            }else if(data.Awards.indexOf("Golden Globe") > -1){
                                myrating += (40 * awards[0]);
                            }
                            myrating += (awards[0]*0.5);
                        }
                        //alert(awards);
                        
                        
                    }else{
                        that.awards= "";
                        that.wonOscar = false;
                        
                    }
                    
                    if(data.Actors!="N/A"){
                        that.actors = data.Actors;
                    }else{
                        that.actors= "No Actors";
                    }
                    
                    if(data.Country!="N/A"){
                        that.country = data.Country;
                    }else{
                        that.country= "No Country";
                    }
                    var mcr = -30;
                    if(data.Metascore!="N/A"){
                        that.metascore = data.Metascore;
                        mcr = parseInt(data.Metascore); 
                        $('#mc-area').show();
                        $('#imdb-area').css('padding-left','20px');
                        
                        if(parseInt(data.Metascore) >= 60){
                            //alert("green");
                            $('#metascore').css('background-color','#6c3');
                        }else if(parseInt(data.Metascore) >= 40){
                            //alert("yellow");
                            $('#metascore').css('background-color','#fc3');
                        }else{
                            //alert("red");
                            $('#metascore').css('background-color','#f00');
                        }
                        
                        
                    }else{
                        that.metascore= false;
                        $('#mc-area').hide();
                        $('#imdb-area').css('padding-left','0px');
                    }
                    
                    var imdbr = -90;
                    if(data.imdbRating!="N/A"){
                        that.imdbrating = data.imdbRating;
                        imdbr = parseInt(data.imdbRating)*10;
                    }else{
                        that.imdbrating= false;
                    }
                    
                    //4 - Critics Ratings. Metascores are worth a little less.
                    myrating += (((imdbr * 0.75) + (mcr * 0.25))*1.5);
                    that.mycrtics = (((imdbr * 0.75) + (mcr * 0.25))*1.5);
                    //alert(imdbr);
                    //alert(mcr);
                    //alert((imdbr * 0.6) + (mcr * 0.4));
                    //alert("My Rating: "+Math.ceil(myrating));
                    that.myrating = Math.ceil(myrating);
                    $('.odometer').html(Math.ceil(myrating));
                    
                    //Description of Rating
                    var ev = Math.ceil(myrating);
                    if(ev >= 250){
                        that.evexplain = "WATCH IT. Period. The perfect balance between entertainment and value. A masterful film that is guaranteed to be talked and watched over and over again throughout history."
                    }else if(ev >= 200){
                        that.evexplain = "AWESOME. Great balance between entertainment and value. Oustanding film that you'll love.";
                    }else if(ev >= 150){
                        that.evexplain = "ENTERTAINING. Pretty good movie overall but not much depth and value.";
                    }else if(ev >= 50){
                        that.evexplain = "IT'S AIGHT. There's no reason not to watch it, but there's also no reason to watch it either.";
                    }else{
                        that.evexplain = "TERRIBLE. Just avoid it at all costs!"
                    }
                    
                    if(data.Poster!="N/A"){
                        that.noPosterFound = false;
                        //that.poster = data.Poster;
                        $('#poster').attr("src",data.Poster);
                        /*
                        var poster = document.getElementById('poster');
                        poster.onload = function () {
                            $('#poster-area').width(poster.naturalWidth);    	
                        };
                        */
                        
                    }else{
                        that.noPosterFound = true;
                    }
                    $('#critics-area').css('border-top','1px solid #d0d1d5');
                    
                    that.query = "";
                }
                
            });
            
        }
    }]);


    /***** for demo purposes only: don't allow to submit the form *****/
    //morphSearch.querySelector( 'button[type="submit"]' ).addEventListener( 'click', function(ev) { ev.preventDefault(); } );
})();