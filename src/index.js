import './index.css';

export const eCardNosms = '/book/e-card-place-no-sms';
export const eCardSms = '/book/e-card-place-order';
console.log('eCa2rdN2osms', eCardNosms);

// 引入图片
import logo from './img/kt.jpeg';

// 创建图片标签
const img = new Image();
img.src = logo;
document.body.appendChild(img);
