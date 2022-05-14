const path = require("path");
const express = require('express');
const bodyParser = require('body-parser');
const db = require('../database');
const hbs = require('hbs');
const app = express();
const nodemailer = require('nodemailer');
require('dotenv').config();

const fetch = (...args) =>
    import ('node-fetch').then(({ default: fetch }) => fetch(...args));

const port = process.env.PORT || 3000;


// obatining path
let = staticPath = path.join(__dirname, '../public');
let = templatePath = path.join(__dirname, '../templates');
let = viewsPath = path.join(__dirname, '../templates/views');
let = partialsPath = path.join(__dirname, '../templates/partials');

// register partials
hbs.registerPartials(partialsPath)

// initializing the middleware
app.set('view engine', 'hbs')
app.set('views', viewsPath)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(staticPath));


let admin_name = '';
let login_email = '';
let pics;



app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', (req, res) => {
    user_name = req.body.name_usr
    user_email = req.body.email
    user_password = req.body.passwd

    db.query(`select count(*) as t from users where email = '${user_email}';`, (err, result, rows) => {
        if (err) throw err;
        // res.render('user/thanks', { title: 'user', items:rows})
        console.log(result[0].t)
        if (result[0].t == 0) {
            db.query(`insert into users (name,email,passwd) values('${user_name}','${user_email}','${user_password}');`);
            res.redirect('/thanks');
        } else {
            res.redirect('/msg_login')
        }
    })


});
app.get('/thanks', (req, res) => {
    res.render('thanks', { data: "Thank you !!!!! for registering with us Please go for login" })
});

app.get('/msg_login', (req, res) => {
    // res.render('user/msg_login');
    res.render('user_msg', { data: "this email already exist. try with new one or go for login!" })
});

app.get('/user_dashboard', (req, res) => {
    res.render('user/user_dashboard')
})



app.get('/main_both', (req, res) => {
    res.render('admin/main_both')
})

app.get('/admin_home', (req, res) => {
    // let admin_name = ''
    db.query(`select name from admin where email = '${login_email}';`, (er, result, rows) => {
        if (er) throw er;
        admin_name = result[0].name;
        res.render('admin/Admin dashboard/admin_home', { adminName: admin_name })
    });
})


app.post('/login', (req, res) => {
    flag = 0;
    login_user_password = '';
    login_email = req.body.email;
    login_password = req.body.password;

    // checking for user log in
    user_flag = 0
    admin_flag = 0
    db.query(`select count(*) as p from users where email = '${login_email}';`, (err, results, rows) => {
            if (err) throw err;
            if (results[0].p != 0) {
                console.log(results[0].p)
                flag = 1;
                db.query(`select passwd as q from users where email = '${login_email}';`, (errs1, results1, rows) => {
                    if (errs1) throw errs1;
                    login_user_password = results1[0].q
                    if (flag === 1 && login_password === login_user_password) {
                        res.redirect('/user_dashboard')
                    } else {
                        res.send("Invalid data")
                    }
                })
            }
        })
        // chaecking for admin login
    db.query(`select count(*) as r from admin where email = '${login_email}';`, (err, results, rows) => {
        if (err) throw err;
        if (results[0].r != 0) {
            flag = 1;
            db.query(`select admin_passwd as s from admin where email = '${login_email}';`, (errs1, results1, rows) => {
                if (errs1) throw errs1;
                login_user_password = results1[0].s
                if (flag === 1 && login_password === login_user_password) {
                    res.redirect('/main_both')
                } else {
                    res.send('Invald crediationals');
                }
            })
        }
    })
})

app.get('/add_flights', (req, res) => {
    db.query(`select distinct * from airport;`, (err, data, row) => {
        if (err) throw err;
        else {
            var name = []
            for (let i = 0; i < data.length; i++) {
                name.push(data[i].airport_name);
            };
        };
        res.render('admin/Admin dashboard/add_flights', { airport_name: name });
    });
});

app.post('/add_flights', (req, res) => {
    var f_src = req.body.src;
    var f_dst = req.body.dst;
    var f_date = req.body.fdate;
    var f_time = req.body.time;
    var f_name = req.body.airname;
    var f_ecfare = req.body.ecfare;
    var f_bcfare = req.body.bcfare;
    var f_seats = req.body.seats;
    var i_query = `insert into flight (source,dest,fdate,time,fname,ECfare,BCfare,seats) values('${f_src}','${f_dst}','${f_date}','${f_time}','${f_name}','${f_ecfare}','${f_bcfare}','${f_seats}');`
    db.query(i_query, (error, results, rows) => {
        if (error) {
            throw error;
        } else {
            res.render("admin/Admin dashboard/message", { data: "Flight added successfully!!!!" });
        }
    });
});

app.get('/delete_flights', (req, res) => {
    res.render('admin/Admin dashboard/delete_flights');
});

app.post("/delete_flights", (req, res) => {
    const planeid = req.body.pid;
    db.query(`select count(fid) as t from flight where fid=${planeid};`, (err, results, rows) => {
        if (results[0].t === 0) {
            res.render('admin/Admin dashboard/message', { data: "Flight not found!!!!!!" })
        } else if (results[0].t === 1) {

            console.log("1");
            db.query(`delete from flight where fid=${planeid};`, (err, result, rows) => {
                if (err)
                    throw err;
                console.log(result);
                res.render('admin/Admin dashboard/message', { data: "flight deleted successfully!!!" })
            })
        }
    })


})

app.get('/update_flights', (req, res) => {
    res.render('admin/Admin dashboard/update_flights');
});

app.post('/update_flights', (req, res) => {
    u_query = `update flight set ECfare = ${req.body.economy_fare},BCfare = ${req.body.business_fare} where fid = ${req.body.plane_id}`
    db.query(u_query, (error, result, rows) => {
        if (error) {
            throw error;
        } else {
            console.log(result);
            res.render('admin/Admin dashboard/message', { data: "Fare updated successfully!!" });
        }
    });
});

// app.post('/', (req,res))
app.get('/show_flights', (req, res) => {
    db.query(`select * from flight;`, (error, result, rows) => {
        if (error) throw error;
        // console.log(result);
        res.render('admin/Admin dashboard/show_flights', { data: result });
    });
});

app.get('/admin_profile', (req, res) => {
    db.query(`select pic from admin where email = '${login_email}';`, (er, result, row) => {
        if (er) throw er;
        pics = result[0].pic
            // res.render('admin/Admin dashboard/adminprofile', { a: admin_name, b: pics });
        res.render('admin/Admin dashboard/admin_profile', { a: admin_name, b: pics });
    });
});

app.get('/show_users', (req, res) => {
    db.query(`select * from users;`, (errs, result, rows) => {
        if (errs) throw errs;
        res.render('admin/Admin dashboard/show_users', { data: result });
    });
});

app.get("/book_flight", (req, res) => {
    // fetch('http://api.aviationstack.com/v1/flights?access_key=ffa223967cf32633c9f828d6a55b38b0')
    //     .then(response => response.json())
    //     .then((main_data) => {
    //         for (var i = 1; i <= 100; i++) {
    //             a = main_data.data[i].departure.airport
    //             b = main_data.data[i].departure.iata
    //             c = main_data.data[i].arrival.airport
    //             d = main_data.data[i].arrival.iata
    //             db.query(`insert into airport values('${a}','${b}')`, (err, res, row) => {
    //                 if (err) throw err;
    //             });
    //             db.query(`insert into airport values('${c}','${d}')`, (errs, ress, rows) => {
    //                 if (errs) throw errs;
    //             });
    //         }
    //     });
    db.query(`select distinct(airport_name) from airport;`, (err, results, rows) => {
        if (err) throw err;
        db.query(`select distinct(airport_name) from airport;`, (errr, results1, rows) => {
            if (errr) throw errr;
            res.render('user/book_flight', { srcairport: results, dstairport: results1 })
        });
    });
});

app.post('/book_flight', (req, res) => {
    db.query(`select * from flight where fid = ${req.body.flight_id};`,(error,afdata,rows)=>{
        if(error) throw error;
        var mailContent;
        var data = afdata[0];
        var b = `Source :- ${data.source}`;
        var c = `Destination :- ${data.dest}`;
        var d = `Departure Time :- ${data.time}`;
        var e = `Departure Date :- ${data.fdate}`;
        var f = `${data.seats}`;
        var pname = `Passanger Name :- ${req.body.psg_name}`;
        var page = `Passanger Age :- ${req.body.psg_age}`;
        var pemail = `Passanger Email :- ${req.body.psg_email}`;
        var pd = `Passanger Details are :-`
        f=f-`${req.body.no_of_seat}`;
        db.query(`update flight set seats=${f} where fid=${req.body.flight_id}`,(error,data,rows)=>{
            if(error) throw error;
        })
        if(req.body.tkt_class == 0){
            var fare = data.ECfare;
            var a = `Total fare :- ${req.body.no_of_seat*fare}`
            var tclass = `Class :- Economy`
            mailContent = `Congratulation's ${req.body.psg_name} your ticket has been booked. Detail's are listed below.\n\nFlight Details are :- \n${b}\n${c}\n${tclass}\n${d}\n${e}\n${a}\n\n${pd}\n${pname}\n${page}\n${pemail}`;
            console.log(mailContent);
        }else{
            var fare = data.BCfare;
            var a = `Total fare :- ${req.body.no_of_seat*fare}`
            var tclass = `Class :- Bussiness`
            mailContent = `Congratulation's ${req.body.psg_name} your ticket has been booked. Detail's are listed below.\n\nFlight Details are :- \n${b}\n${c}\n${tclass}\n${d}\n${e}\n${a}\n\n${pd}\n${pname}\n${page}\n${pemail}`;
            console.log(mailContent);
        }
        //sending the user email of the ticket confirmation
        const transporter = `nodemailer`.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
        var to_email = req.body.psg_email;
        let mailOption = {
            from: process.env.EMAIL,
            to: to_email,
            subject: 'Booking Confirmed!!!!',
            text: mailContent
        };
        transporter.sendMail(mailOption, (error, data) => {
            if (error) {
                console.log(error.message);
            } else {
                console.log('Email sent!!!!');
            }
        });
    });
    // res.send("ticket booked");
    // res.send("ticket booked and has been sent to the mailid");
        res.render('thanks',{'data':'Mail sent to the registered mailid!!!\nThankyou you for being with us . \n Have a nice journey. '})
    
});

app.get("/check_flight", (req, res) => {
    // fetch('http://api.aviationstack.com/v1/flights?access_key=ffa223967cf32633c9f828d6a55b38b0')
    //     .then(response => response.json())
    //     .then((main_data) => {
    //         for (var i = 0; i < 100; i++) {
    //             a = main_data.data[i].departure.airport
    //             b = main_data.data[i].departure.iata
    //             c = main_data.data[i].arrival.airport
    //             d = main_data.data[i].arrival.iata
    //             db.query(`insert into airport values('${a}','${b}')`, (err, res, row) => {
    //                 if (err) throw err;
    //             });
    //             db.query(`insert into airport values('${c}','${d}')`, (errs, ress, rows) => {
    //                 if (errs) throw errs;
    //             });
    //         }
    //     });
    db.query(`select distinct airport_name from airport;`, (err, results, rows) => {
        if (err) throw err;
        db.query(`select distinct airport_name from airport;`, (errr, results1, rows) => {
            if (errr) throw errr;
            res.render('user/check_flight', { srcairport: results, dstairport: results1 })
        });
    });
});
var afdata;
app.post('/check_flight', (req, res) => {
    
    if (req.body.source != req.body.destination) {
        db.query(`select * from flight where source='${req.body.source}' and dest = '${req.body.destination}';`, (error, data, row) => {
            if (error) throw error;
            else {
                if (data.length != 0) {
                    res.render('user/available_flight', { flight: data });
                } else {
                    res.render('user/no_available_flight', { flight: 'No flight available!!!!' });
                }
            }
        });
    } else {
        res.render('src_dst_same', { msg: "Source and destination cannot be same !!!" });
    }
});

app.get("/user_dashboard", (req, res) => {
    res.render("user/user_dashboard");
});


app.get("/user_profile", (req, res) => {
    db.query(`select count(*) from users where email = '${login_email}';`, (er, result, rows) => {
        if (er)
            throw er;
        console.log(result[0]);
        user_name = result[0].name;
        res.render('user/user_profiles', { Name: user_name, Email: login_email })
    });
});

// var btn = .getElementById(101);

// btn.addEventListener('click', () => {
//     console.log("hi i am jhon");
// })
app.listen(port);