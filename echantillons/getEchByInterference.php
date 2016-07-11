<?php

//include '../include/util.php';
//include '../config/config.php';


//{mainLoc: mainLoc, subLoc: subLoc, dateFrom: dateFrom, dateTo: dateTo, author: author, status: status, category: category}
$message = "ajax call \n";

$interference = isset($_REQUEST["interference"]) ? $_REQUEST["interference"] : "%";
$message .= "interference: ".$interference."\n";

//Request to DB
$SELECT = "SELECT * ";
$FROM = "FROM echantillon";
$WHERE = "WHERE interference = '$interference'";

$query = $SELECT.$FROM.$WHERE;

$query .= ") ORDER BY interference DESC";
$message .= $query . "\n";

$list = array();

if ($conn = connectDB()) {
	if ($rs = $conn->query($query)) {
		$rows_returned = $rs->num_rows;
		$message .= "[OK] $rows_returned results.\n";
		//Iterate over the recordset

		$rs->data_seek(0);
		while ($row = $rs->fetch_assoc()) {
			$idEchantillon = $row['idEchantillon'];
			$list[$idEchantillon] = $row;
		}
		$rs->close();
	}
	$conn->close();
}

echo json_encode($list);
?>