var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var path = require('path');
var fs = require('fs');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var siofu = require("socketio-file-upload");
var mysql = require('mysql');
var md5 = require('md5');
var uploader = new siofu();
var start = new Date();

var options =
{
    port: 3306,
    database: 'schoolyeah',
    host: "localhost",
    user: "root",
    password: ""
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session(
{
    key: 'user_sid',
    secret: 'yass.490',
    resave: true,
    saveUninitialized: true,
    cookie:{ expires: 600000 }
}));
app.use(siofu.router);

var bdd = mysql.createConnection(options);

bdd.connect(function(err)
{
    if (err) throw err;
    console.log("Connected to database !");
});

app.get('/', function(req, res)
{
    res.statusCode = 200;
    res.contentType("text/html");
    res.sendFile(path.join(__dirname + '/index.html'));

    io.sockets.on('connection', function(socket)
    {
        socket.on('city', function(data)
        {
            data = "%" + data + "%";
            var requete = "SELECT City FROM etablissement WHERE City LIKE " + mysql.escape(data);

            bdd.query(requete, function(err, result)
            {
                if(result.length > 0)
                {
                    cities = [];

                    for(var i = 0; i < result.length; i++)
                    {
                        if(!cities.includes(result[i].City))
                        {
                            cities.push(result[i].City);
                        }
                    }

                    socket.emit('city', cities);
                }
            });
        });
        socket.on('etablissement', function(data)
        {
            var city = data.split(';')[1];
            var name = data.split(';')[0];
            name = "%" + name + "%";
            city = "%" + city + "%";
            var requete = "SELECT Name, Type FROM etablissement WHERE Name LIKE " + mysql.escape(name) + " AND City LIKE " + mysql.escape(city);

            bdd.query(requete, function(err, result)
            {
                if(result.length > 0)
                {
                    socket.emit('etablissement', result);
                }
            });
        });
    });
});

app.get('/register/:ville/:etablissement/:classe/', function(req, res)
{
    var params = req.params;

    res.statusCode = 200;
    res.contentType("text/html");
    res.sendFile(path.join(__dirname + '/register.html'));

    io.sockets.on('connection', function (socket)
    {
        socket.on('login', function(data)
        {
            var id = data.id;
            var password = data.password;
            var requette = "";

            var error = false;

            if(id == "" || password == "")
            {
                socket.emit('login', "Veuillez remplir tout les champs !");
                error = true;
            }
            else if(!id.includes("@") && !id.includes("."))
            {
                socket.emit('login', "Votre nom d'utilisateur n'est pas valide !");
                error = true;
            }
            else if(id.includes(".") && !id.includes("@"))
            {
                var name = id.split('.')[0];
                var prenom = id.split('.')[1];
                requette = "SELECT * FROM users WHERE FirstName = " + mysql.escape(name) + " AND LastName = " + mysql.escape(prenom) + " AND Password = " + mysql.escape(password);
            }
            else if(id.includes("@") && id.includes("."))
            {
                requette = "SELECT * FROM users WHERE Email = " + mysql.escape(id) + " AND Password = " + mysql.escape(password);
            }

            if(!error)
            {
                bdd.query(requette, function(err, result)
                {
                    if(result.length > 0)
                    {
                        if(result[0].Activated == 1)
                        {
                            socket.emit('login', "ok");
                            req.session.userID = result[0].ID;
                            console.log('ID de l\'utilisateur : ' + req.session.userID);
                            req.session.save();
                        }
                        else
                        {
                            socket.emit('login', "Veuillez activer votre compte pour vous connecter.");
                        }
                    }
                    else
                    {
                        socket.emit('login', "Nom d'utilisateur ou mot de passe incorrect !");
                    }
                });
            }
        });

        socket.on('register', function(data)
        {
            var name = data.name;
            var prenom = data.prenom;
            var email = data.email;
            var password = data.password;
            var city = decodeURIComponent(data.city);
            var etablissement = decodeURIComponent(data.etablissement);
            var classe= decodeURIComponent(data.classe);

            let randomNumber = Math.random().toString(36).substring(7);

            if(name == "" || prenom == "" || password == "")
            {
                socket.emit('register', 'Veuillez remplir tout les champs pour compléter votre inscription.');
            }
            else if(!email.includes("@") || !email.includes(".") || email.split("@")[0] == "" || email.split("@")[1].split(".")[0] == "" || email.split("@")[1].split(".")[1] == "" || email.includes(" "))
            {
                socket.emit('register', 'Veuillez remplir votre adresse email correctement.');
            }
            else
            {
                var select = "SELECT * FROM users WHERE Email = " + mysql.escape(email) + " OR (FirstName=" + mysql.escape(name) + " AND LastName = " + mysql.escape(prenom) + " AND Etablissement = " + mysql.escape(etablissement) + " AND Classe = " + mysql.escape(classe) + ")";
                bdd.query(select, function(err, result)
                {
                    if (err) throw err;
                    if(result.length > 0)
                    {
                        socket.emit("register", "Vous existez déjà dans notre base de données.");
                        console.log("Vous existez déjà dans notre base de données.");
                    }
                    else
                    {
                        var user = 
                        {
                            FirstName: name,
                            LastName: prenom,
                            Email: email,
                            Password: password,
                            City: city,
                            Etablissement: etablissement,
                            Classe: classe,
                            Photo: "",
                            Biographie: "",
                            ActivationCode: md5(randomNumber),
                            Activated: 0
                        };

                        var insert = "INSERT INTO users SET ?";
                        bdd.query(insert, user, function (err, result)
                        {
                            if (err) throw err;
                            console.log("User inserted with success");
                            socket.emit('register', "Vous êtes désormais inscrit ! Un mail contenant un code d'activation vous a été envoyé.")
                        });
                    }
                });
            }
        });
    });
});

app.get("/dashboard", function(req, res)
{
    res.sendFile(__dirname + path.join("/dashboard.html"));
    console.log("User ID : " + req.session.userID);

    io.sockets.on('connection', function (socket)
    {
        console.log("Socket connected !");
        socket.on('search', function(data)
        {
            data = '%' + data + '%';
            var requete =   "SELECT users.ID, users.FirstName, users.LastName, Users.Photo, Etablissement.Type, Etablissement.Name, Etablissement.City FROM users INNER JOIN Etablissement ON users.Etablissement = Etablissement.ID WHERE \
                            (users.FirstName LIKE " + mysql.escape(data) + " OR users.LastName LIKE " + mysql.escape(data) + " \
                            OR (users.FirstName + ' ' + users.LastName LIKE " + mysql.escape(data) + ") \
                            OR (users.LastName + ' ' + users.FirstName LIKE " + mysql.escape(data) + "))";

            bdd.query(requete, function(err, result)
            {
                if(err)
                {
                    console.log(err);
                }

                if(result.length > 0)
                {
                    socket.emit('search-result', result);
                }
                else
                {
                    socket.emit('search-result', "-1");
                }
            });
        });
    });
});

app.get('/chat', function(req, res)
{
    res.statusCode = 200;
    res.contentType("text/html");
    res.sendFile(path.join(__dirname + '/chat.html'));

    io.sockets.on('connection', function(socket)
    {
        // LOAD CONVERSATION LIST
        var requete = "SELECT ID, Participants, Name, Message FROM conversation WHERE Participants REGEXP ? OR Participants REGEXP ? ORDER BY Date DESC";
        bdd.query(requete, ['(^' + req.session.userID + ')', '(' + req.session.userID + '$)'], function(err, result)
        {
            if(err) throw err;

            var listID = [];
            var lastMessage = [];
            var listNewMessage = [];

            result.forEach(function(item)
            {
                var splitted = item.Participants.split(';');

                var lastMessageID = item.Message.split(';')[item.Message.split(';').length - 1];
                var requetteLastMessage = "SELECT Message, Sender, Type, Seen FROM message WHERE ID = ?";

                bdd.query(requetteLastMessage, [lastMessageID], function(err, resultante)
                {
                    if(err) throw err;

                    if(resultante.length > 0)
                    {
                        if(resultante[0].Sender != req.session.userID && resultante[0].Seen == 0)                  //If the last message is not sent by the user
                        {
                            listNewMessage.push(true);
                        }
                        else
                        {
                            listNewMessage.push(false);
                        }

                        if(resultante[0].Type == "message")
                        {
                            lastMessage.push(resultante[0].Message);
                        }
                        else
                        {
                            lastMessage.push(resultante[0].Type);
                        }
                    }
                });

                if(splitted.length == 2)                            //If the discussion is not a group and there are only 2 participants
                {
                    if(splitted[0] == req.session.userID)
                    {
                        listID.push(splitted[1]);
                    }
                    else
                    {
                        listID.push(splitted[0]);
                    }
                }
                else if(splitted.length > 2)                        //If the disucssion is a group
                {

                }
            });

            console.log("Discussion of User : " + listID);

            listID.forEach(function(item, index)
            {
                var requete = "SELECT FirstName, Gender, Photo FROM users WHERE ID = ?";
                bdd.query(requete, [item], function(err, result)
                {
                    if(err) throw err;

                    var discussion = new Object();
                    discussion.uid = item;
                    discussion.Name = result[0].FirstName;
                    discussion.Gender = result[0].Gender;
                    discussion.Photo = result[0].Photo;
                    discussion.LastMessage = lastMessage[index];
                    discussion.IsNew = listNewMessage[index];

                    socket.emit('load-conversation', discussion);
                });
            });
        });

        socket.on('message', function(data)
        {
            var id = data.split(';')[0];
            var message = data.substring(data.indexOf(';') + 1, data.length);

            var d = new Date();
            var hour = d.toLocaleTimeString();
            var day = d.toLocaleDateString().replace('/', '-').replace('/', '-');
            var date = day + " " + hour;

            console.log("id : " + id + " message : " + message + " date : " + date);

            var array = 
            {
                Sender: req.session.userID,
                Type: 'message',
                Message: message,
                Date: date,
                Seen: 0
            };

            var insert = "INSERT INTO message SET ?";
            var insertID = 0;

            bdd.query(insert, array, function (err, result)
            {
                if (err) throw err;
                console.log("Message sent");
                insertID = result.insertId;
                socket.emit('chat', "1");
            });

            var like1 = '%' + req.session.userID + ";" + id + '%';
            var like2 = '%' + id + ";" + req.session.userID + '%';
            var select = "SELECT ID, Message FROM conversation WHERE Participants LIKE ? OR Participants LIKE ?"; 
 
            bdd.query(select, [like1, like2], function(error, result, fields)
            {
                if (error) throw error;

                if(result.length > 0)
                {
                    var arrayUpdate = 
                    {
                        Message: result[0].Message + ';' + insertID,
                        Date: date
                    };

                    var update = "UPDATE conversation SET ? WHERE ID = " + result[0].ID;

                    bdd.query(update, arrayUpdate, function (err, result)
                    {
                        if (err) throw err;
                        console.log("conversation updated !");
                    });
                }
                else
                {
                    var param = 
                    {
                        Participants: req.session.userID + ';' + id,
                        Message: insertID,
                        Date: date
                    };

                    var insert = "INSERT INTO conversation SET ?";

                    bdd.query(insert, param, function (err, result)
                    {
                        if (err) throw err;
                        console.log("Conversation created !");
                    });
                }
            });
        });

        socket.on('load-message', function(data)
        {
            var userID = req.session.userID;
            var id = data;

            if(!fs.existsSync("conversation/" + userID + ";" + id))
            {
                fs.mkdirSync("conversation/" + userID + ";" + id);
            }

            uploader = new siofu();
            uploader.dir = "conversation/" + userID + ";" + id;
            uploader.listen(socket);

            uploader.on("saved", function(event)
            {
                console.log("saved");
                var ext = event.file.name.substr(event.file.name.lastIndexOf('.') + 1, event.file.name.length).toLowerCase();
                var id = data.split(';')[0];
                var message = data.substring(data.indexOf(';') + 1, data.length);

                var d = new Date();
                var hour = d.toLocaleTimeString();
                var day = d.toLocaleDateString().replace('/', '-').replace('/', '-');
                var date = day + " " + hour;

                var array = 
                {
                    Sender: req.session.userID,
                    Type: 'message',
                    Message: "conversation/" + userID + ";" + id + "/" + event.file.name,
                    Date: date,
                    Seen: 0
                };

                if(ext == "png" || ext == "jpg" || ext == "jpeg" || ext == "bmp" || ext == "gif")
                {
                    array.Type = "photo";
                }
                else if(ext == "mp4" || ext == "avi" || ext == "mkv")
                {
                    array.Type = "video";
                }
                else if(ext == "rar" || ext == "zip")
                {
                    array.Type = "compressed";
                }
                else
                {
                    console.log("Error on file extension");
                    process.exit(1);
                }

                var like1 = '%' + req.session.userID + ";" + id + '%';
                var like2 = '%' + id + ";" + req.session.userID + '%';
                var select = "SELECT ID, Message FROM conversation WHERE Participants LIKE ? OR Participants LIKE ?";

                bdd.query(select, [like1, like2], function(error, result, fields)
                {
                    if (error) throw error;

                    if(result.length > 0)
                    {
                        var insert = "INSERT INTO message SET ?";
                        var insertID = 0;

                        bdd.query(insert, array, function (err, result2)
                        {
                            if (err) throw err;
                            insertID = result2.insertId;
                            socket.emit('chat', "1");

                            var arrayUpdate = 
                            {
                                Message: result[0].Message + ';' + insertID,
                                Date: date
                            };

                            console.log("Message sent with ID : " + insertID);

                            var update = "UPDATE conversation SET ? WHERE ID = " + result[0].ID;

                            bdd.query(update, arrayUpdate, function (err, result)
                            {
                                if (err) throw err;
                                console.log("conversation updated !");
                            });
                        });
                    }
                });
                
                console.log(event.file.name + " from " + req.session.userID + " to " + event.file.meta.uid);
                socket.emit("image-sent", "1");
            });

            uploader.on("error", function(event)
            {
                console.log("Error from uploader", event);
            });

            //load-message

            var like1 = '%' + req.session.userID + ";" + id + '%';
            var like2 = '%' + id + ";" + req.session.userID + '%';
            var requete = "SELECT Message FROM conversation WHERE Participants LIKE ? OR Participants Like ?";

            console.log(requete.replace("?", like1).replace("?", like2));

            bdd.query(requete, [like1, like2], function(err, result)
            {
                if(result.length > 0)
                {
                    var listIDMessage = result[0].Message;
                    var messages = listIDMessage.split(';');
                    var output = [];

                    messages.forEach(function(item, i)
                    {
                        if(i >= messages.length - 20)
                        {
                            var selectMessage = "SELECT ID, Sender, Message, Type, Date FROM message WHERE ID=?";
                            bdd.query(selectMessage, [item], function(err, result3)
                            {
                                if(result3.length > 0)
                                {
                                    if(err) throw err;

                                    if(result3[0].Sender == req.session.userID)
                                    {
                                       result3[0].Sender = 0;
                                    }

                                    if(result3[0].Type == "message")                                //If message is a simple message
                                    {
                                        delete result3.Type;
                                        socket.emit('load-message', JSON.stringify(result3[0]));
                                    }
                                    else if(result3[0].Type == "photo")                             //If message is a photo
                                    {
                                        delete result3[0].Type;

                                        var data = fs.readFileSync(result3[0].Message);

                                        var buffer = new Buffer(data).toString('base64');

                                        result3[0].Message = "data:image/jpeg;base64," + buffer;

                                        socket.emit('load-image', JSON.stringify(result3[0]));
                                    }
                                    else if(result3[0].Type == "video")                             //If message is a video
                                    {
                                        var urlArray = result3[0].Message.split("/");
                                        var url = urlArray.slice(0, -1).join('/');
                                        app.use(express.static(url));

                                        var videoArray = 
                                        {
                                            Video: urlArray[urlArray.length - 1],
                                            Sender: result3[0].Sender
                                        };

                                        socket.emit('load-video', JSON.stringify(videoArray));
                                    }
                                    else if(result3[0].Type == "compressed")                             //If message is a video
                                    {
                                        var urlArray = result3[0].Message.split("/");
                                        var url = urlArray.slice(0, -1).join('/');
                                        app.use(express.static(url));

                                        var videoArray = 
                                        {
                                            Video: urlArray[urlArray.length - 1],
                                            Sender: result3[0].Sender
                                        };

                                        socket.emit('load-compressed', JSON.stringify(videoArray));
                                    }
                                }
                            });

                            var seeAllMessageQuery = "UPDATE message SET Seen=1 WHERE ID = ? AND Seen=0 AND Sender = ?";
                            bdd.query(seeAllMessageQuery, [item, id], function(err, result)
                            {
                                if(err) throw err;
                            });

                            if(i == messages.length - 1)
                            {
                                socket.emit('load-message', "success");
                                console.log("socket.emit('load-message', 'success');");
                            }
                        }
                    });
                }
                else
                {
                    socket.emit("load-message", "-1");
                }
            });
        });

        socket.on('videocall', function(data)
        {
            var id = data.ID;
            var myID = req.session.userID;

            console.log('id :' + id);
        });

        socket.on('vocalcall', function(data)
        {
            
        });
    });
});

app.get("/chat/:messageID", function(req, res)
{
    
});

app.get("/profile/:id", function(req, res)
{
    res.sendFile(__dirname + "/dashboard.html");
});

app.use(express.static('public'));

server.listen(8080);