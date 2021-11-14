const express = require("express");
const cookieSession = require('cookie-session');
const {urlDatabase, users} = require('./appData');
const helperfunc = require('./helperfunc');
const bcrypt = require('bcrypt');

const { generateRandomString, emailCheck, getUserId, urlsForUser } = helperfunc(users, urlDatabase);

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
    name: 'user_id',
    keys: ['Priya2021']
  }));



//---------------- Main page ------------------

app.get("/", (req, res) => {
    res.redirect("/urls");
});



//---------------- User Registration---------------

app.get("/register", (req, res) => {
    const usrCookie = req.session.user_id;
    const usr = users[usrCookie];
    if(usr) {
        res.redirect("/urls");
    } else {
        const usr = users[usrCookie];
        const templateVars = {
        usr
    };
    res.render("registration", templateVars);
    }
});

app.post("/register" ,(req,res) => {
    const {email, password} = req.body;
    
    if (!email || !password) {
      const errMsg = {
        errTitle: "Invalid values",
        errDes: "Email and Password can not be empty, Please try to register again.",
        route: "register"
      };
      res.status(400).render("error_page",errMsg);
    } else if (emailCheck(email)) {
        const errMsg = {
        errTitle: "Invalid values",
        errDes: "Email exist, please try another valid email address to register or login with existing email.",
        route: "register"
      };
      res.status(400).render("error_page",errMsg);
    } else {
        const userId = generateRandomString();
        const hashedPass = bcrypt.hashSync(password, 10);
    
        users[userId] = {
        id: userId,
        email: email,
        password: hashedPass
      };
      
      req.session.user_id = userId;
      res.redirect('urls');
    }
});

//---------------- Login --------------------

app.get("/user_login", (req, res) => {
    const usrCookie = req.session.user_id;
    const usr = users[usrCookie];
    const templateVars = {
        usr
    };
    res.render("user_login", templateVars);
});

app.post('/user_login', (req,res) => {
    const user = req.body;
    //console.log(user);

    if (emailCheck(user.email)) {
        //console.log("returned true");
        const userID = getUserId(user.email);
        const psswd = user.password;
        const hashedPass = users[userID]['password'];
        //console.log(hashedPass);

        if(bcrypt.compareSync(psswd, hashedPass)) {
            //console.log("problem");
            const errMsg = {
                errTitle: "Invalid Credentials",
                errDes: "Invalid User or Password, please try again",
                route: "user_login"
            };
            res.render('error_page', errMsg);
        } else {
            req.session.user_id = userID;
            res.redirect('/urls');
        }
    } else {
        const errMsg = {
            errTitle: "InvalidCredentials",
            errDes: "Invalid User or Password, please try again",
            route: "user_login"
        };
        res.render('error_page', errMsg);
    }
});

// app.post("/user_login", (req, res) => {
//     const { email, password } = req.body;
//     const { error } = emailCheck(email);
//     if (!error) {
//     //   res.status(400).send(`Not an User Try again <a href ='user_login'> Login </a>`);

//     } else {
//       const user = getUserByEmail(email);
//       if (!bcrypt.compareSync(password, user.password)) {
//         res.status(400).send("Invalid Password");
//       }
//       req.session.user_id = user["id"];
//       res.redirect("/urls");
//     }
//   });

//------------------ User logout ---------------------------

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/urls');
});


//---------------- urls --------------------------

  app.post("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;

    if (urlDatabase[req.params.shortURL]) {
        urlDatabase[req.params.shortURL] = req.body.longURL;
        res.redirect('/urls');
    }
    //const userID = req.session["user_id"];
    // if (!userID) {
    //   res.status(401).send("401 Must be logged in");
    // }
    // if (userID && userID === urlDatabase[shortURL].userID) {
  
    //    urlDatabase[shortURL] = {
    //      longURL: longURL,
    //      //userID: userID
    //    };
    //    res.redirect("/urls");
    // } else {
    //   res.status(403).send("403 You are not authorized");
    // }

    
  
  })

app.get("/urls", (req, res) => {

    const usrCookie = req.session.user_id;
    console.log(usrCookie);
    const usr = users[usrCookie];
    console.log(usr,"user cookie on urls page");

    if (usr) {
       // console.log(usr.email);
        const allowURLs = urlsForUser(usrCookie);
        //console.log(allowURLs);
        const templateVars = {
            urls: allowURLs,
            usr
        };
        res.render("urls_index", templateVars);
    } else {
        res.status(403).redirect("/user_login");
    }
    // const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
    // console.log(req.cookies.username);
    // res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
    const usrCookie = req.session.user_id;
console.log("request received",usrCookie);
    if (!usrCookie) {
        const errMsg = {
            errTitle: "Access Denied",
            errDes: "Please login and try again",
            route: "user_login"
        };
        res.status(403).render("error_page", errMsg);
    } else {
        const shortURL = generateRandomString();
        const longURL = req.body['longURL'];

        urlDatabase[shortURL] = {};
        urlDatabase[shortURL]['longURL'] = longURL;
        urlDatabase[shortURL]['userID'] = usrCookie;
        console.log(urlDatabase);

        res.redirect(`/urls/${shortURL}`);
    }

});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});
  

app.listen(PORT, () => {
    console.log(`Tinyapp listening on port: ${PORT}!`);
});

app.get("/u/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    if (shortURL in urlDatabase) {
        const longURL = urlDatabase[shortURL]['longURL'];
        res.redirect(longURL);
    }
});

app.get("/urls/new", (req, res) => {
    // const username=req.cookies["username"];
    // const templateVars={username:username}
    // res.render("urls_new",templateVars);
    if (!req.session.user_id) {
        const errMsg = {
            errTitle: "Access Denied",
            errDes: "Please login and try again",
            route: "user_login"
        }
        res.status(403).render("error_page", errMsg);
    } else {
        const usrCookie = req.session.user_id;
        const usr = users[usrCookie];
        const templateVars = {
            usr
        };
        res.render("urls_new", templateVars);
    }
});

app.get("/urls/:shortURL", (req, res) => {
    const usrCookie = req.session.user_id;
    console.log(usrCookie);
    const usr = users[usrCookie];
    const shortURL = req.params.shortURL;
    
    //const allowURLs = urlsForUser(usr.email);

    if (!usrCookie) {
        console.log("2");
        const errMsg = {
            errTitle: "Access Denied",
            errDes: "Please login and try again",
            route: "user_login"
        };
        res.status(403).render("error_page", errMsg);
    } else if (shortURL in urlDatabase) {

        const allowURLs = urlsForUser(usrCookie);
        if (shortURL in allowURLs) {
            const longURL = urlDatabase[shortURL]['longURL'];
            const templateVars = {
                shortURL: req.params.shortURL,
                longURL: longURL,
                usr
            };
            res.render("urls_show", templateVars);
        } else {
            const errMsg = {
                errTitle: "Not found",
                errDes: "url not found",
                route: "urls"
            };
            res.status(403).render("error_page", errMsg);
        }
    } else {
        const errMsg = {
        errTitle: "Page Not Found",
        errDes: "Page not found, please try valid url",
        route: "urls"
    };
    res.status(404).render("error_page", errMsg);
    }

    
});

app.post('/urls/:id', (req, res) => {
    const usrCookie = req.session.user_id;
    const usr = users[usrCookie];
    const allowURLs = urlsForUser(usrCookie);
    const shortURL = req.params.id;
    const longURL = req.body.newLongURL;

    if (shortURL in allowURLs) {
        urlDatabase[shortURL]['longURL'] = longURL;
        res.redirect('/urls');
    } else {
        const errMsg = {
            errTitle: "Access Denied",
            errDes: "Please login and try again",
            route: "user_login"
        };
        res.status(403).render('error_page', errMsg);
    }
});

app.get("/u/:shortURL", (req,res) => {
    // const templateVars = {username:req.cookies["username"]};
    // const longURL = urlDatabase[req.params.shortURL];
    // res.redirect(longURL,templateVars);
    const shortURL = req.params.shortURL;
    if (shortURL in urlDatabase) {
        const longURL = urlDatabase[shortURL]['longURL'];
        res.redirect(longURL);
    } else {
        const errMsg = {
        errTitle: "Page does not exist",
        errDes: "page you are trying to access does not exist, please use a valid URL",
        route: "urls"
        };
        res.status(404).render('error_page', errMsg);
    }
});

app.post('/urls/:id/delete', (req, res) => {
    const usrCookie = req.session.user_id;
    const usr = users[usrCookie];
    const allowURLs = urlsForUser(usrCookie);
    const shortURL = req.params.id;
    
    if (!usrCookie) {
      const errMsg = {
        errTitle: "Access Denied",
        errDes: "Please login and try again",
        route: "user_login"
      };
      res.status(403).render("error_page",errMsg);
    }
  
    if (shortURL in allowURLs) {
      if (shortURL in urlDatabase) {
        delete urlDatabase[shortURL];
        res.redirect('/urls');
      }
    } else {
      const errMsg = {
        errTitle: "Access Denied",
        errDes: "Please login and try again",
        route: "user_login"
      };
      res.status(403).render('error_page', errMsg);
    }
});
// app.get("/hello", (req, res) => {
//     res.send("<html><body>Hello <b>World</b></body></html>\n");
// });
// app.get("/urls", (req, res) => {
//     //console.log(req.)
//     const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
//     console.log(req.cookies.username);
//     res.render("urls_index", templateVars);
// });


// app.post("/urls/:shortURL/delete", (req, res) => {
//     const shortURL = req.params.shortURL;
//     const longURL = req.body.longURL;
//     //const userID = req.session["user_id"];
//     // if (!userID) {
//         //   res.status(401).send("401 Must be logged in");
//         // }
//         // if (userID && userID === urlDatabase[shortURL].userID) {
//             //   delete urlDatabase[shortURL];
            
//             //   res.redirect("/urls");
//             // } else {
//                 //   res.status(403).send("403 You are not authorized");
//                 // }
                
//    delete urlDatabase[req.params.shortURL];
//                 res.redirect("/urls")
//             }); 
//              app.post("/user_login", (req, res) => {
//                             const username = req.body.username;
//                             res.cookie("username", username);
//                             // const email = req.body.email;
//                             // const password = req.body.password;
                            
//                             // if (!email || !password) {
//                                 //   res.status(400).send("400 Email and password fields cannot be empty");
//                                 // }
//                                 // if (!findUserByEmail(email, users) || !emailMatchPass(email, password, users)) {
//                                     //   res.status(403).send("403 Email or Password are incorrect");
//                                     //   //if email exits & password is correct
//                                     // } else {
//                                         //   const newId = authenticateUser(users, email, password);
//                                         //   console.log(users, email, password);
//                                         //   req.session["user_id"] = newId;
                                        
//                                         res.redirect("/urls");
//                                         // }
//                                     });
//                                     app.post("/logout", (req, res) => {
//                                         res.clearCookie("username");
//                                         res.redirect("/urls")
//                                     })
//                                     //   app.post("/register", (req, res) => {
//                                         // res.redirect("/urls")
//                                         //   })
//                                         //res.render("urls_index", templateVars);
//                                         app.get("/set", (req, res) => {
//                                             const a = 1;
//                                             res.send(`a = ${a}`);
//                                         });
                                        
//                                         app.get("/fetch", (req, res) => {
//                                             res.send(`a = ${a}`);
//                                         });
                                        
//                                         app.post("/urls", (req, res) => {
//                                             console.log(req.body);  // Log the POST request body to the console
//                                             res.send("Ok");         // Respond with 'Ok' (we will replace this)
//                                         });
                                        
//  function generateRandomString(length) {
//     var result   = ''; 
//         var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
//             var charactersLength = characters.length;     
//             for ( var i = 0; i < length; i++ ) {    
//                    result += characters.charAt(Math.floor(Math.random() *   charactersLength));  
//                   }  
//                     return result;
//   }