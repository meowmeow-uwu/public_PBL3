DROP TABLE account;

ALTER TABLE users
ADD username NVARCHAR(50) UNIQUE NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(100) NOT NULL;

	select * from users

	insert into group_user( group_name)
	values ('Admin')

		insert into group_user( group_name)
	values ('User')

		insert into group_user( group_name)
	values ('Content Manager')

	insert into users(username, email, password, name, avatar, group_user_id)
	values('admin', '@mail','123456', 'Administrator', '', 1)

		insert into users(username, email, password, name, avatar, group_user_id)
	values('user01', '@mail1','123456', 'User', '', 3)
		insert into users(username, email, password, name, avatar, group_user_id)
	values('employee01', '@mail2','123456', 'Employee', '', 2)