const img = document.createElement('img');

// 2. 设置图片路径（相对路径/绝对路径均可）
// 相对路径：假设图片在项目根目录的 img 文件夹下
img.src = './img/n1.jpg';
wwe;
// 可选：设置图片属性（宽高、alt、样式等）
img.width = 300; // 宽度
img.alt = '示例图片'; // 替代文本（图片加载失败时显示）
img.style.margin = '20px'; // 样式

// 3. 图片加载成功/失败的异常处理（避免白屏/报错）
img.onload = function () {
  console.log('图片加载成功');
  // 4. 插入到 body 中（加载成功后再插入，体验更好）
  document.body.appendChild(img);
};

console.log('啊哈哈27');
