/***

    formElements v0.1
    a javascript script to paint native jquery mobile form elements

    Build Friday, 25 Noviembre 2011

    Copyright (c) 2011 Luis Rodriguez <luis.rs1983@gmail.com> and contributors.

    Build script by Luis Rodriguez <luis.rs1983@gmail.com>

***/ 

function Question(formData, questionData, questionOptions, gridQuestionOptions){
    //methods
    this.form = formData;
    this.question = questionData;
    this.options;
    this.gridOptions;
    
    if(typeof questionOptions != "undefined"){
        this.options = questionOptions;
    }
    
    if(typeof gridQuestionOptions != "undefined"){
        this.gridOptions = gridQuestionOptions;
    }
    
    this.paintQuestion = function(){
        //Now lets paint the type of question, depending if it has multiple options or not
        if(this.questions.multiple==1){
        	//questions with multiple options or a question grid            	
        	if(this.options && this.options[this.question.id]){
        		//it is a multipleChoice question
                this.form.html += this.paintMultipleQuestion();
                //for sliders
        		if(this.question.type.toLowerCase()=="slider"){
                    var sliderCount = this.form.sliderQuestions.length;
      		        this.form.sliderQuestions[sliderCount] = new Object();
                    this.form.sliderQuestions[sliderCount].question  = this.question;
                    this.form.sliderQuestions[sliderCount].options = this.options;
        		}          	
            }else if(this.form.gridQuestions[this.question.id]){
            	this.form.html += this.paintGridQuestion();
            }
        }else if(this.question.type!="nothing"){
        	//NON multiple options questions
        	this.form.html += this.paintSingleQuestion();
        }  
    };
    
    this.paintSingleQuestion = function(){
        //first thing to do is to identify the type of question
        if(this.question.type.toLowerCase()=="textfield"){
            //textfield type
            if(!this.question.subtype || (this.question.subtype && this.question.subtype!="hidden")){
                return this.textField();
            }else{
                return this.textFieldHidden();
            }
        }else if(this.question.type.toLowerCase()=="textarea"){
            //textarea type
            return this.textArea();
        }else if(this.question.type.toLowerCase()=="label"){
            //only label question
            if(this.question.subtype && this.question.subtype.toLowerCase()=="markup"){
                return this.markup(); 
            }else{
                return this.label();   
            }
        }else if(this.question.type.toLowerCase()=="datepicker"){
            //datepicker type
            return this.datePicker();
        }else if(this.question.type.toLowerCase()=='checkbox'){
            //regular checkbox question
            return this.checkBox();
        }else{
            if(this.question.subtype){
                alert("QUESTION " + this.question.id + " WITH TYPE: " + this.question.type + " AND SUBTYPE: " + this.question.subtype + " IS UNKNOWN");
            }else{
                alert("QUESTION " + this.question.id + " WITH TYPE: " + this.question.type + " IS UNKNOWN");
            }
        }
    };
    
    //this function injects jquery mobile code for multiple question
    this.paintMultipleQuestion = function(){
        if(this.question.type.toLowerCase()=="checkbox"){
            //checkbox
            return this.checkBoxMultiple();
        }else if(this.question.type.toLowerCase()=="radiobutton"){
            //checkbox
            return this.radioButton();
        }else if(this.question.type.toLowerCase()=="dropdown"){
            //dropdown
            if(!this.question.subtype){
                //regular dropdown
                return this.dropDown();
            }else if(this.question.subtype.toLowerCase()=="group"){
                //grouped dropdown
                return this.groupDropDown();
            }
        }else if(this.question.type.toLowerCase()=="sortable"){
            //sortable question
            return this.sortableQuestion();
        }else if(this.question.type.toLowerCase()=='slider'){
            //regular or range slider question
            return this.slider();
        }else{
            if(this.question.subtype){
                alert("QUESTION " + this.question.id + " WITH TYPE: " + this.question.type + " AND SUBTYPE: " + this.question.subtype + " IS UNKNOWN");
            }else{
                alert("QUESTION " + this.question.id + " WITH TYPE: " + this.question.type + " IS UNKNOWN");
            }
        }
    };
        
    this.textField = function(){
        var code = "<div id='div_question_" + this.question.id + "' class='question'>";
        
        //It may have a small description too
        if(this.question.description){
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label>';
            code += '<label for="question_' + this.question.id + '" class="question_description">' + this.question.description + '</label></div>';
        }else{
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label></div>';
        }
        
        //and then the textfield, including the validations
        var questionClass = "active";
        if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
        if(this.question.maxlength){
            code += '<input type="' + this.question.subtype + '" name="question_' + this.question.id + '" id="question_' + this.question.id + '" maxlength="' + this.question.maxlength + '" class="' + questionClass + '" />';
        }else{
            code += '<input type="' + this.question.subtype + '" name="question_' + this.question.id + '" id="question_' + this.question.id + '" class="' + questionClass + '" />';
        }
    
        //Now lets paint the label for the possible error
        code += '<label for="question_' + this.question.id + '" generated="true" class="error" style="display: none;" ></label>';
        
        //close div of question and return the html code
        return code += "</div>";
    };
    
    this.textFieldHidden = function(){
        var code = "<div id='div_question_" + this.question.id + "' class='question'>";
        
        //and then the textfield hidden, excluding the validations
        code += '<input type="hidden" name="' + jQuery.trim(this.question.text) + '_' + this.question.id + '" id="' + jQuery.trim(this.question.text) + '_' + this.question.id + '" />';
    
        //close div of question and return the html code
        return code += "</div>";
    };
    
    this.label = function(){
        var code = "<div id='div_question_" + this.question.id + "' class='label question'>";
        
        //It may have a small description too
        if(this.question.description){
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label>';
            code += '<label for="question_' + this.question.id + '" class="question_description">' + this.question.description + '</label></div>';
        }else{
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label></div>';
        }
        
        //close div of question and return the html code
        return code += "</div>";
    };
    
    this.markup = function(){
        var code = "<div id='div_question_" + this.question.id + "' class='markup question'>";
        
        //It may have a small description too
        if(this.question.description){
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label>';
            code += '<label for="question_' + this.question.id + '" class="question_description">' + this.question.description + '</label></div>';
        }else{
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label></div>';
        }
        
        //close div of question and return the html code
        return code += "</div>";
    };
    
    this.textArea = function(){
        var code = "<div id='div_question_" + this.question.id + "' class='question'>";
        
        //It may have a small description too
        if(this.question.description){
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label>';
            code += '<label for="question_' + this.question.id + '" class="question_description">' + this.question.description + '</label></div>';
        }else{
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label></div>';
        }
        
        //and then the textfield, including the validations
        var questionClass = "active";
        if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
            
        if(this.question.maxlength){
            code += '<textarea name="question_' + this.question.id + '" id="question_' + this.question.id + '" maxlength="' + this.question.maxlength + '" class="' + questionClass + '"/></textarea>';
        }else{
            code += '<textarea name="question_' + this.question.id + '" id="question_' + this.question.id + '" class="' + questionClass + '"/></textarea>';
        }
        
        //Now lets paint the label for the possible error
        code += '<label for="question_' + this.question.id + '" generated="true" class="error" style="display: none;" ></label>';
        
        //close div of question and return the html code
        return code += "</div>";
    };
    
    this.datePicker = function(){
        var code = "<div id='div_question_" + this.question.id + "' class='question'>";
        
        //It may have a small description too
        if(this.question.description){
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label>';
            code += '<label for="question_' + this.question.id + '" class="question_description">' + this.question.description + '</label></div>';
        }else{
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label></div>';
        }
        
        //and then the textfield, including the validations
        var questionClass = "active datepicker";
        if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
        code += '<table class="date_picker_table"><tr><td class="datepicker_input" valign="middle"><input type="date" name="question_' + this.question.id + '" id="question_' + this.question.id + '" class="' + questionClass + '" /></td><td class="datepicker_calendar" valign="middle"><img width="35" height="35" src="' + path + '/images/calendar.png" alt="calendar image" class="datepicker" /></td></tr></table>';
    
    
        //Now lets paint the label for the possible error
        code += '<label for="question_' + this.question.id + '" generated="true" class="error" style="display: none;" ></label>';
        
        //close div of question and return the html code
        return code += "</div>";
    };
    
    //function that paints Checkbox single questions
    this.checkBox = function(){
        var code = "<div id='div_question_" + this.question.id + "' class='question'>";
    
        //and then the textfield, including the validations
        var questionClass = "active choices";
        if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
        
        //It may have a small description too
        if(this.question.description){
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label>';
            code += '<label for="question_' + this.question.id + '" class="question_description">' + this.question.description + '</label></div>';
            //code for the checkbox    
            code += '<input type="checkbox" name="question_' + this.question.id + '" id="question_' + this.question.id + '" class="' + questionClass + '"/>';   
        }else{
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label></div>';
            //code for the checkbox    
            code += '<input type="checkbox" name="question_' + this.question.id + '" id="question_' + this.question.id + '" class="' + questionClass + '"/>';   
        }
        
        
        //Now lets paint the label for the possible error
        code += '<label for="question_' + this.question.id + '" generated="true" class="error" style="display: none;" ></label>';
        
        return code += "</div>";
    };
    
    //function that paints Checkbox questions
    this.checkBoxMultiple = function(){
        var code = "<div id='div_question_" + this.question.id + "' class='question'>";
        
        //It may have a small description too
        if(this.question.description){
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label>';
            code += '<label for="question_' + this.question.id + '" class="question_description">' + this.question.description + '</label></div>';
        }else{
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label></div>';
        }
    
        //and then the textfield, including the validations
        var questionClass = "active choices";
        if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
    
        
        //code for the checkbox, loop over the choices
        var has_none = false;    
        for(i=0;i<this.options.length;i++){
            if(this.options[i].image==1 && this.options[i].text_exists==1){
                //got image and label
                code += '<div class="checkbox_multiple_image"><input type="checkbox" name="question_' + this.question.id + '" id="question_' + this.question.id + '_' + this.options[i].id_option + '" class="' + questionClass + '"/>';   
                code += '<label for="question_' + this.question.id + '_' + this.options[i].id_option + '"><img src="' + rootPath + "/" + this.options[i].image_path + '" alt="image option ' + (i+1) + '" style="float: left"/>' + this.options[i].text + '</label>';
            }else if(this.options[i].text_exists==1){
                //Not image, only label
                code += '<div class="checkbox_multiple"><input type="checkbox" name="question_' + this.question.id + '" id="question_' + this.question.id + '_' + this.options[i].id_option + '" class="' + questionClass + '"/>';   
                code += '<label for="question_' + this.question.id + '_' + this.options[i].id_option + '">' + this.options[i].text + '</label>';
            }else if(this.options[i].image==1){
                //only image
                code += '<div class="checkbox_multiple_image"><input type="checkbox" name="question_' + this.question.id + '" id="question_' + this.question.id + '_' + this.options[i].id_option + '" class="' + questionClass + '"/>';   
                code += '<label for="question_' + this.question.id + '_' + this.options[i].id_option + '"><img src="' + rootPath + "/" + this.options[i].image_path + '" alt="image option ' + (i+1) + '" style="float: left"/></label>';
            }
            code += "</div>";
            
            //now lets check if the option is none of the above type
            if(this.options[i].is_none==1){
                has_none = true;            
            }
        }      
    
        if(has_none){
            //bind the event   
            var self = this;     
            jQuery('input[name=question_' + self.question.id + ']').unbind('change');
            jQuery('input[name=question_' + self.question.id + ']').live('change', function(){
                self.form.isNoneTrigger(self.question.id, this);
            });
        }
        
        //Now lets paint the label for the possible error
        code += '<label for="question_' + this.question.id + '" generated="true" class="error" style="display: none;" ></label>';
        
        return code += "</div>";
    };

    //function that paints radioButton questions
    this.radioButton = function(){  
        var code = "<div id='div_question_" + this.question.id + "' class='question'>";
        
        //It may have a small description too
        if(this.question.description){
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label>';
            code += '<label for="question_' + this.question.id + '" class="question_description">' + this.question.description + '</label></div>';
        }else{
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label></div>';
        }
        
        //and then the textfield, including the validations
        var questionClass = "active choices";
        if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
        
        //code for the checkbox, loop over the choices
        for(i=0;i<this.options.length;i++){
            if(this.options[i].image==1){
                code += '<div class="radiobutton_multiple"><div id="radio_image">';
            }else{
                code += '<div class="radiobutton_multiple"><div id="radio_text">';
            }                        
            code += '<input type="radio" name="question_' + this.question.id + '" id="question_' + this.question.id + '_' + this.options[i].id_option + '" value="' + this.options[i].text + '"class="' + questionClass + '"/>';   
            //code += '<label for="question_' + this.question.id + '_' + this.options[i].id_option + '">' + this.options[i].text + '</label>';
            if(this.options[i].image==1 && this.options[i].text_exists==1){
                code += '<label for="question_' + this.question.id + '_' + this.options[i].id_option + '"><img src="' + rootPath + "/" + this.options[i].image_path + '" alt="image option ' + (i+1) + '" style="float: left;"/>' + this.options[i].text + '</label>';
            }else if(this.options[i].image==1){
                code += '<label for="question_' + this.question.id + '_' + this.options[i].id_option + '"><img src="' + rootPath + "/" + this.options[i].image_path + '" alt="image option ' + (i+1) + '" style="float: left;"/></option></label>';
            }else if(this.options[i].text_exists==1){
                code += '<label for="question_' + this.question.id + '_' + this.options[i].id_option + '">' + this.options[i].text + '</label>';
            }
            //close div radio
            code += '</div></div>';          
        }        
        
        //Now lets paint the label for the possible error
        code += '<label for="question_' + this.question.id + '" generated="true" class="error" style="display: none;" ></label>';
        
        //finally return the html code
        return code += "</div>";
    };

    //function that paints dropDown questions
    this.dropDown = function(){
     
        var code = "<div id='div_question_" + this.question.id + "' class='question'>";
        
        if(this.question.description){
            //question text
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label>';
            //question description
            code += '<label for="question_' + this.question.id + '" class="question_description">' + this.question.description + '</label></div>';
        }else{  
            //question text
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label></div>'
        }
        
        //and including the validations
        var questionClass = "active choices";
        if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
    
        code += '<select name="question_' + this.question.id + '" id="question_' + this.question.id + '" class="' + questionClass + '">';
        //the options
        for(i=0;i<this.options.length;i++){
            if(this.options[i].image==1 && this.options[i].text_exists==1){
                code += '<option value="' + this.options[i].id_option + '"><img src="' + rootPath + "/" + this.options[i].image_path + '" alt="image option ' + this.options[i].id_option + '" style="float: left"/>' + this.options[i].text + '</option>';
            }else if(this.options[i].image==1){
                code += '<option value="' + this.options[i].id_option + '"><img src="' + rootPath + "/" + this.options[i].image_path + '" alt="image option ' + this.options[i].id_option + '" style="float: left"/></option>';
            }else if(this.options[i].text_exists==1){
                code += '<option value="' + this.options[i].id_option + '">' + this.options[i].text + '</option>';
            }
        }
    
        //closing select
        code += '</select>';
    
        
        //Now lets paint the label for the possible error
        code += '<label for="question_' + this.question.id + '" generated="true" class="error" style="display: none;" ></label>'; 
        
        //div of question and the div for the fieldcontain, finally return the html code
        return code += "</div>";
    };
    
    this.groupDropDown = function(){
        var choices = this.formatChoices();    
        
        var code = "<div id='div_question_" + this.question.id + "' class='question'>";
        
        if(question.description){
            //question text
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label>';
            //question description
            code += '<label for="question_' + this.question.id + '" class="question_description">' + this.question.description + '</label></div>';
        }else{  
            //question text
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label></div>'
        }
        
        //and including the validations
        var questionClass = "active choices";
        if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
        
        
        //the options
        for(i=0;i<choices.length;i++){
            code += '<select name="question_' + this.question.id + '" id="question_' + this.question.id + '_' + choices[i].id_option + '" class="' + questionClass + '" >';
            //now for each group lets loop over their options
            for(j=0;j<choices[i].options_multiple.length;j++){
                code += '<option value="' + choices[i].options_multiple[j].id_option_multiple + '">' + choices[i].options_multiple[j].text + '</option>';
                //code += '<option value="' + choices[i].options_multiple[j].id_option_multiple + '"><span><label for="checkbox_' + choices[i].id_option + '_' + choices[i].options_multiple[j].id_option_multiple + '">' + choices[i].options_multiple[j].text + '</label><input type="checkbox" id="checkbox_' + choices[i].id_option + '_' + choices[i].options_multiple[j].id_option_multiple + '"/></span></option>';
            }
            //closing select
            code += '</select>';
        }
        
        //Now lets paint the label for the possible error
        code += '<label for="question_' + this.question.id + '" generated="true" class="error" style="display: none;" ></label>'; 
        
        //div of question and the div for the fieldcontain, finally return the html code
        return code += "</div>";
    };

    //function that formats given choices into a proper formatted array 
    this.formatChoices = function(){
        var choices = this.options;
        var lastOption = choices[0].id_option;
        var result = new Array();
        result[0] = new Object;
        result[0].id_option = choices[0].id_option;
        result[0].options_multiple = new Array();
        indexArray = -1;
        indexMultiple = 0;
        var indexArray = 0;
        jQuery.each(choices, function(index, choice){
            if(lastOption != choice.id_option){
                lastOption = choice.id_option;
                indexArray++;
                indexMultiple = 0;
                result[indexArray] = new Object;
                result[indexArray].id_option = choice.id_option;
                result[indexArray].options_multiple = new Array();
            }
            result[indexArray].options_multiple[indexMultiple] = new Object;
            result[indexArray].options_multiple[indexMultiple].id_option_multiple = choice.id_option_multiple;
            result[indexArray].options_multiple[indexMultiple].text = choice.text;
            indexMultiple++;
        });
        return result;
    };

    this.slider = function(){
        var code = "<div id='div_question_" + this.question.id + "' class='question'>";
        
        //Validations
        var questionClass = "slider active";
        if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
        
        //It may have a small description too
        if(this.question.description){
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label>';
            code += '<label for="question_' + this.question.id + '" class="question_description slider">' + this.question.description + '</label>';
            code += '<div id="question_' + this.question.id + '_slider" class="' + questionClass + '" style="width: 85%; margin-top: 7px; float: left;"></div><input type="text" name="question_' + this.question.id + '" id="question_' + this.question.id + '" style="width: 5%; float: left; margin-left: 10px;" value="0"/><label for="question_' + this.question.id + '" style="width: 5%; float: left; margin-left: 5px;">' + this.question.optional_label + '</label></div>';
        }else{
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label></div>';
            code += '<div id="question_' + this.question.id + '_slider" class="' + questionClass + '" style="width: 85%; margin-top: 7px; float: left;"></div><input type="text" name="question_' + this.question.id + '" id="question_' + this.question.id + '" style="width: 5%;float: left; margin-left: 10px;" value="0"/><label for="question_' + this.question.id + '"style="width: 5%; float: left; margin-left: 5px;">' + this.question.optional_label + '</label>';
        }
    
        //Now lets paint the label for the possible error
        code += '<label for="question_' + this.question.id + '" generated="true" class="error" style="display: none;" ></label>';
        
        //close div of question and return the html code
        return code += "</div>";
    };
    
    //this function injects jquery mobile code for the sortable questions
    this.sortableQuestion = function(){  
        var code = "<div id='div_question_" + this.question.id + "' class='question'>";
        
        if(this.question.description){
            //question text
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label>';
            code += '<label for="question_' + this.question.id + '" class="question_description">' + this.question.description + '</label></div>'
        }else{
            //question text
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label></div>'
        }
        
        //and including the validations
        var questionClass = "active choices";
        if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
        code += '<ul id="question_' + this.question.id + '" name="question_' + this.question.id + '" class="sortable ui-sortable">';
        //the options
        for(i=0;i<this.options.length;i++){
            code += '<li id="question_' + this.question.id + '_' + this.options[i].id_option + '" ><span class="ui-icon ui-icon-plus ui-icon-shadow"></span><span>' + this.options[i].text + '</span></li>';
        }
        
        //closing list and fieldcontain tags
        code += '</ul>';
        
        //Now lets paint the label for the possible error
        code += '<label for="question_' + this.question.id + '" generated="true" class="error" style="display: none;" ></label>'; 
        
        //div of question and the div for the fieldcontain, finally return the html code
        return code+= "</div>" ;
    };        

    //this function injects jquery mobile code for grid question
    this.paintGridQuestion = function(){
        widthAux = parseInt(jQuery('#' + this.form.place).width()/(this.gridOptions.columns.length + 1));
        cellWidth = widthAux - widthAux%100 + 100;
        restCellWidth = parseInt((jQuery('#' + this.form.place).width() - cellWidth)/(this.gridOptions.columns.length));
        var code = "<div id='div_question_" + this.question.id + "' class='question'>";
        
        if(this.question.description){
            //question text
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label>';
            code += '<label for="question_' + this.question.id + '" class="question_description">' + this.question.description + '</label></div>'
        }else{
            //question text
            code += '<div class="question_attributes"><label for="question_' + this.question.id + '" class="question_title"><span id="question_number"></span> ' + this.question.text + '</label></div>'
        }
        //and including the validations
        var questionClass = "active choices";
    	if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
    	//grid of radioButtons
    	//lets start the table
    	code += "<table id='grid_" + this.question.id + "' name='grid_" + this.question.id + "' class='question_table' >";
    	//first row is the columns, and first column are the options. Inside the rest of the cells lets draw the radioButtons
    	for(i=0;i<this.gridOptions.columns.length;i++){
    		if(i==0){
    			//empty cell only for the first cell
    			code +=	"<tr style='border: none;' id='heading_row'><td style='width: " + cellWidth + "px;'></td>";
    		}
            if(this.gridOptions.columns[i].image==1 && this.gridOptions.columns[i].text_exists==1){
                //Both text and image
                code += "<td align='center' valign='center' class='columnName' id='column_" + this.gridOptions.columns[i].id + "' style='width: " + restCellWidth + "px;'><label>" + this.gridOptions.columns[i].text + "</label><img src='" + rootPath + "/" + this.gridOptions.columns[i].image_path + "' alt='column image' /></td>"; 
            }else if(this.gridOptions.columns[i].text_exists==1){
                //only text
                code += "<td align='center' valign='center' class='columnName' id='column_" + this.gridOptions.columns[i].id + "' style='width: " + restCellWidth + "px;'><label>" + this.gridOptions.columns[i].text + "</label></td>"; 
            }else if(this.gridOptions.columns[i].image==1){
                //only image
                code += "<td align='center' valign='center' class='columnName' id='column_" + this.gridOptions.columns[i].id + "' style='width: " + restCellWidth + "px;'><img src='" + rootPath + "/" + this.gridOptions.columns[i].image_path + "' alt='column image' /></td>";
            }
        }
    	//we can close the first row then
    	code += "</tr>";
    	
    	//now the first row is completed, lets follow with the different rows and radioButtons
    	//first row is the columns, and first column are the options. Inside the rest of the cells lets draw the radioButtons
    	for(i=0;i<this.gridOptions.rows.length;i++){
            if(this.gridOptions.rows[i].image==1 && this.gridOptions.rows[i].text_exists==1){
                //both text and image
                code += "<tr><td align='center' valign='center' class='rowName' style='width:" + cellWidth + "px;' id='row_" + this.gridOptions.rows[i].id + "'>" + this.gridOptions.rows[i].text + "<img src='" + rootPath + "/" + this.gridOptions.rows[i].image_path + "' alt='rows image' /></td>";
            }else if(this.gridOptions.rows[i].text_exists==1){
                //only text
                code += "<tr><td align='center' valign='center' class='rowName' style='width:" + cellWidth + "px;' id='row_" + this.gridOptions.rows[i].id + "'>" + this.gridOptions.rows[i].text + "</td>"; 
            }else if(this.gridOptions.rows[i].image==1){
                //only image 
                code += "<tr><td align='center' valign='center' class='rowName' style='width:" + cellWidth + "px;' id='row_" + this.gridOptions.rows[i].id + "'><img src='" + rootPath + "/" + this.gridOptions.rows[i].image_path + "' alt='rows image' /></td>";   
            }
            
            //now lets paing the radioButtons in the other row's cells
    		for(j=0;j<this.gridOptions.columns.length;j++){
    			//paint the option
                if(this.question.subtype.toLowerCase()=="radiobuttons"){
                    //radioButtons grid
        			code += "<td align='center' valign='center' style='width: " + restCellWidth + "px;'><input type='radio' class='" + questionClass + " grid_radio' name='grid_" + this.question.id + "_row_" + this.gridOptions.rows[i].id + "' id='grid_" + this.question.id + "_" + this.gridOptions.rows[i].id + "_" + this.gridOptions.columns[j].id + "' value='" + (this.gridOptions.columns[j].id - 1) + "' />";
        			if((j+1)!=this.gridOptions.columns.length){
        				code += "</td>";
        			}
                }else{
                    //checkBoxes grid
                    code += "<td align='center' valign='center' style='width: " + restCellWidth + "px;'><input type='checkbox' class='" + questionClass + " grid_checkbox' name='grid_" + this.question.id + "_row_" + this.gridOptions.rows[i].id + "' id='grid_" + this.question.id + "_" + this.gridOptions.rows[i].id + "_" + this.gridOptions.columns[j].id + "' value='" + (this.gridOptions.columns[j].id - 1) + "' />";
        			if((j+1)!=this.gridOptions.columns.length){
        				code += "</td>";
        			}
                }
    		}
            //now we can add the jquery validate message and close the row
            code += "<td class='error_cell' id='row_" + this.gridOptions.rows[i].id +  "_error' style='border: none; width: " + restCellWidth + "px; text-align: left;'><label for='grid_" + this.question.id + "_row_" + this.gridOptions.rows[i].id + "' generated='true' class='error'></label></td></tr>";    
    	}
        //close the table finally
        code += "</table>"
    	
        //close the question div finally
        code += "</div>"
    	
        return code;
    };
}