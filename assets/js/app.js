var lastFMToken = "2b80e0b10a244c16881596344e29cbc1";
var lastFMURL = "https://ws.audioscrobbler.com/2.0/?method=";

var artistBioEl = $("#artist-bio");
var relatedArtistsEl = $("#related-artists");
var artistImagesEl = $("#artist-images");
var similarArtistsEl = $("#similar-artists");
var artistTracksEl = $("#artist-tracks");

// Create a URL to fetch data from LastFM
// method is the value for the LastFM method paramerer
// artist is the value for the LastFM artist parameter (can be undefined if it is not needed)
// track is the value for the LastFM track parameter (can be undefined if it is not needed)
function createLastFMURL(method, artist, track) {
    var queryURL = lastFMURL + method;
    queryURL += "&api_key=" + lastFMToken;

    if (artist) {
        queryURL += "&artist=" + artist;
    }

    if (track) {
        queryURL += "&track=" + track;
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
    var queryURL = lastFMURL + "track.getInfo";
    queryURL += "&api_key=" + lastFMToken;
    queryURL += "&artist=" + songArtist;
    queryURL += "&track=" + songName;
    queryURL += "&format=json";

    console.log("Doing a fetch for: " + queryURL);
    
    fetch(queryURL).then(function(response) {
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
            $("[data-summary-for='" + songName + "']").html(trackInfo);
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
            throw new Error(response.statusText);
        }
    }
    ).then(function (data) {
        console.log(data);
        var artistBio = data.artist.bio.summary;
        artistBioEl.html(artistBio);
        // Clear any previously displayed information
        relatedArtistsEl.empty();
        // Show the related artists
        for (var idx = 0; idx < data.artist.similar.artist.length; idx++) {
            var similarArtistEl = $('<div>');
            similarArtistEl.text(data.artist.similar.artist[idx].name);
            relatedArtistsEl.append(similarArtistEl);
        }

        // Clear any previous imaged
        artistImagesEl.empty();
        for (var idx = 0; idx < data.artist.image.length; idx++) {
            var artistImageEl = $("<img>");
            artistImageEl.attr("src", data.artist.image[idx]["#text"]);
            artistImageEl.attr("alt", "picture of " + artist);
            artistImagesEl.append(artistImageEl);
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
            for (var idx2 = 0; idx2 < data.similarartists.artist[idx].image.length; idx2++) {
                var artistImageEl = $("<img>");
                artistImageEl.attr("src", data.similarartists.artist[idx].image[idx2]["#text"]);
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
        // Limit the display to 10 top tracks
        for (var idx = 0; (idx < data.toptracks.track.length) && (idx < 10); idx++) {
            var trackEl = $('<div>');
            var trackElName = $('<div>')
            // Set the id to the song name so it can be found when 
            var trackSummaryEl = $('<div>')
            trackSummaryEl.attr("data-summary-for", data.toptracks.track[idx].name);
            trackElName.text(data.toptracks.track[idx].name);
            trackEl.append(trackElName);
            trackEl.append(trackSummaryEl);
            artistTracksEl.append(trackEl);
            getSongInformation(data.toptracks.track[idx].name, artist);
        }
      }
    ).catch(function (error) {
        console.log(error);
    });
}