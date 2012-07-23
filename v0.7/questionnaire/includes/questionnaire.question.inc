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

function questionnaire_question_select($id_form) {
    if(isset($_POST['nid'])) {
		
        $nid = $_POST['nid'];
        
        $query  = "SELECT FQ.id_question,FQ.question,";
        $query .= "CASE form_question_logic.logic WHEN ISNULL(form_question_logic.logic) THEN 1 ELSE 0 END AS conditional ";
        $query .= "FROM form_question FQ ";
        $query .= "INNER JOIN form_rel_question_form ON FQ.id_question = form_rel_question_form.id_question ";
        $query .= "INNER JOIN form_form ON form_form.id_form = form_rel_question_form.id_form ";
        $query .= "LEFT JOIN form_question_logic ON form_question_logic.id_question = form_rel_question_form.id_question ";
        $query .= "WHERE form_rel_question_form.id_form = :idform ";
        $query .= "AND form_form.nid = :nid ";
        $query .= "GROUP BY form_rel_question_form.id_question ";
        $query .= "ORDER BY form_rel_question_form.ORDER ASC";
        
		$result = db_query($query,array(':idform' => $id_form,':nid' => $nid));
         
		if ($result)
		{
			$forms = array();
			while($form = $result->fetchAssoc()){
				array_push($forms,$form);
			}
            
            //page breaks
            $query_page_breaks  = "SELECT num_questions,id_page FROM form_pagination ";
            $query_page_breaks .= "WHERE id_form = :idform ORDER BY id_page ASC";
        
            $result_page_break = db_query($query_page_breaks,array(':idform' => $id_form));
            
            $page_breaks = array();
            if($result_page_break) {
                while($pbreak = $result_page_break->fetchAssoc()) {
                    array_push($page_breaks,$pbreak);
                }
            }
            
            array_push($forms,$page_breaks);
            
            //$forms['page_break'] = $page_breaks;    
            
			echo json_encode($forms);
		}
	}
    exit();
}
function questionnaire_question_selectquestion($id_form) {
  if(isset($_POST['questionselect'])) {
	$idquestion = $_POST['questionselect'];
	$result = db_query("SELECT form_question.question,form_question.description,
			form_question.has_last_option,LCASE(form_question.type) type, 
			LCASE(form_question.subtype) subtype, form_rel_question_form.random_options,
			FQO.is_none,form_rel_question_form.mandatory 
            FROM form_question INNER JOIN form_rel_question_form 
            ON form_question.id_question = form_rel_question_form.id_question
            LEFT JOIN (SELECT * FROM form_question_option WHERE id_question = :idquestion AND is_none = 1) FQO
            ON FQO.id_question = form_question.id_question
            WHERE form_rel_question_form.id_form = :idform 
            AND form_question.id_question = :idquestion 
            ORDER BY form_rel_question_form.order ASC"
            ,array(':idform' => $id_form,':idquestion' => $idquestion)); 
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
function questionnaire_question_selectoption() {
  if(isset($_POST['idquestion'])) {
	$idquestion = $_POST['idquestion'];
	$result = db_query("SELECT form_question_option.id_option,form_question_option.text,form_question_option.image,
			form_question_option.image_path,form_question_option.order 
            FROM form_question_option WHERE form_question_option.id_question = :idquestion 
            ORDER BY `order`" 
            ,array(':idquestion' => $idquestion));
            
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
function questionnaire_question_selectgridcol() {
  if(isset($_POST['idquestion'])) {
	$idquestion = $_POST['idquestion'];
	$result = db_query("SELECT form_grid_column.text,form_grid_column.image,form_grid_column.image_path,form_grid_column.order
            FROM form_grid_column
            WHERE id_question = :idquestion
            AND visible = 1
            ORDER BY `order`" 
            ,array(':idquestion' => $idquestion));
            
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
function questionnaire_question_selectgridrow() {
  if(isset($_POST['idquestion'])) {
	$idquestion = $_POST['idquestion'];
	$result = db_query("SELECT form_grid_row.text,form_grid_row.image,form_grid_row.image_path,form_grid_row.order
            FROM form_grid_row
            WHERE id_question = :idquestion
            AND visible = 1
            ORDER BY `order`" 
            ,array(':idquestion' => $idquestion));
            
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
function questionnaire_question_selectconditionals($id_form) {
  if(isset($_POST['idquestion'])) {
	$idquestion = $_POST['idquestion'];
	$result = db_query("SELECT FQL.logic,FQL.id_question_dependence,FQL.id_option_dependence,FQ.question,FRQF.order,TXT_IMG.text,TXT_IMG.image_path
            FROM form_question_logic FQL INNER JOIN form_question FQ ON FQL.id_question_dependence = FQ.id_question
            INNER JOIN form_rel_question_form FRQF ON FRQF.id_question = FQ.id_question
            INNER JOIN form_question_option TXT_IMG ON TXT_IMG.id_question=FQL.id_question_dependence AND TXT_IMG.id_option=FQL.id_option_dependence
            WHERE FQL.id_question = :idquestion AND FQL.id_form = :idform" 
            ,array(':idquestion' => $idquestion, ':idform' => $id_form));
            
	if ($result)
	{
	    if ($result->rowCount() == 0){
	        $result = db_query("SELECT FQL.logic,FQL.id_question_dependence,FQL.id_option_dependence,FQ.question,FRQF.order,'' as `text`
            FROM form_question_logic FQL INNER JOIN form_question FQ ON FQL.id_question_dependence = FQ.id_question
            INNER JOIN form_rel_question_form FRQF ON FRQF.id_question = FQ.id_question
            WHERE FQL.id_question = :idquestion AND FQL.id_form = :idform" 
            ,array(':idquestion' => $idquestion, ':idform' => $id_form));
	    }
        $forms = array();
		while($form = $result->fetchAssoc()){
			array_push($forms,$form);
		}
		echo json_encode($forms);
	}
  }
}
function questionnaire_question_delete($id_form) {
  if(isset($_POST['questiondelete'])) {
	$idquestion = $_POST['questiondelete'];
    $result = db_query("CALL pr_Regula_Paginacion(:id_form,:idquestion)",array(':id_form' => $id_form, ':idquestion' => $idquestion));
    if($result){
    	db_delete('form_question_option')
                  ->condition('id_question', $idquestion)
                  ->execute();
        db_delete('form_rel_option_form')
                  ->condition('id_question', $idquestion)
                  ->execute();
        db_delete('form_grid_row')
                  ->condition('id_question', $idquestion)
                  ->execute();
        db_delete('form_grid_column')
                  ->condition('id_question', $idquestion)
                  ->execute();
        db_delete('form_rel_question_form')
                  ->condition('id_question', $idquestion)
                  ->execute();
        db_delete('form_question')
                  ->condition('id_question', $idquestion)
                  ->execute();
        db_delete('form_question_logic')
                  ->condition('id_question', $idquestion)
                  ->execute();
    }              
  }
}
function questionnaire_question_updateorder($id_form) {
	if(isset($_POST['updateorder'])) {
		$updateorder = $_POST['updateorder'];
		$valores = array();
		foreach($updateorder as $fila){
			$filapartida = explode("$$",$fila);
			$idquestion = $filapartida[0];
			$order = $filapartida[1];
			$ordervalue = db_query("SELECT form_rel_question_form.order FROM form_question INNER JOIN form_rel_question_form ON form_question.id_question = form_rel_question_form.id_question
					  WHERE form_rel_question_form.id_form = :idform AND form_question.id_question = :idquestion 
					  ORDER BY form_rel_question_form.order ASC",array(':idform' => $id_form,':idquestion' => $idquestion))->fetchCol();
			array_push($valores,$ordervalue);
			if ($ordervalue != $order)
			{
				$num_updated = db_update('form_rel_question_form')
							  ->fields(array(
								'`order`' => $order,
							  ))
							  ->condition('id_form ',$id_form)
							  ->condition('id_question ', $idquestion)
							  ->execute();
			}
		}
	}
}

function questionnaire_question_enableorder($id_form) {
	if(isset($_POST['question'])) {
		$idquestion = $_POST['question'];
        $result = db_query("SELECT  COUNT(id_form) AS valor
                FROM form_question_logic 
                WHERE (id_question = :id_question 
                OR id_question_dependence = :id_question)
                AND id_form = :id_form",array(':id_question' => $idquestion,':id_form' => $id_form)); 
        if ($result)
        {
            /*$forms = array();
    		while($form = $result->fetchAssoc()){
    			array_push($forms,$form);
    		}
    		echo json_encode($forms);*/
            echo $result->fetchColumn(0);
        }
	}
    exit();
}

function questionnaire_question_updatepagebreak($id_form) {
    if(isset($_POST['arrayPagebreak'])) { 
        
        $numpages = $_POST['numpages'];
                
        if(isset($_POST['arrayPagebreak']))
            $page_break = $_POST['arrayPagebreak'];
        else            
            $page_break = array();
                
        $query = "SELECT COUNT(*) FROM form_pagination WHERE id_form = :idform";
        
        $numPags = db_query($query,array(':idform'=>$id_form))->fetchField();
            
        foreach ($page_break as $key => $pbreak) {
            if($key < $numPags && $pbreak > 0) {
                //ACTUALIZAMOS registro de paginación
                $num_updated = db_update('form_pagination')
						  ->fields(array(
							'`num_questions`' => $pbreak,
						  ))
						  ->condition('id_form',$id_form)
						  ->condition('id_page', (int)$key + 1)
						  ->execute();
            } else {
                if($pbreak > 0) {
                    //INSERTAMOS registro de paginación
                    $page = db_insert('form_pagination') // Table name no longer needs {}
                    ->fields(array(
                      'id_form' => $id_form,
                      'num_questions' => $pbreak,
                      'id_page' => (int)$key + 1,
                    ))
                    ->execute();
                }
            }
        }
        
        //BORRAMOS LOS REGISTROS DE PAGINACIÓN SOBRANTES
        $num_deleted = db_delete('form_pagination')
                      ->condition('id_form', $id_form)
                      ->condition('id_page', $numpages,'>')
                      ->execute();
    }    
    exit();
}

function questionnaire_question_conditionquestions()
{
    if(isset($_POST['conditionquestions'])) {
        $obj_question = $_POST['conditionquestions'];
		$id_form      = $obj_question['id_form'];  
        if (isset($obj_question['id_question']) &&  $obj_question['id_question']!='')
        {
            $id_question  = $obj_question['id_question'];  
    		$result = db_query("SELECT Q.id_question,Q.question
                    FROM form_rel_question_form QF INNER JOIN form_question Q ON QF.id_question = Q.id_question
                    WHERE QF.id_form = :idform AND QF.order < (SELECT QF.order 
                    FROM form_rel_question_form QF INNER JOIN form_question Q ON QF.id_question = Q.id_question
                    WHERE QF.id_form = :idform AND QF.id_question = :idquestion)
                    ORDER BY `order`" 
                    ,array(':idform' => $id_form ,':idquestion' => $id_question));
        }
        else
        {
            $result = db_query("SELECT Q.id_question,Q.question
                    FROM form_rel_question_form QF INNER JOIN form_question Q ON QF.id_question = Q.id_question
                    WHERE QF.id_form = :idform ORDER BY `order`" 
                    ,array(':idform' => $id_form));
        }
            
    	if ($result)
    	{
    	    $forms = array();
    		while($form = $result->fetchAssoc()){
    			array_push($forms,$form);
    		}
    		echo json_encode($forms);
    	}
	}
    exit();
}
function questionnaire_question_conditionoptions()
{
    if(isset($_POST['conditionoptions'])) {
        $id_question = $_POST['conditionoptions'];
		$result = db_query("SELECT FQO.id_option,FQO.text 
                FROM form_question_option FQO WHERE FQO.id_question = :idquestion" 
                ,array(':idquestion' => $id_question));
            
    	if ($result)
    	{
    	    $forms = array();
    		while($form = $result->fetchAssoc()){
    			array_push($forms,$form);
    		}
    		echo json_encode($forms);
    	}
	}
    exit();
}
function questionnaire_question_save() {
    if(isset($_POST['questionsave'])) {
    	$obj_question      = $_POST['questionsave'];
        $question          = $obj_question['question'];       //Question introduced
        $description       = $obj_question['description'];    //Description introduced
        $mandatory         = $obj_question['mandatory'];      //Mandatory introduced
        $haslastoption     = $obj_question['haslastoption'];  //Has last option introduced
        $type              = $obj_question['type'];           //Type introduced
        $id_form           = $obj_question['id_form'];        //Form introduced
        $option            = $obj_question['option'];         //Options introduced
        $random_options    = $obj_question['random_options']; //Random introduced
        $none_above        = $obj_question['none_above'];     //None of above introduced
        $rowoption         = $obj_question['rowoption'];      //Row grid options introduced
        $coloption         = $obj_question['coloption'];      //Col grid options introduced
        $condition         = $obj_question['condition'];      //Conditional introduced
        $image_upload      = $obj_question['image_upload'];   //images introduced  
        $image_uploadROW   = $obj_question['image_uploadROW'];   //images introduced GRID ROW
        $image_uploadCOL   = $obj_question['image_uploadCOL'];   //images introduced GRID COL
        /********************** Subtype introduced **********************/
        if ($obj_question['subtype'] != "") {
			$subtype = $obj_question['subtype'];
		}
		else{
            $subtype = NULL;
		}
        /****************************************************************/
        /********** if exist id_question, is a edit action **************/ 
		/****************************************************************/
		if (isset($obj_question['idquestion']))
		{
		    $idquestion = $obj_question['idquestion']; //Idquestion for question to edit
            $result = db_query("SELECT LCASE(form_question.type) type, LCASE(form_question.subtype) subtype 
			FROM form_question INNER JOIN form_rel_question_form ON form_question.id_question = form_rel_question_form.id_question
            WHERE form_rel_question_form.id_form = :idform AND form_question.id_question = :idquestion 
			ORDER BY form_rel_question_form.order ASC",array(':idform' => $id_form,':idquestion' => $idquestion)); 
        	if ($result){
        		$form      = $result->fetchAssoc();
       			$typeBD    = $form['type'];
                $subtypeBD = $form['subtype'];
        	

            }
			$num_updated = db_update('form_question')
							  ->fields(array(
								'`question`' => $question,
								'`description`' => $description,
                                '`type`' => $type,
                                '`subtype`' => $subtype,
                                'has_last_option' => $haslastoption,
							  ))
							  ->condition('id_question', $idquestion)
							  ->execute();
            db_update('form_rel_question_form')
                ->fields(array(
                 'random_options' => $random_options,
                 'mandatory' => $mandatory,
                ))
                ->condition('id_question', $idquestion)
                ->execute();
            if (isset($option ))
            {
                //Delete all option and rel option
                db_delete('form_question_option')
                          ->condition('id_question ', $idquestion)
                          ->execute();
                db_delete('form_rel_option_form')
                          ->condition('id_question ', $idquestion)
                          ->execute();                                                     
                $item = 1;
                $countoption = count($option);
    			foreach($option as $opt)
    			{
                    $image_path = "";   
                    foreach($image_upload as $imagenes){
                        $valores = explode("#", $imagenes);
                        if ($item == $valores[1]){
                            $image_path = $valores[0];
                            break;
                        }                                    
                    }
                    if ($image_path != ""){
                        if ($none_above == 1 && $item == $countoption){
                            $question_optioninsert = array('id_question' => $idquestion,'id_option' => $item,'text_exists' => 1,'`text`' => $opt,'image' => 1,'image_path' => $image_path,'is_none' => 1,'`order`' => $item,'visible' => '1','date' => '0');
                        }
                        else{
                            $question_optioninsert = array('id_question' => $idquestion,'id_option' => $item,'text_exists' => 1,'`text`' => $opt,'image' => 1,'image_path' => $image_path,'is_none' => 0,'`order`' => $item,'visible' => '1','date' => '0');
                        }                        
                    }
                    else{
                        if ($none_above == 1 && $item == $countoption){
                            $question_optioninsert = array('id_question' => $idquestion,'id_option' => $item,'text_exists' => 1,'`text`' => $opt,'image' => 0,'image_path' => null,'is_none' => 1,'`order`' => $item,'visible' => '1','date' => '0');
                        }
                        else{
                            $question_optioninsert = array('id_question' => $idquestion,'id_option' => $item,'text_exists' => 1,'`text`' => $opt,'image' => 0,'image_path' => null,'is_none' => 0,'`order`' => $item,'visible' => '1','date' => '0');    
                        }
                            
                    }
    				$queryinsert = db_insert('form_question_option')->fields($question_optioninsert)->execute();
    				$reloption_forminsert = array('id_form' => $id_form,'id_question' => $idquestion,'id_option' => $item,'id_option_multiple' => '0');
    				$queryinsert = db_insert('form_rel_option_form')->fields($reloption_forminsert)->execute();
    				$item++;
    			}
            }
            if(isset($rowoption)){
                //Delete all option and rel option
                db_delete('form_grid_row')
                          ->condition('id_question ', $idquestion)
                          ->execute();                          
                $item = 1;
                foreach($rowoption as $opt)
                {
                	$image_path = "";   
                    foreach($image_uploadROW as $imagenes){
                        $valores = explode("#", $imagenes);
                        if ($item == $valores[1]){
                            $image_path = $valores[0];
                            break;
                        }                                    
                    }
                    if ($image_path != ""){
                        $form_grid_rowinsert = array('id_question' => $idquestion,'id_row' => $item,'text_exists' => '1','`text`' => $opt,'image' => '1','image_path' => $image_path,'visible' => '1','`order`' => $item);
                    }   
                    else{
                        $form_grid_rowinsert = array('id_question' => $idquestion,'id_row' => $item,'text_exists' => '1','`text`' => $opt,'visible' => '1','`order`' => $item);    
                    }
                	$queryinsert = db_insert('form_grid_row')->fields($form_grid_rowinsert)->execute();
                	$item++;
                }			
            }
            if(isset($coloption)){
                //Delete all option and rel option
                db_delete('form_grid_column')
                          ->condition('id_question ', $idquestion)
                          ->execute();                          
                $item = 1;
				foreach($coloption as $opt)
				{
					$image_path = "";   
                    foreach($image_uploadCOL as $imagenes){
                        $valores = explode("#", $imagenes);
                        if ($item == $valores[1]){
                            $image_path = $valores[0];
                            break;
                        }                                    
                    }
                    if ($image_path != ""){
                        $form_grid_columninsert = array('id_question' => $idquestion,'id_column' => $item,'text_exists' => '1','`text`' => $opt,'image' => '1','image_path' => $image_path,'visible' => '1','`order`' => $item);
                    }
                    else{
                        $form_grid_columninsert = array('id_question' => $idquestion,'id_column' => $item,'text_exists' => '1','`text`' => $opt,'visible' => '1','`order`' => $item);
                    }
					$queryinsert = db_insert('form_grid_column')->fields($form_grid_columninsert)->execute();
					$item++;
				} 
            }
            /************************************ Conditional ***************************************/
            if(isset($condition)){
                db_delete('form_question_logic')
                          ->condition('id_question ', $idquestion)
                          ->execute();
                foreach($condition as $cond)
                {                    
                    $id_question_dependence = $cond[0];
                    $logic = $cond[1];
                    $id_option_dependence = $cond[2];
                    $question_logic = array('id_form' => $id_form,'id_question' => $idquestion,'logic' => $logic,'id_question_dependence' => $id_question_dependence,'id_option_dependence' => $id_option_dependence);
                    $queryinsert = db_insert('form_question_logic')->fields($question_logic)->execute();
                }
            }
            /****************************************************************************************/
		}
		else
		{
			$order_rel_question_form = db_query("SELECT MAX(`order`)+1 AS maxorder FROM  form_rel_question_form WHERE id_form = :idform",array(':idform' => $id_form))->fetchColumn(0);
            if ($order_rel_question_form == null)
                $order_rel_question_form = 1;
			$queryinsert = "INSERT INTO {form_question} (question, description, maxlength, type, subtype,has_last_option) VALUES (:question, :description, :maxlength, :type, :subtype, :haslastoption)";
			$args = array(':question' => $question, ':description' => $description, ':maxlength' => null, ':type' => $type, ':subtype' => $subtype, ':haslastoption' => $haslastoption);
			$id_question = db_query($queryinsert, $args, array('return' => Database::RETURN_INSERT_ID));
			$rel_questionfields = array('id_form' => $id_form,'id_question' => $id_question,'mandatory' => $mandatory,'`order`' => $order_rel_question_form,'active' => '1','random_options' => $random_options);
			$queryinsert = db_insert('form_rel_question_form')->fields($rel_questionfields)->execute();
			if ($type != "")
			{
				switch ($type) {
					case "grid":
						$rowoption = $obj_question['rowoption'];
						$coloption = $obj_question['coloption'];
						$item = 1;
						foreach($rowoption as $opt)
						{
							$image_path = "";   
                            foreach($image_uploadROW as $imagenes){
                                $valores = explode("#", $imagenes);
                                if ($item == $valores[1]){
                                    $image_path = $valores[0];
                                    break;
                                }                                    
                            }
                            if ($image_path != ""){
                                $form_grid_rowinsert = array('id_question' => $id_question,'id_row' => $item,'`text_exists`' => 1,'`text`' => $opt,'image' => '1','image_path' => $image_path,'visible' => '1','`order`' => $item);
                            }   
                            else{
                                $form_grid_rowinsert = array('id_question' => $id_question,'id_row' => $item,'`text_exists`' => 1,'`text`' => $opt,'visible' => '1','`order`' => $item);    
                            }
							$queryinsert = db_insert('form_grid_row')->fields($form_grid_rowinsert)->execute();
							$item++;
						}
						$item = 1;
						foreach($coloption as $opt)
						{
							$image_path = "";   
                            foreach($image_uploadCOL as $imagenes){
                                $valores = explode("#", $imagenes);
                                if ($item == $valores[1]){
                                    $image_path = $valores[0];
                                    break;
                                }                                    
                            }
                            if ($image_path != ""){
                                $form_grid_columninsert = array('id_question' => $id_question,'id_column' => $item,'`text_exists`' => 1,'`text`' => $opt,'image' => '1','image_path' => $image_path,'visible' => '1','`order`' => $item);
                            }   
                            else{
                                $form_grid_columninsert = array('id_question' => $id_question,'id_column' => $item,'`text_exists`' => 1,'`text`' => $opt,'visible' => '1','`order`' => $item);
                            }
							$queryinsert = db_insert('form_grid_column')->fields($form_grid_columninsert)->execute();
							$item++;
						}
					break;
					case "sortable":
                    case "dropdown":
                    case "radiobutton":						
						$option = $obj_question['option'];
						$item = 1;
						foreach($option as $opt)
						{
                            $image_path = "";
                            foreach($image_upload as $imagenes){
                                $valores = explode("#", $imagenes);
                                if ($item == $valores[1]){
                                    $image_path = $valores[0];
                                    break;
                                }                                    
                            }
                            if ($image_path != ""){
                                $question_optioninsert = array('id_question' => $id_question,'id_option' => $item,'text_exists' => 1,'`text`' => $opt,'image' => 1,'image_path' => $image_path,'`order`' => $item,'visible' => '1','date' => '0');
                            }
                            else{
                                $question_optioninsert = array('id_question' => $id_question,'id_option' => $item,'text_exists' => 1,'`text`' => $opt,'image' => 0,'image_path' => null,'`order`' => $item,'visible' => '1','date' => '0');    
                            }
                            
							$queryinsert = db_insert('form_question_option')->fields($question_optioninsert)->execute();
							$reloption_forminsert = array('id_form' => $id_form,'id_question' => $id_question,'id_option' => $item,'id_option_multiple' => '0');
							$queryinsert = db_insert('form_rel_option_form')->fields($reloption_forminsert)->execute();
							$item++;
						}
					break;
				}
			}
			if ($subtype != "")
			{
				switch ($subtype) {
					case "multiple":                        
						$option = $obj_question['option'];
						$item = 1;
                        $countoption = count($option);
						foreach($option as $opt)
						{
                            $image_path = "";
                            foreach($image_upload as $imagenes){
                                $valores = explode("#", $imagenes);
                                if ($item == $valores[1]){
                                    $image_path = $valores[0];
                                    break;
                                }                                    
                            }
                            if ($image_path != ""){
                                if ($none_above == 1 && $item == $countoption){
                                    $question_optioninsert = array('id_question' => $id_question,'id_option' => $item,'text_exists' => 1,'`text`' => $opt,'image' => 1,'image_path' => $image_path,'is_none' => 1,'`order`' => $item,'visible' => '1','date' => '0');   
                                }
                                else{
                                    $question_optioninsert = array('id_question' => $id_question,'id_option' => $item,'text_exists' => 1,'`text`' => $opt,'image' => 1,'image_path' => $image_path,'is_none' => 0,'`order`' => $item,'visible' => '1','date' => '0');   
                                }                                
                            }
                            else{
                                if ($none_above == 1 && $item == $countoption){
                                    $question_optioninsert = array('id_question' => $id_question,'id_option' => $item,'text_exists' => 1,'`text`' => $opt,'image' => 0,'image_path' => null,'is_none' => 1,'`order`' => $item,'visible' => '1','date' => '0');    
                                }else{
                                    $question_optioninsert = array('id_question' => $id_question,'id_option' => $item,'text_exists' => 1,'`text`' => $opt,'image' => 0,'image_path' => null,'is_none' => 0,'`order`' => $item,'visible' => '1','date' => '0');   
                                }                                    
                            }
                            
							$queryinsert = db_insert('form_question_option')->fields($question_optioninsert)->execute();
							$reloption_forminsert = array('id_form' => $id_form,'id_question' => $id_question,'id_option' => $item,'id_option_multiple' => '0');
							$queryinsert = db_insert('form_rel_option_form')->fields($reloption_forminsert)->execute();
							$item++;
						}
					break;
				}
				
			}
            /************************************ Conditional ***************************************/
            if(isset($condition)){
                foreach($condition as $cond)
                {                    
                    $id_question_dependence = $cond[0];
                    $logic = $cond[1];
                    $id_option_dependence = $cond[2];
                    $question_logic = array('id_form' => $id_form,'id_question' => $id_question,'logic' => $logic,'id_question_dependence' => $id_question_dependence,'id_option_dependence' => $id_option_dependence);
                    $queryinsert = db_insert('form_question_logic')->fields($question_logic)->execute();
                }
            }
            /****************************************************************************************/
		}
	}
}
function questionnaire_question_clonequestion($id_form){
    if(isset($_POST['idquestion'])) {
        $idquestion = $_POST['idquestion'];
        $result = db_query("CALL pr_Clone_Question(:id_form,:id_question)",array(':id_form' => $id_form,':id_question' => $idquestion));
        if(result){
            echo("ok");
        }
        else{
            echo("error");
        }
    }
    exit();
}
function questionnaire_question_finish($id_form) {
    global $user;
    $result = db_query("CALL pr_Clone_Form(:id_form)",array(':id_form' => $id_form));
    if($result){
        $comments = "Quiero esto para ayer";        //$_POST['message'];
        $name = "David rodríguez";                  //trim($_POST['contactname']);
        $idusuario = $user->uid;                 
        $email = "d.gyzmo@gmail.com";               //trim($_POST['email']);
    	if(!isset($hasError)) {
    		$emailTo = 'david.rodriguezmarin@g2.com'; //Put your own email address here
    		$body = "Name: $name \n\nEmail: $email \n\nComments:\n $comments\n\nIdusuario: $idusuario";
    		$headers = 'From: My Site <'.$emailTo.'>' . "\r\n" . 'Reply-To: ' . $email; 
    
    		mail($emailTo, 'Project request - Questionnaire validation', $body, $headers); //Replace Your Website Subject
    		$emailSent = true;
    	}
        echo(1);
    }
    else{
        echo(0);
    }
    exit();
}