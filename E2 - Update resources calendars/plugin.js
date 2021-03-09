"use strict";

var activity;
var proxy;


function openMessage(data) {
  //PLACEHOLDER FOR CUSTOM CODE-- >


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

  //END OF PLACEHOLDER-- >
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
  var element = document.getElementById("action-debug");
  for (var i=1; i<allTextLines.length; i++) {
      var data = allTextLines[i].split(';');
      var fields = {};
      fields.recordType = data[1];
      //The date when this schedule takes effect. The format is 'YYYY-MM-DD'.
      fields.startDate = data[2];
      
      //[OPTIONAL]The date when this schedule ends. The date is in 'YYYY-MM-DD' format.
      if(data[3] != ""){
        fields.endDate = data[3];
      }
      //The label of the work schedule in Oracle Field Service. This property is only available if the record type is schedule.
      if(data[1]=="schedule"){
        fields.scheduleLabel = data[4];
      }
      ////[OPTIONAL]The description of the schedule in Oracle Field Service.
      if(data[5] != ""){
        fields.comments = data[5];
      }
      //Is Working Shift
      if(data[6] != ""){
        fields.isWorking = Boolean(data[6]);
      }
      //[OPTIONAL]Create Recurrence object
      if (data[7] == "YES"){
        var objRecurrence = {};
        if (data[8]!= ""){
          /**The start day (in 'YYYY-MM-DD' format) of the schedule period applicable for each year, when the schedule is in effect. 
          It is used only if the recurrence type is yearly*/
          objRecurrence.dayFrom = data[8];
        }
        if (data[9]!= ""){
          /**The end day (in 'YYYY-MM-DD' format) of the schedule period applicable for each year, when the schedule is in effect. 
          It is used only if the recurrence type is yearly.*/
          objRecurrence.dayTo = data[9];
        }
        /**Title: Recur Every
          Minimum Value: 1
          Maximum Value: 255
          The time between each recurrence of the work schedule. 
          Depending on the value selected for 'recurrence', the value of the parameter indicates the time between recurrence in days or weeks. 
          For example, if '4' is the value of this parameter, and the 'recurrence' is 'daily', it indicates that the time between each recurrence is four days. */
        objRecurrence.recurEvery = parseInt(data[10],10);
        
        /**Title: Recurrence Type
        Allowed Values: [ "daily", "weekly", "yearly", "everyday" ]
        The type of the recurrence. This property along with the 'recurEvery' property defines the time between each recurrence. 
        For example, if the value of this property is 'daily' and the value of the property 'recurEvery' is '4', then the time between each recurrence is four days. */
        objRecurrence.recurrenceType = data[11];
        /**Title: Recurrence Weekdays
            The weekdays on which the work shift recurs. */
        if (data[12] != "")
        {
          objRecurrence.weekdays = data[12].split('&')
        }
        fields.recurrence = objRecurrence;
      }
      /**Title: Non-working Reason
      The reason for the non-working day (for example, holiday, vacation). These reasons are preconfigured in the Oracle Field Service UI. */
      if (data[13] != ""){
        fields.nonWorkingReason = data[13];
      }
      /**Title: Work Shift Label
      The label of the work shift in Oracle Field Service. 
      This property is only available if the value of recordType is either shift or extra_shift. */
      if ((data[1]=="shift" || data[1]=="extra_shift") && data[14] != ""){
        fields.shiftLabel = data[14];
      }
      /**Title: Shift Type
      Allowed Values: [ "regular", "on-call" ]
      The type of the work shift. */
      if ((data[1]=="shift" || data[1]=="extra_shift") && data[15] != ""){
        fields.shiftType = data[15];
      } 
      /**Title: Work Time End
      The end time of the working day when this schedule is in effect. 
      The format is 'HH:MM'. This property is not available if the value of the isWorking parameter is false. */
      if (data[16] != ""){
        fields.workTimeEnd = data[16];
      }
      /**Title: Work Time Start
      The start time of the working day when this schedule is in effect. The format is 'HH:MM'. 
      This property is not available if the value of the isWorking parameter is false. */
      if (data[17] != ""){
        fields.workTimeStart = data[17];
      }

      var myJSON2 = JSON.stringify(fields, undefined,4);
      console.log("Fields: " + myJSON2);
      const updateResponse = await proxy.updateResourceWorkschedule(data[0],fields);
      console.log(updateResponse);
      var myJSON = JSON.stringify(updateResponse, undefined,4);
      element.innerHTML = element.innerHTML + "<textarea rows='10' cols='50'>" + myJSON + "</textarea>";
  }
  
  element.innerHTML = element.innerHTML + "<pre>" + allTextLines.length-1 + " Recursos actualizados</pre>";

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
