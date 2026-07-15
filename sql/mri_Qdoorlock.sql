CREATE TABLE
    IF NOT EXISTS `mri_qdoorlock_groups` (
        `id` int (11) unsigned NOT NULL AUTO_INCREMENT,
        `name` varchar(50) NOT NULL,
        `coords` varchar(255) NOT NULL,
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    IF NOT EXISTS `mri_qdoorlock` (
        `id` int (11) unsigned NOT NULL AUTO_INCREMENT,
        `name` varchar(50) NOT NULL,
        `data` longtext NOT NULL,
        `group_id` int(11) unsigned DEFAULT NULL,
        PRIMARY KEY (`id`),
        KEY `fk_mri_qdoorlock_group` (`group_id`),
        CONSTRAINT `fk_mri_qdoorlock_group` FOREIGN KEY (`group_id`) REFERENCES `mri_qdoorlock_groups` (`id`) ON DELETE CASCADE
    );
