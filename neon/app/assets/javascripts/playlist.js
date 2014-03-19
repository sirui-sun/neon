var playlist, houseList;
var songlists = {
	"House": [{
		title:"How We Do - Hardwell",
		mp3:"http://a.tumblr.com/tumblr_m81xjoqobE1qj5z3no1.mp3"
	},
	{
		title:"Levels - Avicii",
		mp3:"http://loic.dias.free.fr/music/VA%20-%20NRJ%20Music%20Awards%202012%20(2011)/CD1/18.%20Avicii%20-%20Levels.mp3"
	}]
};

$(document).ready(function(){
	playlist = createPlaylist(songlists["House"]);
});

$("#jquery_jplayer_1").bind(jQuery.jPlayer.event.play, function (event) {   
  var currentSongIdx = playlist.current,
  songs = playlist.playlist;
  jQuery.each(songs, function (index, obj){
    if (index == currentSongIdx){
			$('#footer-song-name').text(obj.title);
			$('#info-area').prop('title', obj.title);
    }
  });
});

// utility function to create a playlist
var createPlaylist = function(list){
	return new jPlayerPlaylist({
		jPlayer: "#jquery_jplayer_1",
		cssSelectorAncestor: "#jp_container_1" }, 
		list, {
		swfPath: "js",
		supplied: "oga, mp3",
		wmode: "window",
		smoothPlayBar: true,
		keyEnabled: true
	});
}