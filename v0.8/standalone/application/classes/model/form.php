<?php defined('SYSPATH') OR die('No Direct Script Access');

Class Model_Form extends Model
{

    /*public function get_latest_news() {
        $sql = 'SELECT * FROM `news_example` ORDER BY `id` DESC LIMIT  0, 10';
        return $this->_db->query(Database::SELECT, $sql, FALSE)
                         ->as_array();
    }

    public function validate_news($arr) {
        return Validate::factory($arr)
            ->filter(TRUE, 'trim')
            ->rule('title', 'not_empty')
            ->rule('post', 'not_empty');
    }
    public function add_news($d) {
        // Create a new user record in the database
        $insert_id = DB::insert('news_example', array('title','post'))
            ->values(array($d['title'],$d['post']))
            ->execute();

        return $insert_id;
    }*/
    
    public function get_form($idForm){	    
	     $table = $this->quote_identifier("form_form");
	     return $this->query(Database::SELECT, 'SELECT *  FROM '.$table, FALSE)
        ->as_array();
    }
}