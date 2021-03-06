<?php

//include '../include/util.php';
include 'connectDB.php';


//{mainLoc: mainLoc, subLoc: subLoc, dateFrom: dateFrom, dateTo: dateTo, author: author, status: status, category: category}
$message = "ajax call \n";

$instrument = isset($_REQUEST["instrument"]) ? $_REQUEST["instrument"] : "%";
$message .= "instrument: ".$instrument."\n";

//Request to DB
$SELECT = "SELECT * ";
$FROM = "FROM echantillon";
$WHERE = "WHERE INSTRUMENT = '$instrument'";

$query = $SELECT.$FROM.$WHERE;

$query .= ") ORDER BY INSTRUMENT DESC";
$message .= $query . "\n";

$list = array();

if ($conn = connectDB()) {
	if ($rs = $conn->query($query)) {
		$rows_returned = $rs->num_rows;
		$message .= "[OK] $rows_returned results.\n";
		//Iterate over the recordset

		$rs->data_seek(0);
		while ($row = $rs->fetch_assoc()) {
			$idEchantillon = $row['idInstrument'];
			$list[$idEchantillon] = $row;
		}
		$rs->close();
	}
	$conn->close();
}

echo json_encode($list);
?>