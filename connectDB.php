<?php

function connectDB() {
        $conn = new mysqli(getenv("localhost"), getenv("root"), getenv("root"), getenv("WIZARD"));
        $conn->query("SET NAMES 'utf8'");
        $conn->query("SET time_zone='UTC'");
        return $conn;
}

if (!$conn = connectDB()) {
   die('Impossible de se connecter : ' . mysql_error());
} else {
    echo('Connexion à la base OK');
}

// Rendre la base de données WIZARD, la base courante
$db_selected = mysql_select_db('WIZARD', $link);
if (!$db_selected) {
   die ('Impossible de sélectionner la base de données : ' . mysql_error());
} 
?>