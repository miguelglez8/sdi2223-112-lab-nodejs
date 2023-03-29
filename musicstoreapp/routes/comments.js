const {ObjectId} = require("mongodb");
module.exports = function (app, commentsRepository, songsRepository) {
    app.post("/comments/:song_id", function (req,res) {
        let id = req.params.song_id;
        let comment = {
            author: req.session.user,
            text: req.body.text,
            song_id: ObjectId(id)
        }

        commentsRepository.insertComment(comment, function (_id) {
            if (_id == null) {
                res.send("Error insert comment");
            } else {
                res.redirect("/songs/" + id);
            }
        })
    })

};