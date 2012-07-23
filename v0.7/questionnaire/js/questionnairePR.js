var divprincipal;
var container_modal_popup;
var modal_popupQuestionnaire;
//nid; // ya viene dado
//uid; //ya viene dado
//rootPath // ya viene dado, example: http://subdomain.domain.com
//base_url //ya viene dato, ruta completa
//path //ya viene dado, ruta sin el dominio
jQuery(document).ready(function() {
	adddiv = jQuery("#questionnaire-questionnaire-form");
	adddiv.append("<div id='divprincipal'></div>");
	divprincipal = jQuery("#divprincipal");
    
    divprincipal.prepend(gridHeaderQuestionnaire());
	gridBodyQuestionnaire();
    
    divprincipal.parent().append("<div class='container-modal-popup'><div id='modal_popupQuestionnaire'></div></div>");
    container_modal_popup = jQuery(".container-modal-popup");
    modal_popupQuestionnaire = jQuery("#modal_popupQuestionnaire");
});
/***************************************************************/
/**************************** GRID *****************************/
/***************************************************************/
/*************************** Header ****************************/
/***************************************************************/
function gridHeaderQuestionnaire()
{
	var grid = "<div class='divgridQuestionnaire header'>";
	//grid += "<div class='colQuestionnaire number'>Id</div>";
	grid += "<div class='colQuestionnaire text' style='text-align:center;'>&nbsp;</div>";
	/*grid += "<div class='colQuestionnaire number'>State</div>";
	grid += "<div class='colQuestionnaire date'>Start Date</div>";
	grid += "<div class='colQuestionnaire date'>End Date</div>";*/
    grid += "<div class='colQuestionnaire version'>&nbsp;</div>";
	grid += "<div class='colQuestionnaire buttons'>&nbsp;</div>";
	grid += "</div>";
	return grid;
}

/***************************************************************/
/**************************** Body *****************************/
/***************************************************************/
function gridBodyQuestionnaire()
{
    jQuery.ajax({
        type: 'POST',
        url: '/questionnaire/selectform',
        data: {nid:nid},
        success: function(data){
            var cont = 1;
            var havevalue = 0;
            json = jQuery.parseJSON(data);
            var version = eval(json.length);
    		jQuery.each(json, function(index, array) {
    			var datagrid = "<div class='divgridQuestionnaire'>";
        			//datagrid += "<div class='colQuestionnaire number'>"+ array['id_form'] + "</div>";
        			datagrid += "<div class='colQuestionnaire text'>"+ array['description'] + "</div>";
        			/*datagrid += "<div class='colQuestionnaire number'>"+ array['active'] + "</div>";
        			datagrid += "<div class='colQuestionnaire date'>"+ array['start'] + "</div>";
        			datagrid += "<div class='colQuestionnaire date'>"+ array['end'] + "</div>";*/
                    datagrid += "<div class='colQuestionnaire version'>Version " + eval(version - index) + "</div>";
                    datagrid += "<div class='colQuestionnaire buttons'>";    
                    if (array['is_clone'] == 0 || uid==1)
                    {
                    //datagrid +=	"<a class='button' onclick='javascript:editQuestionnaire(" + array['id_form'] + ");'>Edit</a>";
        			//datagrid +=	"<a class='button' onclick='javascript:deleteQuestionnaire(" + array['id_form'] + ");'>delete</a>";
                    datagrid +=	"<a class='button' onclick='javascript:finishPublish(" + array['id_form'] + ");'>Approved</a>";
        			datagrid +=	"<a class='button' onclick='javascript:questionshow(" + array['id_form'] + ");'>Edit questions</a>";
                    }
                    else
                    {   
                        datagrid += "<div>&nbsp</div>";
                    }
        			datagrid += "</div>";
                datagrid += "</div>";
    			divprincipal.append(datagrid);
                havevalue = 1;
                cont++;
    		});
            if (havevalue == 0)
                gridFooterQuestionnaire();
        }
    });
}

/***************************************************************/
/*************************** Footer ****************************/
/***************************************************************/
function gridFooterQuestionnaire()
{
	var divFooter;
	divFooter = "<div class='divgridQuestionnaire footer'>";
	divFooter += "<input type='button' onclick='javascript:addQuestionnaire();' value='Add new questionnaire' />";
	divFooter += "</div>";
	divprincipal.append(divFooter);
}

/***************************************************************/
/************************* ModalPopup **************************/
/***************************************************************/
/*************************** Header ****************************/
function ModalPopupHeaderQuestionnaire()
{
    modal_popupQuestionnaire.html("");
    var headerline = "<div class='divModalPopupHeaderQuestionnaire'>";
	headerline += "<div>Description</div>";
	headerline += "<div><input type='text' id='desQuestionnaire' /></div>";
	/*headerline += "<div>Active</div>";
	headerline += "<div><select id='activeQuestionnaire'>";
	headerline += "<option value=''>Select</option>";
	headerline += "<option value='1'>Active</option>";
	headerline += "<option value='0'>Inactive</option>";
	headerline += "</select></div>";
	headerline += "<div>Start Date</div>";
	headerline += "<div><input type='text' id='startdateQuestionnaire' /></div>";
	headerline += "<div>End Date</div>";
	headerline += "<div><input type='text' id='enddateQuestionnaire' /></div>";*/
	headerline += "<a class='button' onclick='javascript:saveQuestionnaire();'>Save</a>";
    headerline += "&nbsp;<a class='button' onclick='javascript:closeQuestionnaire();'>Close</a>";
	headerline += "</div>";
        
	modal_popupQuestionnaire.append(headerline);
	
    //ModalPopupBodyQuestion();
}

/***************************************************************/
/************************* Functions ***************************/
/***************************************************************/
/**************************** Add ******************************/
function addQuestionnaire()
{
    jQuery(".container-modal-popup").css("display","block");
	ModalPopupHeaderQuestionnaire();
    
    centerPopup(modal_popupQuestionnaire);
}
/***************************************************************/
/*************************** Edit ******************************/
function editQuestionnaire(idform)
{
    jQuery(".container-modal-popup").css("display","block");
	ModalPopupHeaderQuestionnaire();
    
    centerPopup(modal_popupQuestionnaire);
    jQuery.ajax({
        type: 'POST',
        url: '/questionnaire/selectformid',
        data: {questionnaireselect: idform},
        success: function(data){
            json = jQuery.parseJSON(data);
    		jQuery.each(json, function(index, array) {
               jQuery("#desQuestionnaire").val(array['description']);
	           jQuery("#activeQuestionnaire").val(array['active']);
	           jQuery("#startdateQuestionnaire").val(array['active']);
	           jQuery("#enddateQuestionnaire").val(array['end']);
    		});
        }
    });
}
/***************************************************************/
/**************************** Save *****************************/
function saveQuestionnaire(id)
{
	if (jQuery("#activeQuestionnaire").val() == '')
    {
        alert('Active must have some value.')
    }
    else
    {
        var objregistro = new Object();
    	objregistro.desQuestionnaire = jQuery("#desQuestionnaire").val();
    	objregistro.activeQuestionnaire = jQuery("#activeQuestionnaire").val();
    	objregistro.startdateQuestionnaire = jQuery("#startdateQuestionnaire").val();
    	objregistro.enddateQuestionnaire = jQuery("#enddateQuestionnaire").val();
        objregistro.nid = nid;
    	if(id == null)
    	{
    		jQuery.post('/questionnaire/saveform', {questionnairesave: objregistro}, function(data) {
    		  jQuery(".container-modal-popup").css("display","none");
    		  jQuery("#divprincipal").html("");
              divprincipal.prepend(gridHeaderQuestionnaire());
	           gridBodyQuestionnaire();
    		});
    	}
    }
}
/***************************************************************/
/*************************** Delete ****************************/
function deleteQuestionnaire(id)
{
    jQuery.ajax({
        type: 'POST',
        url: '/questionnaire/selectformid',
        data: {questionnaireselect: id},
        success: function(data){
            json = jQuery.parseJSON(data);
    		jQuery.each(json, function(index, array) {
                if(confirm("Deseas eliminar el formulario "+array['description'])){
            	    console.log('borrar');
                } 
                else {
                    console.log('no borrar');
                } 
    		});
        }
    });
}
/***************************************************************/
/*************************** Close *****************************/
function closeQuestionnaire()
{
    jQuery(".container-modal-popup").css("display","none");
}
/***************************************************************/
/****************** Center the modal popup *********************/
function centerPopup(popup_div) {
    
    var width = popup_div.width(),
        height = popup_div.height(),
        margin_left = Math.floor((width / 2)),
        margin_top = Math.floor((height / 2)),
        padding_left = parseInt(popup_div.css("padding-left")),
        padding_top = parseInt(popup_div.css("padding-top"));
    
    popup_div.css("margin-left", parseInt(margin_left - width - padding_left) + "px")
             .css("margin-top",  parseInt(margin_top - height - padding_top) + "px");    
}
/***************************************************************/
/*************************** APPROVED **************************/
function finishPublish(idform){
    alert('Ready for setup!');
    window.location = 'http://www.google.es';
}