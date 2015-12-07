/*
    File: ~/js/json.js
    91.461 Assignment 5: do stuff with JSON
    Jason Downing - student at UMass Lowell in 91.461 GUI Programming I
    Contact: jdowning@cs.uml.edu or jason_downing@student.uml.edu
    MIT Licensed - see http://opensource.org/licenses/MIT for details.
    Anyone may freely use this code. Just don't sue me if it breaks stuff.
    Created: Oct 3, 2015.
    Last Updated: Oct 3, 5PM.

    This JavaScript file will load a JSON file into a variable named song_lyrics,
    and then call another function called place_json which will then put the
    song lyrics into the HTML document. A CSS file will also format these elements,
    which can be found in the CSS/json.css file.

    Note: for the for loops I'm using a for .. in loop, which I discovered on
    stackoverflow. I had troubles trying to use a tradional for loop, for example:
    for(var x = 0; x < song_lyrics.lyrics.first.length(); x++)
    That outputted "undefined" to the HTML document, so I went with the for .. in loop.
    You can find that stackoverflow post here:
    https://stackoverflow.com/questions/19323699/iterating-through-json-object-javascript

    Some of the JS in this file is also from Prof. Heines' web page for Assignment 5.
    I modified it for my custom made JSON file. The URL to that assignment is below:
    https://teaching.cs.uml.edu/~heines/91.461/91.461-2015-16f/461-assn/FormattingText-v05.jsp
*/

var song_lyrics;
var content = "";

// Get the JSON file into a global var called song_lyrics
function get_json() {
  jQuery.get("json/lyrics.json", function(data) {
    song_lyrics = data;   // Save lyrics JSON file into song_lyrics variable.
    place_json();         // Place JSON data into the HTML document
  });
}

// Place the JSON data into the HTML document.
function place_json() {
  // Creating content dynamically using the JSON data.
  content += "<h1 class='title'>" + song_lyrics.title + "</h1>";
  content += "<h2 class='artist'>" + song_lyrics.artist + "</h2>";

  content += "<br/>";   // Add newline.

  // Start looping through the lyrics.
  // Lyrics are from: http://www.ratm.net/lyrics/sle.html
  content += "<p class='YEAAH'>" + song_lyrics.lyrics.yeah + "</p>";
  content += "<br/>";   // Add newline.

  // First paragraph
  for(var key in song_lyrics.lyrics.first) {
    if(song_lyrics.lyrics.first.hasOwnProperty(key)) {
      var value = song_lyrics.lyrics.first[key];
      content += "<p class='first'>" + value + "</p>";
    }
  }
  content += "<br/>";   // Add newline.

  // Print out two "Hey! Hey!" lines
  print_hey(content);

  // Second paragraph
  for(var key in song_lyrics.lyrics.second) {
    if(song_lyrics.lyrics.second.hasOwnProperty(key)) {
      var value = song_lyrics.lyrics.second[key];
      // Make the last line in this paragraph look like the other "SLEEP NOW IN THE FIRE" lines
      if(value == "Sleep now in the fire") {
        content += "<p class='sleep'>" + value + "</p>";
      }
      else {
        content += "<p class='second'>" + value + "</p>";
      }
    }
  }
  content += "<br/>";   // Add newline.

  // Two more "Hey! Hey!" lines
  print_hey(content);

  // Third paragraph
  for(var key in song_lyrics.lyrics.third) {
    if(song_lyrics.lyrics.third.hasOwnProperty(key)) {
      var value = song_lyrics.lyrics.third[key];
      // Make the last line in this paragraph look like the other "SLEEP NOW IN THE FIRE" lines
      if(value == "Sleep now in the fire") {
        content += "<p class='sleep'>" + value + "</p>";
      }
      else {
        content += "<p class='third'>" + value + "</p>";
      }
    }
  }
  content += "<br/>";   // Add newline.

  // YEAAAAH!
  content += "<p class='YEAAH'>" + song_lyrics.lyrics.yeah + "</p>";
  content += "<br/>";   // Add newline.

  // "SLEEP NOW IN THE FIRE!" lines.
  for(var key in song_lyrics.lyrics.sleep) {
    if(song_lyrics.lyrics.third.hasOwnProperty(key)) {
      var value = song_lyrics.lyrics.sleep[key];
      content += "<p class='sleep'>" + value + "</p>";
    }
  }

  // Now the content gets loaded into the HTML page.
  $("#place_json_here").html(content);
}

// Instead of repeating two for loops, use just one.
function print_hey() {
  for(var x = 0; x < 2; x++) {
    for(var key in song_lyrics.lyrics.hey) {
      if(song_lyrics.lyrics.hey.hasOwnProperty(key)) {
        var value = song_lyrics.lyrics.hey[key];
        if(value == "HEY!") { // "HEY!" should be blue.
          content += "<p class='hey'>" + value + "</p>";
        }
        else {  // The "SLEEP NOW IN THE FIRE" part will be red.
          content += "<p class='sleep'>" + value + "</p>";
        }
      }
    }
    content += "<br/>";   // Add newline.
  }
}