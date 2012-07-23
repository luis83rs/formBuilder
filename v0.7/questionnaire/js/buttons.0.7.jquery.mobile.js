function Buttons(formData, buttonsData){
    this.form = formData;
    this.buttons = buttonsData;
    
    //this function injects jquery mobile code for the form buttons, only for the FIRST PAGE
    //each form has to have at least one button and a maximun of two buttons.
    this.paintInitialButtons = function(){
        var self = this;
        if(self.form.existsNextPage()){
            //only next
            if(self.buttons.forward){
                if(self.buttons.forward.place_button == "footer"){
                    //footer
                    if(self.buttons.forward.type_button == "inline"){
                        //inline
                        jQuery('div#questionnaire_page #footer #block_left').html('');
                        jQuery('div#questionnaire_page #footer #block_right').html('<input id="next_button" type="button" data-icon="arrow-r" class="ui-btn-right" style="float: left;" data-iconpos="right" value="' + self.buttons.forward.text_button + '" />');
                        jQuery('div#questionnaire_page #footer').trigger('create');
                        
                        //bind the click event
                        jQuery('div#questionnaire_page #footer #next_button').bind("click",function(event, ui) {
                            self.form.savePage();
                        });
                    }else{
                        //cant be normal button
                    }
                }else if(self.buttons.forward.place_button == "form"){
                    //form, non footer
                    var buttonsPlace = jQuery('#' + self.form.place + ' #div_buttons');
                    if(self.buttons.forward.type_button == "inline"){
                        //inline
                        var buttonsCode = '<table class="div_buttons_table"><tr><td align="right"><input type="button" data-role="button" id="next_button" data-iconpos="right" data-inline="true" data-icon="arrow-r" class="ui-btn-right" style="float: right; margin-right: 0.4%;" data-theme="a" value="' + self.buttons.forward.text_button + '" /></td></tr></table>';
                        buttonsPlace.html(buttonsCode);
                        buttonsPlace.addClass("buttons_form");
                        buttonsPlace.trigger('create');
                        buttonsPlace.find('#next_button').bind("click",function(event, ui) {
                            self.form.savePage();
                        });
                    }else{
                        //normal
                        var buttonsCode = '<input type="button" data-role="button" id="next_button" data-icon="arrow-r" style="margin-right: 0.4%;" data-theme="a" data-iconpos="right" data-iconpos="right" value="' + self.buttons.forward.text_button + '" />';
                        buttonsPlace.html(buttonsCode);
                        buttonsPlace.trigger('create');
                        buttonsPlace.find('#next_button').bind("click",function(event, ui) {
                            self.form.savePage();
                        });
                    }
                }
            }
        }else{
            //only one page
            if(self.buttons.login && self.buttons.login.type_button=="flip-toggle"){
                var buttonsPlace = jQuery('#' + self.form.place + ' #div_buttons');
                //slider login type button
                buttonsCode = '<select id="login_button_' + self.form.activePage + '" data-role="slider">';
                buttonsCode += '<option value="1">Login</option><option value="0"></option></select>';
                buttonsPlace.html(buttonsCode);
                buttonsPlace.addClass("buttons_form");
                buttonsPlace.trigger('create');
            }else if(self.buttons.register && self.buttons.register.type_button=="flip-toggle"){
                var buttonsPlace = jQuery('#' + self.form.place + ' #div_buttons');
                //slider register type button
                buttonsCode = '<select id="register_button_' + self.form.activePage + '" data-role="slider">';
                buttonsCode += '<option value="1">Register</option><option value="0"></option></select>';
                buttonsPlace.html(buttonsCode);
                buttonsPlace.addClass("buttons_form");
                buttonsPlace.trigger('create');
            }else if(self.buttons.save && self.buttons.save.place_button=="footer"){
                //footer button
                if(self.buttons.save.type_button=="inline"){
                    //inline, can't be normal
                    jQuery('div#questionnaire_page #footer #block_right').html('<input id="save_button" type="button" data-icon="arrow-r" class="ui-btn-right" style="float: left;" data-iconpos="right" value="' + self.buttons.save.text_button + '" />');
                    jQuery('div#questionnaire_page #footer').trigger('create');
                    
                    //bind the click event
                    jQuery('div#questionnaire_page #footer #save_button').bind("click",function(event, ui) {
                        self.form.savePage();
                    });
                }
            }else if(self.buttons.save && self.buttons.save.place_button=="form"){
                //form button
                var buttonsPlace = jQuery('#' + self.form.place + ' #div_buttons');
                if(self.buttons.save.type_button=="inline"){
                    //inline
                    buttonsCode = '<table class="div_buttons_table"><tr><td align="right"><input type="button" data-role="button" id="save_button" data-iconpos="right" data-inline="true" data-icon="arrow-r" class="ui-btn-right" style="float: right; margin-right: 0.4%;" data-theme="a" value="' + self.buttons.save.text_button + '" /></td></tr></table>';
                    buttonsPlace.html(buttonsCode);
                    buttonsPlace.addClass("buttons_form");
                    buttonsPlace.trigger('create');
                    buttonsPlace.find('#save_button').bind("click",function(event, ui) {
                        self.form.savePage();
                    });
                }else{
                    //normal
                    buttonsCode = '<input type="button" data-role="button" id="save_button" data-icon="arrow-r" style="margin-right: 0.4%;" data-theme="a" data-iconpos="right" data-iconpos="right" value="' + self.buttons.save.text_button + '" />';
                    buttonsPlace.html(buttonsCode);
                    buttonsPlace.trigger('create');
                    buttonsPlace.find('#save_button').bind("click",function(event, ui) {
                        savePage();
                    });
                }
            }else{
                //form, non footer
                var buttonsPlace = jQuery('#' + self.form.place + ' #div_buttons');
                if(buttons.forward.type_button == "inline"){
                    //inline
                    buttonsCode = '<table class="div_buttons_table"><tr><td align="right"><input type="button" data-role="button" id="next_button" data-iconpos="right" data-inline="true" data-icon="arrow-r" class="ui-btn-right" style="float: right; margin-right: 0.4%;" data-theme="a" value="' + self.buttons.forward.text_button + '" /></td></tr></table>';
                    buttonsPlace.html(buttonsCode);
                    buttonsPlace.addClass("buttons_form");
                    buttonsPlace.trigger('create');
                    buttonsPlace.find('#next_button').bind("click",function(event, ui) {
                        self.form.savePage();
                    });
                }else{
                    //normal
                    buttonsCode = '<input type="button" data-role="button" id="next_button" data-icon="arrow-r" style="margin-right: 0.4%;" data-theme="a" data-iconpos="right" data-iconpos="right" value="' + self.buttons.forward.text_button + '" />';
                    buttonsPlace.html(buttonsCode);
                    buttonsPlace.trigger('create');
                    buttonsPlace.find('#next_button').bind("click",function(event, ui) {
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
        if(self.form.form.id_pdj_object==0){
            //regular form
            if(!self.form.existsNextPage()){
                //back and save button
                if(self.buttons.back && self.buttons.save){
                    //both save and back
                    if(self.buttons.back.place_button=="form" && self.buttons.save.place_button=="form"){
                        if(self.buttons.back.type_button=="inline" && self.buttons.save.type_button=="inline"){
                            //inline buttons
                            buttonsCode = '<table class="div_buttons_table"><tr><td align="left"><input type="button" data-role="button" id="back_button" data-iconpos="left" data-inline="true" data-icon="arrow-l" class="ui-btn-left" style="float: left;" data-theme="a" value="' + self.buttons.back.text_button + '" /></td>';
                            buttonsCode += '<td align="right"><input type="button" data-role="button" id="save_button" data-iconpos="right" data-inline="true" data-icon="arrow-r" class="ui-btn-right" style="float: right; margin-right: 0.4%;" data-theme="a" value="' + self.buttons.save.text_button + '" /></td></tr></table>';
                            buttonsPlace.html(buttonsCode);
                            buttonsPlace.addClass("buttons_form");
                            buttonsPlace.trigger('create');
                            buttonsPlace.find('#save_button').bind("click",function(event, ui) {
                                self.form.savePage();
                            });
                            buttonsPlace.find('#back_button').bind("click",function(event, ui) {
                                self.form.goBack();
                            });
                        }else{
                            //normal buttons
                            buttonsCode = '<input type="button" data-role="button" id="back_button" data-icon="arrow-l" style="margin-left: 0.4%;" data-theme="a" data-iconpos="left" data-iconpos="left" value="' + self.buttons.back.text_button + '" />';
                            buttonsCode += '<input type="button" data-role="button" id="save_button" data-icon="arrow-r" style="margin-right: 0.4%;" data-theme="a" data-iconpos="right" data-iconpos="right" value="' + self.buttons.save.text_button + '" />';
                            buttonsPlace.html(buttonsCode);
                            buttonsPlace.trigger('create');
                            buttonsPlace.find('#back_button').bind("click",function(event, ui) {
                                self.form.goBack();
                            });
                            buttonsPlace.find('#save_button').bind("click",function(event, ui) {
                                self.form.savePage();
                            });
                        }
                    }else{
                        //footer
                        if(self.buttons.back.type_button=="inline" && self.buttons.save.type_button=="inline"){
                            //inline, can't be normal
                            jQuery('div#questionnaire_page #footer #block_right').html('<input id="save_button" type="button" data-icon="arrow-r" class="ui-btn-right" style="float: right;" data-iconpos="right" value="' + self.buttons.save.text_button + '" />');
                            jQuery('div#questionnaire_page #footer #block_left').html('<input id="back_button" type="button" data-icon="arrow-l" class="ui-btn-left" style="float: left;" data-iconpos="left" value="' + self.buttons.back.text_button + '" />');
                            jQuery('div#questionnaire_page #footer').trigger('create');
                            
                            //bind the click event
                            jQuery('div#questionnaire_page #footer #save_button').bind("click",function(event, ui) {
                                self.form.savePage();
                            });
                            jQuery('div#questionnaire_page #footer #back_button').bind("click",function(event, ui) {
                                self.form.goBack();
                            });
                        }else{
                            //can't be normal type
                        }
                    }
                }else if(self.buttons.save){
                    //only got save from database
                    if(self.buttons.save.place_button=="form"){
                        //form button
                        if(self.buttons.save.type_button=="inline"){
                            //inline
                            //inline buttons
                            buttonsCode = '<table class="div_buttons_table"><tr><td align="right"><input type="button" data-role="button" id="save_button" data-iconpos="right" data-inline="true" data-icon="arrow-r" class="ui-btn-right" style="float: right; margin-right: 0.4%;" data-theme="a" value="' + self.buttons.save.text_button + '" /></td></tr></table>';
                            buttonsPlace.html(buttonsCode);
                            buttonsPlace.addClass("buttons_form");
                            buttonsPlace.trigger('create');
                            buttonsPlace.find('#save_button').bind("click",function(event, ui) {
                                self.form.savePage();
                            });
                        }else{
                            //normal
                            buttonsCode = '<input type="button" data-role="button" id="save_button" data-icon="arrow-r" style="margin-right: 0.4%;" data-theme="a" data-iconpos="right" data-iconpos="right" value="' + self.buttons.save.text_button + '" />';
                            buttonsPlace.html(buttonsCode);
                            buttonsPlace.trigger('create');
                            buttonsPlace.find('#save_button').bind("click",function(event, ui) {
                                self.form.savePage();
                            });
                        }
                    }else{
                        //footer
                        if(self.buttons.save.type_button=="inline"){
                            //inline
                            //inline, can't be normal
                            jQuery('div#questionnaire_page #footer #block_right').html('<input id="save_button" type="button" data-icon="arrow-r" class="ui-btn-right" style="float: right;" data-iconpos="right" value="' + self.buttons.save.text_button + '" />');
                            jQuery('div#questionnaire_page #footer').trigger('create');
                            
                            //bind the click event
                            jQuery('div#questionnaire_page #footer #save_button').bind("click",function(event, ui) {
                                self.form.savePage();
                            });
                        }else{
                            //can't be normal type
                        }
                    }
                }else{
                    //got only back
                    if(self.buttons.back.place_button=="form"){
                        //form button
                        if(self.buttons.back.type_button=="inline"){
                            //inline
                            //inline buttons
                            buttonsCode = '<table class="div_buttons_table"><tr><td align="left"><input type="button" data-role="button" id="back_button" data-iconpos="left" data-inline="true" data-icon="arrow-l" class="ui-btn-left" style="float: left; margin-right: 0.4%;" data-theme="a" value="' + self.buttons.back.text_button + '" /></td></tr></table>';
                            buttonsPlace.html(buttonsCode);
                            buttonsPlace.addClass("buttons_form");
                            buttonsPlace.trigger('create');
                            buttonsPlace.find('#back_button').bind("click",function(event, ui) {
                                self.form.goBack();
                            });
                        }else{
                            //normal
                            buttonsCode = '<input type="button" data-role="button" id="back_button" data-icon="arrow-l" style="margin-left: 0.4%;" data-theme="a" data-iconpos="left" data-iconpos="left" value="' + self.buttons.back.text_button + '" />';
                            buttonsPlace.html(buttonsCode);
                            buttonsPlace.trigger('create');
                            buttonsPlace.find('#back_button').bind("click",function(event, ui) {
                                self.form.goBack();
                            });
                        }
                    }else{
                        //footer
                        if(self.buttons.back.type_button=="inline"){
                            //inline
                            //inline, can't be normal
                            jQuery('div#questionnaire_page #footer #block_left').html('<input id="back_button" type="button" data-icon="arrow-l" class="ui-btn-left" style="float: left;" data-iconpos="left" value="' + self.buttons.back.text_button + '" />');
                            jQuery('div#questionnaire_page #footer').trigger('create');
                            
                            //bind the click event
                            jQuery('div#questionnaire_page #footer #back_button').bind("click",function(event, ui) {
                                self.form.savePage();
                            });
                        }else{
                            //can't be normal type
                        }
                    }
                }
            }else{
                if(self.form.activePage!=1){
                //back and forward button
                    if(self.buttons.back && self.buttons.forward){
                        //both forward and back
                        if(self.buttons.back.place_button=="form" && self.buttons.forward.place_button=="form"){
                            if(self.buttons.back.type_button=="inline" && self.buttons.forward.type_button=="inline"){
                                //inline buttons
                                buttonsCode = '<table class="div_buttons_table"><tr><td align="left"><input type="button" data-role="button" id="back_button" data-iconpos="left" data-inline="true" data-icon="arrow-l" class="ui-btn-left" style="float: left;" data-theme="a" value="' + self.buttons.back.text_button + '" /></td>';
                                buttonsCode += '<td align="right"><input type="button" data-role="button" id="next_button" data-iconpos="right" data-inline="true" data-icon="arrow-r" class="ui-btn-right" style="float: right; margin-right: 0.4%;" data-theme="a" value="' + self.buttons.forward.text_button + '" /></td></tr></table>';
                                buttonsPlace.html(buttonsCode);
                                buttonsPlace.addClass("buttons_form");
                                buttonsPlace.trigger('create');
                                buttonsPlace.find('#next_button').bind("click",function(event, ui) {
                                    self.form.savePage();
                                });
                                buttonsPlace.find('#back_button').bind("click",function(event, ui) {
                                    self.form.goBack();
                                });
                            }else{
                                //normal buttons
                                buttonsCode = '<input type="button" data-role="button" id="back_button" data-icon="arrow-l" style="margin-left: 0.4%;" data-theme="a" data-iconpos="left" data-iconpos="left" value="' + self.buttons.back.text_button + '" />';
                                buttonsCode += '<input type="button" data-role="button" id="save_button" data-icon="arrow-r" style="margin-right: 0.4%;" data-theme="a" data-iconpos="right" data-iconpos="right" value="' + self.buttons.forward.text_button + '" />';
                                buttonsPlace.html(buttonsCode);
                                buttonsPlace.trigger('create');
                                buttonsPlace.find('#back_button').bind("click",function(event, ui) {
                                    self.form.goBack();
                                });
                                buttonsPlace.find('#next_button').bind("click",function(event, ui) {
                                    self.form.savePage();
                                });
                            }
                        }else{
                            //footer
                            if(self.buttons.back.type_button=="inline" && self.buttons.forward.type_button=="inline"){
                                //inline, can't be normal
                                jQuery('div#questionnaire_page #footer #block_right').html('<input id="next_button" type="button" data-icon="arrow-r" class="ui-btn-right" style="float: right;" data-iconpos="right" value="' + self.buttons.forward.text_button + '" />');
                                jQuery('div#questionnaire_page #footer #block_left').html('<input id="back_button" type="button" data-icon="arrow-l" class="ui-btn-left" style="float: left;" data-iconpos="left" value="' + self.buttons.back.text_button + '" />');
                                jQuery('div#questionnaire_page #footer').trigger('create');
                                //bind the click event
                                jQuery('div#questionnaire_page #footer #next_button').bind("click",function(event, ui) {
                                    self.form.savePage();
                                });
                                jQuery('div#questionnaire_page #footer #back_button').bind("click",function(event, ui) {
                                    self.form.goBack();
                                });
                            }else{
                                //can't be normal type
                            }
                        }
                    }else if(self.buttons.forward){
                        //only got forward from database
                        if(self.buttons.forward.place_button=="form"){
                            //form button
                            if(self.buttons.forward.type_button=="inline"){
                                //inline
                                //inline buttons
                                buttonsCode = '<table class="div_buttons_table"><tr><td align="right"><input type="button" data-role="button" id="next_button" data-iconpos="right" data-inline="true" data-icon="arrow-r" class="ui-btn-right" style="float: right; margin-right: 0.4%;" data-theme="a" value="' + self.buttons.forward.text_button + '" /></td></tr></table>';
                                buttonsPlace.html(buttonsCode);
                                buttonsPlace.addClass("buttons_form");
                                buttonsPlace.trigger('create');
                                buttonsPlace.find('#next_button').bind("click",function(event, ui) {
                                    self.form.savePage();
                                });
                            }else{
                                //normal
                                buttonsCode = '<input type="button" data-role="button" id="next_button" data-icon="arrow-r" style="margin-right: 0.4%;" data-theme="a" data-iconpos="right" data-iconpos="right" value="' + self.buttons.forward.text_button + '" />';
                                buttonsPlace.html(buttonsCode);
                                buttonsPlace.trigger('create');
                                buttonsPlace.find('#next_button').bind("click",function(event, ui) {
                                    self.form.savePage();
                                });
                            }
                        }else{
                            //footer
                            if(self.buttons.forward.type_button=="inline"){
                                //inline
                                //inline, can't be normal
                                jQuery('div#questionnaire_page #footer #block_left').html('');
                                jQuery('div#questionnaire_page #footer #block_right').html('<input id="next_button" type="button" data-icon="arrow-r" class="ui-btn-right" style="float: right;" data-iconpos="right" value="' + self.buttons.forward.text_button + '" />');
                                jQuery('div#questionnaire_page #footer').trigger('create');
                                
                                //bind the click event
                                jQuery('div#questionnaire_page #footer #next_button').bind("click",function(event, ui) {
                                    self.form.savePage();
                                });
                            }else{
                                //can't be normal type
                            }
                        }
                    }else{
                        //got only back
                        if(self.buttons.back.place_button=="form"){
                            //form button
                            if(self.buttons.back.type_button=="inline"){
                                //inline
                                //inline buttons
                                buttonsCode = '<table class="div_buttons_table"><tr><td align="left"><input type="button" data-role="button" id="back_button" data-iconpos="left" data-inline="true" data-icon="arrow-l" class="ui-btn-left" style="float: left; margin-right: 0.4%;" data-theme="a" value="' + self.buttons.back.text_button + '" /></td></tr></table>';
                                buttonsPlace.html(buttonsCode);
                                buttonsPlace.addClass("buttons_form");
                                buttonsPlace.trigger('create');
                                buttonsPlace.find('#back_button').bind("click",function(event, ui) {
                                    self.form.goBack();
                                });
                            }else{
                                //normal
                                buttonsCode = '<input type="button" data-role="button" id="back_button" data-icon="arrow-l" style="margin-left: 0.4%;" data-theme="a" data-iconpos="left" data-iconpos="left" value="' + self.buttons.back.text_button + '" />';
                                buttonsPlace.html(buttonsCode);
                                buttonsPlace.trigger('create');
                                buttonsPlace.find('#back_button').bind("click",function(event, ui) {
                                    self.form.goBack();
                                });
                            }
                        }else{
                            //footer
                            if(self.buttons.back.type_button=="inline"){
                                //inline
                                //inline, can't be normal
                                jQuery('div#questionnaire_page #footer #block_left').html('<input id="back_button" type="button" data-icon="arrow-l" class="ui-btn-left" style="float: left;" data-iconpos="left" value="' + self.buttons.back.text_button + '" />');
                                jQuery('div#questionnaire_page #footer #block_right').html('');
                                jQuery('div#questionnaire_page #footer').trigger('create');
    
                                //bind the click event
                                jQuery('div#questionnaire_page #footer #back_button').bind("click",function(event, ui) {
                                    self.form.savePage();
                                });
                            }else{
                                //can't be normal type
                            }
                        }
                    }
                }else{
                    //first page again
                    self.paintInitialButtons();
                }
            }    
        }else{
            //PDJ Form                    
            //show only next page
            if(self.buttons.forward){
                if(self.buttons.forward.place_button == "footer"){
                    //footer
                    if(self.buttons.forward.type_button == "inline"){
                        //inline
                        jQuery('div#questionnaire_page #footer #block_right').html('<input id="next_button" type="button" data-icon="arrow-r" class="ui-btn-right" style="float: left;" data-iconpos="right" value="' + self.buttons.forward.text_button + '" />');
                        jQuery('div#questionnaire_page #footer').trigger('create');
                        
                        //bind the click event
                        jQuery('div#questionnaire_page #footer #next_button').bind("click",function(event, ui) {
                            self.form.savePage();
                        });
                    }else{
                        //cant be normal button
                    }
                }else{
                    //form, non footer
                    var buttonsPlace = jQuery('#' + self.form.place + ' #div_buttons');
                    if(self.buttons.forward.type_button == "inline"){
                        //inline
                        buttonsCode = '<table class="div_buttons_table"><tr><td align="right"><input type="button" data-role="button" id="next_button" data-iconpos="right" data-inline="true" data-icon="arrow-r" class="ui-btn-right" style="float: right; margin-right: 0.4%;" data-theme="a" value="' + self.buttons.forward.text_button + '" /></td></tr></table>';
                        buttonsPlace.html(buttonsCode);
                        buttonsPlace.addClass("buttons_form");
                        buttonsPlace.trigger('create');
                        buttonsPlace.find('#next_button').bind("click",function(event, ui) {
                            self.form.savePage();
                        });
                    }else{
                        //normal
                        buttonsCode = '<input type="button" data-role="button" id="next_button" data-icon="arrow-r" style="margin-right: 0.4%;" data-theme="a" data-iconpos="right" data-iconpos="right" value="' + self.buttons.forward.text_button + '" />';
                        buttonsPlace.html(buttonsCode);
                        buttonsPlace.trigger('create');
                        buttonsPlace.find('#next_button').bind("click",function(event, ui) {
                            self.form.savePage();
                        });
                    }
                }
            }
        }    
    };
}