
<?php
// import connection to the database
include("connection.php");

$response = array();
$status_code;
// pull data from the request
$submission_type = $_REQUEST['submissionType'];
$username = $_REQUEST['username'];
$password = $_REQUEST['password'];

$response['submissionType'] = $submission_type;

//check if either fields are blank; if they are, reject 
if (empty($password) || empty($username)) {
    $response['errorMessage'] = 'no field may be left blank';
    $status_code = 400;
    $response['statusCode'] = $status_code;
    echo json_encode($response);
    exit;
}

//depending on submission type, branch program
// this is to handle the two query types

/***
 * login handler
 */
if ($submission_type === 'login') {
    $response['status'] = 'made it within login branch';
    //create query
    $sql = "SELECT * FROM users WHERE username = '$username'";
    // fetch results
    $results = mysqli_query($connection, $sql);

    //clever way to figure out if something was sent back
    // this took me forever to figure out 
    // this for some reason was the hardest thing to fenagle 
    //how to say no match to the query was found
    if(mysqli_num_rows($results) == 0){
        $response['errorMessage'] = 'no username was found';
        $response['statusCode'] = 400;
        echo json_encode($response);
        exit;
    }
    $response['status'] = 'made it just after the query';
    $response['num rows'] = mysqli_num_rows($results);
    // if we have results 
    if ($results) {
        $response['status'] = 'result found';
        // convert to an associative array 
        $userData = mysqli_fetch_assoc($results);
        // if password from db matches password from form
        if ($userData['password'] === $password) {
            $response['status'] = 'successful match';
            $response['userData'] = $userData;
            $status_code = 202; // accepted 

            /***
             * 
             * branch here for admin
             */

            if ($username === 'Admin') {
                $response['status'] ='made it to Admin branch';
                $sql = "SELECT username, password  FROM users";
                $results = mysqli_query($connection, $sql);
                $response['results'] = array();
                foreach($results as$result){
                    array_push($response['results'], $result);
                }
                $status_code = 3000;
            }
            // match was found but bad password
        } else {
            $response['errorMessage'] = 'incorrect password attempt again';
            $status_code = 400;
        }
    }
    mysqli_free_result($results);
}

/***
 * signup handler
 * 
 */

if ($submission_type === 'signup') {
    $sql = "SELECT username FROM users";
    $results = mysqli_query($connection, $sql);
    // assume valid
    $valid = true;
    foreach ($results as $result) {
        //$userData =  mysqli_fetch_assoc($result);
        if ($result['username'] === $username) {
            $valid = false;
        }
    }
    // if username already exists 
    if (!$valid) {
        $response['errorMessage'] = 'username already exists';
        $status_code = 400;
    // otherwise insert into DB
    } elseif ($valid) {
        // the query was having a bit of a fit when written on one line 
        //this hack alleviated the problem 
        $sql = "INSERT INTO users" .
            "(username, password)" .
            "VALUES('$username', '$password')";

        // make query and return indication of success or failure
        mysqli_query($connection, $sql) ?
            $response['status'] = 'successful insertion made'
            : $response['status'] = 'the insert failed';

        $sql = "SELECT * FROM users WHERE username= '$username'";
        $result = mysqli_query($connection, $sql);
        $userData = mysqli_fetch_assoc($result);
        $response['userData'] = $userData;
        $status_code = 202;
    }
    mysqli_free_result($results);
}


// you wouldn't guess it by looking at it
// but this line of code broke the login functionality
//$response['valid'] = $valid;

$response['statusCode'] = $status_code;

$connection->close();
echo json_encode($response);
?>