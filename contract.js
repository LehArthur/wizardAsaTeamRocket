/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

function initPage(){
	updateMenu(menu_item);
	$("ul #appro").addClass('active');
	initNewDatePicker();
	initSelector(); 
	initContractTable();
	populateContractList();
	document.getElementById('newContract-000').style.display = 'none';
	initFileUpload('#new-contract-files');
	initSubstratToken();
	$('#new-contract-substrats-view').hide();
}

function initNewDatePicker() {
	$('#dateFrom').datetimepicker({
		sideBySide: false,
		language: 'fr',
		pickTime: false,
		format: 'DD/MM/YYYY'
	});
	$('#dateTo').datetimepicker({
		sideBySide: false,
		language: 'fr',
		pickTime: false,
		format: 'DD/MM/YYYY'
	});
	$('#dateStartContract').datetimepicker({
		sideBySide: false,
		language: 'fr',
		pickTime: false,
		minuteStepping: 5,
		format: 'DD/MM/YYYY'
	});

	$('#dateEndContract').datetimepicker({
		sideBySide: false,
		language: 'fr',
		pickTime: false,
		minuteStepping: 5,
		format: 'DD/MM/YYYY'
	});

	$('#dateFrom').data("DateTimePicker").setDate(moment().subtract(90, "d"));
	$('#dateTo').data("DateTimePicker").setDate(moment());

	$("#dateFrom").on("dp.change", function(e) {
		$('#dateTo').data("DateTimePicker").setMinDate(e.date);
		populateContractList();
		$(this).blur();
	});
	$("#dateTo").on("dp.change", function(e) {
		$('#dateFrom').data("DateTimePicker").setMaxDate(e.date);
		populateContractList();
		$(this).blur();
	});
}

/**
 * Initialize all datepickers of the page
 * @returns {undefined}
 */
function initDatePicker() {
	$.datepicker.setDefaults($.datepicker.regional[ "fr" ]);
	$.datepicker.setDefaults({
		dateFormat: 'dd-mm-yy',
		showWeek: true,
		firstDay: 1,
		changeYear: true
	});

	$("#dateStartContract").datetimepicker({
		timeFormat: 'HH:mm',
		stepHour: 1,
		stepMinute: 5,
	});

	// Make sure time interval are consistent
	$("#dateFrom").datepicker({
		alwaysSetTime: false,
		onSelect: function(selectedDate) {
			$('#dateTo').datetimepicker('option', 'minDate', $('#dateFrom').datetimepicker('getDate'));
			populateContractList();
		}
	});

	$("#dateTo").datepicker({
		alwaysSetTime: false,
		onSelect: function(selectedDate) {
			$('#dateFrom').datetimepicker('option', 'maxDate', $('#dateTo').datetimepicker('getDate'));
			populateContractList();            
		}
	});

	// Initialize the datepickers
	var now;
	now = new Date();
	now.setDate(now.getDate() - 15);
	$("#dateFrom").datepicker('setDate', now); 

	now = new Date();
	now.setDate( now.getDate() );
	$("#dateTo").datepicker('setDate', now);

	now = new Date();
	$("#dateStartContract").datepicker('setDate', now);    

	//Use default dates to define min (resp max) date of time selectors
	$("#dateFrom").datepicker('option', 'maxDate', $('#dateTo').datetimepicker('getDate'));
	$("#dateTo").datepicker('option', 'minDate', $('#dateFrom').datetimepicker('getDate'));
}

/**
 * Initialise the selector of main locations
 * @returns {undefined}
 */
function initSelector() {
	//Define default behaviour of chosen selector
	$(".chosen-select").chosen({
		allow_single_deselect: true,
		no_results_text: 'Oops, nothing found!',
		disable_search: false,
		disable_search_threshold: 5,
		width: "100%",
	});

	//Populate selectors in the filter section
	populateSelector("#select-contractor", 1);

	// Populate selectors in the new contract section
	populateSelector("#select-new-author", 0);
	populateSelector("#select-new-contractor",0);    

}

/**
 * Populate selectors (chosen jquery control)
 * @param {type} mySelector (contractor // sublocation //author)
 * @param {type} isFilter precise if the selector is used to filter new contracts or to create a new one
 * @returns {undefined}
 */
function populateSelector(mySelector, isFilter) {   
	isFilter = typeof isFilter !== 'undefined' ? isFilter : 0;

	var myDiv = $(mySelector);
	myDiv.empty();
	myDiv.append($("<option />").val("%").text(""));

	if (mySelector.indexOf("contractor") !== -1) {
		for (var i in allContractor) {
			myDiv.append($("<option/>").val(i).text(allContractor[i].title));
		}
	}

	if (mySelector.indexOf("author") !== -1) {
		for (var idUser in allUser) {
			myDiv.append($("<option/>").val(idUser).text(allUser[idUser].userDisplay));            
		}
	}

	myDiv.trigger("chosen:updated");

	// Make sure to update the contract list when changing the filters
	if (isFilter) {
		myDiv.chosen().change(function(event) {
			populateContractList();            
		});
	}   
}

function initContractTable() {
	contractTable = $('#contract-table').dataTable( {
		"bDestroy":true,
		"lengthMenu": [[10, 50, 100, 250], [10, 50, 100, 250]],
		"bFilter": false,
		"bInfo": true,
		"ordering": true,
		"sPaginationType": "full_numbers",
		"autoWidth": false,
		"responsive": {
			"details": {
				'type': "column",
			},
		},
		"language" : {
			"sProcessing":     "Traitement en cours...",
			"sSearch":         "Rechercher :",
			"sLengthMenu":     "Afficher _MENU_ contrats",
			"sInfo":           "Affichage des contrats _START_ &#224; _END_ sur _TOTAL_ contrats",
			"sInfoEmpty":      "Affichage de 0 contrats",
			"sInfoFiltered":   "(filtrer de _MAX_ contrats au total)",
			"sInfoPostFix":    "",
			"sLoadingRecords": "Chargement en cours...",
			"sZeroRecords":    "Aucun contrat &#224; afficher",
			"sEmptyTable":     "Aucun contrat disponible dans le tableau",
			"oPaginate": {
				"sFirst":      "<<",
				"sPrevious":   "<",
				"sNext":       ">",
				"sLast":       ">>"
			},
			"oAria": {
				"sSortAscending":  ": activer pour trier la colonne par ordre croissant",
				"sSortDescending": ": activer pour trier la colonne par ordre d&#233;croissant"
			}
		},
		"order": [[3, 'desc']],
		"fnDrawCallback": function() {
			alterTableDraw(this); 
		},
		// Trois premieres colonnes non triable
		"aoColumnDefs": [{ bSortable: false, aTargets: [ 0, 1, 2, -1 ]},],
		"columns": [
		            {
		            	"class":          'control action',
		            	"orderable":      false,
		            	"data":           null,
		            	"defaultContent": ""

		            },
		            { "data": "view", "class": "action" },
		            { "data": "edit", "class": "action" },
		            { "data": "startDate", "render": {
		            	"sort": 'startTimestamp',
		            	"_": 'display',
		            } },
		            { "data": "endDate", "render": {
		            	"sort": 'endTimestamp',
		            	"_": 'display',
		            } },
		            { "data": "title" },
		            { "data": "contractor" },
		            { "data": "author" },
		            { "data": "content" },
		            { "data": "files_display" },
		            ],

	});

	// On place la liste du nombre d'contrats à afficher en bas du tableau
	$("#contract-table_wrapper div.row").first().insertBefore($("#contract-table_wrapper div.row").last());
}

/**
 * Get from the database the list of contracts
 * Use filters by date / mainLocation
 * @returns {undefined}
 */
function populateContractList() {
	console.log("Trying to populate contractList");

	//Close all already displayed contracts to avoid to mess up everything
	$("#allContracts > [id^=contract-]:not(#contract-000)").remove(); 

	var contractor = $("#select-contractor option:selected").val();
	var dateFrom = parseLocalMoment($('#dateFrom').data("DateTimePicker").getDate(),"YYYY/MM/DD HH:mm");
	var dateTo = parseLocalMoment($('#dateTo').data("DateTimePicker").getDate().clone().add(1,'day'),"YYYY/MM/DD HH:mm"); 

	console.log("contractor:" + contractor + ", dateFrom:" + dateFrom + ", dateTo: " + dateTo);

	// Fire the AJAX call !
	$.post("ajax/getContractList.php", {contractor: contractor, dateFrom: dateFrom, dateTo: dateTo}, function(data) {
		contractList = JSON.parse(data);

		// empty the table
		contractTable.fnClearTable();

		for (var index in contractList) {
			if(index==='log'){
				//console.log(contractList['log']);
				continue;
			}
			idContract = contractList[index].idContract;            
			startDate = contractList[index].startDate;
			startTimestamp = contractList[index].startTimestamp;
			endDate = contractList[index].endDate;
			endTimestamp = contractList[index].endTimestamp;

			idAuthor = contractList[index].idUser;
			authorDisplay = (idAuthor !== null) && (idAuthor != 0) ? allUser[idAuthor].userDisplay:"";

			idContractor = contractList[index].idContractor;
			contractorDisplay = (idContractor !== null) && (idContractor != 0) ? allContractor[idContractor].title:"";

			title = contractList[index].title;
			content = contractList[index].content;

			files = contractList[index].files;

			var row = {
					"idContract" : idContract,
					"startDate" : { "display" : startDate, "startTimestamp" : startTimestamp },
					"endDate" : { "display" : endDate, "endTimestamp" : endTimestamp },
					"contractor": contractorDisplay,
					"author" : authorDisplay,
					"title"  : title,
					"content"  : content,
					"files"  : files,
					"files_display" : printFilesList(files),
					"view" : "<button  type='button' class='btn btn-default btn-xs' id='view-" + idContract + "' title='Voir' onclick='showContract(" + idContract + ")'><span class='" + viewMoreClass +"'></span></button>",
					"edit" : "<button  type='button' class='btn btn-default btn-xs' id='edit-" + idContract + "' title='Editer' onclick='editContract(" + idContract + ")'><span class='glyphicon glyphicon-pencil'></span></button>"
			};
			contractTable.fnAddData( row );
		}
		contractTable.fnDraw();
	});
}

/**
 * Toggle visibility of contract display
 * @param {type} idContract
 * @returns {undefined}
 */
function showContract(idContract) {
	var isDisplayed = $('#contract-' + idContract).length != 0;

	if (!isDisplayed) {
		$.post("ajax/showContract.php", {idContract: idContract}, function(data) {
			populateContract(data, idContract);
			$("#view-" + idContract).find('span.glyphicon').attr("class", viewMinusClass);
			$("#view-" + idContract).attr("title", "Plus de détails");
			$('html, body').animate({
				scrollTop: $("#contract-" + idContract).offset().top
			}, 1000);
		});
	} else {
		$('#contract-' + idContract).remove();
		$("#view-" + idContract).find('span.glyphicon').attr("class", viewMoreClass);
		$("#view-" + idContract).attr("title", "Moins de détails");
	}
}

/**
 * Function called by succesfull ajax call to populate a Contract to display
 * @param {type} data
 * @param {type} idContract
 * @returns {undefined}
 */
function populateContract(data,idContract){
	console.log("trying harder to show contract "+idContract);
	var contractDetails = JSON.parse(data);

	// Get the pattern anc clone-it
	var contractDiv = $("#contract-000").clone(true,true);    

	// Update triggers
	contractDiv.attr("id","contract-"+idContract);
	contractDiv.attr("data-sort", contractDetails.timestamp);
	contractDiv.find(".contract-menu .edit-contract").attr("onClick","editContract("+idContract+")");
	contractDiv.find(".contract-menu .delete-contract").attr("onClick","deleteContract("+idContract+")");   
	contractDiv.find(".contract-menu .hide-contract").attr("onClick","showContract("+idContract+")");

	// Insert the new Div in the list
	$("#allContracts").append(contractDiv);

	moment.lang('fr');
	$("#contract-" + idContract + " .contract-recordDate").html(contractDetails.recordDate);
	$("#contract-" + idContract + " .contract-startDate").html(contractDetails.startDate);
	$("#contract-" + idContract + " .contract-endDate").html(contractDetails.endDate);

	$("#contract-"+idContract+" .contract-title").html(contractDetails.title);
	$("#contract-"+idContract+" .contract-content").html(nl2br(contractDetails.content));

	$("#contract-"+idContract+" .contract-fees").html(contractDetails.fees);
	$("#contract-"+idContract+" .contract-amount").html(contractDetails.amount);

	//Insert userName (if none userName, use NotAvailable
	idUser = contractDetails.idUser;
	author = (idUser !== null) ? allUser[idUser].userDisplay : "N/A";    
	$("#contract-"+idContract+" .item .contract-author").html(author);
	$("#contract-"+idContract+" .item .contract-author").attr("id","user-"+idUser);

	//Insert location (use displayLoc)
	idContractor = contractDetails.idContractor;
	contractor = (idContractor !== null) ? allContractor[idContractor].title : "N/A";                
	$("#contract-"+idContract+" .item .contract-contractor").html(contractor);
	$("#contract-"+idContract+" .item .contract-contractor").attr("id","idContractor-"+idContractor);

	if (contractDetails.files.length > 0) {
		var filesBody = contractDiv.find('.contract-files').find("tbody");
		filesBody.html(printFileRow(contractDetails.files));
	} else {
		contractDiv.find('.contract-files').hide();
	}
	
	if (contractDetails.substrats.length > 0) {
		var substratsBody = contractDiv.find('.contract-substrats').find("tbody");
		substratsBody.html(printSubstratRow(contractDetails.substrats));
	} else {
		contractDiv.find('.contract-substrats').hide();
	}

	//Display the contract element within the allContract element    
	document.getElementById("contract-"+idContract).style.display = "block";  

	//tri des cartouches selon l'attribut data-sort qui est égal à leur timestamp
	$("#allContracts > [id^=contract-]:not(#contract-000)").sort(function (a, b) {
		var contentA =parseInt( $(a).data('sort'));
		var contentB =parseInt( $(b).data('sort'));
		return contentA > contentB ? -1 : 1;
	});
}

/**
 * Allows to edit an existing contract
 * @param {type} idContract
 * @returns {undefined}
 */
function editContract(idContract) {
	// Make sure the new contract cartouche is off 
	showNewContract("off");
	//and hide the displayed contract which will be edited (if it's displayed)
	//in case we click on the Edit button directly from the table
	if ($('#contract-' + idContract).length != 0) {
		showContract(idContract);
	}

	var myDiv = $("#newContract-000")
	myDiv.attr("id","newContract-"+idContract);
	$(".insert-newContract").attr("onClick","insertNewContract("+idContract+")");      

	document.getElementById("newContract-"+idContract).style.display = "block";

	$('html, body').animate({
		scrollTop: $("#newContract-" + idContract).offset().top
	}, 1000);

	myDiv.find(".panel-title").text("Edition d'un contrat");

	// Populate the interface with data already stored about this contract
	$.post("ajax/showContract.php", {idContract: idContract}, function(data) {
		var contractDetails = JSON.parse(data);
		
		var startDate = moment.utc(contractDetails.startDateUTC).local();
		$("#dateStartContract").data("DateTimePicker").setDate(startDate);

		if (contractDetails.endDateUTC != null) {
			var endDate = moment.utc(contractDetails.endDateUTC).local();
			$("#dateEndContract").data("DateTimePicker").setDate(endDate);
		} else {
			$("#dateEndContract").val("");
		}

		$("#select-new-author").val(contractDetails.idUser);
		$("#select-new-author").trigger("chosen:updated");

		$("#select-new-contractor").val(contractDetails.idContractor);
		$("#select-new-contractor").trigger("chosen:updated");

		$("#new-title").val(contractDetails.title);
		$("#new-content").val(br2nl(contractDetails.content));   

		$("#new-fees").val(contractDetails.fees);
		$("#new-amount").val(br2nl(contractDetails.amount));   

		$.each(contractDetails.substrats, function (index, substrat) {
			idAuthor = substrat.idUser;
			authorDisplay = (idAuthor !== null) && (idAuthor != 0) ? allUser[idAuthor].userDisplay:"";
			//contracts = substrat.contracts.length > 0 ? " - "+ substrat.contracts.length + " contrat(s)" : "";

			var row = {
					"id" : substrat.idSubstrat,
					"date" : substrat.recordDate,
					"author" : authorDisplay,
					"name"  : substrat.title,
					"contracts" : "",
			};
			$("#new-contract-substrats").tokenInput("add", row);
		});

		addFiles(contractDetails.files, '#new-contract-files', true);
	}
	);
}

/**
 * Removes a Contract from the database
 * @param {type} idContract
 * @returns {undefined}
 */
function deleteContract(idContract) {
	//Prepare the deleteContract
	$('#myModal').find(".modal-title").html("Confirmation");
	$('#myModal').find(".modal-body").html("Voulez-vous supprimer le contrat ?");
	$('#myModal').find("#modal-button-1").html("Non");
	$('#myModal').find("#modal-button-1").off("click");
	$('#myModal').find("#modal-button-2").off("click");
	$('#myModal').find("#modal-button-2").html("Supprimer").show();
	$('#myModal').modal('toggle');
	$('#myModal').find("#modal-button-2").click(function(){
		$.post("ajax/deleteContract.php", {idContract: idContract}, function(data) {
			var dataset = JSON.parse(data);
			$('#myModal').find(".modal-body").html(dataset.modal);
			$('#myModal').find("#modal-button-1").html("Fermer");
			$('#myModal').find("#modal-button-2").hide();
			populateContractList();
		});        
	});    
}

/**
 * 
 * @param {type} order: on or off to show or hide a contract
 * @returns {undefined}
 */
function showNewContract(order) {
	flushDivNewContract();

	var div = $("[id^=newContract]").get(0);
	if (typeof order === "undefined") {
		order = (div.style.display === "none") ? "on" : "off";
	}

	if (loggedUser != null) {
		$("#select-new-author").val(loggedUser);
		$('#select-new-author').trigger('chosen:updated');
	}

	switch (order) {
	case "on":            
		div.style.display = "block";

		$('html, body').animate({
			scrollTop: $("[id^=newContract]").offset().top
		}, 1000);
		break;
	case "off":
		div.style.display = "none";
		break;
	}
}

/**
 * Insert or edit (delete and insert) a contract
 * @param {type} idContract
 * @returns {undefined}
 */
function insertNewContract(idContract) {
	idContract = (typeof idContract === "undefined") ? -1 : idContract;

	if (idContract === -1) {
		console.log("Inserting new contract");
	} else {
		console.log("Editing contract " + idContract);
	}

	var startDate = $("#dateStartContract").data("DateTimePicker").getDate().utc().format("YYYY/MM/DD HH:mm:ss");
	var endDate = $("#dateEndContract").val() != "" ? $("#dateEndContract").data("DateTimePicker").getDate().utc().format("YYYY/MM/DD HH:mm:ss") : "";
	var idAuthor = $("#select-new-author").val();
	var idContractor = $("#select-new-contractor").val();
	var title = $("#new-title").val();
	var content = $("#new-content").val();
	var fees = $("#new-fees").val();
	var amount = $("#new-amount").val();

	var files =new Array();
	$("#new-contract-files tbody tr").each(function(index, element) {
		var idFile = $(element).prop('id');
		if (idFile != null && idFile != "") {
			files[index] = idFile;
		}
	});

	var substrats = [];
	var selected = $('#new-contract-substrats').val().split(",");
	for	(index = 0; index < selected.length; index++) {
		substrats.push(selected[index]);
	}

	//console.log("startDate:" + startDate + "endDate:" + endDate + "\n idAuthor:" + idAuthor + "\n idContractor:" + idContractor + "\n title:" + title + "\n content:" + content);

	$.post("ajax/insertContract.php",{idContract:idContract, startDate: startDate, endDate: endDate, 
		idAuthor: idAuthor, idContractor: idContractor, title: title, content: content, 
		files: files, substrats:substrats, fees:fees, amount:amount}, function(data) {
			insertDetails = JSON.parse(data);
			idContract = insertDetails.idContract;
			//console.log(insertDetails.log);
			flushDivNewContract();
			populateContractList();
			showNewContract("off");
			//showContract(idContract);
			$('#myModal').find(".modal-title").html("Enregistrement d'un contrat");
			$('#myModal').find(".modal-body").html(insertDetails.modal);
			$('#myModal').find("#modal-button-1").html("Fermer");
			$('#myModal').find("#modal-button-2").hide();
			$('#myModal').modal('toggle');          
		});
}

/**
 * Reset all the controllers of the new-Contract container
 * @returns {undefined}
 */
function flushDivNewContract() {
	var myDiv = $("[id^=newContract]");

	myDiv.find(".panel-title").text("Saisie d'un nouveau contrat");

	$(".insert-newContract").attr("onClick", "insertNewContract()");
	myDiv.attr("id", "newContract-000");

	var tableBody = myDiv.find("tbody").eq(0);
	tableBody.empty();

	$("#dateStartContract").data("DateTimePicker").setDate(moment());
	$("#dateEndContract").data("DateTimePicker").setDate(moment());

	$('#select-new-author > option').prop('selected', false);
	$('#select-new-author').trigger("chosen:updated");

	$('#select-new-contractor > option').prop('selected', false);
	$('#select-new-contractor').trigger("chosen:updated");

	$("#new-title").val("");
	$("#new-content").val("");
	$("#new-fees").val("");
	$("#new-amount").val("");
	$("#new-contract-substrats").tokenInput("clear");
	$("#new-contract-substrats-view").hide();
	$("#new-contract-files").dataTable().fnClearTable();
}

function initSubstratToken() {
	var substrats = [];
	$.post("ajax/getSubstratList.php", {}, function(data) {
		substratList = JSON.parse(data);

		for (var index in substratList) {
			idSubstrat = substratList[index].idSubstrat;            
			date = substratList[index].recordDate;
			idAuthor = substratList[index].idUser;
			authorDisplay = (idAuthor !== null) && (idAuthor != 0) ? allUser[idAuthor].userDisplay:"";
			title = substratList[index].title;
			contracts = substratList[index].contracts.length > 0 ? " - "+ substratList[index].contracts.length + " contrat(s)" : "";

			var row = {
					"id" : idSubstrat,
					"date" : date,
					"author" : authorDisplay,
					"name"  : title,
					"contracts" : contracts,
			};

			substrats.push( row );
		}
		$("#new-contract-substrats")
		.tokenInput(
				substrats
				, {
					preventDuplicates: true,
					hintText: "Tapez le nom du substrat",
					noResultsText: "Aucun substrat trouvé",
					searchingText: "Recherche en cours...",
					deleteText: "<span title='Annuler' class='glyphicon glyphicon-remove text-danger'></span>",
					resultsFormatter: function(item){ return "<li>" + "<div style='display: inline-block; padding-left: 10px;'><div class='name'>" + item.name + "</div><div class='author'>" + item.author + "</div></div></li>" },
					tokenFormatter: function(item) { return "<li id="+ item.id +"><p>" + item.name + " <b style='color: red'>" + item.contracts + "</b></p></li>" },
					onReady: function (item) {
						updateSubstratView();
					},
				}
		);
	});
}

function updateSubstratView() {
	$("ul.token-input-list").click(function (event) {
		var li = $(event.target).closest("li");
		var idSubstrat = li.prop("id");
		if (idSubstrat != "") {

			$.post("ajax/showSubstrat.php", {idSubstrat: idSubstrat}, function(data) {
				var substratDetails = JSON.parse(data);
				$('#new-contract-substrats-view').find("label").html(substratDetails.title);
				$('#new-contract-substrats-view').show();

				var node_ids = [];
				var nodes = []
				$.each(substratDetails.parameters, function (index, parameter) {
					node_ids.push(parameter.id)
					nodes.push(parameter);
				});
				if (nodes.length > 0) {
					$(".substrat-parameters-tree")
					.jstree({
						'core' : {
							'multiple' : true,
							'data' : {
								'url' : '?operation=get_tree&object=parameter&ids=' + node_ids.join(":"),
								'data' : function (node) {
									$.each(nodes, function (index, parameter) {
										if (node.id == parameter.id) {
											node.data.value = parameter.value;
											node.data.unit = parameter.unit;
											node.data.deviation = parameter.deviation;
										}
									});
									return { 'id' : node.id };
								}
							},
//							'data': nodes,
							'check_callback' : true,
						},
						"types" : {
							"category" : {
								"icon" : "glyphicon glyphicon-folder-close"
							},
							"parameter" : {
								"icon" : "glyphicon glyphicon-asterisk"
							}
						},
						"grid": {
							columns: [
							          {width: 120, header: "Paramètres",title:"_DATA_"},
							          {value: "value", width: 30, header: "Valeur", title:"value"},
							          {value: "unit", width: 30, header: "Unité", title:"unit"},
							          {value: "deviation", width: 40, header: "Écart type", title:"deviation"}
							          ],
							          resizable:true
						},
						'plugins' : ['types', 'grid'],
					}).on('open_node.jstree', function (e, data) {
						$("#substrat-"+idSubstrat+" .substrat-parameters-tree #" + data.node.id).find('i.jstree-icon.jstree-themeicon').first()
						.removeClass('glyphicon-folder-close').addClass('glyphicon-folder-open');
					}).on('close_node.jstree', function (e, data) {
						$("#substrat-"+idSubstrat+" .substrat-parameters-tree #" + data.node.id).find('i.jstree-icon.jstree-themeicon').first()
						.removeClass('glyphicon-folder-open').addClass('glyphicon-folder-close');
					}).bind("loaded.jstree", function (e, data) {
						$(this).jstree("open_all");
					});
				} else {
					$(".substrat-parameters-tree").jstree("destroy");
				}
			});
		}
	});
}