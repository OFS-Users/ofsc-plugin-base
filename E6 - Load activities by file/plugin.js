"use strict";

var proxyOrigin;
var proxyDestination;
// TODO : If this doesn't work, change to var proxy = new OFSCProxy();

var internalData = {};
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function openMessage(data) {
  <!--PLACEHOLDER FOR CUSTOM CODE-- >

  //var element = document.getElementById("received-data");
  //element.innerHTML = "<pre>" + JSON.stringify(data, undefined, 4) + "</pre>";
  console.log('info', "Open method ");

  internalData.baseURL = data.securedData.ofscRestEndpoint;

  internalData.instanceDestination = data.securedData.ofscInstanceDestination;
  internalData.clientIdDestination = data.securedData.ofscClientIdDestination;
  internalData.clientSecretDestination = data.securedData.ofscClientSecretDestination;
  var d = new Date();
  var dAfter = d.addDays(1);
  var afterYears = dAfter.getFullYear();
  var monthsNumber = dAfter.getMonth() + 1;
  var afterMonth = (monthsNumber<10?'0':'') + monthsNumber;
  var afterDay = (dAfter.getDate()<10?'0':'') + dAfter.getDate();
  var dAfterTxt = afterYears + "-" + afterMonth + "-" + afterDay;
  console.log('info', "Date should be updated with " + dAfterTxt);


  var clousureData = {
    //"DISPATCHER_COMMENTS": "CHANGED",
	//	"pid" : data.resource.pid
  };

  var showHideButton = document.getElementById("showHideActivities");
  //showHideButton.display.style = "block";
  showHideButton.addEventListener("click", function() {
    showHideActivities();
  });
  document.getElementById("copyActivities").addEventListener("click", function() {
    var element = document.getElementById("action-debug");
    element.innerHTML = "Copying activities ...";
    loadActivities();
  });
  document.getElementById("close").addEventListener("click", function() {
		closePlugin(clousureData);
  });




  <!--END OF PLACEHOLDER-- >
}
function showHideActivities(){
 var element = document.getElementById("activity_list");
  if (element.style.display === "none") {
    element.style.display = "block";
  } else {
    element.style.display = "none";
  }
}





async function loadActivities() {
  var activities = internalData.activityFile;
  var clientIdDestination = internalData.clientIdDestination;
  var clientSecretDestination = internalData.clientSecretDestination;

	//console.log("Copying activities with message " + JSON.stringify(activities, undefined, 4));
  var element = document.getElementById("action-debug");
  element.innerHTML = "<pre>" + "Loading activities   ... </pre>";
  proxyDestination = new OFSCProxy();
  proxyDestination.createInstance(internalData.instanceDestination, clientIdDestination, clientSecretDestination, internalData.baseURL);
  const updateResponse = await proxyDestination.bulkUpdateActivities(activities);
  var element = document.getElementById("action-debug");
  console.log('info', JSON.stringify(updateResponse, undefined, 4));
  if ("results" in updateResponse ){
      if ( updateResponse.results.length > 0) {
        var element = document.getElementById("action-debug");
        element.innerHTML = "<pre>" + updateResponse.results.length + " Activities Moved</pre>";
      }
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


function closePlugin(clousureData) {

  var messageData = {
    "apiVersion": 1,
    "method": "close"//,
    //"resource": clousureData
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


function getAsText(fileToRead) {
     console.log("Reading the file");
      var reader = new FileReader();
      // Read file into memory as UTF-8
      reader.readAsText(fileToRead);
      // Handle errors load
      reader.onload = loadHandler;
      reader.onerror = errorHandler;
}

function loadHandler(event) {
     console.log("Loading the File");
      var csv = event.target.result;
      processData(csv);
}
function handleFiles(files) {
      // Check for the various File API support.
      if (window.FileReader) {
          // FileReader are supported.
          getAsText(files[0]);
      } else {
          alert('FileReader are not supported in this browser.');
      }
}

function processData(csv) {
     console.log("Processing data");
      var activities = [];
      var activitiesFields = [];
        var allTextLines = csv.split(/\r\n|\n/);
        var lines = [];
        for (var i=0; i<allTextLines.length; i++) {
          if ( i==0 ){
            activitiesFields = allTextLines[i].split(',');
          }else{
            var singleActivity = {};
            var data = allTextLines[i].split(',');
            for (var j=0; j<data.length; j++) {
              if (data[j] && data[j].length > 0){
                  singleActivity[activitiesFields[j]]=data[j];
                  }
            }
            activities.push(singleActivity);
          }
        }
      //var activitiesJson = {};
      //activitiesJson["activities"]=activities;
      //internalData.activityFile= activitiesJson;
      internalData.activityFile= activities;
      var element = document.getElementById("activity_list");
      element.innerHTML = JSON.stringify(internalData.activityFile, undefined, 4);
  }

  function errorHandler(evt) {
      if(evt.target.error.name == "NotReadableError") {
          alert("Canno't read file !");
      }
  }
