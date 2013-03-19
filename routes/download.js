var Q = require("q");
var util = require("util");
var email = require("emailjs");
var zip = require("node-native-zip");


exports.history = function (req, res) {
    Q.spread([
            Q.ninvoke(global.myconn, 'query', 'SELECT * FROM playlists WHERE user_id=?', [req.session.user.id]),
            Q.ninvoke(global.myconn, "query", 'SELECT downloads.*, tracks.track_title, playlists.name FROM downloads LEFT JOIN tracks ON downloads.track_id=tracks.id LEFT JOIN playlists ON downloads.playlist_id=playlists.id WHERE downloads.user_id=?', [req.session.user.id])
            ],
            function (playlists, history) {
                playlists = playlists[0];
                history = history[0].map(function (r) {
                    if (r.track_title) {
                        r['track_title_pretty'] = r.track_title.substr(4, r.track_title.length-4).replace(/_/g, ' ').toLowerCase();
                    }

                    return r;
                });

                res.render("downloadhistory", {
                    "playlists": playlists,
                    
                    "hashistory": history.length > 0,
                    "history": history
                });
            }, function (fail) {
                util.debug("shit: " + util.inspect(fail));
            });
    
};


exports.downloadtrack = function (req, res) {
    global.myconn.query("SELECT * FROM tracks WHERE id=?", [req.params.id], function (err, data) {
        if (data.length > 0) {
            path = require('path');
            global.myconn.query("INSERT INTO downloads (created_on, user_id, track_id) VALUES (NOW(),?,?)",
                [req.session.user.id, req.params.id], function (err, downloads) {
                    res.status(200).attachment(data[0].track_title + (req.params.format == 1 ? '.aiff' : '.mp3')).sendfile('public/audio_files/' + path.basename(data[0].track_title, "mp3") + (req.params.format == 1 ? '.aiff' : '.mp3'));
                });
        } else {
            res.redirect('/');
        }
    });
};


exports.downloadplaylist = function (req, res) {
    global.myconn.query("SELECT tracks.track_title FROM playlist_track LEFT JOIN tracks ON playlist_track.track_id=tracks.id WHERE playlist_track.playlist_id=?", [req.params.id], function (err, data) {
        if (data.length > 0) {
            global.myconn.query("INSERT INTO downloads (created_on, user_id, playlist_id) VALUES (NOW(),?,?)",
                [req.session.user.id, req.params.id], function (err, downloads) {
                    var archive = new zip();

                    var format = req.params.format == 1 ? ".aiff" : ".mp3";

                    var files = data.map(function (e) {
                        return {
                            "name": e.track_title + format,
                            "path": "public/audio_files/" + e.track_title + format
                        };
                    });

                    archive.addFiles(files, function (err) {
                        var zipbuffer = archive.toBuffer();

                        res.attachment("Archive.zip").send(200, zipbuffer);
                    });
                });
        } else {
            res.redirect('/');
        }
    });

};



exports.requestplaylist = function(req, res) {
    Q.spread([
            Q.ninvoke(global.myconn, 'query', 'SELECT * FROM playlists WHERE user_id=?', [req.session.user.id]),
            Q.ninvoke(global.myconn, "query", 'SELECT * FROM playlists WHERE id=?', [req.body.id])
            ],
            function (playlists, playlist) {
                playlists = playlists[0];
                playlist = playlist[0];

                res.render("requestplaylist", {
                    "playlists": playlists,

                    "title": playlist[0].name,
                    "id": playlist[0].id,
                    "target": req.session.user.email
                });
            });
};


exports.requesttrack = function(req, res) {
    Q.spread([
            Q.ninvoke(global.myconn, 'query', 'SELECT * FROM playlists WHERE user_id=?', [req.session.user.id]),
            Q.ninvoke(global.myconn, "query", 'SELECT * FROM tracks WHERE id=?', [req.params.id])
            ],
            function (playlists, track) {
                playlists = playlists[0];
                track = global.massageTracks(track);

                res.render("requestfile", {
                    "playlists": playlists,

                    "title": track[0].track_title_pretty,
                    "id": track[0].id,
                    "target": req.session.user.email
                });
            });
};


exports.sendtrackinfo = function(req, res) {
    var body = "Your MP3 file can be downloaded from: http://ec2-23-21-94-225.compute-1.amazonaws.com/download/transfer/track/" + req.body.trackid + "/" + req.body.format;

    var server  = email.server.connect({
        host:    "127.0.0.1"
    });

    server.send({
        text:    body, 
        from:    "Music Service <music@ec2-23-21-94-225.compute-1.amazonaws.com>", 
        to:      req.body.target,
        subject: "Your music track download"
    }, function(err, message) {
        res.redirect('/download/track/' + req.body.trackid);
    });
};


exports.sendplaylistinfo = function(req, res) {
    var body = "Your playlist archive can be downloaded from: http://ec2-23-21-94-225.compute-1.amazonaws.com/download/transfer/playlist/" + req.body.playlistid + "/" + req.body.format;

    var server  = email.server.connect({
        host:    "127.0.0.1"
    });

    server.send({
        text:    body, 
        from:    "Music Service <music@ec2-23-21-94-225.compute-1.amazonaws.com>", 
        to:      req.body.target,
        subject: "Your playlist archive download"
    }, function(err, message) {
        res.redirect('/download/playlist/' + req.body.playlistid);
    });
};





