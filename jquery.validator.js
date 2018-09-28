(function ($) {
    var appname = 'formvalidator';

    var validator = function (element,options) {
        this.$form = $(element);
        this.options = options;
    }

    validator.prototype = {
            
    }

    $.fn.valid = function (options) {
        this.each(function (element) {
            var $element = $(element);
            var data = $element.data(appname);
            if (!data) {
                var option = $.extend({}, options);
                data = new validator(element, option);
                $element.data(appname, data);
            }
        })
    };

});