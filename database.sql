drop table if exists todo;

create table todo (
    id serial not null primary key,
    todo_title varchar(255),
    todo_body text not null
);