function saveTextAs(textContent, fileName, charset) {
    curDir = (unescape(window.location.pathname).slice(1)).replace(/\//g,"\\");
    fileName = fileName || 'download.txt';
    writeFileContents(textContent, fileName, charset, curDir);
}

function writeFileContents_ADO(textContent, file2read, fileCharSet) {
    var fso = new ActiveXObject("ADODB.Stream");
    var result='';
    fso.CharSet = fileCharSet;
    fso.Open();
    try {
        fso.WriteText(textContent);
    }
    catch(e){
        result = e.description;
    }
    finally {
       fso.Flush();
    }
    try {
        //Create or overwrite file if exist
        result = fso.SaveToFile(file2read,2)
    }
    catch(er) {
        result = e.description;
    }
    finally {
        fso.Close()
        return result;
    }
}

function writeFileContents(textContent, file2read, fileCharSet, currentDir) {
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	try {
		if (file2read.indexOf("\\")!==0) file2read="\\"+file2read;
		var curDir = fso.GetParentFolderName(currentDir)+"\\!ForEmulator";
		var filePath = fso.BuildPath(curDir,file2read);
		var parentFolder=fso.GetParentFolderName(filePath);
		while (!createPath(parentFolder)) {
			//тупим, пока папка не создастся
		}
		if (!fso.FolderExists(parentFolder)) fso.CreateFolder(parentFolder);
		var overwrite = true;
		if (fso.FileExists(filePath)) overwrite = confirm("Файл " + file2read + " существует и будет перезаписан");
		if (overwrite) {
			var logfile  = fso.OpenTextFile(filePath, 2, true);
			logfile.Write(textContent);
			logfile.Close();
			alert("Файл " + filePath + " успешно сохранен.")
		}
	}
	catch(err) {
		alert(err.description);
	}
}

function createPath(newPath) {
	var fso = new ActiveXObject("Scripting.FileSystemObject");	
	var result=true;
	try{
		if (!fso.FolderExists(newPath))
			fso.CreateFolder(newPath);
	}
	catch (err) {
		result=false;
		var nextParentFolder=fso.GetParentFolderName(newPath);
		createPath(nextParentFolder);		
	}
	finally{
		return result;
	}
}
