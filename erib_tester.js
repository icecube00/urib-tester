(function () {
	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function (searchElement, fromIndex) {
			if (this === undefined || this === null)
				throw new TypeError('"Array.prototype.indexOf" is NULL or not defined');
			var length = this.length >>> 0; //Convert object.length to UInt32
			//alert(searchElement.constructor.toString());
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
				if (this[fromIndex] === searchElement)
					return fromIndex;
			}
			return -1;
		};
	};
	if (!Array.prototype.isEmpty) {
		Array.prototype.isEmpty = function () {
			if (this === undefined || this === null)
				throw new TypeError('"Array.prototype.isEmpty" is NULL or not defined');
			if (this.length < 1)
				return true;
			return false;
		};
	}
	if (!String.prototype.contains) {
		String.prototype.contains = function (searchString) {
			if (this === undefined || this === null)
				throw new TypeError('"String.prototype.contains" is NULL or not defined');
			if (this.indexOf(searchString) !== -1)
				return true;
			return false;
		};
	}
	if (!String.prototype.isEmpty) {
		String.prototype.isEmpty = function () {
			if (this === undefined || this === null)
				throw new TypeError('"String.prototype.isEmpty" is NULL or not defined');
			if (this.length < 1)
				return true;
			return false;
		};
	}
	if (!String.prototype.repeat) {
		String.prototype.repeat = function (count) {
			'use strict';
			if (this == null) {
				throw new TypeError('can\'t convert ' + this + ' to object');
			}
			var str = '' + this;
			count = +count;
			if (count != count) {
				count = 0;
			}
			if (count < 0) {
				throw new RangeError('repeat count must be non-negative');
			}
			if (count == Infinity) {
				throw new RangeError('repeat count must be less than infinity');
			}
			count = Math.floor(count);
			if (str.length == 0 || count == 0) {
				return '';
			}
			// Ensuring count is a 31-bit integer allows us to heavily optimize the
			// main part. But anyway, most current (August 2014) browsers can't handle
			// strings 1 << 28 chars or longer, so:
			if (str.length * count >= 1 << 28) {
				throw new RangeError('repeat count must not overflow maximum string size');
			}
			var rpt = '';
			for (; ; ) {
				if ((count & 1) == 1) {
					rpt += str;
				}
				count >>>= 1;
				if (count == 0) {
					break;
				}
				str += str;
			}
			// Could we try:
			// return Array(count + 1).join(this);
			return rpt;
		}
	}
	if (!Event.prototype.preventDefault) {
		Event.prototype.preventDefault = function () {
			this.returnValue = false;
		};
	}
	if (!Event.prototype.stopPropagation) {
		Event.prototype.stopPropagation = function () {
			this.cancelBubble = true;
		};
	}
	if (!Element.prototype.addEventListener) {
		var eventListeners = [];

		var addEventListener = function (type, listener /*, useCapture (will be ignored) */
		) {
			var self = this;
			var wrapper = function (e) {
				e.target = e.srcElement;
				e.currentTarget = self;
				if (typeof listener.handleEvent != 'undefined') {
					listener.handleEvent(e);
				} else {
					listener.call(self, e);
				}
			};
			if (type == "DOMContentLoaded") {
				var wrapper2 = function (e) {
					if (document.readyState == "complete") {
						wrapper(e);
					}
				};
				document.attachEvent("onreadystatechange", wrapper2);
				eventListeners.push({
					object : this,
					type : type,
					listener : listener,
					wrapper : wrapper2
				});

				if (document.readyState == "complete") {
					var e = new Event();
					e.srcElement = window;
					wrapper2(e);
				}
			} else {
				this.attachEvent("on" + type, wrapper);
				eventListeners.push({
					object : this,
					type : type,
					listener : listener,
					wrapper : wrapper
				});
			}
		};
		var removeEventListener = function (type, listener /*, useCapture (will be ignored) */
		) {
			var counter = 0;
			while (counter < eventListeners.length) {
				var eventListener = eventListeners[counter];
				if (eventListener.object == this && eventListener.type == type && eventListener.listener == listener) {
					if (type == "DOMContentLoaded") {
						this.detachEvent("onreadystatechange", eventListener.wrapper);
					} else {
						this.detachEvent("on" + type, eventListener.wrapper);
					}
					eventListeners.splice(counter, 1);
					break;
				}
				++counter;
			}
		};
		Element.prototype.addEventListener = addEventListener;
		Element.prototype.removeEventListener = removeEventListener;
		if (HTMLDocument) {
			HTMLDocument.prototype.addEventListener = addEventListener;
			HTMLDocument.prototype.removeEventListener = removeEventListener;
		}
		if (Window) {
			Window.prototype.addEventListener = addEventListener;
			Window.prototype.removeEventListener = removeEventListener;
		}
	}
})();

var Duration, reqSent;
var newhttp;
var showAlerts, showCatchedErr, alertLevel, forEmulator, isSSL;
var warnText='', errorText = '', emulatorExt = "";
var tempXML = '', tempREQ = '', tempFileName = '', text2save = '', reqParams = '';
var g_form_id = '';
var eribLogedIn = false, permissionsChecked = false;
var requestName = '';

var eribAddress = {
	get: function() {return "---";},
	set: function() {return},
	options: function() {return [];},
	add: function() {return }
}

var eribServerInfo = {
	region : new productListObj(),
	csaAddrr : "",
	eribAddr : "",
	changed : Timer() + "::declare(INIT)"
};

var eribClientInfo = {
	name : "",
	surName : "",
	patrName : "",
	product : {
		id : -1
	},
	clientType : "",
	clientRegion : {
		id : -1,
		name : "",
		guid : "",
		children : new productListObj()
	},
	atmRegion : {
		id : -1,
		name : "",
		guid : "",
		children : []
	},
	checkedUDBO : false,
	agreementList : new productListObj(),
	productsList : new productListObj(),
	regularPaymentsList : new productListObj(),
	permissionList : new dictionary(),
	templatesList : new productListObj(),
	loanOffersList : new productListObj(),
	toString : function () {
		return '';
	}
};

var psiURL = '', pathEmulator = '';
var timePassed = 0, timeStarted = 0, updateInterval;

var eribEntity = {
	host : '',
	isDocument : false,
	isConfirm : false,
	isLogin : false,
	checkAvailable : false,
	templateAvailable : false,
	autopayable : false,
	showResult: true,
	show : function () {
		return '';
	},
	getButtons : function () {
		return '';
	}
};

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

function clearEribSeverInfo() {
	//console.log('clearEribSeverInfo()');
	var currentAddress = event.srcElement.value;
	if (eribServerInfo.csaAddrr !== currentAddress) {
		eribServerInfo.csaAddrr = "";
		eribServerInfo.changed = Timer() + "::clearEribSeverInfo(INIT) :: csaAddrr"
			//console.log('eribServerInfo: ' + eribServerInfo.changed);
	}
}

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
		//console.warn('getCards: Сервер проверки статуса ЕРИБ не доступен' + e.description);
	}
}

function Version(eribSpec) {
	//console.log('Version('+eribSpec+')');
	eribAddress = new eribAddressConf();
	eribServerInfo.csaAddrr = eribAddress.get();
	document.getElementById('currentServer').innerHTML = 'Default: [' + eribServerInfo.csaAddrr + ']';	
	try {
		if (!eribSpec.isEmpty()) {
			var htmlVersion = document.getElementById('version').title + eribSpec;
			document.getElementById('version').innerHTML = 'jcode version:' + scriptVersion + '<br />' + htmlVersion;
			//console.log('Version: jcode version:' + scriptVersion + ' :: ' + htmlVersion);
		}
	}
	catch(e) {
		//eribSpec is an object, not a string
	}
}

var choiceAddr = [];
function prepareChoiceAddr() {
	choiceAddr = getElementsByClassName(document.getElementById('settings'),'option');
}

function eribAddressConf() {
	try {
		document.getElementById('settings').addEventListener('mouseleave',Version,true);
	}
	catch (e) {
	}
	this.get = function () {
		var eribAddress = '---';
		for (var i=0;i<2;i++) if (choiceAddr[i].childNodes[0].checked) eribAddress = choiceAddr[i].childNodes[1].value;
		//console.log('eribAddressConf.get(): eribAddress: ' + eribAddress );
		return eribAddress;
	};
	this.set = function (eribAddress) {
		//console.log('eribAddressConf.set(eribAddress: ' + eribAddress + ')');
		if (choiceAddr[0].childNodes[0].checked) choiceAddr[0].childNodes[1].value = eribAddress;
	};
	this.options = function () {
		//console.log('eribAddressConf.options()');
		if (choiceAddr[1].childNodes[0].checked) return choiceAddr[1].childNodes[1].options;
		return [];
	};
	this.add = function (newoption) {
		//console.log('eribAddressConf.add(newoption)');
		if (choiceAddr[1].childNodes[0].checked) choiceAddr[1].childNodes[1].add(newoption);
	};
	
}

function init_my_page(dontUpdate, isSave2File) {
	//console.log('init_my_page(dontUpdate:'+ dontUpdate +', isSave2File:' + isSave2File + ')');
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
	var timeoutInSec = parseInt(document.getElementById('timeOut').value);
	var step = parseInt(255 / timeoutInSec)
		erib_status.style.textAlign = 'center';
	if (timePassed == 0)
		erib_status.style.backgroundColor = 'rgb(255,255,255)';
	var bgColor = erib_status.style.backgroundColor.split(',')[1];
	var greenColor = parseInt(bgColor - step);
	if (greenColor < 0)
		greenColor = 0;
	erib_status.style.backgroundColor = 'rgb(255,' + greenColor + ',' + greenColor + ')';
	erib_status.style.color = '#000000';
	timePassed = Timer() - timeStarted
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
			var timeLeft = timeoutInSec - parseInt(timePassed / 1000);
			erib_status.innerHTML = '<span class="status"><br /><b>Выполняется запрос. Подождите, пожалуйста...</b><br />До истечения таймаута: <b>' + timeLeft + '</b> сек.</span>';
		}
}

function trySubmit(form_id, isIt4Save, currentAddr) {
	//console.log('trySubmit(form_id:'+form_id+', isIt4Save:'+isIt4Save+', currentAddr:'+currentAddr+')');
	g_form_id = form_id;
	if (!currentAddr)
		currentAddr = '';
	var operationName = eribOperations.item(form_id);
	//console.log('trySubmit: form_id:' + form_id + '\r\n' + 'currentAddr: ' + currentAddr + '\r\n'	+ 'operationName' + operationName);
	if (operationName == 'logon') {
		if (eribServerInfo.eribAddr.isEmpty()) {
			eribServerInfo.eribAddr = eribAddress.get();
			eribServerInfo.changed = Timer() + " :: " + operationName + " :: eribAddr"
				//console.log('eribServerInfo: ' + eribServerInfo.changed);
		}
	}
	if (operationName === 'multylogon.stage2' && eribEntity.host.isEmpty()) {
		//console.log('eribEntity: clear');
		eribEntity = {
			host : '',
			isDocument : false,
			isConfirm : false,
			isLogin : false,
			checkAvailable : false,
			templateAvailable : false,
			autopayable : false,
			show : function () {
				return '';
			},
			getButtons : function () {
				return '';
			}
		};
		alert("Вы не можете выполнить запрос аутентификации по токену в указанном блоке.\r\nОтсутствует адрес блока.\r\nВыполните запрос 4.1.2!");
		return;
	}
	if ((operationName == 'logon' || operationName == 'multylogon.stage1')) {
		//console.log('eribEntity: clear');
		eribEntity = {
			host : '',
			isDocument : false,
			isConfirm : false,
			isLogin : false,
			checkAvailable : false,
			templateAvailable : false,
			autopayable : false,
			show : function () {
				return '';
			},
			getButtons : function () {
				return '';
			}
		};
		if (operationName == 'logon') {
			eribServerInfo.csaAddrr = '';
			eribServerInfo.changed = Timer() + "::" + operationName + ":: csaAddrr";
			//console.log('eribServerInfo: ' + eribServerInfo.changed);
		}
		if (eribLogedIn) {
			//console.log('eribClientInfo: clear');
			eribLogedIn = false;
			eribClientInfo = {
				name : "",
				surName : "",
				patrName : "",
				product : {
					id : -1
				},
				clientType : "",
				clientRegion : {
					id : -1,
					name : "",
					guid : "",
					children : new productListObj()
				},
				atmRegion : {
					id : -1,
					name : "",
					guid : "",
					children : []
				},
				checkedUDBO : false,
				agreementList : new productListObj(),
				productsList : new productListObj(),
				regularPaymentsList : new productListObj(),
				permissionList : new dictionary(),
				templatesList : new productListObj(),
				loanOffersList : new productListObj(),
				toString : function () {
					return '';
				}
			};
			permissionsChecked = false;

			var temp_form_id = g_form_id;
			trySubmit("4.1.6", true, eribServerInfo.eribAddr);
			g_form_id = temp_form_id;

			if (!currentAddr.isEmpty() && currentAddr !== eribServerInfo.eribAddr)
				eribAddress.set(currentAddr);
			//console.log('eribClientInfo: clear \r\n' + 'eribLogedIn: ' + eribLogedIn + '\r\n' + 'permissionsChecked: '+ permissionsChecked);
		}
		if (operationName == 'multylogon.stage1' && !eribServerInfo.csaAddrr.isEmpty()) {
			currentAddr = eribServerInfo.csaAddrr;
			eribServerInfo.eribAddr = "";
			eribServerInfo.changed = Timer() + "::" + operationName + ":: eribAddr";
			//console.log('eribServerInfo: ' + eribServerInfo.changed);
		}
	}
	if (eribLogedIn && !permissionsChecked && (operationName !== 'permissions')) {
		//console.log('Проверяем права доступа');
		//Возможно потребуется добавить проверку УДБО на "ход ноги". Пока не проверяем.
		//var checkBox = document.getElementById("4.13.0").needCheckUDBO;
		//checkBox.checked=true;
		var temp_form_id = g_form_id;
		updateStatus();
		trySubmit("4.13.0", true);
		g_form_id = temp_form_id;
		permissionsChecked = true;		
		//console.log('eribClientInfo: clear \r\n' + 'eribLogedIn: ' + eribLogedIn + '\r\n' + 'permissionsChecked: '+ permissionsChecked);
	}
	tempFileName = form_id + ".xml";
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
	//console.log('trySubmit_new(form_id:'+form_id+', isIt4Save:'+isIt4Save+', currentAddr:'+currentAddr+')');
	var operationName = eribOperations.item(form_id);
	var async = true;
	if (operationName == 'logoff') {
		async = false;
		eribLogedIn = false;
		currentAddr = eribServerInfo.eribAddr;
		eribServerInfo.eribAddr = '';
		eribServerInfo.changed = Timer() + "::" + operationName + ":: eribAddr";
		//console.log('eribServerInfo: ' + eribServerInfo.changed);
		//console.log('eribEntity: clear');
		eribEntity = {
			host : '',
			isDocument : false,
			isConfirm : false,
			isLogin : false,
			checkAvailable : false,
			templateAvailable : false,
			autopayable : false,
			show : function () {
				return '';
			},
			getButtons : function () {
				return '';
			}
		};
		//console.log('eribClientInfo: clear');
		eribClientInfo = {
				name : "",
				surName : "",
				patrName : "",
				product : {
					id : -1
				},
				clientType : "",
				clientRegion : {
					id : -1,
					name : "",
					guid : "",
					children : new productListObj()
				},
				atmRegion : {
					id : -1,
					name : "",
					guid : "",
					children : []
				},
				checkedUDBO : false,
				agreementList : new productListObj(),
				productsList : new productListObj(),
				regularPaymentsList : new productListObj(),
				permissionList : new dictionary(),
				templatesList : new productListObj(),
				loanOffersList : new productListObj(),
				toString : function () {
					return '';
				}
		};
	}
	if (operationName == 'multylogon.stage1') {
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
	if (operationName == 'multylogon.stage2')
		if (!eribServerInfo.eribAddr.isEmpty() && psiURL !== eribServerInfo.eribAddr)
			return;

	if (showAlerts && alertLevel >= 80)
		alert('ERIB URL: ' + psiURL);
	if (psiURL==='---') return;
		
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
		};
	};
	postdata = completePostData(addonPostData, postdata);

	var keys = postdata.key;
	var keyslength = keys.length;
	var resultFields = [];

	for (var currentkey = 0; currentkey < keyslength; currentkey++) {
		var values = postdata.item(keys[currentkey]);
		var valueslength = values.length;
		for (var currentValue = 0; currentValue < valueslength; currentValue++) {
			resultFields.push(keys[currentkey] + "=" + values[currentValue]);
		};
	};
	var erib_fileds2send = resultFields.join("&");
	reqParams = erib_fileds2send;
	if (isIt4Save && operationName==='permissions') {
		isIt4Save=false;
		async=false;
	}
	HttpRequest(formAction, erib_fileds2send, "urlencoded", "POST", !isIt4Save, false, async);
}

function HttpRequest(URL, FormData, typeData, requestType, isIt4Save, getJSON, async) {
	//console.log('HttpRequest: URL: ' + URL + '\r\n' +	'FormData: ' + FormData + '\r\n' + 'typeData: ' + typeData + '\r\n' + 'requestType: ' + requestType + '\r\n' + 'isIt4Save: ' + isIt4Save + '\r\n' + 'getJSON: ' + getJSON + '\r\n' + 'async: ' + async);
	init_my_page(true);
	if (showAlerts && alertLevel >= 30)
		alert("HttpRequest('" + URL + "," + FormData + "," + typeData + "," + requestType + "')");
	var data;
	var strTimeout = "";
	if (newhttp === undefined) {
		newhttp = getXMLHttp();
	}
	try {
		if (getJSON) {
			if (XMLHttpRequest.prototype.addEventListener) {
				newhttp.addEventListener("load", parseJSON, true);
			} else {
				if (newhttp.attachEvent !== undefined) {
					newhttp.attachEvent("onload", parseJSON);
				} else {
					//console.log('HttpRequest:: Не удалось выполнить addEventListener и attachEvent');
					//newhttp.onload = function() {parseJSON(newhttp);};
					//async=false;
				}
			}
		}
		if (isIt4Save) {
			if (XMLHttpRequest.prototype.addEventListener) {
				newhttp.addEventListener("load", parseAnswer, true);
			} else {
				if (newhttp.attachEvent !== undefined) {
					newhttp.attachEvent("onload", parseAnswer);
				} else {
					//console.log('HttpRequest:: Не удалось выполнить addEventListener и attachEvent');
					//newhttp.onload = function() {parseAnswer(newhttp);};
					//async=false;
				}
			}
		}
	} catch (err) {
		warnText += err.description;
		//console.warn('HttpRequest: ' + warnText);
	}
	newhttp.open(requestType, URL + '?' + Timer(), async);
	newhttp.onreadystatechange = function () {
		if (newhttp.readyState !== 4) {}
		else {
			clearInterval(updateInterval);
			try {
				var tmpStatus = newhttp.status;
				if (getJSON) parseJSON(newhttp);
				if (isIt4Save) parseAnswer(newhttp);
			} catch (err) {
				strTimeout = " Не удалось получить ответ от удаленного сервера\r\n" + err.name + ":" + err.message;
				//console.warn('HttpRequest: ' + strTimeout);
			}
		}
	};

	try {
		newhttp.withCredentials = true;
	} catch (err) {
		warnText += "\r\nНе удалось установить параметр withCredentials\r\n" + err.name + ":" + err.message + '\r\n';
		//console.warn('HttpRequest: ' + warnText);
	}
	try {
		newhttp.msCaching = true;
	} catch (err) {
		warnText += "\r\nНе удалось установить параметр msCaching\r\n" + err.name + ":" + err.message + '\r\n';
		//console.warn('HttpRequest: ' + warnText);
	}
	try {
		var timeoutInSec = parseInt(document.getElementById('timeOut').value);
		newhttp.timeout = (timeoutInSec * 1000);
		newhttp.ontimeout = function () {
			strTimeout = " Время ожидания ответа истекло!";
			clearInterval(updateInterval);
			Duration = Timer() - timeStarted;
			newhttp.abort();
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
		alert("newhttp: " + newhttp.readyState);

	newhttp.setRequestHeader("Cache-Control", "no-cache");
	newhttp.setRequestHeader("Pragma", "no-cache");
	newhttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");

	switch (typeData) {
	case "boundary":
		newhttp.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary + "; charset=win1251");
		break;
	case "urlencoded":
		newhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=win1251");
		break;
	case "soap":
		newhttp.setRequestHeader("Content-Type", "text/xml; charset=win1251");
		break;
	}
	try {
		//timeStarted = Timer();
		reqSent = Timer(111);
		newhttp.send(FormData);
	} catch (e) {
		strTimeout = " newhttp.send():\r\n" + e.name + ": " + e.message;
		//console.error('HttpRequest: ' + strTimeout);
		showAlerts = false;
	}
}

function Timer(ms) {
	//console.log('Timer(ms:'+ms+')');
	var tresult;
	var d = new Date();
	var milliseconds = d.getTime();
	var time = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2) + ',' + ('00' + d.getMilliseconds()).slice(-3);
	ms = !ms ? tresult = milliseconds : tresult = time;
	//console.log('Timer: ' + tresult);
	return tresult;
}

function LenB(str) {
	//console.log('LenB(str:'+str+')');
	var m = encodeURIComponent(str).match(/%[89ABab]/g);
	return str.length + (m ? m.length : 0);
}

function setFormData(arrData, typeData) {
	//console.log('setFormData(arrData:'+arrData+', typeData:'+typeData+')');
	var body = [];
	var isPush = false;
	var nodeValue = "",
	nodeName = "",
	nodeTitle = "";
	emulatorExt = "";
	for (var i = 0; i < arrData.elements.length; i++) {
		isPush = false;
		nodeName = arrData.elements[i].name;
		nodeTitle = arrData.elements[i].title;
		var isVisible = (arrData.elements[i].parentNode.style.display !== 'none');
		if (nodeName !== "" && isVisible) {
			isPush = true;
			nodeValue = arrData.elements[i].value;
			if (nodeValue !== "") {
				switch (arrData.elements[i].type) {
				case "checkbox":
					isPush = arrData.elements[i].checked;
					if (document.getElementById(nodeValue))
						nodeValue = document.getElementById(nodeValue).value;
					break;
				case "radio":
					isPush = arrData.elements[i].checked;
					if (nodeTitle !== '' && nodeTitle !== undefined)
						nodeName = nodeTitle;
					if (document.getElementById(nodeValue))
						nodeValue = document.getElementById(nodeValue).value;
					break;
				}
			}
		}
		if (isPush) {
			switch (typeData) {
			case "boundary":
				body.push('Content-Disposition: form-data; name="' + nodeName + '"\r\nContent-Type: text/plain; charset=win1251\r\nContent-Transfer-Encoding: 8bit\r\n\r\n' + encodeURIComponent(nodeValue) + '\r\n');
				break;
			case "urlencoded":
				body.push(nodeName + '=' + replaceHTML(convert2win1251(nodeValue)));
				break;
			}
		}
	}
	if (forEmulator)
		emulatorExt = checkEmulator(body);
	switch (typeData) {
	case "boundary":
		boundary = 'asdfghj' + String(Math.random()).slice(2) + 'lkjhgfd';
		var boundaryMiddle = '--' + boundary + '\r\n';
		var boundaryLast = '--' + boundary + '--\r\n';
		body = "\r\n" + body.join(boundaryMiddle) + boundaryLast;
		break;
	case "urlencoded":
		break;
	default:
		body = false;
	}
	if (showAlerts && alertLevel >= 40)
		alert(body.join('&'));
	//console.log('setFormData: ' + body);
	return body;
}

function trim(str, charlist) {
	//console.log('trim(str:'+str+', charlist:'+charlist+')');
	str = !str ? '' : str;
	charlist = !charlist ? ' \xA0' : charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\$1');
	var re = new RegExp('^[' + charlist + ']+|[' + charlist + ']+$', 'g');
	return str.replace(re, '');
}

function convert2win1251(string) {
	//console.log('convert2win1251(string:'+string+')');
	var russian = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я', 'а', 'б', 'в', 'г', 'д', 'е', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я'];
	var win1251 = ['%c0', '%c1', '%c2', '%c3', '%c4', '%c5', '%c6', '%c7', '%c8', '%c9', '%ca', '%cb', '%cc', '%cd', '%ce', '%cf', '%d0', '%d1', '%d2', '%d3', '%d4', '%d5', '%d6', '%d7', '%d8', '%d9', '%da', '%db', '%dc', '%dd', '%de', '%df', '%e0', '%e1', '%e2', '%e3', '%e4', '%e5', '%e6', '%e7', '%e8', '%e9', '%ea', '%eb', '%ec', '%ed', '%ee', '%ef', '%f0', '%f1', '%f2', '%f3', '%f4', '%f5', '%f6', '%f7', '%f8', '%f9', '%fa', '%fb', '%fc', '%fd', '%fe', '%ff'];
	for (var i = 0; i < russian.length; i++) {
		string = string.split(russian[i]).join(win1251[i]);
	}
	return string;
}

function replaceHTML(string2clear) {
	//console.log('replaceHTML(string2clear:'+string2clear+')');
	var nonxmlEntities = ['&', '<', '>', '"', "'"];
	var xmlEntities = ['&amp;', '&lt;', '&gt;', '&quot;', "&apos;"];
	for (var i = 0; i < nonxmlEntities.length; i++) {
		string2clear = string2clear.split(nonxmlEntities[i]).join(xmlEntities[i]);
	}
	return string2clear;
}

function HTMLreplace(string2clear) {
	//console.log('HTMLreplace(string2clear:'+string2clear+')');
	var nonxmlEntities = ['&', '<', '>', '"', "'"];
	var xmlEntities = ['&amp;', '&lt;', '&gt;', '&quot;', "&apos;"];
	for (var i = 0; i < nonxmlEntities.length; i++) {
		string2clear = string2clear.split(xmlEntities[i]).join(nonxmlEntities[i]);
	}
	return string2clear;
}

function getXmlValue(srcXML, tagName, isBoolean) {
	//console.log('getXmlValue(srcXML, tagName:'+tagName+', isBoolean:'+isBoolean+')');
	var result = '';
	try {
		var elementsList = srcXML.getElementsByTagName(tagName);
		if (!isBoolean) {
			if (elementsList[0].text)
				result = elementsList[0].text;
			if (elementsList[0].textContent)
				result = elementsList[0].textContent;
		} else {
			result = (elementsList.length > 0);
		}
	} catch (e) {
		//console.warn('getXmlValue(): ' + e.description);
		//do nothing
	}
	//console.log('getXmlValue: ' + result);
	return result;
}

function textFromStatus(code) {
	//console.log('textFromStatus(code:'+code+')');
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

function erib_structure(xmlObject) {
	//console.log('erib_structure(xmlObject)');
	var errorXMLParser = "";
	try {
		if (xmlObject.parseError.errorCode !== 0)
			errorXMLParser = xmlObject.parseError.reason;
	} catch (err) {
		//console.error('erib_structure: ' + err.description);
		try {
			if (xmlObject.documentElement.nodeName === "parsererror")
				errorXMLParser = xmlObject.documentElement.childNodes[0].nodeValue;
		} catch (eerrr) {
			//console.error('erib_structure: Fatal error. Could not parse XML.\r\n' + eerrr.description);
			errorXMLParser = "Fatal error. Could not parse XML.";
		}
	}
	if (!errorXMLParser.isEmpty()) {
		var statusNode = xmlObject.createElement("status");
		var tempNode = xmlObject.createElement("code");
		statusNode.appendChild(tempNode);
		var tempNode = statusNode.getElementsByTagName("code")[0];
		var tempTextNode = xmlObject.createTextNode("-1");
		tempNode.appendChild(tempTextNode);
		statusNode.appendChild(tempNode);
		var tempNode_0 = xmlObject.createElement("errors");
		var tempNode_1 = xmlObject.createElement("error");
		var tempNode_2 = xmlObject.createElement("text");
		var tempTextNode = xmlObject.createTextNode("Невалидный XML от ЕРИБа!!!\r\n " + errorXMLParser);
		errorText += "<br />" + errorXMLParser;
		tempNode_2.appendChild(tempTextNode);
		tempNode_1.appendChild(tempNode_2);
		tempNode_0.appendChild(tempNode_1);
		statusNode.appendChild(tempNode_0);
		var statusObj = xmlObject.appendChild(statusNode);
	} else {
		var statusObj = xmlObject.getElementsByTagName("status")[0];
	}
	var isDocument = false,
	isReceiptDocument = false,
	checkAvailable = false,
	templateAvailable = false,
	autopayable = false,
	isInitialData = false,
	isConfirm = false,
	isPermissions=false,
	showResult=true;
	var documentId,
	receiptTitle = '',
	formId = '',
	host = '';
	this.host = host;
	this.person = new eribPerson(xmlObject);
	
	var transactionToken = getXmlValue(xmlObject, "transactionToken");
	var operationUID = getXmlValue(xmlObject, "operationUID");
	var form = getXmlValue(xmlObject, "form");
	var localStatus = new responseStatus(statusObj);
	var isLogin = getXmlValue(xmlObject, "loginCompleted", true);
	
	if (isLogin) {
		eribLogedIn = (getXmlValue(xmlObject, "loginCompleted") === 'true');
		var isChooseAgreement = getXmlValue(xmlObject, "chooseAgreementStage", true);
		var isCSALogin = getXmlValue(xmlObject, "loginData", true);
		this.host = getXmlValue(xmlObject, "host");
		this.token = getXmlValue(xmlObject, "token");

		if (isChooseAgreement) {
			this.loginType = 'chooseAgreement';
			var agreements = xmlObject.getElementsByTagName('agreement');
			var agreementsLength = agreements.length;
			for (var currentNode = 0; currentNode < agreementsLength; currentNode++) {
				var product = new eribAgreement(agreements[currentNode]);
				if (this.person.agreementList.indexOf(product) === -1)
					this.person.agreementList.push(product);
			}
		}
		if (isCSALogin) {
			this.loginType = 'loginCSA';
		}
	}
	this.isLogin = isLogin;

	//Object
	this.status = localStatus;

	//String
	this.transactionToken = transactionToken;
	this.operationUID = operationUID;

	//Boolean
	isDocument = getXmlValue(xmlObject, "document", true);
	isInitialData = getXmlValue(xmlObject, "initialData", true);
	isReceiptDocument = getXmlValue(xmlObject, "DocumentCheck", true);
	isConfirm = getXmlValue(xmlObject, "confirmStage", true);
	isPermissions = getXmlValue(xmlObject, "permissions", true);
	if (isPermissions) eribClientInfo.checkedUDBO = (getXmlValue(xmlObject, "checkedUDBO") === 'true');	
	this.isPermissions=isPermissions;
	this.isDocument = (isDocument || isInitialData || isReceiptDocument);
	
	if (isDocument) {
		documentId = getXmlValue(xmlObject, "id");
		this.documentId = documentId;
		checkAvailable = (getXmlValue(xmlObject, "checkAvailable") === 'true');
		if (getXmlValue(xmlObject, "templateAvailable", true)) {
			templateAvailable = (getXmlValue(xmlObject, "templateAvailable") === 'true');
		}
		if (getXmlValue(xmlObject, "autopayable", true)) {
			autopayable = (getXmlValue(xmlObject, "autopayable") === 'true');
		}
	}
	if (isInitialData) {
		this.longOfferAllowed = (getXmlValue(xmlObject, "longOfferAllowed") === 'true');
		this.autoPaymentSupported = (getXmlValue(xmlObject, "autoPaymentSupported") === 'true');
	}
	if (isReceiptDocument) {
		receiptTitle = getXmlValue(xmlObject, "title");
	}
	if (this.isDocument) {
		this.formName = form;
		this.document = new document();
	} else {
		//Not a document means it might be a list
		if (eribLogedIn) {
			//if(!this.person) this.person = new eribPerson(xmlObject);
			if (isPermissions) showResult = (eribClientInfo.permissionList.key.length>1);
			this.list = new list();
		}
	}

	this.isConfirm = isConfirm;
	this.isReceiptDocument = isReceiptDocument;
	this.checkAvailable = checkAvailable;
	this.templateAvailable = templateAvailable;
	this.autopayable = autopayable;
	this.showResult=showResult;
	
	//Structures
	function responseStatus(statusObj) {
		//console.log('erib_structure: responseStatus(statusObj)');
		try {
			this.code = function () {
				return parseInt(getXmlValue(statusObj, "code"));
			};
			this.error = new eribError(statusObj.getElementsByTagName("error"));
			this.warning = new eribError(statusObj.getElementsByTagName("warning"));
		} catch (e) {
			//console.error('erib_structure: responseStatus: ' + e.description);
			this.code = function () {
				return -1;
			};
			this.error = [{
					text : 'Не смогли получить статус от ЕРИБа. ' + e.description,
					element : ''
				}
			];
			this.warning = [{
					text : 'Не смогли получить статус от ЕРИБа. ' + e.description,
					element : ''
				}
			];
		}
	}

	function eribError(stObj) {
		//console.log('erib_structure: eribError(stObj)');
		this.text = function () {
			var stext = [];
			for (var i = 0; i < stObj.length; i++) {
				stext.push(getXmlValue(stObj[i], "text"));
			}
			return stext;
		};
		this.element = function () {
			var etext = [];
			for (var i = 0; i < stObj.length; i++) {
				etext.push(getXmlValue(stObj[i], "elementId"));
			}
			return etext;
		};
	}

	function document() {
		//console.log('erib_structure: document()');
		//Набор полей документа
		var documentfields = [];
		//Набор полей типа Product
		var productsType = ['cards\\card', 'accounts\\account', 'loans\\loan', 'imaccounts\\imaccount'];
		var moneyType = ['payment', 'sum', 'availableLimit', 'balance', 'maxIncome', 'minIncome',
			'amount', 'operationAmount', 'maxSumWritePerMonth', 'commission',
			'totalAmountLimit', 'floorLimit', 'credit', 'debit', 'totalPaymentAmount',
			'interestsAmount', 'principalAmount', 'doneAmount', 'remainAmount', 'closingBalance',
			'openingBalance', 'irreducibleAmt', 'maxSumWrite', 'purchaseLimit', 'availableCashLimit',
			'minPayment', 'ownSum', 'limit', 'nextPayAmount']
		//Набор полей у которых есть зависимые
		var parentTypes = ['AccountOpeningClaim\\percentTransferSource', 'autoPaymentParameters\\autoPaymentType',
			'autoPaymentParameters\\executionEventType', 'autoSubDetails\\type', 'autoSubParameters\\type',
			'fromAccountFields\\eventType', 'fromCardFields\\eventType', 'RurPayment\\receiverSubType',
			'RurPaymentLongOffer\\receiverSubType', 'RurPaymentDocument\\receiverSubType',
			'CreateP2PAutoTransferClaim\\receiver', 'CreateMoneyBoxPayment\\moneyBoxSumType',
			'EditMoneyBoxClaimDocument\\moneyBoxSumType'];
		//Набор зависимых полей
		var childrenTypes = ['AccountOpeningClaim', 'AccountOpeningClaimDocument', 'accountFields',
			'always', 'bankInfo', 'byAnyReceipt', 'byCapital', 'byInvoice', 'byPension',
			'byPercent', 'bySalary', 'cardFields', 'externalAccount', 'fixedSumma',
			'invoice', 'masterCardExternalCard', 'onOverDraft', 'onRemaind', 'onceInHalfyear',
			'onceInMonth', 'onceInQuarter', 'onceInWeek', 'onceInYear', 'ourAccount', 'ourCard',
			'ourPhone', 'percentTransferCardSource', 'periodic', 'reduseOfBalance', 'visaExternalCard'];
		//Функция определения набора доступных зависимых полей,
		// в зависимости от выбранного значения [stype] в родительском поле
		var eventType = function (stype) {
			switch (stype) {
			case 'ALWAYS':
				return ['always'];
				break;
			case 'INVOICE':
				return ['invoice'];
				break;
			case 'BY_ANY_RECEIPT':
				return ['byAnyReceipt'];
				break;
			case 'BY_CAPITAL':
				return ['byCapital'];
				break;
			case 'BY_SALARY':
				return ['bySalary'];
				break;
			case 'BY_PENSION':
				return ['byPension'];
				break;
			case 'BY_PERCENT':
				return ['byPercent'];
				break;
			case 'ONCE_IN_WEEK':
				return ['periodic', 'onceInWeek'];
				break;
			case 'ONCE_IN_MONTH':
				return ['periodic', 'onceInMonth'];
				break;
			case 'ONCE_IN_QUARTER':
				return ['periodic', 'onceInQuarter'];
				break;
			case 'ONCE_IN_HALFYEAR':
				return ['periodic', 'onceInHalfyear'];
				break;
			case 'ONCE_IN_YEAR':
				return ['periodic', 'onceInYear'];
				break;
			case 'ON_OVER_DRAFT':
				return ['onOverDraft'];
				break;
			case 'ON_REMAIND':
				return ['onRemaind'];
				break;
			case 'REDUSE_OF_BALANCE':
				return ['reduseOfBalance'];
				break;
			case 'BY_INVOICE':
				return ['byInvoice'];
				break;
			case 'ourCard':
				return ['ourCard', 'cardFields'];
				break;
			case 'ourPhone':
				return ['ourPhone', 'cardFields'];
				break;
			case 'masterCardExternalCard':
				return ['masterCardExternalCard', 'cardFields'];
				break;
			case 'visaExternalCard':
				return ['visaExternalCard', 'cardFields'];
				break;
			case 'ourAccount':
				return ['ourAccount', 'bankInfo', 'accountFields'];
				break;
			case 'externalAccount':
				return ['externalAccount', 'bankInfo', 'accountFields'];
				break;
			case 'account':
				return [];
				break;
			case 'card':
				return ['AccountOpeningClaim', 'AccountOpeningClaimDocument', 'percentTransferCardSource'];
				break;
			case 'FIXED_SUMMA':
				return ['fixedSumma'];
				break;
			case 'PERCENT_BY_ANY_RECEIPT':
				return ['byPercent'];
				break;
			case 'PERCENT_BY_DEBIT':
				return ['byPercent'];
				break;
			default:
				return [];
			}
		};
		//Делаем выборку всех xml entities с тэгом 'name'
		var fields_name = xmlObject.getElementsByTagName("name");
		//Проверяем и заполняем поле transactionToken
		if (!transactionToken.isEmpty()) {
			var newField = new erib_field();
			var item = new field_item();
			newField.title = 'Токен транзакции';
			newField.name = 'transactionToken';
			newField.required = true;
			item.value = transactionToken;
			newField.items.push(item);
			documentfields.push(newField);
		}
		//Проверяем и заполняем поле operationUID
		if (!operationUID.isEmpty()) {
			var newField = new erib_field();
			var item = new field_item();
			newField.title = 'UID операции';
			newField.name = 'operationUID';
			newField.required = true;
			item.value = operationUID;
			newField.items.push(item);
			documentfields.push(newField);
		}
		//Определяем тип комиссии
		//Вариант comission - не интересен, потому что он только для чека и, корректно и однозначно описан
		if (getXmlValue(xmlObject, "commission", true)) {
			var newField = new erib_field();
			newField.title = 'Комиссия'
				newField.name = 'commission';
			//В случае CreateAutoSubscription поле commission может прилететь дважды o_O
			var commission = xmlObject.getElementsByTagName("commission");
			if (commission.length > 1)
				var isCreateAutoSubscriptionDocument = (getXmlValue(xmlObject, "commissionCurrency", true));
			for (var commField = 0; commField < commission.length; commField++) {
				var itemAmount = new field_item();
				var itemCurrency = new field_item();
				itemAmount.title = 'Сумма';
				itemCurrency.title = 'Валюта';
				//Проверяем тип пришедшего поля - он может быть money или string
				var thisFieldType = getXmlValue(commission[commField], "type");
				if (!thisFieldType.isEmpty()) {
					itemAmount.value = getXmlValue(commission[commField].getElementsByTagName(thisFieldType + "Type")[0], "value");
					itemCurrency.value = getXmlValue(xmlObject.getElementsByTagName("commissionCurrency")[0].getElementsByTagName("stringType")[0], "value");
				} else {
					itemAmount.value = getXmlValue(commission[0], "amount");
					itemCurrency.value = getXmlValue(commission, "name");
				}
				newField.items.push(itemAmount);
				newField.items.push(itemCurrency);
			}
			documentfields.push(newField);
		}
		//Комиссия может взиматься, но сумма не указана
		if (getXmlValue(xmlObject, "isWithCommission", true)) {
			var newField = new erib_field();
			newField.title = 'Комиссия'
				newField.name = 'commission';
			var isWithCommission = (getXmlValue(xmlObject, "isWithCommission").toLowerCase() === "true");
			var item = new field_item();
			if (isWithCommission) {
				item.value = "Взимается согласно тарифам банка."
			} else {
				item.value = "Не взимается."
			}
			newField.items.push(item);
			documentfields.push(newField);
		}

		//Операция микро-списания
		if (getXmlValue(xmlObject, "writeDownOperation", true)) {
			var writeDownOperation = xmlObject.getElementsByTagName("writeDownOperation");
			var operationCount = writeDownOperation.length;
			for (var operationNo = 0; operationNo < operationCount; operationNo++) {
				var newField = new erib_field();
				newField.title = 'Микрооперация';
				newField.name = 'writeDownOperation';

				var item = new field_item();
				item.title = 'Наименование';
				item.value = getXmlValue(writeDownOperation[operationNo], "operationName");
				newField.items.push(item);

				var item = new field_item();
				item.title = 'Сумма операции';
				item.value = getXmlValue(writeDownOperation, "curAmnt");
				newField.items.push(item);

				var item = new field_item();
				item.value = getXmlValue(writeDownOperation, "turnOver");
				newField.items.push(item);

				documentfields.push(newField);
			}
		}

		//Инициализируем текущий статус поля
		var isParent = false,
		isChild = false;
		var curParent = '',
		parentIndex = [];
		for (var i = 0; i < fields_name.length; i++) {
			//Проверка на то, что анализируемое поле относится к типу Field
			//Убеждаемся, что у поля name нет иных детей, кроме TEXT_NODE
			if (fields_name[i].childNodes.length === 1) {
				//Прыгаем на уровень выше, чтобы работать с ЕРИБовским элементом типа Field
				var tempField = fields_name[i].parentNode;
				isParent = false,
				isChild = false;
				//Проверка на принадлежность к "Родителям"
				if (parentTypes.indexOf(tempField.parentNode.tagName + "\\" + tempField.tagName) !== -1)
					isParent = true;

				if (!isParent && curParent !== '') { //Текущее поле не "родитель" и объект curParent - не пустой
					//Проверка на принадлежность к "деткам"
					if (childrenTypes.indexOf(tempField.parentNode.tagName) !== -1)
						isChild = true;
					//Перебираем все значения "Родителя"
					for (var item = 0; item < curParent.items.length; item++) {
						//Получаем массив тэгов, которые являются "детками" текущего значения "Родителя"
						var eventTags = eventType(curParent.items[item].value);
						if (eventTags.length > 0) {
							if (eventTags.indexOf(tempField.parentNode.tagName) !== -1) {
								//Заполняем массив индексов значений "Родителя"
								//к которым нужно привязать текущего "дитёнка"
								parentIndex.push(item);
							}
						}
					}
				}
				//Список форм для которых не надо выкашивать поля из productsType
				var exceptionList = ['LoanOffer', 'LoanProduct'];
				//Если это не список продуктов (т.е. его нет в productsType)
				//и Не тип Money
				//и форма не входит в список exceptionList
				//заполняем текущее поле.
				if (!(tempField.tagName === 'currency' & moneyType.indexOf(tempField.parentNode.tagName) !== -1)
					 & !(productsType.indexOf(tempField.parentNode.tagName + "\\" + tempField.tagName) !== -1)
					 || exceptionList.indexOf(form) !== -1) {
					var newField = new erib_field();
					newField.changed = (getXmlValue(tempField, "changed") === 'true');
					newField.editable = (getXmlValue(tempField, "editable") === 'true');
					newField.isSum = (getXmlValue(tempField, "isSum") === 'true');
					newField.required = (getXmlValue(tempField, "required") === 'true');
					newField.visible = (getXmlValue(tempField, "visible") === 'true');
					newField.description = getXmlValue(tempField, "description");
					newField.hint = getXmlValue(tempField, "hint");
					newField.name = getXmlValue(tempField, "name");
					newField.title = getXmlValue(tempField, "title");
					newField.type = getXmlValue(tempField, "type");
					//Получаем список всех значений для поля.
					var field_values = tempField.getElementsByTagName("value");
					for (var j = 0; j < field_values.length; j++) {
						var item = new field_item();
						var tempField = field_values[j].parentNode;
						item.defaultValue = getXmlValue(tempField, "default");
						item.displayedValue = getXmlValue(tempField, "displayedValue");
						if (getXmlValue(tempField, "productValue", true))
							item.productValue = new eribProduct(tempField.getElementsByTagName("productValue")[0]);
						item.selected = (getXmlValue(tempField, "selected") === 'true');
						item.title = getXmlValue(tempField, "title");
						item.value = getXmlValue(tempField, "value");
						newField.items.push(item);
					}
					//Если у данного поля вдруг не оказалось никаких значений - вбиваем пустышку.
					if (newField.items.length < 1) {
						var item = new field_item();
						newField.items.push(item);
					}
					//Получаем список всех валидаторов для поля.
					var field_values = tempField.getElementsByTagName("validator");
					for (var j = 0; j < field_values.length; j++) {
						var item = new field_validator();
						var tempField = field_values[j].parentNode;
						item.type = getXmlValue(tempField, "type");
						item.message = getXmlValue(tempField, "message");
						item.parameter = getXmlValue(tempField, "parameter");
						newField.validators.push(item);
					}
					if (isParent) {
						//Если объект curParent - не пустой, надо его прикопать.
						if (curParent !== '')
							documentfields.push(curParent);
						//Текущему полю "Родитель" надо поставить признак isParent
						newField.isParent = true;
						//И назначить curParent текущее поле.
						curParent = newField;
					} else {
						if (isChild) {
							//Если поле из "деток", надо его привязать к родителю
							//Перебираем индексы значений родителя, к которым нужно привязать "детку"
							for (var pIndex = 0; pIndex < parentIndex.length; pIndex++) {
								//Привязываем "детку"
								curParent.items[parentIndex[pIndex]].children.push(newField);
								//Сбрасываем признак "детки"
								isChild = false;
							}
							//Обнуляем массив индексов значений "Родителя"
							parentIndex = [];

							if (isChild) { //Если признак "детки" все еще не сброшен, значит просто прикапываем поле
								//Сбрасываем признак "детки"
								isChild = false;
								//Ставим признак, что  показывать не надо
								newField.isShow = false;
								//Прикапываем в список полей
								documentfields.push(newField);
							}
						} else {
							//Если поле не Родитель и не Детка, просто добавляем в общий массив полей.
							documentfields.push(newField);
						}
					}
				}
			}
		}
		//Если объект curParent оказался не пустым, надо его прикопать и почистить.
		if (curParent !== '') {
			documentfields.push(curParent);
			curParent = '';
		}
		return documentfields;
	}

	function list() {
		//console.log('erib_structure: list()');
		var erib_response = xmlObject.getElementsByTagName("response")[0];
		var enumerated = enumChildren(erib_response);
		return enumerated;
	}

	function enumChildren(xmlParentObj, index) {
		//console.log('erib_structure: enumChildren(xmlParentObj, index:'+index+')');
		var listNodes = ['accounts//account', 'agreements//agreement', 'banksList//bank',
			'billingPayments//payment', 'cards//card', 'claims//claim',
			'conditions//condition', 'conditionsList//condition', 'ConfirmType//strategy',
			'depositsList//deposit', 'elementList//element', 'elements//element',
			'imaccounts//ima', 'incomeStage//option', 'loanCardOffers//loanCardOffer',
			'loanCardOfferStage//option', 'loanCardProductStage//option', 'loanOfferStageType//option',
			'LoanProductStage//option', 'loanProductStage//option', 'loans//loan', 'minAditionalFee//currencyList',
			'officeList//office', 'operations//operation', 'operationsList//operation', 'payments//payment',
			'permissions//permission', 'popularPaymentList//popularPayment', 'rates//rate', 'regionsList//region',
			'regularPayments//regularPayment', 'services//service', 'statement//statementRow', 'templates//template',
			'writeDownOperations//writeDownOperation'];
		var EribProduct = ['card', 'account', 'ima', 'imaccount', 'loan'];
		var EribRegularPayment = ['regularPayment'];
		var EribTemplate = ['template'];
		var EribLoanOffer = ['option'];
		var StandartList = ['service', 'provider', 'category', 'parent', 'element'];
		var ProviderList = ['payment'];
		var RegionList = ['region']
		if (!index)
			index = 0;
		var listOfChildren = [];
		var listItem = [];
		var isPush = false;
		var children = xmlParentObj.childNodes;
		for (var i = 0; i < children.length; i++) {
			var childrenLength = children[i].childNodes.length;
			if (childrenLength > 0) {
				var curListItems = children[i].tagName + '//' + children[i].childNodes[childrenLength - 1].tagName;
				if (listNodes.indexOf(curListItems) !== -1) {
					var listItems = xmlParentObj.getElementsByTagName(children[i].childNodes[childrenLength - 1].tagName);
					listItem = [];
					isPush = true;
					for (var j = 0; j < listItems.length; j++) {
						var currentNode = listItems[j];
						var listEntry = new list_item();
						var notListed = true;
						listEntry.tagType = currentNode.tagName;
						if (requestName === 'regions') {
							var product = new eribRegion(currentNode);
							if (eribServerInfo.region.indexOf(product) === -1) {
								eribServerInfo.region.push(product);
							}
							notListed = false;
						}
						if (requestName === 'productsList' || requestName === 'productsNewList') {
							var product = new eribProduct(currentNode);
							if (eribClientInfo.productsList.indexOf(product) === -1)
								eribClientInfo.productsList.push(product);
							notListed = false;
						}
						if (requestName === 'regularpaymentsList') {
							var product = new eribProduct(currentNode);
							if (eribClientInfo.regularPaymentsList.indexOf(product) === -1)
								eribClientInfo.regularPaymentsList.push(product);
							notListed = false;
						}
						if (EribTemplate.indexOf(listEntry.tagType) !== -1) {
							var product = new eribTemplate(currentNode);
							if (eribClientInfo.templatesList.indexOf(product) === -1)
								eribClientInfo.templatesList.push(product);
						}
						if (EribLoanOffer.indexOf(listEntry.tagType) !== -1) {
							var product = new eribLoanOffer(currentNode);
							if (eribClientInfo.loanOffersList.indexOf(product) === -1)
								eribClientInfo.loanOffersList.push(product);
						}
						if (requestName === "servicesPayments") {
							var product = new eribService(currentNode);
							//notListed = false;
						}
						if (ProviderList.indexOf(listEntry.tagType) !== -1) {
							var stdList = new eribProvider(currentNode);
							listEntry.id = stdList.billing + stdList.provider.id;
							listEntry.listOfValues.push({
								name : stdList.provider.name,
								value : stdList
							});
							notListed = false;
						}
						if (isPermissions) {
							var permList = new eribPermissions(currentNode);
							if (eribClientInfo.permissionList.item(permList.name)!==permList.isAllowed) {
								eribClientInfo.permissionList.deleteitem(permList.name);
							}
							eribClientInfo.permissionList.add(permList.name,permList.isAllowed);
							notListed = false;
						}
						if (StandartList.indexOf(listEntry.tagType) !== -1) {
							var stdList = new standardList(currentNode);
							listEntry.id = stdList.type;
							listEntry.listOfValues.push({
								name : stdList.main.id,
								value : stdList
							});
							notListed = false;
						}
						if (notListed && currentNode.childNodes.length > 0) {
							var tryList = [];
							tryList = enumChildren(currentNode, index + 1);
							if (tryList.length > 0) {
								listEntry.listOfValues.push(tryList);
								notListed = false;
							}
						}
						if (notListed) {
							var firstEntry = currentNode.firstChild;
							getAllListItems(firstEntry, listEntry);
						}
						listItem.push(listEntry);
					}
				} else {
					listItem = enumChildren(children[i], index + 1);
					if (listItem.length > 0)
						isPush = true;
				}
				if (isPush)
					listOfChildren.push({
						level : index,
						items : listItem
					});
				isPush = false;
			}
		}
		if (isPush)
			listOfChildren.push({
				level : index,
				items : listItem
			});
		return listOfChildren;
	}

	this.show = function (divId) {
		//console.log('erib_structure: show( divId:' + divId + ')');
		var result = '';
		if (this.isDocument) {
			result = formFields(this.document, divId);
		}
		if (isReceiptDocument) {
			var half_add_2_40 = ' '.repeat(parseInt((40 - receiptTitle.length) / 2))
				result = (half_add_2_40 + receiptTitle + '\r\n\r\n' + result).toUpperCase();
		}
		return result;
	};

	function formFields(fieldsCollection, divId) {
		//console.log('erib_structure: formFields(fieldsCollection:'+fieldsCollection+', divId:'+divId+')');
		var result = '';
		var fieldslength = fieldsCollection.length;
		for (var i = 0; i < fieldslength; i++) {
			var title = '',
			sClass = '',
			value = '',
			style = '';
			var field = fieldsCollection[i];
			if (field.isShow) {
				if (field.required)
					sClass = ' required';
				if (field.visible || field.required) {
					if (!field.visible)
						sClass = ' invisible';
					if (localStatus.error.element()[0] === field.name) {
						sClass = " error";
						//field.editable=true;
					}
					if (!field.editable && field.visible)
						sClass = ' disabled';
					style += ' class="' + trim(sClass) + '"';
					var docItems = field.items;
					var itemsLength = docItems.length;
					title = trim(field.title) + ': ';
					var titleLength = title.length;
					if (isReceiptDocument || isConfirm) {
						if (field.visible) {
							var add_2_40 = '';
							if (itemsLength > 1) {
								for (var j = 0; j < itemsLength; j++) {
									var prodValue = docItems[j].productValue;
									var selected = docItems[j].selected;
									if (selected) {
										add_2_40 = '';
										if (prodValue.id !== -1) {
											var valueLength = trim(docItems[j].displayedValue).length;
											if (valueLength < 40)
												add_2_40 = ' '.repeat(40 - valueLength);
											value += add_2_40 + trim(docItems[j].displayedValue) + '\r\n';
										} else {
											titleLength += trim(docItems[j].title).length;
											var valueLength = trim(docItems[j].value).length;
											if ((titleLength + valueLength) < 40) {
												add_2_40 = ' '.repeat(38 - (titleLength + valueLength));
											} else if (valueLength < 40) {
												add_2_40 = '\r\n' + ' '.repeat(38 - (valueLength));
											}
											value += trim(docItems[j].title) + ': ' + add_2_40 + trim(docItems[j].value) + '\r\n';
										}
									}
								}
							} else {
								titleLength += trim(docItems[0].title).length;
								var valueLength = trim(docItems[0].displayedValue).length;
								if (docItems[0].displayedValue === '')
									valueLength = trim(docItems[0].value).length;
								if ((titleLength + valueLength) < 40) {
									add_2_40 = ' '.repeat(38 - (titleLength + valueLength));
								} else if (valueLength < 40) {
									add_2_40 = '\r\n' + ' '.repeat(38 - (valueLength));
								}
								if (docItems[0].title !== '')
									value += trim(docItems[0].title) + ': ';
								if (docItems[0].displayedValue === '') {
									value += add_2_40 + trim(docItems[0].value) + '\r\n';
								} else {
									value += add_2_40 + trim(docItems[0].displayedValue) + '\r\n';
								}
							}
						} else {
							title = '';
							value = '';
						}
					} else {
						var parent = '';
						var tmpStr = '';
						if (itemsLength > 1 || field.isParent) {
							if (field.isParent) {
								var parent = ' id=' + field.name + ' onclick=checkDependensies("' + field.name + '","' + divId + '")';
								for (var j = 0; j < itemsLength; j++) {
									tmpStr += '<div id="' + docItems[j].value + '">';
									var children = docItems[j].children;
									tmpStr += formFields(children);
									tmpStr += '</div>\r\n';
								}
							}
							title = '<select name="' + field.name + '"' + style + parent + ' >\r\n';
							for (var j = 0; j < itemsLength; j++) {
								var prodValue = docItems[j].productValue;
								var selected = '';
								if (docItems[j].selected)
									selected = ' selected="selected"';
								if (prodValue.id !== -1) {
									value += '\t<option value="' + docItems[j].value + '"' + selected + ' />' + docItems[j].displayedValue + '\r\n';
								} else {
									value += '\t<option value="' + docItems[j].value + '"' + selected + ' />' + docItems[j].title + '\t' + docItems[j].value + '\r\n';
								}
							}
							value += '</select><span class="description postdata">' + field.title + '</span><br />\r\n';
						} else {
							if (field.name === 'exactAmount') {
								title = '<select id="exactAmount" name="exactAmount"' + style + parent + ' >\r\n';
								value += '\t<option value="charge-off-field-exact" /> Пользователь указал поле с суммой списания\r\n';
								value += '\t<option value="destination-field-exact" /> Пользователь указал поле с суммой зачисления\r\n';
								value += '</select><span class="description postdata">' + field.title + '</span><br />\r\n';
							} else {
								if (field.name === 'buyAmount')
									style += ' onclick=checkExactAmount("buyAmount")';
								if (field.name === 'sellAmount')
									style += ' onclick=checkExactAmount("sellAmount")';
								title = '';
								value += '<input name="' + field.name + '" value="' + docItems[0].value + '"' + style + ' /><span class="description postdata">' + field.title + '\t' + docItems[0].title + '\t' + docItems[0].displayedValue + '</span><br />\r\n';
							}
						}
						value += tmpStr;
					}
				}
			}
			result += title + value;
		}
		return result;
	}

	this.formLists = function formLists(fieldsCollection, namedItem) {
		//console.log('erib_structure: formLists(fieldsCollection:'+fieldsCollection+', namedItem:'+namedItem+')');
		var result = '';
		var fieldslength = fieldsCollection.length;
		for (var i = 0; i < fieldslength; i++) {
			var field = fieldsCollection[i];
			if (isNumeric(field.level)) {
				result += this.formLists(field.items, namedItem);
			} else {
				var valuesLength = field.listOfValues.length;
				for (var x = 0; x < valuesLength; x++) {
					var zValue = field.listOfValues[x];
					if (namedItem) {
						if (zValue.name === namedItem)
							return zValue.value;
					} else {
						if (zValue.name !== "productValue") {
							result += zValue.name + '\t' + zValue.value + '\r\n';
						} else {
							result += zValue.name + '\t' + zValue.value.name + '\t' + zValue.value.id + '\r\n';
						}
					}
				}
				if (!namedItem)
					result += '\r\n';
			}
		}
		return result;
	};

	function getAllListItems(firstEntry, listEntry, parentName) {
		//console.log('erib_structure: getAllListItems(firstEntry, listEntry, parentName:'+parentName+')');
		var currentName = '';
		if (parentName)
			currentName = parentName + '//';
		if (firstEntry.childNodes.length === 1)
			listEntry.listOfValues.push({
				name : currentName + firstEntry.tagName,
				value : firstEntry.text
			});
		if (((firstEntry.tagName).toLowerCase()).contains("id"))
			listEntry.id = firstEntry.text;
		while (firstEntry.nextSibling !== null) {
			firstEntry = firstEntry.nextSibling;
			var nodeslength = firstEntry.childNodes.length;
			if (((firstEntry.tagName).toLowerCase()).contains("id"))
				listEntry.id = firstEntry.text;
			if (nodeslength === 1)
				listEntry.listOfValues.push({
					name : currentName + firstEntry.tagName,
					value : firstEntry.text
				});
			if (nodeslength > 1) {
				getAllListItems(firstEntry.childNodes[0], listEntry, firstEntry.tagName);
			}
		}
	}

	this.getButtons = function (isSave) {
		//console.log('erib_structure: getButtons(isSave:'+isSave+')');
		var result = '';
		var save2file = '';
		if (checkAvailable)
			result += "<input type='button' value='Печать чека' onclick='trySubmit(\"4.9.11.0\")'' />\r\n";
		if (templateAvailable)
			result += "<input type='button' value='Создать шаблон' onclick='trySubmit(\"4.9.5.4.1\")'' />\r\n";
		if (autopayable)
			result += "<input type='button' value='Создать АП' onclick='trySubmit(\"4.9.7.1.1\")'' />\r\n";
		if (this.isConfirm)
			result += "<input type='button' value='Подтвердить' onclick='trySubmit(\"4.9.6.0\")'' />\r\n";
		if (localStatus.code() !== -1 && isSave) {
			save2file += "<input class='save2File' type='button' value='Сохранить' onclick='saveToFile(\"" + tempFileName + "\")'' />\r\n";
			return save2file;
		}
		/* Старт отладки структуры LIST
		if (this.list) {
		if (this.list.length > 0) {
		text2save = this.formLists(this.list);
		result += "<input class='list2File' type='button' value='List2File' onclick='saveListToFile(\"" + tempFileName + "\")'' />\r\n";
		}
		}
		Конец отладки структуры LIST */
		return result;
	};

	function erib_field() {
		//console.log('erib_structure: erib_field()');
		this.changed = false;
		this.editable = false;
		this.isSum = false;
		this.required = false;
		this.visible = false;
		this.description = '';
		this.hint = '';
		this.name = '';
		this.title = '';
		this.type = '';
		this.maxLength = 0;
		this.minLength = 0;
		this.items = new productListObj(); //array of items
		this.validators = new productListObj(); //array of validators
		this.isParent = false;
		this.isShow = true;
	}

	function field_item() {
		//console.log('erib_structure: field_item()');
		this.defaultValue = '';
		this.displayedValue = '';
		this.productValue = new eribProduct();
		this.selected = false;
		this.title = '';
		this.value = '';
		this.children = new productListObj(); //array of children
	}

	function field_validator() {
		//console.log('erib_structure: field_validator()');
		this.type = 'regexp'; //subject to change later
		this.message = '';
		this.parameter = '';
	}

	function list_item() {
		//console.log('erib_structure: list_item()');
		this.tagType = '';
		this.id = '';
		this.listOfValues = new productListObj();
	}

	function standardList(srcXML) {
		//console.log('erib_structure: standardList(srcXML)');
		this.main = new eribService(srcXML);
		this.type = getXmlValue(srcXML, "type");
		this.subType = getXmlValue(srcXML, "subType");
		this.bic = getXmlValue(srcXML, "bic"); ;
		this.code = getXmlValue(srcXML, "code");
		this.account = getXmlValue(srcXML, "account");
		this.date = getXmlValue(srcXML, "date");
	}

	function eribAgreement(srcXML) {
		//console.log('erib_structure: eribAgreement(srcXML)');
		this.id = getXmlValue(srcXML, "id");
		this.address = getXmlValue(srcXML, "address");
		this.tbName = getXmlValue(srcXML, "tbName");
		this.number = getXmlValue(srcXML, "number");
		this.date = getXmlValue(srcXML, "date");
		this.prolongationRejectionDate = getXmlValue(srcXML, "prolongationRejectionDate");
	}

	function eribProduct(srcXML) {
		//console.log('erib_structure: eribProduct(srcXML)');
		if (srcXML) {
			var isCard = srcXML.tagName.contains("card");
			var isAccount = srcXML.tagName.contains("account");
			var isIma = srcXML.tagName.contains("ima");
			var isLoan = srcXML.tagName.contains("loan");
			var isRegular = srcXML.tagName.contains("regularPayment");
			var balanceAvailable = getXmlValue(srcXML, "availableLimit", true);
			this.productType = srcXML.tagName;
			this.id = getXmlValue(srcXML, "id");
			this.name = getXmlValue(srcXML, "name");
			this.state = getXmlValue(srcXML, "state");
			this.number = getXmlValue(srcXML, "number");
			this.type = getXmlValue(srcXML, "type");
			if (balanceAvailable) {
				this.balance = new eribSum(srcXML.getElementsByTagName("amount")[0].parentNode);
			}

			//regularPayment fields
			if (isRegular) {
				this.productType = "regularPayment";
				this.active = getXmlValue(srcXML, "active");
				this.state = getXmlValue(srcXML, "status");
				this.executionEventDescription = getXmlValue(srcXML, "executionEventDescription");
				this.executionEventType = getXmlValue(srcXML, "executionEventType");
			}

			//Loan fields
			if (isLoan) {
				this.productType = "loan";
				this.nextPayAmount = getXmlValue(srcXML, "nextPayAmount");
				this.nextPayDate = getXmlValue(srcXML, "nextPayDate");
			}

			//Card fields
			if (isCard) {
				this.productType = "card";
				this.isMain = (getXmlValue(srcXML, "isMain") === 'true');
				this.mainCardNumber = getXmlValue(srcXML, "mainCardNumber");
				this.additionalCardType = getXmlValue(srcXML, "additionalCardType");
			}

			//IMA account fields
			if (isIma) {
				this.productType = "ima";
				this.openDate = getXmlValue(srcXML, "openDate");
				this.closeDate = getXmlValue(srcXML, "closeDate");
				this.agreementNumber = getXmlValue(srcXML, "agreementNumber");
			}
		} else {
			this.id = -1;
		}
	}

	function eribProvider(srcXML) {
		//console.log('erib_structure: eribProvider(srcXML)');
		this.billing = getXmlValue(srcXML, "billing");
		this.autoPaymentSupported = (getXmlValue(srcXML, "autoPaymentSupported") === 'true');
		this.accountNumber = getXmlValue(srcXML, "accountNumber");
		this.INN = getXmlValue(srcXML, "INN");
		this.service = new eribService(srcXML.getElementsByTagName("service")[0]);
		this.provider = new eribService(srcXML.getElementsByTagName("provider")[0]);
		this.category = new eribService(srcXML.getElementsByTagName("category")[0]);
		this.parent = new eribService(srcXML.getElementsByTagName("parent")[0]);
	}

	function eribService(srcXML) {
		//console.log('erib_structure: eribService(srcXML)');
		this.id = getXmlValue(srcXML, "id");
		this.type = getXmlValue(srcXML, "type");
		this.name = getXmlValue(srcXML, "name");
		this.title = getXmlValue(srcXML, "title");
		this.description = getXmlValue(srcXML, "description");
		this.guid = getXmlValue(srcXML, "guid");
		this.img = new eribImage(srcXML);
		this.providers = new productListObj();
	}

	function eribImage(srcXML) {
		//console.log('erib_structure: eribImage(srcXML)');
		var isdbImg = getXmlValue(srcXML, "dbImage", true);
		var isStaticImg = getXmlValue(srcXML, "staticImage", true);
		if (isStaticImg) {
			this.id = -1;
			this.URL = getXmlValue(srcXML.getElementsByTagName("staticImage")[0].parentNode, "url");
			this.updated = '00.00.0000T00:00:00';
		}
		if (isdbImg) {
			this.id = getXmlValue(srcXML.getElementsByTagName("dbImage")[0].parentNode, "id");
			this.URL = '';
			this.updated = getXmlValue(srcXML.getElementsByTagName("dbImage")[0].parentNode, "updated");
		}
		if (!isStaticImg && !isdbImg) {
			this.id = -1;
			this.URL = '';
			this.updated = '00.00.0000T00:00:00';
		}
	}

	function eribSum(srcXML, rootNode) {
		//console.log('erib_structure: eribSum(srcXML, rootNode:'+rootNode+')');
		try {
			var sumXML = srcXML;
			if (rootNode)
				sumXML = srcXML.getElementsByTagName(rootNode)[0];
			this.amount = getXmlValue(sumXML, "amount");
			this.code = getXmlValue(sumXML, "code");
			this.name = getXmlValue(sumXML, "name");
		} catch (e) {
			//console.error('erib_structure: eribSum: ' + e.description);
			this.amount = '';
			this.code = '';
			this.name = '';
		}
	}

	function eribHistory(srcXML) {
		//console.log('erib_structure: eribHistory(srcXML)');
		this.id = getXmlValue(srcXML, "id");
		this.description = getXmlValue(srcXML, "description");
		this.state = getXmlValue(srcXML, "state");
		this.date = getXmlValue(srcXML, "date");
		this.from = getXmlValue(srcXML, "from");
		this.to = getXmlValue(srcXML, "to");
		this.templatable = (getXmlValue(srcXML, "templatable") === 'true');
		this.copyable = (getXmlValue(srcXML, "copyable") === 'true');
		this.creationType = getXmlValue(srcXML, "creationType");
		this.type = getXmlValue(srcXML, "type");
		this.form = getXmlValue(srcXML, "form");
		this.sum = new eribSum(srcXML, 'operationAmount');
	}

	function eribTemplate(srcXML) {
		//console.log('erib_structure: eribTemplate(srcXML)');
		this.id = getXmlValue(srcXML, "templateId");
		this.name = getXmlValue(srcXML, "templateName");
		this.type = getXmlValue(srcXML, "templateType");
		this.state = getXmlValue(srcXML, "status");
		this.form = getXmlValue(srcXML, "form");
		this.sum = new eribSum(srcXML, "amount");
		this.created = getXmlValue(srcXML, "created");
	}

	function eribPermissions(srcXML) {
		//console.log('erib_structure: eribPermissions(srcXML)');
		this.name = getXmlValue(srcXML, "key");
		this.isAllowed = (getXmlValue(srcXML, "allowed") === 'true');
	}

	function eribPerson(srcXML) {
		//console.log('erib_structure: eribPerson(srcXML)');
		this.name = getXmlValue(srcXML, "firstName");
		this.surName = getXmlValue(srcXML, "surName");
		this.patrName = getXmlValue(srcXML, "patrName");
		this.product = new eribProduct(srcXML.getElementsByTagName("card")[0]);
		this.clientType = getXmlValue(srcXML, "creationType");
		this.clientRegion = new eribRegion(srcXML.getElementsByTagName("region")[0]);
		this.atmRegion = new eribRegion(srcXML.getElementsByTagName("atmRegion")[0]);
		this.checkedUDBO = (getXmlValue(srcXML, "checkedUDBO") === 'true');
		this.agreementList = new productListObj();
		this.productsList = new productListObj();
		this.permissionList = new dictionary();
		this.regularPaymentsList = new productListObj();
		this.templatesList = new productListObj();
		this.loanOffersList = new productListObj();
		if (this.product.id !== -1)
			this.productsList.push(this.product);
		this.toString = function () {
			result = this.surName + " " + this.name + " " + this.patrName + "\r\n" +
				"Регион клиента: " + this.clientRegion.name + ". Регион терминала: " + this.atmRegion.name + ".\r\n" +
				"Подключен по " + this.clientType + ".";
			return result;
		};
	}

	function eribRegion(srcXML) {
		//console.log('erib_structure: eribRegion(srcXML)');
		this.id = getXmlValue(srcXML, "id");
		this.name = getXmlValue(srcXML, "description");
		this.guid = getXmlValue(srcXML, "guid");
		this.services = new productListObj();
		this.children = new productListObj();
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
		//console.error('checkExactAmount(' + strTypeOfCharge + '): ' + error.description);
		//А тут нет selection!
	}
}

function xmlFormatter(xml) {
	//console.log('xmlFormatter(xml:'+xml+')');
	xml = xml.toString(); // привести к строке на случай, если xml - это объект
	xml = xml.replace(/(>)\s*(<)(\/*)/g, '$1\n$2$3'); // удалить пробелы между тэгами (<tag>      </tag>), заменив их на символ \n, итоговый результат: >\n</
	xml = xml.replace(/ *(.*) +\n/g, '$1\n'); // вставить символ \n после последовательности |      some text    \n|, итоговый результат: |      some text    \n\n|
	xml = xml.replace(/(<.+>)(.+\n)/g, '$1\n$2'); // вставить символ \n между тэгом и текстом, итоговый результат: <tag>\nsome text\n
	var formattedXML = '',
	transitions = { // 4 типа тэгов: single, closing, opening, other (text, doctype, comment) -  всего 4*4 = 16 вариантов transitions
		'single->single' : 0,
		'single->closing' : -1,
		'single->opening' : 0,
		'single->other' : 0,
		'closing->single' : 0,
		'closing->closing' : -1,
		'closing->opening' : 0,
		'closing->other' : 0,
		'opening->single' : 1,
		'opening->closing' : 0,
		'opening->opening' : 1,
		'opening->other' : 1,
		'other->single' : 0,
		'other->closing' : -1,
		'other->opening' : 0,
		'other->other' : 0
	},
	i,
	j,
	lines = xml.split('\n'),
	linesLength = lines.length,
	ln,
	type,
	fromTo,
	lastType = 'other',
	indent = 0,
	padding;
	for (i = 0; i < linesLength; i++) {
		ln = lines[i];
		if (/<.+\/>/.test(ln)) { // эта линия содержит одиночный (single) тэг, например: <br />
			type = 'single';
		} else if (/<\/.+>/.test(ln)) { // эта линия содержит закрывающий (closing) тэг, например: </a>
			type = 'closing';
		} else if (/<[^!].*>/.test(ln)) { // эта линия содержит открывающий (opening) тэг, но это не что-то вроде <!something>, например: <a>
			type = 'opening';
		} else {
			type = 'other';
		}
		fromTo = lastType + '->' + type;
		lastType = type;
		indent += transitions[fromTo];
		padding = '';
		for (j = 0; j < indent; j++) {
			padding += '  '; // 2 пробела можно заменить на Tab: padding += '\t';
		}
		if (fromTo === 'opening->closing') {
			formattedXML = formattedXML.substr(0, formattedXML.length - 1) + ln + '\n'; // substr() удаляет разрыв строки (\n) оставшийся от предыдущего цикла
		} else {
			formattedXML += padding + ln + '\n';
		}
	}
	return formattedXML;
};

function saveToFile(fileName) {
	//console.log('saveToFile(fileName:'+fileName+')');
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

function saveListToFile(fileName) {
	//console.log('saveListToFile(fileName:'+fileName+')');
	if (!fileName || fileName.isEmpty()) {
		fileName = 'eribTesterList';
	}
	saveTextAs(text2save, fileName + ".txt");
}

function isNumeric(sValue) {
	//console.log('isNumeric(sValue:'+sValue+')');
	var result = false;
	try {
		var z = parseFloat(sValue);
		result = (z * 0 === 0);
	} catch (e) {
		//console.error ('isNumeric(): ' + e.description);
	}
	//console.log('isNumeric('+sValue+'): '+ result);
	return result;
}

function getParam(paramMap, paramName, isMulty) {
	//console.log('getParam(paramMap:'+paramMap+', paramName:'+paramName+', isMulty:'+isMulty+')');
	var result = '';
	var append = false;
	try {
		for (var i = 0; i < paramMap.length; i++) {
			name = paramMap[i].split('=')[0]
				value = paramMap[i].split('=')[1]
				if (name === paramName) {
					append ? result += "." + value : result += value;
					append = true;
				}
		}
	}
	finally {
		if (!result)
			result = '';
		//console.log('getParam(paramMap,'+paramName+', isMulty: '+ isMulty + '): '+ result);
		return result;
	}
}

function checkEmulator(parametersArray) {
	//console.log('checkEmulator(parametersArray:'+parametersArray+')');
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
	//console.log('checkEmulator(): '+ result);
	return result;
}

function isCheckedBox(checkBoxId) {
	//console.log('isCheckedBox(checkBoxId:'+checkBoxId+')');
	var result = false;
	try {
		result = document.getElementById(checkBoxId).checked;
	} catch (e) {
		//console.error ('isCheckedBox(): ' + e.description);
		//Ой, что-то не получилось
	}
	//console.log('isCheckedBox('+checkBoxId+'): '+ result);
	return result;
}

function getAllSiblings(nodeThatFired) {
	//console.log('getAllSiblings(nodeThatFired:'+nodeThatFired+')');
	var result = [];
	var node = nodeThatFired.parentNode.childNodes[0];
	while (node) {
		if (node.nodeType === 1 && node !== nodeThatFired) {
			result.push(node);
		}
		node = node.nextElementSibling || node.nextSibling;
	}
	return result;
}

function checkpostData(allDocumentFields) {
	//console.log('checkpostData(allDocumentFields:'+allDocumentFields+')');
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
	//console.log('fillTheList(tagId:'+tagId+', optionList, namedItem:'+namedItem+')');
	if (!namedItem)
		namedItem = "id";
	try {
		if (optionList.isEmpty()) {
			var newElement = document.createElement('input');
			newElement.name = 'id'
				newElement.value = ''
				newElement.type = 'text';
			optionList = newElement;
		}
	} catch (err) {
		//console.error('fillTheList('+tagId+', optionList, ' + namedItem + '): optionList не пустой');
		try {
			if (optionList.outerHTML.isEmpty())
				optionList.outerHTML = "<input name='id' value='' type='text'/>";
		} catch (err2) {
			//console.error('fillTheList('+tagId+', optionList, ' + namedItem + '): ' + err2.description);
			
			var newElement = document.createElement('input');
			newElement.name = 'id'
				newElement.value = ''
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
	//console.log('completePostData(addonPostData:'+addonPostData+', currentPostdata:'+currentPostdata+')');
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
	if (!result) result = this;
	try{
		if (XMLHttpRequest.prototype.removeEventListener) {
			result.removeEventListener("load", parseAnswer, true);
		} else {
			if (result.detachEvent !== undefined) {
				result.detachEvent("onload", parseAnswer);
			} else {
				result.onload = '';
			}
		}
	}
	catch(e){
		//console.error('parseAnswer: ' + e.description);
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
			if (eribEntity.isLogin && eribLogedIn) {
				eribClientInfo = eribEntity.person;
				eribServerInfo.eribAddr = eribAddress.get();
				eribServerInfo.changed = Timer() + "::" + requestName + ":: eribAddr";
			}
		} catch (e) {
			eribEntity.showResult = true;
			//console.error ('parseAnswer(): ' + e.description);
			responseStatus = -1;
		}
	} else {
		eribEntity.showResult = true;
		responseStatus = "HTTP:" + result.status;
	}

	if (responseStatus !== -1 && responseStatus < 6) {
		updatePermissions();
		//console.error(eribEntity.person);
		if (eribEntity.person.agreementList.length > 0 && !eribLogedIn) {
			var clientAgreements = eribEntity.person.agreementList;
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
		if (eribLogedIn) {
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
		}
		if (!eribEntity.isConfirm) {
			try {
				var addonData = "";
				if (responseStatus === 1) {
					var id = parseInt(g_form_id.slice(-1));
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
									//console.warn (warnText + '\r\n' + error.description);
								}
								finally {
									try {
										if (curObject)
											curObject.value = document.getElementById(formValue).value;
									} catch (error) {
										warnText += " Произошла ошибка при установке значения [" + replaceHTML(curObject.outerHTML) + "] для элемента [" + curValue + "]\r\n" + error.name + ": " + error.message + '\r\n';
										//console.warn (warnText + '\r\n' + error.description);
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
					var curHTML = eribEntity.show(addonData);
					nextStep.innerHTML = curHTML;
					nextStep.style.zIndex = '1';
					var selects = nextStep.getElementsByTagName("select");
					for (var i = 0; i < selects.length; i++) {
						var exec = '';
						try {
							exec = selects[i].onclick();
						} catch (e) {
							//console.error (e.description);
						}
					}
				}
			} catch (er) {
				errorText += 'Произошла ошибка\r\n' + er.name + ':' + er.message + '\r\n';
				//console.error (errorText);
			}
		}
	}
	
	var showResult = eribEntity.showResult;
	if (showResult === undefined) showResult=true;
	if (!showResult && requestName==='permissions') showResult=true;
	updateStatus();
	var erib_status = document.getElementById("erib_status");
	//console.warn('showResult: ' + showResult + '\r\n' + tempXML);
	if (showResult){
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
	}
	if (forEmulator)
		tempFileName = pathEmulator.replace(/\//g, "\\");
	var erib_receipt = document.getElementById("erib_receipt");
	if (erib_receipt) {
		if (eribEntity.isReceiptDocument || eribEntity.isConfirm) {
			erib_receipt.innerHTML = "<span id='closeit' class='closeit'>&#10006;</span><div class='receipt-content'><pre>" + replaceHTML(eribEntity.show()) + "</pre></div>";
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
		erib_debug.innerHTML = "<span id='closedebug' class='closeit'>&#10006;</span><div class='debug-content'>DEBUG info:<pre>" + replaceHTML(eribEntity.show()) + "<br />" + errorText + "<br />" + replaceHTML(eribEntity.getButtons()) + "</pre></div>";
		eribshowerror = true;
	} else {
		if (errorText !== '') {
			errorText+='\r\n' + warnText;
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

	if (eribEntity.isConfirm) {
		var confirmOperation = document.getElementById("4.9.6.0");
		confirmOperation.parentNode.childNodes[0].checked = true;
		confirmOperation.parentNode.childNodes[0].setAttribute('checked', true);
		confirmOperation.namedItem("id").value = eribEntity.documentId;
		confirmOperation.namedItem("transactionToken").checked = true;
		document.getElementById("4.9.6.0.transactionToken.value").value = eribEntity.transactionToken;
		confirmOperation.style.display = 'block';
	}
	if (eribEntity.checkAvailable) {
		var element = document.getElementById("4.9.11.0");
		element.parentNode.childNodes[0].checked = true;
		element.parentNode.childNodes[0].setAttribute('checked', true);
		element.namedItem("id").value = eribEntity.documentId;
		element.style.display = 'block';
	}
	if (eribEntity.templateAvailable) {
		var element = document.getElementById("4.9.5.4.1");
		element.parentNode.childNodes[0].checked = true;
		element.parentNode.childNodes[0].setAttribute('checked', true);
		element.namedItem("payment").value = eribEntity.documentId;
		element.style.display = 'block';
	}
	if (eribEntity.autopayable) {
		var element = document.getElementById("4.9.7.1.1");
		element.parentNode.childNodes[0].checked = true;
		element.parentNode.childNodes[0].setAttribute('checked', true);
		element.namedItem("id").value = eribEntity.documentId;
		element.style.display = 'block';
	}
	if (eribEntity.isLogin) {
		switch (eribEntity.loginType) {
		case 'chooseAgreement':
			var chooseAgreement = document.getElementById("4.1.4");
			var agreementBlockoperation = document.getElementById("4.1.4");
			agreementBlockoperation.parentNode.childNodes[0].checked = true;
			agreementBlockoperation.parentNode.childNodes[0].setAttribute('checked', true);
			agreementBlockoperation.style.display = 'block';
			break;
		case 'loginCSA':
			var loginCSA = document.getElementById("4.1.3");
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
				if (serverList) {
					eribAddress.add(newoption);
				} else {
					eribAddress.set(eribEntity.host);
				}
			}
			//var csaBlockoperation = document.getElementById("4.1.3");
			loginCSA.parentNode.childNodes[0].checked = true;
			loginCSA.parentNode.childNodes[0].setAttribute('checked', true);
			loginCSA.style.display = 'block';
			break;
		}
	}

	document.getElementById("buttons").innerHTML = eribEntity.getButtons();
	document.getElementById("save2File").innerHTML = eribEntity.getButtons(true);
	SyntaxHighlighter.highlight();
	document.getElementById('currentServer').innerHTML = '<b>CSA:</b> <i>' + eribServerInfo.csaAddrr + '</i> &nbsp; &nbsp; &nbsp; <b>Node:</b>' + eribServerInfo.eribAddr
}

function parseJSON(result) {
	//console.log('parseJSON(result)');
	if (!result) result = this;
	try{
		if (XMLHttpRequest.prototype.removeEventListener) {
			result.removeEventListener("load", parseJSON, true);
		} else {
			if (result.detachEvent !== undefined) {
				result.detachEvent("onload", parseJSON);
			} else {
				result.onload = '';
			}
		}
	}
	catch(e){
		//console.error('parseJSON: ' + e.description);
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
		disabledReqs.add(permissionsL2[i],getElementsByClassName(document, permissionsL2[i]));
	}
}

function updatePermissions(){
	//console.log('updatePermissions()');
	var arrLength = permissionsL2.length;
	permList = {
		name:'needUDBO',
		isAllowed: eribClientInfo.checkedUDBO
	}
	if (eribClientInfo.permissionList.item(permList.name)!==permList.isAllowed) {
		eribClientInfo.permissionList.deleteitem(permList.name);
	}
	eribClientInfo.permissionList.add(permList.name,permList.isAllowed);
	
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
