<?php defined('SYSPATH') or die('No direct script access.');

class Controller_Test extends Controller {

	public function action_index()
	{
		//$this->response->body('hello, world!');
		echo "MARK";
		$this->test();
	}
	
	public function action_test(){
		echo "MARK2";
	}
	
	/*public function init_form(){
		$forms = Model::factory('form');
		echo "<pre>";
		print_r($forms->get_form(1));
		echo "</pre>";
	}*/

} // End Welcome
