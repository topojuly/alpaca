(function($) {

    var Alpaca = $.alpaca;
    
    /**
     * Basic text field control
     *
     * The following additional settings are permitted:
     *
     * {
     *    size: <number>								size attribute for input element
     *    readonly: <boolean>                           whether to mark the input control as readonly
     *    formName: <string>                            http post form name
     * }
     *
     * This field obeys JSON Schema for:
     *
     * {
     *    minLength: <number>,                          [optional]
     *    maxLength: <number>,                          [optional]
     *    pattern: <string>                             [optional]
     * }
     */
    Alpaca.Fields.TextField = Alpaca.ControlField.extend({
    
        /**
         * @Override
         *
         */
        setup: function() {
            this.base();
            
            if (!this.settings.size) {
                this.settings.size = 40;
            }
        },
        
        /**
         * @Override
         *
         * Renders an INPUT control into the field container
         */
        renderField: function(onSuccess) {
            var controlFieldTemplate = Alpaca.getTemplate("controlFieldText", this);
            
            if (controlFieldTemplate) {
                this.inputElement = $.tmpl(controlFieldTemplate, {
                    "id": this.getId(),
                    "settings": this.settings
                });
                this.inputElement.addClass("alpaca-textfield");
                this.injectField(this.inputElement);
                
                // mask it
                if (this.settings.mask && this.settings.maskString) {
                    $(this.inputElement).mask(this.settings.maskString);
                }
            }
            
            if (onSuccess) {
                onSuccess();
            }
        },
        
        /**
         * @Override
         *
         * Return the value of the input control
         */
        getValue: function() {
            return $(this.inputElement).val();
        },
        
        /**
         * @Override
         *
         * Set value onto the input contorl
         */
        setValue: function(value, stopUpdateTrigger) {
            if (value) {
                $(this.inputElement).val(value);
            } else {
                $(this.inputElement).val("");
            }
            
            // be sure to call into base method
            this.base(value, stopUpdateTrigger);
        },
        
        /**
         * @Override
         */
        handleValidate: function() {
            var baseStatus = this.base();
            
            var valInfo = this.validation;
            valInfo["invalidPattern"] = {
                "message": "",
                "status": this._validatePattern()
            };
            if (!this._validatePattern()) {
                valInfo["invalidPattern"]["message"] = Alpaca.substituteTokens(Alpaca.getMessage("invalidPattern", this), [this.schema.pattern]);
            }
            valInfo["stringTooLong"] = {
                "message": "",
                "status": this._validateMaxLength()
            };
            if (!this._validateMaxLength()) {
                valInfo["stringTooLong"]["message"] = Alpaca.substituteTokens(Alpaca.getMessage("stringTooLong", this), [this.schema.maxLength]);
            }
            valInfo["stringTooShort"] = {
                "message": "",
                "status": this._validateMinLength()
            };
            if (!this._validateMinLength()) {
                valInfo["stringTooShort"]["message"] = Alpaca.substituteTokens(Alpaca.getMessage("stringTooShort", this), [this.schema.minLength]);
            }
            return baseStatus && valInfo["invalidPattern"]["status"] && valInfo["stringTooLong"]["status"] && valInfo["stringTooShort"]["status"];
        },
        
        /**
         * validates against the pattern
         */
        _validatePattern: function() {
            var val = this.getValue();
            
            // JSON SCHEMA - regular expression pattern
            if (this.schema.pattern) {
                if (!val.match(this.schema.pattern)) {
                    return false;
                }
            }
            
            return true;
        },
        
        /**
         * validats against the minLength
         */
        _validateMinLength: function() {
            var val = this.getValue();
            
            if (!Alpaca.isEmpty(val)) {
                // JSON SCHEMA - minLength
                if (this.schema.minLength) {
                    if (val.length < this.schema.minLength) {
                        return false;
                    }
                }
            }
            return true;
        },
        
        /**
         * validats against the maxLength
         */
        _validateMaxLength: function() {
            var val = this.getValue();
            
            if (!Alpaca.isEmpty(val)) {
                // JSON SCHEMA - maxLength
                if (this.schema.maxLength) {
                    if (val.length > this.schema.maxLength) {
                        return false;
                    }
                }
            }
            return true;
        },
        
        /**
         * @Override
         */
        disable: function() {
            this.inputElement.disabled = true;
        },
        
        /**
         * @Override
         */
        enable: function() {
            this.inputElement.disabled = false;
        },
        
        /**
         * @Override
         */
        focus: function() {
            this.inputElement.focus();
        }
        
    });
    
    Alpaca.registerTemplate("controlFieldText", '<input type="text" id="${id}" {{if settings.size}}size="${settings.size}"{{/if}} {{if settings.readonly}}readonly="on"{{/if}} {{if settings.formName}}name="${settings.formName}"{{/if}} {{each(i,v) settings.data}}data-${i}="${v}"{{/each}}/>');
    Alpaca.registerMessages({
        "invalidPattern": "This field should have pattern {0}",
        "stringTooShort": "This field should contain at least {0} numbers or characters",
        "stringTooLong": "This field should contain at most {0} numbers or characters"
    });
    Alpaca.registerFieldClass("text", Alpaca.Fields.TextField);
    Alpaca.registerDefaultSchemaFieldMapping("string", "text");
    Alpaca.registerDefaultSchemaFieldMapping("any", "text");
})(jQuery);