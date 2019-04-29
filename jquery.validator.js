const nameSpace = 'formvalidator';
const version = '1.0.0';
'use strict';
if (typeof jQuery === 'undefined') {
    alert(`${nameSpace} ${version} required jquery!!!`);
};

var defaults = {
    errorClass: 'error',
    hideClass: 'hide',
    elementTag: 'span',
    selector: '[data-validate*="required"]'
    //selector: 'input:not(:radio)[data-validate*="required"]'
}

const dataUID = "data-uid";
const dataValidate = "data-validate";
const dataMin = "data-min";
const dataMax = "data-max";
const dataPattren = "data-pattren";
const dataCompare = "data-compare";
const dataErrorMessage = "data-message";
const dataFormValid = "data-formvalid";

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
    requiredInline: function (element) {
        var dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
        if (dateRegex.test(element.html().trim())) {
            return true;
        }
        return false;
    },
    email: function (element) {
        var emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/;
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
        this.$form.on(event_submit, $.proxy(this.validateForm, this));
    }

    validator.prototype = {
        create: function () {
            var $this = this,
                $form = $this.$form,
                inputs = $form.find($this.options.selector),
                formUID = $form.attr(dataUID);

            var event = `${event_change} ${event_keyup} ${event_blur}`;
            inputs.each(function (index, input) {
                var $input = $(input);
                $input.attr(dataUID, `${formUID}-field-${index}`);
                $input.off(event)
                    .on(event, $.proxy($this.validateField, $this));

            });
            $($form).attr(dataFormValid, $this.isValid);
        },
        validateForm: function (e) {
            var $this = this,
                inputs = $this.$form.find($this.options.selector);

            $this.create();
            var isValid = true;
            inputs.each(function (index, input) {
                if (!$this.validateField(input)) {
                    isValid = false;
                    e.preventDefault();
                }
            });
            $this.isValid = isValid;
            $this.$form.attr(dataFormValid, $this.isValid);

        },
        IsFormValid: function () {
            var $this = this,
                inputs = $this.$form.find($this.options.selector);

            $this.create();
            var isValid = true;
            inputs.each(function (index, input) {
                if (!$this.validateField(input)) {
                    isValid = false;
                }
            });
            $this.isValid = isValid;
            $this.$form.attr(dataFormValid, $this.isValid);
            console.log(isValid);
            return isValid;

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
                        case 'requiredInline':
                            valid = valid ?
                                this.validate($input, property, validationFuntion.requiredInline, 'This field is required') :
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

        var isValid = true;
        this.each(function (index, element) {
            var $element = $(element);
            var data = $element.data(nameSpace);
            if (!data) {
                // remove defauld validation
                $element.attr('novalidate', true);
                $element.attr(dataUID, `form-${index}`)
                data = new validator(element, options);
                $element.data(nameSpace, data);
            }
            if (!data.IsFormValid()) {
                isValid = false;
            }
        })

        return isValid;
    };
    $.fn.validate.constractor = validator;
}