/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function ProgressBar(form){
    
    this.width = "";
    this.form = form;
    
    
    this.initBar = function(){
        var self = this;
        var barCode = '<div id="progress-outer"><div id="progress-inner"></div></div>';    
        jQuery('#' + self.form.place + ' div#div_buttons').before(barCode);
    };
    
    this.updateBar = function(){
        var self = this;
         //calculate percentage complete
         var totalQuestions = self.form.data.questions.length;
         
         //percentage
         var percentage = (self.form.activePage - 1)/totalQuestions;
         percentage = (jQuery('#' + self.form.place + ' #progress-outer').width() * percentage).toFixed(0);
         jQuery('#' + self.form.place + ' #progress-inner').animate({
             "width": percentage + "px"
         }, 500);
    };
}