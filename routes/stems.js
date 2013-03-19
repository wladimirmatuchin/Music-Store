var util = require('util');

exports.stems = function (req, res) {
    global.myconn.query("SELECT * FROM playlists WHERE user_id=?", [req.session.user.id], function (err, playlists) {
        global.myconn.query('SELECT * FROM tracks WHERE id=?', [req.params.id], function (err, root) {
            var pp = root[0].track_title;
            pp = pp.substr(4, pp.length-8).replace(/_/g, ' ').toLowerCase();

            global.myconn.query('SELECT t2.*, 0 AS stems ' +
                'FROM tracks AS t1 LEFT JOIN tracks AS t2 ON ( ' +
                ' t1.track_title=t2.parent_track_title OR ' +
                ' (t1.parent_track_title<>"" and t1.parent_track_title<>t2.track_title) OR ' +
                ' t1.track_title=t2.track_title ) ' +

                'WHERE t1.id=?', [req.session.user.id, req.params.id], function (err, tracks) {
                tracks = global.massageTracks([tracks]);

                res.render("stems", {
                    "playlists": playlists,

                    "parent": pp,

                    tracks: tracks,
                    hastracks: !!tracks,
                    tracksjson: JSON.stringify(tracks)
                });
            });
        });
    });
}
