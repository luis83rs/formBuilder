<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="https://www.w3.org/1999/xhtml">

<head>
    <?php drupal_add_library('system', 'ui.draggable'); ?>
    <?php drupal_add_library('system', 'ui.droppable'); ?>
    <?php drupal_add_js(drupal_get_path('module','questionnaire') . '/js/navigator.detection.js'); ?>
    <?php drupal_add_js(drupal_get_path('module','questionnaire') . '/js/jquery.loading.js'); ?>
    <?php //drupal_add_js(drupal_get_path('module','questionnaire') . '/js/formBuilder.0.6.jquery.js'); ?>
    <?php //drupal_add_js(drupal_get_path('module','questionnaire') . '/js/formFunctionalities.0.6.jquery.js'); ?>
    <?php //drupal_add_js(drupal_get_path('module','questionnaire') . '/js/formElements.0.6.jquery.js'); ?>
    
    <?php drupal_add_js(drupal_get_path('module','questionnaire') . '/js/form.0.7.jquery.js'); ?>
    <?php drupal_add_js(drupal_get_path('module','questionnaire') . '/js/question.0.7.jquery.js'); ?>
    <?php drupal_add_js(drupal_get_path('module','questionnaire') . '/js/buttons.0.7.jquery.js'); ?>
    <?php drupal_add_js(drupal_get_path('module','questionnaire') . '/js/progress.bar.0.7.jquery.js'); ?>
    
    <?php drupal_add_js(drupal_get_path('module','questionnaire') . '/js/jquery-ui-1.8.18.custom.min.js'); ?>
    <?php drupal_add_js(drupal_get_path('module','questionnaire') . '/js/jquery.validate.js'); ?>
    <?php drupal_add_js(drupal_get_path('module','questionnaire') . '/js/jquery.ui.touch-punch.js'); ?>
    <?php //drupal_add_js(drupal_get_path('module','questionnaire') . '/js/jquery.scrollTo-min.js'); ?>
    <?php drupal_add_css(drupal_get_path('module','questionnaire') . '/css/jquery-ui-1.8.18.custom.css'); ?>
    <?php drupal_add_css(drupal_get_path('module','questionnaire') . '/css/style.css'); ?>
    <?php drupal_add_js(drupal_get_path('module', 'pdj') . '/js/jquery.alerts.js'); ?>
    <?php drupal_add_css(drupal_get_path('module', 'pdj') . '/css/jquery.alerts.css'); ?>
    <script type="text/javascript">
        var path;
        var rootPath;
        var nid = "<?php echo $questionnaire_node_id; ?>";
        var test = "<?php if(isset($_GET['test']) && $_GET['test']!=""){ echo $_GET['test'];}else{ echo 0;}?>";
    	jQuery(document).ready(function() {
            path = "/" + "<?php echo drupal_get_path('module','questionnaire');?>";
            rootPath ="<?php global $base_url; echo $base_url;?>";
            var form = new Form();
            form.loadQuestionnaire(nid, 'form_content', null, null);        
            //load_questionnaire(nid, 'form_content');
    		/*(function(){
                // remove layerX and layerY
                var all = jQuery.event.props,
                    len = all.length,
                    res = [];
                while (len--) {
                  var el = all[len];
                  if (el != 'layerX' && el != 'layerY') res.push(el);
                }
                jQuery.event.props = res;
            }());*/
    	});
    </script>
</head>

<body>
    <div id="loading_div">
        <label id="loading_label">Loading</label>
        <img id="loading_image" src="/sites/all/modules/custom/questionnaire/images/loading.gif" alt="loading image"/>
    </div>
    <div id="form_content">
    </div>    
</body>
</html>