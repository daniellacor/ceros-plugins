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
           	return _.defaults(
               	componentOptions,
               	componentDefaults
           	);

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
                   result[matches[1]] = matches[2];
               	}
           	}

           	return result;
       	}
   	};
});