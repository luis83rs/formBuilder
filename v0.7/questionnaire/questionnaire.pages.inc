<?php

function questionnaire_get_login_form(){
    $result = db_query('SELECT nid FROM {form_form} where id_source=4 order by nid LIMIT 1');
    $form = $result->fetchAssoc();
    return $form['nid'];
}

function questionnaire_get_register_form(){
    $result = db_query('SELECT nid FROM {form_form} where id_source=5 order by nid LIMIT 1');
    $form = $result->fetchAssoc();
    return $form['nid'];
}

function questionnaire_get_profile_form(){
    $result = db_query('SELECT nid FROM {form_form} where id_source=1 order by nid LIMIT 1');
    $form = $result->fetchAssoc();
    return $form['nid'];
}

function questionnaire_questions_by_form($formId){
    $result = db_query('SELECT id_question, id_group,mandatory,vertical,data_multiple,wide,random_options FROM {form_rel_question_form} where id_form=:formID and active=1 order by `order`',array(':formID' => $formId));
    $questions = array();
    while($question = $result->fetchAssoc()){
        array_push($questions,$question);
    }
    return $questions;
}

function questionnaire_get_question_groups_by_form($formId){        
    $result = db_query('SELECT id_group, description, max_questions, random FROM {form_rel_question_form_group} where id_form =:formId and active=1 order by id_group',array(':formId' => $formId));
    $questionGroups = array();
    while($questionGroup = $result->fetchAssoc()){
        array_push($questionGroups,$questionGroup);
    }
    return $questionGroups;
}

function questionnaire_get_question_group_needed($formId, $questions){
    //$result = db_query('SELECT q.id_question AS id_question,IF(cruce.count IS NULL, 100, cruce.count) AS `count` FROM form_question AS q LEFT JOIN (SELECT COUNT(DISTINCT(a.uid)) AS `count`, a.id_question AS id_question FROM form_user_segment AS s INNER JOIN users AS u ON s.uid = u.`uid` INNER JOIN form_answer AS a ON s.uid = a.`uid` WHERE s.type=1 AND u.tipo IS NULL AND a.id_question IN (:questionsIds) AND a.id_form=:formId GROUP BY a.id_question ORDER BY COUNT(DISTINCT(a.uid))) AS cruce ON q.id_question = cruce.id_question WHERE q.id_question IN (:questionsIds) ORDER BY cruce.count', array(':formId' => $formId, ':questionsIds' => $questions));
    $result = db_query('SELECT q.id_question AS id_question,IF(cruce.count IS NULL, 0, cruce.count) AS `count` FROM form_question AS q LEFT JOIN (SELECT COUNT(DISTINCT(a.uid)) AS `count`, a.id_question AS id_question FROM form_user_segment AS s INNER JOIN users AS u ON s.uid = u.`uid` INNER JOIN form_answer AS a ON s.uid = a.`uid` WHERE s.type=1 AND u.tipo IS NULL AND a.id_question IN ('.$questions.') AND a.id_form='.$formId.' GROUP BY a.id_question ORDER BY COUNT(DISTINCT(a.uid))) AS cruce ON q.id_question = cruce.id_question WHERE q.id_question IN ('.$questions.') ORDER BY cruce.count');
    
    $counts = array();
    while($count = $result->fetchAssoc()){
        array_push($counts,$count);
    }
    //lets check if all the counts are include
    return $counts;
}

function questionnaire_paginations_by_form($formId){
    $result = db_query('SELECT id_form,num_questions,qualify FROM {form_pagination} where id_form=:formID order by id_page',array(':formID' => $formId));
    $paginations = array();
    while($pagination = $result->fetchAssoc()){
        array_push($paginations,$pagination);
    }
    return $paginations;
}

function questionnaire_form_by_nid($nid) { 
    $result = db_query('SELECT * FROM {form_form} where nid=:nid and is_clone = 0',array(':nid' => $nid));
    $forms = array();
    while($form = $result->fetchAssoc()){
        array_push($forms,$form);
    }
    return $forms;
}

function questionnaire_form_by_idform($id_form) { 
    $result = db_query('SELECT * FROM {form_form} where id_form = :id_form',array(':id_form' => $id_form));
    $forms = array();
    while($form = $result->fetchAssoc()){
        array_push($forms,$form);
    }
    return $forms;
}

function translateValidations(& $validations,$langs){
    for($i=0;$i<sizeof($validations);$i++){
        if(isset($langs[$validations[$i]['id_question']]) && $langs[$validations[$i]['id_question']] && isset($langs[$validations[$i]['id_question']][$validations[$i]['token']]) && $langs[$validations[$i]['id_question']][$validations[$i]['token']]){
            $validations[$i]['text'] = $langs[$validations[$i]['id_question']][$validations[$i]['token']];
        }
    }
    
    //besides translation, maybe there are validations in the user's language which don't exists already, they must be included
    foreach(array_keys($langs) as $id_question){
        foreach(array_keys($langs[$id_question]) as $token){
            $found = false;
            $valIndex = 0; 
            while(!$found && $valIndex<sizeof($validations)){
                if($validations[$valIndex]['id_question']==$id_question && $validations[$valIndex]['token'] = $token){
                    $found = true;
                }else{
                    $valIndex++;
                }
            }
            if(!$found){
                //lets include it
                $pos = sizeof($validations);
                $validations[$pos] = array();
                $validations[$pos]['id_question'] = $id_question;
                $validations[$pos]['token'] = $token;
                $validations[$pos]['text'] = $langs[$id_question][$token];
            }
        }
    }
}

function questionnaire_form_get_validations($questionIds, $formLang, $siteLang){      
    $result = db_query('SELECT id_question,token,text FROM {form_lang_validation} where code_language=:code_language and id_question in (:questionIds) order by id_question',array(':code_language' => $formLang, ':questionIds' => $questionIds));
    $validations = array();
    while($validation = $result->fetchAssoc()){
        array_push($validations,$validation);
    }
    
    if(isset($validations) && sizeof($validations)>0){
        if(strtoupper($formLang) != strtoupper($siteLang)){
            $result = db_query('SELECT id_question,token,text FROM {form_lang_validation} where code_language=:code_language and id_question in (:questionIds) order by id_question',array(':code_language' => strtoupper($siteLang), ':questionIds' => $questionIds));
            $langs = array();
            
            $lastQuestion = 0;
            $lastToken = "";                        
            while($aux = $result->fetchAssoc()){      
                if($lastQuestion!=$aux['id_question']){
                    $lastQuestion = $aux['id_question'];                
                    $lastToken = $aux['token'];
                    $langs[$lastQuestion] = array();
                    $langs[$lastQuestion][$lastToken] = $aux['text'];                
                }else if($lastToken!=$aux['token']){
                    $lastToken = $aux['token'];                
                    $langs[$lastQuestion][$lastToken] = $aux['text'];
                }   
            }
            translateValidations($validations,$langs);
        }
    }
    
    return $validations;
}

function questionnaire_get_option_labels($questionIds){        
    $result = db_query('SELECT * FROM {form_question_option_label} where id_question in (:questionIds) order by id_question',array(':questionIds' => $questionIds));
    $labels = array();
    while($label = $result->fetchAssoc()){
        array_push($labels,$label);
    }
    return $labels;
}

function questionnaire_get_form_logic_groups($formId){        
    $result = db_query('SELECT id_question, id_group, description, max_questions_positive, max_questions_negative, random_questions FROM {form_question_logic_group} where id_form =:formId and active=1 order by id_group',array(':formId' => $formId));
    $logics = array();
    while($logic = $result->fetchAssoc()){
        array_push($logics,$logic);
    }
    return $logics;
}


function questionnaire_get_form_logics($formId){        
    //FUTURA FUNCIONALIDAD DE CONDICIONES SOBRE LOS TEXTOS DE LOS GRIDS
    //$result = db_query('SELECT id_question, id_group, priority, type, logic,id_question_dependence, id_row, id_column, id_option_dependence FROM {form_question_logic} where id_form =:formId order by id_question',array(':formId' => $formId));
    $result = db_query('SELECT id_question, id_group, priority, type, logic,id_question_dependence,id_option_dependence FROM {form_question_logic} where id_form =:formId order by id_question',array(':formId' => $formId));
    $logics = array();
    while($logic = $result->fetchAssoc()){
        array_push($logics,$logic);
    }
    return $logics;
}

function questionnaire_get_form_option_logics($formId){        
    //FUTURA FUNCIONALIDAD DE CONDICIONES SOBRE LOS TEXTOS DE LOS GRIDS
    //$result = db_query('SELECT id_question,id_question,id_option,id_option_multiple,logic,id_question_dependence,id_row, id_column, id_option_dependence FROM {form_question_option_logic} where id_form =:formId order by id_question, id_option, id_option_multiple',array(':formId' => $formId));
    $result = db_query('SELECT id_question,id_question,id_option,id_option_multiple,logic,id_question_dependence, id_option_dependence FROM {form_question_option_logic} where id_form =:formId order by id_question, id_option, id_option_multiple',array(':formId' => $formId));
    $option_logics = array();
    while($option_logic = $result->fetchAssoc()){
        array_push($option_logics,$option_logic);
    }
    return $option_logics;
}

function translateOptions(& $options,$langs){
    for($i=0;$i<sizeof($options);$i++){
        if(isset($langs[$options[$i]['id_question']]) && $langs[$options[$i]['id_question']] && isset($langs[$options[$i]['id_question']]->options[$options[$i]['id_option']]) && $langs[$options[$i]['id_question']]->options[$options[$i]['id_option']]){
            $options[$i]['option'] = $langs[$options[$i]['id_question']]->options[$options[$i]['id_option']]->option;
        }
    }
}


function questionnaire_get_options_questions($questionIds, $formLang, $siteLang){        
    $result = db_query('SELECT *,CASE WHEN id_option_multiple=0 THEN (`order`*1000 + id_option) ELSE id_option*100 + `order` END FINAL_ORDER FROM {form_question_option} where `visible`=1 and id_question in (:questionIds) order by id_question,FINAL_ORDER',array(':questionIds' => $questionIds));
    $options = array();
    while($option = $result->fetchAssoc()){
        array_push($options,$option);
    }
    if(strtoupper($formLang) != strtoupper($siteLang)){
        $result = db_query('SELECT * FROM {form_lang_question_option} where id_question in (:questionIds) and code_language=:language order by id_question,id_option,id_option_multiple',array(':questionIds' => $questionIds, ':language' => strtoupper($siteLang)));
        $langs = array();
        
        $lastQuestion = 0;
        $lastOption = 0;
        while($aux = $result->fetchAssoc()){
            if($lastQuestion!=$aux['id_question']){
                $lastQuestion = $aux['id_question'];
                if($aux['id_option_multiple']!=0){
                    //it has multiple options
                    $lastOption = $aux['id_option'];
                    $langs[$lastQuestion]->options = array();
                    $langs[$lastQuestion]->options[$aux['id_option']] = array();
                    $langs[$lastQuestion]->options[$aux['id_option']][$aux['id_option_multiple']]->option = $aux['option'];
                }else{
                    //none multiple options
                    $langs[$lastQuestion]->options = array();
                    $langs[$lastQuestion]->options[$aux['id_option']]->option = $aux['option'];
                }                
            }else{
                //still same question
                if($aux['id_option_multiple']!=0){
                    //multiple options
                    if($lastOption!=$aux['id_option']){
                        //still the same option, but it has to have new multiple option id
                        $optionCount = sizeof($langs[$lastQuestion]->options[$aux['id_option']]);
                        $langs[$lastQuestion]->options[$aux['id_option']][$aux['id_option_multiple']]->option = $aux['option'];
                    }else{
                        //new id_option
                        $lastOption = $aux['id_option'];
                        $langs[$lastQuestion]->options[$aux['id_option']] = array();
                        $langs[$lastQuestion]->options[$aux['id_option']][$aux['id_option_multiple']]->option = $aux['option'];
                    }
                }else{
                    //regular without multiple options
                    $langs[$lastQuestion]->options[$aux['id_option']]->option = $aux['option'];
                }
            }
        }
        translateOptions($options, $langs);
    }
    
    return $options;
}

function translateGrids(& $grids,$langs){
    for($i=0;$i<sizeof($grids);$i++){
        if(isset($langs[$grids[$i]['id_question']]) && $langs[$grids[$i]['id_question']]){
            if($langs[$grids[$i]['id_question']]->rows[$grids[$i]['id_row']]){
                $grids[$i]['text_row'] = $langs[$grids[$i]['id_question']]->rows[$grids[$i]['id_row']];
            }
            
            if($langs[$grids[$i]['id_question']]->columns[$grids[$i]['id_column']]){
                $grids[$i]['text_column'] = $langs[$grids[$i]['id_question']]->columns[$grids[$i]['id_column']];
            }
        }
    }
}

function questionnaire_get_columns_rows_grids($questionIds, $formLang, $siteLang){        
    $query = 'SELECT r.id_question, r.id_row, r.text_exists as text_exists_row, r.text as text_row, r.image as image_row, r.image_path as image_path_row, c.id_column, c.text_exists as text_exists_column, c.text as text_column, c.image as image_column, c.image_path as image_path_column FROM {form_grid_row} as r';
    $query .= ' LEFT JOIN {form_grid_column} as c ON r.id_question=c.id_question';
    $query .= ' WHERE r.visible=1 and c.visible=1 and r.id_question in (:questionIds) ORDER BY r.id_question, r.id_row, c.id_column';
    
    
    $result = db_query($query,array(':questionIds' => $questionIds));
    $grids = array();
    while($grid = $result->fetchAssoc()){
        array_push($grids,$grid);
    }    

    if(strtoupper($formLang) != strtoupper($siteLang)){        
        $query = 'SELECT r.id_question, r.id_row, r.text as text_row, c.id_column, c.text as text_column FROM {form_lang_grid_row} as r';
        $query .= ' LEFT JOIN {form_lang_grid_column} as c ON r.id_question=c.id_question';
        $query .= ' WHERE r.id_question in (:questionIds) ORDER BY r.id_question, r.id_row, c.id_column';
                
        $result = db_query($query,array(':questionIds' => $questionIds));
        $langs = array();
        $lastQuestion = 0;
        while($aux = $result->fetchAssoc()){
            if($lastQuestion!=$aux['id_question']){
                //new question
                $lastQuestion = $aux['id_question'];
                $langs[$lastQuestion]->rows = array();
                $langs[$lastQuestion]->columns = array();
                $langs[$lastQuestion]->rows[$aux['id_row']] = $aux['text_row'];
                $langs[$lastQuestion]->columns[$aux['id_column']] = $aux['text_column'];
            }else{
                //same question
                $langs[$lastQuestion]->rows[$aux['id_row']] = $aux['text_row'];
                $langs[$lastQuestion]->columns[$aux['id_column']] = $aux['text_column'];
            }
        }  
        
        translateGrids($grids, $langs);
    }
    
    return $grids;
}

function translateQuestions(& $questions,$langs){
    for($i=0;$i<sizeof($questions);$i++){
        if(isset($langs[$questions[$i]['id_question']]) && $langs[$questions[$i]['id_question']]){
            $questions[$i]['question'] = $langs[$questions[$i]['id_question']]->question;
            $questions[$i]['description'] = $langs[$questions[$i]['id_question']]->description;
        }
    }
}

function questionnaire_get_questions($questionIds, $formLang, $siteLang){
    $result = db_query('SELECT * FROM {form_question} where id_question in (:questionIds)',array(':questionIds' => $questionIds));
    $questionsData = array();
    while($questionData = $result->fetchAssoc()){
        array_push($questionsData,$questionData);
    }
    
    if(strtoupper($formLang) != strtoupper($siteLang)){
        $result = db_query('SELECT * FROM {form_lang_question} where id_question in (:questionIds) and code_language=:language',array(':questionIds' => $questionIds, ':language' => strtoupper($siteLang)));
        $langs = array();
        
        while($aux = $result->fetchAssoc()){
            $langs[$aux['id_question']]->question = $aux['question'];
            $langs[$aux['id_question']]->description = $aux['description'];
        }
        translateQuestions($questionsData, $langs);
    }
    
    return $questionsData;
}

function translateButtons(& $buttons,$langs){
    foreach(array_keys($buttons) as $key){
        if(isset($langs[$key]) && $langs[$key]){
            $buttons[$key]['text_button'] = $langs[$key]->text;
        }
    }
}

function questionnaire_get_buttons_form($formId, $formLang, $siteLang){        
    $result = db_query('SELECT id_button FROM {form_rel_button_form} where `id_form`=:formId and active=1 order by `order`',array(':formId' => $formId));    
    $buttonsIds = array();
    while($buttonId = $result->fetchAssoc()){
        array_push($buttonsIds,$buttonId['id_button']);
    }
    $resultAux = db_query('SELECT * FROM {form_button} where id_button in (:buttonsIds)',array(':buttonsIds' => $buttonsIds));
    $buttons = array();
    while($button = $resultAux->fetchAssoc()){
        $index = $button['token'];
        $buttons[$index] = array();
        $buttons[$index]['text_button'] = $button['text_button'];
        $buttons[$index]['place_button'] = $button['place_button'];
        $buttons[$index]['type_button'] = $button['type_button'];
    }
    
    if(strtoupper($formLang) != strtoupper($siteLang)){   
        $resultAux = db_query('SELECT * FROM {form_lang_button} where id_button in (:buttonsIds) and code_language=:code_language',array(':buttonsIds' => $buttonsIds, ':code_language'=>$siteLang));
        $langs = array();
        while($aux = $resultAux->fetchAssoc()){
            $langs[$aux['token_button']]->text = $aux['text'];
        }
        
        translateButtons($buttons,$langs);
    }
    
    return $buttons;
}


function questionnaire_format_multiple_questions(& $options){
    //Lets now reformat the array
    if(sizeof($options)>0){
        $result = array();
        $lastQuestionID = $options[0]['id_question'];
        $tamSubArray = 1;
        $result[$lastQuestionID] = array();
        $result[$lastQuestionID][0]['id_option'] = $options[0]['id_option'];
        $result[$lastQuestionID][0]['id_option_multiple'] = $options[0]['id_option_multiple'];
        $result[$lastQuestionID][0]['image'] = $options[0]['image'];
        $result[$lastQuestionID][0]['image_path'] = $options[0]['image_path'];
        $result[$lastQuestionID][0]['text'] = $options[0]['text'];
        $result[$lastQuestionID][0]['text_exists'] = $options[0]['text_exists'];
        $result[$lastQuestionID][0]['is_none'] = $options[0]['is_none'];
        for($i=1;$i<sizeof($options);$i++){
            if($options[$i]['id_question']!=$lastQuestionID){
                $lastQuestionID = $options[$i]['id_question'];
                $result[$lastQuestionID] = array();
                $tamSubArray = 0;
            }
            $result[$lastQuestionID][$tamSubArray]['id_option'] = $options[$i]['id_option'];
            $result[$lastQuestionID][$tamSubArray]['id_option_multiple'] = $options[$i]['id_option_multiple'];
            $result[$lastQuestionID][$tamSubArray]['image'] = $options[$i]['image'];
            $result[$lastQuestionID][$tamSubArray]['text'] = $options[$i]['text'];
            $result[$lastQuestionID][$tamSubArray]['image_path'] = $options[$i]['image_path'];
            $result[$lastQuestionID][$tamSubArray]['text_exists'] = $options[$i]['text_exists'];
            $result[$lastQuestionID][$tamSubArray]['is_none'] = $options[$i]['is_none'];
            $tamSubArray++;
        }
        
        $options = $result;
    }
}

function questionnaire_format_grid_questions(& $gridQuestions){
    
    if(sizeof($gridQuestions)>0){
    	//first rows
    	$lastGrid = $gridQuestions[0]['id_question'];
    	$grids = array();
    	$grids[$lastGrid] = array();
    	$grids[$lastGrid]['rows'] = array();
    	$grids[$lastGrid]['rows'][0] = array();
		$grids[$lastGrid]['rows'][0]['id'] = $gridQuestions[0]['id_row'];
    	$grids[$lastGrid]['rows'][0]['text'] = $gridQuestions[0]['text_row'];
        $grids[$lastGrid]['rows'][0]['text_exists'] = $gridQuestions[0]['text_exists_row'];
        $grids[$lastGrid]['rows'][0]['image'] = $gridQuestions[0]['image_row'];
        $grids[$lastGrid]['rows'][0]['image_path'] = $gridQuestions[0]['image_path_row'];
    	$grids[$lastGrid]['columns'] = array();
    	$grids[$lastGrid]['columns'][0] = array();
    	$grids[$lastGrid]['columns'][0]['id'] = $gridQuestions[0]['id_column'];
    	$grids[$lastGrid]['columns'][0]['text'] = $gridQuestions[0]['text_column'];
        $grids[$lastGrid]['columns'][0]['text_exists'] = $gridQuestions[0]['text_exists_column'];
        $grids[$lastGrid]['columns'][0]['image'] = $gridQuestions[0]['image_column'];
        $grids[$lastGrid]['columns'][0]['image_path'] = $gridQuestions[0]['image_path_column'];
    	
    	//start the rows loop, first the rows
    	$indexRow = 1;
    	$indexColumn = 1;
    	//$indexGrid = 0;
    	$lastRow = $gridQuestions[0]['id_row'];
    	$lastColumn = (int)$gridQuestions[0]['id_column'];
    	for($i=1; $i<sizeof($gridQuestions); $i++){
            //$lastGrid = $gridQuestions[$i]['id_question'];
    		if($gridQuestions[$i]['id_question']!=$lastGrid){
    			//new question or grid
    			$indexRow = 0;
    			$lastRow = 0;
    			$indexColumn = 0;
    			$lastColumn = 0;
    			//$indexGrid++;
    			$lastGrid = $gridQuestions[$i]['id_question'];
    			$grids[$lastGrid] = array();
                $grids[$lastGrid]['rows'] = array();
                $grids[$lastGrid]['columns'] = array();                
    		}

    		if($lastRow!=$gridQuestions[$i]['id_row']){
    			$lastRow = $gridQuestions[$i]['id_row'];
                $grids[$lastGrid]['rows'][$indexRow] = array();
    			$grids[$lastGrid]['rows'][$indexRow]['id'] = $gridQuestions[$i]['id_row'];
                $grids[$lastGrid]['rows'][$indexRow]['text_exists'] = $gridQuestions[$i]['text_exists_row'];
    			$grids[$lastGrid]['rows'][$indexRow]['text'] = $gridQuestions[$i]['text_row'];
                $grids[$lastGrid]['rows'][$indexRow]['image'] = $gridQuestions[$i]['image_row'];
                $grids[$lastGrid]['rows'][$indexRow]['image_path'] = $gridQuestions[$i]['image_path_row'];
                $indexRow++;
    		}
    		
            
    		if((int)$gridQuestions[$i]['id_column']>$lastColumn){
    			//new Column
                //echo (int)$gridQuestions[$i]['id_column']." vs ".$lastColumn;
    			$lastColumn = (int)$gridQuestions[$i]['id_column'];
                $grids[$lastGrid]['columns'][$indexColumn] = array();
    			$grids[$lastGrid]['columns'][$indexColumn]['id'] = $gridQuestions[$i]['id_column'];
    			$grids[$lastGrid]['columns'][$indexColumn]['text_exists'] = $gridQuestions[$i]['text_exists_column'];
    			$grids[$lastGrid]['columns'][$indexColumn]['text'] = $gridQuestions[$i]['text_column'];
                $grids[$lastGrid]['columns'][$indexColumn]['image'] = $gridQuestions[$i]['image_column'];
                $grids[$lastGrid]['columns'][$indexColumn]['image_path'] = $gridQuestions[$i]['image_path_column'];
    			$indexColumn++;
    		} 	
    	}  	
    	$gridQuestions = $grids;
    }
}

function questionnaire_fill_questions_data(& $questions, $questionsData, $optionsQuestions, $gridQuestions, $questionOptionalLabels){
    //lets begin        
    for($i=0;$i<sizeof($questionsData);$i++){
        //extra verification, not mandatory, but you never know
        $encontrado = false;
        $index = 0;
        while(!$encontrado and $index<sizeof($questions)){
            if($questions[$index]['id_question']==$questionsData[$i]['id_question']){
                $encontrado = true;
            }else{
                $index++;
            }
        }
        $questions[$index]['text_exists'] = $questionsData[$i]['text_exists'];
        $questions[$index]['text'] = $questionsData[$i]['question'];
        if($questionsData[$i]['description']){
            $questions[$index]['description'] = $questionsData[$i]['description'];
        }
        $questions[$index]['image'] = $questionsData[$i]['image'];
        $questions[$index]['image_path'] = $questionsData[$i]['image_path'];
        $questions[$index]['type'] = $questionsData[$i]['type'];
        $questions[$index]['subtype'] = $questionsData[$i]['subtype'];
        $questions[$index]['validation'] = $questionsData[$i]['validation'];
        $questions[$index]['validation_extra'] = $questionsData[$i]['validation_extra'];
        $questions[$index]['maxlength'] = $questionsData[$i]['maxlength'];
        $questions[$index]['subtype'] = $questionsData[$i]['subtype'];
        $questions[$index]['has_last_option'] = $questionsData[$i]['has_last_option'];
        
        //now lets check if it has possible answers
        $questions[$index]['multiple'] = 0;    
        if(isset($optionsQuestions[$questions[$index]['id_question']])){
            //it has multiple answers
            $questions[$index]['multiple'] = 1;
        }else if(isset($gridQuestions[$questions[$index]['id_question']])){
            //it has multiple answers
            $questions[$index]['multiple'] = 1;
        }
    }
    
    //lets rename and clean some indexes
   	for($i=0;$i<sizeof($questions);$i++){
    	$questions[$i]['id'] = $questions[$i]['id_question'];
        $questions[$i]['id_group'] = $questions[$i]['id_group'];
    	$questions[$i]['mandatory'] = $questions[$i]['mandatory'];
        $questions[$i]['wide'] = $questions[$i]['wide'];
    	$questions[$i]['vertical'] = $questions[$i]['vertical'];
        //$questions[$i]['data_native_menu'] = $questions[$i]['data_native_menu'];
        $questions[$i]['data_multiple'] = $questions[$i]['data_multiple'];
        $questions[$i]['random_options'] = $questions[$i]['random_options'];
    	unset($questions[$i]['id_question']);
    	//unset($questions[$i]['mandatory']);
    	//unset($questions[$i]['vertical']);
    }
    
    $found = false;
    $cont = 0;
    for($i=0;$i<sizeof($questionOptionalLabels);$i++){
        while($cont<sizeof($questions) && !$found){
            if($questions[$cont]['id'] == $questionOptionalLabels[$i]['id_question']){
                $questions[$cont]['optional_label'] = $questionOptionalLabels[$i]['label'];
                $found = true;
            }else{
                $cont++;
            }
        }
    }
}


function questionnaire_random_options_questions($questions, & $options){
    for($i=0;$i<sizeof($questions);$i++){
        if($questions[$i]['multiple']==1 && $questions[$i]['random_options']==1){
            if($questions[$i]['type']!="grid" && $questions[$i]['subtype']!="group" && $questions[$i]['type']!="slider" && $questions[$i]['type']!="flipToggleSwitch"){
                if($questions[$i]['has_last_option']==0){
                    if(strtolower($questions[$i]['type'])!="dropdown"){
                        shuffle($options[$questions[$i]['id']]);
                    }else{
                        //for dropdown, the first option IN ORDER has to be SELECT, then the rest could be randomized
                        $optionsRandom = array();
                        $optionsRandom[0] = $options[$questions[$i]['id']][0];
                        
                        //now randomize the rest of the options
                        $optionsNonRandom = array();
                        for($j=1;$j<sizeof($options[$questions[$i]['id']]);$j++){
                            $optionsNonRandom[$j-1] = $options[$questions[$i]['id']][$j];
                        }                   
                        shuffle($optionsNonRandom);
                        
                        //now concat both arrays
                        for($j=0;$j<(sizeof($options[$questions[$i]['id']]) - 1);$j++){
                            $optionsRandom[$j+1] = $optionsNonRandom[$j];
                        }
                        $options[$questions[$i]['id']] = $optionsRandom;
                    }
                }else{
                    //watchout, it has other option, affects on checkbox multiple and dropdowns
                    if(strtolower($questions[$i]['type'])!="dropdown" && (strtolower($questions[$i]['type'])!="checkbox" && strtolower($questions[$i]['subtype'])!="multiple") && strtolower($questions[$i]['type'])!="radiobutton"){
                        shuffle($options[$questions[$i]['id']]);
                    }else if(strtolower($questions[$i]['type'])=="dropdown"){
                        //for dropdown, the first option IN ORDER has to be SELECT, then the rest could be randomized
                        $optionsRandom = array();
                        $optionsRandom[0] = $options[$questions[$i]['id']][0];
                        
                        //now randomize the rest of the options
                        $optionsNonRandom = array();
                        for($j=1;$j<(sizeof($options[$questions[$i]['id']]) - 1);$j++){
                            $optionsNonRandom[$j-1] = $options[$questions[$i]['id']][$j];
                        }                   
                        shuffle($optionsNonRandom);
                        
                        //now concat both arrays
                        for($j=0;$j<((sizeof($options[$questions[$i]['id']])) - 2);$j++){
                            $optionsRandom[$j+1] = $optionsNonRandom[$j];
                        }
                        
                        //and concat the last option (other)
                        $optionsRandom[sizeof($optionsRandom)] = end($options[$questions[$i]['id']]);
                        
                        $options[$questions[$i]['id']] = $optionsRandom;
                        
                    }else if(strtolower($questions[$i]['type'])=='checkbox' || strtolower($questions[$i]['type'])=='radiobutton'){
                        //the last option has to be always the last because it should be                    
                        //now randomize the rest of the options
                        $optionsRandom = array();
                        for($j=0;$j<(sizeof($options[$questions[$i]['id']]) - 1);$j++){
                            $optionsRandom[$j] = $options[$questions[$i]['id']][$j];
                        }                   
                        shuffle($optionsRandom);

                        //now concat other option (last one))
                        $optionsRandom[sizeof($optionsRandom)] = end($options[$questions[$i]['id']]);
                        
                        $options[$questions[$i]['id']] = $optionsRandom;
                    }
                }
            }
        }
        
    }
}

function questionnaire_random_grid_rows_questions($questions, & $gridQuestions){
    for($i=0;$i<sizeof($questions);$i++){
        if($questions[$i]['type']=="grid" && $questions[$i]['random_options']==1){
            shuffle($gridQuestions[$questions[$i]['id']]['rows']);
        }
    }
}

function questionnaire_format_logics(& $questionLogics){
    if(sizeof($questionLogics)>0){
        $result = array();
        $questionID = $questionLogics[0]['id_question'];
        $result[$questionID]->logic = $questionLogics[0]['logic'];
        $result[$questionID]->logics = array();
        $result[$questionID]->group = $questionLogics[0]['id_group'];
        $result[$questionID]->priority = $questionLogics[0]['priority'];
        $result[$questionID]->type = $questionLogics[0]['type'];
        $result[$questionID]->logics[$questionLogics[0]['id_question_dependence']] = array();
        //FUTURA FUNCIONALIDAD DE CONDICIONES SOBRE LOS TEXTOS DE LOS GRIDS
        /*$result[$questionID]->logics[$questionLogics[0]['id_question_dependence']][0]->option_dependence = $questionLogics[0]['id_option_dependence'];
        $result[$questionID]->logics[$questionLogics[0]['id_question_dependence']][0]->row = $questionLogics[0]['id_row'];
        $result[$questionID]->logics[$questionLogics[0]['id_question_dependence']][0]->column = $questionLogics[0]['id_column'];*/
        $result[$questionID]->logics[$questionLogics[0]['id_question_dependence']][0] = $questionLogics[0]['id_option_dependence'];
                
        //now start the loop
        for($i=1;$i<sizeof($questionLogics);$i++){
            if(!isset($result[$questionLogics[$i]['id_question']]->logics)){
                $questionID = $questionLogics[$i]['id_question'];
		        $result[$questionID]->logic = $questionLogics[$i]['logic'];
		        $result[$questionID]->logics = array();
		        $result[$questionID]->logics[$questionLogics[$i]['id_question_dependence']] = array();
		        $indexOptions = 0;
            }else{
            	$questionID = $questionLogics[$i]['id_question'];
            	if(!isset($result[$questionID]->logics[$questionLogics[$i]['id_question_dependence']])){
            		//new father for the given questionID
            		$result[$questionID]->logics[$questionLogics[$i]['id_question_dependence']][0] = array();
            		$indexOptions = 0;
            	}else{
            		$indexOptions = sizeof($result[$questionID]->logics[$questionLogics[$i]['id_question_dependence']]);
            	}
            } 
            $result[$questionID]->group = $questionLogics[$i]['id_group'];
            $result[$questionID]->priority = $questionLogics[$i]['priority'];
            $result[$questionID]->type = $questionLogics[$i]['type'];
            //FUTURA FUNCIONALIDAD DE CONDICIONES SOBRE LOS TEXTOS DE LOS GRIDS
            /*$result[$questionID]->logics[$questionLogics[$i]['id_question_dependence']][$indexOptions]->option_dependence = $questionLogics[$i]['id_option_dependence'];
            $result[$questionID]->logics[$questionLogics[$i]['id_question_dependence']][$indexOptions]->row = $questionLogics[$i]['id_row'];
            $result[$questionID]->logics[$questionLogics[$i]['id_question_dependence']][$indexOptions]->column = $questionLogics[$i]['id_row'];*/
            $result[$questionID]->logics[$questionLogics[$i]['id_question_dependence']][$indexOptions] = $questionLogics[$i]['id_option_dependence'];
        }

        $questionLogics = $result; 
    }       
    
}

function questionnaire_format_option_logics(& $questionOptionLogics){
    if(sizeof($questionOptionLogics)>0){
        $result = array();
        $questionID = $questionOptionLogics[0]['id_question'];
        $result[$questionID] = array();
        
        $lastIdOption = $questionOptionLogics[0]['id_option'];
        $result[$questionID][$lastIdOption] = array();
        
        $lastIdOptionMultiple = $questionOptionLogics[0]['id_option_multiple'];
        $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logic = $questionOptionLogics[0]['logic'];
        $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics = array();
        
        $lastQuestionOptionLogic = $questionOptionLogics[0]['id_question_dependence'];
        $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic] = array();
        //FUTURA FUNCIONALIDAD DE CONDICIONES SOBRE LOS TEXTOS DE LOS GRIDS
        /*$result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][0]->row = $questionOptionLogics[0]['id_row'];
        $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][0]->column = $questionOptionLogics[0]['id_column'];
        $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][0]->option_dependence = $questionOptionLogics[0]['id_option_dependence'];*/
        $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][0] = $questionOptionLogics[0]['id_option_dependence'];
                
        for($i=1;$i<sizeof($questionOptionLogics);$i++){
            if($questionOptionLogics[$i]['id_question'] == $questionID){
                //still the same question
                if($questionOptionLogics[$i]['id_option'] == $lastIdOption){
                    //same option
                    if($questionOptionLogics[$i]['id_option_multiple'] == $lastIdOptionMultiple){
                        //same multiple option
                        if($lastQuestionOptionLogic != $questionOptionLogics[$i]['id_question_dependence']){
                            //new question dependence
                            $lastQuestionOptionLogic = $questionOptionLogics[$i]['id_question_dependence'];
                            //FUTURA FUNCIONALIDAD DE CONDICIONES SOBRE LOS TEXTOS DE LOS GRIDS
                            /*$result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][0]->row = $questionOptionLogics[$i]['id_row'];
                            $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][0]->column = $questionOptionLogics[$i]['id_column'];
                            $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][0]->option_dependence = $questionOptionLogics[$i]['id_option_dependence'];*/
                            $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][0] = $questionOptionLogics[$i]['id_option_dependence'];
                        }else{
                            //same question dependence
                            $lastQuestionOptionValue = sizeof($result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic]);
                            //FUTURA FUNCIONALIDAD DE CONDICIONES SOBRE LOS TEXTOS DE LOS GRIDS
                            /*$result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][$lastQuestionOptionValue]->row = $questionOptionLogics[$i]['id_row'];
                            $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][$lastQuestionOptionValue]->column = $questionOptionLogics[$i]['id_column'];
                            $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][$lastQuestionOptionValue]->option_dependence =  $questionOptionLogics[$i]['id_option_dependence'];*/
                            $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][$lastQuestionOptionValue] = $questionOptionLogics[$i]['id_option_dependence'];
                        }
                    }else{
                        //new multiple option
                        $lastIdOptionMultiple = $questionOptionLogics[$i]['id_option_multiple'];
                        $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logic = $questionOptionLogics[$i]['logic'];
                        $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics = array();
                        
                        $lastQuestionOptionLogic = $questionOptionLogics[$i]['id_question_dependence'];
                        $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic] = array();
                        //FUTURA FUNCIONALIDAD DE CONDICIONES SOBRE LOS TEXTOS DE LOS GRIDS
                        /*$result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][$lastQuestionOptionValue]->row = $questionOptionLogics[$i]['id_row'];
                        $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][$lastQuestionOptionValue]->column = $questionOptionLogics[$i]['id_column'];
                        $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][$lastQuestionOptionValue]->option_dependence =  $questionOptionLogics[$i]['id_option_dependence'];*/
                        $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][$lastQuestionOptionValue] = $questionOptionLogics[$i]['id_option_dependence'];
                    }
                }else{
                    //new option
                    $lastIdOption = $questionOptionLogics[$i]['id_option'];
                    $result[$questionID][$lastIdOption] = array();
                    
                    $lastIdOptionMultiple = $questionOptionLogics[$i]['id_option_multiple'];
                    $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logic = $questionOptionLogics[$i]['logic'];
                    $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics = array();
                    
                    $lastQuestionOptionLogic = $questionOptionLogics[$i]['id_question_dependence'];
                    $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic] = array();
                    //FUTURA FUNCIONALIDAD DE CONDICIONES SOBRE LOS TEXTOS DE LOS GRIDS
                    /*$result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][0]->row = $questionOptionLogics[$i]['id_row'];
                    $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][0]->column = $questionOptionLogics[$i]['id_column'];
                    $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][0]->option_dependence =  $questionOptionLogics[$i]['id_option_dependence'];*/
                    $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][0] = $questionOptionLogics[$i]['id_option_dependence'];
                }
            }else{
                //new question
                $questionID = $questionOptionLogics[$i]['id_question'];
                $result[$questionID] = array();
                
                $lastIdOption = $questionOptionLogics[$i]['id_option'];
                $result[$questionID][$lastIdOption] = array();
                
                $lastIdOptionMultiple = $questionOptionLogics[$i]['id_option_multiple'];
                $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logic = $questionOptionLogics[$i]['logic'];
                $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics = array();
                
                $lastQuestionOptionLogic = $questionOptionLogics[$i]['id_question_dependence'];
                $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic] = array();
                //FUTURA FUNCIONALIDAD DE CONDICIONES SOBRE LOS TEXTOS DE LOS GRIDS
                /*$result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][0]->row = $questionOptionLogics[$i]['id_row'];
                $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][0]->column = $questionOptionLogics[$i]['id_column'];
                $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][0]->option_dependence =  $questionOptionLogics[$i]['id_option_dependence'];*/
                $result[$questionID][$lastIdOption][$lastIdOptionMultiple]->logics[$lastQuestionOptionLogic][0] = $questionOptionLogics[$i]['id_option_dependence'];
            }
        }
        $questionOptionLogics = $result; 
    }       
    
}


function questionnaire_get_form_data($nid, & $form, & $questions, & $questionGroups, & $optionsQuestions, & $gridQuestions, & $questionLogics, & $questionOptionLogics, & $questionLogicGroups, & $validations, & $paginationDetails, & $buttons){  
    //site language
    global $language;
    $siteLang = $language->language;

    //lets obtain first the form according to the given formId
    $form = questionnaire_form_by_nid($nid);
    $form = $form[0]; //should have one value
    $formLang = $form['code_language'];

    //lets now obtain the necessary data to show the form
    $questions = questionnaire_questions_by_form($form['id_form']);
    
    $questionIDs = array();
    for($i=0;$i<sizeof($questions);$i++){
        $questionIDs[$i] = $questions[$i]['id_question'];
    }
    //now paginations
    $paginationDetails = array();
    $paginations = questionnaire_paginations_by_form($form['id_form']);
    for($i=0;$i<sizeof($paginations);$i++){
    	$paginationDetails[$i]['num_questions'] = $paginations[$i]['num_questions'];
        $paginationDetails[$i]['qualify'] = $paginations[$i]['qualify'];        
    }
    
            
    //Lets all the possible translations for the validacion messages
    $valArray = questionnaire_form_get_validations($questionIDs, $formLang, $siteLang);
    $validations = array();
    $lastValQuestion = 0;
    for($i=0;$i<sizeof($valArray);$i++){
        if($lastValQuestion!=$valArray[$i]['id_question']){
            //new Question
            $lastValQuestion = $valArray[$i]['id_question'];
            $validations[$valArray[$i]['id_question']] = array();
            $validations[$valArray[$i]['id_question']][0] = array();
            $validations[$valArray[$i]['id_question']][0]['token'] = $valArray[$i]['token'];
            $validations[$valArray[$i]['id_question']][0]['text'] = $valArray[$i]['text'];
        }else{
            //same question
            $position = sizeof($validations[$valArray[$i]['id_question']]);
            $validations[$valArray[$i]['id_question']][$position] = array();
            $validations[$valArray[$i]['id_question']][$position]['token'] = $valArray[$i]['token'];
            $validations[$valArray[$i]['id_question']][$position]['text'] = $valArray[$i]['text'];
        }
    }
    
    //the question groups of the form's questions
    $questionGroups = questionnaire_get_question_groups_by_form($form['id_form']);

    //the labels of those questions
    $questionOptionLabels = questionnaire_get_option_labels($questionIDs);
    
    //the logic of those questions
    $questionLogics = questionnaire_get_form_logics($form['id_form']);
    //the logic of those questions options
    $questionOptionLogics = questionnaire_get_form_option_logics($form['id_form']);
    //multipleQuestions for this questions
    $optionsQuestions = questionnaire_get_options_questions($questionIDs, $formLang, $siteLang); 
    //the logic groups of those questions
    $questionLogicGroups = questionnaire_get_form_logic_groups($form['id_form']);
    //now the possible grids, both rows and columns
    $gridQuestions = questionnaire_get_columns_rows_grids($questionIDs, $formLang, $siteLang);
    //now lets make the query to the database to retrieve everything of all those questions
    $questionsData = questionnaire_get_questions($questionIDs, $formLang, $siteLang);
    
    //now lets fill all the necessary data for each question    
    //now replace existing (or not) tokens in the multiple Questions of multiple answer questions
    questionnaire_format_multiple_questions($optionsQuestions);
     
    //now format the grid object
    questionnaire_format_grid_questions($gridQuestions);
    
    //reformat some array objects
    questionnaire_fill_questions_data($questions,$questionsData,$optionsQuestions,$gridQuestions, $questionOptionLabels);
    
    
    //now lets check if there were questionGroups
    if(sizeof($questionGroups)>0){
        $questionGroupsArray = array();
        for($i=0;$i<sizeof($questionGroups);$i++){
            $idGroup = $questionGroups[$i]['id_group'];
            //Now look for this group in all the questions array
            $questionGroupsArray[$idGroup] = "";
            for($j=0; $j<sizeof($questions);$j++){
                if($questions[$j]['id_group']!=0 && $questions[$j]['id_group']==$idGroup){
                    $questionGroupsArray[$idGroup] .= ",".$questions[$j]['id'];
                }
            }
            $questionGroupsArray[$idGroup] = substr($questionGroupsArray[$idGroup], 1);
            $counts = questionnaire_get_question_group_needed($form['id_form'],$questionGroupsArray[$idGroup]);
            if(sizeof($counts)>0){
                $minimalArray = array();
                $min = $counts[0]['count'];
                for($j=1;$j<sizeof($counts);$j++){
                    if($counts[$j]["count"]<$min){
                        //new min found
                        $minimalArray = array();
                        $min = $counts[$j]['count'];
                        array_push($minimalArray, $counts[$j]);
                    }else if($counts[$j]["count"]==$min){
                        //same min found
                        if($j==1){
                            array_push($minimalArray, $counts[0]);
                            array_push($minimalArray, $counts[$j]);
                        }else{
                            array_push($minimalArray, $counts[$j]);
                        }
                    }else{
                         if($j==1){
                            array_push($minimalArray, $counts[0]);
                         }
                    }
                }
                
                if(sizeof($minimalArray)>0 && sizeof($minimalArray)==1){
                    //finish
                    $questionGroups[$i]['id_question_show'] = $minimalArray[0]['id_question'];
                }else if(sizeof($minimalArray)>0){
                    //several questions with the same number of answers
                    //random among them
                    $pos = array_rand($minimalArray, 1);
                    $questionGroups[$i]['id_question_show'] = $minimalArray[$pos]['id_question'];
                }
            }else{
                //no answers yet, so the first question needs to be given back
                $aux = explode(",",$questionGroupsArray[$idGroup]);
                $questionGroups[$i]['id_question_show'] = $aux[0];
            }
        }
    }
    
    //Now, if the form has random questions we should then randomize but taking care of its logic
    //lets randomize all options for all multiple questions
    questionnaire_random_options_questions($questions,$optionsQuestions);
    questionnaire_random_grid_rows_questions($questions,$gridQuestions);
         
    if($form['random_questions']==1){
        //lets randomize all questions but group them, order them, depending on its logic
    }
    
    //lets format the questionLogics to a more usable array object
    questionnaire_format_logics($questionLogics);
    questionnaire_format_option_logics($questionOptionLogics);
    
    $buttons = questionnaire_get_buttons_form($form['id_form'], $formLang, $siteLang);
}

function questionnaire_get_form_data_by_idform($id_form, & $form, & $questions, & $questionGroups, & $optionsQuestions, & $gridQuestions, & $questionLogics, & $questionOptionLogics, & $questionLogicGroups, & $validations, & $paginationDetails, & $buttons){  
    //site language
    global $language;
    $siteLang = $language->language;
    
    //lets obtain first the form according to the given formId
    $form = questionnaire_form_by_idform($id_form);
    $form = $form[0]; //should to have one value
    $formLang = $form['code_language'];

    //lets now obtain the necessary data to show the form
    $questions = questionnaire_questions_by_form($id_form);
    
    $questionIDs = array();
    for($i=0;$i<sizeof($questions);$i++){
        $questionIDs[$i] = $questions[$i]['id_question'];
    }
    //now paginations
    $paginationDetails = array();
    $paginations = questionnaire_paginations_by_form($id_form);
    for($i=0;$i<sizeof($paginations);$i++){
    	$paginationDetails[$i]['num_questions'] = $paginations[$i]['num_questions'];
        $paginationDetails[$i]['qualify'] = $paginations[$i]['qualify'];        
    }
    
            
    //Lets all the possible translations for the validacion messages
    $valArray = questionnaire_form_get_validations($questionIDs, $formLang, $siteLang);
    $validations = array();
    for($i=0;$i<sizeof($valArray);$i++){
        $validations[$valArray[$i]['id_question']] = array();
        $validations[$valArray[$i]['id_question']]['token'] = $valArray[$i]['token'];
        $validations[$valArray[$i]['id_question']]['text'] = $valArray[$i]['text'];
    }
    
    //the question groups of the form's questions
    $questionGroups = questionnaire_get_question_groups_by_form($id_form);
    
    //the labels of those questions
    $questionOptionLabels = questionnaire_get_option_labels($questionIDs);
    
    //the logic of those questions
    $questionLogics = questionnaire_get_form_logics($id_form);
    //the logic of those questions options
    $questionOptionLogics = questionnaire_get_form_option_logics($id_form);
    //multipleQuestions for this questions
    $optionsQuestions = questionnaire_get_options_questions($questionIDs, $formLang, $siteLang); 
    //the logic groups of those questions
    $questionLogicGroups = questionnaire_get_form_logic_groups($form['id_form']);
    //now the possible grids, both rows and columns
    $gridQuestions = questionnaire_get_columns_rows_grids($questionIDs, $formLang, $siteLang);
    //now lets make the query to the database to retrieve everything of all those questions
    $questionsData = questionnaire_get_questions($questionIDs, $formLang, $siteLang);
    
    //now lets fill all the necessary data for each question    
    //now replace existing (or not) tokens in the multiple Questions of multiple answer questions
    questionnaire_format_multiple_questions($optionsQuestions);
     
    //now format the grid object
    questionnaire_format_grid_questions($gridQuestions);
    
    //reformat some array objects
    questionnaire_fill_questions_data($questions,$questionsData,$optionsQuestions,$gridQuestions, $questionOptionLabels);
    
    //now lets check if there were questionGroups
    if(sizeof($questionGroups)>0){
        $questionGroupsArray = array();
        for($i=0;$i<sizeof($questionGroups);$i++){
            $idGroup = $questionGroups[$i]['id_group'];
            //Now look for this group in all the questions array
            $questionGroupsArray[$idGroup] = "";
            for($j=0; $j<sizeof($questions);$j++){
                if($questions[$j]['id_group']!=0 && $questions[$j]['id_group']==$idGroup){
                    $questionGroupsArray[$idGroup] .= ",".$questions[$j]['id'];
                }
            }
            $questionGroupsArray[$idGroup] = substr($questionGroupsArray[$idGroup], 1);
            $counts = questionnaire_get_question_group_needed($form['id_form'],$questionGroupsArray[$idGroup]);
            if(sizeof($counts)>0){
                $minimalArray = array();
                $min = $counts[0]['id_question'];
                array_push($minimalArray, $counts[0]);
                for($i=1;$i<sizeof($counts);$i++){
                    if($counts[$i]<$min){
                        //new min found
                        $minimalArray = array();
                        $min = $counts[i]['id_question'];
                        array_push($minimalArray, $counts[$i]);
                    }else if($counts[$i]==$min){
                        //same min found
                        array_push($minimalArray, $counts[$i]);
                    }
                }
                
                if(sizeof($minimalArray)>0 && sizeof($minimalArray)==1){
                    //finish
                    $questionGroups[$i]['id_question_show'] = $minimalArray[0]['id_question'];
                }else if(sizeof($minimalArray)>0){
                    //several questions with the same number of answers
                    //random among them
                    $pos = array_rand($minimalArray, 1);
                    $questionGroups[$i]['id_question_show'] = $minimalArray[$pos]['id_question'];
                }
            }else{
                //no answers yet, so the first question needs to be given back
                $aux = explode(",",$questionGroupsArray[$idGroup]);
                $questionGroups[$i]['id_question_show'] = $aux[0];
            }
        }
    }
    
    //Now, if the form has random questions we should then randomize but taking care of its logic
    //lets randomize all options for all multiple questions
    questionnaire_random_options_questions($questions,$optionsQuestions);
    questionnaire_random_grid_rows_questions($questions,$gridQuestions);
         
    if($form['random_questions']==1){
        //lets randomize all questions but group them, order them, depending on its logic
    }
    
    //lets format the questionLogics to a more usable array object
    questionnaire_format_logics($questionLogics);
    questionnaire_format_option_logics($questionOptionLogics);
    
    $buttons = questionnaire_get_buttons_form($id_form, $formLang, $siteLang);
}

function questionnaire_obtain_username(){
    if(isset($_POST['userid'])){
        $result = db_query("SELECT name from users where uid = :uid",array(':uid' => $_POST['userid']));
        $username = $result->fetchColumn(0);
        echo json_encode($username);
    }else{
        echo json_encode("-1");
    }
    exit();
}

function questionnaire_save_questionnaire(){
    if(isset($_POST['formAnswers']) && sizeof($_POST['formAnswers'])>0){
        $userid = 0;
        if(isset($_POST['userid']) && $_POST['userid']!=0){
            $userid = $_POST['userid'];
        }else{
            global $user;
            $userid = $user->uid;
        }
        
        if(isset($_POST['restartable']) && $_POST['restartable']=="1"){
            //first delete previous answers if any
            db_query("DELETE FROM {form_answer} where id_form=:id_form and form_user_id=:fuid and id_page=:id_page", array('id_form'=>$_POST['formId'], 'fuid'=>$_POST['formUserId'], 'id_page'=>$_POST['pageId']));
        }
        //once that has been done, lets save the current page
        $answers = $_POST['formAnswers'];
        $query = db_insert('form_answer')->fields(array('id_form', 'id_page', 'id_question', 'id_option', 'id_option_multiple', 'id_grid_row', 'answer', 'uid', 'form_user_id', 'date'));
        foreach ($answers as $answer) {
            $answer['uid'] = $userid;
            $answer['date'] = microtime(true);
            $query->values($answer);
        }
        
        try{
            if($query->execute()){
                echo json_encode(array('success' => true));
            }else{
                echo json_encode(array('success' => false, 'error' => 2));
            }
        }
        catch(Exception $e){
            echo json_encode(array('success' => false, 'error' => $e));
        }
    }else{
        echo json_encode(array('success' => false, 'error' => 1));
    }
    exit();
}

function questionnaire_get_questionnaire() {
    $form = array();
    $questions = array();
    $questionGroups = array();
    $optionsQuestions = array();
    $gridQuestions = array();
    $questionLogics = array();
    $questionOptionLogics = array();
    $questionLogicGroups = array();
    $validations = array();
    $paginationDetails = array();
    $buttons = array();
    
    questionnaire_get_form_data($_POST['nid'], $form, $questions, $questionGroups, $optionsQuestions, $gridQuestions, $questionLogics, $questionOptionLogics,$questionLogicGroups, $validations, $paginationDetails, $buttons);
    
    if(sizeof($buttons)==0){
        $forward = array('id_button'=>0,'text_button'=>'Next','token'=>'forward','type_button'=>'inline','place_button'=>'form');
        $back = array('id_button'=>0,'text_button'=>'Back','token'=>'back','type_button'=>'inline','place_button'=>'form');
        $save = array('id_button'=>0,'text_button'=>'Save','token'=>'save','type_button'=>'inline','place_button'=>'form');
        
        $buttons = array("back" => $back, "forward" => $forward, "save" => $save);
    }    
    echo json_encode(array("form" => $form, "questions" => $questions, "questionGroups" => $questionGroups, "multipleQuestions" => $optionsQuestions, "gridQuestions" => $gridQuestions, "questionLogics" => $questionLogics, "questionOptionLogics" => $questionOptionLogics, "validations" => $validations, "paginations" => $paginationDetails, "buttons" => $buttons));
    exit();
}

function questionnaire_get_questionnaire_profile(){
    $form = array();
    $questions = array();
    $questionGroups = array();
    $optionsQuestions = array();
    $gridQuestions = array();
    $questionOptionLogics = array();
    $questionLogicGroups = array();
    $questionLogics = array();
    $validations = array();
    $paginationDetails = array();
    $buttons = array();
    
    questionnaire_get_form_data(questionnaire_get_profile_form(), $form, $questions, $questionGroups, $optionsQuestions, $gridQuestions, $questionLogics, $questionOptionLogics, $questionLogicGroups, $validations, $paginationDetails, $buttons);
    
    if(sizeof($buttons)==0){
        $forward = array('id_button'=>0,'text_button'=>'Next','token'=>'forward','type_button'=>'inline','place_button'=>'form');
        $back = array('id_button'=>0,'text_button'=>'Back','token'=>'back','type_button'=>'inline','place_button'=>'form');
        $save = array('id_button'=>0,'text_button'=>'Save','token'=>'save','type_button'=>'inline','place_button'=>'form');
        
        $buttons = array("back" => $back, "forward" => $forward, "save" => $save);
    }
    
    echo json_encode(array("form" => $form, "questions" => $questions, "questionGroups" => $questionGroups, "multipleQuestions" => $optionsQuestions, "gridQuestions" => $gridQuestions, "questionLogics" => $questionLogics, "questionOptionLogics" => $questionOptionLogics, "validations" => $validations, "paginations" => $paginationDetails, "buttons" => $buttons));
    exit();
}


function questionnaire_get_questionnaire_mobile_login(){
    $form = array();
    $questions = array();
    $questionGroups = array();
    $optionsQuestions = array();
    $gridQuestions = array();
    $questionLogics = array();
    $questionOptionLogics = array();
    $questionLogicGroups = array();
    $validations = array();
    $paginationDetails = array();
    $buttons = array();
    
    questionnaire_get_form_data(questionnaire_get_login_form(), $form, $questions, $questionGroups, $optionsQuestions, $gridQuestions, $questionLogics, $questionOptionLogics, $questionLogicGroups, $validations, $paginationDetails, $buttons);
    
    if(sizeof($buttons)==0){
        $login = array('id_button'=>0,'text_button'=>'Login','token'=>'login','type_button'=>'flip-toggle','place_button'=>'form');
        $buttons = array('login' => $login);
    }
    
    echo json_encode(array("form" => $form, "questions" => $questions, "questionGroups" => $questionGroups, "multipleQuestions" => $optionsQuestions, "gridQuestions" => $gridQuestions, "questionLogics" => $questionLogics, "questionOptionLogics" => $questionOptionLogics, "validations" => $validations, "paginations" => $paginationDetails, "buttons" => $buttons));
    exit();
}


function questionnaire_get_questionnaire_mobile_register(){
    $form = array();
    $questions = array();
    $questionGroups = array();
    $optionsQuestions = array();
    $gridQuestions = array();
    $questionLogics = array();
    $questionOptionLogics = array();
    $questionLogicGroups = array();
    $validations = array();
    $paginationDetails = array();
    $buttons = array();
    
    questionnaire_get_form_data(questionnaire_get_register_form(), $form, $questions, $questionGroups, $optionsQuestions, $gridQuestions, $questionLogics, $questionOptionLogics, $questionLogicGroups, $validations, $paginationDetails, $buttons);
    
    if(sizeof($buttons)==0){
        $register = array('id_button'=>0,'text_button'=>'Register','token'=>'register','type_button'=>'flip-toggle','place_button'=>'form');
        $buttons = array('register' => $register);
    }
    
    echo json_encode(array("form" => $form, "questions" => $questions, "questionGroups" => $questionGroups, "multipleQuestions" => $optionsQuestions, "gridQuestions" => $gridQuestions, "questionLogics" => $questionLogics, "questionOptionLogics" => $questionOptionLogics, "validations" => $validations, "paginations" => $paginationDetails, "buttons" => $buttons));
    exit();
}

function questionnaire_get_questionnaire_by_idform() {
    $form = array();
    $questions = array();
    $questionGroups = array();    
    $optionsQuestions = array();
    $gridQuestions = array();
    $questionLogics = array();
    $questionOptionLogics = array();
    $questionLogicGroups = array();
    $validations = array();
    $paginationDetails = array();
    $buttons = array();
    
    questionnaire_get_form_data_by_idform($_POST['id_form'], $form, $questions, $questionGroups, $optionsQuestions, $gridQuestions, $questionLogics, $questionOptionLogics, $questionLogicGroups, $validations, $paginationDetails, $buttons);
    
    if(sizeof($buttons)==0){
        $forward = array('id_button'=>0,'text_button'=>'Next','token'=>'forward','type_button'=>'inline','place_button'=>'form');
        $back = array('id_button'=>0,'text_button'=>'Back','token'=>'back','type_button'=>'inline','place_button'=>'form');
        $save = array('id_button'=>0,'text_button'=>'Save','token'=>'save','type_button'=>'inline','place_button'=>'form');
        
        $buttons = array("back" => $back, "forward" => $forward, "save" => $save);
    }    
    echo json_encode(array("form" => $form, "questions" => $questions, "questionGroups" => $questionGroups, "multipleQuestions" => $optionsQuestions, "gridQuestions" => $gridQuestions, "questionLogics" => $questionLogics, "questionOptionLogics" => $questionOptionLogics, "validations" => $validations, "paginations" => $paginationDetails, "buttons" => $buttons));
    exit();
}

function questionnaire_done_questionnaire(){
    $query = db_insert('user_node_complete')->fields(array('uid', 'nid'));
    $register = array();
    if(isset($_POST['userid']) && $_POST['userid']!=0){
        $register['uid'] = $_POST['userid'];
    }else{
        global $user;
        $register['uid'] = $user->uid;
    }
    $register['nid'] = $_POST['nid'];
    $query->values($register);
    
    if($query->execute()){
        echo json_encode(array('success' => true));
    }else{
        echo json_encode(array('success' => false, 'error' => 2));
    }
    exit();
}

function questionnaire_register_panel(){
    if($_POST['vars']){
        $vars = $_POST['vars'];
        $date = microtime(true);
        $query = db_insert('form_panel_register')->fields(array('id_param', 'value_param', 'date'));
        for($i=0;$i<sizeof($vars);$i++){
            if(isset($vars[$i]['value']) && $vars[$i]['value']!=""){
                $value = array();
                $value['id_param'] = $vars[$i]['id'];
                $value['value_param'] = $vars[$i]['value'];
                $value['date'] = $date;
                $query->values($value);
            }
        }
        
        $value = array();
        $value['id_param'] = "browser";
        $value['value_param'] = $_POST['browser'];
        $value['date'] = $date;
        $query->values($value);
        
        if($query->execute()){
            echo json_encode(array('success' => true));
        }else{
            echo json_encode(array('success' => false, 'error' => 2));
        }
    }else{
        echo json_encode(array('success' => false, 'error' => 1));
    }
    exit();
}

function questionnaire_qualify_register(){
    //Call url_destino() mysql function with the next parameters:    
    $userid = $_POST['userid'];
    $page = $_POST['page'];    
 
    $result3 = db_query("SELECT url_destino".$page."('".$_POST['panelId']."','subsid',".$userid.")");
    $url = $result3->fetchColumn(0);
    
    //$url could be empty for registration while is still not next page and the qualifying goes well
    $pos = strpos($url,"node");
    if ($pos === false && $url!=""){
        $result4 = db_query("DELETE FROM sessions WHERE uid = :uid",array(':uid' => $userid));
    	session_destroy();
    }
    echo json_encode($url);
    
    exit();
}

function questionnaire_insert_form_user() {
    global $user;

    //first look for it, he could be already inside the table
    /*$result = db_query('SELECT id FROM {form_user} where `nid`=:nid and uid=:userid', array(':nid' => $_POST['nid'], ':userid' => $user->uid));
    $id = $result->fetchAssoc();
    if($id){
        echo json_encode(array('success' => true, "fuid" => $id));
    }else{*/

        $query = db_insert('form_user')->fields(array('uid', 'nid', 'browser', 'ip', 'date'));

        try {
            $register = array();
            $register['uid'] = $user->uid;
            $register['nid'] = $_POST['nid'];
            $register['browser'] = $_POST['browser'];
            $register['ip'] = $_SERVER['REMOTE_ADDR'];
            $register['date'] = microtime(true);

            $query->values($register);

            $form_user_id = $query->execute();
            echo json_encode(array('success' => true, "fuid" => $form_user_id));
        } catch (Exception $e) {
            echo json_encode(array('success' => false, "error" => $e));
        }
    //}
    exit();
}

function questionnaire_load_answers(){
    global $user;
    $result = db_query('SELECT id_page, id_question, id_option, id_option_multiple, id_grid_row, answer FROM {form_answer} where `id_form`=:formId and uid=:userid order by `date`,id_question',array(':formId' => $_POST['id_form'], ':userid' => $user->uid));    
    $answers = array();
    while($answer = $result->fetchAssoc()){
        array_push($answers,$answer);
    }
    
    //group each question now
    $lastPage = 0;
    $lastQuestion = 0;
    $result = array();
    for($i=0; $i<sizeof($answers);$i++){
        if($lastPage != $answers[$i]['id_page']){
            $lastPage = $answers[$i]['id_page'];
            $result[$lastPage] = array();            
        }
        if($lastQuestion != $answers[$i]['id_question']){
            $lastQuestion = $answers[$i]['id_question'];
            $result[$lastPage][$lastQuestion] = array();
        }
        $index = sizeof($result[$lastPage][$lastQuestion]);
        $result[$lastPage][$lastQuestion][$index]['id_option'] = $answers[$i]['id_option'];
        $result[$lastPage][$lastQuestion][$index]['id_option_multiple'] = $answers[$i]['id_option_multiple'];
        $result[$lastPage][$lastQuestion][$index]['id_grid_row'] = $answers[$i]['id_grid_row'];
        $result[$lastPage][$lastQuestion][$index]['answer'] = $answers[$i]['answer'];
    }
    
    echo json_encode(array('success' => true, "answers" => $result));
    exit();
}