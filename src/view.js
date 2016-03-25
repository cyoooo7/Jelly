'use strict';

(function() {
  $(document).ready(function() {
    updateLayout();

    $('#file-list-button').click(() => {
      $('#file-list-panel').show();
    });
    $('#content').click(() => {
      $('#file-list-panel').hide();
    });
    app.dispatch({ type: '~ready' });


    $('html').keydown(function(event) {
      // F5
      if (event.keyCode === 116) {
        app.dispatch({ type: '~view/display' });
        maximize(true);
      }
      // Esc
      if (event.keyCode === 27) {
        app.dispatch({ type: '~view/edit' });
        maximize(false);
      }
    });

    window.onresize = function() {
      updateLayout();
    };
  });

  function maximize(max) {
    var remote = require('remote');
    var win = remote.getCurrentWindow();
    if (max) {
      $('#board').addClass('fullscreen');
      if (!win.isMaximized()) {
        win.maximize();
        win.setFullScreen(true);
      }
    }
    else {
      $('#board').removeClass('fullscreen');
      if (win.isMaximized() || win.isFullScreen()) {
        win.setFullScreen(false);
        win.restore();
      }
    }
    updateLayout();
  }


  function updateLayout() {
    var workspace = $('#workspace');
    $('#board-container').stop().animate({
      width: workspace.width(),
      height: workspace.height()
    }, 120);

    var $thumbnails = $('#thumbnails');
    $thumbnails.height($thumbnails.parent().height());
  }

  let SlideRenderer = require('../src/renderer').SlideRenderer;
  let renderer = new SlideRenderer();

  app.subscribe(() => {
    var board = app.getState().file;
    if (board.justUpdatedSlideCount) {
      createEmptyThumbnails(board.slides.length);
      $(`#thumbnails li:nth-child(${board.activeIndex+1})`).addClass('active');
    }
    if (board.justLoadedSlide) {
      let index = board.justUpdatedSlideIndex;
      var slide = board.slides[index];
      let svg = $(`#thumbnails li:nth-child(${index+1}) svg`)[0];
      renderer.render(slide, svg);
      
      if (index === board.activeIndex) {
        renderer.render(slide, '#board');
      }
    }
  });
})();

function renderFileList(files) {
  for (let file of files) {
    let $li = $('<li></li>').text(file.name);
    $('#file-list-panel ul').append($li);
    $li.click(() => {
      app.thenDispatch({ type: '~file/open', url: file.path });
      $('#file-list-panel').hide();
    });
  }
}


var Snap = require('snapsvg');

function createEmptyThumbnails(count) {
  var $panel = $('#thumbnails ul');
  $panel.remove('li');
  for (let i = 0; i < count; i++) {
    var $svg = $('<svg viewBox="0 0 1280 720"></svg>');
    let $li = $('<li class="slide-thumbnail"></li>');
    $panel.append($li);
    $li.append($svg);
    var s = new Snap($svg[0]);
    var background = s.rect(0, 0, 1280, 720);
    background.attr({ fill: 'white' });

    $li.click(() => {
      app.dispatch({ type: '~navigation/slide', index: i })
      $('#thumbnails li').removeClass('active');
      $li.addClass('active');
    });
  }
}

function drawSlide(slide, paper) {
  paper.clear();
  var background = paper.rect(0, 0, 1280, 720);
  background.attr({ fill: slide.background });

  for (var element of slide.elements) {
    drawElement(paper, element);
  }
}

function nthChild(i) {
  return ':nth-child(' + i + ')';
}

// exports.render = render;
// exports.renderThumbnails = renderThumbnails;