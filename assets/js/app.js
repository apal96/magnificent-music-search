var lastFMToken = "2b80e0b10a244c16881596344e29cbc1";
var lastFMURL = "https://ws.audioscrobbler.com/2.0/?method=";

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
        var trackInfo = data.track.wiki.summary;
        $("#song-info").html(trackInfo);
      }
    ).catch(function (error) {
        console.log(error);
    });
}