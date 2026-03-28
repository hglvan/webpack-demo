//	导航固定顶部
import 'flexslider';
$(function () {
  $(window).scroll(function () {
    var ws = $(window).scrollTop();
    if (ws > 60) {
      $('.head')
        .addClass('ding')
        .css({ background: 'rgba(255,255,255,' + ws / 300 + ')' });
    } else {
      $('.head').removeClass('ding').css({ background: '#fff' });
    }
  });
});
