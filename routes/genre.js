var util = require('util');
var Q = require('q');

exports.listtracks = function (req, res) {
    Q.spread([
            Q.ninvoke(global.myconn, 'query', 'SELECT * FROM playlists WHERE user_id=?', [req.session.user.id]),
            Q.ninvoke(global.myconn, "query", 'SELECT t1.*, COUNT(t2.id) AS stems , f.id as idfavor FROM tracks AS t1  ' +
                'LEFT JOIN tracks AS t2 ON t1.track_title=t2.parent_track_title ' +
                'LEFT JOIN favorites as f ON f.user_id=?  and f.track_id=t1.id WHERE t1.genre=? GROUP BY t1.id',[req.session.user.id, req.params.name])
            ], 
            function (playlists, tracks) {
                playlists = playlists[0];
                tracks = global.massageTracks(tracks);

                res.render('genre', {
                    playlists: playlists,

                    tracks: tracks,
                    hastracks: !!tracks,
                    tracksjson: JSON.stringify(tracks)
                });
            }).fail(function (err) {
                util.debug("Failed in promise: " + err);
            });
};


