'use strict';

if (!$) {
    var $ = require('../lib/jquery.js');
}

function updateLayout() {
    var $outterElement = $('#workspace');
    var $container = $('#board-container');
    $container.stop();
    $container.animate({
        width: $outterElement.width(),
        height: $outterElement.height()
    }, 120);

    var $thumbnails = $('#thumbnails');
    $thumbnails.height($thumbnails.parent().height());
}

window.onresize = function() {
    updateLayout();
};

$(document).ready(function() {
    updateLayout();

    var enbx = require('../src/enbx.js');
    enbx.open('.test/test.enbx')
});

$('html').keydown(function(event) {
    // F5
    if (event.keyCode === 116) {
        $('#board').addClass('fullscreen');
        updateLayout();
    }
    // Esc
    if (event.keyCode === 27) {
        $('#board').removeClass('fullscreen');
        updateLayout();
    }
});
