var eventName = function eventType(stype) {
	switch (stype) {
	case 'ALWAYS':
		return 'Регулярный';
		break;
	case 'INVOICE':
		return 'По выставленному счету';
		break;
	case 'BY_ANY_RECEIPT':
		return 'При любом зачислении';
		break;
	case 'BY_CAPITAL':
		return 'При капитализации';
		break;
	case 'BY_SALARY':
		return 'При зачислении зарплаты';
		break;
	case 'BY_PENSION':
		return 'При зачислении пенсии';
		break;
	case 'BY_PERCENT':
		return 'При зачислении процентов';
		break;
	case 'ONCE_IN_WEEK':
		return 'Еженедельно';
		break;
	case 'ONCE_IN_MONTH':
		return 'Ежемесячно';
		break;
	case 'ONCE_IN_QUARTER':
		return 'Ежеквартально';
		break;
	case 'ONCE_IN_HALFYEAR':
		return 'Раз в полгода';
		break;
	case 'ONCE_IN_YEAR':
		return 'Ежегодно';
		break;
	case 'ON_OVER_DRAFT':
		return 'При овердрафте на счете получателя';
		break;
	case 'ON_REMAIND':
		return 'Когда, остаток на счете списания больше указанного остатка';
		break;
	case 'REDUSE_OF_BALANCE':
		return 'При снижении баланса';
		break;
	case 'BY_DEBIT':
		return 'При списании';
		break;
	case 'BY_INVOICE':
		return 'При выставлении счета';
		break;
	case 'FIXED_SUMMA':
		return 'Фиксированная сумма';
		break;
	case 'PERCENT_BY_ANY_RECEIPT':
		return 'Процент от зачислений';
		break;
	case 'PERCENT_BY_DEBIT':
		return 'Процент от расходов';
		break;
	default:
		return '';
	}
};

function erib_structure(xmlObject) {
	//console.log('erib_structure(xmlObject)');
	var errorXMLParser = "";
	try {
		if (xmlObject.parseError.errorCode !== 0)
			errorXMLParser = xmlObject.parseError.reason;
	} catch (err) {
		//console.error('erib_structure: ' + err.message);
		try {
			if (xmlObject.documentElement.nodeName === "parsererror")
				errorXMLParser = getChildren(xmlObject.documentElement)[0].nodeValue;
		} catch (eerrr) {
			//console.error('erib_structure: Fatal error. Could not parse XML.\r\n' + eerrr.message);
			errorXMLParser = "Fatal error. Could not parse XML.";
		}
	}
	var statusObj;
	if (!errorXMLParser.isEmpty()) {
		var statusNode = xmlObject.createElement("status");
		var codeNode = xmlObject.createElement("code");
		var codeTextNode = xmlObject.createTextNode("-1");
		codeNode.appendChild(codeTextNode);
		statusNode.appendChild(codeNode);
		var tempNode_0 = xmlObject.createElement("errors");
		var tempNode_1 = xmlObject.createElement("error");
		var tempNode_2 = xmlObject.createElement("text");
		var tempTextNode = xmlObject.createTextNode("Невалидный XML от ЕРИБа!!!\r\n " + errorXMLParser);
		errorText += "<br />" + errorXMLParser;
		tempNode_2.appendChild(tempTextNode);
		tempNode_1.appendChild(tempNode_2);
		tempNode_0.appendChild(tempNode_1);
		statusNode.appendChild(tempNode_0);
		statusObj = xmlObject.appendChild(statusNode);
	} else {
		statusObj = xmlObject.getElementsByTagName("status")[0];
	}
	var isDocument = false,
	isReceiptDocument = false,
	checkAvailable = false,
	templateAvailable = false,
	autopayable = false,
	isInitialData = false,
	isConfirm = false,
	isPermissions = false,
	showResult = true;
	var documentId,
	receiptTitle = '',
	host = '';
	this.host = host;

	var transactionToken = getXmlValue(xmlObject, "transactionToken");
	var operationUID = getXmlValue(xmlObject, "operationUID");
	var form = getXmlValue(xmlObject, "form");
	var localStatus = new responseStatus(statusObj);
	var isLogin = getXmlValue(xmlObject, "loginCompleted", true);

	if (isLogin) {
		eribClientInfo.logedIn = (getXmlValue(xmlObject, "loginCompleted") === 'true');
		eribClientInfo.checkedUDBO = (getXmlValue(xmlObject, "checkedUDBO") === 'true');
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
				if (eribClientInfo.agreementList.indexOf(product) === -1)
					eribClientInfo.agreementList.push(product);
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
	if (isPermissions)
		eribClientInfo.checkedUDBO = (getXmlValue(xmlObject, "checkedUDBO") === 'true');
	this.isPermissions = isPermissions;
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
		this.document = new document(xmlObject);
	} else {
		//Not a document means it might be a list
		if (eribClientInfo.logedIn) {
			//if(!eribClientInfo) eribClientInfo = new eribPerson(xmlObject);
			//if (isPermissions)
			//	showResult = (eribClientInfo.permissionList.key.length > 1);
			this.list = new list();
		}
	}
	this.isConfirm = isConfirm;
	this.isReceiptDocument = isReceiptDocument;
	this.checkAvailable = checkAvailable;
	this.templateAvailable = templateAvailable;
	this.autopayable = autopayable;
	this.showResult = showResult;

	//Structures
	function responseStatus(statusObj) {
		//console.log('erib_structure: responseStatus(statusObj)');
		try {
			this.code = function () {
				return parseInt(getXmlValue(statusObj, "code"), 10);
			};
			this.error = new eribError(statusObj.getElementsByTagName("error"));
			this.warning = new eribError(statusObj.getElementsByTagName("warning"));
		} catch (e) {
			//console.error('erib_structure: responseStatus: ' + e.message);
			this.code = function () {
				return -1;
			};
			this.error = [{
					text : 'Не смогли получить статус от ЕРИБа. ' + e.message,
					element : ''
				}
			];
			this.warning = [{
					text : 'Не смогли получить статус от ЕРИБа. ' + e.message,
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

	function document(xmlObject) {
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
			'minPayment', 'ownSum', 'limit', 'nextPayAmount'];
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
		var eventType = function eventType(stype) {
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
		var newField,
		item;
		//Проверяем и заполняем поле transactionToken
		if (!transactionToken.isEmpty()) {
			newField = new erib_field();
			item = new field_item();
			newField.title = 'Токен транзакции';
			newField.name = 'transactionToken';
			newField.required = true;
			item.value = transactionToken;
			newField.items.push(item);
			documentfields.push(newField);
		}
		//Проверяем и заполняем поле operationUID
		if (!operationUID.isEmpty()) {
			newField = new erib_field();
			item = new field_item();
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
			newField = new erib_field();
			newField.title = 'Комиссия';
			newField.name = 'commission';
			//В случае CreateAutoSubscription поле commission может прилететь дважды o_O
			var commission = xmlObject.getElementsByTagName("commission");
			if (commission.length > 1)
				var isCreateAutoSubscriptionDocument = (getXmlValue(xmlObject, "commissionCurrency", true));
			for (var commField = 0; commField < commission.length; commField++) {
				var itemAmount = new field_item();
				var itemCurrency = new field_item();
				itemAmount.title = 'Сумма';
				itemAmount.value = '0';
				itemCurrency.title = 'Валюта';
				itemCurrency.value = 'рубли РФ'
					//Проверяем тип пришедшего поля - он может быть money или string
					var thisFieldType = getXmlValue(commission[commField], "type");
				if (!thisFieldType.isEmpty()) {
					var commissionType = commission[commField].getElementsByTagName(thisFieldType + "Type");
					if (commissionType.length > 0)
						itemAmount.value = getXmlValue(commissionType[0], "value");
					var commissionCurrency = xmlObject.getElementsByTagName("commissionCurrency");
					if (commissionCurrency.length > 0) {
						var stringType = commissionCurrency[0].getElementsByTagName("stringType");
						if (stringType.length > 0)
							itemCurrency.value = getXmlValue(stringType[0], "value");
					}
				} else {
					itemAmount.value = getXmlValue(commission[commField], "amount");
					itemCurrency.value = getXmlValue(commission[commField], "name");
				}
				newField.items.push(itemAmount);
				newField.items.push(itemCurrency);
			}
			documentfields.push(newField);
		}
		//Комиссия может взиматься, но сумма не указана
		if (getXmlValue(xmlObject, "isWithCommission", true)) {
			newField = new erib_field();
			newField.title = 'Комиссия';
			newField.name = 'commission';
			var isWithCommission = (getXmlValue(xmlObject, "isWithCommission").toLowerCase() === "true");
			item = new field_item();
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
				newField = new erib_field();
				newField.title = 'Микрооперация';
				newField.name = 'writeDownOperation';
				var getItem = function (title, value) {
					var fieldItem = new field_item();
					fieldItem.title = title;
					fieldItem.value = getXmlValue(writeDownOperation[operationNo], value);
					return fieldItem;
				}
				newField.items.push(getItem('Наименование', 'operationName'));
				newField.items.push(getItem('Сумма операции', 'curAmnt'));
				newField.items.push(getItem('', 'turnOver'));
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
			if (getChildren(fields_name[i]).length === 0) { //Убеждаемся, что у поля name нет детей
				//Прыгаем на уровень выше, чтобы работать с ЕРИБовским элементом типа Field
				var tempField = fields_name[i].parentNode;
				//Проверка на принадлежность к "Родителям"
				isParent = (parentTypes.indexOf(tempField.parentNode.tagName + "\\" + tempField.tagName) !== -1);
				if (!isParent && curParent !== '') { //Текущее поле не "родитель" и объект curParent - не пустой
					//Проверка на принадлежность к "деткам"
					isChild = (childrenTypes.indexOf(tempField.parentNode.tagName) !== -1);
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
				//Если это не тип Money
				//и не список продуктов (т.е. его нет в productsType)
				//и форма не входит в список exceptionList
				//заполняем текущее поле.
				if (!(tempField.tagName === 'currency' & moneyType.indexOf(tempField.parentNode.tagName) !== -1)
					 & !(productsType.indexOf(tempField.parentNode.tagName + "\\" + tempField.tagName) !== -1)
					 || exceptionList.indexOf(form) !== -1) {
					newField = new erib_field();
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
						item = new field_item();
						var valueField = field_values[j].parentNode;
						item.defaultValue = getXmlValue(valueField, "default");
						item.displayedValue = getXmlValue(valueField, "displayedValue");
						if (getXmlValue(valueField, "productValue", true))
							item.productValue = new eribProduct(valueField.getElementsByTagName("productValue")[0]);
						item.selected = (getXmlValue(valueField, "selected") === 'true');
						item.title = getXmlValue(valueField, "title");
						item.value = getXmlValue(valueField, "value");
						newField.items.push(item);
					}
					//Если у данного поля вдруг не оказалось никаких значений - вбиваем пустышку.
					if (newField.items.length < 1) {
						var item = new field_item();
						newField.items.push(item);
					}
					//Получаем список всех валидаторов для поля.
					var field_validators = tempField.getElementsByTagName("validator");
					for (var j = 0; j < field_validators.length; j++) {
						var item = new field_validator();
						var validatorField = field_validators[j].parentNode;
						item.type = getXmlValue(validatorField, "type");
						item.message = getXmlValue(validatorField, "message");
						item.parameter = getXmlValue(validatorField, "parameter");
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
			'moneyBoxes//moneyBox', 'officeList//office', 'operations//operation', 'operationsList//operation', 'payments//payment',
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
		var children = getChildren(xmlParentObj);
		for (var i = 0; i < children.length; i++) {
			var __children = getChildren(children[i]);
			var childrenLength = __children.length;
			if (childrenLength > 0) {
				var curListItems = children[i].tagName + '//' + __children[childrenLength - 1].tagName;
				if (listNodes.indexOf(curListItems) !== -1) {
					var listItems = xmlParentObj.getElementsByTagName(__children[childrenLength - 1].tagName);
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
						//if (EribTemplate.indexOf(currentNode.tagName) !== -1) {
						if (requestName === 'templatesList') {
							var product = new eribTemplate(currentNode);
							if (eribClientInfo.templatesList.indexOf(product) === -1)
								eribClientInfo.templatesList.push(product);
						}
						if (requestName === 'moneyboxesList') {
							var product = new eribMoneyBox(currentNode);
							if (eribClientInfo.moneyBoxesList.indexOf(product) === -1)
								eribClientInfo.moneyBoxesList.push(product);
						}
						if (EribLoanOffer.indexOf(currentNode.tagName) !== -1) {
							var product = new eribLoanOffer(currentNode);
							if (eribClientInfo.loanOffersList.indexOf(product) === -1)
								eribClientInfo.loanOffersList.push(product);
						}
						if (requestName === "servicesPayments") {
							var product = new eribService(currentNode);
							//notListed = false;
						}
						if (ProviderList.indexOf(currentNode.tagName) !== -1) {
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
							if (eribClientInfo.permissionList.item(permList.name) !== permList.isAllowed) {
								eribClientInfo.permissionList.deleteitem(permList.name);
							}
							eribClientInfo.permissionList.add(permList.name, permList.isAllowed);
							notListed = false;
						}
						if (StandartList.indexOf(currentNode.tagName) !== -1) {
							var stdList = new standardList(currentNode);
							listEntry.id = stdList.type;
							listEntry.listOfValues.push({
								name : stdList.main.id,
								value : stdList
							});
							notListed = false;
						}
						if (notListed && getChildren(currentNode).length > 0) {
							var tryList = [];
							tryList = enumChildren(currentNode, index + 1);
							if (tryList.length > 0) {
								listEntry.listOfValues.push(tryList);
								notListed = false;
							}
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
		var receiptNode = window.document.createTextNode('=========ПОДТВЕРЖДЕНИЕ ОПЕРАЦИИ=========' + '\r\n\r\n');
		if (this.isDocument) {
			result = formFields(this.document, divId);
		}
		if (isReceiptDocument) {
			var half_add_2_40 = '';
			try {
				var half_add_2_40 = ' '.repeat(parseInt((40 - receiptTitle.length) / 2, 10));
			} catch (e) {
				//console.error(e);
			}
			receiptNode = window.document.createTextNode('-------------ПОЛУЧЕННЫЙ ЧЕК-------------' + '\r\n\r\n');
			var titleNode = window.document.createTextNode(half_add_2_40 + receiptTitle.toUpperCase() + '\r\n\r\n');
			result.insertBefore(titleNode, result.firstChild);
		}
		if (isReceiptDocument || isConfirm)
			result.insertBefore(receiptNode, result.firstChild);
		return result;
	};

	function formFields(fieldsCollection, divId) {
		//console.log('erib_structure: formFields(fieldsCollection:'+fieldsCollection+', divId:'+divId+')');
		var result = '';
		var returnspan = window.document.createElement('span');
		var fieldslength = fieldsCollection.length;
		for (var i = 0; i < fieldslength; i++) {
			var sClass = '';
			var field = fieldsCollection[i];
			if (field.isShow) {
				if (field.visible || field.required) {
					if (field.required)
						sClass = 'required';
					if (!field.visible)
						sClass = 'invisible';
					if (!field.editable && field.visible)
						sClass = 'disabled';
					if (localStatus.error.element()[0] === field.name) {
						sClass = "error";
					}
					var docItems = field.items;
					var itemsLength = docItems.length;
					if (isReceiptDocument || isConfirm) {
						if (field.visible) {
							var txtValue = field.toString();
							var value = window.document.createTextNode(txtValue);
							returnspan.appendChild(value);
						}
					} else {
						var divParent;
						var selectionTag = function (textTag) {
							if (!textTag)
								textTag = field.title;
							var spanTxt = window.document.createElement('span');
							var inpText = window.document.createTextNode(textTag);
							spanTxt.appendChild(inpText);
							spanTxt.setNewAttribute('class', 'description postdata');
							return spanTxt;
						}
						var setParent = function (node) {
							if (field.isParent) {
								node.setNewAttribute('onclick', 'checkDependensies(' + field.name + ', ' + divId + ');');
								node.setNewAttribute('id', field.name);
							}
							return node;
						}
						if (itemsLength > 1 || field.isParent) {
							if (field.isParent) {
								divParent = window.document.createElement('div');
								divParent = setParent(divParent);
								for (var j = 0; j < itemsLength; j++) {
									var childDiv = window.document.createElement('div');
									var children = docItems[j].children;
									childDiv.appendChild(formFields(children));
									divParent.appendChild(childDiv);
								}
							}
							var selectSection = window.document.createElement('select');
							var selectName = window.document.createAttribute('name');
							selectName.value = field.name;
							selectSection = setParent(selectSection);
							for (var j = 0; j < itemsLength; j++) {
								var optionField = window.document.createElement('option');
								var optionSelected = '';
								if (docItems[j].selected)
									optionField.setNewAttribute('selected', optionSelected);
								if (docItems[j].productValue.id !== -1) {
									optionField.text = docItems[j].displayedValue + ' [' + docItems[j].value + ']';
								} else {
									optionField.text = docItems[j].title + ' [' + docItems[j].value + ']';
								}
								optionField.setNewAttribute('value', docItems[j].value);
								selectSection.add(optionField);
							}
							var spanTxtselectSection = selectionTag();
							selectSection.setNewAttribute('class', sClass);

							returnspan.appendChild(selectSection);
							returnspan.appendChild(spanTxtselectSection);
						} else {
							if (field.name === 'exactAmount') {
								var exactAmount = window.document.createElement('select');
								exactAmount.setNewAttribute('name', 'exactAmount');
								exactAmount.setNewAttribute('id', 'exactAmount');
								exactAmount = setParent(exactAmount);
								var charge_off = window.document.createElement('option');
								charge_off.text = 'Пользователь указал поле с суммой списания';
								charge_off.value = 'charge-off-field-exact';
								var destination = window.document.createElement('option');
								destination.text = 'Пользователь указал поле с суммой зачисления';
								destination.value = 'destination-field-exact';
								exactAmount.add(charge_off);
								exactAmount.add(destination);
								var spanTxtexactAmount = selectionTag();
								returnspan.appendChild(exactAmount);
								returnspan.appendChild(spanTxtexactAmount);
							} else {
								var inpField = window.document.createElement('input');
								if (field.name === 'buyAmount' || field.name === 'sellAmount')
									inpField.onclick = checkExactAmount(field.name);
								inpField.setNewAttribute('name', field.name);
								inpField.setNewAttribute('value', docItems[0].value);
								var spanTxtinpField = selectionTag(field.title + '\t' + docItems[0].title + '\t' + docItems[0].displayedValue);
								inpField.setNewAttribute('class', sClass);
								returnspan.appendChild(inpField);
								returnspan.appendChild(spanTxtinpField);
							}
						}
						if (field.isParent) {
							returnspan.appendChild(divParent);
						}
					}
				}
			}
		}
		return returnspan;
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

	this.getButtons = function (isSave, existButtons) {
		//console.log('erib_structure: getButtons(isSave:'+isSave+')');
		var span = window.document.createElement('span');
		//var save2file = '';
		if (existButtons) {
			var existButtonslength = existButtons.length;
			for (var i=existButtonslength;i>0;i--) {
				if (existButtons[i-1].value !== 'Сохранить') {
					span.appendChild(existButtons[i-1]);
				}
			}
		}
		var button = function (buttonText, op_id) {
			var input = window.document.createElement('input');
			input.type = 'button';
			input.setNewAttribute('onclick', 'trySubmit.call(this,"' + op_id + '");');
			input.setNewAttribute('value', buttonText);
			return input;
		};
		if (checkAvailable) {
			span.appendChild(button('Печать чека', '4.9.11.0'));
		}
		if (templateAvailable) {
			span.appendChild(button('Создать шаблон', '4.9.5.4.1'));
		}
		if (autopayable) {
			span.appendChild(button('Создать АП', '4.9.7.1.1'));
		}
		if (this.isConfirm)
			span.appendChild(button('Подтвердить', '4.9.6.0'));
		if (localStatus.code() !== -1 && isSave) {
			var save2File = button('Сохранить', '');
			try {
				save2File.setNewAttribute('onclick', 'saveToFile("' + eribEntity.formId + '.xml");');
				/*save2File.onclick = function () {
				saveToFile(formId + '.xml')
				};*/
				save2File.setNewAttribute('class', 'save2File');
			} catch (e) {
				//console.error(e);
			}
			//span.setNewAttribute('class','save2File');
			span.appendChild(save2File);
		}
		return span;
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
		this.toString = function () {
			var fitTo40symbols = function (fname, fvalue) {
				var fnameLength = fname.length;
				var fvalueLength = fvalue.length;
				var totalLength = fnameLength + fvalueLength;
				var title = '';
				var value = '';
				var delim = '';
				var x;
				if (totalLength < 38) {
					delim = ' '.repeat(38 - totalLength);
				}
				if (fnameLength < 40) {
					title = trim(fname, ':') + ': ';
				} else {
					var arr = fname.split(' ');
					x = title.length;
					for (var i = 0; i < arr.length; i++) {
						if (x + arr[i].length < 39) {
							title += ' ' + arr[i];
							x += arr[i].length + 1;
						} else {
							title += '\r\n' + arr[i];
							x = arr[i].length;
						}
					}
					title += ': ';
				}
				if ((title.length + fvalueLength) < 40) {
					value = fvalue;
				} else {
					value = '\r\n   ';
					x = 3;
					var arr = fvalue.split(' ');
					for (var i = 0; i < arr.length; i++) {
						if (x + arr[i].length < 39) {
							value += ' ' + arr[i];
							x += arr[i].length + 1;
						} else {
							value += '\r\n    ' + arr[i];
							x = 4 + arr[i].length;
						}
					}
				}
				console.log('fitTo40symbols(fname,fvalue): title: [' + title + ']\r\n delim: [' + delim + ']\r\nvalue: [' + value + ']');
				return title.toUpperCase() + delim + value.toUpperCase();
			}
			var fieldItems = this.items;
			var itemsLength = fieldItems.length;
			var value = '';
			var fieldItemsValue = '';
			if (itemsLength > 1) {
				for (var i = 0; i < itemsLength; i++) {
					fieldItemsValue = fieldItems[i].title;
					if (fieldItemsValue.length < 1) {
						fieldItemsValue = fieldItems[i].value
					}
					var prodValue = fieldItems[i].productValue;
					if (fieldItems[i].selected) {
						if (prodValue.id !== -1) {
							value += fitTo40symbols('', fieldItems[i].displayedValue) + '\r\n';
						} else {
							value += fitTo40symbols(this.title, fieldItemsValue) + '\r\n';
						}
					}
				}
			} else {
				if (fieldItems[0].displayedValue === '') {
					fieldItemsValue = fieldItems[0].title;
					if (fieldItemsValue.length < 1) {
						fieldItemsValue = fieldItems[0].value
					}
					value += fitTo40symbols(this.title, fieldItemsValue) + '\r\n';
				} else {
					value += fitTo40symbols(this.title, fieldItems[0].displayedValue) + '\r\n';
				}
			}
			return value;
		}
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
			var amount = srcXML.getElementsByTagName("amount");
			if (amount.length > 0)
				this.balance = new eribSum(amount[0].parentNode);
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
	var newService = function (tagName) {
		var service = srcXML.getElementsByTagName(tagName);
		if (service.length > 0)
			return (new eribService(service[0]));
		return {
			id : '',
			type : '',
			name : '',
			title : '',
			description : '',
			guid : '',
			img : {
				id : -1,
				URL : '',
				updated : '00.00.0000T00:00:00'
			},
			providers : new productListObj()
		};
	}
	this.service = newService("service");
	this.provider = newService("provider");
	this.category = newService("category");
	this.parent = newService("parent");
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
		//console.error('erib_structure: eribSum: ' + e.message);
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

function eribMoneyBox(srcXML) {
	//console.log('erib_structure: eribTemplate(srcXML)');
	this.id = getXmlValue(srcXML, "id");
	this.name = getXmlValue(srcXML, "name");
	this.type = getXmlValue(srcXML, "type");
	this.eventDescription = getXmlValue(srcXML, "executionEventDescription");
	var eventType = getXmlValue(srcXML, "executionEventType");
	this.eventType = eventType;
	this.eventName = eventName(eventType);
	this.sum = new eribSum(srcXML, "amount");
	this.status = getXmlValue(srcXML, "status");
}

function eribPermissions(srcXML) {
	//console.log('erib_structure: eribPermissions(srcXML)');
	this.name = getXmlValue(srcXML, "key");
	this.isAllowed = (getXmlValue(srcXML, "allowed") === 'true');
}

function eribPerson(srcXML) {
	var card = [],
	region = [],
	atmRegion = [];
	//console.log('erib_structure: eribPerson(srcXML)');
	this.logedIn = false;
	this.permissionsChecked = false;

	this.name = getXmlValue(srcXML, "firstName");
	this.surName = getXmlValue(srcXML, "surName");
	this.patrName = getXmlValue(srcXML, "patrName");
	if (srcXML) {
		card = srcXML.getElementsByTagName("card");
		region = srcXML.getElementsByTagName("region");
		atmRegion = srcXML.getElementsByTagName("atmRegion");
	}
	if (atmRegion.length > 0) {
		this.atmRegion = new eribRegion(atmRegion[0]);
	} else {
		this.atmRegion = {
			id : -1,
			name : "",
			guid : "",
			children : []
		}
	}
	if (region.length > 0) {
		this.clientRegion = new eribRegion(region[0]);
	} else {
		this.clientRegion = {
			id : -1,
			name : "",
			guid : "",
			children : new productListObj()
		}
	}
	if (card.length > 0) {
		this.product = new eribProduct(card[0]);
	} else {
		this.product = {
			id : -1
		}
	}
	this.clientType = getXmlValue(srcXML, "creationType");
	this.checkedUDBO = (getXmlValue(srcXML, "checkedUDBO") === 'true');
	this.agreementList = new productListObj();
	this.loanOffersList = new productListObj();
	this.moneyBoxesList = new productListObj();
	this.permissionList = new dictionary();
	this.productsList = new productListObj();
	this.regularPaymentsList = new productListObj();
	this.templatesList = new productListObj();
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