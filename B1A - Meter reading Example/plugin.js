"use strict";

var activity;

function openMessage(data) {
  // PLACEHOLDER FOR CUSTOM CODE-- >
    var tabledata;
    // Read property data
    if ( data.activity.hasOwnProperty('COE_METER_LIST') ) {
        tabledata = JSON.parse(data.activity["COE_METER_LIST"]);
    } else {
        tabledata = {};
    };
    // Create x2js instance with default config
    var x2js = new X2JS();

    //Build table
    var table = new Tabulator("#issues-table", {
        data:tabledata,
        layout:"fitDataStretch",
        columns:[
            {title:"Contador", field:"id", width:150, editor:"input", headerFilter:"input", validator:["required", "numeric", "minLength:8", "maxLength:8"]},
            {title:"Valor", field:"avg_value", sorter:"number", hozAlign:"left", width:140, editor:true, validator:["numeric", "maxLength:8"]},
            {title:"Comentario", field:"comment", hozAlign:"center", width:140, editor:true},
        ],
    });

    addRowListener();
    addCloseListener();


    function addCloseListener() {
        document.getElementById("submit").addEventListener("click", function () {
            var tableData = table.getData();
            var newData = JSON.stringify(tableData);
            var temp = {};
            temp.item = tableData;
            var temp2 = {};
            temp2.root = temp;
            var xmlData = x2js.json2xml_str(temp2);
            var activityData = {
                "COE_METER_LIST": newData,
                "COE_METTER_LIST_XML": xmlData,
                "aid": data.activity.aid
            };
            closePlugin(activityData);
        });
    }

    function addRowListener() {
        document.getElementById("add-row").addEventListener("click", function () {
            var new_record = {};
            new_record.date = moment().format("YYYY-MM-DD hh:mm");
            new_record.group - "Uno";
            table.addRow(new_record);
        });
    }
    // END OF PLACEHOLDER
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
