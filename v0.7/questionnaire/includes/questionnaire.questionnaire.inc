<?php

/**
 * @file
 * Questionnaire module component handling.
 */

/**
 * Provides interface and database handling for editing components of a questionnaire.
 *
 * @author David Rodríguez, <david.rodriguezmarin@g2.com>
 */

/**
 * Overview page of all components for this questionnaire.
 */

function questionnaire_questionnaire_page($node) {
  global $user;
  if ($user->uid > 1 && $user->uid !=  $node->uid){
        drupal_goto('');
  }        
  $output = drupal_get_form('questionnaire_questionnaire_form', $node);
    return $output;
}
function questionnaire_questionnaire_form($form, $form_state,$node) {
  global $base_url;
  global $user;
  drupal_add_js("var rootPath = '" . $base_url . "';
                 var domainURL = rootPath.substr(7,rootPath.length - 7);
                 var path; 
                 var base_url = '" .$base_url ."/".drupal_get_path('module','questionnaire')."'; 
                 var nid = " . $node->nid . ";
                 path = '/" . drupal_get_path('module','questionnaire') . "';
                 var uid = " .$user->uid . ";"
  , 'inline');
  
  drupal_add_js(drupal_get_path('module', 'questionnaire') . '/js/jquery.loading.js','file');
  drupal_add_js(drupal_get_path('module', 'questionnaire') . '/js/navigator.detection.js','file');
  if(substr($base_url,7,strlen($base_url)-7) == "projectrequest.g2engage.com"){
    drupal_add_js(drupal_get_path('module', 'questionnaire') . '/js/questionnairePR.js','file');
    drupal_add_js(drupal_get_path('module', 'questionnaire') . '/js/questionPR.js','file');
  }
  else{
    drupal_add_js(drupal_get_path('module', 'questionnaire') . '/js/questionnaire.js','file');
    drupal_add_js(drupal_get_path('module', 'questionnaire') . '/js/question.js','file');
  }  
  drupal_add_js(drupal_get_path('module', 'questionnaire') . '/js/fileuploader.js','file');
  drupal_add_js(drupal_get_path('module','questionnaire') . '/js/form.0.7.jquery.js','file');
  drupal_add_js(drupal_get_path('module','questionnaire') . '/js/question.0.7.jquery.js','file');
  drupal_add_js(drupal_get_path('module','questionnaire') . '/js/buttons.0.7.jquery.js','file');
  drupal_add_js(drupal_get_path('module','questionnaire') . '/js/jquery.validate.js','file' );
  drupal_add_js(drupal_get_path('module','questionnaire') . '/js/jquery-ui-1.8.18.custom.min.js');

  //drupal_add_css(drupal_get_path('module','questionnaire') . '/css/jquery-ui-1.8.18.custom.css','file');
  drupal_add_css(drupal_get_path('module','questionnaire') . '/css/style.css','file');
  
  drupal_add_library('system', 'ui.draggable');
  drupal_add_library('system', 'ui.sortable');
  drupal_add_library('system', 'ui.droppable');
  /***********************************************************************/
  if(substr($base_url,7,strlen($base_url)-7) == "projectrequest.g2engage.com"){
    drupal_add_css(drupal_get_path('module', 'questionnaire') . '/css/questionnairePR.css','file');	
    drupal_add_css(drupal_get_path('module', 'questionnaire') . '/css/questionPR.css','file');  
  }
  else{
    drupal_add_css(drupal_get_path('module', 'questionnaire') . '/css/questionnaire.css','file');	
    drupal_add_css(drupal_get_path('module', 'questionnaire') . '/css/question.css','file');  
  }
  drupal_add_css(drupal_get_path('module', 'questionnaire') . '/css/fileuploader.css','file');
  return $form;
}
function questionnaire_questionnaire_select() {
	if(isset($_POST['nid'])) {
		$nid = $_POST['nid'];
		$result = db_query("SELECT nid,id_form,description,code_language,image,
				CASE active WHEN 1 THEN 'Active'
				WHEN 0 THEN 'Inactive' END AS active
				,DATE_FORMAT(ADDTIME(FROM_UNIXTIME(`start`), '0 1:0:0'), '%d/%m/%y') AS `start`
				,DATE_FORMAT(ADDTIME(FROM_UNIXTIME(`end`), '0 1:0:0'), '%d/%m/%y') AS `end`
				,`date`,place_buttons,type_buttons,is_clone
				FROM form_form 
                WHERE form_form.nid = :nid
                ORDER BY id_form desc",array(':nid' => $nid)); 
		if ($result)
		{
			$forms = array();
			while($form = $result->fetchAssoc()){
				array_push($forms,$form);
			}
			echo json_encode($forms);
		}
	}
}
function questionnaire_questionnaire_selectform() {
    if(isset($_POST['questionnaireselect'])) {
        $id  = $_POST['questionnaireselect'];
    	$result = db_query("SELECT * from form_form where id_form = :id",array(':id' => $id)); 
    	if ($result)
    	{
    		$forms = array();
    		while($form = $result->fetchAssoc()){
    			array_push($forms,$form);
    		}
    		echo json_encode($forms);
    	}
    }
}
function questionnaire_questionnaire_save() {
	if(isset($_POST['questionnairesave'])) {
    	$objeto        = $_POST['questionnairesave'];
        $description   = $objeto['desQuestionnaire'];
        $active        = 1; //$objeto['activeQuestionnaire'];
        $start         = strtotime('14-03-2012'); //strtotime($objeto['startdateQuestionnaire']);
        $end           = strtotime('14-04-2012'); //strtotime($objeto['enddateQuestionnaire']);
        $nid           = $objeto['nid'];

        $queryinsert = db_query("INSERT INTO {form_form} (nid, description, code_language, active, start, end) VALUES (:nid, :description, :lang, :active, :start, :end)",array(':nid' => $nid, ':description' => $description, ':lang' => 'EN', ':active' => $active, ':start' => $start, ':end' => $end));
		$result = db_query("SELECT id_form FROM form_form WHERE nid = :nid",array(':nid' => $nid));
        $form_id = $result->fetchColumn(0);
        db_insert('form_rel_button_form') // Table name no longer needs {}
			   ->fields(array(
			   'id_form'  => $form_id,
			   'id_button' => 3,
			   'active' => 1,
               '`order`' => 1,
			   ))
			   ->execute();
        db_insert('form_rel_button_form') // Table name no longer needs {}
			   ->fields(array(
			   'id_form'  => $form_id,
			   'id_button' => 4,
			   'active' => 1,
               '`order`' => 2,
			   ))
			   ->execute();
         db_insert('form_rel_button_form') // Table name no longer needs {}
			   ->fields(array(
			   'id_form'  => $form_id,
			   'id_button' => 5,
			   'active' => 1,
               '`order`' => 3,
			   ))
			   ->execute();
    }
}