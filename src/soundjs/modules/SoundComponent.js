
define(['lodash', 'SoundJS', 'modules/helpers'], function (_, createjs, helpers) {
	'use strict';	



	var cerosPlay = function () {

  		// var ppc = new createjs.PlayPropsConfig().set({interrupt:createjs.Sound.INTERRUPT_ANY});
  		console.log(this);

  		if (this.interrupt){

	        this.cerosInterrupt();

    	}
    	this.play();
    	this.active = true;
	};



	var cerosInterrupt = function () {
	    if (this.active){           
        	this.stop();
        	this.active = false; // note this does not fire 
        	this.cerosPlay();
        }   
	};



	var backgroundPlay = function (evt, data) {
		console.log("back play");
        data.play();
        data.active = true;

	};


	var backgroundLoop = function (evt, data) {

		console.log("back loop");
		data.loop = -1;
		data.active = true;
		data.play();
	};


	var SoundComponent = function (soundComponent) {

		this.soundDefaults = {
			clickEnabled: false,
			active: false,
			shown: false,
			start: 0,
            duration: null,
            interrupt: true
		};
		this.soundComponent = soundComponent;
		this.id = soundComponent.id;
		this.payload = soundComponent.getPayload();

      	var componentOptions = helpers.optionsForComponent(this.soundComponent, this.soundDefaults);
     	

//	NOTE Might look into making more efficiend by preventing double loads
     	createjs.Sound.registerSound(this.payload, this.id);

        
        //SET OFFSET AND DURATION HERE, RATHER THAN PASSING DATA AROUND
        // this.sounds[soundComponent.id] = createjs.Sound.createInstance(soundComponent.id, componentOptions.start, component.Options.duration);
        this.sound = createjs.Sound.createInstance(soundComponent.id, componentOptions.start, componentOptions.duration);




        //Note, this will not overwrite any original soundComponent options
        //NOTE: THIS MIGHT NOT WORK DUE TO "this" CHANGING
        this.sound = _.defaults(
						this.sound,
						componentOptions
					);

        this.sound['cerosPlay'] = cerosPlay;
        this.sound['cerosInterrupt'] = cerosInterrupt;



        this.setEvents(soundComponent.id);

	};






	SoundComponent.prototype = {


		setEvents : function (componentId) {


	        //attaches all default listeners
	        this.sound.on("complete", this.handleComplete, null, false, componentId);
	        this.sound.on("mute", this.handleMute, null, false, componentId);
	        this.sound.on("play", this.handlePlay, null, false, componentId);
	        this.sound.on("pause", this.handlePause, null, false, componentId);
	        this.sound.on("reset", this.handleReset, null, false, componentId);
	        this.sound.on("toggle", this.handleToggle, null, false, componentId);
	        this.sound.on("loop", this.handleLoop, null, false, componentId).bind(this);
	        this.sound.on("looptoggle", this.handleLoopToggle, null, false, componentId);

	      


	    },

 
		//Basic mainpulation function used a lot
        //currently disables interrupt, but can change
      	// cerosPlay : function(data){

      	// 	var ppc = new createjs.PlayPropsConfig().set({interrupt:createjs.Sound.INTERRUPT_ANY});
      	// 	console.log(this);

       //      this.play({interrupt:createjs.Sound.INTERRUPT_ANY});
       //      this.active = true;
            
       //  },


       // NATIVE EVENTS HANDLERS
        //cleans up extra data handled by us
        handleComplete : function(evt, data){

            this.active = false;
        },


        // EVENT HANDLERS

        handleMute : function(evt, data){
            if (this.muted){
                this.muted = false;
            }
            else {
                this.muted = true;
            }
        },

        handlePlay : function(evt, data){
            this.cerosPlay(data);
        },

        handlePause : function(evt, data){
            this.paused = true;
        },

        handleToggle : function(evt, data){

            if (!this.active){
                this.cerosPlay(data);
                this.active = true;

            }
            else if (this.paused){
                this.paused = false;
            }
            else {
                this.paused = true;
            }
        },

        handleReset : function(evt, data){
            if (!this.active){
                this.cerosPlay(data);
                this.active = true;

            }
            else {            
            	this.stop();
            	this.active = false; // note this does not fire 
            }            
        },

        handleLoop : function(evt, data){
            this.loop = -1;
            this.cerosPlay();
        },

        handleLoopToggle : function(evt, data){
            this.loop = -1;
            this.dispatchEvent("toggle");
        },

        handleStackPlay : function(evt, data){
            createjs.Sound.cerosPlay(data);
        },

        // EVENT DISPATCHER

        dispatch : function (evt) {
        	console.log(this);
        	// Note, dispatchEvent, sends the object it is called on as "this" to the handle function.
        	// in this case this.sound becomes this in the handle function
        	if (this.sound.clickEnabled){
	        	this.sound.dispatchEvent(evt);        		
        	}
        },

        getName : function () {
        	if (this.hasOwnProperty("name")){
        		return this.name;
        	}
        	return false;
        }



	};

	return SoundComponent;



});