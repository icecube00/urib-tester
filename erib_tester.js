var Duration, reqSent;
var newhttp;
var showAlerts, showCatchedErr, alertLevel, forEmulator, isSSL;
var warnText = '', errorText = '', emulatorExt = "";
var tempXML = '', tempREQ = '', tempFileName = '', text2save = '', reqParams = '';
var g_form_id = '';
var requestName = '';
var eribAddress;
var eribServerInfo = {
	region : new productListObj(),
	csaAddrr : "",
	eribAddr : "",
	changed : Timer() + "::declare(INIT)"
};

var emptyXML = getXMLObject('<response></response>', true);
var eribClientInfo = new eribPerson();
var eribEntity = new erib_structure(emptyXML);

var psiURL = '', pathEmulator = '';
var timePassed = 0, timeStarted = 0, updateInterval;

var permissionsL2 = ["needUDBO", "ATMStorage", "AccountAbstract", "AccountBankDetails", "AccountClosingPayment", "AccountInfo", "AccountOpeningClaim",
	"AutoPaymentInfo", "AutoSubscriptionInfo", "BanksDictionary", "CardAbstract", "CardInfo", "CloseAutoSubscriptionPayment",
	"CloseMoneyBoxPayment", "CloseP2PAutoTransferClaim", "CreateAutoPaymentPayment", "CreateAutoSubscriptionPayment",
	"CreateLongOfferPayment", "CreateLongOfferPaymentForRur", "CreateMoneyBoxPayment", "CreateP2PAutoTransferClaim", "CreditCardOffice",
	"DelayAutoSubscriptionPayment", "DelayP2PAutoTransferClaim", "EditAutoPaymentPayment", "EditAutoSubscriptionPayment",
	"EditMoneyBoxClaim", "EditP2PAutoTransferClaim", "IMAccountAbstract", "InternalPayment", "JurPayment", "LoanAbstract",
	"LoanCardOffer", "LoanCardProduct", "LoanInfo", "LoanOffer", "LoanProduct", "LongOfferInfo", "LoyaltyInternal",
	"LoyaltyProgramRegistrationClaim", "MoneyBoxManagement", "Offers", "OperationCodesDictionary", "PFRClaimsList", "PFRStatement",
	"PFRStatementClaim", "Payments", "Permissions", "Products", "Rates", "RecoverMoneyBoxPayment", "RecoveryAutoSubscriptionPayment",
	"RecoveryP2PAutoTransferClaim", "RefuseAutoPaymentPayment", "RefuseLongOffer", "RefuseMoneyBoxPayment", "RegionsDictionary",
	"Registration", "RegularPayments", "RemoveTemplate", "RurPayJurSB", "RurPayment", "Templates"];

function getCards() {
	//console.log('getCards()');
	try {
		params = [];
		if (isCheckedBox('mobileBank'))
			params.push('show="mobileBank"');
		if (isCheckedBox('way4'))
			params.push('show="way4"');
		if (isCheckedBox('equalPan'))
			params.push('show="equalPan"');
		if (isCheckedBox('chooseAgreement'))
			params.push('show="chooseAgreement"');
		if (isCheckedBox('bankOffer'))
			params.push('show="bankOffer"');
		HttpRequest("http://10.80.238.26:8118/erib-status/api/cards", params.join("&"), "urlencoded", "POST", false, true, true);
	} catch (e) {
		warnText += "Сервер проверки статуса ЕРИБ не доступен.\r\n";
		//console.warn('getCards: Сервер проверки статуса ЕРИБ не доступен' + e.message);
	}
}

function Version(eribSpec) {
	//console.log('Version(' + eribSpec + ')');
	eribAddress = new eribAddressConf();
	var currentSvr = eribAddress.get();
	if (eribServerInfo.csaAddrr.isEmpty()) {
		eribServerInfo.csaAddrr = currentSvr;
	} else {
		eribServerInfo.eribAddr = currentSvr;
	}
	document.getElementById('currentServer').innerHTML = 'Default: [' + currentSvr + ']';
	try {
		if (!eribSpec.isEmpty()) {
			var htmlVersion = document.getElementById('version').title + eribSpec;
			document.getElementById('version').innerHTML = 'jcode version:' + scriptVersion + '<br />' + htmlVersion;
			//console.log('Version: jcode version:' + scriptVersion + ' :: ' + htmlVersion);
		}
	} catch (e) {
		//eribSpec is an object, not a string
	}
}

function toggleView(what2Do) {
	var icon = document.getElementById('configIcon');
	var innerTr = document.getElementById('settings');
	var erib_debug = document.getElementById('erib_debug');
	if (!what2Do && innerTr)
		what2Do = innerTr.style.display;
	switch (what2Do) {
	case "none":
		if (innerTr)
			innerTr.style.display = 'block';
		icon.src = "btn_settings_hot.png";
		break;
	case "block":
		if (isCheckedBox("useStatus")) {
			document.getElementById("useStatus").checked = false;
			getCards();
		}
		if (erib_debug)
			erib_debug.style.display = 'none';
		if (innerTr)
			innerTr.style.display = 'none';
		icon.src = "btn_settings_pressed.png";
		break;
	default:
		if (erib_debug)
			erib_debug.style.display = 'none';
		if (innerTr)
			innerTr.style.display = 'none';
		icon.src = "btn_settings_pressed.png";
		break;
	}
}

var choiceAddr = [];
function prepareChoiceAddr() {
	choiceAddr = getElementsByClassName(document.getElementById('settings'), 'option');
}

function eribAddressConf() {
	try {
		//document.getElementById('settings').addEventListener('mouseleave', Version, true);
		document.getElementById('settings').onmouseleave = function onmouseleave(event) {
			Version('');
		};
	} catch (e) {}
	this.get = function () {
		var eribAddress = '---';
		for (var i = 0; i < 2; i++) {
			var choosenAddrChildren = getChildren(choiceAddr[i]);
			if (choosenAddrChildren[0].checked)
				eribAddress = choosenAddrChildren[1].value;
		}
		//console.log('eribAddressConf.get(): eribAddress: ' + eribAddress);
		return eribAddress;
	};
	this.set = function (eribAddress) {
		//console.log('eribAddressConf.set(eribAddress: ' + eribAddress + ')');
		var choosenAddrChildren = getChildren(choiceAddr[0]);
		if (choosenAddrChildren[0].checked)
			choosenAddrChildren[1].value = eribAddress;
		Version();
	};
	this.options = function () {
		//console.log('eribAddressConf.options()');
		var choosenAddrChildren = getChildren(choiceAddr[1]);
		if (choosenAddrChildren[0].checked)
			return choosenAddrChildren[1].options;
		return [];
	};
	this.add = function (newoption) {
		//console.log('eribAddressConf.add(newoption)');
		var choosenAddrChildren = getChildren(choiceAddr[1]);
		if (choosenAddrChildren[0].checked)
			choosenAddrChildren[1].add(newoption);
		Version();
	};

}

function init_my_page(dontUpdate, isSave2File) {
	//console.log('init_my_page(dontUpdate:' + dontUpdate + ', isSave2File:' + isSave2File + ')');
	divChoice();
	errorText = '';
	showAlerts = isCheckedBox('showAlerts');
	forEmulator = isCheckedBox('forEmulator');
	showCatchedErr = isCheckedBox('showCatchedErr');
	isSSL = isCheckedBox('isSSL');
	alertLevel = document.getElementById('alertLevel').value;
	document.getElementById("erib_debug").innerHTML = '';
	if (!isSave2File)
		document.getElementById("buttons").innerHTML = '';
	if (!dontUpdate) {
		timePassed = 0;
		document.getElementById("save2File").innerHTML = '';
		document.getElementById("resultTab").innerHTML = '';
	}
	//console.log('init_my_page:' + 'forEmulator:' + forEmulator + '\r\n' + 'showAlerts:' + showAlerts + '\r\n' + 'showCatchedErr:' + showCatchedErr + '\r\n' + 'isSSL:' + isSSL + '\r\n' + 'alertLevel:' + alertLevel);
}

function updateStatus() {
	//console.log('updateStatus()');
	var erib_status = document.getElementById("erib_status");
	var timeoutInSec = parseInt(document.getElementById('timeOut').value, 10);
	var step = parseInt(255 / timeoutInSec, 10);
	erib_status.style.textAlign = 'center';
	if (timePassed === 0)
		erib_status.style.backgroundColor = 'rgb(255,255,255)';
	var bgColor = erib_status.style.backgroundColor.split(',')[1];
	var greenColor = parseInt(bgColor - step, 10);
	if (greenColor < 0)
		greenColor = 0;
	erib_status.style.backgroundColor = 'rgb(255,' + greenColor + ',' + greenColor + ')';
	erib_status.style.color = '#000000';
	timePassed = Timer() - timeStarted;
	var statusSpan = document.createElement('span');
	//console.log('updateStatus: timePassed:' + timePassed);
	if (timeStarted > 0 && (timeoutInSec * 1000) < timePassed) {
		clearInterval(updateInterval);
		erib_status.innerHTML = '<span class="status"><br /><b>Истекло время ожидания.</b></span>';
	} else {
		if (timeStarted > 0) {
			timePassed = Timer() - timeStarted;
		} else {
			timePassed = 0;
		}
		var timeLeft = timeoutInSec - parseInt(timePassed / 1000, 10);
		erib_status.innerHTML = '<span class="status"><br /><b>Выполняется запрос. Подождите, пожалуйста...</b><br />До истечения таймаута: <b>' + timeLeft + '</b> сек.</span>';
	}
}

function trySubmit(form_id, isIt4Save, currentAddr) {
	//console.log('trySubmit(form_id:' + form_id + ', isIt4Save:' + isIt4Save + ', currentAddr:' + currentAddr + ')');
	g_form_id = form_id;
	if (!currentAddr)
		currentAddr = '';
	var operationName = eribOperations.item(form_id);
	var temp_form_id = '';
	//console.log('trySubmit: form_id:' + form_id + '\r\n' + 'currentAddr: ' + currentAddr + '\r\n' + 'operationName: ' + operationName);
	if (operationName === 'logon' && eribServerInfo.eribAddr.isEmpty()) {
		eribServerInfo.eribAddr = eribAddress.get();
		eribServerInfo.changed = Timer() + " :: " + operationName + " :: eribAddr";
		//console.log('eribServerInfo: ' + eribServerInfo.changed);
	}
	if (operationName === 'multylogon.stage2' && eribEntity.host.isEmpty()) {
		//console.log('eribEntity: clear');
		eribEntity = new erib_structure(emptyXML);
		alert("Вы не можете выполнить запрос аутентификации по токену в указанном блоке.\r\nОтсутствует адрес блока.\r\nВыполните запрос 4.1.2!");
		return;
	}
	if (operationName === 'logon' || operationName === 'multylogon.stage1') {
		//console.log('eribEntity: clear');
		eribEntity = new erib_structure(emptyXML);
		if (operationName === 'logon') {
			eribServerInfo.csaAddrr = '';
			eribServerInfo.changed = Timer() + "::" + operationName + ":: csaAddrr";
			//console.log('eribServerInfo: ' + eribServerInfo.changed);
		}
		if (eribClientInfo.logedIn) {
			//console.log('eribClientInfo: clear');
			eribClientInfo = new eribPerson();
			temp_form_id = g_form_id;
			trySubmit("4.1.6", true, eribServerInfo.eribAddr);
			g_form_id = temp_form_id;
			if (!currentAddr.isEmpty() && currentAddr !== eribServerInfo.eribAddr)
				eribAddress.set(currentAddr);
			//console.log('eribClientInfo: clear \r\n' + 'eribClientInfo.logedIn: ' + eribClientInfo.logedIn + '\r\n' + 'eribClientInfo.permissionsChecked: ' + eribClientInfo.permissionsChecked);
		}
		if (operationName === 'multylogon.stage1') {
			if (!eribServerInfo.csaAddrr.isEmpty() && eribServerInfo.csaAddrr !== "---") {
				currentAddr = eribServerInfo.csaAddrr;
			} else {
				currentAddr = eribServerInfo.eribAddr;
				eribServerInfo.csaAddrr = eribServerInfo.eribAddr;
			}
			eribServerInfo.eribAddr = "";
			eribServerInfo.changed = Timer() + "::" + operationName + ":: eribAddr";
			//console.log('eribServerInfo: ' + eribServerInfo.changed);
		}
	}
	init_my_page();
	clearInterval(updateInterval);
	timeStarted = Timer();
	updateInterval = window.setInterval(function () {
			updateStatus();
		}, 1000);
	setTimeout(function () {
		trySubmit_new(form_id, isIt4Save, currentAddr);
	}, 1000);
}

function trySubmit_new(form_id, isIt4Save, currentAddr) {
	//console.log('trySubmit_new(form_id:' + form_id + ', isIt4Save:' + isIt4Save + ', currentAddr:' + currentAddr + ')');
	var operationName = eribOperations.item(form_id);
	var async = true;
	if (operationName === 'logoff') {
		async = false;
		currentAddr = eribServerInfo.eribAddr;
		eribServerInfo.eribAddr = '';
		eribServerInfo.changed = Timer() + "::" + operationName + ":: eribAddr";
		//console.log('eribServerInfo: ' + eribServerInfo.changed);
		//console.log('eribEntity: clear');
		eribEntity = new erib_structure(emptyXML);
		//console.log('eribClientInfo: clear');
		eribClientInfo = new eribPerson(); ;
	}
	if (operationName === 'multylogon.stage1') {
		if (eribServerInfo.csaAddrr.isEmpty()) {
			eribServerInfo.csaAddrr = eribAddress.get();
			eribServerInfo.changed = Timer() + "::" + operationName + ":: csaAddrr";
			//console.log('eribServerInfo: ' + eribServerInfo.changed);
		}
	}
	if (currentAddr.isEmpty()) {
		psiURL = eribAddress.get();
	} else {
		psiURL = currentAddr;
	}
	//console.log('URL: ' + psiURL);
	if (operationName === 'multylogon.stage2') {
		if (!eribServerInfo.eribAddr.isEmpty() && psiURL !== eribServerInfo.eribAddr)
			return;
	}
	if (showAlerts && alertLevel >= 80)
		alert('ERIB URL: ' + psiURL);
	if (psiURL === '---')
		return;

	var formData = document.getElementById(form_id);
	var formAction = formData.action.replace("psi-address", psiURL);
	pathEmulator = formData.action.replace("http://psi-address", "");

	if (isSSL)
		formAction = formAction.replace("http", "https");

	if (showAlerts && alertLevel >= 20)
		alert('URL: ' + formAction);

	var fields_array = setFormData(formData, "urlencoded");

	//splitting post parameters
	var fieldsLength = fields_array.length;
	var postdata = new dictionary();

	for (var currentField = 0; currentField < fieldsLength; currentField++) {
		var key = fields_array[currentField].split("=")[0];
		var value = [];
		if (!postdata.item(key).isEmpty()) {
			value = postdata.item(key);
			postdata.deleteitem(key);
		}
		value.push(fields_array[currentField].split("=")[1]);
		postdata.add(key, value);
	}

	var addonPostData = [];
	if (eribEntity) {
		if (eribEntity.isDocument & alter2spec.item(form_id).indexOf(eribEntity.formId) !== -1) {
			addonPostData = eribEntity.document;
		}
	}
	postdata = completePostData(addonPostData, postdata);

	var keys = postdata.key;
	var keyslength = keys.length;
	var resultFields = [];

	for (var currentkey = 0; currentkey < keyslength; currentkey++) {
		var values = postdata.item(keys[currentkey]);
		var valueslength = values.length;
		for (var currentValue = 0; currentValue < valueslength; currentValue++) {
			resultFields.push(keys[currentkey] + "=" + values[currentValue]);
		}
	}
	var erib_fileds2send = resultFields.join("&");
	reqParams = erib_fileds2send;
	if (isIt4Save && operationName === 'permissions') {
		isIt4Save = false;
		async = false;
	}
	HttpRequest(formAction, erib_fileds2send, "urlencoded", "POST", !isIt4Save, false, async);
}

function HttpRequest(URL, FormData, typeData, requestType, isIt4Save, getJSON, async) {
	//console.log('HttpRequest: URL: ' + URL + '\r\n' + 'FormData: ' + FormData + '\r\n' + 'typeData: ' + typeData + '\r\n' + 'requestType: ' + requestType + '\r\n' + 'isIt4Save: ' + isIt4Save + '\r\n' + 'getJSON: ' + getJSON + '\r\n' + 'async: ' + async);
	init_my_page(true);
	if (showAlerts && alertLevel >= 30)
		alert("HttpRequest('" + URL + "," + FormData + "," + typeData + "," + requestType + "')");
	var data;
	var strTimeout = "";
	var localHttp;
	if (newhttp === undefined) {
		newhttp = getXMLHttp();
	}
	if (async) {
		localHttp = newhttp;
	} else {
		localHttp = getXMLHttp();
	}
	try { //Add event listener
		if (getJSON) { //Запрос карт из ЕРИБ-статуса
			if (XMLHttpRequest.prototype.addEventListener) {
				localHttp.addEventListener("load", parseJSON, true);
			} else {
				if (localHttp.attachEvent) {
					localHttp.attachEvent("onload", parseJSON);
				} else {
					//console.log('HttpRequest:: Не удалось выполнить addEventListener и attachEvent');
					//localHttp.onload = function() {parseJSON(localHttp);};
					//async=false;
				}
			}
		}
		if (isIt4Save) { //Запрос к atmAPI
			if (XMLHttpRequest.prototype.addEventListener) {
				localHttp.addEventListener("load", parseAnswer, true);
			} else {
				if (localHttp.attachEvent) {
					localHttp.attachEvent("onload", parseAnswer);
				} else {
					//console.log('HttpRequest:: Не удалось выполнить addEventListener и attachEvent');
					//localHttp.onload = function() {parseAnswer(localHttp);};
					//async=false;
				}
			}
		}
	} catch (err) {
		warnText += err.message;
		//console.warn('HttpRequest: ' + warnText);
	}
	try { //Open XMLHttpRequest
		localHttp.open(requestType, URL + '?' + Timer(), async);
	} catch (e0) {
		strTimeout = " Не удалось получить ответ от удаленного сервера\r\n" + e0.name + ":" + e0.message;
		//console.warn('HttpRequest: ' + strTimeout);
	}
	localHttp.onreadystatechange = function () {
		if (localHttp.readyState === 4) {
			clearInterval(updateInterval);
			try { //Parse answer
				var tmpStatus = localHttp.status;
				if (getJSON)
					parseJSON(localHttp);
				if (isIt4Save)
					parseAnswer(localHttp);
			} catch (err) {
				strTimeout = " Не удалось получить ответ от удаленного сервера\r\n" + err.name + ":" + err.message;
				//console.warn('HttpRequest: ' + strTimeout);
			}
		}
	};
	try { //Set withCredentials
		localHttp.withCredentials = true;
	} catch (err) {
		warnText += "\r\nНе удалось установить параметр withCredentials\r\n" + err.name + ":" + err.message + '\r\n';
		//console.warn('HttpRequest: ' + warnText);
	}
	try { //Set msCaching
		localHttp.msCaching = true;
	} catch (err) {
		warnText += "\r\nНе удалось установить параметр msCaching\r\n" + err.name + ":" + err.message + '\r\n';
		//console.warn('HttpRequest: ' + warnText);
	}
	try { //Set timeout
		var timeoutInSec = parseInt(document.getElementById('timeOut').value, 10);
		localHttp.timeout = (timeoutInSec * 1000);
		localHttp.ontimeout = function () {
			strTimeout = " Время ожидания ответа истекло!";
			clearInterval(updateInterval);
			Duration = Timer() - timeStarted;
			localHttp.abort();
			data = {
				status : 999,
				responseText : "Не удалось установить соединение. " + strTimeout,
				responseXML : "Не удалось установить соединение. " + strTimeout,
				responseBody : "Не удалось установить соединение. " + strTimeout
			};
			//parseAnswer(data);
		};
	} catch (err) {
		warnText += "\r\nНе удалось установить таймаут\r\n" + err.name + ":" + err.message + '\r\n';
		//console.warn('HttpRequest: ' + warnText);
	}
	if (showAlerts && alertLevel >= 70)
		alert("newhttp: " + localHttp.readyState);

	localHttp.setRequestHeader("Cache-Control", "no-cache");
	localHttp.setRequestHeader("Pragma", "no-cache");
	localHttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");

	switch (typeData) {
	case "boundary":
		localHttp.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary + "; charset=win1251");
		break;
	case "urlencoded":
		localHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=win1251");
		break;
	case "soap":
		localHttp.setRequestHeader("Content-Type", "text/xml; charset=win1251");
		break;
	}
	try { //Send data
		reqSent = Timer(111);
		localHttp.send(FormData);
	} catch (e) {
		strTimeout = " localHttp.send():\r\n" + e.name + ": " + e.message;
		//console.error('HttpRequest: ' + strTimeout);
		showAlerts = false;
	}
}

function textFromStatus(code) {
	//console.log('textFromStatus(code:' + code + ')');
	switch (code) {
	case -1:
		return "Не смогли разобрать XML от ЕРИБа!!!";
		break;
	case 0:
		return "Ответ полностью успешный и не содержит ни одной ошибки.";
		break;
	case 1:
		return "Ответ содержит ошибки, которые необходимо отобразить пользователю. Возможно он может их исправить.";
		break;
	case 2:
		return "Возникала критическая ошибка на стороне сервера. Ответ не содержит запрашиваемой информации.";
		break;
	case 3:
		return "Текущая сессия недоступна. Необходимо повторить процесс аутентификации.";
		break;
	case 4:
		return "Сообщение содержит ошибки, однако может быть разобрано.";
		break;
	case 5:
		return "Доступ к функционалу или запрашиваемым данным запрещен.";
		break;
	default:
		return "Неизвестный код ответа ЕРИБ";
		break;
	}
}

function checkDependensies(selectionField, divId) {
	//console.log('checkDependensies(selectionField, divId:' + divId + ')');
	var selectionDiv = document.getElementById(divId);
	var childDivs = selectionDiv.getElementsByTagName('div');
	var selectedField = document.getElementById(selectionField).value;
	for (var i = 0; i < childDivs.length; i++) {
		var curDiv = childDivs[i].id;
		if (curDiv === selectedField) {
			childDivs[i].style.display = 'block';
		} else {
			childDivs[i].style.display = 'none';
		}
	}
}

function checkExactAmount(strTypeOfCharge) {
	//console.log('checkExactAmount(strTypeOfCharge:' + strTypeOfCharge + ')');
	var selection = document.getElementById('exactAmount');
	try {
		switch (strTypeOfCharge) {
		case 'sellAmount':
			selection.selectedIndex = 0;
			break;
		case 'buyAmount':
			selection.selectedIndex = 1;
			break;
		}
	} catch (error) {
		//console.error('checkExactAmount(' + strTypeOfCharge + '): ' + error.message);
		//А тут нет selection!
	}
}

function saveToFile(fileName) {
	//console.log('saveToFile(fileName:' + fileName + ')');
	init_my_page(true, true);
	var extention = ".txt";
	if (!fileName || fileName.isEmpty()) {
		fileName = 'eribTesterSaved';
	}
	if (showAlerts) {
		extention = "_response.txt";
		saveTextAs(tempREQ, 'log\\' + fileName + "_request.txt");
	}
	if (forEmulator) {
		extention = emulatorExt;
		fileName = pathEmulator.replace(/\//g, "\\");
		//alert (fileName + extention);
		saveTextAs(tempXML, fileName + extention, "windows-1251");
	} else {
		saveTextAs(tempXML, 'log\\' + fileName + extention, "windows-1251");
	}
}

function checkEmulator(parametersArray) {
	//console.log('checkEmulator(parametersArray:' + parametersArray + ')');
	var bTransId = true;
	var operation = getParam(parametersArray, "operation");
	var pan = getParam(parametersArray, "pan");
	var csaToken = getParam(parametersArray, "token");
	var agreementId = getParam(parametersArray, "agreementId");
	var transactionToken = getParam(parametersArray, "transactionToken");
	var form = getParam(parametersArray, "form");
	var billing = getParam(parametersArray, "billing");
	var id = getParam(parametersArray, "id");
	var template = getParam(parametersArray, "template");
	var autoPaymentId = getParam(parametersArray, "linkId");
	var loanId = getParam(parametersArray, "loanId");
	var claimId = getParam(parametersArray, "claimId");
	var parentId = getParam(parametersArray, "parentId");
	var offerId = getParam(parametersArray, "offerId");
	var longOfferId = getParam(parametersArray, "longOfferId");
	var depositId = getParam(parametersArray, "depositId");
	var type = getParam(parametersArray, "type");
	if (type.isEmpty()) {
		type = getParam(parametersArray, "showProductType", true);
	}
	if (type.isEmpty()) {
		type = getParam(parametersArray, "claimType", true);
	}
	var receiverSubType = getParam(parametersArray, "receiverSubType");
	if (!template.isEmpty()) {
		id = template;
	}
	if (!autoPaymentId.isEmpty()) {
		id = autoPaymentId;
	}
	if (!longOfferId.isEmpty()) {
		id = longOfferId;
	}
	if (!loanId.isEmpty()) {
		id = loanId;
	}
	if (!parentId.isEmpty()) {
		id = parentId;
	}
	if (!claimId.isEmpty()) {
		id = claimId;
	}
	if (!offerId.isEmpty()) {
		if (!id.isEmpty()) {
			id += "." + offerId;
		} else {
			id = offerId;
		}
	}
	if (!depositId.isEmpty()) {
		id = depositId;
	}

	var parameters = "";
	if (!operation.isEmpty()) {
		parameters += "." + operation;
	}
	if (!transactionToken.isEmpty()) {
		if (operation.contains("makeLongOffer")) {
			bTransId = transactionToken.contains("special");
		}
		if (bTransId) {
			parameters += "." + transactionToken;
		}
	}
	if (!form.isEmpty()) {
		parameters += "." + form;
	}
	if (!billing.isEmpty()) {
		parameters += "." + billing;
	}
	if (id != null) {
		if (!id.isEmpty()) {
			parameters += "." + (id.split(" ")[0]);
		}
	}
	if (!type.isEmpty()) {
		parameters += "." + type;
	}
	if (!pan.isEmpty()) {
		parameters += "." + pan.slice(-1);
	}
	if (!csaToken.isEmpty()) {
		parameters += "." + csaToken.slice(-1);
	}
	if (!agreementId.isEmpty()) {
		parameters += "." + agreementId.slice(-1);
	}
	if (!receiverSubType.isEmpty()) {
		parameters += "." + receiverSubType;
	}
	var result = encodeURIComponent(parameters);
	//console.log('checkEmulator(): ' + result);
	return result;
}

function checkpostData(allDocumentFields) {
	//console.log('checkpostData(allDocumentFields:' + allDocumentFields + ')');
	var result = [];
	var docfieldslength = allDocumentFields.length;
	for (var currentDocField = 0; currentDocField < docfieldslength; currentDocField++) {
		var field = allDocumentFields[currentDocField];
		var docItems = field.items;
		var itemsLength = docItems.length;
		if (itemsLength > 1 || field.isParent) {
			if (field.isParent) {
				for (var currentItem = 0; currentItem < itemsLength; currentItem++) {
					var children = docItems[currentItem].children;
					var childFields = checkpostData(children);
					var chLength = childFields.length
						for (var curField = 0; curField < chLength; curField++) {
							result.push(childFields[curField]);
						}
				}
			}
		}
		result.push(field.name);
	}
	return result;
}

function fillTheList(tagId, optionList, namedItem) {
	//console.log('fillTheList(tagId:' + tagId + ', optionList, namedItem:' + namedItem + ')');
	if (!namedItem)
		namedItem = "id";
	try {
		if (optionList.isEmpty()) {
			var newElement = document.createElement('input');
			newElement.name = 'id';
			newElement.value = ''
				newElement.type = 'text';
			optionList = newElement;
		}
	} catch (err) {
		//console.error('fillTheList(' + tagId + ', optionList, ' + namedItem + '): optionList не пустой');
		try {
			if (optionList.outerHTML.isEmpty())
				optionList.outerHTML = "<input name='id' value='' type='text'/>";
		} catch (err2) {
			//console.error('fillTheList(' + tagId + ', optionList, ' + namedItem + '): ' + err2.message);
			var newElement = document.createElement('input');
			newElement.name = 'id';
			newElement.value = '';
			newElement.type = 'text';
			optionList = newElement;
		}
	}
	//var tempList = document.getElementById(tagId)
	var cardsListInfo;
	if (document.getElementById(tagId).namedItem(namedItem).type == 'checkbox') {
		var tempId = document.getElementById(tagId).namedItem(namedItem).value;
		cardsListInfo = document.getElementById(tempId);
		optionList.id = tempId;
		optionList.name = '';
	} else {
		cardsListInfo = document.getElementById(tagId).namedItem(namedItem);
		optionList.name = namedItem;
	}
	cardsListInfo.outerHTML = optionList.outerHTML;
}

function completePostData(addonPostData, currentPostdata) {
	//console.log('completePostData(addonPostData:' + addonPostData + ', currentPostdata:' + currentPostdata + ')');
	var addonLength = addonPostData.length;
	for (var postParam = 0; postParam < addonLength; postParam++) {
		var key = addonPostData[postParam].name;
		var value = [];
		var valuesArr = addonPostData[postParam].items;
		var isParent = addonPostData[postParam].isParent;
		var valuesArrLength = valuesArr.length;
		for (var currentValue = 0; currentValue < valuesArrLength; currentValue++) {
			if (isParent) {
				var children = valuesArr[currentValue].children;
				currentPostdata = completePostData(children, currentPostdata);
			}
			value.push(valuesArr[currentValue].value);
		}
		currentPostdata.add(key, value);
	}
	return currentPostdata;
}

function parseAnswer(result) {
	//console.log('parseAnswer(result)');
	clearInterval(updateInterval);
	Duration = Timer() - timeStarted;
	if (!result)
		result = this;
	try { //remove EventListener
		if (XMLHttpRequest.prototype.removeEventListener) {
			result.removeEventListener("load", parseAnswer, true);
		} else {
			if (result.detachEvent !== undefined) {
				result.detachEvent("onload", parseAnswer);
			} else {
				result.onload = '';
			}
		}
	} catch (e) {
		//console.error('parseAnswer: ' + e.message);
	}
	if (showAlerts && alertLevel >= 50)
		alert(result.responseText);
	var docXML;
	var strValue = '';
	var responseStatus = -1;

	if (result.status === 200) {
		docXML = getXMLObject(result);
		try {
			requestName = eribOperations.item(g_form_id);
			eribEntity = new erib_structure(docXML);
			eribEntity.formId = g_form_id;
			eribEntity.requestName = requestName;
			responseStatus = eribEntity.status.code();
			if (eribEntity.isLogin && eribClientInfo.logedIn) {
				eribServerInfo.eribAddr = eribAddress.get();
				eribServerInfo.changed = Timer() + "::" + requestName + ":: eribAddr";
			}
			if (eribClientInfo.logedIn && !eribClientInfo.permissionsChecked && requestName !== 'permissions') {
				//updateStatus();
				eribClientInfo.permissionsChecked = true;
				trySubmit_new("4.13.0", true, '');
			}
		} catch (e) {
			eribEntity.showResult = true;
			//console.error('parseAnswer(): ' + e.message);
			responseStatus = -1;
		}
	} else {
		eribEntity.showResult = true;
		responseStatus = "HTTP:" + result.status;
	}

	if (responseStatus !== -1 && responseStatus < 6) {
		updatePermissions();
		//console.error(eribClientInfo);
		if (eribClientInfo.agreementList.length > 0 && !eribClientInfo.logedIn) {
			var clientAgreements = eribClientInfo.agreementList;
			var productsCount = clientAgreements.length;
			var newAgreementSelect = document.createElement('select');

			var emptyoption0 = document.createElement('option');
			emptyoption0.text = 'Пустое значение';
			emptyoption0.value = '';
			newAgreementSelect.add(emptyoption0);

			for (var i = 0; i < productsCount; i++) {
				var currentProduct = clientAgreements[i];
				var newoption = document.createElement('option');
				newoption.text = currentProduct.number + ': ' + currentProduct.tbName + ":" + currentProduct.address + "\t" + currentProduct.date + "-" + currentProduct.prolongationRejectionDate + " [" + currentProduct.id + "]";
				newoption.value = currentProduct.id;
				newAgreementSelect.add(newoption);
			}
			if (newAgreementSelect.options.length > 1) {
				fillTheList("4.1.4", newAgreementSelect, 'agreementId');
			}
		}
		if (eribServerInfo.region && eribServerInfo.region.length > 0) {
			var serverRegions = eribServerInfo.region;
			var regionsCount = serverRegions.length;
			var newRegionsIDSelect = document.createElement('select');
			var newRegionsGUIDSelect = document.createElement('select');

			var emptyoption0 = document.createElement('option');
			emptyoption0.text = 'Пустое значение';
			emptyoption0.value = '';
			newRegionsIDSelect.add(emptyoption0);

			var emptyoption1 = document.createElement('option');
			emptyoption1.text = 'Пустое значение';
			emptyoption1.value = '';
			newRegionsGUIDSelect.add(emptyoption1);

			for (var i = 0; i < regionsCount; i++) {
				var currentRegion = serverRegions[i];
				var newIDoption = document.createElement('option');
				newIDoption.text = currentRegion.name + ': ' + currentRegion.guid + " [" + currentRegion.id + "]";
				newIDoption.value = currentRegion.id;
				var newGUIDoption = document.createElement('option');
				newGUIDoption.text = currentRegion.name + ': ' + currentRegion.guid + " [" + currentRegion.id + "]";
				newGUIDoption.value = currentRegion.guid;
				newRegionsIDSelect.add(newIDoption);
				newRegionsGUIDSelect.add(newGUIDoption);
			}
			if (newRegionsIDSelect.options.length > 1) {
				fillTheList("4.10.3", newRegionsIDSelect, 'parentId');
				fillTheList("4.10.4.0", newRegionsIDSelect, 'region');
				fillTheList("4.10.4.0", newRegionsGUIDSelect, 'regionGuid');
				fillTheList("4.10.4.1", newRegionsIDSelect, 'region');
				fillTheList("4.10.4.1", newRegionsGUIDSelect, 'regionGuid');
				fillTheList("4.10.4.2", newRegionsIDSelect, 'region');
				fillTheList("4.10.4.2", newRegionsGUIDSelect, 'regionGuid');
			}
		}
		if (eribClientInfo.logedIn) {
			if (eribClientInfo.productsList.length > 0) {
				var clientProducts = eribClientInfo.productsList;
				var productsCount = clientProducts.length;
				var newCardsSelect = document.createElement('select');
				var newAccountsSelect = document.createElement('select');
				var newLoansSelect = document.createElement('select');
				var newImasSelect = document.createElement('select');

				var emptyoption0 = document.createElement('option');
				emptyoption0.text = 'Пустое значение';
				emptyoption0.value = '';
				newCardsSelect.add(emptyoption0);

				var emptyoption1 = document.createElement('option');
				emptyoption1.text = 'Пустое значение';
				emptyoption1.value = '';
				newAccountsSelect.add(emptyoption1);

				var emptyoption2 = document.createElement('option');
				emptyoption2.text = 'Пустое значение';
				emptyoption2.value = '';
				newImasSelect.add(emptyoption2);

				var emptyoption3 = document.createElement('option');
				emptyoption3.text = 'Пустое значение';
				emptyoption3.value = '';
				newLoansSelect.add(emptyoption3);

				for (var i = 0; i < productsCount; i++) {
					var currentProduct = clientProducts[i];
					var newoption = document.createElement('option');
					newoption.text = currentProduct.name + '\t' + currentProduct.number + " [" + currentProduct.id + "]";
					newoption.value = currentProduct.id;

					switch (currentProduct.productType) {
					case "card":
						newCardsSelect.add(newoption);
						break;
					case "account":
						newAccountsSelect.add(newoption);
						break;
					case "ima":
						newImasSelect.add(newoption);
						break;
					case "loan":
						newLoansSelect.add(newoption);
						break;
					}
				}

				if (newCardsSelect.options.length > 1) {
					//newCardsSelect.name = "id";
					fillTheList("4.3.1", newCardsSelect);
					fillTheList("4.3.2", newCardsSelect);
					fillTheList("4.3.3", newCardsSelect);
					fillTheList("4.7.5.1", newCardsSelect, "cardId");
				}
				if (newAccountsSelect.options.length > 1) {
					//newAccountsSelect.name = "id";
					fillTheList("4.4.1", newAccountsSelect);
					fillTheList("4.4.2", newAccountsSelect);
					fillTheList("4.4.3", newAccountsSelect);
					fillTheList("4.7.5.1", newAccountsSelect, "accountId");
				}
				if (newImasSelect.options.length > 1) {
					//newImasSelect.name = "id";
					fillTheList("4.6.1", newImasSelect);
				}
				if (newLoansSelect.options.length > 1) {
					//newLoansSelect.name = "id";
					fillTheList("4.5.1", newLoansSelect);
					fillTheList("4.5.2", newLoansSelect);
				}
			}
			if (eribClientInfo.regularPaymentsList.length > 0) {
				var clientRegularPayments = eribClientInfo.regularPaymentsList;
				var productsCount = clientRegularPayments.length;
				var autoPayment = document.createElement('select');
				var longOffer = document.createElement('select');
				var autoSubscription = document.createElement('select');
				var autoTransfer = document.createElement('select');

				var emptyoption0 = document.createElement('option');
				emptyoption0.text = 'Пустое значение';
				emptyoption0.value = '';
				autoPayment.add(emptyoption0);

				var emptyoption1 = document.createElement('option');
				emptyoption1.text = 'Пустое значение';
				emptyoption1.value = '';
				longOffer.add(emptyoption1);

				var emptyoption2 = document.createElement('option');
				emptyoption2.text = 'Пустое значение';
				emptyoption2.value = '';
				autoSubscription.add(emptyoption2);

				var emptyoption3 = document.createElement('option');
				emptyoption3.text = 'Пустое значение';
				emptyoption3.value = '';
				autoTransfer.add(emptyoption3);

				for (var i = 0; i < productsCount; i++) {
					var currentProduct = clientRegularPayments[i];
					var newoption = document.createElement('option');
					newoption.text = currentProduct.state + '\t' + currentProduct.name + " [" + currentProduct.id + "]";
					newoption.value = currentProduct.id;

					switch (currentProduct.type) {
					case "autoPayment":
						autoPayment.add(newoption);
						break;
					case "longOffer":
						longOffer.add(newoption);
						break;
					case "autoSubscription":
						autoSubscription.add(newoption);
						break;
					case "autoTransfer":
						autoTransfer.add(newoption);
						break;
					}
				}

				if (autoPayment.options.length > 1) {
					fillTheList("4.7.2.1", autoPayment);
					fillTheList("4.7.2.2", autoPayment);
					fillTheList("4.9.7.3.1", autoPayment, 'linkId');
					fillTheList("4.9.7.4.1", autoPayment, 'linkId');
				}
				if (longOffer.options.length > 1) {
					fillTheList("4.7.3.1", longOffer);
					fillTheList("4.7.3.2", longOffer);
					fillTheList("4.9.7.2.1", longOffer, "longOfferId");
				}
				if (autoSubscription.options.length > 1) {
					fillTheList("4.7.4.1", autoSubscription);
					fillTheList("4.7.4.2", autoSubscription);
					fillTheList("4.9.7.5.1", autoSubscription, "autoSubNumber");
					fillTheList("4.9.7.7.1", autoSubscription, "autoSubNumber");
					fillTheList("4.9.7.9.1", autoSubscription, "autoSubNumber");
					fillTheList("4.9.7.11.1", autoSubscription, "autoSubNumber");
					fillTheList("4.9.7.13.0", autoSubscription, "subscriptionId");
				}
				if (autoTransfer.options.length > 1) {
					fillTheList("4.7.4.0.1", autoTransfer);
					fillTheList("4.7.4.0.2", autoTransfer);
					fillTheList("4.9.7.8.1", autoTransfer, "autoSubNumber");
					fillTheList("4.9.7.10.1", autoTransfer, "autoSubNumber");
					fillTheList("4.9.7.12.1", autoTransfer, "autoSubNumber");
					fillTheList("4.9.7.14.0", autoTransfer, "subscriptionId");
				}
			}
			if (eribClientInfo.templatesList.length > 0) {
				var clientTemplates = eribClientInfo.templatesList;
				var productsCount = clientTemplates.length;
				var template = document.createElement('select');

				var emptyoption0 = document.createElement('option');
				emptyoption0.text = 'Пустое значение';
				emptyoption0.value = '';
				template.add(emptyoption0);

				for (var i = 0; i < productsCount; i++) {
					var currentProduct = clientTemplates[i];
					var newoption = document.createElement('option');
					newoption.text = currentProduct.type + "::" + currentProduct.name + ': ' + currentProduct.state + " [" + currentProduct.id + "]";
					newoption.value = currentProduct.id;
					template.add(newoption);
				}

				if (template.options.length > 1) {
					fillTheList("4.9.5.2", template);
					fillTheList("4.9.5.5", template);
					fillTheList("4.9.4.2.1", template, 'template');
					fillTheList("4.9.4.2.2", template, 'template');
					fillTheList("4.9.5.3.1", template, 'template');
					fillTheList("4.9.5.3.2", template, 'template');
				}
			}
			if (eribClientInfo.moneyBoxesList.length > 0) {
				var clientMoneyBoxes = eribClientInfo.moneyBoxesList;
				var productsCount = clientMoneyBoxes.length;
				var mbSubscription = document.createElement('select');
				var mbClaim = document.createElement('select');

				var emptyoption0 = document.createElement('option');
				emptyoption0.text = 'Пустое значение';
				emptyoption0.value = '';
				mbSubscription.add(emptyoption0);
				var emptyoption1 = document.createElement('option');
				emptyoption1.text = 'Пустое значение';
				emptyoption1.value = '';
				mbClaim.add(emptyoption1);

				for (var i = 0; i < productsCount; i++) {
					var currentProduct = clientMoneyBoxes[i];
					var newoption = document.createElement('option');
					newoption.text = currentProduct.status + '::' + currentProduct.name + ': ' + currentProduct.eventName + " [" + currentProduct.id + "]";
					newoption.value = currentProduct.id;
					switch (currentProduct.type) {
					case "subscription":
						mbSubscription.add(newoption);
						break;
					case "claim":
						mbClaim.add(newoption);
						break;
					}
				}

				if (mbSubscription.options.length > 1) {
					fillTheList("4.7.5.2", mbSubscription, 'linkId');
					fillTheList("4.7.5.3", mbSubscription);
				}
				if (mbClaim.options.length > 1) {
					fillTheList("4.7.5.2", mbClaim, 'claimId');
				}
			}
		}
		if (!eribEntity.isConfirm) {
			try {
				var addonData = "";
				if (responseStatus === 1) {
					var id = parseInt(g_form_id.slice(-1), 10);
					if (id > 1)
						addonData = g_form_id.slice(0, (g_form_id.length - 1)) + (id - 1) + '.next';
				} else {
					addonData = g_form_id + '.next';
				}
				var nextStep = document.getElementById(addonData);
				if (nextStep) {
					var parent = nextStep.parentNode;
					if (parent.form)
						parent.form.value = eribEntity.formName;
					if (parent.id.type === 'text') {
						var documentId = docXML.getElementsByTagName("id")[0];
						parent.id.value = documentId.text;
					}
					var elementsParent = parent.getElementsByTagName("input");
					var formData = document.getElementById(g_form_id);
					var z = formData.length;
					for (var i = 0; i < z; i++) {
						if (formData[i].checked) {
							var elementName = formData[i].name;
							var currentElement = elementsParent.namedItem(elementName);
							if (currentElement) {
								currentElement.checked = true;
								var curValue = '';
								var formValue = '';
								var curObject;
								try {
									curValue = currentElement.value;
									formValue = formData[i].value
										curObject = document.getElementById(curValue);
								} catch (error) {
									warnText += " Не удалось получить значение для элемента [" + replaceHTML(currentElement.outerHTML) + "].\r\n" + error.name + ": " + error.message + '\r\n';
									//console.warn(warnText + '\r\n' + error.message);
								}
								finally {
									try {
										if (curObject)
											curObject.value = document.getElementById(formValue).value;
									} catch (error) {
										warnText += " Произошла ошибка при установке значения [" + replaceHTML(curObject.outerHTML) + "] для элемента [" + curValue + "]\r\n" + error.name + ": " + error.message + '\r\n';
										//console.warn(warnText + '\r\n' + error.message);
									}
								}
							}
						}
					}
					var arr2Clear = nextStep.getAttribute("name").split(" ");
					var z = arr2Clear.length;
					for (var i = 0; i < z; i++) {
						var clearStep = document.getElementById(arr2Clear[i]);
						if (clearStep.innerHTML)
							clearStep.innerHTML = '';
					}
					nextStep.appendChild(eribEntity.show(addonData));
					//nextStep = curHTML;
					nextStep.style.zIndex = '1';
					var selects = nextStep.getElementsByTagName("select");
					for (var i = 0; i < selects.length; i++) {
						var exec = '';
						try {
							exec = selects[i].onclick();
						} catch (e) {
							//console.error(e.message);
						}
					}
				}
			} catch (er) {
				errorText += 'Произошла ошибка\r\n' + er.name + ':' + er.message + '\r\n';
				//console.error(errorText);
			}
		}
	}

	var showResult = eribEntity.showResult;
	if (showResult === undefined)
		showResult = true;
	if (requestName === 'permissions' && !eribClientInfo.permissionsChecked) {
		//Если клиент уже авторизовался, то запрос прав выполняется автоматически и показывать результат не нужно.
		//Для не авторизованных клиентов вернется ошибка, которую необходимо отобразить
		showResult = !eribClientInfo.logedIn;
		eribClientInfo.permissionsChecked = true;
	}
	var erib_status = document.getElementById("erib_status");
	//console.warn('showResult: ' + showResult + '\r\n' + result.responseText);
	if (showResult) {
		updateStatus();
		tempXML = (xmlFormatter(result.responseText));
		document.getElementById("resultTab").innerHTML = "<div><pre class='brush: xml;'>\n" + replaceHTML(tempXML) + "</pre></div>";
		var style = 'border';
		erib_status.style.textAlign = '';
		erib_status.style.backgroundColor = '';

		var errTextifFatal = '';
		switch (responseStatus) {
		case -1:
			erib_status.className = style + ' statusFatal';
			style += ' statusFatal';
			errTextifFatal = errorText + '\r\n' + warnText;
			break;
		case 0:
			erib_status.className = style + ' statusOk';
			style += ' statusOk';
			break;
		case 1:
			erib_status.className = style + ' statusWrn';
			style += ' statusWrn';
			break;
		case 2:
			erib_status.className = style + ' statusErr';
			style += ' statusErr';
			break;
		case 3:
			erib_status.className = style + ' statusFatal';
			style += ' statusFatal';
			break;
		case 4:
			erib_status.className = style + ' statusWrn';
			style += ' statusWrn';
			break;
		case 5:
			erib_status.className = style + ' statusFatal';
			style += ' statusFatal';
			break;
		default:
			erib_status.className = style + ' statusFatal';
			style += ' statusFatal';
			break;
		}
		erib_status.innerHTML = "<span class='status " + style + "'> Статус ответа ЕРИБ: <b>" + responseStatus + "</b>: <i>" + textFromStatus(responseStatus) +
			"</i><br /> Время отправки запроса:<b> " + reqSent +
			"</b><br /> Время обработки запроса сервером ЕРИБ:<b> " + Duration + " ms</b>" +
			(errTextifFatal.length > 0 ? "<br />" + errTextifFatal : errTextifFatal) +
			"<br /> Запрос: " + pathEmulator +
			"<br /> Параметры запроса: " + reqParams +
			"<br /> Адрес сервера ЕРИБ: " + psiURL +
			"<br /> Клиент: " + eribClientInfo.surName + " " + eribClientInfo.name + " " + eribClientInfo.patrName + "</span>";
		tempREQ = 'Статус ответа ЕРИБ: ' + responseStatus + ': ' + textFromStatus(responseStatus) +
			'\r\nВремя отправки запроса: ' + reqSent +
			'\r\nВремя обработки запроса сервером ЕРИБ: ' + Duration + " ms " +
			(errTextifFatal.length > 0 ? "\r\n" + errTextifFatal : errTextifFatal) +
			'\r\nЗапрос: ' + pathEmulator +
			'\r\nАдрес сервера ЕРИБ: ' + psiURL +
			'\r\nПараметры запроса: ' + reqParams +
			'\r\nКлиент:' + eribClientInfo.toString();
		if (forEmulator)
			tempFileName = pathEmulator.replace(/\//g, "\\");
		var erib_receipt = document.getElementById("erib_receipt");
		if (erib_receipt) {
			if (eribEntity.isReceiptDocument || eribEntity.isConfirm) {
				erib_receipt.innerHTML = "<span id='closeit' class='closeit'>&#10006;</span><div class='receipt-content'><pre>" + eribEntity.show().innerHTML + "</pre></div>";
				erib_receipt.style.display = 'block';
				var close_receipt = document.getElementById('closeit');
				close_receipt.onclick = function () {
					erib_receipt.style.display = 'none';
				}

			} else {
				erib_receipt.innerHTML = "";
				erib_receipt.style.display = 'none';
			}
		}

		var erib_debug = document.getElementById("erib_debug");
		var eribshowerror = false;
		if (erib_debug && alertLevel > 0) {
			erib_debug.innerHTML = "<span id='closedebug' class='closeit'>&#10006;</span><div class='debug-content'>DEBUG info:<pre>" + eribEntity.show().innerHTML + "<br />" + errorText + "<br />" + replaceHTML(eribEntity.getButtons()) + "</pre></div>";
			eribshowerror = true;
		} else {
			if (errorText !== '') {
				errorText += '\r\n' + warnText;
				erib_debug.innerHTML = "<span id='closedebug' class='closeit'>&#10006;</span><div class='debug-content'>debug info<pre>" + errorText + "</pre></div>";
				eribshowerror = true;
			}
		}
		if (eribshowerror) {
			erib_debug.style.display = 'block';
			close_debug = document.getElementById('closedebug');
			close_debug.onclick = function () {
				erib_debug.style.display = 'none';
			}
		} else {
			erib_debug.innerHTML = "";
			erib_debug.style.display = 'none';
		}
		var updateNextStep = function (elementId, namedItem) {
			var element = document.getElementById(elementId);
			var children = getChildren(element.parentNode);
			children[0].checked = true;
			children[0].setAttribute('checked', true);
			var itemName = namedItem | 'id';
			if (eribEntity.documentId)
				element.namedItem(itemName).value = eribEntity.documentId;
			element.style.display = 'block';
			return element;
		}
		if (eribEntity.isConfirm) {
			var confirmOperation = updateNextStep("4.9.6.0");
			//var confirmOperation = document.getElementById("4.9.6.0");
			//getChildren(confirmOperation.parentNode)[0].checked = true;
			//getChildren(confirmOperation.parentNode)[0].setAttribute('checked', true);
			//confirmOperation.namedItem("id").value = eribEntity.documentId;
			confirmOperation.namedItem("transactionToken").checked = true;
			document.getElementById("4.9.6.0.transactionToken.value").value = eribEntity.transactionToken;
			//confirmOperation.style.display = 'block';
		}
		if (eribEntity.checkAvailable) {
			updateNextStep("4.9.11.0");
			//var element = document.getElementById("4.9.11.0");
			//getChildren(element.parentNode)[0].checked = true;
			//getChildren(element.parentNode)[0].setAttribute('checked', true);
			//element.namedItem("id").value = eribEntity.documentId;
			//element.style.display = 'block';
		}
		if (eribEntity.templateAvailable) {
			updateNextStep("4.9.5.4.1", "payment");
			//var element = document.getElementById("4.9.5.4.1");
			//getChildren(element.parentNode)[0].checked = true;
			//getChildren(element.parentNode)[0].setAttribute('checked', true);
			//element.namedItem("payment").value = eribEntity.documentId;
			//element.style.display = 'block';
		}
		if (eribEntity.autopayable) {
			updateNextStep("4.9.7.1.1");
			//var element = document.getElementById("4.9.7.1.1");
			//getChildren(element.parentNode)[0].checked = true;
			//getChildren(element.parentNode)[0].setAttribute('checked', true);
			//element.namedItem("id").value = eribEntity.documentId;
			//element.style.display = 'block';
		}
		if (eribEntity.isLogin) {
			switch (eribEntity.loginType) {
			case 'chooseAgreement':
				//var chooseAgreement = document.getElementById("4.1.4");
				updateNextStep("4.1.4");
				//var agreementBlockoperation = document.getElementById("4.1.4");
				//getChildren(agreementBlockoperation.parentNode)[0].checked = true;
				//getChildren(agreementBlockoperation.parentNode)[0].setAttribute('checked', true);
				//agreementBlockoperation.style.display = 'block';
				break;
			case 'loginCSA':
				var loginCSA = updateNextStep("4.1.3");
				//var loginCSA = document.getElementById("4.1.3");
				loginCSA.namedItem("token").value = eribEntity.token;
				var newoption = document.createElement('option');
				newoption.text = 'Адрес сервера из ответа CSA';
				newoption.value = eribEntity.host;
				newoption.selected = true;
				serverList = eribAddress.options();
				var optionsLength = 0;
				if (serverList)
					optionsLength = serverList.length;
				var addOption = true;

				for (var i = 0; i < optionsLength; i++) {
					var currentOption = serverList[i];
					if (currentOption.value.contains(newoption.value)) {
						addOption = false;
						currentOption.text = newoption.text;
						currentOption.selected = true;
					}
				}
				if (addOption) {
					if (optionsLength > 0) {
						eribAddress.add(newoption);
					} else {
						eribAddress.set(eribEntity.host);
					}
				}
				//getChildren(loginCSA.parentNode)[0].checked = true;
				//getChildren(loginCSA.parentNode)[0].setAttribute('checked', true);
				//loginCSA.style.display = 'block';
				break;
			}
		}
		var divButtons = document.getElementById("buttons");
		divButtons.appendChild(eribEntity.getButtons(true));
		divButtons.style.zIndex = 1;

		SyntaxHighlighter.highlight();
		document.getElementById('currentServer').innerHTML = '<b>CSA:</b> <i>' + eribServerInfo.csaAddrr + '</i> &nbsp; &nbsp; &nbsp; <b>Node:</b>' + eribServerInfo.eribAddr;
	}
}

function parseJSON(result) {
	//console.log('parseJSON(result)');
	if (!result)
		result = this;
	try {
		if (XMLHttpRequest.prototype.removeEventListener) {
			result.removeEventListener("load", parseJSON, true);
		} else {
			if (result.detachEvent !== undefined) {
				result.detachEvent("onload", parseJSON);
			} else {
				result.onload = '';
			}
		}
	} catch (e) {
		//console.error('parseJSON: ' + e.message);
	}

	var cardsFromStatus = [],
	cardsHTML = '<input name="pan" value="" type="text" />';
	var cardsHF = new dictionary();
	var cardsPSI = new dictionary();
	var cardsALL = new dictionary();
	var servers = new dictionary();

	servers.add('HF', cardsHF);
	servers.add('PSI', cardsPSI);
	servers.add('ALL', cardsALL);

	cardsFromStatus = eval(result.responseText);
	erib_status.innerHTML = '<span class="status"></span>';
	cardsFromStatus.sort(
		function (x, y) {
		if (x.name < y.name)
			return -1;
		if (x.name > y.name)
			return 1;
		return 0;
	});

	for (var i = 0; i < cardsFromStatus.length; i++) {
		var allcards,
		tmpCards,
		currentServer = '';
		currentServer = cardsFromStatus[i].server
			.replace("<a href='http://b110-02:9080/CSAAdmin/login.do'>", "")
			.replace("<a href='http://10.68.5.238:9082/CSAAdmin/login.do'>", "")
			.replace("</a><br /><a href='http://10.68.5.237:9082/CSAFront/index.do'>СБОЛ</a>", "")
			.replace("</a><br /><a href='http://10.67.5.219:9080/CSAFront/index.do'>СБОЛ</a>", "");
		switch (currentServer) {
		case 'HotFix (1-й блок)':
			var tmpCards = servers.item('HF');
			allcards = servers.item('ALL');
			tmpCards.add(cardsFromStatus[i].pan, cardsFromStatus[i].name);
			allcards.add(cardsFromStatus[i].pan, cardsFromStatus[i].name);
			servers.add('HF', tmpCards);
			servers.add('ALL', allcards);
			break;
		case 'HotFix (2-й блок)':
			var tmpCards = servers.item('HF');
			allcards = servers.item('ALL');
			tmpCards.add(cardsFromStatus[i].pan, cardsFromStatus[i].name);
			allcards.add(cardsFromStatus[i].pan, cardsFromStatus[i].name);
			servers.add('HF', tmpCards);
			servers.add('ALL', allcards);
			break;
		case 'ПСИ (1-й блок|2-я нода)':
			var tmpCards = servers.item('PSI');
			allcards = servers.item('ALL');
			tmpCards.add(cardsFromStatus[i].pan, cardsFromStatus[i].name);
			allcards.add(cardsFromStatus[i].pan, cardsFromStatus[i].name);
			servers.add('PSI', tmpCards);
			servers.add('ALL', allcards);
			break;
		case 'ПСИ (2-й блок|2-я нода)':
			var tmpCards = servers.item('PSI');
			allcards = servers.item('ALL');
			tmpCards.add(cardsFromStatus[i].pan, cardsFromStatus[i].name);
			allcards.add(cardsFromStatus[i].pan, cardsFromStatus[i].name);
			servers.add('PSI', tmpCards);
			servers.add('ALL', allcards);
			break;
		case 'ПСИ (Балансировщик)':
			tmpCards = servers.item('PSI');
			allcards = servers.item('ALL');
			tmpCards.add(cardsFromStatus[i].pan, cardsFromStatus[i].name);
			allcards.add(cardsFromStatus[i].pan, cardsFromStatus[i].name);
			servers.add('PSI', tmpCards);
			servers.add('ALL', allcards);
			break;
		default:
			allcards = servers.item('ALL');
			allcards.add(cardsFromStatus[i].pan, cardsFromStatus[i].name);
			servers.add('ALL', allcards);
			break;
		}
	}

	cards = servers.item('ALL');
	//chekServers();
	if (cards.key.length > 0) {
		cardsHTML = '<select name="pan">\r\n';
		for (var i = 0; i < cards.key.length; i++) {
			cardsHTML += '\t<option value="' + cards.key[i] + '" />' + cards.key[i] + '\t' + cards.value[i] + '\r\n';
		}
		cardsHTML += '</select>';
	}
	var forms = document.getElementsByTagName("form");
	for (var j = 0; j < forms.length; j++) {
		if (forms[j].pan) {
			forms[j].pan.outerHTML = cardsHTML;
		}
	}
}

function productListObj() {
	//console.log('productListObj()');
	var obj = [];
	obj.indexOf = function (searchElement, fromIndex) {
		var length = this.length >>> 0;
		fromIndex = +fromIndex || 0;
		if (Math.abs(fromIndex) === Infinity)
			fromIndex = 0;
		if (fromIndex < 0) {
			fromIndex += length;
			if (fromIndex < 0) {
				fromIndex = 0;
			}
		}
		for (; fromIndex < length; fromIndex++) {
			if (this[fromIndex].id === searchElement.id)
				return fromIndex;
		}
		return -1;
	}
	return obj;
}

var disabledReqs = new dictionary();
function preparePermission() {
	var arrLength = permissionsL2.length;
	for (var i = 0; i < arrLength; i++) {
		disabledReqs.add(permissionsL2[i], getElementsByClassName(document, permissionsL2[i]));
	}
}

function updatePermissions() {
	//console.log('updatePermissions()');
	var arrLength = permissionsL2.length;
	permList = {
		name : 'needUDBO',
		isAllowed : eribClientInfo.checkedUDBO
	}
	if (eribClientInfo.permissionList.item(permList.name) !== permList.isAllowed) {
		eribClientInfo.permissionList.deleteitem(permList.name);
	}
	eribClientInfo.permissionList.add(permList.name, permList.isAllowed);

	for (var i = 0; i < arrLength; i++) {
		var isAllowed = eribClientInfo.permissionList.item(permissionsL2[i]);
		var currentClass = disabledReqs.item(permissionsL2[i]);
		var reqsLength = currentClass.length;
		for (var u = 0; u < reqsLength; u++) {
			if (isAllowed) {
				delClass(currentClass[u], "notAllowed");
			} else {
				addClass(currentClass[u], "notAllowed");
			}
		}
	}
}