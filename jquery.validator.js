const appname = 'formvalidator';
const version = '1.0.0';
'use strict';
if (typeof jQuery === 'undefined') {
    alert(`${appname} ${version} required jquery!!!`);
};

var defaults = {
    errorClass: 'error',
    hideClass: 'hide',
    elementTag: 'span',
    selector: 'input:not(:radio)'
}

const dataUID = "data-uid";
const dataValidate = "data-validate";
const dataMin = "data-min";
const dataMax = "data-max";
const dataPattren = "data-pattren";
const dataCompare = "data-compare";
const dataErrorMessage = "data-message";

const event_change = "change";
const event_keyup = "keyup";
const event_paste = "paste";
const event_blur = "blur";
const event_submit = "submit";

var validationFuntion = {
    required: function (element) {
        if (element && element.val().trim() !== '') {
            return true;
        }
        return false;
    },
    email: function (element) {
        var emailRegEx = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (emailRegEx.test(element.val())) {
            return true;
        }
        return false;
    },

    mobile: function (element) {
        var mobileRegEx = /^\d{10}$/;
        if (mobileRegEx.test(element.val())) {
            return true;
        }
        return false;
    },
    pattern: function (element) {
        var regEx = new RegExp(element.attr(dataPattren));
        if (regEx.test(element.val())) {
            return true;
        }
        return false;
    },
    match: function (element) {
        // Get the match field
        var otherInput = $(element.attr(dataCompare));
        if (otherInput.val() === element.val()) {
            return true;
        }
        return false;
    },
    isNumber: function (element) {
        if ($.isNumeric(element.val())) {
            return true;
        }
        return false;
    },
    max: function (element) {
        var maxValue = parseInt(element.attr(dataMax));
        if (element.val().length <= maxValue) {
            return true;
        } else {
            return false;
        }
    },
    min: function (element) {
        var minValue = parseInt(element.attr(dataMin));
        if (parseInt(element.val().length) >= minValue) {
            return true;
        }
        return false;
    },
};

var validator = function () {
    function validator(element, options) {
        this.$form = $(element);
        this.options = $.extend({}, defaults, options);
        this.isValid = false;
        this.create();
    }

    validator.prototype = {
        create: function () {
            var $this = this,
                $form = $this.$form,
                inputs = $form.find($this.options.selector),
                formUID = $form.attr(dataUID);

            var event = `${event_change} ${event_keyup} ${event_paste}`;
            inputs.each(function (index, input) {
                var $input = $(input);
                $input.attr(dataUID, `${formUID}-field-${index}`);
                $input.off(event)
                    .on(event, $.proxy($this.validateField, $this));

            });

            $form.on(event_submit, $.proxy($this.validateForm, $this));
        },
        validateForm: function (e) {
            var $this = this,
                inputs = $this.$form.find($this.options.selector);
            var isValid = true;
            inputs.each(function (index, input) {
                if (!$this.validateField(input)) {
                    isValid = false;
                    e.preventDefault();
                }
            });
            $this.isValid = isValid;
        },
        validateField: function (e) {
            var $input = $(e.target);
            if ($input.length === 0) {
                $input = $(e);
            }
            let valid = true;
            var properties = $input.attr(dataValidate);
            if (properties) {
                properties = properties.split(',');
                properties.forEach(property => {
                    switch (property) {
                        case 'required':
                            valid = valid ?
                                this.validate($input, property, validationFuntion.required, 'This field is required') :
                                valid;
                            break;
                        case 'email':
                            valid = valid ?
                                this.validate($input, property, validationFuntion.email, 'enter a valid email address') :
                                valid;
                            break;
                        case 'mobile':
                            valid = valid ?
                                this.validate($input, property, validationFuntion.mobile, 'enter a valid mobile number') :
                                valid;
                            break;
                        case 'pattern':
                            valid = valid ?
                                this.validate($input, property, validationFuntion.pattern, 'pattern does not match') :
                                valid;
                            break;
                        case 'match':
                            var name = $input.attr("name");
                            valid = valid ?
                                this.validate($input, property, validationFuntion.match, name + ' does not match') :
                                valid;
                            break;
                        case 'isNumber':
                            valid = valid ?
                                this.validate($input, property, validationFuntion.isNumber, 'enter a valid number') :
                                valid;
                            break;
                        case 'min':
                            var minLength = $input.attr(dataMin);
                            valid = valid ?
                                this.validate($input, property, validationFuntion.min, 'minimum character(s) length should be atleast ' + minLength) :
                                valid;
                            break;
                        case 'max':
                            var maxLength = $input.attr(dataMax);
                            valid = valid ?
                                this.validate($input, property, validationFuntion.max, 'maximum character(s) length shoud be less the ' + maxLength) :
                                valid;
                            break;
                        default:
                            break;
                    }
                });
            }
            return valid;
        },
        validate: function ($input, property, validationFn, errorMessage) {
            var $errorContainer = this.getErrorContainer($input),
                options = this.options,

                errorMessage = $input.attr(dataErrorMessage) || errorMessage;
            if (!validationFn($input)) {
                $errorContainer.removeClass(options.hideClass);
                $errorContainer.html(errorMessage);
                return false;
            } else {
                $errorContainer.addClass(options.hideClass);
                $errorContainer.remove();
                return true;
            }
        },
        getErrorContainer: function ($input) {
            var options = this.options;
            var inputUID = $input.attr(dataUID);
            var errorContainerUID = `${inputUID}-error`;
            var $errorContainer = $('#' + errorContainerUID);
            if ($errorContainer.length == 0) {
                errorContainer = document.createElement(options.elementTag);
                errorContainer.setAttribute('id', errorContainerUID);
                errorContainer.className = options.errorClass;
                $input.after(errorContainer);
                $errorContainer = $(errorContainer);
            }
            return $errorContainer;
        }
    }

    return validator;
}();

if ($.fn) {
    $.fn.validate = function jQueryFormValidator(options) {
        this.each(function (index, element) {
            var $element = $(element);
            var data = $element.data(appname);
            if (!data) {
                // remove defauld validation
                $element.attr('novalidate', true);
                $element.attr(dataUID, `form-${index}`)
                data = new validator(element, options);
                $element.data(appname, data);
            }
        })
    };
    $.fn.validate.constractor = validator;
}