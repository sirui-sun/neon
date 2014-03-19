$(document).ready(function() {

	var height = 1050
	,   width = 1880
	,   GENRE_RADIUS = 80         // radius of node for genres
	,   SUBGENRE_RADIUS = 50      // radius of node for subgenres
	,   ZOOMED_RADIUS = 250       // radius of zoomed in node
	,   DEFAULT_CHARGE = -1200    // default charge force
	,   DEFAULT_LINK_LEN = 150    // default length of link between nodes
	,   force
	,   curr_expanded_node        // currently expanded node
	,   currNode
	,   currPowerButton
	,   currTitleText
	,   currBodyText
	,   currArtistGroup
	,   currPlayingGenre = "";

	var color = d3.scale.category10();

	// create object which calculates forces for nodes
	force = d3.layout.force()
	    .charge(DEFAULT_CHARGE)
	    .linkDistance(DEFAULT_LINK_LEN)
	    .size([width, height]);

	// create svg canvas
	var svg = d3.select("body").append("svg")
	    .attr("height", height)
	    .attr("width", width)

	// initialize nodes
	var url = "assets/data.json";
	d3.json(url, function(error, graph) {
		console.log(graph);

	  // start force
	  force
	      .nodes(graph.nodes)
	      .links(graph.links)
	      .start();

	  // create links between nodes
	  var link = svg.selectAll(".link")
	      .data(graph.links)
	    .enter().append("line")
	      .attr("class", "link")
	      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

	  // create nodes
	  var node = svg.selectAll(".node")
	      .data(graph.nodes);

	  // Create elements to encapsulate the node content
	  var nodeEnter = node.enter().append("g")
	      .attr("class", "node")
	      .call(force.drag);

	  // Node containers
	  nodeEnter.append("circle")
	      .style("fill", function(d) { return color(d.group); })
	      .attr("r", function(d) { return getRadius(d) })
	      .attr("id", function(d) { return underscore(d.name) + "_circle"; })

	  // Genre titles
	  nodeEnter.append("text")
	      .attr('id', function(d) { return underscore(d.name) + '_title_text'})
	      .attr('class', function(d) { return isSubgenre(d) ? "title_small" : "title_large" })
	      .attr("fill", "white")
	      .attr("text-anchor", "middle")
	      .attr("y", "0px")
	      .text(function(d) { if (d.category == "genre") {return d.name;} });

	  // Body text
	  nodeEnter.append("text")
	      .attr('id', function(d) { return underscore(d.name) + '_body_text'})
	      .attr('class', 'body_text')
	      .attr('text-anchor', "middle")
	      .attr('y', "-150px")
	      .attr('fill', 'white')
	      .attr('visibility', 'hidden');

	  // populate body text containers with wrapped text
	  var nodes = graph.nodes;
	  var info, title, currBodyEl, currTitleEl;
	  for (var i=0; i<nodes.length; i++) {
	    info = nodes[i]["info"];
	    title = nodes[i]["name"];
	    currBodyEl = getBodyTextElementByName(nodes[i].name);
	    textFlow(info, currBodyEl, 400, -5, 15, false);

	    // wrap node name if the
	    if (nodes[i]["category"] == "subgenre") {
	      currTitleEl = getTitleElementByName(nodes[i].name);
	      textFlow(title, currTitleEl, 100, 0, 15, true);
	    } 
	  }

	  // group which holds the artist names
	  nodeEnter.append("g")
	    .attr("id", function(d) { return underscore(d.name) + "_artist_group"});

	  // group which holds the play button
	  nodeEnter.append("image")
	    .attr("class", "node-play-button")
	    .attr("title", function(d) { return "Play " + d.name + " Music" })
	    .attr("id", function(d) { return underscore(d.name) + "_play_button"})
	    .attr("xlink:href", "assets/node-play-button.png")
	    .attr("height", 80)
	    .attr("width", 80)
	    .attr("x", -40)
	    .attr("y", 101)
	    .attr("visibility", "hidden")
	    .on("click", function(d) { play(d.name); });

	  // power button
	  nodeEnter.append("image")
	      .attr("id", function(d) { return underscore(d.name) + "_power_button"} )
	      .attr("class", "power_button")
	      .attr("xlink:href", "assets/white-power-button.png")
	      .attr("height", function(d) { return isSubgenre(d) ? "20px":"40px"} )
	      .attr("width", function(d) { return isSubgenre(d) ? "20px":"40px" } )
	      .attr("y", function(d) { return isSubgenre(d) ? "23.75px":"30px" } )
	      .attr("x", function(d) { return isSubgenre(d) ? "-9.5px":"-20px"} )
	      .on("click", function(d) { expand(d) });

	  function tick() {
	    link.attr("x1", function(d) { return d.source.x; })
	        .attr("y1", function(d) { return d.source.y; })
	        .attr("x2", function(d) { return d.target.x; })
	        .attr("y2", function(d) { return d.target.y; });

	    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	  }

	  force.on("tick", tick);
	});

	// test information tooltip
	$(function() {
	  $('#info-area').tooltip();
	  $('.node-play-button').tooltip();
	});

	// ---------------------------------- Expand/Shrink Node ----------------------------------
	// function to handle expanding node 
	var expand = function(data) {
	  if (curr_expanded_node != null) {
	    shrink(curr_expanded_node);
	  }

	  // animate expansion
	  currNode = getCurrentNode(data);
	  currPowerButton = getPowerButton(data);
	  currTitleText = getTitleText(data);
	  currBodyText = getBodyText(data);
	  currArtistGroup = getArtistGroup(data);
	  currPlayButton = getPlayButton(data);

	  currNode.transition().attr({ "r": ZOOMED_RADIUS });
	  curr_expanded_node = data;

	  currPowerButton.transition()
	    .attr({"y":"190px"})
	    .attr({"height":"40px"})
	    .attr({"width":"40px"})
	    .attr("xlink:href", "assets/white-power-button-glowing.png");

	  currTitleText.transition()
	    .attr("y","-200px");

	  currTitleText.selectAll("tspan")
	    .attr("dy", function(d, i) { return i * 30})
	    .attr("font-size", "30px");

	  // make descriptor text visible
	  currBodyText.transition().attr("visibility", "visible");

	  // make play button visible
	  currPlayButton.transition().attr("visibility", "visible");

	  // add artist images
	  var artists = data["artists"]
	  var image_width = 100;
	  var image_padding = 15;
	  currArtistGroup.selectAll("image")
	    .data(artists)
	  .enter().append("image")
	    .attr("class", "artist_image")
	    .attr("height", 50)
	    .attr("width", image_width)
	    .attr("y", 35)
	    .attr("x", function(d, i) { return -(1/2)*(artists.length * (image_width + image_padding) - image_padding) + (i * (image_width + image_padding)) })
	    .attr("xlink:href", function(d) { return d["image_url"]});

	  // change button click handler
	  getPowerButton(data).on('click', function(d) { shrink(d) });

	  // modulate force to compensate for larger object
	  force
	  // increase charge on just the enlarged node
	  .charge(function(d) { return d.name == data.name ? 7 * DEFAULT_CHARGE : DEFAULT_CHARGE})
	  // increase the link distance for all nodes that are attached to the node
	  .linkDistance(function(d) {
	    if(d["source"]["name"] == data.name || d["target"]["name"] == data.name) {
	      return 2.3 * DEFAULT_LINK_LEN;
	    } else {
	      return DEFAULT_LINK_LEN;
	    } 
	  })

	  .start();
	}

	// function to handle shrinking node
	var shrink = function(data) {
	  currNode = getCurrentNode(data);
	  currPowerButton = getPowerButton(data);
	  currTitleText = getTitleText(data);
	  currBodyText = getBodyText(data);
	  currArtistGroup = getArtistGroup(data);
	  currPlayButton = getPlayButton(data);

	  // animate shrinking
	  currNode.transition().attr({ "r": isSubgenre(data) ? SUBGENRE_RADIUS : GENRE_RADIUS });
	  getPowerButton(data).on('click', function(d) { expand(d) });
	  curr_expanded_node = null;

	  // reposition power button text
	  currPowerButton.transition()
	      .attr("height", function(d) { return isSubgenre(d) ? "20px":"40px"} )
	      .attr("width", function(d) { return isSubgenre(d) ? "20px":"40px" } )
	      .attr("y", function(d) { return isSubgenre(d) ? "23.75px":"30px" } )
	      .attr("x", function(d) { return isSubgenre(d) ? "-9.5px":"-20px"} )
	      .attr("xlink:href", "assets/white-power-button.png");

	  // reposition genre title text
	  currTitleText.transition()
	    .attr("y", "0px");
	    //TODO: return size to normal

	  currTitleText.selectAll("tspan")
	    .attr("dy", function(d, i) { return i * 15})
	    .attr("font-size", "15px");

	  // hide play button
	  currPlayButton.transition().attr("visibility", "hidden");

	  // hide body text
	  currBodyText.transition().attr("visibility", "hidden");
	  
	  // remove artist thumbnails
	  svg.selectAll(".artist_image").remove();

	  // return force to normal parameters
	  force.charge(DEFAULT_CHARGE).linkDistance(DEFAULT_LINK_LEN).start();
	}

	// ---------------------------------- Utility Functions -----------------------------------
	var play = function(genreName) {
	  playlist.options.playlistOptions.autoPlay = true;
	  playlist.setPlaylist(songlists[genreName]);
	}

	// replace spaces with underscores
	var underscore = function (str) { return str.replace(" ", "_"); }

	// returns opt1 if subgenre, opt2 if genre
	var isSubgenre = function (data) { return data.category == "subgenre" ? true : false; }

	// node appropriate node radius
	var getRadius = function (data) { return isSubgenre(data)? SUBGENRE_RADIUS : GENRE_RADIUS; }

	// get current node
	var getCurrentNode = function (data) { return svg.select('#' + underscore(data.name) + "_circle"); }

	// get current node's power button
	var getPowerButton = function (data) { return svg.select('#' + underscore(data.name) + '_power_button'); }

	// get current node's title text
	var getTitleText = function (data) { return svg.select('#' + underscore(data.name) + '_title_text'); }

	var getTitleElementByName = function (name) { return document.getElementById(underscore(name) + '_title_text'); }

	// get artist group
	var getArtistGroup = function (data) { return svg.select('#' + underscore(data.name) + '_artist_group'); }

	// get current node's body text svg object
	var getBodyText = function (data) { return svg.select('#' + underscore(data.name) + '_body_text'); }

	// get current node's play button
	var getPlayButton = function (data) { return svg.select('#' + underscore(data.name) + '_play_button'); }

	// get current node's body text DOM object
	var getBodyTextElement = function (data) { return getBodyTextElementByName(data.name); }
	var getBodyTextElementByName = function (name) { return document.getElementById(underscore(name) + '_body_text'); }

});