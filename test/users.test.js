const chai = require('chai');
const chaiHTTP = require('chai-http');
const { hashSync, compareSync } = require('bcrypt');
const { Op } = require('sequelize');
const server = require('../app');
const models = require('../models/index.js');
const saltRounds = 10;

chai.should();
chai.use(chaiHTTP);

describe('users', function () {

    beforeEach(function (done) {
        models.User.create({
            name: 'Akin',
            email: 'akin@gmail.com',
            password: '123',
            role: 'admin'
        }).then(() => {
            done();
        });
    });

    afterEach(function (done) {
        models.User.destroy({
            where: {
                email: {
                    [Op.or]: ['akin@gmail.com', 'yaqin@gmail.com', 'ahmad@gmail.com']
                }
            }
        }).then(() => {
            done();
        });
    });

    it('Should list ALL users on /api/users GET', function (done) {
        chai.request(server)
            .get('/api/users')
            .end(function (err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('data');
                res.body.should.have.property('success');
                res.body.data[0].should.have.property('id');
                res.body.data[0].should.have.property('name');
                res.body.data[0].should.have.property('email');
                res.body.data[0].should.have.property('password');
                res.body.data[0].should.have.property('role');
                res.body.data[0].name.should.equal('Akin');
                res.body.data[0].email.should.equal('akin@gmail.com');
                res.body.data[0].password.should.equal('123');
                res.body.data[0].role.should.equal('admin');
                done();
            });
    });

    it('Should add SINGLE users on /api/users POST', function (done) {
        const user = {
            name: 'Yaqin',
            email: 'yaqin@gmail.com',
            password: '123',
            role: 'user'
        };
        const hashPassword = hashSync(user.password, saltRounds);
        chai.request(server)
            .post('/api/users')
            .send({ ...user, password: hashPassword })
            .end(function (err, res) {
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('data');
                res.body.should.have.property('success');
                res.body.data.should.have.property('id');
                res.body.data.should.have.property('name');
                res.body.data.should.have.property('email');
                res.body.data.should.have.property('role');
                res.body.data.name.should.equal('Yaqin');
                res.body.data.email.should.equal('yaqin@gmail.com');
                compareSync(user.password, res.body.data.password).should.equal(false);
                res.body.data.role.should.equal('user');
                done();
            });
    });

    it('Should list SINGLE users on /api/users/<id> GET', function (done) {
        models.User.create({
            name: 'Ainul',
            email: 'ainul@gmail.com',
            password: '123',
            role: 'admin'
        }).then((data) => {
            chai.request(server)
                .get(`/api/users/${data.id}`)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('data');
                    res.body.should.have.property('success');
                    res.body.data.should.have.property('id');
                    res.body.data.should.have.property('name');
                    res.body.data.should.have.property('email');
                    res.body.data.should.have.property('password');
                    res.body.data.should.have.property('role');
                    res.body.data.name.should.equal('Ainul');
                    res.body.data.email.should.equal('ainul@gmail.com');
                    res.body.data.password.should.equal('123');
                    res.body.data.role.should.equal('admin');
                    done();
                });
        });

    });

    it('Should delete SINGLE users on /api/users/<id> DELETE', function (done) {
        chai.request(server)
            .get('/api/users')
            .end(function (err, res) {
                chai.request(server)
                    .delete(`/api/users/${res.body.data[0].id}`)
                    .end(function (error, response) {
                        response.should.have.status(200);
                        response.should.be.json;
                        response.body.should.be.a('object');
                        response.body.should.have.property('data');
                        response.body.should.have.property('success');
                        done();
                    });
            });

    });


    it('Should login SINGLE users on /api/login POST', function (done) {
        const plainPassword = '123';
        const hashPassword = hashSync(plainPassword, saltRounds);

        models.User.create({
            name: 'Ahmad',
            email: 'ahmad@gmail.com',
            password: hashPassword,
            role: 'admin'
        }).then((data) => {
            chai.request(server)
                .post(`/api/login`)
                .send({ email: data.email, password: plainPassword })
                .end(function (err, res) {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('data');
                    res.body.should.have.property('success');
                    res.body.data.should.have.property('id');
                    res.body.data.should.have.property('name');
                    res.body.data.should.have.property('token');
                    done();
                });
        });
    });

    it('Should logout SINGLE users on /api/logout GET', function (done) {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzM2LCJuYW1lIjoiQWhtYWQiLCJpYXQiOjE2ODA1OTYzNjR9.WF9_qexJWHAybjT8P7xK5MoDUYbO0urTrtXIxq8HUyo';
        chai.request(server)
            .get(`/api/logout`)
            .set('Authorization', `Bearer ${token}`)
            .end(function (err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('data');
                res.body.should.have.property('success');
                done();
            });
    });
});