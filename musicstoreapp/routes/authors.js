module.exports = function (app) {
    app.get("/authors", function (req, res) {
        let authors = [{
            "name": "Miguel",
            "group": "Tekila",
            "rol" : "Cantante"
        }, {
            "name": "Carlos",
            "group": "Beatriz",
            "rol" : "Batería"
        }, {
            "name": "Diego",
            "group": "Hola",
            "rol" : "Bajista"
        }];

        let response = {
            seller: "Tienda de canciones",
            authors:authors
        };
        console.log("hola");
        res.render("authors/authors.twig", response);
    });

    app.get('/authors/add', function (req, res) {
        res.render("authors/add.twig");
    });

    app.post('/authors/add', function(req, res) {
        let response = "Autor agregado: " + (req.body.nombre ? req.body.nombre : "Parámetro name no enviado") + "<br>"
                        + " Grupo : " + (req.body.grupo ? req.body.grupo : "Parámetro group no enviado") + "<br>"
                        + " Rol: " + (req.body.rol ? req.body.rol : "Parámetro rol no enviado")
        res.send(response);
    });

    app.get('/authors*', function (req, res) {
        res.redirect('/authors');
    });
};