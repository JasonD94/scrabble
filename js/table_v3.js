/*
    File: ~/js/table_v2.js
    91.461 Assignment 8: Using the jQuery UI Slider and Tab Widgets
    Jason Downing - student at UMass Lowell in 91.461 GUI Programming I
    Contact: jdowning@cs.uml.edu or jason_downing@student.uml.edu
    MIT Licensed - see http://opensource.org/licenses/MIT for details.
    Anyone may freely use this code. Just don't sue me if it breaks stuff.
    Created: Nov 12, 2015.
    Last Updated: Nov 12, 1:30PM.

    This page is for the 8th assignment. It is a complete copy of my assignment 7
    JavaScript code, except this one uses the jQuery Validation plugin and the
    jQuery UI library.

    It contains a JavaScript function called table_calc() which calculates out
    the multiplication table, and then calls a function called table_fill() which
    fills in the table.
*/

// This is a hack but whatever. jQuery UI is just plain annoying to use dynamically.
// Basically, this is forced to start at 1 and continue counting up to prevent
// bugs when the user removes a tab.
var tabIndex = 1;

/*
    This function tries to submit the form. It will only submit if the form is valid.
    It gets called on various events:
    - on page load (automagically generated a 0 by 0 table by default)
    - on keyup (if the user types "5" it generates a new table using this input)
    - on slide (slider moves, new table is generated)

    I found an example of submitting the form using jQuery on Stackoverflow,
    URL here: https://stackoverflow.com/questions/1200266/submit-a-form-using-jquery

    The if statement I created after Googling to see if there is a way to detect
    valid forms with the jQuery Validator. Turns out .valid() returns true or false.

    Also, by using this code I can now validate code on the first run through
    without having the user click the submit button. This was pointed out by
    one of the graders as a problem, and now even on the first page load the
    validator will be run if the user tries to type "100". They don't even need
    to click enter either, as I run this code onkeyup as well in the validator.
*/
function auto_submit() {
  // If the form is valid
  if( $("form#mult_form").valid() == true ) {
    // Then make it submit, which should update the tab in the process.
    $("form#mult_form").submit();
  }
}


/*
 *    Saves the current multiplication table into a new tab.
 */
function save_tab() {
  // This Stackoverflow post was a good example to look at and modify to make the jQuery UI tabs
  // behave how I wanted them to.
  // URL: https://stackoverflow.com/questions/18572586/append-to-dynamically-created-tab
  // This is the jsfiddle that I based my code around: https://jsfiddle.net/EKBqy/

  // I've decided to only allow 25 tabs; the user will need to delete old tabs to add more.
  // URL: https://stackoverflow.com/questions/605969/jquery-count-number-of-list-elements
  var tabCount = $("#tabs li").length + 1;
  console.log("Current tab count is: " + tabCount);

  if(tabCount > 24) {
    alert("Sorry, only 24 multiplication tables may be saved at the same time. Please delete one to save another table.");
    return false;
  }

  // This should initialize the jQuery UI tabs.
  $( "#tabs" ).tabs();

  // Get the dimensions of the current table. I've decided to display the Tab title bar for each table as:
  // 0 TO 12 (horizontal beginning to end) by 0 TO 12 (vertical beginning to end)
  var hor_start = Number(document.getElementById('horiz_start').value);
  var hor_end = Number(document.getElementById('horiz_end').value);
  var vert_start = Number(document.getElementById('vert_start').value);
  var vert_end = Number(document.getElementById('vert_end').value);

  tabIndex++;   // Increment the index each time we add a new tab.

  // Create the title bar, this will be a string to send to .append()
  var title = "<li class='tab'><a href='#tab-" + tabIndex + "'>" + hor_start +
              " to " + hor_end + " by " + vert_start + " to " + vert_end + "</a>" +
              "<span class='ui-icon ui-icon-close' role='presentation'></span>" + "</li>";

  // Add a new Title bar.
  $( "div#tabs ul" ).append( title );

  // Add the current multiplication table.
  $( "div#tabs" ).append('<div id="tab-' + tabIndex + '">' + $("#multiplication_table").html() + '</div>');

  // Refresh the tabs div so that the new tab shows up.
  $( "#tabs" ).tabs("refresh");

  // Make the new tab active, so that the user knows it updated.
  $( "#tabs" ).tabs("option", "active", -1);

  // Add a remove button, from jQuery UI's webpage: https://jqueryui.com/tabs/#manipulation
  $( "#tabs" ).delegate( "span.ui-icon-close", "click", function() {
      var panelID = $( this ).closest( "li" ).remove().attr( "aria-controls" );
      $( "#" + panelID ).remove();

      // Refresh the tabs!
      // Using try / catch to prevent exceptions from appearing in the console.
      // I think the destroy kind of breaks some of the jQuery UI stuff but
      // it
      try {
        $( "#tabs" ).tabs("refresh");
      }
      catch (e) {
        //console.log(e);
      }

      // If this is the last tab, let's reset the page to way it was before.
      // URL: https://api.jqueryui.com/tabs/#method-destroy
      if( $('div#tabs ul li.tab').length == 0) {
        try {
          $("#tabs").tabs("destroy");
        }
        catch (e) {
          //console.log(e);
        }

        return false;   // This may prevent default behavior from occurring.
      }
  });
}

/*
    Code that makes the slider appear for the parameters
*/
function slider() {

  // The slider code is based off of jQuery's UI page.
  // URL: https://jqueryui.com/slider/#hotelrooms

  // Horizontal Start Slider
  $("#slider_hor_start").slider({
    min: -12,
    max: 12,
    slide: function(event, ui) {
      $("#horiz_start").val(ui.value);
      auto_submit();  // Call the auto submit function on slide.
    }
  });
  $("#horiz_start").on("keyup", function() {
    $("#slider_hor_start").slider("value", this.value);
    auto_submit();  // Call the auto submit function on keyup as well.
  });

  // Horizontal End Slider
  $("#slider_hor_end").slider({
    min: -12,
    max: 12,
    slide: function(event, ui) {
      $("#horiz_end").val(ui.value);
      auto_submit();  // Call the auto submit function on slide.
    }
  });
  $("#horiz_end").on("keyup", function() {
    $("#slider_hor_end").slider("value", this.value);
    auto_submit();  // Call the auto submit function on keyup as well.
  });

  // Vertical Start Slider
  $("#slider_vert_start").slider({
    min: -12,
    max: 12,
    slide: function(event, ui) {
      $("#vert_start").val(ui.value);
      auto_submit();  // Call the auto submit function on slide.
    }
  });
  $("#vert_start").on("keyup", function() {
    $("#slider_vert_start").slider("value", this.value);
    auto_submit();  // Call the auto submit function on keyup as well.
  });

  // Vertical End Slider
  $("#slider_vert_end").slider({
    min: -12,
    max: 12,
    slide: function(event, ui) {
      $("#vert_end").val(ui.value);
      auto_submit();  // Call the auto submit function on slide.
    }
  });
  $("#vert_end").on("keyup", function() {
    $("#slider_vert_end").slider("value", this.value);
    auto_submit();  // Call the auto submit function on keyup as well.
  });
}


function validate() {

  /*  Switch to using the jQuery Validation Plugin
      See this demo: jqueryvalidation.org/files/demo/
      And Prof. Heines' website: https://teaching.cs.uml.edu/~heines/91.461/91.461-2015-16f/461-lecs/lecture18.jsp
      Also the documentation on this site was pretty helpful: http://jqueryvalidation.org/validate/
  */
  $("#mult_form").validate({
    // Rules for validating the form.
    rules: {
      horiz_start: {
        number: true,
        min: -12,
        max: 12,
        required: true
      },
      horiz_end: {
        number: true,
        min: -12,
        max: 12,
        required: true
      },
      vert_start: {
        number: true,
        min: -12,
        max: 12,
        required: true
      },
      vert_end: {
        number: true,
        min: -12,
        max: 12,
        required: true
      }
    },

    // Messages that appear if a rule isn't valid.
    messages: {
      horiz_start: {
        number: "ERROR: you did not enter a valid number.<br/>Please enter a number between -12 and 12 for the Horizontal start.",
        min: "ERROR: number entered is too small.<br/>Please enter a number greater than or equal to -12 for the Horizontal start.",
        max: "ERROR: number entered is too large.<br/>Please enter a number less than or equal to 12 for the Horizontal start.",
        required: "ERROR: no number was entered.<br/>A number between -12 and 12 is required for the Horizontal start."
      },
      horiz_end: {
        number: "ERROR: you did not enter a valid number.<br/>Please enter a number between -12 and 12 for the Horizontal start.",
        min: "ERROR: number entered is too small.<br/>Please enter a number greater than or equal to -12 for the Horizontal start.",
        max: "ERROR: number entered is too large.<br/>Please enter a number less than or equal to 12 for the Horizontal start.",
        required: "ERROR: no number was entered.<br/>A number between -12 and 12 is required for the Horizontal start."
      },
      vert_start: {
        number: "ERROR: you did not enter a valid number.<br/>Please enter a number between -12 and 12 for the Horizontal start.",
        min: "ERROR: number entered is too small.<br/>Please enter a number greater than or equal to -12 for the Horizontal start.",
        max: "ERROR: number entered is too large.<br/>Please enter a number less than or equal to 12 for the Horizontal start.",
        required: "ERROR: no number was entered.<br/>A number between -12 and 12 is required for the Horizontal start."
      },
      vert_end: {
        number: "ERROR: you did not enter a valid number.<br/>Please enter a number between -12 and 12 for the Horizontal start.",
        min: "ERROR: number entered is too small.<br/>Please enter a number greater than or equal to -12 for the Horizontal start.",
        max: "ERROR: number entered is too large.<br/>Please enter a number less than or equal to 12 for the Horizontal start.",
        required: "ERROR: no number was entered.<br/>A number between -12 and 12 is required for the Horizontal start."
      }
    },

    // This gets called when the form is submitted and valid.
    submitHandler: function() {
      table_calc();
      return false;
    },

    invalidHandler: function() {
      // Wipe the previous table / error messages
      // This way nothing will show up if a user tries to submit with an error.
      $("#warning_msg").empty();
      $("#multiplication_table").empty();
    },

    // This is from stackoverflow, its helpful to stop the validator plugin from moving the inputs around
    // with the error message. I also insert after the input as well since I thought that looked better.
    // URL: https://stackoverflow.com/questions/3691743/jquery-validate-how-to-keep-error-messages-from-altering-the-form-disposition
    errorElement: "div",
    errorPlacement: function(error, element) {
      error.insertAfter(element);
    },

    onkeyup: function( element, event ) {
      // Call the auto submit function on keyup, so the user does not have to
      // press the enter button.
      auto_submit();
    }
  });
}


// This function calculates the multiplication table.
function table_calc() {
  /*
      User input - from the form on the assignment 6 HTML doc.
      Convert to a number using type casting. This fixed so many random bugs
      in my code. W3Schools helped a ton in figuring this out, as comparisons
      would fail randomly before I added this.
      http://www.w3schools.com/js/js_comparisons.asp
  */
  var hor_start = Number(document.getElementById('horiz_start').value);
  var hor_end = Number(document.getElementById('horiz_end').value);
  var vert_start = Number(document.getElementById('vert_start').value);
  var vert_end = Number(document.getElementById('vert_end').value);

  // DEBUG
  // Check to see if the numbers are read correctly.
  // console.log("Horizontal start: ", hor_start, "Horizontal end: ", hor_end),
  // console.log("Vertical start: ", vert_start, "Vertical end: ", vert_end);

  /*
        This section handles some "warning messages" that I decided would be worth
        adding after Prof. Heines mentioned some thoughts the graders had.

        I basically warn the user if I decide to flip the inputs on them,
        e.g. user enters [5, 1] I flip this to [1, 5] so it's easier to deal with
        (1 case vs 2 cases basically).

        This doesn't actually validate the form or anything - if this function is run,
        it is run by the submit button assuming the validation rules aren't broken,
        so at this point everything is assumed to be valid. (see the submitHandler function
        in the validate() function)
  */

  // Empty the div first.
  // See this Stackoverflow post: https://stackoverflow.com/questions/20293680/how-to-empty-div-before-append
  $("#warning_msg").empty();

  // Swap beginning / ending numbers if the start is larger than the beginning.
  if (hor_start > hor_end) {

    // Alert the user that this is happening!
    $("#warning_msg").append("<p class='warning_class'>Swapping the Horizontal start and Horizontal end.</p>");

    var tmp_num = hor_start;
    hor_start = hor_end;
    hor_end = tmp_num;
  }

  // Also swap vertical beginning / ending
  if (vert_start > vert_end) {

    // Alert the user that this is happening!
    $("#warning_msg").append("<p class='warning_class'>Swapping the Vertical start and Vertical end.</p>");

    var tmp_num = vert_start;
    vert_start = vert_end;
    vert_end = tmp_num;
  }

  /*  Instead of an array of arrays, use an object containing each rows array.
      Example:
      matrix {
        row1: [1, 2, 3,  4,  5],
        row2: [3, 6, 9, 12, 15],
        row3: [etc],
        row4: [etc]
      }
  */
  var matrix = {};

  // Figure out how many rows / columns we have.
  var rows = Math.abs(hor_end - hor_start);
  var columns = Math.abs(vert_end - vert_start);

  // Indexes for the 2D array.
  var horz = hor_start;
  var vert = vert_start;

  /*  Calculate the multiplication table using an object (matrix) and a bunch
      of arrays. I use a temp. array, calculate out a whole row's values, and
      then save that row's array in the object. See the example where var matrix
      is declared for an example.    */
  for (var x = 0; x <= columns; x++) {
    var tmp_arr = [];

    for (var y = 0; y <= rows; y++) {
      // Calculate the given spot in the multiplication table.
      var calc = horz * vert;
      tmp_arr[y] = calc;
      horz++;
    }

    // Save the current row in the object.
    matrix["row" + x] = tmp_arr;

    horz = hor_start;        // Reset each pass since we're moving down a row.
    vert++;
  }

  // Now we can fill in the table.
  // w3schools is helpful: http://www.w3schools.com/html/html_tables.asp
  var content = "";

  // Opening table tags.
  content += "<table>";

  // First row, and put an empty spot in the top left corner.
  content += "<tr><td></td>";

  // Now fill out the rest of the first row.
  for (var a = hor_start; a <= hor_end; a++) {
    content += "<td>" + a + "</td>";
  }

  // Close the first row.
  content += "</tr>";

  // Print out the left most column using this variable.
  var vert = vert_start;

  // Fill in each row after the first.
  for (var x = 0; x <= columns; x++) {
    // Set the left most column first.
    content += "<tr><td>" + vert + "</td>";

    // Add in all the multiplication for this row.
    for (var y = 0; y <= rows; y++) {
      content += "<td>" + matrix["row" + x][y] + "</td>";
    }
    vert++;

    // Close each row.
    content += "</tr>";
  }

  // Ending table tags.
  content += "</table>";

  // Now the content gets loaded into the HTML page.
  $("#multiplication_table").html(content);

  // Stop the form from refreshing.
  return false;
}
