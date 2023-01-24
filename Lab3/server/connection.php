<?php 
    $host = "localhost";
    $user = "root";
    $dbName = "lab3";
    $dbpassword = '';
    $port = 3306;

    $connection = new mysqli($host,$user,$dbpassword,$dbName, $port);

    if ($connection->connect_error) {
        die("Connection failed: " . $connection->connect_error);
      }
    // echo "Connected successfully";
?>