module.exports = {
	/*
	 * 根据openid获取userid
	 */
	query_userid_by_openid: 'SELECT id FROM user WHERE open_id = ? AND phone = ?',
	/*
	 * 添加地址
	 */
	insert_address: 'INSERT INTO address_info (name, is_male, phone, area, specific_address, user_id) VALUES (?, ?, ?, ?, ?, ?)',
	/*
	 * 查询地址
	 */
	query_address: 'SELECT address_info.id AS address_id, address_info.name, address_info.is_male, address_info.phone, address_info.area, address_info.specific_address FROM address_info, user WHERE user.open_id = ? AND user.phone = ? AND user.id = address_info.user_id',
	/*
	 * 查询订单类型信息
	 */
	query_order_type_info: 'SELECT * FROM order_type_infor WHERE parent_type = ?',
	/*
	 * 查询用户信息
	 */
	query_user_info: 'SELECT * FROM user WHERE id = ?',
	/*
	 * 查询用户是否注册
	 */
	query_userinfor_by_openid_phone: 'SELECT * FROM user, member_info WHERE open_id = ? AND phone = ? AND user.member_type = member_info.member_type',
	/*
	 * 新用户注册
	 */
	insert_user: 'INSERT INTO user (nick_name, open_id, phone, member_type) VALUES (?, ?, ?, ?)',
	/*
	 * 插入验证码
	 */
	insert_verify_code: 'INSERT INTO phone_sms_verify_code (create_time, invalid_time, verify_code, user_openid, phone_number, has_used) VALUES (?, ?, ?, ?, ?, ?)',
	/*
	 * 查询验证码
	 */
	query_verify_code: 'SELECT * FROM phone_sms_verify_code WHERE ? < invalid_time AND user_openid = ? AND phone_number = ? AND  has_used = 0 ORDER BY id DESC LIMIT 0,1',
	/*
	 * 查询一分钟内是否发送过验证码验证码
	 */
	query_has_sent_code: 'SELECT * FROM phone_sms_verify_code WHERE ? < create_time AND phone_number = ? AND has_used = 0 ORDER BY id DESC LIMIT 0,1',
	/*
	 * 查询一分钟内是否发送过验证码验证码
	 */
	update_verify_code_to_invalid: 'UPDATE phone_sms_verify_code SET has_used = 1 WHERE id = ?',
	/*
	 * 查询订单列表
	 */
	query_order_list: 'SELECT order_time, gmt_create, money_number, type_description  FROM order_list, order_type_infor, user WHERE user.open_id = ? AND user.phone = ? AND user.id = order_list.user_id AND order_list.order_type_id = order_type_infor.id AND has_payed = 1 ORDER BY order_list.id DESC',
	/*
	 * 查询卡券列表
	 */
	query_coupons_list: 'SELECT * FROM coupons_type, coupons_information WHERE coupons_type.id = coupons_information.coupon_type',
	/*
	 * 添加新订单
	 */
	insert_new_order: 'INSERT INTO order_list (user_id, order_id, order_parent_type, order_type_id, order_time, order_description, gmt_create, money_number, address_id, has_payed, coupon_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
	/*
	 * 更新订单状态
	 */
	update_order_status: 'UPDATE order_list SET has_payed = 1 WHERE order_id = ?',
	/*
	 * 查询家政服务和企业清洁信息
	 */
	query_page_information: 'SELECT * FROM page_information WHERE page_id = ?',
	/**
	 * 查询抵用券是否存在
	 */
	query_sent_coupon: 'SELECT * FROM send_coupon_list WHERE coupon_code = ? AND invalid_time > ? AND has_exchanged = 0 AND has_exchanged = 0',
	/**
	 * 领用抵用券
	 */
	update_sent_coupon: 'UPDATE send_coupon_list SET has_exchanged = 1, customer_id = ?, gmt_exchange = ? WHERE id = ?',
	/**
	 * 查询用户券列表
	 */
	query_coupon_list: 'SELECT money_number AS coupons_money, gmt_exchange, has_used, nick_name AS coupons_username, coupon_type FROM send_coupon_list, user WHERE customer_id = ? AND user.id = send_coupon_list.customer_id ORDER BY gmt_exchange DESC',
	/**
	 * 查询用户有效卡券
	 */
	query_effictive_coupon: 'SELECT id AS coupon_id, money_number AS coupons_money, gmt_exchange, coupon_type FROM send_coupon_list WHERE customer_id = ? AND has_used = 0 AND has_exchanged = 1 ORDER BY money_number DESC',
	/**
	 * 使用抵用券
	 */
	update_use_sent_coupon: 'UPDATE send_coupon_list SET has_used = 1, gmt_used = ?, used_order_id = ? WHERE id = ?',

	/* 管理员 */
	/**
	 * 查询所有订单
	 */
	query_all_order_list_admin: 'SELECT user.nick_name, order_list.order_time, order_list.order_parent_type, order_list.order_description, order_list.gmt_create, order_list.money_number, order_list.order_type_id, address_info.name, address_info.is_male, address_info.phone, address_info.area, address_info.specific_address, order_type_infor.type_name FROM user, order_list, address_info, order_type_infor WHERE order_type_infor.id = order_list.order_type_id AND user.id = order_list.user_id AND order_list.address_id = address_info.id AND order_list.has_payed = 1 ORDER BY order_list.id DESC',
	/**
	 * 查询所有订单类型价格
	 */
	query_all_order_type_infor_admin: 'SELECT * FROM order_type_infor',
	/**
	 * 查询指定订单类型价格
	 */
	query_order_type_infor_admin: 'SELECT * FROM order_type_infor WHERE parent_type = ?',
	/**
	 * 更新订单类型价格
	 */
	update_type_infor_admin: 'UPDATE order_type_infor SET type_price = ? WHERE id = ?',
	/**
	 * 查询用户信息
	 */
	query_user_list: 'SELECT user.id, user.nick_name, user.phone, member_info.member_description FROM user, member_info WHERE user.member_type = member_info.member_type',
	/**
	 * 查询特定用户信息
	 */
	query_user_infor_byid_admin: 'SELECT user.id, user.nick_name, user.phone, member_info.member_description FROM user, member_info WHERE user.id = ? AND user.member_type = member_info.member_type',
		/*
	 * 查询特定用户订单列表
	 */
	query_user_order_byid_admin: 'SELECT order_time, gmt_create, money_number, type_description  FROM order_list, order_type_infor, user WHERE user.id = ? AND user.id = order_list.user_id AND order_list.order_type_id = order_type_infor.id AND has_payed = 1 ORDER BY order_list.id DESC',
	/*
	 * 查询特定用户地址
	 */
	query_user_address_byid_admin: 'SELECT address_info.id AS address_id, address_info.name, address_info.is_male, address_info.phone, address_info.area, address_info.specific_address FROM address_info, user WHERE user.id = ? AND user.id = address_info.user_id',
	/**
	 * 查询用户券列表
	 */
	query_coupon_list_admin: 'SELECT coupon_code, money_number, invalid_time, gmt_exchange, gmt_used, has_used FROM send_coupon_list, user WHERE customer_id = ? AND user.id = send_coupon_list.customer_id ORDER BY gmt_exchange DESC',
	/**
	 * 查询所有券列表
	 */
	query_all_coupon_list_admin: 'SELECT send_coupon_list.*, user.nick_name FROM send_coupon_list LEFT JOIN user ON send_coupon_list.customer_id = user.id ORDER BY send_coupon_list.id DESC',
	/**
	 * 添加券
	 */
	insert_new_sent_coupon_admin: 'INSERT INTO send_coupon_list (coupon_code, money_number, gmt_create, invalid_time, coupon_type) VALUES (?, ?, ?, ?, ?)'
}

