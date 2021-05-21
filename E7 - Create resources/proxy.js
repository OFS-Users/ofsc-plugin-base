class OFSCProxy {
    createInstance(instance, clientId, clientSecret, baseURL) {
         // TODO: add auth construction
         this.instance = instance;
         this.clientId = clientId;
         this.clientSecret = clientSecret;
         this.baseURL = new URL(baseURL);
         /** Sunrise0511 - REPLACE */
         this.authorization = this.authenticateUser(clientId,instance,clientSecret)
         console.log('error', "USER AUTHENTICATION is " + this.authorization)
    }

    authenticateUser(clientId, company, clientSecret) {
          var token = clientId +'@'+company+':'+clientSecret;
          var hash = btoa(token);
          return 'Basic '+ hash;
    }
    constructor() {
        this.instance="";
        this.baseURL = new URL("https://api.etadirect.com");
        this.clientId = "";
        this.clientSecret = "";
        this.authorization = "";
    }
    createResource( resourceId, fields ){
       var theURL = new URL('/rest/ofscCore/v1/resources/'+resourceId,this.baseURL);
       console.log('info', '/rest/ofscCore/v1/resources/'+resourceId);
       var myHeaders = new Headers();
       myHeaders.append("Authorization", this.authorization);
       var requestOptions = {
           method: 'POST',
           headers: myHeaders,
           redirect: 'follow',
           body: JSON.stringify(fields)
       };
      console.log('info', 'REQUEST Data createResource' + JSON.stringify(requestOptions));
       const fetchPromiseUpdate = fetch(theURL, requestOptions)
           .then(response => response.json())
           .then(function(response) {
               // Your code for handling the data you get from the API
               return response;
           })
           .catch(error => console.log('error', error));
       return fetchPromiseUpdate;
   }
    updateResourceWorkschedule( resourceId, fields ){
       var theURL = new URL('/rest/ofscCore/v1/resources/'+resourceId+'/workSchedules',this.baseURL);
       console.log('info', '/rest/ofscCore/v1/resources/'+resourceId+'/workSchedules');
       var myHeaders = new Headers();
       myHeaders.append("Authorization", this.authorization);
       var requestOptions = {
           method: 'POST',
           headers: myHeaders,
           redirect: 'follow',
           body: JSON.stringify(fields)
       };
      console.log('info', 'REQUEST Data updateREsourceWorkSchedule' + JSON.stringify(requestOptions));
       const fetchPromiseUpdate = fetch(theURL, requestOptions)
           .then(response => response.json())
           .then(function(response) {
               // Your code for handling the data you get from the API
               return response;
           })
           .catch(error => console.log('error', error));
       return fetchPromiseUpdate;
   }
   updateResourceworkSkills( resourceId, fields ){
      var theURL = new URL('/rest/ofscCore/v1/resources/'+resourceId+'/workSkills',this.baseURL);
      console.log('info', '/rest/ofscCore/v1/resources/'+resourceId+'/workSkills');
      var myHeaders = new Headers();
      myHeaders.append("Authorization", this.authorization);
      var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          redirect: 'follow',
          body: JSON.stringify(fields)
      };
     console.log('info', 'REQUEST Data updateResourceworkSkills' + JSON.stringify(requestOptions));
      const fetchPromiseUpdate = fetch(theURL, requestOptions)
          .then(response => response.json())
          .then(function(response) {
              // Your code for handling the data you get from the API
              return response;
          })
          .catch(error => console.log('error', error));
      return fetchPromiseUpdate;
  }


}
