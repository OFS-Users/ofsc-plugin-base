"use strict";

var activity;
var proxy;


function openMessage(data) {
  <!--PLACEHOLDER FOR CUSTOM CODE-- >


  // Credential data from the Plugin configuration
  var instance = data.securedData.ofscInstance;
  var clientId = data.securedData.ofscRestClientId;
  var clientSecret = data.securedData.ofscRestClientSecret;
  var baseURL = data.securedData.ofscRestEndpoint;
  proxy = new OFSCProxy();
  proxy.createInstance(instance, clientId, clientSecret, baseURL);

  console.log()
  var activityData = {
    //"DISPATCHER_COMMENTS": "CHANGED",
		//"aid" : data.activity.aid
  };

  document.getElementById("submit").addEventListener("click", function() {
		closePlugin(activityData);
  });
  document.getElementById("updateResources").addEventListener("click", function() {
    updateResources();
  });

  <!--END OF PLACEHOLDER-- >
}



async function updateResources() {
  const selectedFile = document.getElementById('csvFileInput').files[0];
  loadResources(selectedFile);
}

function handleFiles(files) {
  // Check for the various File API support.
  if (window.FileReader) {
    var element = document.getElementById("action-debug");
    element.innerHTML = "<pre> Fichero cargado y listo para cargar </pre>";
    //getAsText(files[0]);
  } else {
    alert('FileReader are not supported in this browser.');
  }
}

async function loadResources(fileToRead) {
  var reader = new FileReader();
  // Read file into memory as UTF-8
  reader.readAsText(fileToRead);
  // Handle errors load
  reader.onload = loadHandler;
  reader.onerror = errorHandler;
}

function loadHandler(event) {
  var csv = event.target.result;
  processData(csv);
}

async function processData(csv) {
  var allTextLines = csv.split(/\r\n|\n/);
  var lines = [];
  for (var i=0; i<allTextLines.length; i++) {
      var data = allTextLines[i].split(';');
      var fields = {
        "recordType": data[1],
        "startDate": data[2],
        "scheduleLabel": data[3]
      }
      const updateResponse = await proxy.updateResourceWorkschedule(data[0],fields);
      console.log(updateResponse);

  }
  var element = document.getElementById("action-debug");
  element.innerHTML = "<pre>" + allTextLines.length + " Recursos actualizados</pre>";

}

function errorHandler(evt) {
  if(evt.target.error.name == "NotReadableError") {
    alert("Canno't read file !");
  }
}

function initMessage(data) {

  var messsageData = {
    apiVersion: 1,
    method: 'initEnd'
  };

  sendWebMessage(messsageData);
}

function initPlugin() {

  window.addEventListener("message", getWebMessage, false);

  var messsageData = {
    apiVersion: 1,
    method: 'ready'
  };

  sendWebMessage(messsageData);
}

function _isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function getWebMessage(event) {

  if (typeof event.data === 'undefined') {
    return false;
  }

  if (!_isJson(event.data)) {
    return false;
  }

  var data = JSON.parse(event.data);

  if (!data.method) {
    return false;
  }

  switch (data.method) {
    case 'open':
      openMessage(data);
      break;
    case 'open':
      initMessage(data);
      break;
    case 'error':
			console.log("Received error message " + JSON.stringify(data, undefined, 4));
      break;
      // other methods may go here
  }
}

function getOriginURL(url) {
  if (url != '') {
    if (url.indexOf("://") > -1) {
      return 'https://' + url.split('/')[2];
    } else {
      return 'https://' + url.split('/')[0];
    }
  }
  return '';
}


function closePlugin(activityData) {

  var messageData = {
    "apiVersion": 1,
    "method": "close",
    "activity": activityData
  };
	console.log("Sending close message" + JSON.stringify(messageData, undefined, 4));
  sendWebMessage(messageData);
}

function sendWebMessage(data) {
  var originUrl = document.referrer || (document.location.ancestorOrigins && document.location.ancestorOrigins[0]) || '';

  if (originUrl) {
    parent.postMessage(data, getOriginURL(originUrl));
  }
}
