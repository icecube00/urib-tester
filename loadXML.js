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

var scriptVersion = "2.0.03";

function getXMLObject(probablyXML, isFile) {
	//console.log('getXMLObject(probablyXML:'+probablyXML+', isFile: ' + isFile + ')');
	try {
	if (isFile) {
		result = new ActiveXObject("Microsoft.XMLDOM");
		result.async = false;
		result.load(probablyXML);
		return result;
	}
	else {
		try {
			var result;
			var tryAgain = true;
			if (probablyXML.responseXML) {
				if (probablyXML.responseXML.childNodes.length > 0) {
					if (probablyXML.responseXML.documentElement.nodeName === "parsererror") {
						result = {
							parseError : {
								errorCode : 1,
								reason : probablyXML.responseXML.documentElement.childNodes[0].nodeValue
							}
						};
					} else {
						result = probablyXML.responseXML;
					}
					tryAgain = false;
				}
			}
			if (tryAgain) {
				result = new ActiveXObject("Microsoft.XMLDOM");
				result.async = false;
				result.loadXML(probablyXML.responseText);
			}
		} catch (err) {
			//console.warn('getXMLObject: '+err.description);
			result = {
				parseError : {
					errorCode : 1
				}
			};
		}
		finally {
			return result;
		}
	}
	}
	catch (e) {
		//console.warn('getXMLObject: ' + e.description);		
	}
}

function loadXML() {
	//console.log('loadXML()');
	var newhttp = getXMLHttp();
	newhttp.open('GET', 'file:///C:/Users/Natali/Documents/GitHub/URIB-tester/erib_Protocol.xml', true);
	newhttp.send();
	result = newhttp.responseText;
	var docXML = getXMLObject(result);
	var errorXMLParser = "";
	try {
		if (docXML.parseError.errorCode !== 0)
			errorXMLParser = docXML.parseError.reason;
	} catch (err) {
		//console.warn('loadXML(): Error:: ' + err.description);
		try {
			if (docXML.documentElement.nodeName === "parsererror")
				errorXMLParser = docXML.documentElement.childNodes[0].nodeValue;
		} catch (e) {
			//console.warn('loadXML(): Error:: ' + e.description);
			errorXMLParser = "Fatal error. Could not parse XML.";
		}
	}
	if (errorXMLParser.isEmpty()) {
		/* */
		var newSettings='';
		var settings = docXML.documentElement.selectNodes('./settings');
		var settingsLength = settings.length;
		for (var current=0;current<settingsLength;current++){
			var currentSetting = settings[current];
			var divSetting = buildSettings(currentSetting);
			newSettings+=divSetting.outerHTML;
		}
		var globalSettings = document.getElementById('settings');
		globalSettings.innerHTML = newSettings;
		/* */
		var operations = docXML.documentElement.selectNodes('./operation');
		var operationsLength = operations.length;
		var newMenu=''
		for (var currentOp=0;currentOp<operationsLength;currentOp++){
			var currentOperation = operations[currentOp];
			var divMenu = buildMenu(currentOperation);
			newMenu+=divMenu.outerHTML;
		}
		var globalDiv = document.getElementById('operations');
		globalDiv.innerHTML = newMenu;
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
	}
}

function buildMenu(operation) {
	var op_name = operation.getAttribute('name');
	var op_id = operation.getAttribute('id');
	//console.log('buildMenu(operation [' + op_id + '::' + op_name + '])');
	var div = document.createElement('div');
	var attName = document.createAttribute('name');
	var txtNode = document.createTextNode(' ' + op_id + ' ' + op_name);
	var attId = document.createAttribute('id');

	var spanTxt = document.createElement('span');
	spanTxt.appendChild(txtNode);
	var txtClass = document.createAttribute('class');
	txtClass.value = 'description operations';
	spanTxt.setAttributeNode(txtClass);
    
	var input = document.createElement('input');
	var inpName = document.createAttribute('name');
	var inpClass = document.createAttribute('class');
	inpName.value = op_id
	inpClass.value='ignore';
	
	input.type = 'checkbox';
	input.setAttributeNode(inpName);
	input.setAttributeNode(inpClass);
	if (window.addEventListener) {
		input.addEventListener("click", toggleChildren, false);
	} else {
		input.attachEvent("onclick", toggleChildren);
	}
	
	
	
	var inpClick = document.createAttribute('onclick');
	inpClick.value = 'toggleChildren("' + op_id + '");'
	div.setAttributeNode(inpClick);
	
	attName.value = op_name;
	attId.value = op_id;
	div.setAttributeNode(attName);
	div.setAttributeNode(attId);
	div.appendChild(input);
	div.appendChild(spanTxt);
	var innerChildren = operation.childNodes;
	var childrenLength = innerChildren.length;
	for (var child=0;child<childrenLength;child++) {
		var inner = innerChildren.item(child);
		if (inner.baseName==='operation') {
			var innerDiv = buildMenu(inner);
			innerDiv.style.display='none';
			div.appendChild(innerDiv);
		}
		if (inner.baseName==='request') {
			var innerRequest = buildRequest(inner);
			innerRequest.style.display='none';
			div.appendChild(innerRequest);
		}
	}
	
	return div;
}

function buildRequest(request) {
	var formDiv = document.createElement('div');
	var req_name = request.getAttribute('name');
	var req_id = request.getAttribute('id');
	//console.log('buildRequest(request [' + req_id + '::' + req_name + '])');
	
	var needUDBO = (request.getAttribute('requireUDBO')==="true");
	var permissions = request.getAttribute('service');
	if (needUDBO) permissions+= " needUDBO"
	var form = document.createElement('form');
	
	var action = request.selectNodes('./action')[0];
	var params = action.selectNodes('./params')[0].childNodes;
	
	var attCharset = document.createAttribute('accept-charset');
	var attName = document.createAttribute('name');
	var attId = document.createAttribute('id');
	var attAction = document.createAttribute('action');

	var checkBox = document.createElement('input');
	var inpName = document.createAttribute('name');
	var inpClass = document.createAttribute('class');
	inpName.value = req_id
	inpClass.value='ignore';
	
	checkBox.type = 'checkbox';
	checkBox.setAttributeNode(inpName);
	checkBox.setAttributeNode(inpClass);
	
	attCharset.value = 'UTF-8';
	attName.value = req_name;
	attId.value = req_id;
	attAction.value = action.getAttribute('url');
	
	var paramsLength = params.length;
	for (var par=0;par<paramsLength;par++){
		var br = document.createElement('br');
		var curParam = params[par];
		var input = fillDiv(curParam, req_id);
		for (var x=0;x<input.length;x++) form.appendChild(input[x]);
		form.appendChild(br);
	}
	var submit = document.createElement('input');
	submit.type='button';

	var submitClick = document.createAttribute('onclick');
	submitClick.value = 'trySubmit("' + req_id + '");'
	submit.setAttributeNode(submitClick);

	var submitValue = document.createAttribute('value');
	submitValue.value = 'Выполнить запрос';
	submit.setAttributeNode(submitValue);

	var submitClass = document.createAttribute('class');
	submitClass.value = 'submit';
	submit.setAttributeNode(submitClass);

	var formClass = document.createAttribute('class');
	formClass.value='border description form';
	
	var txtNode = document.createTextNode(' ' + req_id + ' ' + req_name);

	var spanTxt = document.createElement('span');
	spanTxt.appendChild(txtNode);
	var txtClass = document.createAttribute('class');
	txtClass.value = 'description request ' + permissions;
	spanTxt.setAttributeNode(txtClass);
	
	form.setAttributeNode(attCharset);
	form.setAttributeNode(attName);
	form.setAttributeNode(attId);
	form.setAttributeNode(attAction);
	form.setAttributeNode(formClass)
	form.method = action.getAttribute('method');
	form.appendChild(submit);
	
	formDiv.appendChild(checkBox);
	formDiv.appendChild(spanTxt);
	form.style.display='none';
	formDiv.appendChild(form);	
	
	var inpClick = document.createAttribute('onclick');
	inpClick.value = 'toggleChildren("' + req_id + '", true);'
	formDiv.setAttributeNode(inpClick);

	return formDiv;
}

function createShow(param) {
	var options = param.selectNodes('./list/option');
	var optionsLength = options.length;
	var id='', name=[];
	for (var opt=0;opt<optionsLength;opt++){
		var value = options.item(opt).getAttribute('value') + '.next';
		var fill = (options.item(opt).getAttribute('fill')==='true');
		if (fill) id=value;
		name.push(value);
	}
	var showDiv = document.createElement('div');
	var classshow = document.createAttribute('class');
	var nameshow = document.createAttribute('name');
	var idshow = document.createAttribute('id');
	
	classshow.value = 'border showresult';
	nameshow.value = name.join(' ');
	idshow.value = id;
	//console.log('createShow(param [' + id + '::' + name + '])');
	
	showDiv.setAttributeNode(classshow);
	showDiv.setAttributeNode(nameshow);
	showDiv.setAttributeNode(idshow);
	return showDiv;
}

function createInput(param, type, req_id) {
	var required = (param.getAttribute('required')==='true');
	var classValue='';

	var input = document.createElement('input');
	var inpValue = document.createAttribute('value');
	
	var inpText = document.createTextNode(param.getAttribute('text'));
	var inpClass = document.createAttribute('class');
	
	var spanTxt = document.createElement('span');
	spanTxt.appendChild(inpText);
	if (req_id) {
		var inpName = document.createAttribute('name');		
		var txtClass = document.createAttribute('class');
		txtClass.value = 'description postdata';
		spanTxt.setAttributeNode(txtClass);
	} else {
		var inpName = document.createAttribute('id');
		var txtClass = document.createAttribute('class');
		txtClass.value = 'settingsElement';
		classValue = 'settingsElement'
		inpClass.value = classValue;
		spanTxt.setAttributeNode(txtClass);
	}
	
	input.type = 'text';
	
	inpValue.value = param.getAttribute('value');
	inpName.value = param.getAttribute('name');

	input.setAttributeNode(inpValue);
	input.setAttributeNode(inpName);

	if (type=='bool') {
		input.type = 'checkbox';
		inpClass.value=classValue + ' ignore readonly';
	}

	if (type=='read') {
		inpClass.value=classValue + ' readonly';
	}

	input.setAttributeNode(inpClass);
	//console.log('createInput(param [' +  param.getAttribute('name') + '::' + param.getAttribute('text') + '])');
	return [input, spanTxt];
}

function createList(param, req_id) {
	var required = (param.getAttribute('required')==='true');
	var newSelect = document.createElement('select');
	if (req_id) {
		var selectName = document.createAttribute('name');
	}
	else {
		var selectName = document.createAttribute('id');
		var selectClass = document.createAttribute('class');
		selectClass.value = 'settingsElement';
		newSelect.setAttributeNode(selectClass);
	}
	selectName.value = param.getAttribute('name');
	newSelect.setAttributeNode(selectName);
	newSelect.onselect = function onselect(event){
		//console.log(selectName.value + 'onselect');
	}
	var options = param.selectNodes('./list/option');
	var optionsLength = options.length;
	for (var opt=0;opt<optionsLength;opt++){
		var newOption = document.createElement('option');
		var text = options.item(opt).text;
		var value = options.item(opt).getAttribute('value');
		newOption.text = text + ' [' + value + ']';
		newOption.value = value;
		newSelect.add(newOption);
	}
	//console.log('createList(param [' +  param.getAttribute('name') + '])');
	return newSelect;
}

function createChoice(param, req_id) {
	var required = (param.getAttribute('required')==='true');
	var choiceDiv = document.createElement('div');
	var classChoice = document.createAttribute('class');
	classChoice.value='choice';
	choiceDiv.setAttributeNode(classChoice);
	
	var choices = param.selectNodes('./choice');
	var choicesLength = choices.length;
	for (var choice=0;choice<choicesLength;choice++){
		var optionDiv = document.createElement('div');
		var classOption = document.createAttribute('class');
		classOption.value='option';
		optionDiv.setAttributeNode(classOption);
		var params = choices.item(choice).childNodes;
		var paramsLength = params.length;
		for (var par=0;par<paramsLength;par++){
			var br = document.createElement('br');		
			var curParam = params[par];
			var input = fillDiv(curParam, req_id);
			for (var x=0;x<input.length;x++) optionDiv.appendChild(input[x]);
			optionDiv.appendChild(br);
		}
		choiceDiv.appendChild(optionDiv);
	}
	//console.log('createChoice(param, req_id [' +  req_id + '])');
	return choiceDiv;
}

function fillDiv(curParam, req_id){
	var type = curParam.getAttribute('type');
	var required = (curParam.getAttribute('required')==='true');
	var input = [];
	var spanTxt = document.createElement('span');
	var pushSpan=false;
	var pushInput=[];
	switch (type) {
		case 'choice':
			pushInput.push(createChoice(curParam, req_id));
		break;
		case 'list':
			pushInput.push(createList(curParam, req_id));
			var inpText = document.createTextNode(curParam.getAttribute('text'));
			spanTxt.appendChild(inpText);
			if (req_id) {
				var txtClass = document.createAttribute('class');
				txtClass.value = 'description postdata';
				spanTxt.setAttributeNode(txtClass);
			}
			pushInput.push(spanTxt);
		break;
		case 'show':
			pushInput.push(createShow(curParam));
		break;
		default:
			pushInput = createInput(curParam, type, req_id);
	}
	var notRequired = ['bool','show','choice'];
	if (!required && (notRequired.indexOf(type)===-1)) {
		//console.log('fillDiv(curParam [' + curParam.getAttribute('text') + ', req_id [' +  req_id + ']) :: OPTIONAL');
		var optionalCheck = document.createElement('input');
		optionalCheck.type = 'checkbox';
		
		var optClass = document.createAttribute('class');
		optClass.value = 'ignore readonly';
		optionalCheck.setAttributeNode(optClass);
		
		var optName = document.createAttribute('name');
		var attrName = '';
		if (req_id) {
			attrName = pushInput[0].getAttribute('name');
		} else {
			attrName = pushInput[0].getAttribute('id');
		}
		optName.value = attrName;
		optionalCheck.setAttributeNode(optName);
		
		var optValue = document.createAttribute('value');
		var attrValue = '';
		if (req_id) {
			attrValue = req_id + '.' + attrName + '.value';
		} else {
			attrValue = 'settings.' + attrName + '.value';
		}
		optValue.value = attrValue;
		optionalCheck.setAttributeNode(optValue);

		pushInput[0].setAttribute('id', attrValue);
		var optionalclass = pushInput[0].getAttribute('class');
		optionalclass+=" optionaldiv";
		pushInput[0].setAttribute('class', optionalclass);
		pushInput[0].removeAttribute('name');
		pushInput.unshift(optionalCheck);
		
		/*
		var divOptional = document.createElement('span');
		var divClass = document.createAttribute('class');
		divClass.value = 'optionaldiv';
		divOptional.setAttributeNode(divClass);
		for (var element=0;element<pushInput.length;element++) {
			divOptional.appendChild(pushInput[element]);
		}
		pushInput=[];
		pushInput.push(divOptional);
		*/
	} else {
		//console.log('fillDiv(curParam [' + curParam.getAttribute('text') + ', req_id [' +  req_id + '])');
	}
	return pushInput;
}

function toggleChildren(divId, isForm){
	//console.log('toggleChildren('+divId+', isForm:' + isForm +')');
	var currentDiv = document.getElementById(divId);
	var showIt = 'none';
	var divChildren = [];
	
	if (isForm) {
		var input = currentDiv.parentElement.childNodes[0];
		divChildren.push(currentDiv);
	}
	else {
		var input = currentDiv.childNodes[0];
		var divChildren = currentDiv.childNodes;
	}
	if (input.checked) {
		showIt = 'block';
	}
	var childCount = divChildren.length;
	var myTags = ['DIV','FORM'];
	for (var child=0;child<childCount;child++) {
		var tryIt = (divChildren[child].nodeType===1 && (myTags.indexOf(divChildren[child].tagName)!==-1));
		if (tryIt) 
			divChildren[child].style.display = showIt;
	}
	//console.log('toggleChildren('+ divId + ' ' + input.checked + ')');
	
}

function getXMLHttp(existingConn) {
	//console.log('getXMLHttp(existingConn:'+existingConn+')');
	var xmlHttp = existingConn;
	//For Mozila, Opera and WebKit Browsers
	if (!xmlHttp && typeof(XMLHttpRequest) !== 'undefined') {
		xmlHttp = new XMLHttpRequest();
	} else {
		try {
			xmlHttp = new ActiveXObject("MSXML2.ServerXMLHTTP.3.0");
		} catch (e) {
			//console.error('getXMLHttp: ' + e.description);
			try {
				xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (E) {
				//console.error('getXMLHttp: ' + E.description);
				xmlHttp = null;
			}
		}
	}
	try {
		//А вдруг получится.
		xmlHttp.setOption(2, 13056);
	} catch (e) {
		//console.warn('getXMLHttp: ' + e.description);
		//Ну, значит не получилось.
	}
	//console.log('getXMLHttp: xmlHttp');
	return xmlHttp;
}

function buildSettings(setting) {
	var div = document.createElement('div');
	
	var divClass = document.createAttribute('class');
	divClass.value='settings';
	div.setAttributeNode(divClass);
	
	var paramBlocks = setting.selectNodes('./params');
	var blocksLength = paramBlocks.length;
	for (var currentBlock=0;currentBlock<blocksLength;currentBlock++) {
		var br = document.createElement('div');
		var params = paramBlocks[currentBlock].selectNodes('./param');
		var paramsLength = params.length;
		for (var par=0;par<paramsLength;par++){
			var curParam=params[par];
			var input = fillDiv(curParam);
			for (var x=0;x<input.length;x++) br.appendChild(input[x]);
		}		
		div.appendChild(br);
	}
	return div;
}

var divChoices = [];
function prepareDivChoce() {
		divChoices = getElementsByClassName(document, "choice");
}

function divChoice() {
	//console.log('divChoice()');
	for (var i = 0; i < divChoices.length; i++) {
		var currentChoice = divChoices[i];
		var divOptions = getElementsByClassName(currentChoice, "option");
		for (var n = 0; n < divOptions.length; n++) {
			(function (n) {
				var currentOption = divOptions[n];
				currentOption.addEventListener('mouseover', function(event) {
					addClass(currentOption, "choose1");
				},false);
				currentOption.addEventListener('mouseleave', function(event) {
					delClass(currentOption, "choose1");
				},true);
			})(n);

			var checkedOptions = getElementsByClassName(divOptions[n], "ignore");
			for (var x = 0; x < checkedOptions.length; x++) {
				(function (x) {
					checkedOptions[x].onclick = function onclick(event) {
						var checkedParent = this.parentNode.parentNode.parentNode;
						var checkedChildren = getElementsByClassName(this.parentNode, "option");
						var localSiblings = getAllSiblings(this);
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
							for (var xt = 0; xt < siblings.length; xt++) {
								var node = siblings[xt];
								delClass(node, "choose3");
								var checkBoxes = getElementsByClassName(node, "ignore");
								for (var zn = 0; zn < checkBoxes.length; zn++) {
									if (checkBoxes[zn].checked) {
										checkBoxes[zn].checked = "";
										checkBoxes[zn].onclick();
									}
								}
							}
							for (var zt = 0; zt < localSiblings.length; zt++) {
								var node = localSiblings[zt];
								if (node.type === 'checkbox' && !node.checked) {
									node.checked = "checked";
									node.onclick();
								}
							}
						} else {
							for (var i = 0; i < checkedChildren.length; i++) {
								var checkBoxes = getElementsByClassName(checkedChildren[i], "ignore");
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
								var node = localSiblings[ct];
								if (node.type === 'checkbox' && node.checked) {
									node.checked = "";
									node.onclick();
								}
							}
						}
					}
				})(x);
			}
		}
	}
}

function addClass(element, class2Add) {
	//console.log('addClass(element:'+element+', class2Add:'+class2Add+')');
	var currentClassName = element.className;
	if ((currentClassName !== null) && currentClassName.indexOf(class2Add) === -1) {
		if ((currentClassName === "")) {
			element.className = class2Add;
		} else {
			element.className += " " + class2Add;
		}
	}
}

function delClass(element, class2Del) {
	//console.log('delClass(element:'+element+', class2Del:'+class2Del+')');
	var classValues = element.className.split(" ");
	var indexOfClass = classValues.indexOf(trim(class2Del));
	if (indexOfClass !== -1) {
		classValues.splice(indexOfClass, 1);
	}
	element.className = trim(classValues.join(" "));
}

function getElementsByClassName(htmlDocument, className) {
	//console.log('getElementsByClassName(htmlDocument:'+htmlDocument+', className:'+className+')');
	var result = [];
	var tables = htmlDocument.getElementsByTagName("*");
	for (var i = 0; i < tables.length; i++) {
		if (tables[i].className.contains(className))
			result.push(tables[i]);
	}
	return result;
}

