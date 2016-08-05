
define(['lodash', 'SoundJS', 'modules/helpers'], function (_, createjs, helpers) {
	'use strict';	

	var SoundComponent = function (soundComponent) {

		this.soundDefaults = {
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
	        this.sound.on("loop", this.handleLoop, null, false, componentId);
	        this.sound.on("looptoggle", this.handleLoopToggle, null, false, componentId);

	    },


		//Basic mainpulation function used a lot
        //currently disables interrupt, but can change
      	cerosPlay : function(data){

      		//var ppc = new createjs.PlayPropsConfig().set({interrupt:createjs.Sound.INTERRUPT_ANY});


      		console.log("before");
            this.play({interrupt:createjs.Sound.INTERRUPT_ANY});
            //this.active = true;
      		console.log("after");
            
        },


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
        	console.log(this);
        	var pcp = new createjs.PlayPropsConfig().set({interrupt: createjs.Sound.INTERRUPT_ANY, loop:-1, volume:0.7});
            this.play(pcp);
        },

        handlePause : function(evt, data){
            this.paused = true;
        },

        handleToggle : function(evt, data){

            if (!this.active){
            	this.play({interrupt: createjs.Sound.INTERRUPT_ANY});
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
            this.play({interrupt:createjs.Sound.INTERRUPT_ANY});
                this.active = true;

            }
            else {            
            	this.stop();
            	this.active = false; // note this does not fire 
            }            
        },

        handleLoop : function(evt, data){
            this.loop = -1;
            this.play({interrupt:createjs.Sound.INTERRUPT_ANY});
            this.active = true;
        },

        handleLoopToggle : function(evt, data){
            this.loop = -1;
            this.dispatchEvent("toggle");
        },

        handleStackPlay : function(evt, data){
            createjs.Sound.play(data);
        },

        // EVENT DISPATCHER

        dispatch : function (evt) {
        	this.sound.dispatchEvent(evt);
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