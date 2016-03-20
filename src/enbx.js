var fs = require('fs'),
    xml2js = require('xml2js'),
    unzip = require('unzip'),
    Snap = require('snapsvg'),
    path = require('path');

var model = require('../src/model'),
    view = require('../src/view');

var repoDir = '.test';
var unzipDir = '.test/test.enbx.unzip/';
fs.del
function rel(p) {
    return path.resolve(unzipDir + p);
}

function open(file) {
    unzipDir = '.test/' + Date.now().toString() + '/';
    fs.mkdirSync(unzipDir);
    $('li.slide-thumbnail').remove();
    EnbxDocument.fromFile(file, doc => {
        view.render(doc.slides[0], doc.refs);
        view.renderThumbnails(doc.slides, doc.refs);
    });
}

function parseReference(func) {
    fs.readFile('.test/test.enbx.unzip/Reference.xml', function(err, data) {
        xml2js.parseString(data, function(err, result) {
            var reference = result.Reference;
            if (typeof reference.Relationships != "undefined") {
                var relationships = reference.Relationships[0].Relationship;
                var refs = [];
                for (var i = 0; i < relationships.length; i++) {
                    var r = relationships[i];
                    refs[r.Id[0]] = r.Target[0];
                }
            }
            if (typeof func != "undefined") {
                var resolver = {
                    resolve: s => {
                        return rel(refs[s.substr(5)])
                    }
                }
                func(resolver);
            }
        });
    });

}

function EnbxDocument() {
}
EnbxDocument.fromFile = function(enbxFile, func) {
    fs.createReadStream(enbxFile).pipe(unzip.Extract({ path: unzipDir }).on('close', function() {
        var slideDir = rel('slides');
        fs.readdir(slideDir, function(err, slideFiles) {
            if (err) {
                throw err;
            }

            var doc = new EnbxDocument();
            doc.slides = [];

            slideFiles = slideFiles.map(f => path.join(slideDir, f))
                .filter(f => fs.statSync(f).isFile());
            var boardFile = rel('board.xml');
            var refFile = rel('reference.xml');
            // console.log(slideFiles);
            // console.log(slideFiles.length);
            var checkRenturn = () => {
                if (doc.board && doc.refs && doc.slides.length == slideFiles.length
                    && doc.slides.every(x => x)) {
                    func(doc);
                }
            };
            readXmlFile(refFile, model => {
                doc.refs = model;
                doc.refs.resolve = s => {
                    return rel(model[s.substr(5)]);
                }
                checkRenturn();
            });
            readXmlFile(boardFile, model => {
                doc.board = model;
                checkRenturn();
            });
            for (var i = 0; i < slideFiles.length; i++) {
                let n = i;
                readXmlFile(slideFiles[i], model => {
                    doc.slides[n] = model;
                    checkRenturn();
                });
            }
        });
    }));
}
function readXmlFile(file, func) {
    fs.readFile(file, function(err, data) {
        xml2js.parseString(data, function(err, result) {
            if (err) {
                throw err;
            }
            var parser = new DOMParser();
            var xmlDom = parser.parseFromString(data, 'text/xml');
            var m = model.createModel(xmlDom.documentElement);
            func(m);
        });
    });
}

function listEnbxFiles() {
    fs.readdir(repoDir, function(err, files) {
        if (err) {
            throw err;
        }
        files = files.map(f => path.join(repoDir, f).toLowerCase())
            .filter(f => fs.statSync(f).isFile() && f.substr(-5) === '.enbx');
        for (let file of files) {
            var name = file.replace(/^.*[\\\/]/, '');
            name = name.substr(0, name.length - 5);
            let $li = $('<li></li>').text(name);
            $('#file-list-panel ul').append($li);
            $li.click(() => {
                open(file);
                $('#file-list-panel').hide();
            });
        }
    });
}

exports.open = open;
exports.listEnbxFiles = listEnbxFiles;