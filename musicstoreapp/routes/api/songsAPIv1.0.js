const {ObjectId} = require("mongodb");
const {validationResult} = require('express-validator');
const {songsValidatorInsert, songsValidatorUpdate} = require('./songsValidator');
module.exports = function (app, songsRepository, usersRepository) {
    app.post('/api/v1.0/songs', songsValidatorInsert, function (req, res) {
    try {
        const errors = validationResult(req);
        if (! errors.isEmpty()) {
            res.status(422)
            res.json({
                errors: errors.array()
            })
        } else {
            let song = {
                title: req.body.title,
                kind: req.body.kind,
                price: req.body.price,
                author: res.user
            }
            songsRepository.insertSong(song, function (songId) {
                if (songId === null) {
                    res.status(409);
                    res.json({error: "No se ha podido crear la canción. El recurso ya existe."});
                } else {
                    res.status(201);
                    res.json({
                        message: "Canción añadida correctamente.",
                        _id: songId
                    })
                }
            });
        }
    } catch (e) {
        res.status(500);
        res.json({error: "Se ha producido un error al intentar crear la canción: " + e})
    }
});

    app.put('/api/v1.0/songs/:id', songsValidatorUpdate, function (req, res) {
        try {
            let songId = ObjectId(req.params.id);
            let filter = {_id: songId};
            //Si la _id NO no existe, no crea un nuevo documento.
            const options = {upsert: false};
            let song = {
                author: res.user
            }
            if (typeof req.body.title !== "undefined" && req.body.title !== null)
                song.title = req.body.title;
            if (typeof req.body.kind !== "undefined" && req.body.kind !== null)
                song.kind = req.body.kind;
            if (typeof req.body.price !== "undefined" && req.body.price !== null)
                song.price = req.body.price;

            const errors = validationResult(req);
            if (! errors.isEmpty()) {
                res.status(422)
                res.json({
                    errors: errors.array()
                })
            } else {
                owner(res.user,songId,function (isModifi) {
                    if(isModifi){
                        validateUpdateSong(song, function (error) {
                            if (error != null) {
                                res.status(422);
                                res.json({error: error})
                            } else {
                                songsRepository.updateSong(song, filter, options).then(result => {
                                    if (result === null) {
                                        res.status(404);
                                        res.json({error: "ID inválido o no existe, no se ha actualizado la canción."});
                                    }
                                    //La _id No existe o los datos enviados no difieren de los ya almacenados.
                                    else if (result.modifiedCount == 0) {
                                        res.status(409);
                                        res.json({error: "No se ha modificado ninguna canción."});
                                    } else {
                                        res.status(200);
                                        res.json({
                                            message: "Canción modificada correctamente.",
                                            result: result
                                        })
                                    }
                                })
                            }
                        })
                    }
                    else{
                        res.status(400);
                        res.json({
                            error: "No puedes modificar la canción, no eres el dueño de la canción."
                        });
                    }
                });
            }
        } catch (e) {
            res.status(500);
            res.json({error: "Se ha producido un error al intentar modificar la canción: "+ e})
        }
    });


    app.get("/api/v1.0/songs", function (req, res) {
        let filter = {};
        let options = {};
        songsRepository.getSongs(filter, options).then(songs => {
            res.status(200);
            res.send({songs: songs})
        }).catch(error => {
            res.status(500);
            res.json({ error: "Se ha producido un error al recuperar las canciones." })
        });
    });

    app.get("/api/v1.0/songs/:id", function (req, res) {
        try {
            let songId = ObjectId(req.params.id)
            let filter = {_id: songId};
            let options = {};
            songsRepository.findSong(filter, options).then(song => {
                if (song === null) {
                    res.status(404);
                    res.json({error: "ID inválido o no existe"})
                } else {
                    res.status(200);
                    res.json({song: song})
                }
            }).catch(error => {
                res.status(500);
                res.json({error: "Se ha producido un error a recuperar la canción."})
            });
        } catch (e) {
            res.status(500);
            res.json({error: "Se ha producido un error :" + e})
        }
    });

    app.delete('/api/v1.0/songs/:id', function (req, res) {
        try {
            let songId = ObjectId(req.params.id)
            let filter = {_id: songId}
            owner(res.user,songId,function (isOwner) {
                if (isOwner) {
                    songsRepository.deleteSong(filter, {}).then(result => {
                        if (result === null || result.deletedCount === 0) {
                            res.status(404);
                            res.json({error: "ID inválido o no existe, no se ha borrado el registro."});
                        }
                    })
                } else {
                    res.status(400);
                    res.json({
                        error: "No puedes eliminar la canción, no eres el dueño."
                    });
                }
            })
        } catch (e) {
            res.status(500);
            res.json({error: "Se ha producido un error, revise que el ID sea válido."})
        }
    });

    /*
        app.post('/api/v1.0/songs', function (req, res) {
        try {
            let song = {
                title: req.body.title,
                kind: req.body.kind,
                price: req.body.price,
                author: res.user
            }
            validateSong(song, function (error) {
                if (error != null) {
                    res.status(422);
                    res.json({error: error})
                } else {
                    // Validar aquí: título, género, precio y autor.
                    songsRepository.insertSong(song, function (songId) {
                        if (songId === null) {
                            res.status(409);
                            res.json({error: "No se ha podido crear la canción. El recurso ya existe."});
                        } else {
                            res.status(201);
                            res.json({
                                message: "Canción añadida correctamente.",
                                _id: songId
                            })
                        }
                    });
                }
            })
        } catch (e) {
            res.status(500);
            res.json({error: "Se ha producido un error al intentar crear la canción: " + e})
        }
    });
*/
    /*
    app.put('/api/v1.0/songs/:id', function (req, res) {
        try {
            let songId = ObjectId(req.params.id);
            let filter = {_id: songId};
            //Si la _id NO no existe, no crea un nuevo documento.
            const options = {upsert: false};
            let song = {
                author: res.user
            }
            if (typeof req.body.title !== "undefined" && req.body.title !== null)
                song.title = req.body.title;
            if (typeof req.body.kind !== "undefined" && req.body.kind !== null)
                song.kind = req.body.kind;
            if (typeof req.body.price !== "undefined" && req.body.price !== null)
                song.price = req.body.price;

            owner(res.user,songId,function (isModifi) {
                if(isModifi){
                    validateUpdateSong(song, function (error) {
                        if (error != null) {
                            res.status(422);
                            res.json({error: error})
                        } else {
                            songsRepository.updateSong(song, filter, options).then(result => {
                                if (result === null) {
                                    res.status(404);
                                    res.json({error: "ID inválido o no existe, no se ha actualizado la canción."});
                                }
                                //La _id No existe o los datos enviados no difieren de los ya almacenados.
                                else if (result.modifiedCount == 0) {
                                    res.status(409);
                                    res.json({error: "No se ha modificado ninguna canción."});
                                } else {
                                    res.status(200);
                                    res.json({
                                        message: "Canción modificada correctamente.",
                                        result: result
                                    })
                                }
                         })
                    }
                    })
                }
                else{
                    res.status(400);
                    res.json({
                        error: "No puedes modificar la canción, no eres el dueño de la canción."
                    });
                }
            });
        } catch (e) {
            res.status(500);
            res.json({error: "Se ha producido un error al intentar modificar la canción: "+ e})
        }
    });
*/
    app.post('/api/v1.0/users/login', function (req, res) {
        try {
            let securePassword = app.get("crypto").createHmac("sha256", app.get('clave'))
                .update(req.body.password).digest('hex');
            let filter = {
                email: req.body.email,
                password: securePassword
            }
            let options = {}
            usersRepository.findUser(filter, options).then(user => {
                if (user==null) {
                    res.status(401); // Unauthorized
                    res.json({
                        message: "Usuario no autorizado",
                        authenticated: false
                    })
                } else {
                    let token = app.get('jwt').sign(
                        {user: user.email, time: Date.now()/1000},
                        "secreto");
                    res.status(200);
                    res.json({
                        message: "Usuario autorizado",
                        authenticated: true,
                        token: token
                    })
                }
            }).catch(error => {
                res.status(401);
                res.json({
                    message: "Se ha producido un error al verificar credenciales",
                    authenticated: false
                })
            })
        } catch (e) {
            res.status(500);
            res.json({
                message: "Se ha producido un error al verificar credenciales",
                authenticated: false
            })
        }
    });

    function validateUpdateSong(song, callback) {
        let errors = new Array();
        if (song.title != null && typeof song.title !== 'undefined' && song.title.trim().length == 0) {
            errors.push({
                "value": song.title,
                "msg": "El título de la canción es inválido, escríbelo de nuevo",
                "param": "title",
                "location": "body"
            })
        }
        if (song.kind !=  null && typeof song.kind !== 'undefined' &&  song.kind.trim().length == 0) {
            errors.push({
                "value": song.kind,
                "msg": "El género de la canción es inválido, escríbelo de nuevo",
                "param": "kind",
                "location": "body"
            })
        }
        if (song.price != null && typeof song.price !== 'undefined' && (song.price.trim().length==0 || song.price < 0)) {
            errors.push({
                "value": song.price,
                "msg": "El precio de la canción es inválido (negativo), escríbelo de nuevo",
                "param": "price",
                "location": "body"
            })
        }
        if (errors.length > 0) {
            callback(errors)
        } else {
            callback(null)
        }
    }
    function validateSong(song, callback) {
        let errors = new Array();
        if (song.title == null || typeof song.title === 'undefined' || song.title.trim().length == 0) {
            errors.push({
                "value": song.title,
                "msg": "El título de la canción es inválido, escríbelo de nuevo",
                "param": "title",
                "location": "body"
            })
        }
        if (song.kind == null || typeof song.kind === 'undefined' || song.kind.trim().length == 0) {
            errors.push({
                "value": song.kind,
                "msg": "El género de la canción es inválido, escríbelo de nuevo",
                "param": "kind",
                "location": "body"
            })
        }
        if (song.price == null || typeof song.price === 'undefined' || song.price.trim().length==0 || song.price < 0) {
            errors.push({
                "value": song.price,
                "msg": "El precio de la canción es inválido (negativo), escríbelo de nuevo",
                "param": "price",
                "location": "body"
            })
        }
        if (errors.length > 0) {
            callback(errors)
        } else {
            callback(null)
        }
    }

    function owner(user, songId, callback) {
        let filter = { $and: [{"_id": songId},{"author": user} ] };
        return songsRepository.getSongs(filter,{}).then(songs =>{
            if(songs.length === 1) {
                callback(true);
            }else {
                callback(false);
            }
        })
    }

}