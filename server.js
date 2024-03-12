const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_HR_Directory_db');
const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');

app.use(express.json());
app.use(require('morgan')('dev'));

app.get('/api/departments', async(req, res, next)=> {
    try{
        const SQL = `
        SELECT * from departments
        `;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch(error) {
        next(error)
    }
    // try {
    //     res.send()
    // }
    // catch(error)
    // {next(error)}
});

app.get('/api/employees', async(req, res, next)=> {
    try{
        const SQL = `
        SELECT * from employees
        `;
        const response = await client.query(SQL);
        res.send(response.rows);
    }
    catch(error){
        next(error);
    }
    // try {
    //     res.send()
    // }
    // catch(error)
    // {next(error)}
});

app.post('/api/employees', async(req, res, next)=> {
    try{
        const SQL = `
        INSERT INTO employees(name, department_id)
        VALUES($1, $2)
        RETURNING *
        `;
        const response = await client.query(SQL, [req.body.name, req.body.department_id]);
        res.send(response.rows[0]);
    }
    catch(error){
        next(error);
    }
    // try{
    //     res.send()
    // }
    // catch(error)
    // {next(error)}
});

app.put('/api/employees/:id', async(req, res, next)=> {
    try{
        const SQL = `
        UPDATE employees
        SET name=$1, department_id=$2
        WHERE id = $3
        RETURNING *
        `;
        const response = await client.query(SQL, [req.body.name, req.body.department_id, req.params.id]);
        res.send(response.rows[0]);
    }
    catch(error){
        next(error);
    }
    // try{
    //     res.send()
    // }
    // catch(error)
    // {next(error)}
});

app.delete('/api/employees/:id', async(req, res, next)=> {
    try{
        const SQL = `
        DELETE from employees
        WHERE id = $1
        `;
        await client.query(SQL, [req.params.id]);
        res.sendStatus(204);
    }
    catch(error){
        next(error)
    };
    // try{
    //     res.sendStatus()
    // }
    // catch(error)
    // {next(error)}
});








const init = async()=> {
    console.log('connecting to database');
    await client.connect();
    console.log('connected to database');
    let SQL = `
    DROP TABLE if EXISTS employees;
    DROP TABLE if EXISTS departments;
    CREATE TABLE departments(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100)
    );
    CREATE TABLE employees(
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        ranking INTEGER DEFAULT 3 NOT NULL,
        txt VARCHAR(255) NOT NULL,
        department_id INTEGER REFERENCES departments(id) NOT NULL
    );
    `;
    await client.query(SQL);
    console.log('tables created');
    SQL = `
    INSERT INTO departments(name) VALUES('HR');
    INSERT INTO departments(name) VALUES('Front Desk');
    INSERT INTO departments(name) VALUES('Instruction');
    INSERT INTO departments(name) VALUES('Retail');
    INSERT INTO employee(name, department_id) VALUES('Bobby', (SELECT id FROM departments WHERE name='HR'));
    INSERT INTO employee(name, department_id) VALUES('Gabriel', (SELECT id FROM departments WHERE name='Front Desk'));
    INSERT INTO employee(name, department_id) VALUES('Cleo', (SELECT id FROM departments WHERE name='Instruction'));
    INSERT INTO employee(name, department_id) VALUES('Louis', (SELECT id FROM departments WHERE name='Retail'));
    `;
    await client.query(SQL);
    console.log('data seeded');

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));
}

init();