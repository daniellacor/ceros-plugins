define(['lodash'], function (_) {
   'use strict';

   	var parseTagExpression = new RegExp("([^:]+):(.+)$", "i");

   	return {

        /**
         * Parse tags applied to a component, taking defaults from
         * its Page and the ExperienceDefaultOptions in Registry
         *
         * @param {CerosSDK.CerosComponent} component
        ​ * @returns {*​}
         */
       	optionsForComponent: function(component, componentDefaults) {

           	var componentOptions = this.parseArrayOfTags(component.getTags());

           	//NOTE MAY HAVE TO USE _.defaultsDeep
           	var test = _.defaultsDeep(
               	componentOptions,
               	componentDefaults
           	);
           	return test;

       	},

       	/**
         * Turn ["option-one:x", "option-two:y"] into {option-one: "x", option-two: "y"}
         *
         * @param {Array} tags
         * @returns {Object}
         */
       	parseArrayOfTags: function(tags){
           	var result = {};

           	// For every tag
           	for(var i = 0; i < tags.length; i++) {

               	var matches = tags[i].match(parseTagExpression);

               	// If tag matched naming convention
               	if (matches) {
               		//needs some exceptions
               		if (matches[1] == "start" || matches[1] == "duration") {
               			matches[2] = parseInt(matches[2]);
               		}
               		else if (matches[1] == "interrupt"){
               			if (matches[2] == "false"){
               				matches[2] = false;
               			}
               			else {
               				matches[2] = true;
               			}
               		}
                   	result[matches[1]] = matches[2];
               	}
           	}

           	return result;
       	}
   	};
});