(function($) {
    $.randomize = function(arr) {
        for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
        return arr;
    };
})(jQuery);

function Form(){
    this.html;
    this.questions;
    this.progressBar = {};
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
                        nid: formData.form.nid,
                        browser: self.browser
                    },
                    success: function(data){
                        self.build(formData);
                    },
                    error: function(data, textStatus, errorThrown){
                        if(!jQuery.browser.msie){
                            console.log(textStatus,data.responseText);
                        }
                        self.showAlert('An error ocurred, please try again');
                    }
                });
            },
            error: function(data, textStatus, errorThrown){
                if(!jQuery.browser.msie){
                    console.log(textStatus,data.responseText);
                }
                self.showAlert('An error ocurred, please try again');
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
                self.build(formData);
            },
            error: function(data, textStatus, errorThrown){
                if(!jQuery.browser.msie){
                    console.log(textStatus,data.responseText);
                }
                self.showAlert('An error ocurred, please try again');
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
                nid: nid,
                browser: self.browser
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
                self.build(data);
            },
            error: function(data, textStatus, errorThrown){
                if(!jQuery.browser.msie){
                    console.log(textStatus,data.responseText);
                }
                self.showAlert('An error ocurred, please try again');
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
        if((!jQuery.browser.msie || (jQuery.browser.msie && jQuery.browser.version>="9.0")) && self.data.form.numerable && self.data.form.numerable==1){
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
            jQuery.post("/questionnaire/registerpanel", {
                vars: self.urlVars, 
                browser: self.browser
            }, function (result) {
                result = jQuery.parseJSON(result);
                if(!jQuery.browser.msie){
                    if(!result.success){
                        console.log("ERROR REGISTERING PARAMS: " + result.error)
                    }
                }
            });
            
            //Now initialize hidden inputs
            var index = 0;
            //panel Id has to be the first hidden var
            var hiddenVars = jQuery('#' + self.place + ' form.form input[type="hidden"]');
            var hiddenVarsCount = hiddenVars.length;
            var count = 0;
            var panelName = "";
            if(hiddenVarsCount>0){
                panelName = jQuery(hiddenVars[0]).attr('id').split("_");
                panelName = panelName[0];
            }
            while(index<self.urlVars.length){
                var panelElement = jQuery('#' + self.place + ' form.form input[id^="' + self.urlVars[index].id + '_"][type="hidden"]');
                if(panelElement.length>0){
                    jQuery(panelElement).val(self.urlVars[index].value);  
                    var varId = jQuery(panelElement).val();
                    if(self.urlVars[index].id==panelName){
                        self.panelId = varId;
                    }
                    var answer = new Object();
                    answer.values = new Array();
                    answer.state = true;
                    answer.values[0] = new Object();
                    answer.values[0].id_option = 0;
                    answer.values[0].id_option_multiple = 0;
                    answer.values[0].id_grid_row = 0;
                    answer.values[0].answer = varId;

                    var questionId = jQuery(panelElement).attr('id').split("_");
                    questionId = questionId[1]
                    jQuery("#form_data").data(questionId,answer); 
                    count++;
                }
                index++;
            }        
            if(count<hiddenVarsCount){
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
        if(self.data.form.id_pdj_object!=0){
            //update pdj header
            self.updatePdjHeaderForm();
        }
        if(self.data.form.progress_bar=="1"){
            self.progressBar.updateBar();
        }
    };
    
    this.goBack = function(){
        var self = this;
        self.previousPage = self.activePage;      
        var moved = false;
        while(!moved && self.activePage>1){
       	    self.activePage--;
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
            radioButtons = jQuery('input[name="' + jQuery(elem).attr('name') + '"]:checked');
            if(radioButtons.length>0){
                if(jQuery("#form_data").data(id)){
                    answer=jQuery("#form_data").data(id);
                }
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
                jQuery.each(checkboxes, function(){
                    var option = jQuery(this).attr('id').split(gridId + "_");
                    option = option[1].split("_");
                    //lets calculate the position
                    var valuePos = 0;
                    valuePos = answer.values.length;
                    answer.values[valuePos] = new Object();
                    answer.values[valuePos].id_option = option[1];
                    answer.values[valuePos].id_option_multiple = 0;
                    answer.values[valuePos].id_grid_row = option[0];
                    //answer.values[valuePos].answer = "on";
                    answer.values[valuePos].answer = jQuery.trim(jQuery('#' + gridId + ' td#column_' + option[1]).text());
                });
                answer.state = true;
            }else{
                answer.state = false;
                answer.values = new Array();
            }
        }else if(type.toLowerCase()=="grid_textfield"){
            id = elem.parent().parent().parent().parent().parent().attr('id');
            gridId = id;
            id = id.split("grid_");
            id = id[1];
            var inputs = jQuery('input[id^="' + gridId + '_"][value!=""]');
            if(inputs.length>0){
                if(jQuery("#form_data").data(id)){
                    answer=jQuery("#form_data").data(id);
                }
                answer = new Object();
                answer.values = new Array();
                jQuery.each(inputs, function(){
                    var idSplit = jQuery(this).attr('id').split(gridId + "_");
                    idSplit = idSplit[1].split("_");
                    //lets calculate the position
                    var valuePos = 0;
                    valuePos = answer.values.length;
                    answer.values[valuePos] = new Object();
                    answer.values[valuePos].id_option = parseInt(idSplit[1]);
                    answer.values[valuePos].id_option_multiple = 0;
                    answer.values[valuePos].id_grid_row = parseInt(idSplit[0]);
                    answer.values[valuePos].answer = jQuery.trim(jQuery(this).val());
                });
                answer.state = true;
            }else{
                answer.state = false;
                answer.values = new Array();
            }
        }
        jQuery("#form_data").data(id,answer);
        //now lets check logics
        self.checkQuestionLogics(id);
        //check optiosn logics
        self.checkQuestionOptionLogics(id);
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
        self.checkQuestionLogics(id);
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
                answer.values[valuePos].answer = jQuery('#' + jQuery(elem).attr('id') + ' option:selected').text();
                answer.state = true; 
            }else{
                answer.state = false;
            }
            jQuery("#form_data").data(id,answer);
            //now lets check logics
            self.checkQuestionLogics(id);
            //check option logics
            self.checkQuestionOptionLogics(id);
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
            if(!jQuery(this).hasClass('non_display')){
                var answerPos = answer.values.length;
                var option = jQuery(this).attr('id').split("_");
                option = option[2];
                answer.values[answerPos] = new Object();
                answer.values[answerPos].id_option = option;
                answer.values[answerPos].id_option_multiple = 0;
                answer.values[answerPos].id_grid_row = 0;
                answer.values[answerPos].answer = jQuery(this).text();
            }
        });
        jQuery("#form_data").data(id,answer);
        //now lets check logics
        self.checkQuestionLogics(id);
        //check optiosn logics
        self.checkQuestionOptionLogics(id);
        //paintGridColors
        self.paintGridRowsColors();
    };
    
    //this method or function first has to check that only one textfield in each of the groups is filled
    // and also do the validation of each of the group elements so the error label stays or goes away correctly
    this.checkUniqueTextfieldGrid = function(textfield_grid_row){
        var gridId = textfield_grid_row.parent().parent().parent().parent().parent().attr('id');
        var questionId = gridId.split("_");
        questionId = questionId[1];        
        var rowId = textfield_grid_row.attr('id').split("_");
        rowId = rowId[2];
        
        var otherTextfieldsRow = jQuery('div#' + this.place + ' table#' + gridId + ' input[id^="' + gridId + '_' + rowId + '_"]');
        jQuery.each(otherTextfieldsRow, function(){
            if(jQuery(this).attr('id')!=textfield_grid_row.attr('id')){
                jQuery(this).val('');
            }
        });
        
        var elementsToValidate = jQuery('#' + this.place + ' #form_page_' + this.activePage + ' form.form table#' + gridId + ' input[id^="' + gridId + '_' + rowId + '_"]');
        var self = this;
        jQuery.each(elementsToValidate, function(){
            jQuery('#' + self.place + ' #form_page_' + self.activePage + ' form.form').validate().element(this);
        });
        
        //once they are empty, except the current textield, trigger the input event
        this.checkInputAnswers("grid_textfield", jQuery(textfield_grid_row));
    };
    
    //this method do the validation of each of the group elements so the error label stays or goes away correctly
    this.checkMultipleTextfieldGrid = function(textfield_grid_row){
        var gridId = textfield_grid_row.parent().parent().parent().parent().parent().attr('id');
        var questionId = gridId.split("_");
        questionId = questionId[1];        
        var rowId = textfield_grid_row.attr('id').split("_");
        rowId = rowId[2];
        
        var elementsToValidate = jQuery('#' + this.place + ' #form_page_' + this.activePage + ' form.form table#' + gridId + ' input[id^="' + gridId + '_' + rowId + '_"]');
        var self = this;
        jQuery.each(elementsToValidate, function(){
            jQuery('#' + self.place + ' #form_page_' + self.activePage + ' form.form').validate().element(this);
        });
        
        //once they are empty, except the current textield, trigger the input event
        this.checkInputAnswers("grid_textfield", jQuery(textfield_grid_row));
    };

    this.associateEvents = function(){
        var self = this;
        jQuery('#' + self.place + ' input:not(.choices, .grid_textfield_unique, .grid_textfield_multiple)').bind("change",function(){
            self.checkInputAnswers("text", jQuery(this));
        });
        
        jQuery('#' + self.place + ' input.grid_textfield_unique').bind("change",function(){
            //grid textfield unique, first other textfields on the same row has to be empty before saving the change
            self.checkUniqueTextfieldGrid(jQuery(this));
        //self.checkInputAnswers("grid_textfield", jQuery(this));
        });
        
        jQuery('#' + self.place + ' input.grid_textfield_multiple').bind("change",function(){
            //grid textfield multiple
            self.checkMultipleTextfieldGrid(jQuery(this));
            //self.checkInputAnswers("grid_textfield", jQuery(this));
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
            //var widthSortableList = jQuery('#' + (ui.item).attr('id')).parent().height();
            //jQuery('#' + (ui.item).attr('id')).css('top',ui.offset.top - parseInt(widthSortableList*1.05));
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
        var groups = new Array();
        
        //lets first define custom rules
        jQuery.each(self.data.questions,function(){
            if(this.validation_extra && (this.type!='grid' || (this.type=='grid' && (this.subtype.toLowerCase()!='textfields_unique' && this.subtype.toLowerCase()!='textfields_multiple')))){
                rules['question_' + this.id] = new Array();
                rules['question_' + this.id][this.validation] = this.validation_extra;
            }
        });
                        
        //now lets define custom messages
        jQuery.each(self.data.validations,function(index, element){
            var questionValidation = self.obtainQuestion(index);
            if(questionValidation.type.toLowerCase()=="grid" && 
                (questionValidation.subtype.toLowerCase()!="textfields_unique" && questionValidation.subtype.toLowerCase()!="textfields_multiple")){
                for(var i=1;i<=self.data.gridQuestions[index].rows.length;i++){
                    messages['grid_' + index + '_row_' + i] = new Array();
                    jQuery.each(element, function(){                            
                        messages['grid_' + index + '_row_' + i][this.token] = this.text;
                    });
                }
            }else if(questionValidation.type.toLowerCase()=="grid" && 
                (questionValidation.subtype.toLowerCase()=="textfields_unique" || questionValidation.subtype.toLowerCase()=="textfields_multiple")){
                for(var i=1;i<=self.data.gridQuestions[index].rows.length;i++){                    
                    messages['grid_' + index + '_row_' + i] = new Array();  
                    //groups['grid_' + index + '_row_' + i] = 'grid_' + index + '_row_' + i;  
                    jQuery.each(element, function(){         
                        messages['grid_' + index + '_row_' + i][this.token] =  this.text;
                    });
                }
            }else{
                messages['question_' + index] = new Array();
                jQuery.each(element, function(){
                    messages['question_' + index][this.token] = this.text;
                });
            }
        });
        
        jQuery.each(self.data.questions, function(){
           if(this.type=="grid" && (this.subtype=="textfields_unique" || this.subtype=="textfields_multiple")){
               for(var i=1;i<=self.data.gridQuestions[this.id].rows.length;i++){   
                   groups['grid_' + this.id + '_row_' + i] = 'grid_' + this.id + '_row_' + i;  
               }
           } 
        });
        
        //lets now define that it has to avoid validation on the non display elements
        var ignores = "";
        ignores = ":hidden";
    
        //lets obtain the default rules and messages
        var validationRules = new Object();

        validationRules = jQuery("#" +  self.place + " #form_page_" + self.activePage +  " form.form").validate();
        jQuery.extend(validationRules.settings,{
            rules: rules, 
            messages:messages, 
            ignore: ignores,
            groups: groups
        });
        //lets extend default groups object and include all the grid_textfields_unique and grid_textfields_multiple
        jQuery.extend(validationRules.groups, groups);
    };

    this.checkInitialQuestionLogics = function(){
        var self = this;
        jQuery.each(self.data.questionLogics, function (questionId, logics){
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
        //console.log(questionOptionLogics);
        if(self.data.questionOptionLogics){
            jQuery.each(self.data.questionOptionLogics, function (questionId, optionsWithLogics){
                var questionWithLogic = questionId;
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
                        //jQuery.each(optionMultipleLogics.logics, function (questionDependenceId, questionDependenceValues){
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
                        //});
                        if(hide){
                            //lets hide the question
                            //jQuery('#div_question_' + questionId).addClass('non_display');
                            var question = self.obtainQuestion(questionWithLogic);
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
    
    this.checkLogic = function(type, subtype, logicFormula,tuplas){
        var formula = logicFormula[0];
        //now lets look for the existing of tuplas into the formula
        jQuery.each(tuplas, function(){
            var tuplaReplace = "(" + this.row + "," + this.column + ")";
            formula = formula.replace(tuplaReplace,true); 

        });

        //now the rest of the tuplas to false
        var pos = 0;
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
            jQuery.each(possibleValues, function(index, value){
                if(questionValues.values[0].answer == value){
                    match = true;
                    return false;
                }
            });
        }else if(type.toLowerCase()=="textarea"){
            jQuery.each(possibleValues, function(index, value){
                if(questionValues.values[0].answer == value){
                    match = true;
                    return false;
                }
            });
        }else if(type.toLowerCase()=="checkbox"){
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
            jQuery.each(possibleValues, function(index, value){
                if(value.indexOf("¬") != -1){
                    if(questionValues.values[0]){
                        if(questionValues.values[0].id_option != value.substr(1)){
                            match = true;
                        }else{
                            match = false;
                            return false;
                        }
                    }
                }else{
                    if(questionValues.values[0]){
                        if(questionValues.values[0].id_option == value){
                            match = true;
                            return false;
                        }
                    }
                }
            });
        }else if(type.toLowerCase()=="dropdown"){
            if(subType){
                //multiple radiobutton, should be groupRadioButton
                if(subType.toLowerCase()=="group"){
                    var tuplas = new Array();
                    var tuplasPos = 0;
                    jQuery.each(questionValues.values, function(index, value){
                        tuplasPos = tuplas.length;
                        tuplas[tuplasPos] = new Object();
                        tuplas[tuplasPos].row = value.id_option;
                        tuplas[tuplasPos].column = value.id_option_multiple;
                    });
                    match = checkLogic(type.toLowerCase(),subType.toLowerCase(),ssibleValues,tuplas);
                }
            }else{
                //regular dropdown   
                jQuery.each(possibleValues, function(index, value){
                    if(questionValues.values[0].id_option == value){
                        match = true;
                        return false;
                    }
                });
            }
        }else if(type.toLowerCase()=="grid"){
            if(subType.toLowerCase()=="radiobuttons" || subType.toLowerCase()=="checkboxes"){
                tuplas = new Array();
                tuplasPos = 0;
                jQuery.each(questionValues.values, function(index, value){
                    tuplasPos = tuplas.length;
                    tuplas[tuplasPos] = new Object();
                    tuplas[tuplasPos].row = value.id_grid_row;
                    tuplas[tuplasPos].column = value.id_option;
                });
                match = this.checkLogic(type.toLowerCase(),subType.toLowerCase(),possibleValues,tuplas);
            }else if(subType.toLowerCase()=="textfields_unique" || subType.toLowerCase()=="textfields_multiple" ){
                var self = this;
                tuplas = new Array();
                tuplasPos = 0;
                jQuery.each(questionValues.values, function(){
                    tuplas = new Array();
                    tuplasPos = 0;
                    jQuery.each(questionValues.values, function(){
                        tuplasPos = tuplas.length;
                        tuplas[tuplasPos] = new Object();
                        tuplas[tuplasPos].row = this.id_grid_row;
                        tuplas[tuplasPos].column = this.id_option;
                    });
                    match = self.checkLogic(type.toLowerCase(),subType.toLowerCase(),possibleValues,tuplas);
                });
            }
        }
        return match;   
    };
    
    this.checkQuestionLogics = function(id_question_check){
        var self = this;
        if(self.data.questionLogics){
            var groupLogics = new Array();
            var questionGroups = new Array();
            var lastGroupId = "undefined";
            var lastQuestionGroupId = "undefined";
            jQuery.each(self.data.questionLogics, function (questionId, logics){
                if(logics.logics[id_question_check]){
                    var show = false;
                    var hide = false;
                    var logicCounter = 0;
                    var logicsToCheck = 0;
                    jQuery.each(logics.logics, function(){
                        //FUTURA FUNCIONALIDAD DE CONDICIONES SOBRE LOS TEXTOS DE LOS GRIDS
                        /*jQuery.each(this, function(){
                            logicsToCheck++;
                        });*/
                        logicsToCheck++;
                    });
                    var logicOperand = logics.logic;
                    jQuery.each(logics.logics, function (questionDependence, possibleValues){
                        logicCounter++;        
                        var questionDependsOn = self.obtainQuestion(questionDependence);
                        //lets grab the question's type
                        if(typeof questionDependsOn == "undefined"){
                            alert("THE QUESTION " + questionDependence + "; HAS A LOGIC REFERING TO QUESTION'S " + questionId + " , WHICH DOESN'T EXIST IN THIS FORM");
                        }else{
                            var questionType = questionDependsOn.type;
                            var questionSubType = questionDependsOn.subtype;
                            //FUTURA FUNCIONALIDAD DE CONDICIONES SOBRE LOS TEXTOS DE LOS GRIDS
                            /*jQuery.each(valuesObject, function(){
                                logicCounter++;*/
                                
                            //lets grab the values object of the questionDepending On (it will maybe be null)
                            var values;
                            if(!jQuery("#" + self.place + " form.form div#div_question_" + questionDependence).hasClass('non_display')){
                                values = jQuery("#form_data").data(questionDependence);
                            }
                            //var possibleValues = this.option_dependence;
                            if(logicOperand=="OR"){
                                //OR OPERAND
                                //if the values object exists, it could have values that are the ones we are looking for
                                if(values){
                                    if(self.checkValues(questionType, questionSubType, values, possibleValues)){
                                        //if they are the same, because OR logic, we have found what we were looking for
                                        show = true;
                                        if(logics.group==0 && self.obtainQuestion(questionId).id_group==0){
                                            if(jQuery('#div_question_' + questionId).hasClass('non_display')){
                                                jQuery('#div_question_' + questionId).removeClass('non_display');                            
                                                self.checkQuestionLogics(questionId);
                                            }
                                        }
                                        return false;
                                    }else{
                                        //equal, we finished looking
                                        if(logicCounter==logicsToCheck){
                                            hide = true;
                                            if(logics.group==0 ){
                                                if(!jQuery('#div_question_' + questionId).hasClass('non_display')){
                                                    jQuery('#div_question_' + questionId).addClass('non_display');
                                                    self.checkQuestionLogics(questionId);
                                                }
                                            }
                                            //end =true;
                                            return false;
                                        }
                                    }
                                }else{
                                    //nothing happens, keep looking, but only if there are still logics to check
                                    if(logicCounter==logicsToCheck){
                                        hide = true;
                                        if(logics.group==0){
                                            if(!jQuery('#div_question_' + questionId).hasClass('non_display')){
                                                jQuery('#div_question_' + questionId).addClass('non_display');
                                                self.checkQuestionLogics(questionId);
                                            }
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
                                            show = true;
                                            if(logics.group==0 && self.obtainQuestion(questionId).id_group==0){
                                                if(jQuery('#div_question_' + questionId).hasClass('non_display')){
                                                    jQuery('#div_question_' + questionId).removeClass('non_display');
                                                    self.checkQuestionLogics(questionId);
                                                }
                                            }
                                            return false;
                                        }
                                    }else{
                                        //not need to keep looking
                                        hide = true;
                                        if(logics.group==0){
                                            if(!jQuery('#div_question_' + questionId).hasClass('non_display')){
                                                jQuery('#div_question_' + questionId).addClass('non_display');
                                                self.checkQuestionLogics(questionId);
                                            }
                                        }
                                        return false;
                                    }
                                }else{
                                    //doesn't exist, so no need to keep looking
                                    hide = true;
                                    if(logics.group==0){
                                        if(!jQuery('#div_question_' + questionId).hasClass('non_display')){
                                            jQuery('#div_question_' + questionId).addClass('non_display');
                                            self.checkQuestionLogics(questionId);
                                        }
                                    }
                                    return false;
                                }
                            }
                        }
                    });
                }
                if(logics.group!=0){
                    //group logic
                    //self.checkQuestionGroupLogic(questionId, logics);  
                    if(typeof lastGroupId == "undefined"){
                        //first element
                        lastGroupId = logics.group;
                        var index = groupLogics.length;
                        groupLogics[index] = new Object();
                        groupLogics[index].id_group = lastGroupId;
                        groupLogics[index].logics = new Array();
                        groupLogics[index].priorities = new Array();
                    }else if(lastGroupId!=logics.group){
                        //new group
                        lastGroupId = logics.group;
                        index = groupLogics.length;
                        groupLogics[index] = new Object();
                        groupLogics[index].id_group = lastGroupId;
                        groupLogics[index].logics = new Array();
                        groupLogics[index].priorities = new Array();
                    }else{
                        //still the same group
                        index = groupLogics.length - 1;
                    }

                    var subIndex = groupLogics[index].logics.length
                    groupLogics[index].logics[subIndex] = new Object();
                    groupLogics[index].logics[subIndex].show = show;
                    groupLogics[index].logics[subIndex].hide = hide;
                    groupLogics[index].logics[subIndex].logic = logics.logic;
                    groupLogics[index].logics[subIndex].priority = logics.priority;
                    groupLogics[index].logics[subIndex].type = logics.type;
                    groupLogics[index].logics[subIndex].questionId = questionId;
                    for(var logic in logics.logics){
                        groupLogics[index].logics[subIndex].dependsOn = logic;
                        groupLogics[index].logics[subIndex].dependsValues = new Array();
                        var auxIndex = 0;
                        jQuery.each(logics.logics, function(i, logic){
                            groupLogics[index].logics[subIndex].dependsValues[auxIndex] = logic;
                            auxIndex++;
                        });
                    }
                    groupLogics[index].logics[subIndex].logics = logics.logics;
                    if(groupLogics[index].logics[subIndex].priority==1){
                        groupLogics[index].priorities[groupLogics[index].priorities.length] = questionId;
                    }
                }
                if(self.obtainQuestion(questionId).id_group!=0){
                    index = 0;
                    var idGroup = self.obtainQuestion(questionId).id_group;
                    if(typeof lastGroupId == "undefined"){
                        //first element                
                        lastQuestionGroupId = idGroup;
                        index = questionGroups.length;
                        questionGroups[index] = new Object;
                        questionGroups[index].id_group = idGroup;
                        questionGroups[index].questions = new Array()
                    }else if(lastQuestionGroupId!=idGroup){
                        //new group
                        lastQuestionGroupId = idGroup;
                        index = questionGroups.length;
                        questionGroups[index] = new Object;
                        questionGroups[index].id_group = idGroup;
                        questionGroups[index].questions = new Array()
                    }else{
                        //still the same group
                        index = questionGroups.length - 1;
                    }
                    subIndex = questionGroups[index].questions.length;
                    questionGroups[index].questions[subIndex] = new Object();
                    questionGroups[index].questions[subIndex].id_question = questionId;
                    questionGroups[index].questions[subIndex].show = show;
                }
            });
            if(self.data.form.numerable && self.data.form.numerable==1){
                self.paintQuestionNumbers();
            }
            if(self.data.form.id_pdj_object!=0){
                self.updatePdjHeaderForm();
            }
            if(groupLogics.length>0){
                jQuery.each(groupLogics, function(index, group){
                    var found = false;
                    var i = 0;
                    while(!found && i<self.data.questionLogicGroups.length){
                        if(self.data.questionLogicGroups[i].id_group == group.id_group){
                            found = true;
                        }else{
                            i++;
                        }
                    }
                    if(found && self.data.questionLogicGroups[i].id_question == id_question_check){
                        self.checkQuestionGroupLogic(group.id_group, group.priorities, group.logics);
                    }
                });
            }
            if(questionGroups.length>0){
                self.checkQuestionGroup(questionGroups);
            }
        }
    };
    
    this.checkQuestionGroup = function(groupQuestions){
        var self = this;
        var index = 0;
        var indexAux = 0;
        var found = false;
        var foundAux = false;
        while(!found && index<self.data.questionGroups.length){
            foundAux = false;
            indexAux = 0;
            
            while(!foundAux && indexAux<groupQuestions.length){
                if(groupQuestions[indexAux].id_group == self.data.questionGroups[index].id_group){
                    found = true;
                    foundAux = true;
                }else{
                    indexAux++;
                }
            }
            
            if(!found){
                index++;
            }
        }
        
        var idQuestionShow = self.data.questionGroups[index].id_question_show;
        var questionsToShow = new Array();
        jQuery.each(groupQuestions[indexAux].questions, function(){
            if(this.show){
                questionsToShow[questionsToShow.length] = this.id_question;
            }
        });
        
        var shown = false;
        index = 0;
        while(!shown && index<questionsToShow.length){
            if(parseInt(questionsToShow[index])==parseInt(idQuestionShow)){
                shown = true;
                if(jQuery('#div_question_' + questionsToShow[index]).hasClass('non_display')){
                    jQuery('#div_question_' + questionsToShow[index]).removeClass('non_display');
                    self.checkQuestionLogics(questionsToShow[index]);
                }
            }else{
                index++;
            }
        }
        if(!shown && questionsToShow.length>0){
            alert("There is something wrong with the conditionals and question grouping");
        }
    }
    
    this.checkQuestionGroupLogic = function(id_group, groupPriorities, groupLogics){
        //callLogicsAgain
        var self = this;
        
        //this function is called then a group logic conditions is detected, one per group
        var showPositiveQuestions = new Array();
        var showNegativeQuestions = new Array();
        var hideQuestions = new Array();

        for(var logic in groupLogics){
            if(groupLogics[logic].show && groupLogics[logic].type==1){
                if(groupLogics[logic].priority==0){
                    showPositiveQuestions.push(groupLogics[logic]);
                }else{
                    showPositiveQuestions.unshift(groupLogics[logic]);
                }

            }else if(groupLogics[logic].show && groupLogics[logic].type==2){
                if(groupLogics[logic].priority==0){
                    showNegativeQuestions.push(groupLogics[logic]);
                }else{
                    showNegativeQuestions.unshift(groupLogics[logic]);
                }
            }else{
                //hide
                hideQuestions.push(groupLogics[logic]);
            }
        }
        //group logic conditions depend on a given number of questions, if those questions
        //are not answer the logic condition don't apply
        
        if(showPositiveQuestions.length>0 || showNegativeQuestions.length>0){
            //number_positive_questions to be shown, the are separated in two groups:
            //positive ones, which type is 1
            //negative ones, which type is 2

            //now lets check if the questions to show need to be randomized
            var found = false;
            var i = 0;
            while(!found && i<self.data.questionLogicGroups.length){
                if(self.data.questionLogicGroups[i].id_group == id_group){
                    found = true;
                }else{
                    i++;
                }
            }
        
            var maxPositive = self.data.questionLogicGroups[i].max_questions_positive;
            var maxNegative = self.data.questionLogicGroups[i].max_questions_negative;
        
            if(self.data.questionLogicGroups[i].random_questions==1){
                //randomize
                //if the question as priority they are not randomized but their position has to be at first positions

                //for positive questions
                found = false;
                i = 0;
                while(!found && i<showPositiveQuestions.length){
                    if(showPositiveQuestions[i].priority==0){
                        found = true;
                    }else{
                        i++;
                    }
                }

                var auxPositivePriority = showPositiveQuestions.slice(0,showPositiveQuestions.length);
                auxPositivePriority = auxPositivePriority.splice(0,i);
                var auxPositiveNonPriority = showPositiveQuestions.slice(0,showPositiveQuestions.length);
                auxPositiveNonPriority = auxPositiveNonPriority.splice(i,auxPositiveNonPriority.length);
                jQuery.randomize(auxPositiveNonPriority);
                showPositiveQuestions = auxPositivePriority.concat(auxPositiveNonPriority);

                //for negative questions
                found = false;
                i = 0;
                while(!found && i<showNegativeQuestions.length){
                    if(showNegativeQuestions[i].priority==0){
                        found = true;
                    }else{
                        i++;
                    }
                }
                var auxNegativePriority = showNegativeQuestions.slice(0,showNegativeQuestions.length);
                auxNegativePriority = auxNegativePriority.splice(0,i);
                var auxNegativeNonPriority = showNegativeQuestions.slice(0,showNegativeQuestions.length);
                auxNegativeNonPriority = auxNegativeNonPriority.splice(i,auxNegativeNonPriority.length);
                jQuery.randomize(auxNegativeNonPriority);
                showNegativeQuestions = auxNegativePriority.concat(auxNegativeNonPriority);
            }
            //show positive questions
            if(showPositiveQuestions.length>(maxPositive-1)){
                //use the maxPositive
                i = 0;
                while(i<maxPositive){
                    if(jQuery('#div_question_' + showPositiveQuestions[i].questionId).hasClass('non_display')){
                        jQuery('#div_question_' + showPositiveQuestions[i].questionId).removeClass('non_display');
                        self.checkQuestionLogics(showPositiveQuestions[i].questionId);
                    }
                    i++;
                }
                while(i<showPositiveQuestions.length){
                    hideQuestions.push(showPositiveQuestions[i]);
                    i++;
                }
            }else{
                //show as many as questions are in showQuestions array
                i = 0;
                while(i<showPositiveQuestions.length){
                    if(jQuery('#div_question_' + showPositiveQuestions[i].questionId).hasClass('non_display')){
                        jQuery('#div_question_' + showPositiveQuestions[i].questionId).removeClass('non_display');
                        self.checkQuestionLogics(showPositiveQuestions[i].questionId);
                    }
                    i++;
                }
            }

            //show negative questions
            if(showNegativeQuestions.length>(maxNegative-1)){
                //use the maxNegative
                i = 0;
                while(i<maxNegative){
                    if(jQuery('#div_question_' + showNegativeQuestions[i].questionId).hasClass('non_display')){
                        jQuery('#div_question_' + showNegativeQuestions[i].questionId).removeClass('non_display');
                        self.checkQuestionLogics(showNegativeQuestions[i].questionId);
                    }
                    i++;
                }
                while(i<showNegativeQuestions.length){
                    hideQuestions.push(showNegativeQuestions[i]);
                    i++;
                }
            }else{
                //hide as many as questions are in hideQuestions array
                i = 0;
                while(i<showNegativeQuestions.length){
                    if(jQuery('#div_question_' + showNegativeQuestions[i].questionId).hasClass('non_display')){
                        jQuery('#div_question_' + showNegativeQuestions[i].questionId).removeClass('non_display');
                        self.checkQuestionLogics(showNegativeQuestions[i].questionId);
                    }
                    i++;
                }
            }

            //hide questions
            i = 0;
            while(i<hideQuestions.length){
                if(!jQuery('#div_question_' + hideQuestions[i].questionId).hasClass('non_display')){
                    jQuery('#div_question_' + hideQuestions[i].questionId).addClass('non_display');
                    self.checkQuestionLogics(hideQuestions[i].questionId);
                }
                i++;
            }
        }
        
        //hide questions
        i = 0;
        while(i<hideQuestions.length){
            if(!jQuery('#div_question_' + hideQuestions[i].questionId).hasClass('non_display')){
                jQuery('#div_question_' + hideQuestions[i].questionId).addClass('non_display');
            }
            i++;
        }
    };
    
    this.checkQuestionOptionLogics = function(id_question_check){
        var self = this;
        if(self.data.questionOptionLogics){
            jQuery.each(self.data.questionOptionLogics, function (questionId, optionsWithLogics){
                var questionWithLogic = questionId;
                jQuery.each(optionsWithLogics, function (optionId, optionMultiplesWithLogics){
                    var hasLogic = false;
                    if(self.obtainQuestion(questionId).type=="grid"){
                        if(optionMultiplesWithLogics[1].logics[id_question_check]){
                            hasLogic = true;
                        }
                    }else{
                        if(optionMultiplesWithLogics[0].logics[id_question_check]){
                            hasLogic = true;
                        }
                    }
                    if(hasLogic){
                        if(!jQuery.browser.msie){
                        //console.log("LA PREGUNTA " + questionId + " DEPENDE DE LA PREGUNTA DE ENTRADA: " + id_question_check);
                        }
                        var optionWithLogic = optionId;
                        jQuery.each(optionMultiplesWithLogics, function (optionMultipleId, optionMultipleLogics){
                            //console.log("OPTION MULTIPLE ID: " + optionMultipleId);
                            var logicOperand = optionMultipleLogics.logic;                
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
                                var questionDependOn = self.obtainQuestion(questionDependenceId);
                                //FUTURA FUNCIONALIDAD DE CONDICIONES SOBRE LOS TEXTOS DE LOS GRIDS
                                //var questionDependenceValues = questionDependenceValuesObject[0].option_dependence;
                                
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
                                var question = self.obtainQuestion(questionId);
                                if(question.type.toLowerCase()=="dropdown"){
                                    if(question.subtype && question.subtype.toLowerCase()=="group"){
                                        //group dropdown
                                        if(!jQuery('#question_' + questionId + '_' + optionId + ' option[value="' + optionMultipleId + '"]').hasClass('non_display')){
                                            jQuery('#question_' + questionId + '_' + optionId + ' option[value="' + optionMultipleId + '"]').addClass('non_display');
                                            self.checkQuestionOptionLogics(questionId);
                                        }
                                    }else{
                                        //simple dropdown
                                        if(!jQuery('#question_' + questionId + ' option[value="' + optionId + '"]').hasClass('non_display')){
                                            jQuery('#question_' + questionId + ' option[value="' + optionId + '"]').addClass('non_display');
                                            self.checkQuestionOptionLogics(questionId);
                                        }
                                    }
                                }else if(question.type.toLowerCase()=="checkbox"){
                                    //simple doesn't make sense, in that case the logic should refer to the question
                                    if(question.subtype && question.subtype.toLowerCase()=="multiple"){
                                        if(!jQuery('#question_' + questionId + '_' + optionId).parent().hasClass('non_display')){
                                            jQuery('#question_' + questionId + '_' + optionId).parent().addClass('non_display');
                                            self.checkQuestionOptionLogics(questionId);
                                        }
                                    }
                                }else if(question.type.toLowerCase()=="radiobutton"){
                                    //simple doesn't make sense, in that case the logic should refer to the question
                                    if(!question.subtype){
                                        if(!jQuery('#question_' + questionId + '_' + optionId).parent().hasClass('non_display')){
                                            jQuery('#question_' + questionId + '_' + optionId).parent().addClass('non_display');
                                            self.checkQuestionOptionLogics(questionId);
                                        }
                                    }
                                }else if(question.type.toLowerCase()=="grid"){
                                    if(optionMultipleId==1){
                                        //jQuery('#grid_' + questionWithLogic + ' td#row_' + optionWithLogic).parent().addClass('non_display');
                                        var row = jQuery('#grid_' + questionWithLogic + ' tr td#row_' + optionWithLogic).parent();
                                        if(!jQuery(row).hasClass('non_display')){
                                            jQuery(row).addClass('non_display');
                                            self.checkQuestionOptionLogics(questionId);
                                        }
                                    }
                                }else if(question.type.toLowerCase()=="sortable"){
                                    if(!jQuery('ul#question_' + questionWithLogic + ' li#question_' + questionWithLogic + '_' + optionWithLogic).hasClass('non_display')){
                                        jQuery('ul#question_' + questionWithLogic + ' li#question_' + questionWithLogic + '_' + optionWithLogic).addClass('non_display');
                                        self.checkQuestionOptionLogics(questionWithLogic);
                                    }
                                }
                            }else if(show){
                                //lets show the question
                                question = self.obtainQuestion(questionId);
                                if(question.type.toLowerCase()=="dropdown"){
                                    if(question.subtype && question.subtype.toLowerCase()=="group"){
                                        //group dropdown
                                        if(jQuery('#question_' + questionId + '_' + optionId + ' option[value="' + optionMultipleId + '"]').hasClass('non_display')){
                                            jQuery('#question_' + questionId + '_' + optionId + ' option[value="' + optionMultipleId + '"]').removeClass('non_display');
                                            self.checkQuestionOptionLogics(questionId);
                                        }
                                    }else{
                                        //simple dropdown
                                        if(jQuery('#question_' + questionId + ' option[value="' + optionId + '"]').hasClass('non_display')){
                                            jQuery('#question_' + questionId + ' option[value="' + optionId + '"]').removeClass('non_display');
                                            self.checkQuestionOptionLogics(questionId);
                                        }
                                    }
                                }else if(question.type.toLowerCase()=="checkbox"){
                                    //simple doesn't make sense, in that case the logic should refer to the question
                                    if(question.subtype && question.subtype.toLowerCase()=="multiple"){
                                        if(jQuery('#question_' + questionId + '_' + optionId).parent().hasClass('non_display')){
                                            jQuery('#question_' + questionId + '_' + optionId).parent().removeClass('non_display');
                                            self.checkQuestionOptionLogics(questionId);
                                        }
                                    }
                                }else if(question.type.toLowerCase()=="radiobutton"){
                                    //simple doesn't make sense, in that case the logic should refer to the question
                                    if(!question.subtype){
                                        if(jQuery('#question_' + questionId + '_' + optionId).parent().hasClass('non_display')){
                                            jQuery('#question_' + questionId + '_' + optionId).parent().removeClass('non_display');
                                            self.checkQuestionOptionLogics(questionId);
                                        }
                                    }
                                }else if(question.type.toLowerCase()=="grid"){
                                    if(optionMultipleId==1){
                                        //jQuery('#grid_' + questionWithLogic + ' td#row_' + optionWithLogic).parent().removeClass('non_display');
                                        var row = jQuery('#grid_' + questionWithLogic + ' tr td#row_' + optionWithLogic).parent();
                                        if(jQuery(row).hasClass('non_display')){
                                            jQuery(row).removeClass('non_display');
                                            self.checkQuestionOptionLogics(questionId);
                                        }
                                    }
                                }else if(question.type.toLowerCase()=="sortable"){
                                    if(jQuery('ul#question_' + questionWithLogic + ' li#question_' + questionWithLogic + '_' + optionWithLogic).hasClass('non_display')){
                                        jQuery('ul#question_' + questionWithLogic + ' li#question_' + questionWithLogic + '_' + optionWithLogic).removeClass('non_display');
                                        self.checkQuestionOptionLogics(questionId);
                                    }
                                }
                            }
                        });
                    }
                });
            });
            
            if(self.data.form.numerable && self.data.form.numerable==1){
                self.paintQuestionNumbers();
            }
            if(self.data.form.id_pdj_object!=0){
                self.updatePdjHeaderForm();
            }
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
        this.checkQuestionLogics(id_question);
        //check optiosn logics
        this.checkQuestionOptionLogics(id_question);
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
        if(!jQuery.browser.msie || (jQuery.browser.msie && jQuery.browser.version=="9.0")){
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
                    /*self.showLoadingAnimation();
                    //redirect after saving the questions because is pdj type and the activePage is just over the max questions
                    self.saveQuestions(true); */
                    if(self.data.form.saving_type==1){
                        self.showLoadingAnimation();
                        //redirect after saving the questions because is pdj type and the activePage is just over the max questions
                        self.saveQuestions(true); 
                    }else if(self.data.form.saving_type==2){
                        self.goForward();
                    }else{
                        //saving_type==3
                        //not implemented yet
                    }
                }else{
                    /*self.showLoadingAnimation();
                    //no redirectation after saving the questions
                    self.saveQuestions(false); */
                    if(self.data.form.saving_type==1){
                        self.showLoadingAnimation();
                        //no redirectation after saving the questions
                        self.saveQuestions(false); 
                    }else if(self.data.form.saving_type==2){
                        self.goForward();
                    }else{
                        //saving_type==3
                        //not implemented yet
                    }
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
                data: {
                    name: user, 
                    pass: 'pass321!', 
                    mail: 'nobody@nowhere.com', 
                    status: 1
                }, 
                success: function(data){
                    //Register correct, insert form_user_id, logout, save data and redirect
                    self.uid = data.uid;
                    jQuery.ajax({
                        type : 'POST',
                        url : '/questionnaire/insertuser',
                        dataType: "json",
                        data : {
                            nid: self.data.form.nid,
                            browser: self.browswer
                        },
                        success: function(data){
                            self.fuid = data.fuid;
                            jQuery.ajax({ 
                                type: 'POST',
                                url: '../apiv2/suser/logout',
                                dataType: "json",
                                success: function(data){
                                    jQuery.ajax({ 
                                        type: 'POST',
                                        url: '/questionnaire/obtainusername',
                                        dataType: "json",
                                        data: {
                                            userid: self.uid
                                        },
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
                        error: function(data, textStatus, errorThrown){
                            if(!jQuery.browser.msie){
                                console.log(textStatus,data.responseText);
                            }
                            self.showAlert('An error ocurred, please try again');
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
        headerPdjForm += this.pdjElementText + " (" + this.countQuestionsBehind() + " of " + this.countAllQuestionShown() + ")";
        headerPdjForm += "</div>";
        
        //lets include the header div code now
        jQuery('#' + this.place).prepend(headerPdjForm);
    };

    this.updatePdjHeaderForm = function(){
        var headerPdjForm = this.pdjElementText + " (" + this.countQuestionsBehind() + " of " + this.countAllQuestionShown() + ")";
    
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
        var allPageQuestions;// = jQuery('#' + self.place + ' #form_page_' + self.activePage + ' div[id^="div_question_"]').not('.non_display');
        if(self.data.form.saving_type==1){
            //only questions current page
            allPageQuestions = jQuery('#' + self.place + ' #form_page_' + self.activePage + ' div[id^="div_question_"]').not('.non_display');
        }else if(self.data.form.saving_type==2){
            //all questions
            allPageQuestions = jQuery('#' + self.place + ' div[id^="div_question_"]').not('.non_display');
        }else{
            //not yet implemented
        }
        jQuery.each(allPageQuestions, function(index,element){
            var id = jQuery(element).attr('id').split('div_question_');
            id = id[1];
            var possibleAnswer = jQuery("#form_data").data(id);
            if(possibleAnswer){
                //console.log(possibleAnswer);
                if(possibleAnswer.state){
                    //it's answered, it should be at least
                    var arrayValues = possibleAnswer.values;
                    for(var i=0; i<arrayValues.length; i++){
                        var answerPosition = answers.length;
                        answers[answerPosition] = new Object();
                        answers[answerPosition].id_form = self.data.form.id_form;
                        answers[answerPosition].id_question = id;
                        answers[answerPosition].id_option = arrayValues[i].id_option;
                        answers[answerPosition].id_option_multiple = arrayValues[i].id_option_multiple;
                        answers[answerPosition].id_grid_row = arrayValues[i].id_grid_row;
                        answers[answerPosition].answer = arrayValues[i].answer;
                        answers[answerPosition].form_user_id = self.fuid;
                        answers[answerPosition].id_page = self.activePage;
                    }
                }
            //jQuery("#form_data").removeData(element.id);
            }else{
                //first check for sortable questions
                var notAnswerQuestion = self.obtainQuestion(id);
                //lets grab the question
                if(notAnswerQuestion.type.toLowerCase()=='sortable'){
                    //var questionHTML = jQuery('#' + self.place + ' #form_page_' + self.activePage + ' #div_question_' + id + " ul.sortable").not('.non_display');
                    var questionHTML;
                    if(self.data.form.saving_type==1){
                        questionHTML = jQuery('#' + self.place + ' #form_page_' + self.activePage + ' #div_question_' + id + " ul.sortable").not('.non_display');
                    }else if(self.data.form.saving_type==2){
                        questionHTML = jQuery('#' + self.place + ' #div_question_' + id + " ul.sortable").not('.non_display');
                    }else{
                        //not yet implemented
                    }
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
                                    answers[answerPosition].id_page = self.activePage;
                                }
                            }
                        }
                    }
                }else if(notAnswerQuestion.type.toLowerCase()=='fliptoggleswitch'){
                    //now check for fliptoggleswitch questions
                    //var questionHTML = jQuery('#' + self.place + ' #form_page_' + self.activePage + ' #div_question_' + id).not('.non_display');
                    questionHTML;
                    if(self.data.form.saving_type==1){
                        questionHTML = jQuery('#' + self.place + ' #form_page_' + self.activePage + ' #div_question_' + id).not('.non_display');
                    }else if(self.data.form.saving_type==2){
                        questionHTML = jQuery('#' + self.place + ' #div_question_' + id).not('.non_display');
                    }else{
                        //not yet implemented
                    }
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
                                    answers[answerPosition].id_page = self.activePage;
                                }
                            }
                        }
                    }
                }         
            }
        //console.log("======================");
        });
        if(answers.length>0){
            jQuery.post("/questionnaire/set", {
                formAnswers: answers, 
                pageId: self.activePage,
                formUserId: self.fuid,
                formId: self.data.form.id_form,
                restartable: self.data.form.restartable,
                userid: self.uid
            }, function (result) { 
                result = jQuery.parseJSON(result);
                if(result.success){
                    if(redirect){
                        jQuery.post("/questionnaire/done", {
                            nid: self.data.form.nid, 
                            userid: self.uid
                        }, function (result) {
                            if(self.data.form.id_pdj_object==0 && self.data.form.id_source!=1){
                                //regular form, not registration and not pdj
                                if(self.data.form.redirect_url && self.data.form.redirect_url!=""){
                                    window.location = "/" + self.data.form.redirect_url;
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
                                    jQuery.post("/questionnaire/qualify", {
                                        panelId: self.panelId, 
                                        page: self.activePage, 
                                        userid: self.uid
                                        }, function (result) {
                                        result = jQuery.parseJSON(result);
                                        jQuery.ajax({ 
                                            type: 'POST',
                                            url: '../apiv2/suser/login',
                                            dataType: "json",
                                            data: {
                                                username: self.username, 
                                                password: 'pass321!'
                                            },
                                            success: function(data){
                                                if(result && result!=""){
                                                    window.location = result;
                                                }else{
                                                    self.showAlert('Missing URL to redirect, redirecting to rootPath');
                                                    window.location = rootPath;
                                                }
                                            }
                                        });      
                                    });
                                }else{
                                    jQuery.ajax({ 
                                        type: 'POST',
                                        url: '../apiv2/suser/login',
                                        dataType: "json",
                                        data: {
                                            username: self.username, 
                                            password: 'pass321!'
                                        },
                                        success: function(data){
                                            if(result && result!=""){
                                                window.location = "/" + self.data.form.redirect_url;
                                            }else{
                                                self.showAlert('Missing URL to redirect, redirecting to rootPath');
                                                window.location = rootPath;
                                            }
                                        }
                                    }); 
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
                            jQuery.post("/questionnaire/qualify", {
                                panelId: self.panelId, 
                                page: self.activePage, 
                                userid: self.uid
                                }, function (result) {
                                result=jQuery.parseJSON(result);
                                if(jQuery.trim(result)!=""){
                                    jQuery.ajax({ 
                                        type: 'POST',
                                        url: '../apiv2/suser/login',
                                        dataType: "json",
                                        data: {
                                            username: self.username, 
                                            password: 'pass321!'
                                        },
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
                jQuery.post("/questionnaire/done", {
                    nid: self.data.form.nid, 
                    userid: self.data.uid
                }, function (result) {
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
                        console.log(self.activePage);
                        console.log(self.data.pagination);
                        if(self.data.form.partial_register==1 && self.data.paginations[self.activePage - 1].qualify==1){
                            jQuery.post("/questionnaire/qualify", {
                                panelId: self.panelId, 
                                page: self.activePage, 
                                userid: self.uid
                                }, function (result) {
                                result=jQuery.parseJSON(result);
                                jQuery.ajax({ 
                                    type: 'POST',
                                    url: '../apiv2/suser/login',
                                    dataType: "json",
                                    data: {
                                        username: self.username, 
                                        password: 'pass321!'
                                    },
                                    success: function(data){
                                        if(result && result!=""){
                                            window.location = result;
                                        }else{
                                            self.showAlert('Missing URL to redirect, redirecting to rootPath');
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
                                self.showAlert('Missing URL to redirect, redirecting to rootPath');
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
                //qualify call only for certain pages
                if(self.data.form.partial_register==1 && self.data.paginations[self.activePage - 1].qualify==1){
                    jQuery.post("/questionnaire/qualify", {
                        panelId: self.panelId, 
                        page: self.activePage, 
                        userid: self.uid
                        }, function (result) {
                        result=jQuery.parseJSON(result);
                        if(jQuery.trim(result)!=""){
                            jQuery.ajax({ 
                                type: 'POST',
                                url: '../apiv2/suser/login',
                                dataType: "json",
                                data: {
                                    username: self.username, 
                                    password: 'pass321!'
                                },
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