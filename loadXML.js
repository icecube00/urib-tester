var scriptVersion = "2.1.07";
var eribOperations = new dictionary();
var alter2spec = new dictionary();
var arrayOfrequests = [];

function loadXML() {
	//console.log('loadXML()');
	var newhttp = getXMLHttp();
	var docXML,
	ok = false;
	try {
		newhttp.onreadystatechange = function () {
			if (newhttp.readyState === 4) {
				try { //Parse answer
					docXML = getXMLObject(newhttp);
					ok = true;
				} catch (err) {}
			}
		};
		newhttp.open('GET', 'erib_Protocol.xml', false);
		newhttp.send();

	} catch (error) {
		docXML = CreateMSXMLDocumentObject();
		docXML.async = false;
		docXML.load('erib_Protocol.xml');
		ok = true;
	}
	var timer = 0;
	while (!ok && timer < 1000) {
		timer++;
		//just wait till we have docXML loaded
	}
	var errorXMLParser = "";
	try {
		if (docXML.parseError.errorCode !== 0)
			errorXMLParser = docXML.parseError.reason;
	} catch (err) {
		//console.warn('loadXML(): Error:: ' + err.message);
		try {
			var children = getChildren(docXML.documentElement);
			if (docXML.documentElement.nodeName === "parsererror")
				errorXMLParser = children[0].nodeValue;
		} catch (e) {
			//console.warn('loadXML(): Error:: ' + e.message);
			errorXMLParser = 'Fatal error. Could not parse XML.\r\nERROR: ' + e.message;
		}
	}
	if (errorXMLParser.isEmpty()) {
		//
		var globalSettings = document.getElementById('settings');
		var settings = docXML.documentElement.selectNodes('./settings');
		var settingsLength = settings.length;
		for (var current = 0; current < settingsLength; current++) {
			var currentSetting = settings[current];
			var divSetting = buildSettings(currentSetting);
			globalSettings.appendChild(divSetting);
		}
		var operations = docXML.documentElement.selectNodes('./operation');
		var operationsLength = operations.length;

		var globalDiv = document.getElementById('operations');
		var isOdd = true;
		for (var currentOp = 0; currentOp < operationsLength; currentOp++) {
			var currentOperation = operations[currentOp];
			var divMenu = buildMenu(currentOperation, isOdd);
			if (isOdd) {
				isOdd=false;
			} else {
				isOdd=true;
			}
			globalDiv.appendChild(divMenu);
		}

		if (document.getElementById("useStatus").checked) {
			getCards();
			document.getElementById("useStatus").checked = false;
		}
		eribSpec = ' [' + docXML.documentElement.getAttribute('specification') + ']';
		prepareChoiceAddr();
		prepareDivChoice();
		divChoice();
		preparePermission();
		Version(eribSpec);
		//console.log('eribOperations:' + eribOperations.toString());
		//console.log('alter2spec:' + alter2spec.toString());
	}
}

function buildMenu(operation, isOdd) {
	var op_name = operation.getAttribute('name');
	var op_id = operation.getAttribute('id');
	//console.log('buildMenu(operation [' + op_id + '::' + op_name + '])');
	var div = document.createElement('div');
	var txtNode = document.createTextNode(' ' + op_id + ' ' + op_name);

	var spanTxt = document.createElement('span');
	spanTxt.appendChild(txtNode);
	spanTxt.setNewAttribute('class', 'description operations');

	var input = document.createElement('input');
	input.type = 'checkbox';
	input.setNewAttribute('name', op_id);
	input.setNewAttribute('class', 'ignore');

	var inpClick = 'toggleChildren("' + op_id + '");';
	div.setNewAttribute('onclick', inpClick);
	div.setNewAttribute('name', op_name);
	div.setNewAttribute('id', op_id);
	if (isOdd) {
		div.setNewAttribute('class', 'operation odd');
	} else {
		div.setNewAttribute('class', 'operation even');		
	}
	div.appendChild(input);
	div.appendChild(spanTxt);
	var innerChildren = getChildren(operation);
	var childrenLength = innerChildren.length;
	for (var child = 0; child < childrenLength; child++) {
		var inner = innerChildren[child];
		isOdd?isOdd=false:isOdd=true;
		if (inner.nodeName === 'operation') {
			var innerDiv = buildMenu(inner, isOdd);
			innerDiv.style.display = 'none';
			div.appendChild(innerDiv);
		}
		if (inner.nodeName === 'request') {
			var innerRequest = buildRequest(inner, isOdd);
			innerRequest.style.display = 'none';
			div.appendChild(innerRequest);
		}
	}

	return div;
}

function buildRequest(request, isOdd) {
	arrayOfrequests = [];
	var formDiv = document.createElement('div');
	if (isOdd) {
		formDiv.setNewAttribute('class', 'request odd');
	} else {
		formDiv.setNewAttribute('class', 'request even');
	}
	var req_name = request.getAttribute('name');
	var req_id = request.getAttribute('id');
	//console.log('buildRequest(request [' + req_id + '::' + req_name + '])');

	var needUDBO = (request.getAttribute('requireUDBO') === "true");
	var permissions = request.getAttribute('service')||'';
	if (needUDBO)
		permissions += " needUDBO";
	var form = document.createElement('form');

	var action = request.selectNodes('./action')[0];
	var tParams = action.selectNodes('./params')[0];
	var params = getChildren(tParams);

	form.setNewAttribute('accept-charset', 'UTF-8');
	form.setNewAttribute('name', req_name);
	form.setNewAttribute('id', req_id);
	form.setNewAttribute('action', action.getAttribute('url'));

	var checkBox = document.createElement('input');
	checkBox.type = 'checkbox';
	checkBox.setNewAttribute('class', 'ignore');
	checkBox.setNewAttribute('name', req_id);

	var paramsLength = params.length;
	for (var par = 0; par < paramsLength; par++) {
		var br = document.createElement('div');
		var curParam = params[par];
		var input = fillDiv(curParam, req_id);
		for (var x = 0; x < input.length; x++)
			form.appendChild(input[x]);
		form.appendChild(br);
	}
	var submit = document.createElement('input');
	submit.type = 'button';

	var submitClick = 'trySubmit("' + req_id + '");';
	submit.setNewAttribute('onclick', submitClick);
	submit.setNewAttribute('value', 'Выполнить запрос');
	submit.setNewAttribute('class', 'button submit');

	var txtNode = document.createTextNode(' ' + req_id + ' ' + req_name);

	var spanTxt = document.createElement('span');
	spanTxt.appendChild(txtNode);
	spanTxt.setNewAttribute('class', 'description request ' + permissions);
	form.setNewAttribute('class', 'border description form');
	form.method = action.getAttribute('method');
	form.appendChild(submit);

	formDiv.appendChild(checkBox);
	formDiv.appendChild(spanTxt);
	form.style.display = 'none';
	formDiv.appendChild(form);

	var inpClick = 'toggleChildren("' + req_id + '", true);';
	formDiv.setNewAttribute('onclick', inpClick);
	eribOperations.add(req_id, action.getAttribute('name'));
	alter2spec.add(req_id, arrayOfrequests);
	return formDiv;
}

function createShow(param, req_id) {
	var showSpan = document.createElement('span');
	var options = param.selectNodes('./list/option');
	var optionsLength = options.length;
	var id = '',
	name = [];
	var prevId = req_id + '.prev';
	for (var opt = 0; opt < optionsLength; opt++) {
		var value = options[opt].getAttribute('value');
		var fill = (options[opt].getAttribute('fill') === 'true');
		if (fill) {
			id = value + '.next';
			arrayOfrequests.push(value);
		}
		name.push(value + '.next');
	}
	var showDiv = document.createElement('div');
	var prevDiv = document.createElement('div');
	//console.log('createShow(param [' + id + '::' + name + '])');
	showDiv.setNewAttribute('class', 'border showresult');
	showDiv.setNewAttribute('name', name.join(' '));
	showDiv.setNewAttribute('id', id);
	showDiv.style.display = 'none';
	showSpan.appendChild(showDiv);
	prevDiv.setNewAttribute('class', 'border showresult');
	prevDiv.setNewAttribute('name', name.join(' ') + ' ' + req_id + '.prev');
	prevDiv.setNewAttribute('id', prevId);
	prevDiv.style.display = 'none';
	showSpan.appendChild(prevDiv);
	return showSpan;
}

function createInput(param, type, req_id) {
	var required = (param.getAttribute('required') === 'true');
	var classValue = '';

	var input = document.createElement('input');
	var inpValue = param.getAttribute('value');

	var inpText = document.createTextNode(param.getAttribute('text'));

	var spanTxt = document.createElement('span');
	spanTxt.appendChild(inpText);
	var inpName = param.getAttribute('name');
	if (req_id) {
		//spanTxt.setNewAttribute('name', inpName);
		input.setNewAttribute('name', inpName);
		spanTxt.setNewAttribute('class', 'description postdata');
	} else {
		//spanTxt.setNewAttribute('id', inpName);
		input.setNewAttribute('id', inpName);
		classValue = 'settingsElement';
		spanTxt.setNewAttribute('class', 'settingsElement');
	}
	input.setNewAttribute('type', 'text'); //.type = 'text';
	input.setNewAttribute('value', inpValue);
	//spanTxt.setNewAttribute('id', inpName);

	if (type === 'bool') {
		input.setNewAttribute('type', 'checkbox'); //.type = 'checkbox';
		classValue += ' ignore readonly';
		var currentClass = spanTxt.getAttribute('class')||'';
		spanTxt.setNewAttribute('class', currentClass + ' description boolean');
	}

	if (type === 'read') {
		classValue += ' readonly';
	}
	if (type === 'hidden') {
		input.setNewAttribute('type', 'hidden'); //.type = 'hidden';
	}
	input.setNewAttribute('class', classValue);
	//console.log('createInput(param [' + param.getAttribute('name') + '::' + param.getAttribute('text') + '])');
	return [input, spanTxt];
}

function createList(param, req_id) {
	var required = (param.getAttribute('required') === 'true');
	var newSelect = document.createElement('select');
	var selectName = param.getAttribute('name');
	if (req_id) {
		newSelect.setNewAttribute('name', selectName);
	} else {
		newSelect.setNewAttribute('id', selectName);
		newSelect.setNewAttribute('class', 'settingsElement');
	}
	var options = param.selectNodes('./list/option');
	var optionsLength = options.length;
	for (var opt = 0; opt < optionsLength; opt++) {
		var newOption = document.createElement('option');
		var text = options[opt].text || options[opt].textContent;
		var value = options[opt].getAttribute('value');
		newOption.text = text + ' [' + value + ']';
		newOption.value = value;
		newSelect.add(newOption);
	}
	//console.log('createList(param [' + param.getAttribute('name') + '])');
	return newSelect;
}

function createChoice(param, req_id) {
	var required = (param.getAttribute('required') === 'true');
	var choiceDiv = document.createElement('div');
	choiceDiv.setNewAttribute('class', 'choice');
	var choices = param.selectNodes('./choice');
	var choicesLength = choices.length;
	for (var choice = 0; choice < choicesLength; choice++) {
		var optionDiv = document.createElement('div');
		optionDiv.setNewAttribute('class', 'option choose1');
		var params = getChildren(choices[choice]);
		var paramsLength = params.length;
		for (var par = 0; par < paramsLength; par++) {
			var br = document.createElement('br');
			var curParam = params[par];
			var input = fillDiv(curParam, req_id);
			for (var x = 0; x < input.length; x++)
				optionDiv.appendChild(input[x]);
			optionDiv.appendChild(br);
		}
		choiceDiv.appendChild(optionDiv);
	}
	//console.log('createChoice(param, req_id [' + req_id + '])');
	return choiceDiv;
}

function fillDiv(curParam, req_id) {
	var type = curParam.getAttribute('type');
	var required = (curParam.getAttribute('required') === 'true');
	var input = [];
	var spanTxt = document.createElement('span');
	var pushSpan = false;
	var pushInput = [];
	switch (type) {
	case 'choice':
		pushInput.push(createChoice(curParam, req_id));
		break;
	case 'list':
		pushInput.push(createList(curParam, req_id));
		var inpText = document.createTextNode(curParam.getAttribute('text'));
		spanTxt.appendChild(inpText);
		if (req_id) {
			spanTxt.setNewAttribute('class', 'description postdata');
		}
		pushInput.push(spanTxt);
		break;
	case 'show':
		pushInput.push(createShow(curParam, req_id));
		break;
	default:
		pushInput = createInput(curParam, type, req_id);
	}
	var notRequired = ['bool', 'show', 'choice'];
	if (!required && (notRequired.indexOf(type) === -1)) {
		//console.log('fillDiv(curParam [' + curParam.getAttribute('text') + ', req_id [' + req_id + ']) :: OPTIONAL');
		var optionalCheck = document.createElement('input');
		optionalCheck.type = 'checkbox';
		optionalCheck.setNewAttribute('class', 'ignore readonly');

		var attrName = '';
		if (req_id) {
			attrName = pushInput[0].getAttribute('name');
		} else {
			attrName = pushInput[0].getAttribute('id');
		}
		optionalCheck.setNewAttribute('name', attrName);

		var attrValue = '';
		if (req_id) {
			attrValue = req_id + '.' + attrName + '.value';
		} else {
			attrValue = 'settings.' + attrName + '.value';
		}
		optionalCheck.setNewAttribute('value', attrValue);

		pushInput[0].setAttribute('id', attrValue);
		var optionalclass = pushInput[0].getAttribute('class');
		optionalclass = "optionaldiv";
		pushInput[0].setAttribute('class', optionalclass);
		pushInput[0].removeAttribute('name');
		pushInput.unshift(optionalCheck);
	} else {
		//console.log('fillDiv(curParam [' + curParam.getAttribute('text') + ', req_id [' + req_id + '])');
	}
	return pushInput;
}

function toggleChildren(divId, isForm) {
	//console.log('toggleChildren(' + divId + ', isForm:' + isForm + ')');
	var currentDiv = document.getElementById(divId);
	var showIt = 'none';
	var divChildren = [],
	children = [];
	if (isForm) {
		children = getChildren(currentDiv.parentElement);
		divChildren.push(currentDiv);
	} else {
		children = getChildren(currentDiv);
		divChildren = children;
	}
	var input = children[0];
	if (input.checked) {
		showIt = 'block';
	}
	var childCount = divChildren.length;
	var myTags = ['DIV', 'FORM'];
	for (var child = 0; child < childCount; child++) {
		var tryIt = (divChildren[child].nodeType === 1 && (myTags.indexOf(divChildren[child].tagName) !== -1));
		if (tryIt)
			divChildren[child].style.display = showIt;
	}
	//console.log('toggleChildren(' + divId + ' ' + input.checked + ')');
}

function buildSettings(setting) {
	var div = document.createElement('div');
	div.setNewAttribute('class', 'settings');

	var paramBlocks = setting.selectNodes('./params');
	var blocksLength = paramBlocks.length;
	for (var currentBlock = 0; currentBlock < blocksLength; currentBlock++) {
		var br = document.createElement('div');
		var params = paramBlocks[currentBlock].selectNodes('./param');
		var paramsLength = params.length;
		for (var par = 0; par < paramsLength; par++) {
			var curParam = params[par];
			var input = fillDiv(curParam);
			for (var x = 0; x < input.length; x++)
				br.appendChild(input[x]);
		}
		div.appendChild(br);
	}
	return div;
}

var divChoices = [];
function prepareDivChoice() {
	var __divChoices = getElementsByClassName(document, "choice");
	for (var i = 0; i < __divChoices.length; i++) {
		divChoices.push(getElementsByClassName(__divChoices[i], "option"));
	}
}

function divChoice() {
	//console.log('divChoice()');
	for (var i = 0; i < divChoices.length; i++) {
		var divOptions = divChoices[i];
		for (var n = 0; n < divOptions.length; n++) {
			(function (n) {
				var currentOption = divOptions[n];
				currentOption.onmouseover = function onmouseover(event) {
					addClass(currentOption, "choose2");
				};
				currentOption.onmouseleave = function onmouseleave(event) {
					delClass(currentOption, "choose2");
				};
			})(n);
			var checkedOptions = getElementsByClassName(divOptions[n], "ignore");
			for (var x = 0; x < checkedOptions.length; x++) {
				(function (x) {
					checkedOptions[x].onclick = function onclick(event) {
						var checkedParent = this.parentNode.parentNode.parentNode;
						var checkedChildren = getElementsByClassName(this.parentNode, "option");
						var localSiblings = getAllSiblings(this);
						var node;
						if (this.checked) {
							if (checkedParent.tagName === "DIV" && checkedParent.className.contains("option")) {
								addClass(checkedParent, "choose3");
								var ccheckBox = getElementsByClassName(checkedParent, "ignore")[0];
								if (!ccheckBox.checked) {
									ccheckBox.checked = "checked";
									ccheckBox.onclick();
								}
							}
							addClass(this.parentNode, "choose3");
							var siblings = getAllSiblings(this.parentNode);
							var checkBoxes = [];
							for (var xt = 0; xt < siblings.length; xt++) {
								node = siblings[xt];
								delClass(node, "choose3");
								checkBoxes = getElementsByClassName(node, "ignore");
								for (var zn = 0; zn < checkBoxes.length; zn++) {
									if (checkBoxes[zn].checked) {
										checkBoxes[zn].checked = "";
										checkBoxes[zn].onclick();
									}
								}
							}
							for (var zt = 0; zt < localSiblings.length; zt++) {
								node = localSiblings[zt];
								if (node.type === 'checkbox' && !node.checked) {
									node.checked = "checked";
									node.onclick();
								}
							}
						} else {
							for (var i = 0; i < checkedChildren.length; i++) {
								checkBoxes = getElementsByClassName(checkedChildren[i], "ignore");
								for (var n = 0; n < checkBoxes.length; n++) {
									if (checkBoxes[n].checked) {
										checkBoxes[n].checked = "";
										checkBoxes[n].onclick();
									}
								}
								delClass(checkedChildren[i], "choose3");
							}
							delClass(this.parentNode, "choose3");
							for (var ct = 0; ct < localSiblings.length; ct++) {
								node = localSiblings[ct];
								if (node.type === 'checkbox' && node.checked) {
									node.checked = "";
									node.onclick();
								}
							}
						}
					};
				})(x);
			}
		}
	}
}