function Buttons(formData, buttonsData){
    this.form = formData;
    this.buttons = buttonsData;

    //this function injects jquery mobile code for the form buttons
    //each form has to have at least one button and a maximun of two buttons.
    this.paintInitialButtons = function(){
        var self = this;
        var buttonsPlace = jQuery('#' + self.form.place + ' #div_buttons');
        if(self.form.existsNextPage()){
            //ANY FORM, FIRST PAGE SO JUST FORWARD BUTTON
            if(self.form.data.form.id_source!=1){
                if(self.buttons.forward){
                    buttonsCode = '<table class="div_buttons_table"><tr><td align="right"><input type="button" id="next_button" style="float: right; " value="' + self.buttons.forward.text_button + '" /></td></tr></table>';
                    buttonsPlace.html(buttonsCode);
                    buttonsPlace.addClass("buttons_form");
                    buttonsPlace.find('#next_button').bind("click",function(event) {
                        self.form.savePage();
                    });
                }else if(self.buttons.save){
                    //may only have save button
                    buttonsCode = '<table class="div_buttons_table"><tr><td align="right"><input type="button" id="save_button" style="float: right; " value="' + self.buttons.save.text_button + '" /></td></tr></table>';
                    buttonsPlace.html(buttonsCode);
                    buttonsPlace.addClass("buttons_form");
                    buttonsPlace.find('#save_button').bind("click",function(event) {
                        self.form.savePage();
                    });
                }
            }else{
                //REGISTRATION FORM 
                buttonsCode = '<table class="div_buttons_table"><tr><td align="right"><input type="button" id="save_button" style="float: left; " value="' + self.buttons.save.text_button + '" /></td><td></td></tr></table>';
                buttonsPlace.html(buttonsCode);
                buttonsPlace.addClass("buttons_form");
                buttonsPlace.find('#save_button').bind("click",function(event) {
                    self.form.savePage();
                });
            }
        }else{
            //save only, only one page
            if(self.form.data.form.id_pdj_object==0 && self.form.data.form.id_source!=1){
                //not PDJ and NOT REGISTRATION
                if(self.buttons.save){
                    buttonsCode = '<table class="div_buttons_table"><tr><td align="right"><input type="button" id="save_button" style="float: right; " value="' + self.buttons.save.text_button + '" /></td></tr></table>';
                    buttonsPlace.html(buttonsCode);
                    buttonsPlace.addClass("buttons_form");
                    buttonsPlace.find('#save_button').bind("click",function(event) {
                        //saveQuestionsPage(activePage, true);
                        self.form.savePage();
                    });
                }
            }else if(self.form.data.form.id_pdj_object==0 && self.form.data.form.id_source==1){
                //REGISTRATION form (profile))
                buttonsCode = '<table class="div_buttons_table"><tr><td align="right"><input type="button" id="save_button" style="float: left; " value="' + self.buttons.save.text_button + '" /></td><td></td></tr></table>';
                buttonsPlace.html(buttonsCode);
                buttonsPlace.addClass("buttons_form");
                buttonsPlace.find('#save_button').bind("click",function(event) {
                    self.form.savePage();
                });
            }else{
                //PDJ
                if(self.buttons.forward){
                    buttonsCode = '<table class="div_buttons_table"><tr><td align="right"><input type="button" id="next_button" style="float: right; " value="' + self.buttons.forward.text_button + '" /></td></tr></table>';
                    buttonsPlace.html(buttonsCode);
                    buttonsPlace.addClass("buttons_form");
                    buttonsPlace.find('#next_button').bind("click",function(event) {
                        self.form.savePage();
                    });
                }
            }
        }
    };
    
    this.paintButtons = function(){
        var self = this;
        //add buttons
        var buttonsPlace = jQuery('#' + self.form.place + ' #div_buttons');
        if(self.form.data.form.id_pdj_object==0){
            //regular form
            if(!self.form.existsNextPage()){
                //back and save button
                if(self.buttons.back && self.buttons.save){
                    buttonsCode = '<table class="div_buttons_table"><tr><td align="left"><input type="button" id="back_button" style="float: left; " value="' + self.buttons.back.text_button + '" /></td>';
                    buttonsCode += '<td align="right"><input type="button" data-role="button" id="save_button" style="float: right; " value="' + self.buttons.save.text_button + '" /></td></tr></table>';
                    buttonsPlace.html(buttonsCode);
                    buttonsPlace.addClass("buttons_form");                        
                    jQuery('#' + self.form.place  + ' #div_buttons #back_button').bind("click",function(event) {
                        self.form.goBack();
                    });
                    jQuery('#' + self.form.place  + ' #div_buttons #save_button').bind("click",function(event) {
                        self.form.savePage();
                    });
                }else if(self.buttons.back){
                    //only got back from DDBB
                    buttonsCode = '<table class="div_buttons_table"><tr><td align="left"><input type="button" id="back_button" style="float: left; " value="' + self.buttons.back.text_button + '" /></td>';
                    buttonsCode += '<td align="right"></td></tr></table>';
                    buttonsPlace.html(buttonsCode);
                    buttonsPlace.addClass("buttons_form");                        
                    jQuery('#' + self.form.place  + ' #div_buttons #back_button').bind("click",function(event) {
                        self.form.goBack();
                    });
                }else if(self.buttons.save){
                    //only got save
                    buttonsCode = '<table class="div_buttons_table"><tr><td align="left"></td>';
                    buttonsCode += '<td align="right"><input type="button" data-role="button" id="save_button" style="float: right; " value="' + self.buttons.save.text_button + '" /></td></tr></table>';
                    buttonsPlace.html(buttonsCode);
                    buttonsPlace.addClass("buttons_form");                        
                    jQuery('#' + self.form.place  + ' #div_buttons #save_button').bind("click",function(event) {
                        self.form.savePage();
                    });
                }
            }else{
                if(self.form.activePage!=1){
                    //back and next button
                    if(self.buttons.back && self.buttons.forward){
                        buttonsCode = '<table class="div_buttons_table"><tr><td align="left"><input type="button" id="back_button" style="float: left; " value="' + self.buttons.back.text_button + '" /></td>';
                        buttonsCode += '<td align="right"><input type="button" data-role="button" id="next_button" style="float: right; " value="' + self.buttons.forward.text_button + '" /></td></tr></table>';
                        buttonsPlace.html(buttonsCode);
                        buttonsPlace.addClass("buttons_form");
                        jQuery('#' + self.form.place  + ' #div_buttons #back_button').bind("click",function(event) {
                            self.form.goBack();
                        });
                        jQuery('#' + self.form.place  + ' #div_buttons #next_button').bind("click",function(event) {
                            self.form.savePage();
                        });
                    }else if(self.buttons.back){
                        //got only back from DDBB
                        buttonsCode = '<table class="div_buttons_table"><tr><td align="left"><input type="button" id="back_button" style="float: left; " value="' + self.buttons.back.text_button + '" /></td>';
                        buttonsCode += '<td align="right"></td></tr></table>';
                        buttonsPlace.html(buttonsCode);
                        buttonsPlace.addClass("buttons_form");
                        jQuery('#' + self.form.place  + ' #div_buttons #back_button').bind("click",function(event) {
                            self.form.goBack();
                        });
                    }else if(self.buttons.forward){
                        //got only forward
                        buttonsCode = '<table class="div_buttons_table"><tr><td align="left"></td>';
                        buttonsCode += '<td align="right"><input type="button" data-role="button" id="next_button" style="float: right; " value="' + self.buttons.forward.text_button + '" /></td></tr></table>';
                        buttonsPlace.html(buttonsCode);
                        buttonsPlace.addClass("buttons_form");
                        jQuery('#' + self.form.place  + ' #div_buttons #next_button').bind("click",function(event) {
                            self.form.savePage();
                        });
                    }
                }else{
                    //first page again
                    self.paintInitialButtons();
                }
            }      
        }else{
            //PDJ Form                    
            //show only next page
            buttonsCode = '<table class="div_buttons_table"><tr><td align="right"><input type="button" data-role="button" id="next_button" style="float: right; " value="' + self.buttons.forward.text_button + '" /></td></tr></table>';
            buttonsPlace.html(buttonsCode);
            buttonsPlace.addClass("buttons_form");
            
            jQuery('#' + self.form.place  + ' #div_buttons #next_button').bind("click",function(event) {
                self.form.savePage();
            });
            
            if(self.form.id_pdj_object!=0){
                var headerPdjForm = self.form.pdjObjectText + " (" + self.form.countQuestionsBehind() + " of " + self.form.countAllQuestionShown() + ")";
        
                //lets include the header div code now
                jQuery('#' + self.form.place + ' #header_pdj').html(self.form.headerPdjForm);
            }
        }    
    };
}