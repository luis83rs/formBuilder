//divprincipal; Ya viene dado
//base_url url donde está el módulo
//domainURL url sin http donde está el módulo
var modal_popup;
var id_form; //Form selected

var html_popups;
var modal_popupQuestion;
var modal_preview;

var list_question;

var tableQuestion;
var capaGris = "<div id='capaGris'><div id='loading'>Loading...</div></div>";
/**************** ARRAYS QUESTION ***************/
var questionArray    = new Array;
var option           = new Array;
var rowoption        = new Array;
var coloption        = new Array;
var condition        = new Array;
var image_upload     = new Array;
var image_uploadROW  = new Array;
var image_uploadCOL  = new Array;
/************************************************/

var idquestion; //Question selected

function questionshow(idform)
{
	divprincipal.html("");
    divprincipal.append(capaGris);
	div_headerform = "<div id='headerQuestion'>";
	div_headerform += "<div class='addquestion'><a class='button' href='javascript:addQuestion();'>New question</a></div>";
	div_headerform += "<div class='previewfinishquestion'><div class='previewfinishquestionright'>";
        div_headerform += "<a class='button' onclick='javascript:getPreview();'>Preview</a>";
        div_headerform += "<a class='button' onclick='javascript:Finish();'>Finish</a>";
        div_headerform += "<a class='button' onclick='javascript:Help();'>Help</a>";
        div_headerform += "</div></div>";
	div_headerform += "</div>";
	divprincipal.append(div_headerform);
	
	id_form = idform;
	divprincipal.append("<div class='list-question'  style='border-radius:5px;'></div><div class='edit-question-container'  style='border-radius:5px; background-color:#EEEEEE'><div class='edit-question'></div></div>");
    
    list_question = jQuery(".list-question");
    
    html_popups = "<div class='container-modal-popup'>";
    html_popups += "<div id='modal_popupQuestion'></div>";
    html_popups += "</div><div id='form_data'></div>";
    html_popups += "<div id='content_preview'><a id='btn-close-preview' onclick='javascript:closePreview();'></a><div id='preview'><div id='form_content'><div></div></div>";
    
    divprincipal.append(html_popups);
    //divprincipal.append("<a class='button' onclick='javascript:getPreview();'>Preview</a><a class='button'>Finish</a>");
    container_modal_popup = jQuery(".container-modal-popup");
    //modal_popupQuestion = jQuery("#modal_popupQuestion");
    modal_popupQuestion = jQuery(".edit-question");
    
    modal_preview = jQuery("#content_preview");
	gridHeaderQuestion();
}
/**************************************************************/
/*************************** Header ***************************/
/**************************************************************/
function gridHeaderQuestion()
{
	var grid = "<div class='divgridHeaderQuestion'>";
	grid += "<div class='col colindice'>&nbsp;</div>";
	grid += "<div class='col coltexto'>Question (drag to change order)</div>";
	//grid += "<div class='col coloptions'><input type='text' id='page_index' style='width:20px; float:left'/><img id='btn_add_page_break' class='btn_delete_conditional_rule' src='"+base_url+"/images/boton_anadir.png' width='14px' style='margin-left:10px; cursor:pointer; float:left' border='0' /></div>";
    grid += "<div class='col coloptions'>&nbsp;</div>";
	grid += "</div>";
	
    //divprincipal.append(grid);
    
    list_question.append(grid);
	
    gridBodyQuestion();
}

/**************************************************************/
/**************************** Body ****************************/
/**************************************************************/
function gridBodyQuestion()
{
	var divauxiliar = "<div id='divgridBodyQuestion'>";
    var page_break = "<div class='page_break'>Drag to add page-break</div>";
    var page_break_insert = "<div class='page_break'>page break<span class='btn_delete_pagebreak'>Delete</span><span class='btn_clone_pagebreak'>Clone</span></div>";
    
    divauxiliar += page_break;
    
    jQuery.ajax({
        type: 'POST',
        url: '/questionnaire/selectquestion/'+id_form,
        data: {nid:nid},
        success: function(data){
            
            json = jQuery.parseJSON(data);
            
            var pageBreaks = new Array();
            
            for(var x = 0; x < json[json.length-1].length; x++) {
                pageBreaks.push(parseInt(json[json.length-1][x].num_questions));
            }
            
            var pageBreakPosition = 0;
    		jQuery.each(json, function(index, array) {
                //el ultimo registro del array json son los saltos de pagina, con lo cual no debemos
                //pintarlo
                
                //PINTADO DE LAS PREGUNTAS VENTANA DE LA IZQ
                if(index < json.length - 1) {

                    if (esPar(index) == true) {
        	           divauxiliar += "<div id='question-row-" + array['id_question'] + "' class='divgridBody'>";
                    } else {
                       divauxiliar += "<div id='question-row-" + array['id_question'] + "' class='divgridBodyColor'>";
                    }
        			divauxiliar += "<div class='col colindice'>" + (parseInt(index) + 1) + "</div>";
                    divauxiliar += "<input type='hidden' class='ocid' value='"+array['id_question']+"' />";
                    
                    var class_padding = "reg-not-conditional";
                    
                    if(array['conditional'] == "1") {
                        divauxiliar += "<div class='icon-conditional'></div>";
                        class_padding = "reg-conditional";
                    }
                    divauxiliar += "<a href='javascript:editQuestion("+array['id_question']+");'><div class='col colquestion " + class_padding + "'>";
                    divauxiliar += array['question'] != null? array['question']: '&nbsp;';
                    divauxiliar += "</div></a>";
                    
        			divauxiliar += "<div class='col coloptions'>";
                    divauxiliar += "<a href='javascript:cloneQuestion("+array['id_question']+");'>Clone</a>&nbsp;";
                    divauxiliar += "<a href='javascript:editQuestion("+array['id_question']+");'>Edit</a>&nbsp;";
                    divauxiliar += "<a href='javascript:delQuestion("+array['id_question']+");'>Delete</a></div>";
        			divauxiliar += "</div>";
                }
                
                pageBreakPosition++;
                
                if(pageBreakPosition == pageBreaks[0]) {
                    divauxiliar += page_break_insert;
                    pageBreaks.splice(0,1);
                    pageBreakPosition = 0;
                }
    		});
            divauxiliar += "</div>";
            
    		//divprincipal.append(divauxiliar);
            
            list_question.append(divauxiliar);
                        
            //añadimos los pagebreaks, que se encuentran en el ultimo registro del array json
    		jQuery("#divgridBodyQuestion").sortable("stop").sortable({
    		    placeholder: "row-selected",
                containment: "parent",
                beforeStop: function(event,ui){
                    var element = jQuery(this);
                    questionArray = []; //Array ordered with all questions
                    var idquestionClick = jQuery(ui.item).attr("id").replace("question-row-","");
                    /*var ordertotheidquestionclick;
                    var indice = 0;                    
                    jQuery("#divgridBodyQuestion").children().each(function(x, elem) {                        
                        var idquestion;                        
                        switch (jQuery(elem).attr("class"))
                        {
                            case 'divgridBody':
                            case 'divgridBodyColor':
                                idquestion = jQuery(elem).attr("id").replace("question-row-","");
                                questionArray.push(idquestion);
                                if (idquestion == idquestionClick){
                                    ordertotheidquestionclick = indice;
                                }
                                indice++;
                            break;
                        }
                    });*/
                    jQuery("#capaGris").css("display","block");
                    jQuery.ajax({
                        type: 'POST',
                        url: '/questionnaire/enableorder/'+id_form,
                        data: {question:idquestionClick},
                        success: function(data){
                            jQuery("#capaGris").css("display","none");
                            if(data > 0){
                                jQuery("#divgridBodyQuestion").sortable('cancel');
                                alert('This question depends on another one or another one depends on this one!')
                            }else{
                                if(jQuery(ui.item).hasClass("page_break")) {
                                    //page break
                                    if(!jQuery(element).children().eq(0).hasClass("page_break")) {
                                        jQuery(element).prepend(page_break);
                                        jQuery(ui.item).text("page break");
                                        jQuery(ui.item).append("<span class='btn_delete_pagebreak'>Delete</span><span class='btn_clone_pagebreak'>Clone</span>");
                                    }
                                    else {
                                        if(jQuery(ui.item).index() == 0 && jQuery(element).children().eq(1).hasClass("page_break") 
                                        || jQuery(ui.item).index() == 1 && jQuery(element).children().eq(0).hasClass("page_break")) { 
                                            jQuery(ui.item).remove();
                                        }
                                    }
                                }
                                else {
                                    //question                                                
                                    var index = 0;
                                    jQuery(element).children().each(function(x, elem) {
                                        if(jQuery(elem).find(".colindice").length) {
                                            jQuery(elem).find(".colindice").text((index + 1));
                                            index++;
                                        }   
                                    });
                                }
                                
                                //eliminamos todos los posibles pagebreak por encima de la primera pregunta
                                while(jQuery(element).children().eq(1).hasClass("page_break")) {
                                    jQuery(element).children().eq(1).remove();
                                }
                                
                                //eliminamos todos los posibles pagebreak al final de las preguntas
                                var last_item = parseInt(jQuery(element).children().size()) - 1;
                                while(jQuery(element).children().eq(last_item).hasClass("page_break")) {
                                    jQuery(element).children().eq(last_item).remove();
                                    last_item = parseInt(jQuery(element).children().size()) - 1;
                                }
                                
                                //eliminamos los pagebreak contiguos
                                var elem_index = 1;
                                var actual_elem =  jQuery(element).children().eq(elem_index);
                                
                                while(elem_index < jQuery(element).children().size()) {
                                    if(actual_elem.hasClass("page_break") && actual_elem.next().hasClass("page_break")) {
                                        actual_elem.next().remove();
                                    } else {
                                        elem_index++;
                                        actual_elem = jQuery(element).children().eq(elem_index);
                                    }
                                }
                                
                                //si hay alguna pregunta seleccionada, lanzamos la funcion editQuestion click para repintar
                                var selected_question = jQuery("#divgridBodyQuestion").find(".divgridBodyColorSelected");
                                if(selected_question.length) {
                                    var id_question = selected_question.attr("id").split('-')[2];
                                    editQuestion(id_question);     
                                }
            					updateorderQuestion();
                                updateorderPagebreak();
                            }
                        }
                    });
                },
    		});
  		  //gridFooterQuestion();            
        }
    });
}
/*********************************************** PAGE BREAK *****************************************************/
jQuery(".page_break .btn_delete_pagebreak").live("click",function(){
    jQuery(this).parent().remove();
    if(!jQuery(this).parent().next().hasClass("page_break") && !jQuery(this).parent().prev().hasClass("page_break")) 
        updateorderPagebreak();
});

jQuery(".page_break .btn_clone_pagebreak").live("click",function(){
    var new_page_break = jQuery(this).parent().clone();
    if(jQuery(this).parent().next().index() + 1 != jQuery(this).parent().parent().children().size()
        && jQuery(this).parent().next().next().hasClass("page_break") != true) {
        jQuery(this).parent().next().after(new_page_break);
        updateorderPagebreak();
    }  
});
/****************************************************************************************************************/
function updateorderPagebreak() {
    
    var arrayPagebreak = new Array();
    var count = 0;
    
    jQuery("#divgridBodyQuestion").children().each(function(x, elem){
        if(jQuery(elem).hasClass("page_break") && x > 0) {
            arrayPagebreak.push(count-1);
            count = 0;
        }
        count++;
    });
    
    jQuery.ajax({
        type: 'POST',
        url: '/questionnaire/updatepagebreakquestion/'+id_form,
        data: {arrayPagebreak:arrayPagebreak, numpages: arrayPagebreak.length},
        success: function(data) {
            //console.log(data);
        }
    });
}
/***************************************************************************************************************/
function updateorderQuestion()
{
	var updateorder = new Array;
    var idQuestion;
    var count = 1;
    var selected = 0;
	jQuery("#divgridBodyQuestion").children().each(function(x, elem){
	       
       if(!jQuery(elem).hasClass("page_break")) {
	       order = jQuery(elem).find(".colindice").text();
           idQuestion = jQuery(elem).find(".ocid").val();
		   updateorder.push(idQuestion+"$$"+order);
            
           if(jQuery(elem).hasClass("divgridBodyColorSelected"))
                selected = 1;
           
           jQuery(elem).removeAttr("class");
           
           if(selected == 1)
                jQuery(elem).addClass("divgridBodyColorSelected");
           
           if(esPar(count))
                jQuery(elem).addClass("divgridBodyColor");
           else
                jQuery(elem).addClass("divgridBody");            
            
            selected = 0;
            count++;
       } else {
           //page-break
       }
				
	});
	jQuery.ajax({
        type: 'POST',
        url: '/questionnaire/updateorderquestion/'+id_form,
        data: {updateorder:updateorder}
    });
}
/***************************************************************/
function addQuestion()
{
    idquestion = "";
    jQuery(".divgridBodyColorSelected").removeClass("divgridBodyColorSelected");
    CleanModalPopup();
	ModalPopupHeaderQuestion();    
}
function cloneQuestion(idquestion){
    if(confirm("Are you sure you want to clone the question?")){
        jQuery.ajax({
            type: 'POST',
            url: '/questionnaire/clonequestion/'+id_form,
            data: {idquestion: idquestion},
            success: function(data){
                console.log(data);
                
                CleanModalPopup();
                jQuery(".divgridHeaderQuestion").remove();
    		    jQuery("#divgridBodyQuestion").remove();
                gridHeaderQuestion();
            }
        });
    }
}
function editQuestion(id)
{
    jQuery("#capaGris").css("display","block");
    CleanModalPopup();
    var idtemp;
    if (idquestion != "")
    {
        idtemp = 'question-row-'+idquestion;
        jQuery("#"+idtemp).removeClass("divgridBodyColorSelected");
    }
    idtemp = 'question-row-'+id ;
    jQuery("#"+idtemp).addClass("divgridBodyColorSelected");
    idquestion = id;
	ModalPopupHeaderQuestion();
	jQuery.ajax({
        type: 'POST',
        url: '/questionnaire/selectquestionid/'+id_form,
        data: {questionselect: idquestion},
        success: function(data){
            json = jQuery.parseJSON(data);
    		jQuery.each(json, function(index, array) {
				jQuery("#txtfieldquestion").val(array['question']);
                jQuery("#txtfielddescription").val(array['description']);
                if (array['mandatory'] == 1) {
                    jQuery("#ckmandatoryquestion").attr('checked', true);
                } 
                else{
                    jQuery("#ckmandatoryquestion").attr('checked', false);
                }
                if (array['haslastoption'] == 1) {
                    jQuery("#ckmandatoryquestion").attr('checked', true);
                } 
                else{
                    jQuery("#ckmandatoryquestion").attr('checked', false);
                }
				jQuery("#ddfieldtype").val(array['type']);
                typeQuestion();               
                jQuery("#ddfieldsubtype").val(array['subtype']);
                if (array['subtype'] == 'multiple' || array['type']== 'sortable' || array['type']== 'dropdown' || array['type']== 'radioButton'){
                    jQuery.ajax({
                        type: 'POST',
                        url: '/questionnaire/selectoption',
                        data: {idquestion: idquestion},
                        success: function(data){
                            json = jQuery.parseJSON(data);
                    		jQuery.each(json, function(index, array) {
                  				  addmultipleoption(array['text'],array['image_path'],array['order']);
                    		});
                            jQuery("#multipleoption tbody").sortable("destroy")
                            .sortable({
                                stop: function (event,ui) {
                                    option.splice(0,option.length);                                    
                                    jQuery("#multipleoption tbody tr").each(function(x,elem){
                                        option.push(jQuery(elem).children().eq(0).html());    
                                    });
                                }
                            });
                        }
                    });
                    if (array['subtype'] == 'multiple'){
                       subtypeQuestion(); 
                    }                    
                }
                if (array['random_options'] == 1) {
                    jQuery("#ddfieldrandomoptions").attr('checked', true);
                } 
                else{
                    jQuery("#ddfieldrandomoptions").attr('checked', false);
                } 
                if (array['type']== 'grid'){
                    jQuery.ajax({
                        type: 'POST',
                        url: '/questionnaire/selectgridrow',
                        data: {idquestion: idquestion},
                        success: function(data){
                            json = jQuery.parseJSON(data);
                    		jQuery.each(json, function(index, array) {
                  				  addgridoptionrow(array['text'],array['image_path'],array['order']);
                    		});
                            jQuery("#gridoptionrow tbody").sortable("destroy")
                            .sortable({
                                stop: function (event,ui) {
                                    rowoption.splice(0,rowoption.length);
                                    jQuery("#gridoptionrow tbody tr").each(function(x,elem){
                                        rowoption.push(jQuery(elem).children().eq(0).html());    
                                    });
                                }
                            });
                        }
                    });
                    jQuery.ajax({
                        type: 'POST',
                        url: '/questionnaire/selectgridcol',
                        data: {idquestion: idquestion},
                        success: function(data){
                            json = jQuery.parseJSON(data);
                    		jQuery.each(json, function(index, array) {
                  				  addgridoptioncol(array['text'],array['image_path'],array['order']);
                                  jQuery("#gridtrhead").removeClass("gridtr");
			                      jQuery("#gridtrtext").removeClass("gridtr");
			                      jQuery("#gridtroption").removeClass("gridtr");
                    		});
                            jQuery("#gridoptioncol tbody").sortable("destroy")
                            .sortable({
                                stop: function (event,ui) {
                                    coloption.splice(0,coloption.length);
                                    jQuery("#gridoptioncol tbody tr").each(function(x,elem){
                                        coloption.push(jQuery(elem).children().eq(0).html());    
                                    });
                                }
                            });
                        }
                    });
                }
                //Conditionals
                jQuery.ajax({
                    type: 'POST',
                    url: '/questionnaire/selectconditionals/'+id_form,
                    data: {idquestion: idquestion},
                    success: function(data){
                        json = jQuery.parseJSON(data);
                        
                        if (json.length > 0)
                        {                  
                            jQuery("#tablemodalpopupconditionalrulesadd").html("");
                            var tablethead;
                            var tabletbody;
                            var Conditionals = new Array;
                            var index_question = 1;
                            var array_elements = jQuery("#ddconditionquestion").data('elements');
                            
                            tablethead = "<thead><tr style='width:100%'>";
                            tablethead += "<th style='width:65%;text-align:center;'>To</th>";
                            tablethead += "<th style='width:5%;text-align:center;'>Type</th>";
                            tablethead += "<th style='width:20%;text-align:center;'>Value</th>";
                            tablethead += "<th style='width:5%;'></th>";
                            tablethead += "</tr></thead><tbody id='tablemodalpopupconditionalrulesTBODY'></tbody>";
                            jQuery("#tablemodalpopupconditionalrulesadd").append(tablethead);
                    		
                            jQuery.each(json, function(index, array) {
                    		      Conditionals = [];
                                  Conditionals.push(array['id_question_dependence']);
                                  Conditionals.push(array['logic']);
                                  Conditionals.push(array['id_option_dependence']);
                                  condition.push(Conditionals);
                                  console.log(array['logic']);                         
                                  if (array['logic'] == 'AND'){
                                    jQuery("#spantypelogicOR").css("display","none");
                                  }
                                  else{
                                    jQuery("#spantypelogicAND").css("display","none");
                                  }
                    		      tr = "<tr>";                                  
                                  tr += "<td style='text-align:left;padding:3px 0px 3px 0px !important;'>" + array['order'] + " - " + array['question'] + "</td>";
                                  tr += "<td style='text-align:center;padding:3px 0px 3px 0px !important;'>" + array['logic'] + "</td>";
                                  if (array['text'] != ""){
                                    tr += "<td style='text-align:center;padding:3px 0px 3px 0px !important;'>" + array['text'] + "</td>";
                                  }
                                  else{
                                    tr += "<td style='text-align:center;padding:3px 0px 3px 0px !important;'>" + array['id_option_dependence'] + "</td>";
                                  }                                  
                                  tr += "<td style='text-align:rightpadding:3px 0px 3px 0px !important;'><img class='btn_delete_conditional_rule' src='"+base_url+"/images/boton_quitar.png' width='25' style='margin-right:1px; vertical-align: middle; cursor:pointer;' border='0' /></td>";
                                  tr += "</tr>";
                                  jQuery("#tablemodalpopupconditionalrulesTBODY").append(tr);
                                  jQuery("#tablemodalpopupconditionalrulesadd").css("display","block");
                    		});
                        }
                        jQuery("#capaGris").css("display","none");
                    }
                });
    		});
        }
    });
}

jQuery(".btn_delete_conditional_rule").live("click",function(){
    var index = jQuery(this).parent().parent().index();
    condition.splice(index,1);
    jQuery(this).parent().parent().remove();
});

function delQuestion(id)
{
	idquestion = id;
	jQuery.ajax({
        type: 'POST',
        url: '/questionnaire/selectquestionid/'+id_form,
        data: {questionselect: idquestion},
        success: function(data){
            json = jQuery.parseJSON(data);
    		jQuery.each(json, function(index, array) {
                if(confirm("Are you sure you want to delete the question, "+array['question'] + "?")){
            	    jQuery.ajax({
                        type: 'POST',
                        url: '/questionnaire/delquestion/'+id_form,
                        data: {questiondelete: idquestion},
                        success: function(data){
                            CleanModalPopup();
                            jQuery(".divgridHeaderQuestion").remove();
                    		jQuery("#divgridBodyQuestion").remove();
                    		gridHeaderQuestion();
                        }
                    });
                } 
                else {
                    console.log('no borrar');
                } 
    		});
        }
    });
}
function saveQuestion()
{
    document.getElementById("divgridBodyQuestion").scrollTop = 0;
    
	if (jQuery("#txtfieldquestion").val() == "" || jQuery("#ddfieldtype").val() == "")
    {
       alert('Please, fill all options.');
    }
    else
    {
    	var objregistro = new Object();
    	objregistro.question        = jQuery("#txtfieldquestion").val();
    	objregistro.description     = jQuery("#txtfielddescription").val() == 'Please type here' ? '' : jQuery("#txtfielddescription").val();
        objregistro.mandatory       = jQuery("#ckmandatoryquestion").attr('checked') == true ? 1 : 0;
        objregistro.haslastoption   = jQuery("#cklastoptionquestion").attr('checked') == true ? 1 : 0;
    	objregistro.type            = jQuery("#ddfieldtype").val();
        objregistro.random_options  = 0; //Null by defect
    	if (objregistro.type == 'grid')
    	{
    		objregistro.rowoption = rowoption;	
    		objregistro.coloption = coloption;	
            objregistro.random_options = jQuery("#ddfieldrandomoptions").attr('checked') == true ? 1 : 0;
    	}
    	if (objregistro.type == 'dropdown')
    	{
    		objregistro.option = option;
            objregistro.random_options = jQuery("#ddfieldrandomoptions").attr('checked') == true ? 1 : 0;	
    	}
    	if (objregistro.type == 'sortable')
    	{
    		objregistro.option = option;
            objregistro.random_options = jQuery("#ddfieldrandomoptions").attr('checked') == true ? 1 : 0;
    	}
        if (objregistro.type == 'radioButton')
    	{
    		objregistro.option = option;
    	}
    	objregistro.subtype = jQuery("#ddfieldsubtype").val();
    	if (objregistro.subtype == 'multiple')
    	{
    		objregistro.option = option;
            objregistro.random_options = jQuery("#ddfieldrandomoptions").attr('checked') == true ? 1 : 0;	
    	}
        objregistro.image_upload    = image_upload; //Images option
        objregistro.image_uploadROW = image_uploadROW; //Images row
        objregistro.image_uploadCOL = image_uploadCOL; //Images col
    	objregistro.id_form = id_form;
    	if (idquestion != "")
    		objregistro.idquestion = idquestion;
        objregistro.condition = condition;  //Condicional                       
        jQuery.post('/questionnaire/savequestion', {questionsave: objregistro}, function(data) {
    		
            CleanModalPopup();
            
    		jQuery(".divgridHeaderQuestion").remove();
    		jQuery("#divgridBodyQuestion").remove();

    		gridHeaderQuestion();
            idquestion = ""; //Remove question selected
            alert('Question has been saved sucessfully.')
    	});
	}
}
/***************************************************************/
/************************** Modal Popup ************************/
/***************************************************************/
function CleanModalPopup(){
    option       = []; //Erase the global Array option
    rowoption    = []; //Erase the global Array rowoption
	coloption    = []; //Erase the global Array coloption
    condition    = []; //Erase the global Array condition
    image_upload = []; //Erase the global Array image
    modal_popupQuestion.html("");
}
function ModalPopupHeaderQuestion()
{
    modal_popupQuestion.html("");
	
    var botonSave = "<div id='tableSaveQuestion'><div style='width:200px;'><a id='btn-save-question' class='button' style='background-color:#333' onclick='javascript:saveQuestion();'>Save Question</a></div></div>";    
    var tablePopup = "<div id='tableQuestion' style='background-color:#EEEEEE'>";
    tablePopup += "</div>";
    
	modal_popupQuestion.append(tablePopup);
    //modal_popupQuestion.after(botonSave);
    modal_popupQuestion.append(botonSave);
    
    tableQuestion = jQuery("#tableQuestion");
	
    ModalPopupBodyQuestion();
    tableQuestion.accordion({
        fillSpace: true
    });
    showandhideConditionals();
}
function filloptionsconditionals()
{   
    jQuery("#ddcondicionaloption").html("");
    jQuery("#spantypelogicAND").css("display","none");
    jQuery("#spantypelogicOR").css("display","none");
    jQuery("#spanvaluecondicionals").css("display","none");
    jQuery("#ddcondicionaloption").css("display","none");
    jQuery("#tbconditionals").css("display","none");
    if (jQuery("#ddconditionquestion").val() != '')
    {   
        jQuery.ajax({
            type: 'POST',
            url: '/questionnaire/conditionoptions',
            data: {conditionoptions: jQuery("#ddconditionquestion").val()},
            success: function(data){
                if(data)
                {
                    /*if (jQuery("#tablemodalpopupconditionalrules").css("display") == "none"){*/
                        jQuery("#spantypelogicAND").css("display","block");
                        jQuery("#spantypelogicOR").css("display","block");
                    /*}*/                    
                    jQuery("#spanvaluecondicionals").css("display","block");
                    var Arrayoption;
                    jQuery("#tbconditionals").css("display","none");
                    jQuery("#ddcondicionaloption").css("display","block");
                    json = jQuery.parseJSON(data);
        	        jQuery.each(json, function(index, array) {
                        jQuery("#ddcondicionaloption").append("<option value='" + array['id_option'] + "'>" + array['text'] + "</option>");	              
                    });  
                    if(json.length == 0)
                    {
                        jQuery("#ddcondicionaloption").css("display","none");
                        jQuery("#tbconditionals").css("display","block");                
                    }
                }                
            }
        });
    }
}
function showandhideConditionals()
{
    var objcondicionals = new Object();
    var array_index = new Array();
    var array_element;
    objcondicionals.id_form = id_form;
    objcondicionals.id_question = idquestion;                                
    jQuery.ajax({
        type: 'POST',
        url: '/questionnaire/conditionquestions',
        data: {conditionquestions: objcondicionals},
        success: function(data){
            var Arrayquestion;
            jQuery("#ddconditionquestion").children().remove();
            json = jQuery.parseJSON(data);
            jQuery("#ddconditionquestion").append("<option value=''>Select</option>");
	        jQuery.each(json, function(index, array) {
	              if(array['question'].length > 60) {
                      Arrayquestion = array['question'].substring(0,49) + "...";
                  }
                  else
                      Arrayquestion = array['question'];
                  
                  array_element = [(index + 1),Arrayquestion];
                  array_index.push(array_element);     
	              jQuery("#ddconditionquestion").append("<option id='opt_" + (index + 1) + "' value='" + array['id_question'] + "'>" + (index + 1) + " - "  + Arrayquestion + "</option>");
            });   
            jQuery("#ddconditionquestion").data('elements',array_index);   
        }
    });        
}
function addconditional()
{
    var typecondicion;

    //sólo entramos si hemos seleccionado alguna opción del dropdown
    if(jQuery("#ddconditionquestion").val() != "" && (jQuery("input:radio[name=rbconditionals]")[0].checked || jQuery("input:radio[name=rbconditionals]")[1].checked)) {
        if (jQuery("input:radio[name=rbconditionals]")[0].checked == true){
            typecondicion = "AND";            
        }            
        else{
            typecondicion = "OR";
        }            
            
        var optioncondition;
        var optionconditionforDB;
        if (jQuery("#ddcondicionaloption").val() != null)
        {
            optioncondition = jQuery("#ddcondicionaloption option:selected").text();
            optionconditionforDB = jQuery("#ddcondicionaloption option:selected").val();
        }
        else
        {
           optioncondition = jQuery("#tbconditionals").val();
           optionconditionforDB = jQuery("#tbconditionals").val();
        }
        
        if(jQuery("#tablemodalpopupconditionalrulesadd").css("display") == "none")
        {
            var htmlvar = "<thead><tr>";
            htmlvar += "<th>To</th>";
            htmlvar += "<th>Type</th>";
            htmlvar += "<th>Value</th>";
            htmlvar += "</tr></thead><tbody id='tablemodalpopupconditionalrulesTBODY'></tbody>";
            jQuery("#tablemodalpopupconditionalrulesadd").append(htmlvar);
            jQuery("#tablemodalpopupconditionalrulesadd").css("display","block");
        }
        if(jQuery("#tablemodalpopupconditionalrulesadd").css("display") == "block")
        {
            var Conditionals = new Array;
            Conditionals.push(jQuery("#ddconditionquestion").val());
            Conditionals.push(typecondicion);
            Conditionals.push(optionconditionforDB);
            condition.push(Conditionals);
            var htmlvar = "<tr>";
            htmlvar += "<td>";
            htmlvar += jQuery("#ddconditionquestion option:selected").text();
            htmlvar += "</td>";
            htmlvar += "<td>" + typecondicion;
            htmlvar += "</td>";
            htmlvar += "<td>"; 
            htmlvar += optioncondition;
            htmlvar += "</td>";
            htmlvar += "<td><img class='btn_delete_conditional_rule' src='"+base_url+"/images/boton_quitar.png' width='25' style='margin-left:10px; margin-top: -6px; vertical-align: middle; cursor:pointer;' border='0' /></td>";
            htmlvar += "</tr>";
            
            jQuery("#tablemodalpopupconditionalrulesTBODY").append(htmlvar);
        }
        
        jQuery("#ddconditionquestion").val(0);
        jQuery("input:radio[name=rbconditionals]")[0].checked = false;
        jQuery("input:radio[name=rbconditionals]")[1].checked = false;
        jQuery("#tbconditionals").val('');
        jQuery("#tbconditionals").css("display","none");
        jQuery("#ddcondicionaloption").html("");
        jQuery("#ddcondicionaloption").css("display","none"); 
        jQuery("#spanvaluecondicionals").css("display","none");
    }
}
function ModalPopupBodyQuestion()
{
    var tbody;

    tbody = "<div class='divGeneral' style='padding-top:10px; padding-bottom:10px; background-color:#EF4619; '><a href='#'>Title</a></div>";
    
    tbody += "<div><table cellspacing='7' style='font-family:Arial, Helvetica, sans-serif; border:0px'>";
	tbody += "<tr>";
        tbody += "<td width='20%' style='color:#666'>Question</td>";	
        tbody += "<td width='80%'><textarea id='txtfieldquestion' style='width:90%' onfocus='textfielddelete(this)' onblur='textfieldwrite(this)'>Please type here</textarea></td>";
    tbody += "</tr>";
    tbody += "<tr>"; 
        tbody += "<td style='color:#666'>Description</td>";
        tbody += "<td><textarea id='txtfielddescription' style='width:90%' onfocus='textfielddelete(this)' onblur='textfieldwrite(this)'>Please type here</textarea></td>";
    tbody += "</tr>";
    tbody += "<tr>"; 
        tbody += "<td style='color:#666'>Mandatory</td>";
        tbody += "<td><input type='checkbox' id='ckmandatoryquestion' />&nbsp;Mark for mandatory question</td>";
    tbody += "</tr>";
    tbody += "<tr>"; 
        tbody += "<td style='color:#666'>Last option</td>";
        tbody += "<td><input type='checkbox' id='cklastoptionquestion' />&nbsp;Mark for question to have last option fixed</td>";
    tbody += "</tr>";
    tbody += "</table></div>";
    
    tbody += "<div class='divGeneral' style='padding-top:10px;background-color:#EF4619; padding-bottom:10px'><a href='#'>Options</a></div>";
   
    tbody += "<div><table cellspacing='7' style='margin:0px' id='tablemodalpopupoptions'>";
    tbody += "<tr style='width:100%' id='troptions'><td width='50%' height='33' colspan='2'>Type:&nbsp;";
    tbody += "<select id='ddfieldtype' onchange='javascript:typeQuestion();'>";
	tbody += "<option value=''>Select</option>";
	tbody += "<option value='textField'>textField</option>";
	tbody += "<option value='textArea'>textArea</option>";
	tbody += "<option value='checkbox'>checkBox</option>";
	tbody += "<option value='dropdown'>dropDown</option>";
	tbody += "<option value='radioButton'>radioButton</option>";
	tbody += "<option value='grid'>grid</option>";
	tbody += "<option value='sortable'>Sortable</option>";
	tbody += "<option value='datePicker'>datePicker</option>";
	tbody += "<option value='label'>Label</option>";
	tbody += "</select></td>";
    
    tbody += "<td width='50%' colspan='2'>Subtype:&nbsp;";	
	tbody += "<select id='ddfieldsubtype' onchange='javascript:subtypeQuestion();'></select></td>";
    tbody += "</tr><tr style='width:100%' id='troptionschecks'>";
    tbody += "<td colspan='2'>";
        tbody += "<input id='ddfieldrandomoptions' type='checkbox' disabled='disabled' /><span>Random</span>";
    tbody +="</td>";
    tbody += "<td colspan='2'>";
        tbody += "<input id='ddfieldnoneoftheabove' type='checkbox' disabled='disabled' /><span>None of the above</span>";
    tbody +="</td></tr>";
    tbody += "<tr id='multipletrtext' class='multipletr'><td colspan='4'><input id='textmultiple' type='text' value='' size='52' style='width:85%' /><a href='javascript:addmultipleoption();'><img src='"+base_url+"/images/boton_anadir.png' width='25' style='margin-left:10px; margin-top: -6px; vertical-align: middle' border='0' /></a><hr style='margin-top:15px;  border:1px dotted #333; width:95%' /></td></tr>";
    tbody += "<tr id='multipletrbuttonadd' class='multipletrbuttonadd'><td colspan='4'><input class='button' id='btn-add-dropdown-multiple' type='button' value='Add new dropdown' onclick='javascript:addmultipleoption();'/><table id='table-multiple-dropdowns'></table></td></tr>";
	tbody += "<tr id='multipletroption' class='multipletr'><td colspan='4'><table id='multipleoption' style='color:#666; margin:0px;'></table></td></tr>";
	
	tbody += "<tr id='gridtrtext' class='gridtr'>";
	tbody += "<td colspan='4'>";
    tbody += "<table style='border:0px solid #333'>";
    tbody += "<tr id='gridtrhead' class='gridtr'>";
    tbody += "    <td style='color:#666'>";
    tbody += "        Rows";
    tbody += "    </td>";
    tbody += "    <td style='color:#666'>";
    tbody += "        Columns";
    tbody += "    </td>";
    tbody += "</tr>";
    tbody += "<tr>";
    tbody += "    <td>";
    tbody += "        <input id='textgridrow' type='text' value='' style='width:80%' /><a href='javascript:addgridoptionrow();'><img src='"+base_url+"/images/boton_anadir.png' width='25px' style='margin-left:10px;  vertical-align: middle;' border='0' /></a>";
    tbody += "    </td>";
    tbody += "    <td>";
    tbody += "       <input id='textgridcol' type='text' value=''  style='width:80%' /><a href='javascript:addgridoptioncol();'><img src='"+base_url+"/images/boton_anadir.png' width='25px' style='margin-left:10px; vertical-align: middle;' border='0' /></a>";
    tbody += "    </td>";
    tbody += "</tr>";
    tbody += "</table>";

    tbody += "</td>";
	tbody += "</tr>";
	tbody += "<tr id='gridtroption' class='gridtr'>";
    tbody += "<td colspan='4'><hr style='border: dotted 1px #333; width:95%'>";
    
    tbody += "<table border='0' style='border:0px; width:95%; margin:5px 0px 0px 0px'>";
    tbody += "<tr><td style='width:50%;vertical-align:top;'>";
    tbody += "    <table id='gridoptionrow'></table>";
    tbody += "</td><td style='width:50%;vertical-align:top;'>";
    tbody += "    <table id='gridoptioncol'></table>";
    tbody += "</td></tr>";
    tbody += "</table>";

    tbody += "</td>";
    tbody += "</tr>";
    tbody += "</table>";

    tbody += "</div>";
    



    tbody += "<div class='divGeneral' style='padding-top:10px; background-color:#EF4619;  padding-bottom:10px'><a href='#'>Conditionals rules</a></div>";
    
    tbody += "<div><table cellspacing='2' style='border: 0pt none;' id='tablemodalpopupconditionalrules'>";
    tbody += "<tr>";
    tbody += "<td>Condition</td>";
    tbody += "<td><select id='ddconditionquestion' onchange='javascript:filloptionsconditionals();'></select></td>";
    tbody += "</tr>";
    tbody += "<tr>";
    tbody += "<td>Type Logic</td>";
    tbody += "<td>";
        tbody += "<span id='spantypelogicAND' style='display:none;'><input type='radio' name='rbconditionals' value='AND' />&nbsp;AND</span>";
        tbody += "<span id='spantypelogicOR' style='display:none;'><input type='radio' name='rbconditionals' value='OR' />&nbsp;OR</span>";
    tbody += "</td>";
    tbody += "</tr>";
    tbody += "<tr>";
    tbody += "<td><span id='spanvaluecondicionals' style='display:none;'>Value</span></td>";
    tbody += "<td><input type='textbox' value='' id='tbconditionals' style='display:none;width:375px;' /><select id='ddcondicionaloption' style='display:none;'></select></td>";
    tbody += "</tr>";
    tbody += "<tr><td colspan='2'><table cellspacing='0' cellspadding='0' style='border: 0pt none;width:99%'><tr><td style='width:100%;margin:auto;'><a href='javascript:addconditional();'><center><input type='button' class='button' id='btaddconditionalrule' value='Add rule' /></center></a></td></tr></table></td></tr>";
    tbody += "</table><hr style='border: dotted 1px #333; width:95%'>";
    tbody += "<table cellspacing='7' style='border: 0pt none; display: none; width:100%' id='tablemodalpopupconditionalrulesadd'>";
    tbody += "</table></div>";
    

	tableQuestion.append(tbody);


}
function typeQuestion(){
	var gridBuild = "<div class='gridBuildQuestion'>";
	gridBuild += "</div>";
	gridBuild += "</div>";

	jQuery("#ddfieldsubtype").html("");
	subtypeQuestion();
	switch(jQuery("#ddfieldtype").val())
	{
		case 'textField':
			jQuery("#ddfieldsubtype").attr("disabled","disabled");
            jQuery("#ddfieldrandomoptions").attr("disabled","disabled");
            jQuery("#ddfieldrandomoptions").removeAttr("checked");
            break;
		case 'textArea':
            jQuery("#ddfieldsubtype").attr("disabled","disabled");
            jQuery("#ddfieldrandomoptions").attr("disabled","disabled");
            jQuery("#ddfieldrandomoptions").removeAttr("checked");
            break;
		case 'checkbox':  
            jQuery("#ddfieldsubtype").append("<option value=''>Simple</option><option value='multiple'>Multiple</option>"); 
            jQuery("#ddfieldsubtype").removeAttr('disabled');
            jQuery("#ddfieldrandomoptions").attr("disabled","disabled");
            jQuery("#ddfieldrandomoptions").removeAttr("checked");
            break;	
		case 'radioButton': 
            jQuery("#ddfieldsubtype").attr("disabled","disabled");
			jQuery("#multipletrtext").removeClass("multipletr");
			jQuery("#multipletroption").removeClass("multipletr");
            jQuery("#ddfieldrandomoptions").removeAttr("disabled");
            break;
		case 'dropdown':             
			//jQuery("#ddfieldsubtype").append("<option value=''>null</option><option value='group'>Group</option>"); 
            jQuery("#ddfieldsubtype").append("<option value=''>null</option>");
			jQuery("#ddfieldsubtype").removeAttr('disabled'); 
			jQuery("#multipletrtext").removeClass("multipletr");
			jQuery("#multipletroption").removeClass("multipletr");
            jQuery("#ddfieldrandomoptions").removeAttr("disabled");
			break;	
		case 'grid': 
			jQuery("#ddfieldsubtype").append("<option value=''>Select</option><option value='radioButtons'>radioButtons</option><option value='checkBoxes'>checkBoxes</option>"); 
			jQuery("#ddfieldsubtype").removeAttr('disabled');
            jQuery("#ddfieldrandomoptions").removeAttr("disabled");
		    break;	
		case 'sortable': 
			jQuery("#ddfieldsubtype").attr("disabled","disabled");
			jQuery("#multipletrtext").removeClass("multipletr");
			jQuery("#multipletroption").removeClass("multipletr");
            jQuery("#ddfieldrandomoptions").removeAttr("disabled");
			break;
		case 'datePicker':
            jQuery("#ddfieldsubtype").attr("disabled","disabled");
            jQuery("#ddfieldrandomoptions").attr("disabled","disabled");
            jQuery("#ddfieldrandomoptions").removeAttr("checked");
            break;
        case 'label':
            jQuery("#ddfieldsubtype").append("<option value=''>null</option><option value='markup'>Markup</option>");
            jQuery("#ddfieldsubtype").removeAttr("disabled");
            break;
		default: 
			jQuery("#ddfieldsubtype").attr("disabled","disabled");
            jQuery("#ddfieldrandomoptions").attr("disabled","disabled");
            jQuery("#ddfieldrandomoptions").removeAttr("checked");
			subtypeQuestion();
		    break;
	}
}

jQuery(".btn-new-option-multiple").live("click",function(){
    alert("new option");
});

jQuery("#btn-add-dropdown-multiple").live("click",function(){
    var newDropdown = "<tr class='tr-dropdown'><td style='padding: 0 !important;'><input type='text' size='65' value='' class='dropmultiple'><a class='btn-new-option-multiple' href=''><img width='25' border='0' style='margin-left:10px' src='"+base_url+"/images/boton_anadir.png'></a></td>";
    jQuery(this).next().append(newDropdown);
});

function subtypeQuestion(){
    //console.log(jQuery("#ddfieldsubtype").val());
    switch(jQuery("#ddfieldsubtype").val())
	{
	    case 'group':
            jQuery("#multipletrtext").addClass("multipletr");
            jQuery("#multipletrbuttonadd").removeClass("multipletrbuttonadd");
            jQuery("#multipletroption").addClass("multipletr");
            break;
		case 'multiple': 
			jQuery("#multipletrtext").removeClass("multipletr");
			jQuery("#multipletroption").removeClass("multipletr");
            jQuery("#ddfieldrandomoptions").removeAttr("disabled");
            jQuery("#multipletrbuttonadd").addClass("multipletrbuttonadd");
		    break;
		case 'radioButtons': 
			jQuery("#gridtrhead").removeClass("gridtr");
			jQuery("#gridtrtext").removeClass("gridtr");
			jQuery("#gridtroption").removeClass("gridtr");
            jQuery("#multipletrbuttonadd").addClass("multipletrbuttonadd");
		    break;
		case 'checkBoxes': 
			jQuery("#gridtrhead").removeClass("gridtr");
			jQuery("#gridtrtext").removeClass("gridtr");
			jQuery("#gridtroption").removeClass("gridtr");
            jQuery("#multipletrbuttonadd").addClass("multipletrbuttonadd");
		    break;
        case '':
            if (jQuery("#ddfieldtype").val() == 'dropdown')
            {                
                jQuery("#multipletrtext").removeClass("multipletr");
                //jQuery("#multipletroption").removeClass("multipletr");
                jQuery("#multipletrbuttonadd").addClass("multipletrbuttonadd");
            }
            else if(jQuery("#ddfieldtype").val() == 'sortable'){
                jQuery("#multipletrtext").removeClass("multipletr");
    			jQuery("#multipletroption").removeClass("multipletr");
                jQuery("#ddfieldrandomoptions").removeAttr("disabled");
                jQuery("#multipletrbuttonadd").addClass("multipletrbuttonadd");
   
            }
            else{
                jQuery("#textmultiple").val("");
    			jQuery("#multipleoption").html("");
    			jQuery("#textgridrow").val("");
    			jQuery("#textgridcol").val("");
    			jQuery("#gridoptionrow").html("");
    			jQuery("#gridoptioncol").html("");
    			jQuery("#multipletrtext").addClass("multipletr");
    			jQuery("#multipletroption").addClass("multipletr");
    			jQuery("#gridtrhead").addClass("gridtr");
    			jQuery("#gridtrtext").addClass("gridtr");
    			jQuery("#gridtroption").addClass("gridtr");
                jQuery("#ddfieldrandomoptions").attr("disabled","disabled");
                jQuery("#ddfieldrandomoptions").removeAttr("checked");
                jQuery("#multipletrbuttonadd").addClass("multipletrbuttonadd"); 
            }
            break;
		default: 
		    jQuery("#textmultiple").val("");
			jQuery("#multipleoption").html("");
			jQuery("#textgridrow").val("");
			jQuery("#textgridcol").val("");
			jQuery("#gridoptionrow").html("");
			jQuery("#gridoptioncol").html("");
			jQuery("#multipletrtext").addClass("multipletr");
			jQuery("#multipletroption").addClass("multipletr");
			jQuery("#gridtrhead").addClass("gridtr");
			jQuery("#gridtrtext").addClass("gridtr");
			jQuery("#gridtroption").addClass("gridtr");
            jQuery("#ddfieldrandomoptions").attr("disabled","disabled");
            jQuery("#ddfieldrandomoptions").removeAttr("checked");
            jQuery("#multipletrbuttonadd").addClass("multipletrbuttonadd");
		    break;
	}

}

function addmultipleoption(val,image_path,order)
{
    var value;
    var table = jQuery("#multipleoption");
    var row;
    if (!val){
       if (jQuery("#textmultiple").val() != '')
       { 
           value = jQuery("#textmultiple").val();
           option.push(value);
	       jQuery("#textmultiple").val("");
           row = "<tr style='border-bottom:1px solid #E6E4DE !important'>";
           row += "<td width='60%'>"+value+"</td>";
           row += "<td id='file-uploader-" + option.length + "' width='30%'></td>";
           row += "<td width='10%'><a class='deleteOption'><img src='"+base_url+"/images/boton_quitar.png' width='25'  border='0' align='right' /></a></td></tr>";
           table.append(row);	       
           if (image_path == null && jQuery("#ddfieldtype").val() != 'dropdown' && jQuery("#ddfieldtype").val() != 'sortable'){
              createUploader('file-uploader-' + option.length,'option');
           }
       }
       else
       {
           if(jQuery("#ddfieldtype").val() != 'dropdown' && jQuery("#ddfieldtype").val() != 'sortable'){               
               if(confirm("Do you want to upload an image without text?")){ 
                   value = " ";
                   option.push(value);
        	       jQuery("#textmultiple").val("");
                   row = "<tr style='border-bottom:1px solid #E6E4DE !important'>";
                   row += "<td width='60%'>"+value+"</td>";
                   row += "<td id='file-uploader-" + option.length + "' width='30%'></td>";
                   row += "<td width='10%'><a class='deleteOption'><img src='"+base_url+"/images/boton_quitar.png' width='25'  border='0' align='right' /></a></td></tr>";
                   table.append(row);	       
                   if (image_path == null && jQuery("#ddfieldtype").val() != 'dropdown' && jQuery("#ddfieldtype").val() != 'sortable'){
                      createUploader('file-uploader-' + option.length,'option');
                   } 
               }
           }
       }
	}
    else{
        var fileName;
        if (image_path != null){
          var indice   = image_path.indexOf('/questionnaire/');
          fileName = image_path.substr(indice + 15 ,image_path.length - indice);
          image_upload.push("/sites/projectrequest.g2engage.com/files/images/questionnaire/" + fileName + '#' + order);  
        }
        else{
            fileName = "&nbsp;";
        }
        value = val;
        option.push(value);
        row = "<tr style='border-bottom:1px solid #E6E4DE !important'>";
        row += "<td width='60%'>"+value+"</td>";
        row += "<td id='file-uploader-" + option.length + "' width='30%'>" + fileName + "</td>";
        row += "<td width='10%'><a class='deleteOption'><img src='"+base_url+"/images/boton_quitar.png' width='25'  border='0' align='right' /></a></td></tr>";
        table.append(row);
        if (image_path == null && jQuery("#ddfieldtype").val() != 'dropdown' && jQuery("#ddfieldtype").val() != 'sortable'){
           createUploader('file-uploader-' + option.length,'option');
        }	    
    }	
}
/**************** Detect enter keypress ****************/
jQuery("#textmultiple").live("keypress", function(l) {
    if (l.keyCode == 13) {
        addmultipleoption();
    }
});
/*******************************************************/

jQuery("#multipleoption tbody tr td a").live("click",function(){
    
    var index = jQuery(this).parent().parent().index();
    
    option.splice(index,1);
    
    jQuery(this).parent().parent().remove();
    
    //console.log(option);
});

function addgridoptionrow(val,image_pathROW,order)
{   
    var fileName = "&nbsp;";
    var value;
    if (!val){
       if (jQuery("#textgridrow").val() != ''){
           value = jQuery("#textgridrow").val();
	       jQuery("#textgridrow").val("");
           printGRIDoptionROW(fileName,value);
       }
       else{
           if(confirm("Do you want to upload an image without text?")){
                value = " ";
                printGRIDoptionROW(fileName,value);
           }
           else{
                //don't print
           }
       }	   
    }
    else{
        if (image_pathROW != null){
          var indice   = image_pathROW.indexOf('/questionnaire/');
          fileName = image_pathROW.substr(indice + 15 ,image_pathROW.length - indice);
          image_uploadROW.push("/sites/projectrequest.g2engage.com/files/images/questionnaire/" + fileName + '#' + order);  
        }
        value = val;
        printGRIDoptionROW(fileName,value);
    }
}
function printGRIDoptionROW(fileName,value){
    rowoption.push(value);
	var table = jQuery("#gridoptionrow");
	var row = "<tr id='M"+value+"'>";
            row += "<td>"+value+"</td>";
            row += "<td id='file-uploaderRow-" + rowoption.length +"'>" + fileName + "</td>";
            row += "<td>";
                row += "<a class='deleteOption'>";
                    row += "<img src='"+base_url+"/images/boton_quitar.png' width='14'  border='0' />";
                row += "</a>";
            row += "</td>";
        row += "</tr>";
	table.append(row);
    createUploader('file-uploaderRow-' + rowoption.length,'row');
}
/**************** Detect enter keypress ****************/
jQuery("#textgridrow").live("keypress", function(l) {
    if (l.keyCode == 13) {
        addgridoptionrow();
    }
});
/*******************************************************/
jQuery("#gridoptionrow tbody tr td a").live("click",function(){
    
    var index = jQuery(this).parent().parent().index();
    
    rowoption.splice(index,1);
    
    jQuery(this).parent().parent().remove();
    
});
function addgridoptioncol(val,image_pathCOL,order)
{
    var fileName = "&nbsp;";
    var value;
    if (!val){
        if (jQuery("#textgridcol").val() != ''){
           value = jQuery("#textgridcol").val();
	       jQuery("#textgridcol").val("");
           printGRIDoptionCOL(fileName,value)
       }
       else{
           if(confirm("Do you want to upload an image without text?")){
                value = " ";
                printGRIDoptionCOL(fileName,value)
           }    
           else{
                 //don't print
           }
       }
    }
    else{
        
        if (image_pathCOL != null){
          var indice   = image_pathCOL.indexOf('/questionnaire/');
          fileName = image_pathCOL.substr(indice + 15 ,image_pathCOL.length - indice);
          image_uploadCOL.push("/sites/projectrequest.g2engage.com/files/images/questionnaire/" + fileName + '#' + order);  
        }
        value = val;
        printGRIDoptionCOL(fileName,value)
    }
    
}
function printGRIDoptionCOL(fileName,value){
    coloption.push(value);
	var table = jQuery("#gridoptioncol");
	var col = "<tr id='M"+value+"'>";
            col += "<td>"+value+"</td>";
            col += "<td id='file-uploaderCol-" + coloption.length +"'>" + fileName + "</td>";
            col += "<td class='deleteOption'>";
                col += "<a><img src='"+base_url+"/images/boton_quitar.png' width='14'  border='0' /></a>";
            col += "</td>";
        col += "</tr>";
	table.append(col);
    if (fileName == "&nbsp;"){
	   createUploader('file-uploaderCol-' + coloption.length,'col');
    }
}
/**************** Detect enter keypress ****************/
jQuery("#textgridcol").live("keypress", function(l) {
    if (l.keyCode == 13) {
        addgridoptioncol();
    }
});
/*******************************************************/
jQuery("#gridoptioncol tbody tr td a").live("click",function(){
    
    var index = jQuery(this).parent().parent().index();
    
    coloption.splice(index,1);
    
    jQuery(this).parent().parent().remove();
    
});
function delmultipleoption(value)
{
    var tr = jQuery(value).parent();
}
/********************************************************************************************************/
/******************************************** CREATE UPLOADER *******************************************/
/********************************************************************************************************/
function createUploader(elid,type){            
    var uploader = new qq.FileUploader({
        element: document.getElementById(elid),
        action: base_url + '/fileuploader/php.php',
        debug: false,
        allowedExtensions: ['jpg','png','gif'],
        /*onSubmit: function(id, fileName){console.log('submit');},
        /*onProgress: function(id, fileName, loaded, total){console.log('onProgress');},*/
        onComplete: function(id, fileName, responseJSON){filesave(elid,fileName,type);},
        /*onCancel: function(id, fileName){console.log('onCancel');},*/
    });           
}
function filesave(id,fileName,type)
{
    switch(type){
        case 'option':
            var idoption = id.substr(14,id.length-14);
            image_upload.push("/sites/projectrequest.g2engage.com/files/images/questionnaire/" + fileName + '#' + idoption);  
        break;
        case 'row':
            var idrow = id.substr(17,id.length-17);
            image_uploadROW.push("/sites/projectrequest.g2engage.com/files/images/questionnaire/" + fileName + '#' + idrow);   
        break;
        case 'col':
            var idcol = id.substr(17,id.length-17);
            image_uploadCOL.push("/sites/projectrequest.g2engage.com/files/images/questionnaire/" + fileName + '#' + idcol);
        break;
    }
    jQuery("#" + id).html("");
    jQuery("#" + id).html(fileName);    
}
/********************************************************************************************************/
/******************************************* BUTTON PREVIEW *********************************************/
/********************************************************************************************************/
function getPreview() {
    jQuery.post('/questionnaire/getbyidform' , { id_form: id_form } , function(result){
	   var data = jQuery.parseJSON(result);
       build(data,'form_content');
       modal_preview.css("display","block");
       jQuery(modal_preview).find("#save_button").attr("disabled","disabled"); 
	});
}

function closePreview() {
	jQuery("#form_content").html("");
    modal_preview.css("display","none");
}
/********************************************************************************************************/
/******************************************* BUTTON FINISH **********************************************/
/********************************************************************************************************/
function Finish(){
    var NumQuestion = jQuery("#divgridBodyQuestion").children().length; //Number of questions
    if (NumQuestion > 1) /*IF > 1 --> FINISH ELSE NO HAVE QUESTION*/
    {
        jQuery.ajax({
            type: 'POST',
            url: '/questionnaire/finish/'+id_form,
            data: {questiondelete: idquestion},
            success: function(data){
                if (data == 1){
                    alert('Your questionnaire has been sent for validation. Please wait for our feedback.');
                    window.location = '/node/' + nid + '/questionnaire';
                }
                else{
                    alert('Error');
                }  
            },
            error: function(data){
                alert('Error sending validation.');
            }
        });
    }
    else
    {
        alert('');
    }
}
/********************************************************************************************************/

/********************************************************************************************************/
/******************************************** BUTTON HELP ***********************************************/
/********************************************************************************************************/
function Help(){
    alert('Intructions here.');
}
/********************************************************************************************************/
/********************************************* FUNCTIONS ************************************************/
/********************************************************************************************************/

/******************** Funcion Par e impar *********************/
function esPar(numero){
   if(numero == 0)
        return true;
   resto = numero%2;
   if ((resto==0) && (numero!=0)) {
        return true;
   }else{
        return false;
   }  
}
/****************** Funcion texto en texfield *****************/
function textfieldwrite(obj){
    if(jQuery(obj).val() == ''){
        jQuery(obj).val('Please type here');
    }
}
function textfielddelete(obj){
    if(jQuery(obj).val() == 'Please type here'){
        jQuery(obj).val('');
    }
}
/**************************************************************/