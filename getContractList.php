<?php

include '../include/util.php';
include '../config/config.php';


//{mainLoc: mainLoc, subLoc: subLoc, dateFrom: dateFrom, dateTo: dateTo, author: author, status: status, category: category}
$message = "ajax call \n";

$dateFrom = isset($_REQUEST["dateFrom"]) ? $_REQUEST["dateFrom"] : "%";
$message .= "dateFrom: ".$dateFrom."\n";

$dateTo = isset($_REQUEST["dateTo"]) ? $_REQUEST["dateTo"] : "%";
$message .= "dateTo: ".$dateTo."\n";

$contractor = isset($_REQUEST["contractor"]) ? $_REQUEST["contractor"] : "%";
$message .= "contractor: ".contractor."\n";

$SELECT = "SELECT * ";
$FROM = "FROM contract ";
$WHERE = "WHERE ( DATE(endDate) is Null OR (DATE(endDate) >= '$dateFrom' AND DATE(startDate) <='$dateTo')";

if ($contractor !="%") {
	$WHERE .= "AND idContractor = '$contractor' ";
}
$query = $SELECT.$FROM.$WHERE;

$query .= ") ORDER BY startDate DESC";
$message .= $query . "\n";

$list = "";

if ($conn = connectDB()) {
	if ($rs = $conn->query($query)) {
		$rows_returned = $rs->num_rows;
		$message .= "[OK] $rows_returned results.\n";
		//Iterate over the recordset

		$rs->data_seek(0);
		while ($row = $rs->fetch_assoc()) {
			$idContract = $row['idContract'];
			$list[$idContract] = $row;
			$list[$idContract]['startDate'] = convertTime($row['startDate'], "UTC", getenv("LOCALE_TZ"), 0, 0);
			$list[$idContract]['startTimestamp'] = getTimestamp($row['startDate'], "UTC", getenv("LOCALE_TZ"));
			$list[$idContract]['endDate'] = !empty($row['endDate']) ? convertTime($row['endDate'],"UTC",getenv("LOCALE_TZ"),0, 0) : "";
			$list[$idContract]['endTimestamp'] = getTimestamp($row['endDate'], "UTC", getenv("LOCALE_TZ"));
				
			//Search associated files
			$query2 = "SELECT id, type, name, size, url, deleteUrl, deleteType FROM files f JOIN files_attached fa ON f.id = fa.idFile WHERE fa.idData = '$idContract' AND fa.typeData = 'contract'";
			$message .= $query2 . "\n";
			if ($rs2 = $conn->query($query2)) {
				$rows_returned = $rs2->num_rows;
				$message .= "[OK] $rows_returned files.\n";

				$rs2->data_seek(0);
				$files = array();
				while ($file = $rs2->fetch_assoc()) {
					$files[] = $file;
				}
			}
			$list[$idContract]['files'] = $files;
			$rs2->close();
		}
		$rs->close();
	}
	$conn->close();
} /*
else {

}*/

if(getenv("debug")){
	$out['log'] = $message;
}
echo json_encode($list);

?>


