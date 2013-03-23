(function($){
	if (!$){
		throw 'jQuery is not loaded: validatehtml5form';
	}
	$.fn.validateHtml5Form = function(){
	    this.each(function(){
	        $(this).on('submit', submitFunc);
	        $elements = $(this).find('input,textarea')
	         .add($('[form="'+$(this).attr('id')+'"]').filter('input,textarea'));
	        $elements.filter('input[type="text"],input[type="password"],input[type="email"],input[type="search"]input,[type="tel"],'+
	                         'input:not([type]),textarea').on('blur', textBlur);
	        $elements.filter('input[type="email"]').on('blur', emailBlur);
	        $elements.filter('input[type="date"],input[type="time"],input[type="datetime"],input[type="datetime-local"],'+
	                         'input[type="month"],input[type="week"]').on('blur', dateBlur);
	        $elements.filter('input[type="number"],input[type="range"]').on('blur', numBlur);
	        $elements.filter('input[type="url"]').on('blur', urlBlur);
	        $elements.filter('input[type="color"]').on('blur', colourBlur);	        
	    });
	    function textBlur(){
	        var $this = $(this);
	        var value = $this.val();
	        if (value == ''){
	            if ($this.is('[required]')){
	                showPopup($this, 'This field is required');
	                return;
	            }
	        }
	        else{
	            if ($this.is('[pattern]')){
	                var pattern = new RegExp('^'+$this.attr('pattern')+'$');
	                if (!pattern.test(value)){                        
	                    showPopup($this, $this.attr('title') || 'Enter valid text');
	                    return;
	                }
	            }
	        }
	        $this.removeAttr('data-vf-state');
	    }
	    //to test
	    function emailBlur(){
	        var $this = $(this);
	        var value = $this.val();
	        var multiple = $this.is('[multiple]');
	        if (value == ''){
	            if ($this.is('[required]')){
	                showPopup($this, 'This field is required');
	                return;
	            }
	        }
	        else{
	        	var values = new Array();
	        	if (multiple){
	        		values = value.split(',');
	        	}
	        	else{
	        		values.push(value);
	        	}
	        	for (var i = 0; i < values.length; i++){	        		
		        	if (/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(values[i])){	        		
			            if ($this.is('[pattern]')){
			                var pattern = new RegExp('^'+$this.attr('pattern')+'$');
			                if (!pattern.test(values[i])){                        
			                    showPopup($this, $this.attr('title') || multiple?'Enter a valid list of comma separated emai addresses':'Enter a valid email address');
			                    return;
			                }
			            }
		        	}
		        	else{
	                    showPopup($this, $this.attr('title') || 'Enter a valid email address');
	                    return;	        		
		        	}
	        	}
	        }
	        $this.removeAttr('data-vf-state');
	    }
	    function dateBlur(){
	        var $this = $(this);
	        var value = $this.val();
	        if (value == ''){
	            if ($this.is('[required]')){
	                showPopup($this, 'This field is required');
	                return;
	            }
	        }
	        else{
	        	var valid = false;
	        	//take the message from the title attribute
	        	var message = 'This value is invalid';
	        	switch ($this.attr('type')){
	        		case 'date':
	        			if (validateDate(value)){
	    					//date is valid
	    					valid = true;
	    					//but is it in range    						
	    					//rewrite min/max logic as it is incorrect 	
	    					if ($this.is('[min]') && validateDate($this.attr('min'))){
	    						var minDate = dateValueToDate($this.attr('min'));
	    						if (minDate > dateValueToDate(value)){
	    							valid = false;
	    							message = 'This date must be on or after '+minDate.toDateString();
	    						}
	    					}
	    					if ($this.is('[max]') && validateDate($this.attr('max'))){
	    						var maxDate = dateValueToDate($this.attr('max'));
	    						if (maxDate < dateValueToDate(value)){
	    							if (!valid){
	    								message = 'This date must be between '+minDate.toDateString()+' and '+maxDate.toDateString();
	    							}
	    							else{	    								
		    							valid = false;
		    							message = 'This date must be on before '+maxDate.toDateString();
	    							}
	    						}
	    					}
	    				}
	        			break;
	        		case 'datetime':
	        			if (validateDateTime(value)){
	    					//date is valid
	    					valid = true;
	    					//but is it in range   
	    					//rewrite min/max logic as it is incorrect 	
	    					//add step logic					
	    					if ($this.is('[min]') && validateDateTime($this.attr('min'))){
	    						var minDate = dateTimeValueToDateTime($this.attr('min'));
	    						if (minDate > dateTimeValueToDateTime(value)){
	    							valid = false;
	    							message = 'This date must be on or after '+minDate.toDateString();
	    						}
	    					}
	    					if ($this.is('[max]') && validateDate($this.attr('max'))){
	    						var maxDate = dateTimeValueToDateTime($this.attr('max'));
	    						if (maxDate < dateTimeValueToDateTime(value)){
	    							if (!valid){
	    								message = 'This date must be between '+minDate.toDateString()+' and '+maxDate.toDateString();
	    							}
	    							else{	    								
		    							valid = false;
		    							message = 'This date must be on before '+maxDate.toDateString();
	    							}
	    						}
	    					}
	    				}
	        			break;
	        		case 'etc...':
	        			
	        			break;
	        	}
	        	if (!valid){
	                showPopup($this, $this.attr('title') || message);        		
	        	}
	        }
	        $this.removeAttr('data-vf-state');
	    }
	    function validateDate(date){
			var matches = date.match(/^([\d]{4,})-(\d\d)-(\d\d)$/);
			if (matches && matches.length == 4){
				var date = new Date(matches[1], matches[2] - 1, matches[3]);
				if (date.getDate() == matches[3] && date.getMonth() == (matches[2] - 1) && 
				                                         date.getFullYear() == matches[1]){
	             	return true;
	         	}
			}
	    	return false;
	    }
	    //no timezone support as yet
	    function validateDateTime(date){
			var matches = date.match(/^([\d]{4,})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(Z)|([-\+][\d][01]\d:[03]0)$/);
			if (matches && matches.length == 8){
				var date = new Date(matches[1], matches[2] - 1, matches[3], matches[4], matches[5], matches[6]);
				if (matches[7] != 'Z'){
					var offset = matches[7].match(/^([-\+])(\d\d):(\d\d)$/);
					var sign = matches[1]=='-'?1:-1;
					date.setHours(sign*offset[2],sign*offset[3]);
				}
				date.setMinutes(-1*date.getTimezoneOffset());
				if (date.getSeconds() == matches[6] && date.getMinutes() == matches[5] && date.getHours() == matches[4] && 
				       date.getDate() == matches[3] && date.getMonth() == (matches[2] - 1) && 
				       date.getFullYear() == matches[1]){
	             	return true;
	         	}
			}
	    	return false;
	    }
	    function dateValueToDate(value){
			var matches = value.match(/^([\d]{4,})-(\d\d)-(\d\d)$/);
			return new Date(matches[1], matches[2] -1, matches[3]);    	
	    }
	    function dateTimeValueToDate(value){
	    	var matches = value.match(/^([\d]{4,})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(Z)|([-\+][\d][01]\d:[03]0)$/);
			var date = new Date(matches[1], matches[2] - 1, matches[3], matches[4], matches[5], matches[6]);
			if (matches[7] != 'Z'){
				var offset = matches[7].match(/^([-\+])(\d\d):(\d\d)$/);
				var sign = matches[1]=='-'?1:-1;
				date.setHours(sign*offset[2],sign*offset[3]);
			}
			date.setMinutes(-1*date.getTimezoneOffset());
			return date;    	
	    }
	    //element.willValidate element.validationMessage
	    function numBlur(){
	        var $this = $(this);
	        var value = $this.val();
	        if (value == ''){
	            if ($this.is('[required]')){
	                showPopup($this, 'This field is required');
	                return;
	            }
	        }
	        else if (!validateFloatingPointNumber(value)){
	            showPopup($this, 'Enter a valid number');
	            return;
	        }
	        var valid = true, 
	        message = 'This value is invalid';
	    	//rewrite min/max logic as it is incorrect 	
	    	//add step logic					
	        if ($this.is('[min]') && validateFloatingPointNumber($this.attr('min'))){
	        	var valueNum = parseFloat(value),
	        	minNum = parseFloat($this.attr('min'));
	        	if (minNum > valueNum){
	        		valid = false;
	        		message = 'This number must be greater than '+ minNum;
	        	}
	        }
	        if ($this.is('[max]') && validateFloatingPointNumber($this.attr('max'))){
	        	var valueNum = parseFloat(value),
	        	maxNum = parseFloat($this.attr('max'));
	        	if (maxNum < valueNum){
	        		if (!valid){
	        			message = 'This number must be greater than '+ minNum;
	        		}
	        		else{	        			
		        		valid = false;
		        		message = 'This number must be greater than '+ minNum;
	        		}
	        	}
	        }
	        $this.removeAttr('data-vf-state');
	    }
	    function validateFloatingPointNumber(value){
	    	return /^-?[0-9]+(\.[0-9]+)?([eE][\+\-]?[0-9]+)?$/.test(value);
	    }
	    function urlBlur(){
	        var $this = $(this);
	        var value = $this.val();
	        if (value == ''){
	            if ($this.is('[required]')){
	                showPopup($this, 'This field is required');
	                return;
	            }
	        }
	        else{
	            if ($this.is('[pattern]')){
	                var pattern = new RegExp('^'+$this.attr('pattern')+'$');
	                if (!pattern.test(value)){                        
	                    showPopup($this, 'Enter valid url');
	                    return;
	                }
	            }
	        }
	        $this.removeAttr('data-vf-state');
	    }
	    function colourBlur(){
	        var $this = $(this);
	        var value = $this.val();
	        if (value == ''){
	            if ($this.is('[required]')){
	                showPopup($this, 'This field is required');
	                return;
	            }
	        }
	        else if (!/^#[a-fA-F0-9]{6}$/.test(value)){
	            showPopup($this, 'Enter a valid colour code');
	            return;
	        }
	        $this.removeAttr('data-vf-state');
	    }
	    function rcBlur(){
	        if (!this.is(':checked')){
                showPopup(this.last(), 'Please select an option.');
                return;
	        }
	        $this.removeAttr('data-vf-state');
	    }
	    function showPopup($element, message){
	    	$('.fv-invalid-message').fadeOut(function(){
			    $(this).remove();
			});
	        $element.attr('data-vf-state', message);
	        var width = $element.width();
	        var height = $element.height();
	        $popup = $('<span>', {'class': 'fv-invalid-message'})
	         .css({opacity:0, position:'relative', left: -width, top: 12, color: 'black', 'text-align': 'center'});
	        $inner = $('<span>', {text: message}).css({width: '10em', position: 'absolute', 'z-index': 9999, 
	                                              top: 0, 'border-radius': 5, border: '1px solid red', background: 'white',
	                                              padding: '0 0.5em', 'box-shadow': '2px 2px 2px grey'});
	        $notch = $('<span>').css({position: 'absolute', 'left': 20, 'border-top': 0, top: -10,
	                                  'border-left': '10px solid transparent', 'border-right': '10px solid transparent',
	                                  'border-bottom': '10px solid red', padding: 0, width: 0, height: 0, 'z-index': 10000,
	                                  'font-size': 0, 'line-height': 0, '_border-right-color': 'red',
	                                  '_border-left-color': 'red', '_filter': 'chroma(color=red)'});
	        $notchunder = $('<span>').css({position: 'absolute', 'left': 20, 'border-top': 0, top: -9,
	                                  'border-left': '10px solid transparent', 'border-right': '10px solid transparent',
	                                  'border-bottom': '10px solid white', padding: 0, width: 0, height: 0,
	                                  'font-size': 0, 'line-height': 0, '_border-right-color': 'white', 'z-index': 10000,
	                                  '_border-left-color': 'white', '_filter': 'chroma(color=white)'});
	        $element.after($popup.append($inner).append($notch).append($notchunder));
	        $popup.animate({top:height+12, opacity:1});
	        $pcelements = $inner.add($notch).add($notchunder);
	        setTimeout(function(){
	        	$(document).on('click.vh5f', function pc(event){
			    	if (!$(event.target).is($pcelements)){
			    		$('.fv-invalid-message').fadeOut(function(){
			    			$(this).remove();
			    		});
			    		$(document).off('click', pc);
			    		$element.off('focus.vh5f');
			    	}
		    	});
		    	$element.one('focus.vh5f', function(){
		    		$element.next('.fv-invalid-message').remove();
		    		$(document).off('click.vh5f');
		    	})
	    	}, 200);//need a fix for this
	    	
	    }
	    function submitFunc(event){
	        var $this = $(this);
	        if ($this.is('[novalidate]:not([data-vhf])')){
	            return;
	        }
	        var $elements = $this.find('input,textarea,select')
	             .add($('[form="'+$this.attr('id')+'"]').filter('input,textarea,select'))
	             .not(':disabled');
	        var $required = $elements.filter('[required]');
	        var $invalid = $required.filter('[data-vf-state]');
	        var $validate = $required.not('[data-vf-state]');
	        $validate.filter('input[type="text"],input[type="password"],input[type="email"],input[type="search"]input,[type="tel"],'+
	                         'input:not([type]),textarea').each(function(){
	                         										textBlur.call(this);
	                         										//return $(this).is(['[data-vf-state]']);
	                         									});
	        $validate.filter('input[type="date"],input[type="time"],input[type="datetime"],input[type="datetime-local"],'+
	                      'input[type="month"],input[type="week"]').each(function(){dateBlur.call(this);});
	        $validate.filter('input[type="number"],input[type="range"]').each(function(){numBlur.call(this);});
	        $validate.filter('input[type="url"]').each(function(){urlBlur.call(this);});
	        $validate.filter('input[type="color"]').each(function(){colourBlur.call(this);});
	        //checkboxes and radio buttons t.b.c.
	        var groups;
	        function rcEach(){
	        	var $this = $(this);
	        	var name = $this.attr('name');
	        	if (name){	        		
		        	if (!(name in groups)){
		        		groups[name] = this;
		        	}
	        	}
	        	else{
	        		rcBlur.call($this);
	        	}
	        }
	        groups = {};
	        $validate.filter('input[type="radio"]').each(rcEach);
	        $.each(groups, function(k,v){
	        	rcBlur.call($validate.filter('input[type="radio"][name="'+k+'"]'));
	        });
	        groups = {};
	        $validate.filter('input[type="checkbox"]').each(rcEach);
	        $.each(groups, function(k,v){
	        	rcBlur.call($validate.filter('input[type="checkbox"][name="'+k+'"]'));
	        });
	        
	        $validate.filter('select').each(function(){
	            if ($(this).val() == ''){
	                showPopup($(this), 'This field is required');
	            }
	        });
	        if ($elements.is('[data-vf-state]')){
	            event.preventDefault();
	            $invalid.each(function(){
	                var $this = $(this);
	                showPopup($this, $this.attr('data-vf-state'));
	            });
	        }
	    }
	}
})(window.jQuery);