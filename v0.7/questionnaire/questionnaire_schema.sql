/*
SQLyog Community Edition- MySQL GUI v8.01 
MySQL - 5.1.41 : Database - drupal7-8
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

CREATE DATABASE /*!32312 IF NOT EXISTS*/`drupal7-8` /*!40100 DEFAULT CHARACTER SET latin1 */;

/*Table structure for table `tagscloud_actual_step_user` */

DROP TABLE IF EXISTS `tagscloud_actual_step_user`;

CREATE TABLE `tagscloud_actual_step_user` (
  `id_user` int(11) NOT NULL,
  `id_step` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_user`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `tagscloud_actual_step_user` */

/*Table structure for table `tagscloud_categories` */

DROP TABLE IF EXISTS `tagscloud_categories`;

CREATE TABLE `tagscloud_categories` (
  `id_category` int(10) unsigned NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_category`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `tagscloud_categories` */

insert  into `tagscloud_categories`(`id_category`,`name`) values (1,'BEST'),(2,'WORST');

/*Table structure for table `tagscloud_customwords` */

DROP TABLE IF EXISTS `tagscloud_customwords`;

CREATE TABLE `tagscloud_customwords` (
  `id_custom_word` int(11) NOT NULL,
  `id_user` int(10) unsigned DEFAULT NULL,
  `id_tagscloud` int(11) DEFAULT NULL,
  `word_name` varchar(100) DEFAULT NULL,
  `id_category` int(11) DEFAULT NULL,
  `position_x` int(11) DEFAULT NULL,
  `position_y` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_custom_word`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `tagscloud_customwords` */

/*Table structure for table `tagscloud_customwords_temp` */

DROP TABLE IF EXISTS `tagscloud_customwords_temp`;

CREATE TABLE `tagscloud_customwords_temp` (
  `id_custom_word` int(11) NOT NULL,
  `id_user` int(10) unsigned DEFAULT NULL,
  `id_tagscloud` int(11) DEFAULT NULL,
  `word_name` varchar(100) DEFAULT NULL,
  `id_category` int(11) DEFAULT NULL,
  `position_x` int(11) DEFAULT NULL,
  `position_y` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_custom_word`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `tagscloud_customwords_temp` */

/*Table structure for table `tagscloud_words` */

DROP TABLE IF EXISTS `tagscloud_words`;

CREATE TABLE `tagscloud_words` (
  `id_word` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `word` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id_word`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

/*Data for the table `tagscloud_words` */

insert  into `tagscloud_words`(`id_word`,`word`) values (1,'palabra1'),(2,'palabra2'),(3,'otra palabra3'),(4,'mas palabrejas');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
