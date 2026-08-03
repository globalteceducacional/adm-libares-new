-- Log de atividade do app leitor (user_login_api.php).
CREATE TABLE IF NOT EXISTS tbl_active_log (
    id INT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    date_time VARCHAR(200) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_tbl_active_log_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
