
var container = '.container'
// this was to overite the alert window to make manual testing a bit more bareable 
window.alert = ()=>{console.log('alert made');}

$(document).ready(() => listenForSubmit());


function renderButton() {
    // i think this is an example of a closure? 
    var count = 0;

    // wanted to use obj but array worked best 
    // for how the color changer worked
    const colorLibrary = [
        "#2c3e50",
        "#722F37",
        "#004225"
    ];

    //render the button to change background
    $(document.createElement("button")).attr({ "id": "main-btn", 'type': 'button' })
        .text('toggle background').hide().appendTo(container).fadeIn(3000)
        //add the event listener to toggle back-ground color
        .on('click', () => {
            count++;
            count %= 3;
            $('body').css("background-color", colorLibrary[count]);
        });
}

function renderLink(prompt) {
    $(document.createElement("p")).attr({ 'class': 'container-p', 'id': 'logout-link' })
        .text(prompt).hide().appendTo(container).fadeIn(3000)
        //need to append listener to the newly rendered element 
        .click(() => {
            // make ajax request for the form htnl
            $.ajax({
                type: "Post",
                url: "../server/form.html",
                dataType: "html",
                success: (response) => {
                    $(document).ready(() => {
                        //clear the container & append the form to it 
                        //run listenForSubmit so form functions properly  
                        $(container).empty();
                        $(container).append(response);
                        listenForSubmit();
                    });
                }
            });
        });
}


function renderTable(results) {
    //console.log(results);
    const rows = results.map((row) => {
        const { username, password } = row;
        return `<tr><td>${username}</td><td>${password}</td> </tr>`;
    });

    // this ungodly abomination creates the table, the table headers and body
    //then append them to the container
    $(document.createElement('table')).attr({ id: 'user-table' }).append($(document.createElement('thead'))
        .append($(document.createElement('th')).text('username'), $(document.createElement('th')).text('password')))
        .append($(document.createElement('tbody')).attr({ id: 'user-table-body' })).appendTo(container);

    var fadeSpeed = 500;
    rows.forEach(row => {
        $('#user-table-body').append(row).hide().fadeIn(fadeSpeed);
        fadeSpeed += 500;
    });
}

// render the welcome message  after login
function renderWelcome(username) {
    $(document.createElement("h2")).attr({ "id": "title" })
        .text(`Welcome ${username}`).hide()
        .appendTo(container).fadeIn(2500);

}

function listenForSubmit() {

    //select form element's  submit event
    $("#main-form").submit((e) => {
        //disable default event so ajax can handle it
        e.preventDefault();

        //capture #main-form data
        var results = $('#main-form').serialize();

        // housekeeping
        $('#error-display').empty();

        // make the ajax request
        $.ajax({
            type: "POST",
            url: "../server/submit.php",
            data: results,
            dataType: "json",
            success: function (response) {
                //console.log(response);
                const userData = response.userData;
                // if successful login
                if (response.statusCode === 202) {
                    $(container).empty();
                    renderWelcome(userData.username);
                    renderButton();
                    renderLink('Logout');
                }
                // if bad credentials 
                if (response.statusCode === 400) {
                    $('#error-display').append(response.errorMessage)
                        .css({ "text-align": "center", 'color': 'red' });
                }
                if (response.statusCode === 3000) {
                    const results = response.results;
                    $(container).empty();
                    renderWelcome(userData.username);
                    renderTable(results);
                    renderLink("Logout");
                }
            }
        }); // end ajax req
    }); // end form submit event


    // flips visual prompts and changes what submissionType is sent to server-side script 
    $("#returning-prompt").click(() => {
        if ($('#title').text() === 'Sign Up') {
            $("#title").text("Log In");
            $('#submissionType').attr("value", "login");
            $('#returning-prompt').text("new member? click here");
            return;
        }
        $("#title").text("Sign Up");
        $('#submissionType').attr("value", "signup");
        $('#returning-prompt').text('returning member? click here');
    });


}