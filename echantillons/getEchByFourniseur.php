<?php

//include '../include/util.php';
//include '../config/config.php';


//{mainLoc: mainLoc, subLoc: subLoc, dateFrom: dateFrom, dateTo: dateTo, author: author, status: status, category: category}
$message = "ajax call \n";

$fournisseur = isset($_REQUEST["fournisseur"]) ? $_REQUEST["fournisseur"] : "%";
$message .= "fournisseur: ".$fournisseur."\n";

//Request to DB
$SELECT = "SELECT * ";
$FROM = "FROM echantillon";
$WHERE = "WHERE FOURNISSEUR = '$fournisseur'";

$query = $SELECT.$FROM.$WHERE;

$query .= ") ORDER BY FOURNISSEUR DESC";
$message .= $query . "\n";

$list = "";

if ($conn = connectDB()) {
	if ($rs = $conn->query($query)) {
		$rows_returned = $rs->num_rows;
		$message .= "[OK] $rows_returned results.\n";
		//Iterate over the recordset

		$rs->data_seek(0);
		while ($row = $rs->fetch_assoc()) {
			$idEchantillon = $row['idEchantillon'];
			$list[$idEchantillon] = $row;
			$list[$idEchantillon]['fournisseur'];

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


