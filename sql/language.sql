
CREATE TABLE language (
    language_id INT PRIMARY KEY identity(1, 1) not null,
    language_name NVARCHAR(50) not null,
	is_active BIT DEFAULT 1 not null,
);


CREATE TABLE type_translate (
    type_translate_id INT PRIMARY KEY identity(1, 1) not null,
    type_translate_name NVARCHAR(50) not null,
	is_active BIT DEFAULT 1 not null,
);

insert into language(language_name)
values ('English')

insert into language(language_name)
values ('Vietnamese')

insert into type_translate(type_translate_name)
values ('English - Vietnamese')

CREATE TABLE word (
    word_id INT PRIMARY KEY identity(1, 1) not null,
    language_id INT not null,
    word_name NVARCHAR(100) not null,
    pronunciation NVARCHAR(100),
    sound NVARCHAR(255),
    FOREIGN KEY (language_id) REFERENCES language(language_id),
	is_active BIT DEFAULT 1 not null,
);

insert into word(language_id, word_name, pronunciation, sound)
values (1, 'word', 'wɜːd', '')

insert into word(language_id, word_name, pronunciation, sound)
values (1, 'word', 'wɜːd', '')

CREATE TABLE translate (
    translate_id INT PRIMARY KEY identity(1, 1) not null,
    source_word_id INT not null,
    trans_word_id INT not null,
    type_translate_id INT not null,
    FOREIGN KEY (source_word_id) REFERENCES word(word_id),
    FOREIGN KEY (trans_word_id) REFERENCES word(word_id),
    FOREIGN KEY (type_translate_id) REFERENCES type_translate(type_translate_id),
	is_active BIT DEFAULT 1 not null,
);

insert into translate(source_word_id, trans_word_id, type_translate_id)
values (1, 2, 1)