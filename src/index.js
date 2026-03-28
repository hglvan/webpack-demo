import './css/public.css';
import './css/index.css';
import jquery from 'jquery';
import './js/public';
import './js/nav';
// import $ from 'jquery';
import _ from 'lodash-es';
console.log('29-gett-', _);
// import './js/jquery-1.12.4.min.js';
// import './js/jquery.flexslider-min.js';
// console.log('jquery', jquery);
$(function () {
  $('#home_slider').flexslider({
    animation: 'slide',
    controlNav: true,
    directionNav: true,
    animationLoop: true,
    slideshow: true,
    slideshowSpeed: 2000,
    useCSS: false,
  });
});
console.log('$jquery', jquery);
console.log('$2', $);

const img = document.createElement('img');
// rwew;
// 2. 设置图片路径（相对路径/绝对路径均可）
// 相对路径：假设图片在项目根目录的 img 文件夹下
img.src = 'https://picsum.photos/500/300?1';

// 可选：设置图片属性（宽高、alt、样式等）
img.width = 300; // 宽度
img.alt = '示例图片'; // 替代文本（图片加载失败时显示）
img.style.margin = '20px'; // 样式

// 3. 图片加载成功/失败的异常处理（避免白屏/报错）
img.onload = function () {
  console.log('图片加载成功27');
  // 4. 插入到 body 中（加载成功后再插入，体验更好）
  document.body.appendChild(img);
};

export function abc() {
  console.log('打印哦-2323sdfsd');
}
