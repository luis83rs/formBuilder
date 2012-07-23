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
        if(this.question.multiple==1){
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
    
    //this function injects jquery mobile code for single question
    this.paintSingleQuestion = function(){
        //first thing to do is to identify the type of question
        if(this.question.type.toLowerCase()=="textfield"){
            //textfield type
            return this.textField();
        }else if(this.question.type.toLowerCase()=="textarea"){
            //textarea type
            return this.textArea();
        }
    };
    
    //this function injects jquery mobile code for multiple question
    this.paintMultipleQuestion = function(){
        if(this.question.type.toLowerCase()=="fliptoggleswitch"){
            //flip toggle switch
            return this.flipToggleSwitch();
        }else if(this.question.type.toLowerCase()=="slider"){
            //Slider
            return this.slider();
        }else if(this.question.type.toLowerCase()=="checkbox"){
            //checkbox
            return this.checkBox();
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
            }else if(this.question.subtype.toLowerCase()=="divide"){
                //divided dropdown
                return this.divideDropDown();
            }
        }else if(this.question.type.toLowerCase()=="sortable"){
            //sortable question
            return this.sortableQuestion();
        }
    };
    
    this.textField = function(){
        var code = "<div id='div_question_" + this.question.id + "' class='question'>";
        
        //It may have a small description too
        if(this.question.description){
            code += '<label for="question_' + this.question.id + '">' + this.question.text + '</label>';
            
            if(!this.question.wide && this.form.id_pdj_object==0){
                code +='<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain">';
            }
            
            code += '<label for="question_' + this.question.id + '" class="question_description">' + this.question.description + '</label>';
        }else{
            if(!this.question.wide && this.form.id_pdj_object==0){
                code +='<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain">';
            }
            code += '<label for="question_' + this.question.id + '">' + this.question.text + '</label>';
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
        if(!this.question.wide && this.form.id_pdj_object==0){
            code +='</div>';
        }
        
        //Now lets paint the label for the possible error
        code += '<label for="question_' + this.question.id + '" generated="true" class="error" style="display: none;" ></label>';
        
        //close div of question and return the html code
        return code += "</div>";
    };
    
    this.textArea = function(){
        var code = "<div id='div_question_" + this.question.id + "' class='question'>";
        
        //It may have a small description too
        if(this.question.description){
            code += '<label for="question_' + this.question.id + '">' + this.question.text + '</label>';
            if(!this.question.wide && this.form.id_pdj_object==0){
                code +='<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain">';
            }
            code += '<label for="question_' + this.question.id + '" class="question_description">' + this.question.description + '</label>';
        }else{
            if(!this.question.wide && this.form.id_pdj_object==0){
                code +='<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain">';
            }
            code += '<label for="question_' + this.question.id + '">' + this.question.text + '</label>';
        }
        
        //and then the textfield, including the validations
        var questionClass = "active";
        if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
        
        code += '<textarea name="question_' + this.question.id + '" id="question_' + this.question.id + '" class="' + questionClass + '"/></textarea>';
        
        if(!this.question.wide && this.form.id_pdj_object==0){
            code += "</div>";
        }
        
        //Now lets paint the label for the possible error
        code += '<label for="question_' + this.question.id + '" generated="true" class="error" style="display: none;" ></label>';
        
        //close div of question and return the html code
        return code += "</div>";
    };
    
    //function that paints flipSwitch questions
    this.flipToggleSwitch = function(){
        var code = "<div id='div_question_" + this.question.id + "' class='question'>";
        
        //It may have a small description too
        if(this.question.description){
            code += '<label for="question_' + this.question.id + '">' + this.question.text + '</label>';
            
            if(!this.question.wide && this.form.id_pdj_object==0){
                code +='<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain">';
            }
            code += '<label for="question_' + this.question.id + '" class="question_description">' + this.question.description + '</label>';
        }else{
            if(!this.question.wide && this.form.id_pdj_object==0){
                code +='<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain">';
            }
            code += '<label for="question_' + this.question.id + '">' + this.question.text + '</label>';
        }
        
        //and then the textfield, including the validations
        var questionClass = "active choices";
        if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
        
        code += '<select  name="question_' + this.question.id + '" id="question_' + this.question.id + '" class="' + questionClass + '" data-role="slider" data-mini="true">';
    
        //now loop over the options
        for(i=0;i<this.options.length;i++){
            code += '<option value="' + this.options[i].id_option + '">' + this.options[i].text + '</option>';
        }
        
        code += '</select >';
        
        if(!this.question.wide && this.form.id_pdj_object==0){
            code +='</div>';
        }
        
        //Now lets paint the label for the possible error
        code += '<label for="question_' + this.question.id + '" generated="true" class="error" style="display: none;" ></label>';
        
        //close div of question and return the html code
        return code += "</div>";
    };
    
    //function that paints slider questions
    this.slider = function(){
        var code = "<div id='div_question_" + this.question.id + "' class='question'>";
        
        //It may have a small description too
        if(this.question.description){
            code += '<label for="question_' + this.question.id + '">' + this.question.text + '</label>';
            
            if(!this.question.wide && this.form.id_pdj_object==0){
                code +='<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain">';
            }
            code += '<label for="question_' + this.question.id + '" class="question_description">' + this.question.description + '</label>';
        }else{
            
            if(!this.question.wide && this.form.id_pdj_object==0){
                code +='<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain">';
            }
            code += '<label for="question_' + this.question.id + '">' + this.question.text + '</label>';
        }
            
        //and then the textfield, including the validations
        var questionClass = "active choices slider";
        if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
        
        //Identify min and max for the scale
        var min = this.options[0].text;
        var max = this.options[1].text;
        
        //code for the slider
        code += '<input type="range" name="question_' + this.question.id + '" id="question_' + this.question.id + '" value="0" min="' + min  + '" max="' + max + '"  class="' + questionClass + '" />';
        
        if(!this.question.wide && this.form.id_pdj_object==0){
            code +='</div>';
        }
        
        if(this.question.optional_label){
            code += '<label id="optional_label">(' + this.question.optional_label + ')</label>';
        }
        
        //Now lets paint the label for the possible error
        code += '<label for="question_' + this.question.id + '" generated="true" class="error" style="display: none;" ></label>';
        
        //close div of question and return the html code
        return code += "</div>";
    };
    
    //function that paints Checkbox questions
    this.checkBox = function(){    
        var code = "<div id='div_question_" + this.question.id + "' class='question'>";
        
        //It may have a small description too
        if(this.question.description){
            code += '<label for="question_' + this.question.id + '">' + this.question.text + '</label>';
            if(!this.question.wide && this.form.id_pdj_object==0){
                code +='<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain">';
            }
            //lets check if its horizontal
            if(this.question.vertical || this.form.id_pdj_object!=0){
                code += '<fieldset data-role="controlgroup">';
            }else{
                code += '<fieldset data-role="controlgroup" data-type="horizontal">';
            }
            code += '<legend>' + this.question.description + '</legend>';
        }else{
            if(!this.question.wide && this.form.id_pdj_object==0){
                code +='<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain">';
            }
            //lets check if its horizontal
            if(this.question.vertical || this.form.id_pdj_object!=0){
                code += '<fieldset data-role="controlgroup">';
            }else{
                code += '<fieldset data-role="controlgroup" data-type="horizontal">';
            }
            code += '<legend>' + this.question.text + '</legend>';
        }
    
        //and then the textfield, including the validations
        var questionClass = "custom active choices";
        if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
        
        //code for the checkbox, loop over the choices
        for(i=0;i<this.options.length;i++){
            code += '<input type="checkbox" name="question_' + this.question.id + '" id="question_' + this.question.id + '_' + this.options[i].id_option + '" class="' + questionClass + '"/>';   
            if(this.options[i].image==1 && choices[1].text_exists==1){
                //got image and label
                code += '<label for="question_' + this.question.id + '_' + this.options[i].id_option + '"><img src="' + this.options[i].image_path + '" alt="image option ' + (i+1) + '" style="float: left"/>' + this.options[i].text + '</label>';
            }else if(this.options[i].text_exists==1){
                //Not image, only label
                code += '<label for="question_' + this.question.id + '_' + this.choices[i].id_option + '">' + this.options[i].text + '</label>';
            }else{
                //only image
                code += '<label for="question_' + this.question.id + '_' + this.options[i].id_option + '"><img src="' + this.options[i].image_path + '" alt="image option ' + (i+1) + '" style="float: left"/></label>';
            }
        }    
        
        if(!this.question.wide && this.form.id_pdj_object==0){
            //close fieldset, and the div for the fieldcontain, finally return the html code
            code += "</fieldset></div>";
        }else{
            //close fieldset, and the div for the fieldcontain, finally return the html code
            code += "</fieldset>";
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
            code += '<label for="question_' + this.question.id + '">' + this.question.text + '</label>';
            if(!this.question.wide && this.form.id_pdj_object==0){
                code +='<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain">';
            }
            //lets check if its horizontal
            if(this.question.vertical || this.form.id_pdj_object!=0){
                code += '<fieldset data-role="controlgroup">';
            }else{
                code += '<fieldset data-role="controlgroup" data-type="horizontal">';
            }
            code += '<legend>' + this.question.description + '</legend>';
        }else{
            if(!this.question.wide && this.form.id_pdj_object==0){
                code +='<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain">';
            }
            //lets check if its horizontal
            if(this.question.vertical || this.form.id_pdj_object!=0){
                code += '<fieldset data-role="controlgroup">';
            }else{
                code += '<fieldset data-role="controlgroup" data-type="horizontal">';
            }
            code += '<legend>' + this.question.text + '</legend>';
        }
        
        //and then the textfield, including the validations
        var questionClass = "custom active choices";
        if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
        
        //code for the checkbox, loop over the choices
        for(i=0;i<this.options.length;i++){
            code += '<input type="radio" name="question_' + this.question.id + '" id="question_' + this.question.id + '_' + this.options[i].id_option + '" value="' + this.options[i].text + '"class="' + questionClass + '"/>';   
            //code += '<label for="question_' + question.id + '_' + choices[i].id_option + '">' + choices[i].option + '</label>';
            if(this.options[i].image==1 && this.options[i].text_exists==1){
                code += '<label for="question_' + this.question.id + '_' + this.options[i].id_option + '"><img src="' + rootPath + "/" + this.options[i].image_path + '" alt="image option ' + (i+1) + '" style="float: left;"/>' + this.options[i].text + '</label>';
            }else if(this.options[i].image==1){
                code += '<label for="question_' + this.question.id + '_' + this.options[i].id_option + '"><img src="' + rootPath + "/" + this.options[i].image_path + '" alt="image option ' + (i+1) + '" style="float: left;"/></option></label>';
            }else if(this.options[i].text_exists==1){
                code += '<label for="question_' + this.question.id + '_' + this.options[i].id_option + '">' + this.options[i].text + '</label>';
            }
        }    
        
        if(!this.question.wide && this.form.id_pdj_object==0){
            //close fieldset, and the div for the fieldcontain, 
            code += "</fieldset></div>";
        }else{
            //close fieldset, and the div for the fieldcontain, 
            code += "</fieldset>";
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
            code += '<label for="question_' + this.question.id + '">' + this.question.text + '</label>';
            if(!this.question.wide && this.form.id_pdj_object==0){
                code +='<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain">';
            }
            code += '<label for="question_' + this.question.id + '" class="select">' + this.question.description + '</label>'
        }else{  
            //question text
            if(!this.question.wide && this.form.id_pdj_object==0){
                code +='<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain">';
            }
            code += '<label for="question_' + this.question.id + '" class="select">' + this.question.text + '</label>'
        }
        
        //and including the validations
        var questionClass = "custom active choices";
        if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
    
        if(this.question.data_multiple){
            code += '<select name="question_' + this.question.id + '" id="question_' + this.question.id + '" class="' + questionClass + '" data-native-menu="true" multiple="multiple">';
        }else{
            code += '<select name="question_' + this.question.id + '" id="question_' + this.question.id + '" class="' + questionClass + '" data-native-menu="true">';
        }
        
        //the options
        for(i=0;i<this.options.length;i++){
            if(this.options[i].image==1 && this.options[i].text_exists==1){
                //both image and text
                code += '<option value="' + this.options[i].id_option + '"><img src="' + rootPath + "/" + this.options[i].image_path + '" alt="image option ' + (i+1) + '" style="float: left"/>' + this.options[i].text + '</option>';
            }else if(this.options[i].image==1){
                //only image
                code += '<option value="' + this.options[i].id_option + '"><img src="' + rootPath + "/" + this.options[i].image_path + '" alt="image option ' + (i+1) + '" style="float: left"/></option>';
            }else if(this.options[i].text_exists==1){
                //only text
                code += '<option value="' + this.options[i].id_option + '">' + this.options[i].text + '</option>';
            }
        }
        
        if(!this.question.wide && this.form.id_pdj_object==0){
            //closing select and fieldcontain tags
            code += '</select></div>';
        }else{
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
        var lastOption = this.options[0].id_option;
        var result = new Array();
        result[0] = new Object;
        result[0].id_option = this.options[0].id_option;
        result[0].options_multiple = new Array();
        indexArray = -1;
        indexMultiple = 0;
        var indexArray = 0;
        jQuert.each(this.options, function(index, option){
            if(lastOption != option.id_option){
                lastOption = option.id_option;
                indexArray++;
                indexMultiple = 0;
                result[indexArray] = new Object;
                result[indexArray].id_option = option.id_option;
                result[indexArray].options_multiple = new Array();
            }
            result[indexArray].options_multiple[indexMultiple] = new Object;
            result[indexArray].options_multiple[indexMultiple].id_option_multiple = option.id_option_multiple;
            result[indexArray].options_multiple[indexMultiple].text = option.text;
            result[indexArray].options_multiple[indexMultiple].text_exists = option.text_exists;
            result[indexArray].options_multiple[indexMultiple].image = option.image;
            result[indexArray].options_multiple[indexMultiple].image_path = option.image_path;
            indexMultiple++;
        });
        return result;
    };
    
    //function that paints dropDown questions
    this.groupDropDown = function(){
        var choices = formatChoices(this.options);
        var code = "<div id='div_question_" + this.question.id + "'>";
        
        if(this.question.description){
            //question text
            code += '<label for="question_' + this.question.id + '">' + this.question.text + '</label>';
            
            //now lets pain the question properly
            if(this.question.vertical || this.form.id_pdj_object!=0){
                if(!this.question.wide && this.form.id_pdj_object==0){
                    code += '<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain"><fieldset data-role="controlgroup">';
                }else{
                    code += '<fieldset data-role="controlgroup">';   
                }            
            }else{
                if(!this.question.wide && this.form.id_pdj_object==0){
                    code += '<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain"><fieldset data-role="controlgroup" data-type="horizontal">'; 
                }else{
                     code += '<fieldset data-role="controlgroup" data-type="horizontal">';
                }
            }
            
            //description
            code += '<legend>' + this.question.description + '</legend>'
            
            
        }else{
            //now lets pain the question properly
            if(this.question.vertical || this.form.id_pdj_object!=0){
                if(!this.question.wide && this.form.id_pdj_object==0){
                    code += '<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain"><fieldset data-role="controlgroup">';
                }else{
                    code += '<fieldset data-role="controlgroup">';
                }
            }else{
                 if(!this.question.wide && this.form.id_pdj_object==0){
                    code += '<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain"><fieldset data-role="controlgroup" data-type="horizontal">';
                }else{
                    code += '<fieldset data-role="controlgroup" data-type="horizontal">';
                }
            }
            
            //description
            code += '<legend>' + this.question.text + '</legend>'
        }
        
            
        //and including the validations
        var questionClass = "custom active choices";
        if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
        
        //now lets loop over the grouped choices
        for(i=0;i<choices.length;i++){
            code += '<label for="question_' + this.question.id + '_' + choices[i].id_option + '">' + choices[i].options_multiple[0].option + '</label>';
            if(this.question.data_multiple){
                code += '<select name="question_' + this.question.id + '" id="question_' + this.question.id + '_' + choices[i].id_option + '" class="' + questionClass + '" multiple="multiple" data-native-menu="true">';
            }else{
                code += '<select name="question_' + this.question.id + '" id="question_' + this.question.id + '_' + choices[i].id_option + '" class="' + questionClass + '" data-native-menu="true">';
            }
            //now for each group lets loop over their options
            for(j=0;j<choices[i].options_multiple.length;j++){
                if(choices[i].options_multiple[j].image==1 && choices[i].options_multiple[j].text_exists==1){
                    //both text and image
                    code += "<option value='" + choices[i].options_multiple[j].id_option_multiple + "'><img src='" + rootPath + "/" + choices[i].options_multiple[j].image_path + "' alt='option image' />" + choices[i].options_multiple[j].text + "</option>";
                }else if(choices[i].options_multiple[j].text_exists==1){
                    //only text
                    code += "<option value='" + choices[i].options_multiple[j].id_option_multiple + "'>" + choices[i].options_multiple[j].text + "</option>";
                }else if(choices[i].options_multiple[j].image==1){
                    //only image
                    code += "<option value='" + choices[i].options_multiple[j].id_option_multiple + "'><img src='" + rootPath + "/" + choices[i].options_multiple[j].image_path + "' alt='option image' /></option>";
                }          
            }
            code += "</select>";
        }
        
        if(!this.question.wide && this.form.id_pdj_object==0){
            //Lets clouse the fieldset, the div of data-role
            code += "</fieldset></div>";
        }else{
            //Lets clouse the fieldset
            code += "</fieldset>";
        }
        
        //Now lets paint the label for the possible error
        code += '<label for="question_' + this.question.id + '" generated="true" class="error" style="display: none;" ></label>';
        
        //close div of question and return the html code
        return code += "</div>";
    };
    
    //function that paints dropdowns overhead
    this.divideDropDown = function(){
        choices = formatChoices(this.options);
        var code = "<div id='div_question_" + this.question.id + "'>";
        
        if(this.question.description){
            //question text
            code += '<label for="question_' + this.question.id + '">' + this.question.text + '</label>';
            
            //now lets pain the question properly
            code += '<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain">';
            
            //description
            code += '<label for="question_' + this.question.id + '" class="select">' + this.question.description + '</label>'
            
            
        }else{
            //now lets pain the question properly
            code += '<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain">';
            
            //description
            code += '<label for="question_' + this.question.id + '" class="select">' + this.question.text + '</label>'
        }
        
            
        //and including the validations
        var questionClass = "custom active";
        if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
        
        if(this.question.data_multiple){
            code += '<select id="question_' + this.question.id + '" name="question_' + this.question.id + '" class="' + questionClass + '" data-native-menu="true" multiple="multiple">';
        }else{
            code += '<select id="question_' + this.question.id + '" name="question_' + this.question.id + '" class="' + questionClass + '" data-native-menu="true">';
        }
        //now lets loop over the grouped choices
        for(i=0;i<choices.length;i++){
            //now for each group lets loop over their options
            for(j=1;j<choices[i].options_multiple.length;j++){
                if(j==1){
                    if(i!=0){
                        code += "</optgroup>";
                    }
                    code += "<optgroup label='" + choices[i].options_multiple[j-1].option + "' id='option_" + choices[i].id_option + "'>";
                }
                code += "<option value='" + choices[i].id_option + "_" +  choices[i].options_multiple[j].id_option_multiple + "'>" + choices[i].options_multiple[j].option + "</option>"             
            }
        }
        
        //Lets close the select and div of data-role
        code += "</select></div>";
        
        //Now lets paint the label for the possible error
        code += '<label for="question_' + this.question.id + '" generated="true" class="error" style="display: none;" ></label>';
        
        //close div of question and return the html code
        
        return code += "</div>";
        
    };
    
    //this function injects jquery mobile code for the sortable questions
    this.sortableQuestion = function(){
        var code = "<div id='div_question_" + this.question.id + "'>";
        
        if(this.question.description){
            //question text
            code += '<label for="question_' + this.question.id + '">' + this.question.text + '</label>';
            code += '<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain">';
            code += '<label for="question_' + this.question.id + '" class="select">' + this.question.description + '</label>'
        }else{
            //question text
            code += '<div id="field_contain_question_' + this.question.id + '" data-role="fieldcontain">';
            code += '<label for="question_' + this.question.id + '" class="select">' + this.question.text + '</label>'
        }
        
        //and including the validations
        var questionClass = "sortable active";
        if(this.question.mandatory==1){
            questionClass += " required";
        }
        if(this.question.validation){
            questionClass += " " + this.question.validation;
        }
        code += '<ul id="question_' + this.question.id + '" name="question_' + this.question.id + '" class="sortable ui-sortable">';
        //the options
        for(i=0;i<this.options.length;i++){
            code += '<li class="ui-state-default" id="question_' + this.question.id + '_' + this.options[i].id_option + '" ><span class="ui-btn-inner" aria-hidden="true"><span class="ui-btn-text">' + this.options[i].option + '</span><span class="ui-icon ui-icon-plus ui-icon-shadow"></span></span></li>';
        }
        
        //closing list and fieldcontain tags
        code += '</ul></div>';
        
        //Now lets paint the label for the possible error
        code += '<label for="question_' + this.question.id + '" generated="true" class="error" style="display: none;" ></label>'; 
        
        //div of question and the div for the fieldcontain, finally return the html code
        return code+= "</div>" ;
    };        
    
    //this function injects jquery mobile code for grid question
    this.paintGridQuestion = function(){
        widthAux = parseInt(jQuery('#' + where ).width()/(this.gridOptions.columns.length + 1));
        cellWidth = widthAux - widthAux%100 + 100;
        restCellWidth = parseInt((jQuery('#' + where).width() - cellWidth)/(this.gridOptions.columns.length));
        
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