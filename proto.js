// ------------------------------     Prototypes     ------------------------------
try {// XMLDocument prototypes
	
	if (XMLDocument) {
		if (!XMLDocument.prototype.loadXML) {
			XMLDocument.prototype.loadXML = function (xmlString) {
				if (this === undefined || this === null)
					throw new TypeError('"XMLDocument.prototype.loadXML" is NULL or not defined');
				var childNodes = getChildren(this);
				for (var i = childNodes.length - 1; i >= 0; i--)
					this.removeChild(childNodes[i]);
				var dp = new DOMParser();
				var newDOM = dp.parseFromString(xmlString, "text/xml");
				var newElt = this.importNode(newDOM.documentElement, true);
				this.appendChild(newElt);
			};
		}
	}

	// check for XPath implementation
	if (document.implementation.hasFeature("XPath", "3.0")) {
		// prototying the XMLDocument selectNodes
		XMLDocument.prototype.selectNodes = function (cXPathString, xNode) {
			if (!xNode) {
				xNode = this;
			}
			var oNSResolver = this.createNSResolver(this.documentElement)
				var aItems = this.evaluate(cXPathString, xNode, oNSResolver,
					XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
				var aResult = [];
			for (var i = 0; i < aItems.snapshotLength; i++) {
				aResult[i] = aItems.snapshotItem(i);
			}
			return aResult;
		}

		// prototying the XMLDocument selectSingleNode
		XMLDocument.prototype.selectSingleNode = function (cXPathString, xNode) {
			if (!xNode) {
				xNode = this;
			}
			var xItems = this.selectNodes(cXPathString, xNode);
			if (xItems.length > 0) {
				return xItems[0];
			} else {
				return null;
			}
		}
	}
} catch (e) {}

try {// Array prototypes
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
} catch (e) {}

try {// String prototypes
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
} catch (e) {}

try {// Event prototypes
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
} catch (e) {}

try {// Element prototypes
	function getElements(arrayOfElements, tag, firstOccurence) {
		var result = [];
		var arrLength = arrayOfElements.length;
		if (firstOccurence && arrLength > 1)
			arrLength = 1;
		for (var i = 0; i < arrLength; i++) {
			var foundElements = arrayOfElements[i].getElementsByTagName(tag);
			var foundElementslength = foundElements.length;
			if (firstOccurence && foundElementslength > 1)
				foundElementslength = 1;
			for (var z = 0; z < foundElementslength; z++) {
				result.push(foundElements[z]);
			}
		}
		return result;
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
	if (!Element.prototype.getAttribute) {
		Element.prototype.getAttribute = function (attrName) {
			if (this === undefined || this === null)
				throw new TypeError('"Element.prototype.getAttribute" is NULL or not defined');
			var attributes = this.attributes;
			var attributesCount = attributes.length;
			var result = attributes.getNamedItem(attrName);
			return result;
		};
	}
	if (!Element.prototype.namedItem) {
		Element.prototype.namedItem = function (itemName) {
			if (this === undefined || this === null)
				throw new TypeError('"Element.prototype.namedItem" is NULL or not defined');
			var children = getChildren(this);
			var childrenCount = children.length;
			var result='';
			for (var i=0;i<childrenCount;i++){
				if (children[i].name === itemName) result=children[i];
			}
			return result;
		};
	}
	if (!Element.prototype.selectNodes) {
		// prototying the Element selectNodes
		var selectNodes = function (cXPathString) {
			if (this === undefined || this === null)
				throw new TypeError('"Element.prototype.selectNodes" is NULL or not defined');
			if (this.ownerDocument.selectNodes) {
				return this.ownerDocument.selectNodes(cXPathString, this);
			} else {
				var result = [];
				var tags = cXPathString.split('/');
				var curTag = this.getElementsByTagName(tags[1]);
				if (tags.length > 2) {
					for (var currentTag = 2; currentTag < tags.length; currentTag++) {
						curTag = getElements(curTag, tags[currentTag]);
					}
				}
				switch (tags[0]) {
				case '..':
					result = curTag;
					break;
				case '.':
					var curTaglength = curTag.length;
					for (var x = 0; x < curTaglength; x++) {
						if (curTag[x].parentNode === this) {
							result.push(curTag[x]);
						}
					};
					break;
				}
				return result;
				//throw new TypeError('For XML Elements Only');
			}
		};

		Element.prototype.selectNodes = selectNodes;
	}
	if (!Element.prototype.selectSingleNode) {
		// prototying the Element selectSingleNode
		var selectSingleNode = function (cXPathString) {
			if (this === undefined || this === null)
				throw new TypeError('"Element.prototype.selectSingleNode" is NULL or not defined');
			if (this.ownerDocument.selectSingleNode) {
				return this.ownerDocument.selectSingleNode(cXPathString, this);
			} else {
				var result = [];
				var tags = cXPathString.split('/');
				var curTag = this.getElementsByTagName(tags[1]);
				if (tags.length > 2) {
					for (var currentTag = 2; currentTag < tags.length; currentTag++) {
						curTag = getElements(curTag, tags[currentTag], true);
					}
				}
				switch (tags[0]) {
				case '..':
					result = curTag;
					break;
				case '.':
					var curTaglength = curTag.length;
					for (var x = 0; x < curTaglength; x++) {
						if (curTag[x].parentNode === this) {
							result.push(curTag[x]);
						}
					};
					break;
				}
				return result;

			}
		};
		Element.prototype.selectSingleNode = selectSingleNode;
	}
} catch (e) {}

// ------------------------------     UTILS     ------------------------------
function getXMLObject(probablyXML, isText) {
	var result = '';
	//console.log('getXMLObject(probablyXML:' + probablyXML + ', isText: ' + isText + ')');
	try {
		if (isText) {
			try {
				result = new XMLDocument();
				result.load(probablyXML);
			} catch (e) {
				result = new ActiveXObject("Microsoft.XMLDOM");
				result.async = false;
				result.loadXML(probablyXML);
			}
			return result;
		} else {
			try {
				var result;
				var tryAgain = true;

				if (probablyXML.responseXML && probablyXML.responseXML.documentElement) {
					var children = getChildren(probablyXML.responseXML);
					if (children.length > 0) {
						if (probablyXML.responseXML.documentElement.nodeName === "parsererror") {
							result = {
								parseError : {
									errorCode : 1,
									reason : getChildren(probablyXML.responseXML.documentElement)[0].nodeValue
								}
							};
						} else {
							result = probablyXML.responseXML;
						}
						tryAgain = false;
					}
				}

				if (tryAgain) {
					result = getXMLObject(probablyXML.responseText, true);
				}
			} catch (err) {
				//console.warn('getXMLObject: ' + err.description);
				result = {
					parseError : {
						errorCode : 1,
						reason : err.description
					}
				};
			}
			finally {
				return result;
			}
		}
	} catch (e) {
		//console.warn('getXMLObject: ' + e.description);
	}
}

function getXMLHttp(existingConn) {
	//console.log('getXMLHttp(existingConn:' + existingConn + ')');
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

function addClass(element, class2Add) {
	//console.log('addClass(element:' + element + ', class2Add:' + class2Add + ')');
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
	//console.log('delClass(element:' + element + ', class2Del:' + class2Del + ')');
	var classValues = element.className.split(" ");
	var indexOfClass = classValues.indexOf(trim(class2Del));
	if (indexOfClass !== -1) {
		classValues.splice(indexOfClass, 1);
	}
	element.className = trim(classValues.join(" "));
}

function getElementsByClassName(htmlDocument, className) {
	//console.log('getElementsByClassName(htmlDocument:' + htmlDocument + ', className:' + className + ')');
	var result = [];
	if (htmlDocument.getElementsByClassName)
		return htmlDocument.getElementsByClassName(className);

	var tables = htmlDocument.getElementsByTagName("*");
	for (var i = 0; i < tables.length; i++) {
		var classArr = tables[i].className.split(' ');
		if (classArr.indexOf(className) !== -1)
			result.push(tables[i]);
	}
	return result;
}

function isCheckedBox(checkBoxId) {
	//console.log('isCheckedBox(checkBoxId:' + checkBoxId + ')');
	var result = false;
	try {
		result = document.getElementById(checkBoxId).checked;
	} catch (e) {
		//console.error('isCheckedBox(): ' + e.description);
		//Ой, что-то не получилось
	}
	//console.log('isCheckedBox(' + checkBoxId + '): ' + result);
	return result;
}

function getAllSiblings(nodeThatFired) {
	//console.log('getAllSiblings(nodeThatFired:' + nodeThatFired + ')');
	var result = [];
	var node = getChildren(nodeThatFired.parentNode)[0];
	while (node) {
		if (node.nodeType === 1 && node !== nodeThatFired) {
			result.push(node);
		}
		node = node.nextElementSibling || node.nextSibling;
	}
	return result;
}

function isNumeric(sValue) {
	//console.log('isNumeric(sValue:' + sValue + ')');
	var result = false;
	try {
		var z = parseFloat(sValue);
		result = (z * 0 === 0);
	} catch (e) {
		//console.error('isNumeric(): ' + e.description);
	}
	//console.log('isNumeric(' + sValue + '): ' + result);
	return result;
}

function getParam(paramMap, paramName, isMulty) {
	//console.log('getParam(paramMap:' + paramMap + ', paramName:' + paramName + ', isMulty:' + isMulty + ')');
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
		//console.log('getParam(paramMap,' + paramName + ', isMulty: ' + isMulty + '): ' + result);
		return result;
	}
}

function xmlFormatter(xml) {
	//console.log('xmlFormatter(xml:' + xml + ')');
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

function Timer(ms) {
	//console.log('Timer(ms:' + ms + ')');
	var tresult;
	var d = new Date();
	var milliseconds = d.getTime();
	var time = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2) + ',' + ('00' + d.getMilliseconds()).slice(-3);
	ms = !ms ? tresult = milliseconds : tresult = time;
	//console.log('Timer: ' + tresult);
	return tresult;
}

function LenB(str) {
	//console.log('LenB(str:' + str + ')');
	var m = encodeURIComponent(str).match(/%[89ABab]/g);
	return str.length + (m ? m.length : 0);
}

function setFormData(arrData, typeData) {
	//console.log('setFormData(arrData:' + arrData + ', typeData:' + typeData + ')');
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
	//console.log('trim(str:' + str + ', charlist:' + charlist + ')');
	str = !str ? '' : str;
	charlist = !charlist ? ' \xA0' : charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\$1');
	var re = new RegExp('^[' + charlist + ']+|[' + charlist + ']+$', 'g');
	return str.replace(re, '');
}

function convert2win1251(string) {
	//console.log('convert2win1251(string:' + string + ')');
	var russian = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я', 'а', 'б', 'в', 'г', 'д', 'е', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я'];
	var win1251 = ['%c0', '%c1', '%c2', '%c3', '%c4', '%c5', '%c6', '%c7', '%c8', '%c9', '%ca', '%cb', '%cc', '%cd', '%ce', '%cf', '%d0', '%d1', '%d2', '%d3', '%d4', '%d5', '%d6', '%d7', '%d8', '%d9', '%da', '%db', '%dc', '%dd', '%de', '%df', '%e0', '%e1', '%e2', '%e3', '%e4', '%e5', '%e6', '%e7', '%e8', '%e9', '%ea', '%eb', '%ec', '%ed', '%ee', '%ef', '%f0', '%f1', '%f2', '%f3', '%f4', '%f5', '%f6', '%f7', '%f8', '%f9', '%fa', '%fb', '%fc', '%fd', '%fe', '%ff'];
	for (var i = 0; i < russian.length; i++) {
		string = string.split(russian[i]).join(win1251[i]);
	}
	return string;
}

function replaceHTML(string2clear) {
	//console.log('replaceHTML(string2clear:' + string2clear + ')');
	var nonxmlEntities = ['&', '<', '>', '"', "'"];
	var xmlEntities = ['&amp;', '&lt;', '&gt;', '&quot;', "&apos;"];
	for (var i = 0; i < nonxmlEntities.length; i++) {
		string2clear = string2clear.split(nonxmlEntities[i]).join(xmlEntities[i]);
	}
	return string2clear;
}

function HTMLreplace(string2clear) {
	//console.log('HTMLreplace(string2clear:' + string2clear + ')');
	var nonxmlEntities = ['&', '<', '>', '"', "'"];
	var xmlEntities = ['&amp;', '&lt;', '&gt;', '&quot;', "&apos;"];
	for (var i = 0; i < nonxmlEntities.length; i++) {
		string2clear = string2clear.split(xmlEntities[i]).join(nonxmlEntities[i]);
	}
	return string2clear;
}

function getXmlValue(srcXML, tagName, isBoolean) {
	//console.log('getXmlValue(srcXML, tagName:' + tagName + ', isBoolean:' + isBoolean + ')');
	var result = '';
	try {
		var elementsList = srcXML.getElementsByTagName(tagName);
		if (!isBoolean) {
			var tempResult='';
			if (elementsList[0].text)
				tempResult = elementsList[0].text;
			if (elementsList[0].textContent)
				tempResult = elementsList[0].textContent;
			//Убираем переносы строк
			tempResult = trim(tempResult.split('\r').join(' ').split('\n').join(' '));
			//Схлопываем двойные пробелы в один, но не больше 10 попыток.
			var hanged=0;
			while(tempResult.split('  ').length>1 && hanged<10) {
				hanged++;
				tempResult = tempResult.split('  ').join(' ');
			}
			result = tempResult;
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

function dictionary() {
	this.key = [];
	this.value = [];

	this.toString = function () {
		var result = '';
		var keysLength = this.key.length;
		for (var i = 0; i < keysLength; i++) {
			result += this.key[i] + ': ' + this.value[i] + '\r\n';
		}
		return result;
	}

	this.add = function (strKey, strValue, force) {
		var keysLength = this.key.length;
		for (var i = 0; i < keysLength; i++) {
			if (this.key[i] === strKey)
				if (force) {
					this.value[i] = strValue;
					return true;
				} else {
					return false;
				}
		}
		this.key.push(strKey);
		this.value.push(strValue);
		return true;
	};

	this.item = function (strkey) {
		var keysLength = this.key.length;
		for (var i = 0; i < keysLength; i++) {
			if (this.key[i] === strkey) {
				return this.value[i];
			}
		}
		return '';
	};

	this.deleteitem = function (strKey) {
		var isDelete = false;
		var keysLength = this.key.length;
		var tempKey = [],
		tempVal = [];
		for (var i = 0; i < keysLength; i++) {
			if (this.key[i] !== strKey) {
				tempKey.push(this.key[i]);
				tempVal.push(this.value[i]);
			} else {
				isDelete = true;
			}
		}
		this.key = tempKey;
		this.value = tempVal;
		return isDelete;
	};

	this.sort = function () {
		this.key.sort();
	};
}

function getChildren(nodeElement) {
	if (nodeElement.children)
		return nodeElement.children;
	var result = [];
	var childNodes = nodeElement.childNodes;
	var childNodeslength = childNodes.length;
	for (var node = 0; node < childNodeslength; node++) {
		if (childNodes[node].nodeType === 1)
			result.push(childNodes[node]);
	}
	return result;
}