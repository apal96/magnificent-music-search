var lastFMToken = "2b80e0b10a244c16881596344e29cbc1";
var lastFMURL = "https://ws.audioscrobbler.com/2.0/?method=";
var musicBrainzUrl = " https://musicbrainz.org/ws/2/artist/?query="

var bandNameEl = $(".band-name");
var artistInfoEl = $(".band-info")
console.log(artistInfoEl)
var artistBioEl = $(".bio");
var relatedArtistsEl = $("#related-artists");
var artistImageEl = $("#artist-image");
var similarArtistsEl = $("#similar-artists");
var artistTracksEl = $(".tracks-list");
var albumInfoEl = $("#album-info");
var savedSearchesEl = $("#saved-searches");
var searchInputEl = $("#search-input-text");
var similarSearchesEl = $(".search-similar");
var searchHistoryEl = $(".search-history");
var searchButtonEl = $(".sh-search-btn");
var modalEL = $(".modalEl");
var modalCloseEl = $(".modal-close")
var searchFormEl = $("#search-form");
var defaultArtistToSearchFor = "Nirvana";

var savedSearches = [];

// Create a URL to fetch data from LastFM
// method is the value for the LastFM method paramerer
// artist is the value for the LastFM artist parameter (can be undefined if it is not needed)
// track is the value for the LastFM track parameter (can be undefined if it is not needed)
// album is the value for the LastFM album parameter (can be undefined if it is not needed)
function createLastFMURL(method, artist, track, album) {
    var queryURL = lastFMURL + method;
    queryURL += "&api_key=" + lastFMToken;

    if (artist) {
        queryURL += "&artist=" + artist;
    }

    if (track) {
        queryURL += "&track=" + track;
    }

    if (album) {
        queryURL += "&album=" + album;
    }
    queryURL += "&format=json";
    queryURL = encodeURI(queryURL);
    console.log("Last FM URL: " + queryURL);
    return queryURL;
}

// Get information about a song and output the info in an element with ID song-info
function getSongInformation(songName, songArtist) {
    if (!songName || !songArtist) {
        // Song name and artist must be filled into to perform the query
        return;
    }

    fetch(createLastFMURL("track.getInfo", songArtist, songName)).then(function(response) {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(response.statusText);
        }
    }
    ).then(function (data) {
        console.log(data);
        // Check that the API provides a summary
        if (data.track.wiki && data.track.wiki.summary) {
            var trackInfo = data.track.wiki.summary;
            // Escape ' and ] in the songName so they are not interpreted as part of the CSS selector
            var escapedSongName = songName.replace(/'/g, "\\'");
            escapedSongName = escapedSongName.replace(/]/g, "\\]");
            $("[data-summary-for='" + escapedSongName + "']").html(trackInfo);
        } else {
            console.log("Last FM did not provide a summary for " + songName + " by " + songArtist);
        }
      }
    ).catch(function (error) {
        console.log(error);
    });
}

// Get information about an artist
function getArtistInformation(artist) {
    if (!artist) {
        // artist must be provided
        return;
    }
    
    fetch(createLastFMURL("artist.getInfo", artist, undefined)).then(function(response) {
        if (response.ok) {
            return response.json();
        } else {
            artistBioEl.html("Artist not found");
            throw new Error(response.statusText);
        }
    }
    ).then(function (data) {
        console.log(data);
        var artistBio = data.artist.bio.summary;
        artistBioEl.html(artistBio);

        // Clear any previously displayed information
        relatedArtistsEl.empty();
        // Show up to 3 related artists
        for (var idx = 0; (idx < data.artist.similar.artist.length) && (idx < 3); idx++) {
            var similarArtistEl = $('<button>');
            similarArtistEl.addClass("w-100 bg-washed-blue link dim black mw5 dt hide-child ba b--black-20 pa1 br2 pointer center");
            similarArtistEl.text(data.artist.similar.artist[idx].name);
            // Add a data attribute with the search value
            similarArtistEl.attr("data-search-val", data.artist.similar.artist[idx].name);
            relatedArtistsEl.append(similarArtistEl);
        }

        if (data.artist.similar.artist.length > 0) {
            similarSearchesEl.show();
        } else {
            similarSearchesEl.hide();
        }

        // Show the last image
        if (data.artist.image.length) {
            artistImageEl.attr("src", data.artist.image[data.artist.image.length - 1]["#text"]);
            artistImageEl.attr("alt", "picture of " + artist);
        } else {
            // Show the default image
            artistImageEl.attr("src", "./assets/img/cool-band.jpg");
            artistImageEl.attr("alt", "default picture");
        }
      }
    ).catch(function (error) {
        console.log(error);
    });
}

// Get information about similar artists
function getSimilarArtists(artist) {
    if (!artist) {
        // artist must be provided
        return;
    }
    
    fetch(createLastFMURL("artist.getSimilar", artist, undefined)).then(function(response) {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(response.statusText);
        }
    }
    ).then(function (data) {
        console.log(data);
        similarArtistsEl.empty();
        // Limit the display to 10 similar artists
        for (var idx = 0; (idx < data.similarartists.artist.length) && (idx < 10); idx++) {
            var similarArtistToDisplayEl = $('<div>');
            similarArtistToDisplayEl.text(data.similarartists.artist[idx].name);

            if (data.similarartists.artist[idx].image.length) {
                // Show the last image
                var artistImageEl = $("<img>");
                artistImageEl.attr("src", data.similarartists.artist[idx].image[data.similarartists.artist[idx].image.length - 1]["#text"]);
                artistImageEl.attr("alt", "picture of " + data.similarartists.artist[idx].name);
                similarArtistToDisplayEl.append(artistImageEl);
            }
            similarArtistsEl.append(similarArtistToDisplayEl);
        }
      }
    ).catch(function (error) {
        console.log(error);
    });
}

// Get tracks for the artist
function getTracksForArtist(artist) {
    if (!artist) {
        // artist must be provided
        return;
    }
    
    fetch(createLastFMURL("artist.gettoptracks", artist, undefined)).then(function(response) {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(response.statusText);
        }
    }
    ).then(function (data) {
        console.log(data);
        // Clear any previously displayed information
        artistTracksEl.empty();
        // Show the top tracks
        // Limit the display to 5 top tracks
        for (var idx = 0; (idx < data.toptracks.track.length) && (idx < 5); idx++) {
            var trackEl = $('<div>');
            trackEl.addClass("ma4-ns ba pa3 b--silver");
            var trackElName = $('<h4>')
            // Div to fill in summary info for the song when it is received from the API 
            var trackSummaryEl = $('<div>')
            trackSummaryEl.attr("data-summary-for", data.toptracks.track[idx].name);
            // Div to fill in similar songs when it is received from the API
            var similarSongsEl = $('<ul>')
            similarSongsEl.attr("data-similar-songs-to", data.toptracks.track[idx].name);
            similarSongsEl.addClass("list");
            trackElName.text(data.toptracks.track[idx].name);
            trackEl.append(trackElName);
            trackEl.append(trackSummaryEl);
            var similarSongsDescEl = $('<h5>');
            // Don't show the header until it is known there are similar songs
            similarSongsDescEl.addClass("dn");
            similarSongsDescEl.attr("data-similar-songs-to-header", data.toptracks.track[idx].name);
            similarSongsDescEl.text("Similar Songs");
            trackEl.append(similarSongsDescEl);
            trackEl.append(similarSongsEl);
            artistTracksEl.append(trackEl);
            // Show information about the song
            getSongInformation(data.toptracks.track[idx].name, artist);
            // Show similar songs
            getSimilarSongs(data.toptracks.track[idx].name, artist);
        }
      }
    ).catch(function (error) {
        console.log(error);
    });
}

// Get similar songs for a song
function getSimilarSongs(songName, songArtist) {
    if (!songName || !songArtist) {
        // Song name and artist must be filled in to perform the query
        return;
    }
    
    fetch(createLastFMURL("track.getSimilar", songArtist, songName)).then(function(response) {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(response.statusText);
        }
    }
    ).then(function (data) {
        console.log(data);
        // Check if similar tracks were provided
        if (data.similartracks) {
            // Only show 3 similar tracks
            // Escape ' and ] in the songName so they are not interpreted as part of the CSS selector
            var escapedSongName = songName.replace(/'/g, "\\'");
            escapedSongName = escapedSongName.replace(/]/g, "\\]");
            for (var idx = 0; idx < data.similartracks.track.length && (idx < 3); idx++) {

                var parentElem = $("[data-similar-songs-to='" + escapedSongName + "']");
                parentElem = parentElem.append("<li>");
                // left align
                parentElem.addClass("tl");
                var similarSongNameEl = $('<span>');
                similarSongNameEl.text(data.similartracks.track[idx].name);
                var similarSongArtistEl = $('<span>');
                similarSongArtistEl.addClass("underline dark-blue pointer similar-song-artist");
                similarSongArtistEl.text(data.similartracks.track[idx].artist.name);
                similarSongArtistEl.attr("data-search-val", data.similartracks.track[idx].artist.name);
                parentElem.append(similarSongNameEl);
                parentElem.append($('<span>,&nbsp</span>'));
                parentElem.append(similarSongArtistEl);
            }
            if (data.similartracks.track.length === 0) {
                console.log("No similar tracks found for: " + songName);
            } else {
                // Display the similar songs header
                var elem = $("[data-similar-songs-to-header='" + escapedSongName + "']");
                elem.removeClass("dn");
            }
        }
      }
    ).catch(function (error) {
        console.log(error);
    });
}

// Get albums for the artist
function getAlbumsForArtist(artist) {
    if (!artist) {
        // artist must be provided
        return;
    }
    
    fetch(createLastFMURL("artist.gettopalbums", artist, undefined)).then(function(response) {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(response.statusText);
        }
    }
    ).then(function (data) {
        console.log(data);
        // Clear any previously displayed information
        albumInfoEl.empty();
        // Show the top albums
        // Limit the display to 5 top albums
        var numAlbums = 0;
        for (var idx = 0; (idx < data.topalbums.album.length) && (numAlbums < 5); idx++) {
            // Album will be a section like:
            //   <section class="album-card flex">
            // Ignore null album names
            if (data.topalbums.album[idx].name !== "(null)") {
                var albumEl = $('<section>');
                albumEl.addClass("album-card flex flex-column flex-row-ns ma4-ns");
                // Add a data attribute for the album name
                albumEl.attr("data-album-info-for", data.topalbums.album[idx].name);
                albumInfoEl.append(albumEl);
                // Query the API for the album information
                getAlbumInformation(artist, data.topalbums.album[idx].name);
                numAlbums++;
            }
        }
      }
    ).catch(function (error) {
        console.log(error);
    });
}

// Get the information for an album
function getAlbumInformation(artist, album) {
    if (!artist || !album) {
        // artist and album must be provided
        return;
    }

    fetch(createLastFMURL("album.getinfo", artist, undefined, album)).then(function(response) {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(response.statusText);
        }
    }
    ).then(function (data) {
        console.log(data);
        // Escape ' and ] in the songName so they are not interpreted as part of the CSS selector
        var escapedAlbumName = album.replace(/'/g, "\\'");
        escapedAlbumName = escapedAlbumName.replace(/]/g, "\\]");
        var parentElem = $("[data-album-info-for='" + escapedAlbumName + "']");
        // The data was found so add a border. Do it here so a border doesn't show if the API call for the album fails
        parentElem.addClass("ba b--silver");

        // Add any images
        var albumImageEl = $("<img>");
        albumImageEl.addClass("w-25-ns w-100 h-25 pa3-ns");
        if (data.album.image.length) {
            // Show the last image
            albumImageEl.attr("src", data.album.image[data.album.image.length - 1]["#text"]);
            albumImageEl.attr("alt",  album);
        } else {
            // Use the default image
            albumImageEl.attr("src", "./assets/img/album-img.jpg");
            albumImageEl.attr("alt",  "default image");
        }
        parentElem.append(albumImageEl);

        // Add a summary
        var summaryEl = $('<p>');
        summaryEl.addClass("w-70-ns pa3-ns");

        // Check that the summary is available
        if (data.album && data.album.wiki) {
            var summaryText = data.album.wiki.summary;
            summaryEl.html(summaryText);
        } else {
            console.log("No summary available for " + album);
            // No summary so show the album name
            summaryEl.text(album);
        }
        summaryEl.addClass("album-summary pa3 v-top");
        parentElem.append(summaryEl);

      }
    ).catch(function (error) {
        console.log(error);
    });
}

function initializeSavedSearches() {
    // Initialize the saved searches from local storage
    // Load any saved searches from local storage
    var fromLocalStorage = localStorage.getItem("savedSearches");

    if (fromLocalStorage) {
        savedSearches = JSON.parse(fromLocalStorage);
        // Display the list of cities
        displaySavedSearches();
    }
}

// Display the saved searches
function displaySavedSearches() {
    // Clear what's displayed
    savedSearchesEl.empty();

    for (var idx = 0; idx < savedSearches.length; idx++) {
        // Create button element similar to this element
        // <button class="recent-1 flex w-100 bg-washed-blue">btn 1</button> 
        var searchEl = $("<button>");
        searchEl.addClass("w-100 bg-washed-blue link dim black mw5 dt hide-child ba b--black-20 pa1 br2 pointer center");
        searchEl.text(savedSearches[idx]);
        searchEl.attr("data-search-val", savedSearches[idx]);
        savedSearchesEl.append(searchEl);
    }

    if (savedSearches.length > 0) {
        searchHistoryEl.show();
    } else {
        searchHistoryEl.hide();
    }
}
function getArtistBio(artist){
    artistInfoEl.empty();
    
    var artistUrl = musicBrainzUrl+ artist+"&fmt=json";
    fetch(artistUrl).then(function(response){
        if(response.ok){
        return response.json();}
        else{
            console.log("error with fetch")
        }}).then(function(data){
            console.log(data);
            console.log(data.artists);
            //using 0 index will return the most popular search result
            var artistType = data.artists[0].type;//will return person or group
            var artistCountry = data.artists[0].area.name;//will return country artist is from
            var artistCategory = data.artists[0].disambiguation;//will return short description of artist genre
            var artistName = data.artists[0].name;//will return artist name
            // var artistLifeSpan = data.artists[0].json["life-span"].begin + "-"+data.artists[0].json["life-span"].ended;
            var artistNameEL = $("<p>");
            // var yearsActiveEL = $("<p>");
            var artistGenreEL = $("<p>");
            var artistCountryEL = $("<p>");
            var artistTypeEl = $("<p>");
            // artistNameEL.text(artistName);
            bandNameEl.text(artistName);
            //bandNameEl.attr("h1");
            // yearsActiveEL.text("Years Active " + artistLifeSpan);
            if(!data.artists[0].disambiguation){
                console.log("nothing")
                artistCountryEL.text ("Country: " + artistCountry);
                artistTypeEl.text("Type: " + artistType);
                console.log(artistTypeEl)
                artistInfoEl.append(artistNameEL);
                // artistBioEL.append(yearsActiveEL);
                artistInfoEl.append(artistGenreEL);
                artistInfoEl.append( artistCountryEL);
                artistInfoEl.append(artistTypeEl)
            }else{
            artistGenreEL.text("Genre: "+ artistCategory);
            artistCountryEL.text ("Country: " + artistCountry);
            artistTypeEl.text("Type: " + artistType);
            console.log(artistTypeEl)
            artistInfoEl.append(artistNameEL);
            // artistBioEL.append(yearsActiveEL);
            artistInfoEl.append(artistGenreEL);
            artistInfoEl.append( artistCountryEL);
            artistInfoEl.append(artistTypeEl)
            }
         

            
        })
};

// Perform a search for an artist
function searchForArtist(searchInput) {
    if (!searchInput) {
        // Nothing was entered
        return;
    }

    if (savedSearches.indexOf(searchInput) === -1) {
        // New artist so add it to the search list
        savedSearches.push(searchInput);
        // Keep the list in sorted order
        savedSearches.sort();
        // Save to local storage so previous searches will show when the page is reloaded
        localStorage.setItem("savedSearches", JSON.stringify(savedSearches));

        // Display the list of searches
        displaySavedSearches();
    }

    // Move to the top of the page in case if the page was scrolled down
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

    // Show the bandName
    bandNameEl.text(searchInput);

    // Get the artist information and display it
    getArtistInformation(searchInput);
    // Get the artists albums
    getAlbumsForArtist(searchInput);
    // Get the tracks for the artist
    getTracksForArtist(searchInput);
    getArtistBio(searchInput);
 
}

//add is-active class to modal so it will popup if there 
//is no user input
function validateUserInput(userInput){
    if(!userInput){
        swal("Please enter something to search for");
    }
};


// Handle submit events for the search input
searchFormEl.submit(function(event) {
    event.preventDefault();
    var searchInput = searchInputEl.val();
    validateUserInput(searchInput);

    // Clear the input field's value
    searchInputEl.val("");

    searchForArtist(searchInput);
});

// Function to handle click events on the search buttons
var searchButtonClickHandler = function(event) {
    var clickedButton = $(event.target);
    searchForArtist(clickedButton.attr("data-search-val"));
}

// Add a click listener for the Search Similar
similarSearchesEl.on("click", "button", searchButtonClickHandler);

// Add a click listener for the search history
searchHistoryEl.on("click", "button", searchButtonClickHandler);

// Add a click listener for the artist for similar songs
artistTracksEl.on("click", ".similar-song-artist", searchButtonClickHandler);

// Show any persisted saved searches
initializeSavedSearches();

// Show default artist when the page is started
searchForArtist(defaultArtistToSearchFor);
