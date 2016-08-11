
define(['lodash', 'Howler', 'modules/helpers'], function (_, Howler, helpers) {
	'use strict';	



    /**
     * Starts playback without checking for interrupt, used for background noises
     * @param {CreateJs.Event} evt Event data that triggered this call
     * @param {CreateJs.AbstractSoundInstance} evt Event data that triggered this call
     */
	var backgroundPlay = function (evt, data) {
        data.play();
        data.active = true;
	};

    /**
     * Starts playback on loop without checking for interrupt, used for background noises
     */
	var backgroundLoop = function (evt, data) {
		data.loop = -1;
		data.active = true;
		data.play();
	};

	/*
	 * Class that holds the SoundJs sound Object as well as other options
	 * Sounds are stored as a CreateJs.AbstractSoundInstance
	 * Contains every method related to handling playback events
	 * @param {CerosComponent} cerosComponent The component whose payload/tags will be used to create the SoundComponent
	 */
	var SoundComponent = function (cerosComponent, howl) {

        this.funcs = {};

		//Defaults settings for sounds
		this.soundDefaults = {
			eventsEnabled: false,
			active: false,
			shown: false,
			start: 0, //in milliseconds
            duration: null,
            interrupt: true,
            fastforwardtime: 1000, //in milliseconds
            rewindtime: 1000 //in milliseconds
		};

		this.cerosComponent = cerosComponent;
		this.id = cerosComponent.id;
		this.payload = cerosComponent.getPayload();


      	var componentOptions = helpers.optionsForComponent(this.cerosComponent, this.soundDefaults);
     	this.soundOptions = componentOptions;

     	// Creates a sound instance of the loaded file
        this.sound = howl;

        //Note, this will not overwrite any original soundComponent options
     //    this.soundOptions = _.defaults(
					// 	this.sound,
					// 	componentOptions
					// );

        // Attaches the cerosPlay and cerosInterrupt function to this.sound
        // Done to make things neater because dispatchEvent changes the context of this

        //NOTE this is very unreliable when in background because browsers throttle background tabs
        // this messes up timeouts and similar stuff
        this.sound.on('end', function() {
            if(this.soundOptions!= 0){
                this.sound.seek(this.soundOptions.start/1000);
            }
        }.bind(this));

        // custom events that can be triggered through component events
        this.funcs["mute"] = this.handleMute.bind(this);
        this.funcs["play"] = this.handlePlay.bind(this);
        this.funcs["pause"] = this.handlePause.bind(this);
        this.funcs["reset"] = this.handleReset.bind(this);
        this.funcs["toggle"] = this.handleToggle.bind(this);
        this.funcs["loop"] = this.handleLoop.bind(this);
        this.funcs["looptoggle"] = this.handleLoopToggle.bind(this);
        this.funcs["fastforward"] = this.handleFastForward.bind(this);
        this.funcs["rewind"] = this.handleRewind.bind(this);

	};






	SoundComponent.prototype = {


        /**
         * Custom function for playing sounds
         * If sound is already playing, and this.interrupt is true, the sound is interrupted and played again
         */
        cerosPlay : function () {


            var tes = this.sound.seek(); 

            // var ppc = new createjs.PlayPropsConfig().set({interrupt:createjs.Sound.INTERRUPT_ANY});

            var startTime = this.soundOptions.start / 1000 //ms to seconds
            if (this.sound.seek() < startTime){
                this.sound.seek(startTime); //sets the seek to start time IN SECONDS
            }
            if (this.soundOptions.interrupt){
                this.cerosInterrupt();
            }

            if (!this.sound.playing()){
                this.sound.play();
            }

        },



        /**
         * If sound is already playing, stops sound and plays it from beginning
         */
        cerosInterrupt : function () {
            if (this.sound.playing()){           
                this.sound.stop();
                this.cerosPlay();
            }   
        },



        // EVENT HANDLERS

        /**
		 * Toggles the volume on a sound
     	 * @param {CreateJs.Event} evt Event data that triggered this call
         */

         //TODO Must check to see if it toggles or not
        handleMute : function(){
            if (this.sound.mute()){
                this.sound.mute(false);
            }
            else {
                this.sound.mute(true);
            }
        },

        /**
		 * Plays the sound
     	 * @param {CreateJs.Event} evt Event data that triggered this call
         */
        handlePlay : function(){
            this.cerosPlay();
        },

        /**
		 * Pauses the sound
     	 * @param {CreateJs.Event} evt Event data that triggered this call
         */
        handlePause : function(){
            this.sound.pause();
        },

        /**
		 * Plays the sound. Subsequent clicks will pause/play the sound
     	 * @param {CreateJs.Event} evt Event data that triggered this call
         */
        handleToggle : function(){

            if (this.sound.playing()){
                this.sound.pause();

            }
            // else if (this.sound.seek() == 0){
            //     this.cerosPlay();
            // }
            // else{
            //     this.sound.play();
            // }
            else {
                this.cerosPlay();
            }
        },

        /**
		 * Resets and plays the sound from the beginning
     	 * @param {CreateJs.Event} evt Event data that triggered this call
         */
         //TODO perhaps use seek instead, to preserve pause state
        handleReset : function(){

            if (this.sound.playing()){
                this.sound.stop();
            }
            this.cerosPlay();
        },

        /**
		 * Plays the sound and sets it to loop indefinitely.
     	 * @param {CreateJs.Event} evt Event data that triggered this call
         */
        handleLoop : function(){
            this.sound.loop(true);
            this.cerosPlay();
        },

        /**
		 * Plays the sound(s) and sets it to loop indefinitely.  Subsequent clicks will play/pause the sound.
     	 * @param {CreateJs.Event} evt Event data that triggered this call
         */
        handleLoopToggle : function(){
            this.sound.loop(true);
            this.handleToggle();
        },

        handleFastForward : function(){
            var jumpTime = this.soundOptions.fastforwardtime / 1000; // convert to seconds
            var currentTime = this.sound.seek();
            this.sound.seek(currentTime + jumpTime);
        },


        handleRewind : function(){
            var startTime = this.soundOptions.start / 1000; // convert to seconds
            var jumpTime = this.soundOptions.fastforwardtime / 1000; // convert to seconds
            var currentTime = this.sound.seek();
            if ((currentTime - jumpTime) >= startTime){
                this.sound.seek(currentTime - jumpTime);

            }
        },


        /**
		 *	Dispatches the event to this.sound
		 *
     	 * @param {String} func Event name of function to call
         */
        dispatch : function (func) {

            //TODO if this does not work, just run through if statements to dispatch function


        	// NOTE: dispatchEvent, sends the object it is called on as "this" to the handle function.
        	// in this case this.sound becomes this in the handle function
        	// if (this.sound.eventsEnabled && this.hasOwnProperty(func)){
            if(this.funcs.hasOwnProperty(func)){
	        	this.funcs[func]();        		
        	}
        },

        /**
		 * If component has name tag, returns name, otherwise returns false
		 * @returns {String || Boolean}
         */
        getName : function () {
        	if (this.soundOptions.hasOwnProperty("name")){
        		return this.soundOptions.name;
        	}
        	return false;
        }



	};

	return SoundComponent;



});