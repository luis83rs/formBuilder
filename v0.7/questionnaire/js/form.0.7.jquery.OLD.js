function Form(){
    this.html;
    this.questions;
    this.data;
    this.activePage;
    this.previousPage;
    this.numberPages;
    this.buttons;
    this.place;
    this.sliderQuestions = new Array();
    this.browser = detectBrowserVersion();
    this.panelId;
    this.pdjElementText = "";
    this.pdjObject;
    //form unique uid (user)
    this.fuid;
    this.urlVars;
    
    //29/03/2012 Needs to verify if the user has already registered
    this.alreadyRegister = false;
    this.username;
    this.uid = 0;
    
    //methods
    
    //url getters params
    this.getUrlVars = function(){
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        
        var auxVars = new Array();
        for(var i=0; i<vars.length;i++){
            auxVars[i] = new Object();
            auxVars[i].id = vars[i];
            auxVars[i].value = vars[vars[i]];
        }
        
        this.urlVars = auxVars;
    };
    
    //login form loader (Mobile))
    this.loadLoginQuestionnaire = function(place){
        var self = this;
        self.place = place;
        var formData;
        jQuery.ajax({
            type : 'POST',
    		url : '/questionnaire/getmobilelogin',
    		dataType: "json",
            success: function(result){
                formData = result;
                nid = formData.form.nid;
                jQuery.ajax({
                	type : 'POST',
            		url : '/questionnaire/insertuser',
            		dataType: "json",
            		data : {
            			nid: formData.form.nid
            		},
                    success: function(data){
                        self.build(formData);
                    },
                    error: function(data){
                        window.location = rootPath;
                    }
                });
            },
            error: function(result){
                window.location = rootPath;
            }
       });
    };
    
    //register form loader (Mobile))
    this.loadRegisterForm = function(place){
        this.place = place;
                
        //ajax call to insert  unique user
        var self = this;
        var formData;
        jQuery.ajax({
            type : 'POST',
    		url : '/questionnaire/getmobileregister',
    		dataType: "json",
            success: function(result){
                formData = result;
                nid = formData.form.nid;
                jQuery.ajax({
                	type : 'POST',
            		url : '/questionnaire/insertuser',
            		dataType: "json",
            		data : {
            			nid: formData.form.nid
            		},
                    success: function(data){
                        self.fuid = data.fuid;
                        self.build(formData);
                    },
                    error: function(data){
                        window.location = rootPath;
                    }
                });
            },
            error: function(result){
                window.location = rootPath;
            }
       });
    };
    
    //regular form loader
    this.loadQuestionnaire = function(nid, place, pdjElementText, pdjObject){    
        var self = this;
        self.place = place;
        self.pdjObject = pdjObject;
        self.pdjElementText = pdjElementText;
        
        //ajax call to insert  unique user
        jQuery.ajax({
        	type : 'POST',
    		url : '/questionnaire/insertuser',
    		dataType: "json",
    		data : {
    			nid: nid
    		},
            success: function(data){
                if(data.success && data.fuid!=0){
                    self.fuid = data.fuid;
                    jQuery.ajax({
                        type : 'POST',
                		url : '/questionnaire/get',
                		dataType: "json",
                		data : {
          		            nid: nid
                        },
                        success: function(result){
                            data = result;
                            self.build(data);
                        },
                        error: function(data, textStatus, errorThrown){
                            if(!jQuery.browser.msie){
                                console.log(textStatus,data.responseText);
                            }
                            self.showAlert('An error ocurred, please try again');
                        }
            	   });
                }else{
                    if(!jQuery.browser.msie){
                        console.log(data);
                    }
                    self.showAlert('An error ocurred, please try again');
                }
            },
            error: function(data, textStatus, errorThrown){
                if(!jQuery.browser.msie){
                    console.log(textStatus,data.responseText);
                }
                self.showAlert('An error ocurred, please try again');
                //window.location = rootPath;
            }
        });  
    };
    
    this.loadRegistration = function(place){
        this.place = place;
        
        //ajax call to insert  unique user
        var self = this;
        var formData;
        jQuery.ajax({
        	type : 'POST',
    		url : '/questionnaire/getprofile',
    		dataType: "json",
            success: function(data){
                formData = data;
                jQuery.ajax({
                	type : 'POST',
            		url : '/questionnaire/insertuser',
            		dataType: "json",
            		data : {
            			nid: formData.form.nid
            		},
                    success: function(data){
                        if(data.success && data.fuid!=0){
                            self.fuid = data.fuid;
                            build(formData);
                        }else{
                            window.location = rootPath();
                        }
                    },
                    error: function(data){
                        window.location = rootPath();
                    }
                });
            },
            error: function(data){
                window.location = rootPath();
            }
        });
    };
    
    this.build = function(data){
        var self = this;
        
        //get url variables
        self.getUrlVars();
            
        self.data = data;
        self.buttons = new Buttons(self, data.buttons);
        
        if(!jQuery.browser.msie){
            console.log(data);
            console.log("================");
        }
        
        self.activePage = 1;
        var questionPage = 0;
        var questionNumber = 0;
        self.numberPages = 0;
        
        //paginations...
        if(self.data.paginations.length>0){      
            //it has!    	
            self.numberPages = parseInt(self.data.paginations.length) + 1;
        }else{
            //it hasn't got pagination    	
        	self.numberPages = 1;
        }
        
        //initial form tag,  html var for the code to be generated
        this.html = "";
        var max = 0;
        var i = 0;
        for(k=0;k<self.numberPages;k++){
            questionPage++; 
            if(questionPage==0){
                i = 0;
            }else{
                i = max;
            }
            
            if(self.data.paginations.length>0){
                if(questionPage==self.numberPages){
                    max = self.data.questions.length;
                }else{
                    max = parseInt(self.data.paginations[(questionPage-1)].num_questions) + i;
               	}
            }else{
                max = self.data.questions.length;
            }
            
            if(i<max){
                if(self.activePage != questionPage){
                    self.html += "<div id='form_page_" + questionPage + "' class='form_questions non_display'><form class='form'>";        
                }else{
                    self.html += "<div id='form_page_" + questionPage + "' class='form_questions'><form class='form'>";
                }
        
                try{
                    //now lets begin and start painting the different questions
                    for(i;i<max;i++){
                        //Now lets paint the type of question, depending if it has multiple options or not
                        if(self.data.questions[i].multiple==1){
                        	//questions with multiple options or a question grid            	
                        	if(self.data.multipleQuestions && self.data.multipleQuestions[self.data.questions[i].id]){
                        		//it is a multipleChoice question
                                var question = new Question(self, self.data.questions[i], self.data.multipleQuestions[self.data.questions[i].id], null);
                                
                                self.html += question.paintMultipleQuestion();
                        		if(self.data.questions[i].type.toLowerCase()=="slider"){
                                    var sliderCount = self.sliderQuestions.length;
                      		        self.sliderQuestions[sliderCount] = new Object();
                                    self.sliderQuestions[sliderCount].question  = self.data.questions[i];
                                    self.sliderQuestions[sliderCount].options = self.data.multipleQuestions[self.data.questions[i].id];
                        		}          	
            	            }else if(self.data.gridQuestions[self.data.questions[i].id]){
            	               var question = new Question(self, self.data.questions[i], null, self.data.gridQuestions[self.data.questions[i].id]);
            	            	this.html += question.paintGridQuestion();
            	            }
                        }else if(self.data.questions[i].type!="nothing"){
                        	//NON multiple options questions
                        	var question = new Question(self, self.data.questions[i], null, null);
                            
                            self.html += question.paintSingleQuestion();
                        }
                    }
                }catch(error){
                    self.showAlert('Error occured (i=' + i + '), please try again');
                    if(!jQuery.browser.msie){
                        console.log(error);
                        console.log("Pagination error, Last Question painted correctly was " + self.data.questions[i-1].id + ", next question doesn't exists");
                    }
                }
                
                //close formpage div
                self.html+= "</form></div>";      
            }     
        }
        
        //close the div's buttons, and the form now
        self.html += "<div id='div_buttons'></div><div id='form_data'></div>";  
        
        //lets include the form code now
        jQuery('#' + self.place).append(self.html).trigger('create');
    
        //painting the buttons    
        self.buttons.paintInitialButtons(); 
        
        //adding custom rules
        self.addCustomRulesMessages();
                    
        //associating events
        self.associateEvents();
        
        //checking initial logics 
        self.checkInitialQuestionLogics();
        //options logics
        self.checkInitialOptionLogics();
        
        //paintGridRowsColors
        self.paintGridRowsColors();
        
        //paint question numbers
        if(self.data.form.numerable && self.data.form.numerable==1){
            self.paintQuestionNumbers();
        }
         
        //sortable events
        self.initSortables();
        
        //slider events
        self.initSliders();
        
        //init datepickers
        self.initDatePickers();
            
        //only for mobile login and register
        if(self.data.form.id_source==4){
            jQuery.mobile.pageContainer.trigger('create');
            jQuery.mobile.hidePageLoadingMsg();
        }
    
        //if is pdj paint a header
        //if is pdj paint a header
        if(self.data.form.id_pdj_object!=0 && (typeof self.pdjObject != "undefined") && self.pdjObjectText!=""){
            self.initPdjHeaderForm();
        }else if(self.data.form.id_source==1){
            //register url get parameters
            jQuery.post("/questionnaire/registerpanel", {vars: self.urlVars, browser: self.browser }, function (result) {
                result = jQuery.parseJSON(result);
                if(!jQuery.browser.msie){
                    if(!result.success){
                        console.log("ERROR REGISTERING PARAMS: " + result.error)
                    }
                }
            });
            
            //Now initialize hidden inputs
            var found = false;
            var index = 0;
            while(!found && index<self.urlVars.length){
                var panelElement = jQuery('#' + self.place + ' form.form input[id^="' + self.urlVars[index].id + '_"][type="hidden"]');
                if(panelElement.length>0){
                    found = true;
                    jQuery(panelElement).val(self.urlVars[index].value);                           
                    self.panelId = jQuery(panelElement).val();
                    var answer = new Object();
                    answer.values = new Array();
                    answer.state = true;
                    answer.values[0] = new Object();
                    answer.values[0].id_option = 0;
                    answer.values[0].id_option_multiple = 0;
                    answer.values[0].id_grid_row = 0;
                    answer.values[0].answer = panelId;
                    
                    var questionId = jQuery(panelElement).attr('id').split("_");
                    questionId = questionId[1]
                    jQuery("#form_data").data(questionId,answer);                                             
                }else{
                    index++;
                }
            }
            
            if(!found){
                //lets check if it was necessary
                var hiddenInputs = jQuery('#' + self.place + ' form.form input[type="hidden"]');
                if(hiddenInputs.length>0){
                    //it was neceessary
                    self.showLoadingAnimation();
                    jQuery("div#loading_div label").text("Missing parameters");
                    jQuery("div#loading_div img").toggle();
                }
            }
        }else{
            //regular form
            if(typeof test != 'undefined'){
                if(test && test!=0){
                    jQuery('#form_page_' + self.activePage).addClass("non_display");
                    jQuery('#form_page_' + test + ' div.question').removeClass('non_display');
                    jQuery('#form_page_' + test).removeClass("non_display");
                    jQuery('#form_page_' + test+ ' div.question table tr').removeClass("non_display");
                    self.paintGridRowsColors();
                }
            }
        } 
        
        //avoid submissions while hitting enter
        jQuery("#" + self.place + " form.form").submit(function(e) {
            return false;
        });          
    };
    
    this.paintGridRowsColors = function(){
        var grids = jQuery('#' + this.place + ' #form_page_' + this.activePage + ' table.question_table');
        for(var i=0;i<grids.length;i++){
            var rows = jQuery('#' + jQuery(grids[i]).attr('id') + ' tr').not('#heading_row');
            var typeCell = "odd";
            for(var j=0;j<rows.length;j++){
                if(!jQuery(rows[j]).hasClass('non_display')){
                    var tds = jQuery(rows[j]).children().not('.error_cell');
                    if(typeCell=="odd"){
                        tds.removeClass('even');
                    }else{
                        tds.removeClass('odd');
                    }
                    tds.addClass(typeCell);
                    if(typeCell == "odd"){
                        typeCell = "even";
                    }else{
                        typeCell = "odd";
                    }
                }
            }
        }  
    };
    
    //this function count how many questions are seen in one of the form's pages
    this.countAllQuestionShown = function(){
        var self = this;
        var total = 0;
        for(var i=1;i<=self.numberPages;i++){
            total += self.countQuestionShown(i);
    	}
        if(self.data.form.pdj_max_questions && self.data.form.pdj_max_questions>0 && self.data.form.pdj_max_questions<total){
            total = self.data.form.pdj_max_questions
        }
        return total;  
    };
    
    //this function count how many questions are seen in one of the form's pages
    this.countQuestionsBehind = function(){
        var self = this;
        var total = 0;
    	for(var i=self.activePage;i>=1;i--){
            total += self.countQuestionShown(i);
    	}
        return total;
    };
    
    //this function count how many questions are seen in one of the form's pages
    this.countQuestionShown = function(page){
        var self = this;
        var divsByPage = jQuery('#' + self.place + ' #form_page_' + page + ' div[id^=div_question_]');
    	var hiddenQuestions = 0;
    	jQuery.each(divsByPage, function (index, div){
            if(jQuery(div).hasClass('non_display')){
        	   hiddenQuestions++;
            }
    	});
    	return divsByPage.length - hiddenQuestions;
    };
    
    this.existsNextPage = function(){
        var self = this;
        var currentPage = self.activePage + 1;
        var found = false;
        while(!found && currentPage<=self.numberPages){
            var divsByPage = jQuery('#' + self.place + ' #form_page_' + currentPage + ' div[id^=div_question_]');
        	jQuery.each(divsByPage, function (index, div){
                if(!jQuery(div).hasClass('non_display')){
                    found = true;
                    return false;
                }
        	});
            currentPage++;
        }
        return found;
    };
    
    this.goForward = function(){
        var self = this;
        //once the activePage has been save we can continue, checking thepage to move forward   
        self.previousPage = self.activePage;   
        var moved = false;
        //if(form.id_pdj_object==0 || (form.pdj_max_questions>0 && previousPage<form.pdj_max_questions) || (form.id_pdj_object!=0 && form.pdj_max_questions==0)){
            //loop over all pages until one has at least 1 question active (because of the logic pages could have none)
            while(!moved && self.activePage<=self.numberPages){
                self.activePage++;
           	    //counting active questions giving the actual activePage (depends on logic))
           	    var count = self.countQuestionShown(self.activePage);
    	        if(count>0){
                    moved = true;
                    jQuery('#form_page_' + self.previousPage).addClass("non_display");
                    jQuery('#form_page_' + self.activePage).removeClass("non_display");
                    self.paintGridRowsColors();
                    
                    //unbind previous events clicks
                    jQuery('#' + self.place  + ' #next_button').unbind("click");
                    jQuery('#' + self.place  + ' #back_button').unbind("click");
                    jQuery('#' + self.place  + ' #save_button').unbind("click");
                    
                    //addCustomRules
                    self.addCustomRulesMessages();
                    
                    //adding buttons again
                    self.buttons.paintButtons();
                    
                    //scroll up to the first error div
                    if(self.data.form.id_pdj_object==0){
                        self.scrollToTop();
                    }
    		  	}
    		}
        //}
        if(self.data.form.id_pdj_object!=0){
            //update pdj header
            self.updatePdjHeaderForm();
        }
    };
    
    this.goBack = function(){
        var self = this;
        self.previousPage = self.activePage;      
       	var moved = false;
       	while(!moved && self.activePage>1){
       	    activePage--;
       	    var count = self.countQuestionShown(self.activePage);
            if(count>0){
                moved = true;
    	        //lets show the previous page
                jQuery('#form_page_' + self.previousPage).addClass("non_display");
                jQuery('#form_page_' + self.activePage).removeClass("non_display");
                                
                //unbind previous events clicks
                jQuery('#' + self.place  + ' #next_button').unbind("click");
                jQuery('#' + self.place  + ' #back_button').unbind("click");
                jQuery('#' + self.place  + ' #save_button').unbind("click");
                
                //addCustomRules
                self.addCustomRulesMessages();
                
                //adding buttons again
                self.buttons.paintButtons();
                
                //scroll up to the first error div
                if(self.data.form.id_pdj_object==0){
                    self.scrollToTop();
                }
            }
        }
        
        if(self.data.form.id_pdj_object!=0){
            //update pdj header
            self.updatePdjHeaderForm();
        }
    };
    
    this.checkInputAnswers = function(type, elem){
        var self = this;
        var id = jQuery(elem).attr('name').split("_");
        id = id[1];
        
        //answer object
        var answer = new Object();
        answer.values = new Array();
    
        if(type.toLowerCase()=="text"){
            var value = jQuery(elem).val();
            if(value!=""){
                answer.state = true;
                answer.values[0] = new Object();
                answer.values[0].id_option = 0;
                answer.values[0].id_option_multiple = 0;
                answer.values[0].id_grid_row = 0;
                answer.values[0].answer = value;
            }else{
                answer.state = false;
                answer.values[0] = new Object();
                answer.values[0].id_option = 0;
                answer.values[0].id_option_multiple = 0;
                answer.values[0].id_grid_row = 0;
                answer.values[0].answer = "";
            }
        }else if(type.toLowerCase()=="checkbox"){
            var checkboxes = jQuery('input[name="' + jQuery(elem).attr('name') + '"]:checked');
            if(checkboxes.length>0){
                var checkBoxValues = new Array();
                jQuery.each(checkboxes, function(){
                    var option = jQuery(this).attr('id').split("_");                
                    option = option[2];
                    var valuePos = answer.values.length;
                    answer.values[valuePos] = new Object();
                    answer.values[valuePos].id_option = option;
                    answer.values[valuePos].id_option_multiple = 0;
                    answer.values[valuePos].id_grid_row = 0;
                    //answer.values[valuePos].answer = "on";
                    answer.values[valuePos].answer = jQuery('label[for="' + jQuery(this).attr('id') + '"]').text();
                });
                answer.state = true;
            }else{
                answer.state = false;
                answer.values = new Array();
            }
        }else if(type.toLowerCase()=="radio"){
            var radioButtons = jQuery('input[name="' + jQuery(elem).attr('name') + '"]:checked');
            if(radioButtons.length>0){
                var radioButtonValues = new Array();
                jQuery.each(radioButtons, function(){
                    var option = jQuery(this).attr('id').split("_");
                    option = option[2];
                    var valuePos = answer.values.length;
                    answer.values[valuePos] = new Object();
                    answer.values[valuePos].id_option = option;
                    answer.values[valuePos].id_option_multiple = 0;
                    answer.values[valuePos].id_grid_row = 0;
                    //answer.values[valuePos].answer = "on";
                    answer.values[valuePos].answer = jQuery('label[for="' + jQuery(this).attr('id') + '"]').text();
                });
                answer.state = true;
            }else{
                answer.state = false;
                answer.values = new Array()
            }
        }else if(type.toLowerCase()=="grid_radio"){
            id = elem.parent().parent().parent().parent().attr('id');
            var gridId = id;
            id = id.split("grid_");
            id = id[1];
            var radioButtons = jQuery('input[name="' + jQuery(elem).attr('name') + '"]:checked');
            if(radioButtons.length>0){
                if(jQuery("#form_data").data(id)){
                    answer=jQuery("#form_data").data(id);
                }
                var radioButtonValues = new Array();
                jQuery.each(radioButtons, function(){
                    var option = jQuery(this).attr('id').split(gridId + "_");
                    option = option[1].split("_");
                    //lets search because it already has the rows value 
                    var found = false;
                    var valuePos = 0;
                    var gridRow = 0;
                    while(!found && valuePos<answer.values.length){
                        if(answer.values[valuePos].id_grid_row == option[0]){
                            found = true;
                        }else{
                            valuePos++;
                        }
                    } 
                    if(!found){
                        valuePos = answer.values.length;
                        answer.values[valuePos] = new Object();
                    }
                    answer.values[valuePos].id_option = option[1];
                    answer.values[valuePos].id_option_multiple = 0;
                    answer.values[valuePos].id_grid_row = option[0];
                    //answer.values[valuePos].answer = "on";
                    answer.values[valuePos].answer = jQuery.trim(jQuery('#' + gridId + ' td#column_' + option[1]).text());
                    //console.log(jQuery('#' + gridId + ' td#column_' + option[1]).text());
                });
                answer.state = true;
            }else{
                answer.state = false;
                answer.values = new Array()
            }
        }else if(type.toLowerCase()=="grid_checkbox"){
            id = elem.parent().parent().parent().parent().attr('id');
            var gridId = id;
            id = id.split("grid_");
            id = id[1];
            var checkboxes = jQuery('input[name^="' + gridId + '_row_"]:checked');
            if(checkboxes.length>0){
                if(jQuery("#form_data").data(id)){
                    answer=jQuery("#form_data").data(id);
                }
                answer = new Object();
                answer.values = new Array();
                var checkBoxValues = new Array();
                jQuery.each(checkboxes, function(){
                    var option = jQuery(this).attr('id').split(gridId + "_");
                    option = option[1].split("_");
                    //lets calculate the position
                    var valuePos = 0;
                    var gridRow = 0;
                    valuePos = answer.values.length;
                    answer.values[valuePos] = new Object();
                    answer.values[valuePos].id_option = option[1];
                    answer.values[valuePos].id_option_multiple = 0;
                    answer.values[valuePos].id_grid_row = option[0];
                    //answer.values[valuePos].answer = "on";
                    answer.values[valuePos].answer = jQuery.trim(jQuery('#' + gridId + ' td#column_' + option[1]).text());
                    //console.log(jQuery('#' + gridId + ' td#column_' + option[1]).text());
                });
                answer.state = true;
            }else{
                answer.state = false;
                answer.values = new Array();
            }
        }
        jQuery("#form_data").data(id,answer);
        //now lets check logics
        self.checkQuestionLogics();
        //check optiosn logics
        self.checkQuestionOptionLogics();
        //paintGridColors
        self.paintGridRowsColors();
    };
    
    this.checkTextAreaAnswer = function(elem){
        var self = this;
        var id = jQuery(elem).attr('id').split("_");
        id = id[1];
        var answer = new Object();
        answer.values = new Array();
        answer.values[0] = new Object();
        if(jQuery(elem).val()!=""){
            answer.values[0].answer = jQuery(elem).val();
            answer.values[0].id_option = 0;
            answer.values[0].id_option_multiple = 0;
            answer.values[0].id_grid_row = 0;
            answer.state = true;
        }else{
            answer.values[0].answer = "";
            answer.values[0].id_option = 0;
            answer.values[0].id_option_multiple = 0;
            answer.values[0].id_grid_row = 0;
            answer.state = false;
        }
        jQuery("#form_data").data (id,answer);
        //now lets check logics
        self.checkQuestionLogics();
        //paintGridColors
        self.paintGridRowsColors();
    };
    
    this.checkSelectAnswers = function(type, elem){
        var self = this;
        var parentId = jQuery(elem).parent().parent().attr('id');
        if(parentId!="div_login_form" && parentId!="div_register_form"){
            var id = jQuery(elem).attr('name').split("_");
            id = id[1];
            
            //it could be a part of other select, as a group, so lets get every select with the same name tag
            var selects = jQuery('select[id^="' + jQuery(elem).attr('name') + '"]');   
            //prepare the answer object
            var answer = new Object();
            answer.values = new Array();        
        
            //now lets verify which select could it be and find the selected Option
            if(self.obtainQuestion(id).subtype && selects.length>0){
    
                jQuery.each(selects, function(){            
                    var option = jQuery(this).attr('id').split("_");
                    var valuePos = answer.values.length;
                    option = option[2];
                    answer.values[valuePos] = new Object();
                    answer.values[valuePos].id_option = option;
                    answer.values[valuePos].id_option_multiple = jQuery(this).val();
                    answer.values[valuePos].id_grid_row = 0;
                    answer.values[valuePos].answer = jQuery('#' + jQuery(this).attr('id') + ' option:selected').text();
                });
                answer.state = true;     
            }else if(selects.length>0){
                var option = selects.attr('id').split("_");
                option = option[1];
                var valuePos = answer.values.length;
                answer.values[valuePos] = new Object();
                answer.values[valuePos].id_option = selects.val();
                answer.values[valuePos].id_option_multiple = 0;
                answer.values[valuePos].id_grid_row = 0;
                //answer.values[valuePos].answer = selects.text();
                answer.values[valuePos].answer = jQuery('#' + jQuery(elem).attr('id') + ' option:selected').text();;
                answer.state = true; 
            }else{
                answer.state = false;
            }
            jQuery("#form_data").data(id,answer);
            //now lets check logics
            self.checkQuestionLogics();
            //check optiosn logics
            self.checkQuestionOptionLogics();
            //paintGridColors
            self.paintGridRowsColors();
    
        }else if(jQuery(elem).attr('id')=="login_button_1"){
            self.loginMobile(elem,jQuery(elem).val()==0);
        }else if(jQuery(elem).attr('id')=="register_button_1"){
            self.registerMobile(elem,jQuery(elem).val()==0);
        }
    }

    this.checkSortable = function(type, element){
        var self = this;
        //prepare the answer object
        var answer = new Object();
        answer.values = new Array();
        var id = jQuery(element).attr('id');
        id = id.split("_");
        id = id[1]; 
        
    
        var optionsSorted = "";
        answer.state = true;
        element.children().each(function (index, child){
            var answerPos = answer.values.length;
            var option = jQuery(this).attr('id').split("_");
            option = option[2];
            answer.values[answerPos] = new Object();
            answer.values[answerPos].id_option = option;
            answer.values[answerPos].id_option_multiple = 0;
            answer.values[answerPos].id_grid_row = 0;
            answer.values[answerPos].answer = jQuery(this).text();
        });
        jQuery("#form_data").data(id,answer);
        //now lets check logics
        self.checkQuestionLogics();
        //check optiosn logics
        self.checkQuestionOptionLogics();
        //paintGridColors
        self.paintGridRowsColors();
    };

    this.associateEvents = function(){
        var self = this;
        jQuery('#' + self.place + ' input:not(.choices)').bind("change",function(){
            self.checkInputAnswers("text", jQuery(this));
        });
        
        //mobile slider event
        jQuery('#' + self.place + ' input.slider').bind("change",function(){
            self.checkInputAnswers("text", jQuery(this));
        });    
            
        jQuery('#' + self.place + ' input:checkbox').bind("change",function() {
            //could be grid or not
            if(jQuery(this).hasClass('grid_checkbox')){
                self.checkInputAnswers("grid_checkbox", jQuery(this));
            }else{
                self.checkInputAnswers("checkbox", jQuery(this));
            }
        });
        
        jQuery('#' + self.place + ' input:radio').bind("change",function() {
            //could be grid or not
            if(jQuery(this).hasClass('grid_radio')){
                self.checkInputAnswers("grid_radio", jQuery(this));
            }else{
                self.checkInputAnswers("radio", jQuery(this));
            }  
            //checkInputAnswers("radio", jQuery(this));
        });
    
        
        jQuery('#' + self.place + ' textarea').bind("change",function() {
            //textareas
            self.checkTextAreaAnswer(jQuery(this));
        });
    
        jQuery('#' + self.place + ' select:not(.ui-slider-switch)').bind("change",function() {
            //dropdowns
            self.checkSelectAnswers('select',jQuery(this));
        });
        
        jQuery('#' + self.place + ' select.ui-slider-switch').bind("change",function() {
            //flip-toggles
            self.checkSelectAnswers('select',jQuery(this));
        });
    
        
        jQuery('#' + self.place + ' .sortable').bind( "sortupdate", function(event, ui) {
            //console.log("STARTING SORTABLE");
            self.checkSortable('sortable',jQuery(this));
        });
        
        jQuery('#' + self.place + ' .sortable').bind('sortstop', function(event, ui){
            //console.log("STOPPING SORTABLE");
            jQuery('#' + (ui.item).attr('id')).css('background-color','transparent');
            jQuery('#' + (ui.item).attr('id')).css('border','0px');    
        });
        
        jQuery('#' + self.place + ' ul.sortable').bind('sortover', function(event, ui){
            //console.log("OVER SORTABLE");
            var widthSortableList = jQuery('#' + (ui.item).attr('id')).parent().height();
            jQuery('#' + (ui.item).attr('id')).css('top',ui.offset.top - parseInt(widthSortableList*1.05));
            jQuery('#' + (ui.item).attr('id')).css('background-color','#EFEDEB'); 
            jQuery('#' + (ui.item).attr('id')).css('border','solid 1px #ED4523');     
        });
        
    };

    this.obtainQuestion = function(questionID){
        var self = this;
        var end = false;
        var index = 0;
        while(!end && index<self.data.questions.length){
            if(self.data.questions[index].id == questionID){
                end = true;
            }else{
                index++;
            }
        }
        return self.data.questions[index];
    };

    this.addCustomRulesMessages = function(){
        var self = this;
        //add custom rules  and messages    
        var rules = new Array();
        var messages = new Array();
    
        //lets first define custom rules
        jQuery.each(self.data.questions,function(index,element){
            if(element.validation_extra){
                rules['question_' + element.id] = new Array();
                rules['question_' + element.id][element.validation] = element.validation_extra;
            }
        });
        
        //now lets define customemessages
        jQuery.each(self.data.validations,function(index,element){
            var questionValidation = self.obtainQuestion(index);
            if(questionValidation.type.toLowerCase()=="grid"){
                for(var i=0;i<=gridQuestions[index].rows.length;i++){
                    messages['grid_' + index + '_row_' + i] = new Array();
                    messages['grid_' + index + '_row_' + i][element.token] = element.text;
                }
            }else{
                messages['question_' + index] = new Array();
                messages['question_' + index][element.token] = element.text;
            }
        });
        
        //lets now define that it has to avoid validation on the non display elements
        var ignores = "";
        var ignores = ":hidden";
    
        //lets obtain the default rules and messages
        var formToValidate;
        var validationRules = new Object();
    
        validationRules = jQuery("#" +  self.place + " #form_page_" + self.activePage +  " form.form").validate();
        jQuery.extend(validationRules.settings,{rules: rules, messages:messages, ignore: ignores});
    };

    this.checkInitialQuestionLogics = function(){
        var self = this;
        jQuery.each(self.data.questionLogics, function (questionId, logics){
            //console.log("LOGICA PARA " + questionId);
            var questionWithLogic = questionId;
            var logicOperand = logics.logic;
            var end = false;
            var show = false;
            //default hide
            var hide = true;
            jQuery.each(logics.logics, function (questionDependsOn, possibleValues){
                if(end){
                    return false;
                }
                var values = jQuery("#form_data").data(questionDependsOn);
                if(logicOperand=="OR"){
                    //OR OPERAND
                    if(values){
                        //console.log("MARK1");
                        //console.log(values);
                    }
                }else{
                    //AND OPERAND
                    if(values){
                        //console.log("MARK2");
                        //console.log(values);
                    }else{
                        //doesn't exist, so no need to keep looking for anything
                        end = true;
                    }
                }
            });
            if(hide){
                //lets hide the question
                jQuery('#div_question_' + questionId).addClass('non_display');
            }else if(show){
                //lets show the question
                jQuery('#div_question_' + questionId).removeClass('non_display');
            }
        });
    };

    this.checkInitialOptionLogics = function(){
        var self = this;
        //console.log(questionOptonLogics);
        if(self.data.questionOptonLogics){
            jQuery.each(self.data.questionOptonLogics, function (questionId, optionsWithLogics){
                //console.log("LOGICA PARA " + questionId);
                var questionWithLogic = questionId;
                //console.log(optionsWithLogics);
                jQuery.each(optionsWithLogics, function (optionId, optionMultiplesWithLogics){
                    //console.log("OPTION ID: " + optionId);
                    var optionWithLogic = optionId;
                    jQuery.each(optionMultiplesWithLogics, function (optionMultipleId, optionMultipleLogics){
                        var logicOperand = optionMultipleLogics.logic;                
                        var multipleOptionWithLogic = optionMultipleId;
                        var end = false;
                        var show = false;
                        //default hide
                        var hide = true;
                        jQuery.each(optionMultipleLogics.logics, function (questionDependenceId, questionDependenceValues){
                            //console.log("QUESTION ID DEPENDENCE: " + questionDependenceId);
                            //console.log(questionDependenceValues);
                            //console.log("===========");
                             
                            var values = jQuery("#form_data").data(questionWithLogic);
                            if(logicOperand=="OR"){
                                //OR OPERAND
                                if(values){
                                    //console.log("MARK1");
                                    //console.log(questionDependenceValues);
                                }
                            }else{
                                //AND OPERAND
                                if(values){
                                    //console.log("MARK2");
                                    //console.log(questionDependenceValues);
                                }else{
                                    //doesn't exist, so no need to keep looking for anything
                                    end = true;
                                }
                            }
                        });
                        if(hide){
                            //lets hide the question
                            //jQuery('#div_question_' + questionId).addClass('non_display');
                            question = self.obtainQuestion(questionWithLogic);
                            if(question.type.toLowerCase()=="dropdown"){
                                if(question.subtype && question.subtype.toLowerCase()=="group"){
                                    //group dropdown
                                    jQuery('#question_' + questionWithLogic + '_' + optionWithLogic + ' option[value="' + multipleOptionWithLogic + '"]').addClass('non_display');
                                }else{
                                    //simple dropdown
                                    jQuery('#question_' + questionWithLogic + ' option[value="' + optionWithLogic + '"]').addClass('non_display');
                                }
                            }else if(question.type.toLowerCase()=="checkbox"){
                                //simple doesn't make sense, in that case the logic should refer to the question
                                if(question.subtype && question.subtype.toLowerCase()=="multiple"){
                                    jQuery('#question_' + questionWithLogic + '_' + optionWithLogic).parent().addClass('non_display');
                                }
                            }else if(question.type.toLowerCase()=="radiobutton"){
                                if(!question.subtype){
                                    jQuery('#question_' + questionWithLogic + '_' + optionWithLogic).parent().addClass('non_display');
                                }
                            }else if(question.type.toLowerCase()=="grid"){
                                /*if(optionMultipleId!=1){
                                    jQuery('#grid_' + questionWithLogic + ' td input#grid_' + questionWithLogic + '_' + optionWithLogic + "_" +   optionMultipleId).parent().addClass('non_display');
                                }else if(optionMultipleId==1){
                                    //both input and row label
                                    jQuery('#grid_' + questionWithLogic + ' td#row_' + optionWithLogic).addClass('non_display');
                                    jQuery('#grid_' + questionWithLogic + ' td input#grid_' + questionWithLogic + '_' + optionWithLogic + "_" +   optionMultipleId).parent().addClass('non_display');
                                    //now error td
                                    jQuery('#grid_' + questionWithLogic + ' td#row_' + optionWithLogic + '_error').addClass('non_display');
                                }*/
                                if(optionMultipleId==1){
                                    //jQuery('#grid_' + questionWithLogic + ' td#row_' + optionWithLogic).parent().addClass('non_display');
                                    var rows = jQuery('#grid_' + questionWithLogic + ' tr');
                                    jQuery(rows[parseInt(optionWithLogic)]).addClass('non_display');
                                }
                            }else if(question.type.toLowerCase()=="sortable"){
                                jQuery('ul#question_' + questionWithLogic + ' li#question_' + questionWithLogic + '_' + optionWithLogic).addClass('non_display');
                            }
                        }else if(show){
                            //lets show the question
                            //jQuery('#div_question_' + questionId).removeClass('non_display');
                        }
                    });
                });
            });
        }
    };
    
    this.checkLogic = function(logicFormula,tuplas){
        var formula = logicFormula[0];
        //now lets look for the existing of tuplas into the formula
        jQuery.each(tuplas, function(index, tupla){
            var tuplaReplace = "(" + tupla.row + "," + tupla.column + ")";
            formula = formula.replace(tuplaReplace,true); 
            
        });
        
        //now the rest of the tuplas to false
        while((pos = formula.indexOf(","))>=0){
            var head = formula.substr(0,pos);
            var tail = formula.substr(pos + 1 ,formula.length);
            
            //head
            var openPos = head.lastIndexOf("(");
            //tail     
            var closePos = tail.indexOf(")");        
            formula = head.substr(0,openPos) + false + tail.substr(closePos + 1);
        }
        //evaluate and return
        return eval(formula);
    };
    
    this.checkValues = function(type, subType, questionValues, possibleValues){
        var match = false;
        if(type.toLowerCase()=="textfield"){
            //console.log("COMPROBANDO TEXTFIELD");
            jQuery.each(possibleValues, function(index, value){
                //console.log(" ===> " + questionValues.values[0].answer + " vs " + value + " <=== ");
                if(questionValues.values[0].answer == value){
                    match = true;
                    return false;
                }
            });
        }else if(type.toLowerCase()=="textarea"){
            //console.log("COMPROBANDO TEXTAREA");
            jQuery.each(possibleValues, function(index, value){
                //console.log(" ===> " + questionValues.values[0].answer + " vs " + value + " <=== ");
                if(questionValues.values[0].answer == value){
                    match = true;
                    return false;
                }
            });
        }else if(type.toLowerCase()=="checkbox"){
            //console.log("COMPROBANDO CHECKBOX");
            //console.log(possibleValues);
            //console.log(questionValues);
            jQuery.each(possibleValues, function(index, value){
                if(questionValues.values.length==0){
                    return false;
                }else{
                    jQuery.each(questionValues.values, function(i, qValue){
                        if(value.indexOf("¬") != -1){
                            if(questionValues.values[i].id_option != value.substr(1)){
                                match = true;
                            }else{
                                match = false;
                                return false;
                            }
                        }else{
                            if(questionValues.values[i].id_option == value){
                                match = true;
                                return false;
                            }
                        }
                    });
                    if(match){
                        return false;
                    }
                }
            });
        }else if(type.toLowerCase()=="radiobutton"){
            //single radiobuttons, means normal radiobuttons question
            /*console.log("COMPROBANDO RADIOBUTTON NORMAL");
            console.log(possibleValues);
            console.log(questionValues);*/
            jQuery.each(possibleValues, function(index, value){
                if(questionValues.values[0].id_option == value){
                    match = true;
                    return false;
                }
            });
        }else if(type.toLowerCase()=="dropdown"){
            if(subType){
                //multiple radiobutton, should be groupRadioButton
                if(subType.toLowerCase()=="group"){
                    /*console.log("COMPROBANDO DROPDOWN AGRUPADO");
                    console.log(possibleValues);
                    console.log(questionValues);*/
                    var tuplas = new Array();
                    var tuplasPos = 0;
                    jQuery.each(questionValues.values, function(index, value){
                        tuplasPos = tuplas.length;
                        tuplas[tuplasPos] = new Object();
                        tuplas[tuplasPos].row = value.id_option;
                        tuplas[tuplasPos].column = value.id_option_multiple;
                    });
                    match = checkLogic(possibleValues,tuplas);
                }
            }else{
                //regular dropdown   
                /*console.log("COMPROBANDO DROPDOWN NORMAL");
                console.log(possibleValues);
                console.log(questionValues);*/
                jQuery.each(possibleValues, function(index, value){
                    if(questionValues.values[0].id_option == value){
                        match = true;
                        return false;
                    }
                });
            }
        }else if(type.toLowerCase()=="grid"){
            if(subType.toLowerCase()=="radiobuttons"){
                //console.log("COMPROBANDO GRID DE RADIOBUTTONS");
            }else if(subType.toLowerCase()=="checkboxes"){
                //console.log("COMPROBANDO GRID DE CHECKBOXES");
            }
            var tuplas = new Array();
            var tuplasPos = 0;
            jQuery.each(questionValues.values, function(index, value){
                tuplasPos = tuplas.length;
                tuplas[tuplasPos] = new Object();
                tuplas[tuplasPos].row = value.id_grid_row;
                tuplas[tuplasPos].column = value.id_option;
            });
            match = this.checkLogic(possibleValues,tuplas);
        }
        return match;   
    };
    
    this.checkQuestionLogics = function(){
        var self = this;
        if(self.data.questionLogics){
            jQuery.each(self.data.questionLogics, function (questionId, logics){
                var questionWithLogic = questionId;
                var logicOperand = logics.logic;
                
                logicsToCheck = 0;
                jQuery.each(logics.logics, function(){
                    logicsToCheck++;
                });
                
                //useful variable
                var end = false;
                var show = false;
                //default hide
                var hide = true;
                //logics check counter
                var logicCounter = 0;
                
                //console.log("LOGICAS DE ESTA PREGUNTA: " + logicsToCheck);
                jQuery.each(logics.logics, function (questionDependsOn, possibleValues){
                    logicCounter++;
                    
                    //lets grab the question's type
                    if(typeof self.obtainQuestion(questionDependsOn) == "undefined"){
                        alert("THE QUESTION " + questionDependsOn + "; HAS A LOGIC REFERING TO QUESTION'S " + questionId + " , WHICH DOESN'T EXIST IN THIS FORM");
                    }
                    
                    questionDependOn = self.obtainQuestion(questionDependsOn);
                    if(typeof questionDependOn != "undefined"){
                        var questionType = questionDependOn.type;
                        var questionSubType = questionDependOn.subtype;
                        
                        //lets grab the values object of the questionDepending On (it will maybe be null)
                        var values;
                        if(!jQuery("#" + self.place + " form.form div#div_question_" + questionDependsOn).hasClass('non_display')){
                            values = jQuery("#form_data").data(questionDependsOn);
                        }
                        if(logicOperand=="OR"){
                            //OR OPERAND
                            //if the values object exist, it could have values that are the ones we are looking for
                            if(values){
                                if(self.checkValues(questionType, questionSubType, values, possibleValues)){
                                    //if they are the same, because OR logic, we have found what we were looking for
                                    if(jQuery('#div_question_' + questionId).hasClass('non_display')){
                                        jQuery('#div_question_' + questionId).removeClass('non_display');                            
                                    }
                                    return false;
                                }else{
                                    //equal, we finished looking
                                    if(logicCounter==logicsToCheck){
                                        if(!jQuery('#div_question_' + questionId).hasClass('non_display')){
                                            jQuery('#div_question_' + questionId).addClass('non_display');
                                        }
                                        //end =true;
                                        return false;
                                    }
                                }
                            }else{
                                //nothing happens, keep looking, but only if there are still logics to check
                                if(logicCounter==logicsToCheck){
                                    if(!jQuery('#div_question_' + questionId).hasClass('non_display')){
                                        jQuery('#div_question_' + questionId).addClass('non_display');
                                    }
                                    return false;
                                }
                            }
                        }else{
                            //AND OPERAND
                            if(values){
                                if(self.checkValues(questionType, questionSubType, values, possibleValues)){
                                    //if they counter is equals to the logics, we finished looking
                                    if(logicCounter==logicsToCheck){
                                        if(jQuery('#div_question_' + questionId).hasClass('non_display')){
                                            jQuery('#div_question_' + questionId).removeClass('non_display');
                                        }
                                        return false;
                                    }
                                }else{
                                    //not need to keep looking
                                    if(!jQuery('#div_question_' + questionId).hasClass('non_display')){
                                        jQuery('#div_question_' + questionId).addClass('non_display');
                                    }
                                    return false;
                                }
                            }else{
                                //doesn't exist, so no need to keep looking for anything
                                if(!jQuery('#div_question_' + questionId).hasClass('non_display')){
                                    jQuery('#div_question_' + questionId).addClass('non_display');
                                }
                                return false;
                            }
                        }
                    }
                });
            });
        }
        if(self.data.form.numerable && self.data.form.numerable==1){
            self.paintQuestionNumbers();
        }
        if(self.data.form.id_pdj_object!=0){
            self.updatePdjHeaderForm();
        }
    };
    
    this.checkQuestionOptionLogics = function(){
        //console.log(questionOptonLogics);
        var self = this;
        if(self.data.questionOptonLogics){
            jQuery.each(self.data.questionOptonLogics, function (questionId, optionsWithLogics){
                //console.log("LOGICA PARA " + questionId);
                var questionWithLogic = questionId;
                //console.log(optionsWithLogics);
                jQuery.each(optionsWithLogics, function (optionId, optionMultiplesWithLogics){
                    //console.log("OPTION ID: " + optionId);
                    var optionWithLogic = optionId;
                    jQuery.each(optionMultiplesWithLogics, function (optionMultipleId, optionMultipleLogics){
                        //console.log("OPTION MULTIPLE ID: " + optionMultipleId);
                        var logicOperand = optionMultipleLogics.logic;                
                        var multipleOptionWithLogic = optionMultipleId;
                        var end = false;
                        var show = false;
                        //default hide
                        var hide = true;
                        //logics check counter
                        var logicCounter = 0;
                        
                        //total logics
                        var logicsToCheck = 0;
                        jQuery.each(optionMultipleLogics.logics, function(){
                            logicsToCheck++;
                        });
                        
                        jQuery.each(optionMultipleLogics.logics, function (questionDependenceId, questionDependenceValues){
                            logicCounter++;
                            
                            //lets grab the question's type
                            if(typeof self.obtainQuestion(questionDependenceId) == "undefined"){
                                alert("THE QUESTION " + questionDependenceId + "; HAS A LOGIC REFERING TO QUESTION'S " + questionId + " , WHICH DOESN'T EXIST IN THIS FORM");
                            }
                            questionDependOn = self.obtainQuestion(questionDependenceId);
                            if(typeof questionDependOn != "undefined"){
                                var questionType = questionDependOn.type;
                                var questionSubType = questionDependOn.subtype;
                                
                                var values;
                                if(!jQuery("#" + self.place + " form.form div#div_question_" + questionDependenceId).hasClass('non_display')){
                                    values = jQuery("#form_data").data(questionDependenceId);
                                }
                                if(logicOperand=="OR"){
                                    //OR OPERAND
                                    if(values){
                                        //console.log(questionDependenceValues);
                                        if(self.checkValues(questionType, questionSubType, values, questionDependenceValues)){
                                            //if they are the same, because OR logic, we have found what we were looking for
                                            show = true;
                                            hide = false;
                                            return false;
                                        }else{
                                            //equal, we finished looking
                                            if(logicCounter==logicsToCheck){
                                                //end =true;
                                                return false;
                                            }
                                        }
                                    }
                                }else{
                                    //AND OPERAND
                                    if(values){
                                        if(self.checkValues(questionType, questionSubType, values, questionDependenceValues)){
                                            //if they counter is equals to the logics, we finished looking
                                            if(logicCounter==logicsToCheck){
                                                show = true;
                                                hide = false;
                                                return false;
                                            }
                                        }else{
                                            //not need to keep looking
                                            return false;
                                        }
                                    }else{
                                        //doesn't exist, so no need to keep looking for anything
                                        return false;
                                    }
                                }
                            }
                        });
                        if(hide){
                            //lets hide the question
                            //jQuery('#div_question_' + questionId).addClass('non_display');
                            question = self.obtainQuestion(questionId);
                            if(question.type.toLowerCase()=="dropdown"){
                                if(question.subtype && question.subtype.toLowerCase()=="group"){
                                    //group dropdown
                                    jQuery('#question_' + questionId + '_' + optionId + ' option[value="' + optionMultipleId + '"]').addClass('non_display');
                                }else{
                                    //simple dropdown
                                    jQuery('#question_' + questionId + ' option[value="' + optionId + '"]').addClass('non_display');
                                }
                            }else if(question.type.toLowerCase()=="checkbox"){
                                //simple doesn't make sense, in that case the logic should refer to the question
                                if(question.subtype && question.subtype.toLowerCase()=="multiple"){
                                    jQuery('#question_' + questionId + '_' + optionId).parent().addClass('non_display');
                                }
                            }else if(question.type.toLowerCase()=="radiobutton"){
                                //simple doesn't make sense, in that case the logic should refer to the question
                                if(!question.subtype){
                                    jQuery('#question_' + questionId + '_' + optionId).parent().addClass('non_display');
                                }
                            }else if(question.type.toLowerCase()=="grid"){
                                /*if(optionMultipleId!=1){
                                    jQuery('#grid_' + questionId + ' td input#grid_' + questionId + '_' + optionId + "_" +   optionMultipleId).parent().addClass('non_display');
                                }else if(optionMultipleId==1){
                                    jQuery('#grid_' + questionId + ' td#row_' + optionId).addClass('non_display');
                                    jQuery('#grid_' + questionId + ' td input#grid_' + questionId + '_' + optionId + "_" +   optionMultipleId).parent().addClass('non_display');
                                    //now error td
                                    jQuery('#grid_' + questionId + ' td#row_' + optionId + '_error').addClass('non_display');
                                }*/
                                if(optionMultipleId==1){
                                    //jQuery('#grid_' + questionWithLogic + ' td#row_' + optionWithLogic).parent().addClass('non_display');
                                    var rows = jQuery('#grid_' + questionWithLogic + ' tr');
                                    jQuery(rows[parseInt(optionWithLogic)]).addClass('non_display');
                                }
                            }else if(question.type.toLowerCase()=="sortable"){
                                jQuery('ul#question_' + questionWithLogic + ' li#question_' + questionWithLogic + '_' + optionWithLogic).addClass('non_display');
                            }
                        }else if(show){
                            //lets show the question
                            question = self.obtainQuestion(questionId);
                            if(question.type.toLowerCase()=="dropdown"){
                                if(question.subtype && question.subtype.toLowerCase()=="group"){
                                    //group dropdown
                                    jQuery('#question_' + questionId + '_' + optionId + ' option[value="' + optionMultipleId + '"]').removeClass('non_display');
                                }else{
                                    //simple dropdown
                                    jQuery('#question_' + questionId + ' option[value="' + optionId + '"]').removeClass('non_display');
                                }
                            }else if(question.type.toLowerCase()=="checkbox"){
                                //simple doesn't make sense, in that case the logic should refer to the question
                                if(question.subtype && question.subtype.toLowerCase()=="multiple"){
                                    jQuery('#question_' + questionId + '_' + optionId).parent().removeClass('non_display');
                                }
                            }else if(question.type.toLowerCase()=="radiobutton"){
                                //simple doesn't make sense, in that case the logic should refer to the question
                                if(!question.subtype){
                                    jQuery('#question_' + questionId + '_' + optionId).parent().removeClass('non_display');
                                }
                            }else if(question.type.toLowerCase()=="grid"){
                                /*if(optionMultipleId!=1){
                                    jQuery('#grid_' + questionId + ' td input#grid_' + questionId + '_' + optionId + "_" +   optionMultipleId).parent().removeClass('non_display');
                                }else if(optionMultipleId==1){
                                    jQuery('#grid_' + questionId + ' td#row_' + optionId).removeClass('non_display');
                                    jQuery('#grid_' + questionId + ' td input#grid_' + questionId + '_' + optionId + "_" +   optionMultipleId).parent().removeClass('non_display');
                                    //now error td
                                    jQuery('#grid_' + questionId + ' td#row_' + optionId + '_error').removeClass('non_display');
                                }*/
                                if(optionMultipleId==1){
                                    //jQuery('#grid_' + questionWithLogic + ' td#row_' + optionWithLogic).parent().removeClass('non_display');
                                    var rows = jQuery('#grid_' + questionWithLogic + ' tr');
                                    jQuery(rows[parseInt(optionWithLogic)]).removeClass('non_display');
                                }
                            }else if(question.type.toLowerCase()=="sortable"){
                                jQuery('ul#question_' + questionWithLogic + ' li#question_' + questionWithLogic + '_' + optionWithLogic).removeClass('non_display');
                            }
                        }
                    });
                });
            });
        }
        if(self.data.form.numerable && self.data.form.numerable==1){
            self.paintQuestionNumbers();
        }
        if(self.data.form.id_pdj_object!=0){
            self.updatePdjHeaderForm();
        }
    };
    
    this.isNoneTrigger = function(id_question, inputChecked){    
        var parentQuestion = jQuery('div#div_question_' + id_question);
        var none_position = parentQuestion.children().length - 2;
        var parentDiv = jQuery(parentQuestion).children()[none_position];
        var isChecked = jQuery(parentDiv).children()[0].checked;    
        var isLastOne = false;
        
        if(jQuery(jQuery(parentDiv).children()[0]).attr('id') == jQuery(inputChecked).attr('id')){
            isLastOne = true;
        }
        
        if(isChecked && isLastOne){
            jQuery.each(parentQuestion.children(), function(index, child){
                if(jQuery(child).hasClass('checkbox_multiple') && index<none_position){
                    var input = jQuery(child).children()[0];
                    jQuery(input).removeAttr("checked");
                }
            });
        }else{
            //nothing need to be done
            jQuery(jQuery(parentDiv).children()[0]).removeAttr('checked');
        }  
        
        //now lets set the answers
        var answer = new Object();
        answer.values = new Array();
        
        var checkboxes = jQuery('input[name="question_' + id_question + '"]:checked');
        if(checkboxes.length>0){
            var checkBoxValues = new Array();
            jQuery.each(checkboxes, function(){
                var option = jQuery(this).attr('id').split("_");                
                option = option[2];
                var valuePos = answer.values.length;
                answer.values[valuePos] = new Object();
                answer.values[valuePos].id_option = option;
                answer.values[valuePos].id_option_multiple = 0;
                answer.values[valuePos].id_grid_row = 0;
                //answer.values[valuePos].answer = "on";
                answer.values[valuePos].answer = jQuery('label[for="' + jQuery(this).attr('id') + '"]').text();
            });
            answer.state = true;
        }else{
            answer.state = false;
            answer.values = new Array();
        }
        
        jQuery("#form_data").data(id_question,answer);
        //now lets check logics
        this.checkQuestionLogics();
        //check optiosn logics
        this.checkQuestionOptionLogics();
        //paintGridColors
        this.paintGridRowsColors();       
    };
    
    this.paintQuestionNumbers = function(){
        questionNumber = 0;
        var divQuestions = jQuery('div[id^="div_question_"]');
        jQuery.each(divQuestions, function(index, div){
            if(!jQuery(div).hasClass('non_display')){
                questionNumber++;
                jQuery('#' + jQuery(div).attr('id') + ' #question_number').html(questionNumber + ".-");
                
            } 
        });
    };

    this.scrollToError = function(){
        var self = this;
        if(!jQuery.browser.msie){
            firstError = jQuery('#' + self.place + ' .error:not(label)')[0];
            jQuery('html, body').animate({
                'scrollTop': (jQuery(firstError).offset().top  - 10)
            }, 1000);
        }else{
            jQuery('html, body').animate({
                "scrollTop": "0"
            }, 1000);
        }
    };
    
    this.scrollToTop = function(){
        jQuery('html, body').animate({
            "scrollTop": "0"
        }, 1000);
    };
    
    this.savePage = function(){ 
        var self = this;
        //before anything, if the form is for registration lets check if the params come ok
        if(self.data.form.id_source==1){
            if(self.activePage==1){
                //first page, previous checks
                if(!self.checkRegistrationParams()){
                    //an error ocurred, the given params are incorrect, reload
                    location.reload();
                }else{
                   //ok, now validate the form
                    if(jQuery('#' + self.place + ' #form_page_' + self.activePage + ' form.form').validate().form()){
                        //now lets save the activePage in case that this is partial_register form
                        if(self.data.form.partial_register==1){
                            self.showLoadingAnimation();
                            //lets verify if the user has already registered (could ocurr an error after registration, so
                            //no need to register the user again)
                            if(self.alreadyRegister){
                                self.saveQuestions(false);
                            }else{
                                self.registerUser();
                            }
                        }else{
                            if(!self.existsNextPage()){
                                //for registration form, not saving until the end, only in the end
                                self.registerUser();
                            }else{
                                //only change page
                                self.goForward();
                            }
                        }
                    }else{
                        //scroll up to the first error div
                        self.scrollToError();
                    }
                }
            }else{
                //not first page, validate the form
                if(jQuery('#' + self.place + ' #form_page_' + self.activePage + ' form.form').validate().form()){
                    //now lets save the activePage, in case that this is partial_register form
                    if(self.data.form.partial_register==1){
                        //now lets save the activePage
                        self.showLoadingAnimation();
                        if(!self.existsNextPage()){
                            //redirect after saving the new questions
                            self.saveQuestions(true);
                        }else{
                            //no redirect after saving the new questions
                            self.saveQuestions(false);
                        } 
                    }else{
                        if(!self.existsNextPage()){
                            //for registration form, not saving until the end, only in the end
                            self.registerUser();
                        }else{
                            //only fgo forward
                            self.goForward();
                        }
                    }
                }else{
                    //scroll up to the first error div
                    self.scrollToError();
                }
            }
        }else{
            //validate the form, regular one, non registration
            if(jQuery('#' + self.place + ' #form_page_' + self.activePage + ' form.form').validate().form()){
                //now lets save the activePage
                if(!self.existsNextPage()){
                    self.showLoadingAnimation();
                    //redirect after saving the questions
                    self.saveQuestions(true); 
                }else if(self.data.form.id_pdj_object!=0 && self.data.form.pdj_max_questions>0 && self.activePage>=self.data.form.pdj_max_questions){
                    self.showLoadingAnimation();
                    //redirect after saving the questions because is pdj type and the activePage is just over the max questions
                    self.saveQuestions(true); 
                }else{
                    self.showLoadingAnimation();
                    //no redirectation after saving the questions
                    self.saveQuestions(false); 
                }       
            }else{
                //scroll up to the first error div
                self.scrollToError();
            }
        }
    };
    
    this.checkRegistrationParams = function(){
        var self = this;
        var found = false;
        var index = 0;
        var panelElement = jQuery('#' + self.place + ' form.form input[id^="' + self.urlVars[index].id + '_"][type="hidden"]');
        while(!found && index<self.urlVars.length){
            if(panelElement.length>0){
                found = true;
            }else{
                index++;
            }
        }
        if(found || panelElement.length==0){
            //it should come with parameters if they are needed, but it can come without parameters also
            if((panelElement.length>0 && found) || panelElement.length==0){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    };
    
    this.registerUser = function(){
        var self = this;
        //validate the form
        if(jQuery('#' + self.place + ' #form_page_' + self.activePage + ' form.form').validate().form()){
            var user;        
    		if(typeof test != 'undefined'){
                if(test && test!=0){       
                	user = "user" + event.timeStamp + "_" + test;      
    		    }
            }else{
                user = "user" + event.timeStamp;
            }
            self.showLoadingAnimation();
            jQuery.ajax({ 
                type: 'POST',
                url: '../apiv2/suser/register',
                dataType: "json",
                data: {name: user, pass: 'pass321!', mail: 'nobody@nowhere.com', status: 1}, 
                success: function(data){
                    //Register correct, logout, save data and redirect
                    self.uid = data.uid;
                    jQuery.ajax({ 
                        type: 'POST',
                        url: '../apiv2/suser/logout',
                        dataType: "json",
                        success: function(data){
                            jQuery.ajax({ 
                                type: 'POST',
                                url: '/questionnaire/obtainusername',
                                dataType: "json",
                                data: {userid: self.uid},
                                success: function(data){
                                    self.username = data;
                                    if(self.data.form.partial_register==1){
                                        self.alreadyRegister = true;
                                        self.saveQuestions(false);  
                                    }else{
                                        //non partial, means the answer are not save until the end, so needs to redirect
                                        //after those answers are saved
                                        self.saveQuestions(true); 
                                    }   
                                }
                            }); 
                        }
                    });    
                              
                },
                error: function(data){
                    //Register incorrect
                    //29/03/2012
                    //window.location = rootPath  + "/user/register";
                    jQuery.ajax({ 
                        type: 'POST',
                        url: '../apiv2/suser/logout',
                        dataType: "json",
                        success: function(data){
                             location.reload();
                        },
                        error: function(data){
                            jQuery.ajax({ 
                            type: 'POST',
                            url: '../apiv2/suser/logout',
                            dataType: "json",
                            success: function(data){
                                    location.reload();
                                },
                                error: function(data){
                                    location.reload();
                                }
                            }); 
                        }
                    }); 
                    location.reload();
                }
            });
        }
    };
    
    
    this.initPdjHeaderForm = function(){
        var headerPdjForm = "<div id='header_pdj'>";
        headerPdjForm += this.pdjObjectText + " (" + this.countQuestionsBehind() + " of " + this.countAllQuestionShown() + ")";
        headerPdjForm += "</div>";
        
        //lets include the header div code now
        jQuery('#' + this.place).prepend(headerPdjForm);
    };

    this.updatePdjHeaderForm = function(){
        var headerPdjForm = this.pdjObjectText + " (" + this.countQuestionsBehind() + " of " + this.countAllQuestionShown() + ")";
    
        //lets include the header div code now
        jQuery('#' + this.place + ' #header_pdj').html(headerPdjForm);
    };
    
    this.showAlert = function(message){
        alert(message);
    };

    this.showLoadingAnimation = function(){
        var self = this;
        //start loading animation
        jQuery('div#loading_div').css('position','absolute');
        jQuery('div#loading_div').css('top','0px');
        jQuery('div#loading_div').css('width',jQuery('#' + self.place + ' #form_page_' + self.activePage).width());
        var height = jQuery('#' + self.place + ' #form_page_' + self.activePage).height() + jQuery('#' + self.place + ' #div_buttons').height();
        jQuery('div#loading_div').css('height',height*1.10);
        jQuery('div#loading_div').css('display','block');
    };

    this.hideLoadingAnimation = function(){
        //stop loading animation
        //jQuery("div#loading_div").Loadingdotdotdot("Stop");
        jQuery("div#loading_div").css('display','none');
    };

    this.initDatePickers = function(){
        //datepicker events
        jQuery(".datepicker" ).datepicker();
    };

    this.initSortables = function(){
         //sortable events
        jQuery(".sortable" ).sortable({
            containment: 'parent'
        });
        
        jQuery(".sortable" ).disableSelection();
    };

    this.initSliders = function(){
        var self = this;
        if(self.sliderQuestions){
            jQuery.each(self.sliderQuestions, function(index, slider){
                if(slider.question.subtype){
                    //range slider
                    jQuery("div#question_" + slider.question.id + "_slider").slider({
                        animate: false,
                        range: true,
                        min: parseInt(slider.options[0].text),
                        max: parseInt(slider.options[1].text),
                        values: [ slider.options[2].text, slider.options[3].text]
                    });
                    
                    //initialize input value
                    jQuery('input#question_' + slider.question.id).val(jQuery("div#question_" + slider.question.id + "_slider").slider('values',0) + 
                        " - " + jQuery("div#question_" + slider.question.id + "_slider").slider('values',1));
                    
                    //trigger events
                    var sliderQuestionId = slider.question.id;
                    jQuery("div#question_" + slider.question.id + "_slider").bind('slide', function(event, ui){
                        jQuery('input#question_' + slider.question.id).val(jQuery("div#question_" + slider.question.id + "_slider").slider('values',0) + 
                        " - " + jQuery("div#question_" + slider.question.id + "_slider").slider('values',1));
                        self.checkInputAnswers("text", jQuery('input#question_' + slider.question.id));
                    });
                }else{
                    //regular slider
                    jQuery("div#question_" + slider.question.id + "_slider").slider({
                        animate: false,
                        min: parseInt(slider.options[0].text),
                        max: parseInt(slider.options[1].text)
                    });
                    
                    //initialize input value
                    jQuery('input#question_' + slider.question.id).val(parseInt(slider.options[0].text));
                    
                    //trigger events
                    var sliderQuestionId = slider.question.id;
                    jQuery("div#question_" + slider.question.id + "_slider").bind('slide', function(event, ui){
                        jQuery('input#question_' + slider.question.id).val(ui.value);
                        self.checkInputAnswers("text", jQuery('input#question_' + slider.question.id));
                    });
                }
            });
        }
    };

    //function that retrieve the data answered and prepare it to be sent
    this.saveQuestions = function(redirect){
        var self = this;
        
        //lets now validate the form  
        var saved = false;
        var answers = new Array();
        var allPageQuestions = jQuery('#' + self.place + ' #form_page_' + self.activePage + ' div[id^="div_question_"]').not('.non_display');
        jQuery.each(allPageQuestions, function(index,element){
            var id = jQuery(element).attr('id').split('div_question_');
            id = id[1];
            var possibleAnswer = jQuery("#form_data").data(id);
            if(possibleAnswer){
                //console.log(possibleAnswer);
                if(possibleAnswer.state){
                    //it's answered, it should be at least
                    var arrayValues = possibleAnswer.values;
                    for(i=0; i<arrayValues.length; i++){
                        var answerPosition = answers.length;
                        answers[answerPosition] = new Object();
                        answers[answerPosition].id_form = self.data.form.id_form;
                        answers[answerPosition].id_question = id;
                        answers[answerPosition].id_option = arrayValues[i].id_option;
                        answers[answerPosition].id_option_multiple = arrayValues[i].id_option_multiple;
                        answers[answerPosition].id_grid_row = arrayValues[i].id_grid_row;
                        answers[answerPosition].answer = arrayValues[i].answer;
                        answers[answerPosition].form_user_id = self.fuid;
                    }
                }
                //jQuery("#form_data").removeData(element.id);
            }else{
                //first check for sortable questions
                var notAnswerQuestion = self.obtainQuestion(id);
                //lets grab the question
                if(notAnswerQuestion.type.toLowerCase()=='sortable'){
                    var questionHTML = jQuery('#' + self.place + ' #form_page_' + self.activePage + ' #div_question_' + id + " ul.sortable").not('.non_display');
                    if(questionHTML){
                        //and its values
                        self.checkSortable('sortable', questionHTML);
                        var possibleAnswer = jQuery("#form_data").data(id);
                        if(possibleAnswer){
                            if(possibleAnswer.state){
                                //it's answered, it should be at least
                                var arrayValues = possibleAnswer.values;
                                for(i=0; i<arrayValues.length; i++){
                                    var answerPosition = answers.length;
                                    answers[answerPosition] = new Object();
                                    answers[answerPosition].id_form = self.data.form.id_form;
                                    answers[answerPosition].id_question = id;
                                    answers[answerPosition].id_option = arrayValues[i].id_option;
                                    answers[answerPosition].id_option_multiple = arrayValues[i].id_option_multiple;
                                    answers[answerPosition].id_grid_row = arrayValues[i].id_grid_row;
                                    answers[answerPosition].answer = arrayValues[i].answer;
                                    answers[answerPosition].form_user_id = self.fuid;
                                }
                            }
                        }
                    }
                }else if(notAnswerQuestion.type.toLowerCase()=='fliptoggleswitch'){
                    //now check for fliptoggleswitch questions
                    var questionHTML = jQuery('#' + self.place + ' #form_page_' + self.activePage + ' #div_question_' + id).not('.non_display');
                    questionHTML = jQuery(questionHTML).children()[1];
                    if(questionHTML){
                        self.checkSelectAnswers('select',jQuery(questionHTML));
                        var possibleAnswer = jQuery("#form_data").data(id);
                        if(possibleAnswer){
                            if(possibleAnswer.state){
                                //it's answered, it should be at least
                                var arrayValues = possibleAnswer.values;
                                for(i=0; i<arrayValues.length; i++){
                                    var answerPosition = answers.length;
                                    answers[answerPosition] = new Object();
                                    answers[answerPosition].id_form = self.data.form.id_form;
                                    answers[answerPosition].id_question = id;
                                    answers[answerPosition].id_option = arrayValues[i].id_option;
                                    answers[answerPosition].id_option_multiple = arrayValues[i].id_option_multiple;
                                    answers[answerPosition].id_grid_row = arrayValues[i].id_grid_row;
                                    answers[answerPosition].answer = arrayValues[i].answer;
                                    answers[answerPosition].form_user_id = self.fuid;
                                }
                            }
                        }
                    }
                }         
            }
            //console.log("======================");
        });
        if(answers.length>0){
            jQuery.post("/questionnaire/set", { formAnswers: answers, userid: self.uid }, function (result) { 
                result = jQuery.parseJSON(result);
                if(result.success){
                    if(redirect){
                        jQuery.post("/questionnaire/done", { nid: self.data.form.nid, userid: self.uid }, function (result) {
                            if(self.data.form.id_pdj_object==0 && self.data.form.id_source!=1){
                                //regular form, not registration and not pdj
                                if(self.data.form.redirect_url && self.data.form.redirect_url!=""){
                                    window.location = "/" + form.redirect_url;
                                }else{
                                    self.showAlert('Missing URL to redirect, redirecting to rootpath');
                                    window.location = rootPath;
                                }
                            }else if(self.data.form.id_pdj_object!=0 && self.data.form.id_source!=1){
                                //PDJ
                                self.hideLoadingAnimation();
                                self.pdjObject.warnNextObject();
                            }else if(self.data.form.id_source==1){
                                //REGISTRATION
                                //qualify if is needed before redirectation
                                if(self.data.form.partial_register==1 && self.data.paginations[self.activePage - 1].qualify==1){
                                    jQuery.post("/questionnaire/qualify", { panelId: self.panelId, page: self.activePage, userid: self.uid}, function (result) {
                                        result = jQuery.parseJSON(result);
                                        jQuery.ajax({ 
                                            type: 'POST',
                                            url: '../apiv2/suser/login',
                                            dataType: "json",
                                            data: {username: self.username, password: 'pass321!'},
                                            success: function(data){
                                            if(result && result!=""){
                                                window.location = result;
                                            }else{
                                                self.showAlert('Missing URL to redirect, redirecting to rootpath');
                                                window.location = rootPath;
                                            }
                                            }
                                        });      
                                    });
                                }else{
                                    //if it hasn't got qualification then redirect according to form attributes
                                    if(self.data.form.redirect_url && self.data.form.redirect_url!=""){
                                        window.location = "/" + form.redirect_url;
                                    }else{
                                        self.showAlert('Missing URL to redirect, redirecting to rootpath');
                                        window.location = rootPath;
                                    }
                                }
                            }   
                        });
                    }else if(self.data.form.id_source!=1){
                        //if no redirect is needed and its a regular form or PDJ, goForward then
                        self.hideLoadingAnimation();
                        self.goForward();
                    }else if(self.data.form.id_source==1){
                        //REGISTRATION
                        //qualify call if the activePage has qualify attribute to 1
                        if(self.data.form.partial_register==1 && self.data.paginations[self.activePage - 1].qualify==1){
                            jQuery.post("/questionnaire/qualify", { panelId: self.panelId, page: self.activePage, userid: self.uid}, function (result) {
                                result=jQuery.parseJSON(result);
                                if(jQuery.trim(result)!=""){
                                    jQuery.ajax({ 
                                        type: 'POST',
                                        url: '../apiv2/suser/login',
                                        dataType: "json",
                                        data: {username: self.username, password: 'pass321!'},
                                        success: function(data){
                                            window.location = result;
                                        }
                                    });
                                }else{
                                    self.hideLoadingAnimation();
                                    self.goForward();
                                }      
                            });
                        }else{
                            self.hideLoadingAnimation();
                            self.goForward();
                        }
                    }   
                }else{
                    //show error with jAlert
                    self.showAlert('An error ocurred, please try again');
                    self.hideLoadingAnimation();
                }
            })
        }else{
            //no questions need to be saved
            if(redirect){
                jQuery.post("/questionnaire/done", { nid: self.data.form.nid, userid: self.data.uid }, function (result) {
                    if(self.data.form.id_pdj_object==0 && self.data.form.id_source!=1){
                        //regular form
                        if(self.data.form.redirect_url && self.data.form.redirect_url!=""){
                            window.location = "/" + self.data.form.redirect_url;
                        }else{
                            window.location = rootPath;
                        }
                    }else if(self.data.form.id_pdj_object!=0 && self.data.form.id_source!=1){
                        //PDJ
                        self.hideLoadingAnimation();
                        self.pdjObject.warnNextObject();
                    }else if(self.data.form.id_source==1){
                        //REGISTRATION
                        //qualify call if the last page has qualify attribute
                        if(self.data.form.partial_register==1 && self.paginations[self.activePage].qualify==1){
                            jQuery.post("/questionnaire/qualify", { panelId: self.panelId, page: self.activePage, userid: self.uid}, function (result) {
                                result=jQuery.parseJSON(result);
                                jQuery.ajax({ 
                                    type: 'POST',
                                    url: '../apiv2/suser/login',
                                    dataType: "json",
                                    data: {username: self.username, password: 'pass321!'},
                                    success: function(data){
                                        if(result && result!=""){
                                            window.location = result;
                                        }else{
                                            self.showAlert('Missing URL to redirect, redirecting to rootpath');
                                            window.location = rootPath;
                                        }
                                    }
                                }); 
                            });
                        }else{
                            //if it hasn't got qualification then redirect according to form attributes
                            if(self.data.form.redirect_url && self.data.form.redirect_url!=""){
                                window.location = "/" + self.data.form.redirect_url;
                            }else{
                                self.showAlert('Missing URL to redirect, redirecting to rootpath');
                                window.location = rootPath;
                            }
                        }
                    }     
                });
            }else if(self.data.form.id_source!=1){
                //if no redirect is needed and its a regular form or PDJ, goForward then
                self.hideLoadingAnimation();
                self.goForward();
            }else if(self.data.form.id_source==1){
                //REGISTRATION
                self.hideLoadingAnimation();
                //qualify call only for certain pages
                if(self.data.form.partial_register==1 && self.paginations[self.activePage - 1].qualify){
                    jQuery.post("/questionnaire/qualify", { panelId: self.panelId, page: self.activePage, userid: self.uid}, function (result) {
                        result=jQuery.parseJSON(result);
                        if(jQuery.trim(result)!=""){
                            jQuery.ajax({ 
                                type: 'POST',
                                url: '../apiv2/suser/login',
                                dataType: "json",
                                data: {username: self.username, password: 'pass321!'},
                                success: function(data){
                                    window.location = result;
                                }
                            });
                        }else{
                            self.hideLoadingAnimation();
                            self.goForward();
                        }      
                    });
                }else{
                    self.hideLoadingAnimation();
                    self.goForward();
                }
            }
        }
    };
}