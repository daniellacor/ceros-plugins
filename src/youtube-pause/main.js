require.config({
    paths: {
        CerosSDK: 'https://sdk.ceros.com/standalone-player-sdk-v3.min'
    }
});

require(['CerosSDK'], function(CerosSDK) {
    CerosSDK.findExperience()
    .fail(function(err){
        console.error("Error: ", err);
    })
    .done(function(experience){

        // The close component
        closeComponent = experience.findComponentsByTag("close");

         // The open component
        openComponent = experience.findComponentsByTag("open");

        // video component
        videoHTMLComponent = experience.findComponentsByTag("vid-select");

          // close X component clicked
          closeComponent.subscribe(CerosSDK.EVENTS.CLICKED, function(component){

            var current = component.getPayload(); //Pause button payload
            console.log(current);
            var div = document.getElementById(current);
            var iframe = div.getElementsByTagName("iframe")[0].contentWindow;
            iframe.postMessage('{"event":"command","func":"pauseVideo","args":""}','*');


          });

          // open X component clicked
          openComponent.subscribe(CerosSDK.EVENTS.CLICKED, function(component){

            var current = component.getPayload();
            console.log(current);
            var div = document.getElementById(current);
            var iframe = div.getElementsByTagName("iframe")[0].contentWindow;
            iframe.postMessage('{"event":"command","func":"playVideo","args":""}','*');


          });

    });
});
