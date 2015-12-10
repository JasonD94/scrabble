/*
    File: ~/js/scrabble/variables.js
    91.461 Assignment 9: Implementing a Bit of Scrabble with Drag-and-Drop
    Jason Downing - student at UMass Lowell in 91.461 GUI Programming I
    Contact: jdowning@cs.uml.edu or jason_downing@student.uml.edu
    MIT Licensed - see http://opensource.org/licenses/MIT for details.
    Anyone may freely use this code. Just don't sue me if it breaks stuff.
    Created: Nov 24, 2015.
    Last Updated: Dec 9, 6PM.

    This JavaScript file is for the 9th assignment, "Scrabble".

    This file contains a bunch of global variables for the Assignment 9, "Scrabble".

    Globals are obviously not recommended but in this case it makes it way easier
    to program the game board.
*/


/*
    JavaScript array of objects for the amounts and value of each letter.
    I didn't make this data structure, this was originally found on Piazza and made by Ramon Meza.
    Also, I didn't feel like figuring out how to load a JSON file again so I did the easy way
    and just made a pieces array with all the stuff I need. Obviously lazy but it works way easier SO WHY NOT.

    Note that I modified this to include a "remaining" property as well, just like
    Prof. Heines showed in class for his associative array.
*/
var pieces = [];

// JavaScript array to keep track of the CURRENT game board. (the current word that is being created)
// NOTE: "pieceX" means NO tile present on that drop zone.
// Also note this is EMPTY until tiles are placed onto the game board.
var game_board = [
  // Example of what WOULD be in this array. An obj with "id" of the dropable spot and the tile that was dropped.
  //{"id": "drop0",  "tile": "pieceX"},
];

// JavaScript array to keep track of past words
var complete_words = [
  /*
      Example of what this array with look like:
      [
        // Each word will be an array of objects
        //               "H"                             "E"                              etc
        [{ {"id": "row7_col7",  "letter": "H"}, {"id": "row7_col8",  "letter": "E"}, ...}],

        // This could be the second word that is saved
        // It would also have the id of dropped tile, plus which letter it is.
        [ {H}, {E} , {L}, {L}, {O}   ]

        It could be longer as the game goes on. It could be as long as the board supports even.
        Each dropID would be used to generate valid positions for starting a new word.
        Words must be formed at RIGHT angles.
        Also, the array should be used to get the letters of saved letters.
      ]
  */
];

// JavaScript array of objects to determine what letter each piece is.
// This gets configured by load_scrabble_pieces()
var game_tiles = [
  {"id": "piece0", "letter": "A"},
  {"id": "piece1", "letter": "B"},
  {"id": "piece2", "letter": "C"},
  {"id": "piece3", "letter": "D"},
  {"id": "piece4", "letter": "E"},
  {"id": "piece5", "letter": "F"},
  {"id": "piece6", "letter": "G"}
];

// Boolean for reading left to right or top to bottom
var left_right = false;

// For detecting multiple words played
// TODO: is this being used?
var number_of_words = 0;

// Used for getting the original position of a draggable object.
// As seen here: https://stackoverflow.com/questions/12350259/original-position-of-a-draggable-in-jquery-ui
var startPos;

// URL for this source code: http://ejohn.org/blog/dictionary-lookups-in-javascript/
// See the "Submit word" function for more info.
// The dictionary lookup object
// Also, future note, a better dictionary file might be found here:
// http://www.math.sjsu.edu/~foster/dictionary.txt
var dict = {};

// Do a jQuery Ajax request for the text dictionary
// Note, used this page to make the dictionary all lowercase:
// URL: http://linuxcommando.blogspot.com/2008/05/how-to-convert-text-files-to-all-upper.html
$.get( "files/dictionary.txt", function( txt ) {
    // Get an array of all the words
    var words = txt.split( "\n" );

    // And add them as properties to the dictionary lookup
    // This will allow for fast lookups later
    for ( var i = 0; i < words.length; i++ ) {
        dict[ words[i] ] = true;
    }
});

// Save the score of all the words saved. Only updates when a word is saved, which allows
// the scoring function (find_word()) to work properly.
var word_score = 0;

// First letter for 2nd and on words played.
var first_letter = "";

// Keep track of the letters of used words. This is handy for tracking adding an "S" to
// a currently created word "hope" - if we had an S, then we have 5 letters. If we remove an
// S, we have 4 letters that need to be removed.
var used_letters = 0;
