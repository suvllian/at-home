CREATE DATABASE zaihu;

/* 用户表 */ 
CREATE TABLE IF NOT EXISTS user (
	id INT(16) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	nick_name VARCHAR(64) NOT NULL,
	open_id TEXT NOT NULL,
	phone VARCHAR(64) NOT NULL,
	member_type INT(16) NOT NULL DEFAULT 0
) DEFAULT CHARACTER SET gbk COLLATE gbk_chinese_ci;

/* 会员类型 */
CREATE TABLE IF NOT EXISTS member_info (
	id INT(16) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	member_type INT(16) NOT NULL,
	member_description VARCHAR(64) NOT NULL,
	member_scale VARCHAR(64) NOT NULL
) DEFAULT CHARACTER SET gbk COLLATE gbk_chinese_ci;

/* 订单类型信息 */
CREATE TABLE IF NOT EXISTS order_type_infor (
	id INT(16) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	type_name VARCHAR(64) NOT NULL,
	type_description VARCHAR(64) NOT NULL,
	type_price VARCHAR(64) NOT NULL,
	parent_type INT(16) NOT NULL
) DEFAULT CHARACTER SET gbk COLLATE gbk_chinese_ci;

/* 地址表 */
CREATE TABLE IF NOT EXISTS address_info (
	id INT(16) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(64) NOT NULL,
	is_male INT(16) NOT NULL,
	phone VARCHAR(64) NOT NULL,
	area VARCHAR(64) NOT NULL,
	specific_address VARCHAR(128) NOT NULL,
	user_id INT(16) NOT NULL,
	FOREIGN KEY(user_id) REFERENCES user(id) 
) DEFAULT CHARACTER SET gbk COLLATE gbk_chinese_ci;

/* 订单表 */
CREATE TABLE IF NOT EXISTS order_list (
	id INT(16) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	user_id INT(16) NOT NULL,
	order_id VARCHAR(128) NOT NULL,
	order_parent_type INT(16) NOT NULL,
	order_type_id INT(16) NOT NULL,
	order_time VARCHAR(128) NOT NULL,
	order_description VARCHAR(128),
	gmt_create VARCHAR(128) NOT NULL,
	money_number FLOAT(16) NOT NULL,
	address_id INT(16) NOT NULL,
	has_payed INT(16) NOT NUll DEFAULT 0,
	coupon_id INT(16),
	FOREIGN KEY(user_id) REFERENCES user(id),
	FOREIGN KEY(address_id) REFERENCES address_info(id)
) DEFAULT CHARACTER SET gbk COLLATE gbk_chinese_ci;

/* 验证码表 */
CREATE TABLE IF NOT EXISTS phone_sms_verify_code (
	id INT(16) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	create_time TEXT NOT NULL,
	invalid_time TEXT NOT NULL,
	verify_code VARCHAR(32) NOT NULL,
	user_openid VARCHAR(128) NOT NULL,
	phone_number VARCHAR(128) NOT NULL,
	has_used INT(16) NOT NULL  DEFAULT 0
) DEFAULT CHARACTER SET gbk COLLATE gbk_chinese_ci;

/* 卡券类型表 */
CREATE TABLE IF NOT EXISTS coupons_type (
	id INT(16) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	type_name TEXT NOT NULL
) DEFAULT CHARACTER SET gbk COLLATE gbk_chinese_ci;

/* 卡券信息表 */
CREATE TABLE IF NOT EXISTS coupons_information (
	id INT(16) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	description TEXT NOT NULL,
	image_url TEXT NOT NULL,
	coupon_type INT(16) NOT NULL,
	coupons_price INT(128) NOT NULL,
	FOREIGN KEY(coupon_type) REFERENCES coupons_type(id)
) DEFAULT CHARACTER SET gbk COLLATE gbk_chinese_ci;


/* 抵用券表 */
CREATE TABLE IF NOT EXISTS send_coupon_list (
	id INT(16) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	coupon_code VARCHAR(128) NOT NULL,
	money_number FLOAT(16) NOT NULL,
	gmt_create VARCHAR(128) NOT NULL,
	invalid_time VARCHAR(128) NOT NULL,
	coupon_type VARCHAR(128) NOT NULL,
	gmt_exchange VARCHAR(128),
	gmt_used VARCHAR(128),
	customer_id INT(16),
	used_order_id VARCHAR(128),
	has_exchanged INT(16) NOT NUll DEFAULT 0,
	has_used INT(16) NOT NUll DEFAULT 0,
	FOREIGN KEY(customer_id) REFERENCES user(id)
) DEFAULT CHARACTER SET gbk COLLATE gbk_chinese_ci;


/* 用户卡券表 */
CREATE TABLE IF NOT EXISTS coupon_list (
	id INT(16) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	buyer_id INT(16) NOT NULL,
	order_id VARCHAR(128) NOT NULL,
	coupon_type_id INT(16) NOT NULL,
	money_number FLOAT(16) NOT NULL,
	gmt_create VARCHAR(128) NOT NULL,
	gmt_exchange VARCHAR(128),
	gmt_used VARCHAR(128),
	customer_id INT(16),
	has_payed INT(16) NOT NUll DEFAULT 0,
	has_used INT(16) NOT NUll DEFAULT 0,
	FOREIGN KEY(buyer_id) REFERENCES user(id)
) DEFAULT CHARACTER SET gbk COLLATE gbk_chinese_ci;


/* 家政服务、企业清洁页面 */
CREATE TABLE IF NOT EXISTS page_information (
	id INT(16) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	description TEXT NOT NULL,
	image_url TEXT NOT NULL,
	page_id INT(16) NOT NULL,
	page_name VARCHAR(128) NOT NULL
) DEFAULT CHARACTER SET gbk COLLATE gbk_chinese_ci;