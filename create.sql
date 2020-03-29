DROP TABLE IF EXISTS user_type_total;
DROP TABLE IF EXISTS user_group_entity_total;
DROP TABLE IF EXISTS user_group_type_total;
DROP TABLE IF EXISTS track;

CREATE TABLE IF NOT EXISTS track (
    id int NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    site_id varchar(50) NOT NULL,
    user_id int NOT NULL, 
    tracking_type varchar(50),
    entity_type varchar(50),
    entity_id int, 
    group_id int, 
    page_title varchar(250),
    page_url varchar(500),
    timestamp int, 
    client_type varchar(20), 
    client_id varchar(20),
    client_name varchar(20), 
    client_version varchar(20),
    ip_address varchar(50),
    user_agent varchar(250),
    data JSON
);



CREATE TABLE IF NOT EXISTS user_type_total (
    site_id varchar(50) NOT NULL,
    user_id int NOT NULL, 
    tracking_type varchar(50) NOT NULL, 
    total_time int DEFAULT 0, 
    last_track_id int,
    PRIMARY KEY(user_id, site_id, tracking_type), 
    FOREIGN KEY(last_track_id) REFERENCES track(id)
);


CREATE TABLE IF NOT EXISTS user_group_entity_total (
    site_id varchar(50) NOT NULL,
    user_id int NOT NULL, 
    group_id int NOT NULL,
    entity_type varchar(50) NOT NULL,
    entity_id int NOT NULL,
    total_time int DEFAULT 0, 
    last_track_id int,
    removed boolean,
    PRIMARY KEY(user_id, group_id, site_id, entity_id, entity_type), 
    FOREIGN KEY(last_track_id) REFERENCES track(id)
);

CREATE TABLE IF NOT EXISTS user_group_type_total (
    site_id varchar(50) NOT NULL,
    user_id int NOT NULL, 
    group_id int NOT NULL,
    tracking_type varchar(50) NOT NULL, 
    total_time int DEFAULT 0, 
    last_track_id int,
    PRIMARY KEY(user_id, site_id,group_id,tracking_type), 
    FOREIGN KEY(last_track_id) REFERENCES track(id)
);







-- SELECT track.id, user_type_total.total_time FROM track, user_type_total
--              WHERE (track.id ,user_type_total.total_time) = (
--                  SELECT last_track_id, total_time FROM user_type_total
--                  WHERE site_id = 'demo.theteamie.com' and user_id = 243 and tracking_type = 'lesson_view')